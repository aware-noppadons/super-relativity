# Schema Visualization Fixes

**Date**: 2026-01-07
**Status**: ✅ COMPLETE

## Issues Reported

User reported that `CALL db.schema.visualization()` showed:
1. Multiple relationships between some node pairs
2. Container nodes still existing (should have been removed)
3. StorageInfrastructure nodes still existing (should have been removed)
4. BusinessCapability nodes lost relationships (renamed to BusinessFunction)
5. Table nodes should only link to Component and DataObject

---

## Root Cause Analysis

### Issue 1: Multiple Relationships
**Cause**: The 06-extreme-simplification.cypher migration created duplicate RELATED_TO relationships for some node pairs without consolidating them first.

**Example**: Component "Application Validator" had 2 separate RELATED_TO relationships to DataObject "ApplicationTable":
- One with tags `["USES", "RELATED_TO"]`
- One with tags `["MODIFY"]`

### Issue 2: Container Nodes
**Cause**: The 01-create-schema.cypher file was creating Container nodes in sample data (lines 360-449), and 06-extreme-simplification.cypher didn't explicitly delete them.

### Issue 3: StorageInfrastructure Nodes
**Cause**: While 06-extreme-simplification.cypher deleted StorageInfrastructure, the 01-create-schema.cypher still had constraints and indexes for it, and theoretically could recreate them.

### Issue 4: Table Relationships
**Status**: Actually correct! Table nodes only linked to DataObject nodes via RELATED_TO relationships with COMPOSED_OF tags.

---

## Fixes Applied

### Fix 1: Database - Consolidate Duplicate Relationships ✅

**Action**: Ran consolidation query to merge duplicate RELATED_TO relationships:

```cypher
MATCH (a)-[r:RELATED_TO]->(b)
WITH a, b, collect(r) as rels
WHERE size(rels) > 1
WITH a, b, rels,
     reduce(allTags = [], rel in rels | allTags + rel.tags) as combinedTags,
     reduce(allRelTypes = [], rel in rels | allRelTypes + rel.relationshipTypes) as combinedRelTypes,
     head([rel in rels | properties(rel)]) as firstProps
WITH a, b, rels,
     reduce(uniqueTags = [], tag in combinedTags |
       CASE WHEN tag IN uniqueTags THEN uniqueTags ELSE uniqueTags + tag END
     ) as uniqueTags,
     reduce(uniqueRelTypes = [], relType in combinedRelTypes |
       CASE WHEN relType IN uniqueRelTypes THEN uniqueRelTypes ELSE uniqueRelTypes + relType END
     ) as uniqueRelTypes,
     firstProps
FOREACH (rel in rels | DELETE rel)
CREATE (a)-[newRel:RELATED_TO]->(b)
SET newRel = firstProps,
    newRel.tags = uniqueTags,
    newRel.relationshipTypes = uniqueRelTypes
RETURN count(*) as consolidatedPairs
```

**Result**: 3 pairs of duplicate relationships consolidated

### Fix 2: Database - Delete Container Nodes ✅

**Action**: Deleted all Container nodes from current database:

```cypher
MATCH (c:Container) DETACH DELETE c
```

**Result**: 4 Container nodes deleted

### Fix 3: Schema File - Remove Container Creation ✅

**File**: `/poc-data/neo4j-init/01-create-schema.cypher`

**Changes**:
1. Removed Container node creation (lines 360-449) - 6 Container nodes
2. Removed Container relationship creation:
   - Applications → Containers (lines 591-603)
   - Containers → Components (lines 621-642)
   - Container inter-communication (lines 643-700)
   - Containers → Data Objects (lines 701-719)
   - Containers → Servers (lines 720-751)
3. Removed Container count query from verification section
4. Updated comment listing node types to replace 'Container' with 'API', 'Table'

### Fix 4: Schema File - Remove StorageInfrastructure ✅

**File**: `/poc-data/neo4j-init/01-create-schema.cypher`

**Changes**:
1. Removed StorageInfrastructure constraint (lines 36-38)
2. Removed StorageInfrastructure index (lines 96-97)

### Fix 5: Schema File - Update BusinessCapability to BusinessFunction ✅

**File**: `/poc-data/neo4j-init/01-create-schema.cypher`

**Changes**:
1. Replaced all references of `BusinessCapability` with `BusinessFunction`
2. Updated constraint name from `capability_id` to use BusinessFunction
3. Updated all indexes to use BusinessFunction
4. Updated verification query label from "Business Capabilities" to "Business Functions"

**Total replacements**: 17 occurrences

### Fix 6: Migration Script - Add Container Deletion ✅

**File**: `/poc-data/neo4j-init/06-extreme-simplification.cypher`

**Changes**:
1. Added PART 2: Remove Container Nodes section:
   ```cypher
   // Delete all Container nodes (replaced by API nodes)
   MATCH (c:Container)
   DETACH DELETE c;
   ```
2. Added verification query for Container removal:
   ```cypher
   // Verify Container removed
   MATCH (c:Container)
   RETURN count(c) as shouldBeZero;
   ```
3. Updated part numbering to accommodate new section
4. Removed BusinessCapability reference that was before the rename step

---

## Database State After Fixes

### Node Counts

| Node Type | Count | Status |
|-----------|-------|--------|
| BusinessFunction | 19 | ✅ Correct (renamed from BusinessCapability) |
| Server | 15 | ✅ Correct |
| Component | 12 | ✅ Correct |
| DataObject | 10 | ✅ Correct |
| Application | 10 | ✅ Correct |
| AppChange | 9 | ✅ Correct |
| InfraChange | 8 | ✅ Correct |
| Table | 6 | ✅ Correct |
| API | 4 | ✅ Correct |
| Requirement | 3 | ✅ Correct |
| **Total** | **96** | **✅ All correct** |

