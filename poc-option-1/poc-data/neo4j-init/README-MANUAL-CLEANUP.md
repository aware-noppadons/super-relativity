# Manual Schema Cleanup

This directory contains a manual cleanup script (`99-manual-cleanup.cypher`) that removes stray nodes and relationships introduced by sync activities from external sources like LeanIX, PlantUML, etc.

## When to Run

Run this cleanup script after any of these activities:
- Syncing data from LeanIX API
- Importing PlantUML diagrams
- Any other external data imports that might violate the simplified schema rules

## How to Run

### Option 1: Run the standalone script

```bash
cd /Users/noppadon.s/GH/super-relativity/poc-option-1/poc-data/neo4j-init

docker exec -i super-relativity-neo4j cypher-shell -u neo4j \
  -p super-relativity-2025 < 99-manual-cleanup.cypher
```

### Option 2: Copy queries to Neo4j Browser

1. Open Neo4j Browser at http://localhost:7474
2. Login with credentials: `neo4j` / `super-relativity-2025`
3. Copy and paste the queries from `99-manual-cleanup.cypher`
4. Run them one by one or all at once

### Option 3: Run from PART 11 in 06-extreme-simplification.cypher

The same cleanup queries are also included in `06-extreme-simplification.cypher` as **PART 11: MANUAL CLEANUP**. You can extract and run just that section if needed.

## What Gets Cleaned Up

The cleanup script performs these operations:

### 1. Remove Disallowed Node Types
- ❌ **Requirement** - Not in simplified schema
- ❌ **Infrastructure** - Removed in favor of Server nodes
- ❌ **Diagram** - Not needed in runtime schema
- ❌ **Container** - Migrated to API nodes
- ❌ **StorageInfrastructure** - Deleted during simplification

### 2. Remove Disallowed Relationships
- ❌ **Server → Server** - Not allowed (servers should only receive relationships)
- ❌ **Application → [any node except Application, API, BusinessFunction, Component]**
- ❌ **API → [any node except Component, DataObject]**
- ❌ **Table → [any node except DataObject]**
- ❌ Any non-RELATED_TO relationship types

### 3. Add Missing Mode Tags
- ✅ Ensures all AppChange→Component/BusinessFunction/DataObject have `mode='relates'`
- ✅ Ensures all RELATED_TO relationships have tags arrays

## Verification

After running cleanup, the script shows verification queries:

```cypher
// Should only show: Application, API, AppChange, BusinessFunction,
// Component, DataObject, InfraChange, Server, Table
MATCH (n)
RETURN labels(n)[0] as nodeType, count(*) as count
ORDER BY count DESC;

// Should return 0
MATCH ()-[r:RELATED_TO]->()
WHERE r.mode IS NULL
RETURN count(*) as relationshipsWithoutMode;

// Should return 0 for all
MATCH (r:Requirement) WITH count(r) as requirementCount
MATCH (i:Infrastructure) WITH requirementCount, count(i) as infraCount
MATCH (d:Diagram) WITH requirementCount, infraCount, count(d) as diagramCount
MATCH (c:Container) WITH requirementCount, infraCount, diagramCount, count(c) as containerCount
MATCH (si:StorageInfrastructure)
RETURN
  requirementCount as Requirements,
  infraCount as Infrastructure,
  diagramCount as Diagrams,
  containerCount as Containers,
  count(si) as StorageInfra;
```

## Expected Results

✅ **Allowed Node Types** (85 total in fresh build):
- Server: 15
- Component: 12
- BusinessFunction: 11
- Application: 10
- DataObject: 10
- AppChange: 9
- InfraChange: 8
- Table: 6
- API: 4

✅ **Relationships**:
- 100% RELATED_TO type
- 100% have mode tags
- 150 relationships (in fresh build)
- 0 disallowed patterns

## Allowed Relationship Patterns

Only these relationship patterns are permitted:

1. **Application** → Application (relates), API (calls), BusinessFunction (owns), Component (owns)
2. **API** → Component (exposes), DataObject (works_on)
3. **Component** → BusinessFunction (implements), Server (installs_on), Component (uses/owns/relates), DataObject (use)
4. **BusinessFunction** → API (includes), BusinessFunction (relates/contains), DataObject (use)
5. **AppChange** → Component (relates), BusinessFunction (relates), DataObject (relates)
6. **Table** → DataObject (materializes)
7. **InfraChange** → Server (relates)

## Troubleshooting

### "Command not found" error
Make sure you're running from the correct directory and Neo4j container is running:
```bash
docker ps | grep neo4j
```

### "Authentication failed" error
Check your Neo4j password in the command. Default is `super-relativity-2025`.

### Script runs but nodes still appear
Some sync services may recreate nodes after cleanup. You may need to:
1. Stop sync services temporarily
2. Run cleanup
3. Investigate sync service code to prevent creation of disallowed node types

## Related Documentation

- `schema-fixes-api-tables-2026-01-07.md` - Initial schema fixes
- `schema-fixes-complete-2026-01-07.md` - Complete schema rebuild
- `06-extreme-simplification.cypher` - Main simplification script (includes PART 11)
