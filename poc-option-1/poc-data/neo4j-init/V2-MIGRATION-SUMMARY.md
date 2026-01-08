# Master Patterns v2.0 - Migration Summary

**Date**: 2026-01-08
**Status**: ✅ Complete
**Breaking Change**: Yes - Schema migration required

---

## What Changed

### Architecture Change: Single Type → Multiple Types

**v1.0 (OLD)**:
- Single relationship type: `RELATED_TO`
- Semantic meaning stored in `mode` property
- Example: `(app)-[:RELATED_TO {mode: 'calls'}]->(api)`

**v2.0 (NEW)**:
- 11 specific relationship types
- Required properties for certain types (mode, rw)
- Example: `(app)-[:CALLS {mode: 'pulls', rw: 'read-n-writes'}]->(api)`

---

## Files Updated

### 1. ✅ MASTER-PATTERNS.md (Source of Truth)

**Previously**: `11-PATTERNS-OFFICIAL-REFERENCE.md`

**Changes**:
- Renamed to allow pattern evolution (may add/delete patterns)
- Added **Core Principles** section with whitelist approach
- Updated all examples to use specific relationship types
- Fixed typos: `'pull'` → `'pulls'`
- Added comprehensive relationship property specifications
- Updated enforcement strategy to emphasize sync service validation

**Key Sections**:
- Core Principles (NEW) - Whitelist approach
- 11 Specific Relationship Types (UPDATED)
- Pattern Summary Table (ENHANCED with property columns)
- Relationship Properties (DETAILED specification)
- Enforcement Strategy (3-layer approach)

---

### 2. ✅ 02-sample-data.cypher (Reference Implementation)

**Location**: `/poc-data/neo4j-init/02-sample-data.cypher`

**Changes**:
- All relationships now use specific types instead of `RELATED_TO`
- Added required properties where specified:
  - `CALLS`: mode, rw
  - `WORKS_ON`: rw
  - `RELATES` (BF→BF): mode
- Updated verification queries to check relationship types and properties

**Relationship Count**: 53 relationships across all 11 patterns

**Examples**:
```cypher
// OLD v1.0
CREATE (app)-[:RELATED_TO {mode: 'calls', tags: ['CALLS']}]->(api)

// NEW v2.0
CREATE (app)-[:CALLS {mode: 'pulls', rw: 'read-n-writes', description: '...'}]->(api)
```

---

### 3. ✅ sync-service/server.js (Runtime Validation)

**Location**: `/poc-services/sync-service/server.js`

**Changes**:

#### Updated `validateAndMapRelationship()` Function:
- **Returns**: `{isAllowed, relationshipType, properties}` (was: `{isAllowed, mode, tags}`)
- **Added Helpers**:
  - `inferRW()` - Infers data access pattern from relationship type string
  - `inferMode()` - Infers push/pull mode from relationship type string
- **Whitelist Enforcement**: Explicitly logs disallowed patterns
- **Property Mapping**: Automatically adds required properties based on pattern

#### Updated Cypher Query Generation:
- Dynamic relationship type: `MERGE (from)-[r:${relationshipType}]->(to)`
- Dynamic property setting based on pattern requirements
- Improved logging: Shows which specific relationship type was created

**Example**:
```javascript
// OLD v1.0
const { isAllowed, mode, tags } = validateAndMapRelationship(rel);
CREATE (from)-[:RELATED_TO {mode: $mode, tags: $tags}]->(to)

// NEW v2.0
const { isAllowed, relationshipType, properties } = validateAndMapRelationship(rel);
MERGE (from)-[:${relationshipType}]->(to)
SET r.mode = $mode, r.rw = $rw, r.description = $description
```

---

### 4. ✅ 99-strict-cleanup.cypher (Post-Import Validation)

**Location**: `/poc-data/neo4j-init/99-strict-cleanup.cypher`

**Changes**:
- Updated to validate specific relationship types, not `RELATED_TO` with mode
- 17 enforcement steps:
  1. Remove disallowed node types
  2-3. Enforce Server/DataObject receive-only rules
  4-15. Validate each of the 11 patterns with correct relationship types
  16. Remove orphaned OLD-STYLE `RELATED_TO` relationships
  17. Whitelist validation - delete any relationship type not in allowed list

**New Features**:
- Property validation and auto-correction (mode, rw)
- Comprehensive verification queries for all relationship types
- Final summary showing all relationship types in database

**Example Enforcement**:
```cypher
// Pattern 1: Application → API must be CALLS
MATCH (app:Application)-[r]->(api:API)
WHERE type(r) <> 'CALLS'
DELETE r;

// Validate required properties
MATCH (app:Application)-[r:CALLS]->(api:API)
WHERE r.mode IS NULL OR r.rw IS NULL
SET r.mode = COALESCE(r.mode, 'pulls'),
    r.rw = COALESCE(r.rw, 'read-n-writes');
```

---

## The 11 Specific Relationship Types

