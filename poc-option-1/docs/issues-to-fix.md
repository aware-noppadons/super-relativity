# Issues to Fix - Extreme Schema Simplification

**Date**: 2026-01-07
**Status**: IN PROGRESS

## Critical Issues (Must Fix Before Restart)

### 1. ⚠️ Sync Service - Not Compatible with New Schema
**Priority**: CRITICAL
**Impact**: Will recreate old relationship types, breaking schema
**Location**: `/poc-services/sync-service/server.js`

**Problems**:
- Creates old relationship types (SUPPORTS, IMPLEMENTS_CAPABILITY, etc.)
- Uses BusinessCapability instead of BusinessFunction
- Doesn't create RELATED_TO relationships
- Doesn't set tags arrays

**Fix Required**:
- Change all relationship creation to use RELATED_TO
- Add tags array to all relationships
- Use BusinessFunction instead of BusinessCapability
- Update relationship mapping logic

---

### 2. ⚠️ Mock LeanIX - Returns BusinessCapability
**Priority**: CRITICAL
**Impact**: Sync service receives wrong node type
**Location**: `/poc-services/mock-leanix/server.js`

**Problems**:
- API endpoints return "BusinessCapability" in responses
- Should return "BusinessFunction"

**Fix Required**:
- Update all capability references to BusinessFunction
- Update sample data to use BusinessFunction

---

### 3. ⚠️ GraphQL API - Queries by Relationship Type
**Priority**: HIGH
**Impact**: GraphQL queries won't work with RELATED_TO schema
**Location**: `/poc-services/graphql-api/` (need to find schema files)

**Problems**:
- Queries filter by relationship type (e.g., [:MODIFY])
- Should filter by tags array

**Fix Required**:
- Update all Cypher queries to use RELATED_TO with tag filtering
- Add tag-based resolvers
- Update GraphQL schema types

---

## High Priority Issues (Data Quality)

### 4. Duplicate CustomerTable Composition
**Priority**: HIGH
**Impact**: Incorrect data model, extra table node
**Location**: Neo4j database

**Problem**:
- CustomerTable has both one-to-one (TBL-789) and one-to-many (TBL-789-1, TBL-789-2) mappings
- Should only have one-to-many decomposition

**Fix Required**:
```cypher
MATCH (d:DataObject {name: 'CustomerTable'})-[r:RELATED_TO]->(t:Table {id: 'TBL-789'})
WHERE 'COMPOSED_OF' IN r.tags
DELETE r
WITH t
DETACH DELETE t
```

---

## Medium Priority Issues (Code Quality)

### 5. Code Parser - Creates Old Relationship Types
**Priority**: MEDIUM
**Impact**: Code parsing will create non-compliant relationships
**Location**: `/poc-services/code-parser/` (need to find files)

**Fix Required**:
- Update to create RELATED_TO relationships
- Add appropriate tags arrays
- Use BusinessFunction

---

### 6. Diagram Parser - Creates Old Relationship Types
**Priority**: MEDIUM
**Impact**: Diagram parsing will create non-compliant relationships
**Location**: `/poc-services/diagram-parser/` (need to find files)

**Fix Required**:
- Update to create RELATED_TO relationships
- Map C4 relationship types to tags
- Use BusinessFunction

---

## Low Priority Issues (Documentation)

### 7. Update README and Documentation
**Priority**: LOW
**Impact**: Documentation outdated

**Fix Required**:
- Update main README with new schema
- Document RELATED_TO pattern
- Document tag vocabulary
- Update query examples

---

## Completed

### ✅ Migration Script Error Fixed
- Fixed `allProps` variable scope issue in 06-extreme-simplification.cypher
- Script now uses `head([rel in rels | rel.props])` instead of reduce

---

## Fix Order

1. **Fix duplicate CustomerTable** (Quick database fix)
2. **Update Mock LeanIX** (Required for sync service)
3. **Update Sync Service** (Critical for system operation)
4. **Update GraphQL API** (User-facing queries)
5. **Update Code Parser** (Feature enhancement)
6. **Update Diagram Parser** (Feature enhancement)
7. **Test all services** (Verification)
8. **Update documentation** (Final polish)
