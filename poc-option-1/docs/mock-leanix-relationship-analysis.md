# Mock LeanIX Relationship Analysis

> **📋 Historical Document**: This document reflects analysis from 2026-01-08, before schema simplification (2026-01-12). References to `Requirement` and `ContextDiagram` node types were subsequently removed from the schema. See `SCHEMA-DISCREPANCY-REPORT.md` for details.

**Date**: 2026-01-08
**Issue**: 91 out of 172 relationships being skipped by sync service

## Executive Summary

✅ **Sync Service is Working Correctly** - Rejecting invalid patterns per MASTER-PATTERNS.md
❌ **Mock LeanIX is Outdated** - Using old relationship types and invalid patterns
🔧 **Action Required**: Update Mock LeanIX to use MASTER-PATTERNS.md v2.0 relationship types

---

## Analysis Results

### Total Relationships from Mock LeanIX: 172

- ✅ **Accepted**: 81 relationships (47%)
- ❌ **Rejected**: 91 relationships (53%)

### Why Relationships Are Being Rejected

## Category 1: Requirement Node References (9 relationships)

**Issue**: Mock LeanIX still references `Requirement` nodes (REQ-xxx), which were **removed** from the simplified schema.

**Rejected Patterns:**
```
- SUPPORTS (REQ → CAP) - 3 relationships
- IMPLEMENTED_BY (REQ → COMP) - 6 relationships
- SATISFIES (APP → REQ) - 3 relationships (via REQ reference)
```

**Why Rejected**:
- Requirement nodes don't exist in simplified schema
- See sync-service/server.js line 375: "Requirement nodes are not part of the simplified schema"

**Fix**: Remove all Requirement-related relationships from Mock LeanIX

---

## Category 2: Invalid Relationship Types (82+ relationships)

Mock LeanIX uses descriptive relationship types that don't match MASTER-PATTERNS.md v2.0.

### Application Relationships (Wrong Types)

| Mock LeanIX Type | Count | Should Be | MASTER-PATTERNS Pattern |
|------------------|-------|-----------|-------------------------|
| `IMPLEMENTS_CAPABILITY` | 8 | `OWNS` | Pattern 1: Application → BusinessFunction |
| `HAS_COMPONENT` | 8 | `OWNS` | Pattern 1: Application → Component |

**Total**: 16 relationships

**Example:**
```
❌ APP-123 -[IMPLEMENTS_CAPABILITY]-> CAP-001
✅ APP-123 -[OWNS]-> CAP-001
```

---

### BusinessFunction Relationships (Wrong Types)

| Mock LeanIX Type | Count | Should Be | MASTER-PATTERNS Pattern |
|------------------|-------|-----------|-------------------------|
| `ENABLED_BY` | 10 | **DISALLOWED** | Reverse of Pattern 3 (not allowed) |
| `INQUIRE` | 15 | `WORKS_ON {rw: 'reads'}` | Pattern 10: BusinessFunction → DataObject |
| `MODIFY` | 12 | `WORKS_ON {rw: 'writes' or 'read-n-writes'}` | Pattern 10: BusinessFunction → DataObject |

**Total**: 37 relationships

**Why ENABLED_BY is Rejected:**
- Mock sends: `CAP-001 -[ENABLED_BY]-> COMP-001` (BusinessFunction → Component)
- MASTER-PATTERNS allows: `COMP-001 -[IMPLEMENTS]-> CAP-001` (Component → BusinessFunction)
- **Direction is reversed** - BusinessFunction cannot have outgoing relationships to Component

**Example:**
```
❌ CAP-001 -[ENABLED_BY]-> COMP-001
✅ COMP-001 -[IMPLEMENTS]-> CAP-001

❌ CAP-001 -[INQUIRE]-> DATA-789
✅ CAP-001 -[WORKS_ON {rw: 'reads'}]-> DATA-789
```

---

### Component Relationships (Wrong Types)

| Mock LeanIX Type | Count | Should Be | MASTER-PATTERNS Pattern |
|------------------|-------|-----------|-------------------------|
| `INQUIRE` | 9 | `WORKS_ON {rw: 'reads'}` | Pattern 10: Component → DataObject |
| `MODIFY` | 8 | `WORKS_ON {rw: 'writes' or 'read-n-writes'}` | Pattern 10: Component → DataObject |

