# Schema Discrepancy Report

**Date**: 2026-01-09
**Severity**: ~~HIGH~~ **RESOLVED** (2026-01-12)
**Status**: ✅ Fixed via Schema as Source of Truth

---

## Resolution Summary (2026-01-12)

**Decision**: Schema is the source of truth. Removed Requirement and ContextDiagram from implementation to match simplified schema.

**Changes Made**:
1. ✅ Updated `mock-leanix/server.js` - Renamed `businessCapabilities` → `businessFunctions`
2. ✅ Updated `mock-leanix/server.js` - Removed Requirements and ContextDiagrams from mock data
3. ✅ Updated all documentation - Changed BusinessCapability → BusinessFunction
4. ✅ Updated web-ui components - Changed node types and labels
5. ✅ Updated documentation - Removed Requirement and ContextDiagram references
6. ✅ Schema remains at 9 node types (Application, API, BusinessFunction, Component, DataObject, Table, Server, AppChange, InfraChange)

**Rationale**:
- Schema (`01-schema-only.cypher` and `MASTER-PATTERNS.md`) defines the allowed patterns
- Requirement and ContextDiagram were **intentionally removed** from the simplified schema
- Implementation must comply with schema, not the other way around
- This maintains architectural integrity and prevents schema drift

---

## Original Report (Historical Record)

**Original Date**: 2026-01-09
**Original Severity**: HIGH - Schema definition files do not match actual implementation

---

## Summary

Critical discrepancies found between:
1. **Schema definition files** (`poc-data/neo4j-init/01-schema-only.cypher`, `MASTER-PATTERNS.md`)
2. **Actual implementation** (Mock LeanIX, Sync Service, GraphQL API)
3. **Documentation** (recently created docs)

---

## Critical Discrepancies

### 1. Node Type Naming: BusinessFunction vs BusinessCapability

**Schema Files Say:**
- `BusinessFunction` (as per `01-schema-only.cypher` line 24-25, `MASTER-PATTERNS.md` line 43)

**Actual Implementation:**
- Mock LeanIX (`server.js` line 20, 105): Uses variable name `businessCapabilities`
- Mock LeanIX data objects: Use property `capability` in relationships
- Sync Service (`server.js`): Maps `'CAP'` → `'BusinessFunction'`

**Result:** Inconsistency between variable names and actual node labels

**Impact:**
- GraphQL queries may use wrong label
- Documentation created uses `BusinessCapability` based on mock data inspection

### 2. Missing Node Types in Schema

**Schema Files Define:**
- Application, API, BusinessFunction, Component, DataObject, Table, Server, AppChange, InfraChange (9 types)

**Actual Implementation Has:**
- Application, Component, API, DataObject, **BusinessCapability**, Server, **Requirement**, AppChange, InfraChange, **ContextDiagram** (10 types)

**Missing from Schema:**
- ❌ `Requirement` node type (exists in mock data, no constraint)
- ❌ `ContextDiagram` node type (created by diagram parser, no constraint)

**Extra in Schema:**
- ❓ `Table` node type (constraint exists, but not used in mock data - all are DataObject type)

### 3. Relationship Types: Schema vs MASTER-PATTERNS

**Schema File (`01-schema-only.cypher`) Says:**
- Line 11: "Relationship Type: RELATED_TO (with mode and tags properties)"

**MASTER-PATTERNS.md Says:**
- Line 12: "11 specific relationship types (CALLS, OWNS, EXPOSES, WORKS_ON, IMPLEMENTS, INCLUDES, CHANGES, MATERIALIZES, INSTALLED_ON, RELATES, CONTAINS)"