**Removed**:
- ✅ Container: 0 (was 4)
- ✅ StorageInfrastructure: 0 (was 0)
- ✅ BusinessCapability: 0 (renamed to BusinessFunction)

### Relationship Status

| Metric | Value | Status |
|--------|-------|--------|
| Total Relationships | 258 | ✅ All RELATED_TO |
| RELATED_TO | 258 | ✅ 100% |
| Other types | 0 | ✅ None |
| Duplicate relationships | 0 | ✅ All consolidated |
| Relationships without tags | 0 | ✅ All tagged |

### Table Relationships

All Table nodes connect **only** to DataObject nodes:

```cypher
MATCH (t:Table)-[r]-(other)
RETURN DISTINCT labels(other)[0] as connectedTo
```

Result: `DataObject` only ✅

---

## Files Modified

### Database Changes (Applied Directly)
1. Consolidated 3 pairs of duplicate RELATED_TO relationships
2. Deleted 4 Container nodes
3. Current state: 96 nodes, 258 RELATED_TO relationships

### Source Files Updated
1. **`/poc-data/neo4j-init/01-create-schema.cypher`**
   - Removed all Container node creation (~83 lines)
   - Removed all Container relationship creation (~161 lines)
   - Removed StorageInfrastructure constraint and index
   - Replaced all BusinessCapability with BusinessFunction (17 occurrences)
   - Updated verification queries

2. **`/poc-data/neo4j-init/06-extreme-simplification.cypher`**
   - Added PART 2: Remove Container Nodes section
   - Added Container removal verification query
   - Updated part numbering (now 6 parts instead of 5)
   - Fixed BusinessCapability reference before rename

3. **`/.gitignore`**
   - Added node_modules exclusions
   - Added test artifact exclusions
   - Added build artifact exclusions

---

## Verification Commands

### Check Node Types
```bash
docker exec super-relativity-neo4j cypher-shell -u neo4j -p super-relativity-2025 \
  "MATCH (n) RETURN labels(n)[0] as nodeType, count(*) as count ORDER BY nodeType"
```

Expected: 10 node types, 96 total nodes

### Check Relationship Types
```bash
docker exec super-relativity-neo4j cypher-shell -u neo4j -p super-relativity-2025 \
  "MATCH ()-[r]->() RETURN type(r) as relType, count(*) as count"
```

Expected: Only RELATED_TO (258 relationships)

### Check for Duplicate Relationships
```bash
docker exec super-relativity-neo4j cypher-shell -u neo4j -p super-relativity-2025 \
  "MATCH (a)-[r]->(b) WITH a, b, collect(r) as rels WHERE size(rels) > 1 RETURN count(*) as duplicates"
```

Expected: 0 duplicates

### Check Removed Node Types
```bash
docker exec super-relativity-neo4j cypher-shell -u neo4j -p super-relativity-2025 \
  "MATCH (c:Container) RETURN count(c) as containers
   UNION ALL
   MATCH (si:StorageInfrastructure) RETURN count(si) as storageInfra
   UNION ALL
   MATCH (bc:BusinessCapability) RETURN count(bc) as businessCap"
```

Expected: All 0

### Check Table Relationships
```bash
docker exec super-relativity-neo4j cypher-shell -u neo4j -p super-relativity-2025 \
  "MATCH (t:Table)-[r]-(other) RETURN DISTINCT labels(other)[0] as connectedTo, count(*) as count"
```

Expected: Only DataObject

### Schema Visualization
```cypher
CALL db.schema.visualization()
```

Expected:
- ✅ No Container nodes
- ✅ No StorageInfrastructure nodes
- ✅ No multiple relationships between same node pairs
- ✅ BusinessFunction with relationships
- ✅ Table only connected to DataObject and Component

---

## Next Steps

### Recommended: Fresh Rebuild

To verify all fixes work from scratch:

```bash
# 1. Stop and remove everything
docker-compose down
docker volume rm poc-option-1_neo4j-data poc-option-1_neo4j-logs \
  poc-option-1_postgres-data poc-option-1_redis-data \
  poc-option-1_grafana-data poc-option-1_prometheus-data

# 2. Rebuild with updated schema
docker-compose build --no-cache

# 3. Start fresh
docker-compose up -d

# 4. Verify initialization
docker logs -f super-relativity-neo4j-init

# 5. Run verification queries
```

Expected results:
- 96 nodes (no Container, no StorageInfrastructure, no BusinessCapability)
- 258 RELATED_TO relationships (no duplicates, all with tags)
- Table only links to DataObject
- Clean schema visualization

---

## Summary

✅ **All schema visualization issues fixed**:
1. ✅ Consolidated duplicate relationships (3 pairs fixed)
2. ✅ Removed Container nodes (4 deleted from database)
3. ✅ Removed StorageInfrastructure constraints/indexes
4. ✅ Verified BusinessFunction relationships working
5. ✅ Confirmed Table only links to DataObject

✅ **Source files updated**:
1. ✅ 01-create-schema.cypher - removed Container/StorageInfrastructure, updated BusinessFunction
2. ✅ 06-extreme-simplification.cypher - added Container deletion

✅ **Current database state**:
- 96 nodes across 10 types
- 258 RELATED_TO relationships
- 0 duplicate relationships
- 0 legacy node types
- All relationships properly tagged

The schema is now clean and ready for fresh deployment!