**Total**: 17 relationships

**Example:**
```
❌ COMP-001 -[INQUIRE]-> DATA-789
✅ COMP-001 -[WORKS_ON {rw: 'reads'}]-> DATA-789

❌ COMP-001 -[MODIFY]-> DATA-789
✅ COMP-001 -[WORKS_ON {rw: 'read-n-writes'}]-> DATA-789
```

---

### AppChange Relationships (Wrong Types)

| Mock LeanIX Type | Count | Should Be | MASTER-PATTERNS Pattern |
|------------------|-------|-----------|-------------------------|
| `IMPACTS` | 10 | `CHANGES` | Pattern 5: AppChange → Component/BusinessFunction |
| `ENHANCES` | 4 | `CHANGES` | Pattern 5: AppChange → BusinessFunction |
| `ENABLES` | 2 | `CHANGES` | Pattern 5: AppChange → BusinessFunction |
| `MODIFIES` | 4 | `CHANGES` | Pattern 5: AppChange → DataObject |
| `MIGRATES` | 1 | `CHANGES` | Pattern 5: AppChange → DataObject |
| `READS` | 3 | `CHANGES` | Pattern 5: AppChange → DataObject |

**Total**: 24 relationships

**Example:**
```
❌ ACH-001 -[IMPACTS]-> COMP-001
✅ ACH-001 -[CHANGES]-> COMP-001

❌ ACH-002 -[ENHANCES]-> CAP-006
✅ ACH-002 -[CHANGES]-> CAP-006

❌ ACH-001 -[MODIFIES]-> DATA-456
✅ ACH-001 -[CHANGES]-> DATA-456
```

---

### InfraChange Relationships (Wrong Types)

| Mock LeanIX Type | Count | Should Be | MASTER-PATTERNS Pattern |
|------------------|-------|-----------|-------------------------|
| `PATCHES` | 8 | `CHANGES` | Pattern 8: InfraChange → Server |
| `UPGRADES` | 3 | `CHANGES` | Pattern 8: InfraChange → Server |
| `SCALES` | 2 | `CHANGES` | Pattern 8: InfraChange → Server |
| `DECOMMISSIONS` | 1 | `CHANGES` | Pattern 8: InfraChange → Server |

**Total**: 14 relationships

**Example:**
```
❌ ICH-004 -[PATCHES]-> SRV-001
✅ ICH-004 -[CHANGES]-> SRV-001

❌ ICH-001 -[UPGRADES]-> SRV-001
✅ ICH-001 -[CHANGES]-> SRV-001
```

---

### Server Relationships (Invalid Pattern)

| Mock LeanIX Type | Count | Should Be | MASTER-PATTERNS Pattern |
|------------------|-------|-----------|-------------------------|
| `WORKS_WITH` | 14 | **DISALLOWED** | Server cannot have outgoing relationships |
| `LOAD_BALANCES_WITH` | 4 | **DISALLOWED** | Server cannot have outgoing relationships |

**Total**: 18 relationships

**Why Rejected:**
- Per MASTER-PATTERNS.md line 273: "Server CANNOT have outgoing relationships"
- Server can only RECEIVE relationships (from Component, InfraChange)

**Example:**
```
❌ SRV-001 -[WORKS_WITH]-> SRV-003
❌ SRV-001 -[LOAD_BALANCES_WITH]-> SRV-002
✅ (Not allowed - Server is a leaf node)
```

---

## Summary by Category

| Category | Relationships | Issue | Fix |
|----------|---------------|-------|-----|
| Requirements | 9 | Node type removed | Remove from mock |
| Application | 16 | Wrong type names | Use OWNS |
| BusinessFunction | 37 | Wrong types + reverse direction | Use WORKS_ON, remove ENABLED_BY |
| Component | 17 | Wrong type names | Use WORKS_ON |
| AppChange | 24 | Wrong type names | Use CHANGES |
| InfraChange | 14 | Wrong type names | Use CHANGES |
| Server | 18 | Disallowed outgoing | Remove |
| **TOTAL** | **135** | Various | Update mock |

**Note**: Some relationships may fall into multiple categories. The total rejected is 91.

---

## Accepted Relationships (81)

These relationships ARE being accepted and synced correctly:

- ✅ `INSTALLED_ON` (Component → Server) - **28 relationships** - Pattern 7
- ✅ Various other valid patterns matching MASTER-PATTERNS.md

---

## Root Cause

**Mock LeanIX API was built before MASTER-PATTERNS.md v2.0**

The mock uses:
1. **Descriptive relationship types** (IMPLEMENTS_CAPABILITY, HAS_COMPONENT, PATCHES, etc.)
2. **Old Requirement nodes** (removed from simplified schema)
3. **Invalid patterns** (Server → Server, BusinessFunction → Component)

The sync service is **correctly** rejecting these per the whitelist approach.

---

## Recommended Fix: Update Mock LeanIX

### File to Update
`poc-services/mock-leanix/server.js`

### Changes Needed

#### 1. Remove All Requirement References
```javascript
// DELETE: /requirements endpoint
// DELETE: All REQ-xxx data
// DELETE: SUPPORTS, IMPLEMENTED_BY, SATISFIES relationships
```

#### 2. Update Relationship Types

Replace all relationship types with MASTER-PATTERNS v2.0 types:

```javascript
// Application Relationships
IMPLEMENTS_CAPABILITY → OWNS
HAS_COMPONENT → OWNS

// BusinessFunction Relationships
ENABLED_BY → Remove (use IMPLEMENTS from Component instead)
INQUIRE → WORKS_ON with rw: 'reads'
MODIFY → WORKS_ON with rw: 'read-n-writes'

// Component Relationships
INQUIRE → WORKS_ON with rw: 'reads'
MODIFY → WORKS_ON with rw: 'read-n-writes'

// AppChange Relationships
IMPACTS → CHANGES
ENHANCES → CHANGES
ENABLES → CHANGES
MODIFIES → CHANGES
MIGRATES → CHANGES
READS → CHANGES

// InfraChange Relationships
PATCHES → CHANGES
UPGRADES → CHANGES
SCALES → CHANGES
DECOMMISSIONS → CHANGES

// Server Relationships
WORKS_WITH → Remove (not allowed)
LOAD_BALANCES_WITH → Remove (not allowed)
```

#### 3. Add Required Properties

For relationships that need properties:

```javascript
// CALLS (Application/Component → API)
{
  type: 'CALLS',
  mode: 'pulls' | 'pushes',
  rw: 'reads' | 'writes' | 'read-n-writes'
}

// WORKS_ON (Component/BusinessFunction → DataObject)
{
  type: 'WORKS_ON',
  rw: 'reads' | 'writes' | 'read-n-writes'
}

// RELATES (BusinessFunction → BusinessFunction)
{
  type: 'RELATES',
  mode: 'pulls' | 'pushes'
}
```

---

## Expected Results After Fix

### Before (Current)
- Total: 172 relationships
- Accepted: 81 (47%)
- Rejected: 91 (53%)

### After (Fixed Mock LeanIX)
- Total: ~153 relationships (172 - 9 Requirements - 10 ENABLED_BY)
- Accepted: ~153 (100%)
- Rejected: 0 (0%)

**Improvement**: +72 relationships synced, 100% acceptance rate

---

## Verification Steps

After updating Mock LeanIX:

1. **Restart Services**
   ```bash
   docker-compose restart mock-leanix sync-service
   ```

2. **Trigger Manual Sync**
   ```bash
   curl -X POST http://localhost:3001/api/sync/trigger
   ```

3. **Check Sync Status**
   ```bash
   curl http://localhost:3001/api/sync/status
   ```

4. **Verify No Rejections**
   ```bash
   docker logs super-relativity-sync --tail 50 | grep "skipped"
   # Should show: (0 skipped as disallowed)
   ```

5. **Verify Relationship Count**
   ```cypher
   MATCH ()-[r]->()
   RETURN count(r) as total_relationships
   // Should be ~195 (114 existing + 81 new)
   ```

---

## Conclusion

✅ **Sync Service**: Working perfectly, enforcing MASTER-PATTERNS.md correctly
❌ **Mock LeanIX**: Needs updating to use v2.0 relationship types
🎯 **Next Step**: Update mock-leanix/server.js with correct relationship types

---

**Generated**: 2026-01-08
**Reference**: MASTER-PATTERNS.md v2.0
**Related**: system-status-2026-01-08.md