1. **CALLS** - Application→API, Component→API (requires: mode, rw)
2. **OWNS** - Application→BusinessFunction, Application→Component
3. **EXPOSES** - API→Component
4. **WORKS_ON** - API→DataObject, Component→DataObject, BusinessFunction→DataObject (requires: rw)
5. **IMPLEMENTS** - Component→BusinessFunction
6. **INCLUDES** - BusinessFunction→API
7. **CHANGES** - AppChange→{Component|BusinessFunction|DataObject}, InfraChange→Server
8. **MATERIALIZES** - Table→DataObject
9. **INSTALLED_ON** - Component→Server
10. **RELATES** - Application→Application, Component→Component, BusinessFunction→BusinessFunction (BF→BF requires: mode)
11. **CONTAINS** - Component→Component

---

## Required Properties by Type

| Relationship Type | Required Properties | Optional Properties |
|-------------------|---------------------|---------------------|
| CALLS | mode, rw | description, syncedAt, metadata |
| WORKS_ON | rw | description, syncedAt, metadata |
| RELATES (BF→BF only) | mode | description, syncedAt, metadata |
| All Others | - | description, syncedAt, metadata |

**Property Values**:
- `mode`: `'pushes'` or `'pulls'`
- `rw`: `'reads'`, `'writes'`, or `'read-n-writes'`

---

## Migration Steps

### For Existing Databases:

1. **Backup Current Database**
   ```bash
   docker exec super-relativity-neo4j neo4j-admin dump --database=neo4j --to=/backups/pre-v2-backup.dump
   ```

2. **Clear Existing Data**
   ```cypher
   MATCH (n) DETACH DELETE n;
   ```

3. **Import Schema**
   ```bash
   cat 01-schema-only.cypher | docker exec -i super-relativity-neo4j cypher-shell -u neo4j -p <password>
   ```

4. **Import Sample Data (v2.0)**
   ```bash
   cat 02-sample-data.cypher | docker exec -i super-relativity-neo4j cypher-shell -u neo4j -p <password>
   ```

5. **Run Cleanup Script** (if needed)
   ```bash
   cat 99-strict-cleanup.cypher | docker exec -i super-relativity-neo4j cypher-shell -u neo4j -p <password>
   ```

6. **Restart Sync Service**
   ```bash
   docker-compose restart sync-service
   ```

### For New Databases:

Just run steps 3-4 above. The sync service will automatically use v2.0 patterns.

---

## Testing

### Verify Sample Data

```cypher
// Count relationship types
MATCH ()-[r]->()
RETURN type(r) as relType, count(*) as count
ORDER BY relType;

// Verify CALLS relationships have required properties
MATCH (source)-[r:CALLS]->(target)
WHERE r.mode IS NULL OR r.rw IS NULL
RETURN source.id, target.id, r.mode, r.rw;

// Should return no rows if all valid
```

### Verify Sync Service

Check logs for:
```
Created CALLS: APP-001 → API-001
Created OWNS: APP-001 → BF-001
Skipping disallowed relationship: ...
```

### Verify Cleanup Script

Run cleanup, then check verification queries at end of script.

---

## Rollback Plan

If issues occur:

1. **Restore from Backup**
   ```bash
   docker exec super-relativity-neo4j neo4j-admin load --database=neo4j --from=/backups/pre-v2-backup.dump --force
   ```

2. **Revert Code Changes** (if needed)
   ```bash
   git checkout <previous-commit-hash> poc-services/sync-service/server.js
   docker-compose restart sync-service
   ```

---

## Breaking Changes

### Code Impact

**Cypher Queries**: Any custom queries using `RELATED_TO` will break
- **Before**: `MATCH (a)-[r:RELATED_TO {mode: 'calls'}]->(b)`
- **After**: `MATCH (a)-[r:CALLS]->(b)`

**Sync Service Integration**: If external services call the sync service, they must understand new relationship types

### Data Impact

**Incompatible**: v1.0 and v2.0 schemas cannot coexist
- All `RELATED_TO` relationships will be deleted by cleanup script
- Must choose one version

---

## Benefits of v2.0

1. **Type Safety**: Relationship type errors caught at query time, not runtime
2. **Clearer Semantics**: `CALLS` is more explicit than `RELATED_TO {mode: 'calls'}`
3. **Better Performance**: Can index on relationship type directly
4. **Easier Querying**: No need to filter by mode property
5. **Self-Documenting**: Relationship type names describe the relationship
6. **Whitelist Enforcement**: Strict validation prevents schema drift

---

## Next Steps

1. ✅ Validate MASTER-PATTERNS.md (DONE)
2. ✅ Update sample data (DONE)
3. ✅ Update sync service (DONE)
4. ✅ Update cleanup script (DONE)
5. ⏳ Test end-to-end with real LeanIX data
6. ⏳ Monitor sync service logs for disallowed patterns
7. ⏳ Document any new patterns discovered in production

---

## Support

For questions or issues:
- **Reference**: `MASTER-PATTERNS.md`
- **Examples**: `02-sample-data.cypher`
- **Validation**: `99-strict-cleanup.cypher`