**Actual Implementation Uses:**
- CALLS, OWNS, IMPLEMENTS, EXPOSES, INCLUDES, WORKS_ON, CHANGES, INSTALLED_ON, CONTAINS, RELATES
- **NOT** MATERIALIZES (pattern mentioned but never used)
- **NOT** RELATED_TO (schema mentions this but doesn't match MASTER-PATTERNS)

### 4. Relationship Property Names

**MASTER-PATTERNS.md Uses:**
- `mode: 'relates' | 'calls'` (as property values in some examples)
- `rw: 'reads' | 'writes'` (correct)

**Actual Implementation Uses:**
- `mode: 'pushes' | 'pulls' | 'bidirectional'` (correct values per sync service)
- Relationship types ARE the action (CALLS, RELATES), not mode values

**Issue:** MASTER-PATTERNS examples show mode values that don't match implementation

---

## File-by-File Analysis

### `/poc-data/neo4j-init/01-schema-only.cypher`

**Status:** ⚠️ OUTDATED

**Issues:**
1. Uses `BusinessFunction` label
2. Missing constraints for: `Requirement`, `ContextDiagram`
3. Has constraint for `Table` (unused)
4. Comment says "Relationship Type: RELATED_TO" (wrong)
5. Missing relationship-level constraints/indexes

**Needs Update:**
- Add `Requirement` constraint
- Add `ContextDiagram` constraint
- Consider renaming `BusinessFunction` → `BusinessCapability` OR fix mock data
- Remove or clarify `Table` constraint
- Update relationship comment

### `/poc-data/neo4j-init/MASTER-PATTERNS.md`

**Status:** ⚠️ PARTIALLY OUTDATED

**Issues:**
1. Uses `BusinessFunction` label (line 43)
2. Says "9 allowed node types" but should be 10
3. Missing: `Requirement`, `ContextDiagram`
4. Includes `Table` as separate from `DataObject`
5. Says "11 specific relationship types" including MATERIALIZES (never used)
6. Some examples show `mode: 'relates'` which is wrong (mode should be pushes/pulls/bidirectional)

**Needs Update:**
- Fix node type count and list
- Add Requirement and ContextDiagram
- Remove or clarify Table
- Remove MATERIALIZES or document its use
- Fix mode property examples

### `/poc-services/mock-leanix/server.js`

**Status:** ✅ CORRECT (current source of truth)

**What it does:**
- Uses variable name `businessCapabilities` (line 20)
- Creates relationships using MASTER-PATTERNS v2.0 types
- Properly uses `mode` and `rw` properties
- All relationship types match: OWNS, CALLS, IMPLEMENTS, EXPOSES, INCLUDES, WORKS_ON, CHANGES, INSTALLED_ON, CONTAINS, RELATES

### `/poc-services/sync-service/server.js`

**Status:** ⚠️ MIXED

**What it does:**
- Maps `'CAP'` → `'BusinessFunction'` (line 80)
- Uses correct MASTER-PATTERNS relationship type inference
- Properly handles `mode` and `rw` properties

**Issue:**
- Label mapping doesn't match mock data variable naming

### `/docs/GRAPH-SCHEMA-REFERENCE.md` (Created Today)

**Status:** ⚠️ NEEDS CORRECTION

**What it does:**
- Documents `BusinessCapability` (based on mock data inspection)
- Lists 10 node types (correct count)
- Lists all relationship patterns from actual implementation

**Issue:**
- Uses `BusinessCapability` but schema says `BusinessFunction`
- Needs to clarify which is correct

---

## Recommended Resolution

### Option 1: Standardize on BusinessCapability (RECOMMENDED)

**Rationale:**
- "Capability" is more accurate business terminology
- Mock data already uses this in variable names
- GraphQL API likely uses this

**Changes Needed:**
1. Update `01-schema-only.cypher`:
   - Rename `BusinessFunction` → `BusinessCapability`
   - Add `Requirement` constraint
   - Add `ContextDiagram` constraint
   - Update comment about relationships

2. Update `MASTER-PATTERNS.md`:
   - Rename `BusinessFunction` → `BusinessCapability`
   - Update node count to 10
   - Add Requirement and ContextDiagram
   - Remove MATERIALIZES or document its use
   - Fix mode property examples
   - Clarify Table vs DataObject

3. Update `sync-service/server.js`:
   - Change mapping: `'CAP': 'BusinessCapability'`

4. Keep docs as-is (already use BusinessCapability)

### Option 2: Standardize on BusinessFunction

**Rationale:**
- Schema already uses this
- Less code changes needed

**Changes Needed:**
1. Update `mock-leanix/server.js`:
   - Rename variable `businessCapabilities` → `businessFunctions`

2. Update all documentation to use `BusinessFunction`

3. Update schema files for missing types

---

## Impact Assessment

### Critical Issues (Must Fix)
1. ❗ Missing constraints for `Requirement` and `ContextDiagram` nodes
2. ❗ Inconsistent BusinessFunction/BusinessCapability terminology
3. ❗ Schema comment says "RELATED_TO" relationship (wrong)

### Medium Issues (Should Fix)
1. ⚠️ MATERIALIZES relationship type documented but never used
2. ⚠️ Table node type in schema but not used
3. ⚠️ Mode property examples in MASTER-PATTERNS show wrong values

### Low Issues (Nice to Have)
1. 💡 Add relationship-level indexes for performance
2. 💡 Add composite indexes for common query patterns
3. 💡 Document Table vs DataObject distinction clearly

---

## Next Steps

1. **Decision Required:** Choose Option 1 (BusinessCapability) or Option 2 (BusinessFunction)
2. **Update Schema Files:** Apply chosen option to `01-schema-only.cypher`
3. **Update MASTER-PATTERNS.md:** Fix all identified issues
4. **Update Code:** Align sync-service or mock-leanix as needed
5. **Update Documentation:** Ensure all docs use consistent terminology
6. **Verify:** Run full sync and check Neo4j node labels

---

## Questions for User

1. **Terminology Decision:** Should we use `BusinessCapability` or `BusinessFunction`?
2. **Table Node Type:** Should Table be separate from DataObject, or are all tables DataObjects?
3. **MATERIALIZES:** Should this relationship type be removed or is there a future use case?
4. **Priority:** Should we fix this immediately or document for future work?

---

**Report Generated:** 2026-01-09
**Generated By:** Schema Audit Process
**Related Files:**
- `/poc-data/neo4j-init/01-schema-only.cypher`
- `/poc-data/neo4j-init/MASTER-PATTERNS.md`
- `/poc-services/mock-leanix/server.js`
- `/poc-services/sync-service/server.js`
- `/docs/GRAPH-SCHEMA-REFERENCE.md`
- `/docs/LIVE-GRAPH-SAMPLE-QUERIES.md`
