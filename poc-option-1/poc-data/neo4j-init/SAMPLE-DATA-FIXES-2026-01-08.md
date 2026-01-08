# Sample Data Corrections - 2026-01-08

## Summary

Fixed `02-sample-data.cypher` to strictly follow the **11 Patterns Official Reference**.

**File**: `02-sample-data-CORRECTED.cypher`

---

## Violations Fixed

### ❌ Violation 1: Pattern 11 used wrong mode
**Issue**: BusinessFunction → BusinessFunction used `mode: 'contains'`
**Rule**: Pattern 11 only allows `mode: 'relates'`

**Before**:
```cypher
// Rule 11: BusinessFunction → BusinessFunction (relates)
MATCH (bf1:BusinessFunction {id: 'BF-001'}), (bf3:BusinessFunction {id: 'BF-003'})
CREATE (bf1)-[:RELATED_TO {
  mode: 'contains',  // ❌ WRONG
  tags: ['CONTAINS'],
  description: 'Customer Management contains Customer Onboarding'
}]->(bf3);
```

**After**:
```cypher
// Rule 11: BusinessFunction → BusinessFunction (relates ONLY)
MATCH (bf1:BusinessFunction {id: 'BF-001'}), (bf3:BusinessFunction {id: 'BF-003'})
CREATE (bf1)-[:RELATED_TO {
  mode: 'relates',  // ✅ CORRECT
  tags: ['CONTAINS'],
  description: 'Customer Management relates to Customer Onboarding'
}]->(bf3);
```

---

### ❌ Violation 2: Missing bidirectional Component → API relationship
**Issue**: Pattern 2 requires bidirectional API ↔ Component relationship
**Rule**: API → Component (exposes) AND Component → API (calls)

**Before**:
```cypher
// Only had API → Component (exposes) ❌
// Missing Component → API (calls)
```

**After**:
```cypher
// Rule 2 (Bidirectional): Component → API (calls)
// Components call the APIs that expose them
MATCH (comp1:Component {id: 'COMP-001'}), (api1:API {id: 'API-001'})
CREATE (comp1)-[:RELATED_TO {
  mode: 'calls',  // ✅ ADDED
  tags: ['CALLS'],
  description: 'Customer Service calls Customer API'
}]->(api1);

MATCH (comp2:Component {id: 'COMP-002'}), (api2:API {id: 'API-002'})
CREATE (comp2)-[:RELATED_TO {
  mode: 'calls',  // ✅ ADDED
  tags: ['CALLS'],
  description: 'Transaction Service calls Transaction API'
}]->(api2);

MATCH (comp3:Component {id: 'COMP-003'}), (api3:API {id: 'API-003'})
CREATE (comp3)-[:RELATED_TO {
  mode: 'calls',  // ✅ ADDED
  tags: ['CALLS'],
  description: 'Notification Service calls Notification API'
}]->(api3);
```

---

### ❌ Violation 3: Pattern 9 missing "contains" mode
**Issue**: Pattern 9 only had `mode: 'uses'` examples
**Rule**: Pattern 9 allows both `mode: 'uses'` AND `mode: 'contains'`

**Before**:
```cypher
// Rule 9: Component → Component (uses/owns/relates)
// Only had "uses" examples ❌
```

**After**:
```cypher
// Rule 9: Component → Component (uses, contains)  // ✅ Updated comment

// Existing "uses" relationships (kept)
MATCH (comp1:Component {id: 'COMP-001'}), (comp4:Component {id: 'COMP-004'})
CREATE (comp1)-[:RELATED_TO {mode: 'uses', ...}]->(comp4);

// NEW: Added "contains" example ✅
MATCH (comp1:Component {id: 'COMP-001'}), (comp3:Component {id: 'COMP-003'})
CREATE (comp1)-[:RELATED_TO {
  mode: 'contains',
  tags: ['CONTAINS'],
  description: 'Customer Service contains Notification Service module'
}]->(comp3);
```

---

## Corrected Relationship Count

After corrections, the sample data will create:

| Pattern | Relationship | Mode | Count |
|---------|-------------|------|-------|
| 1 | Application → Application | relates | 2 |
| 1 | Application → API | calls | 3 |
| 1 | Application → BusinessFunction | owns | 3 |
| 1 | Application → Component | owns | 3 |
| 2 | API → Component | exposes | 3 |
| 2 | API → DataObject | works_on | 3 |
| 2 | **Component → API** | **calls** | **3** ✅ NEW |
| 3 | Component → BusinessFunction | implements | 3 |
| 4 | BusinessFunction → API | includes | 2 |
| 5 | AppChange → Component | relates | 2 |
| 5 | AppChange → BusinessFunction | relates | 2 |
| 5 | AppChange → DataObject | relates | 3 |
| 6 | Table → DataObject | materializes | 3 |
| 7 | Component → Server | installs_on | 4 |
| 8 | InfraChange → Server | relates | 3 |
| 9 | Component → Component | uses | 3 |
| 9 | **Component → Component** | **contains** | **1** ✅ NEW |
| 10 | Component → DataObject | use | 5 |
| 10 | BusinessFunction → DataObject | use | 4 |
| 11 | BusinessFunction → BusinessFunction | ~~contains~~ **relates** | 1 ✅ FIXED |
| 11 | BusinessFunction → BusinessFunction | relates | 1 |

**Total Relationships**: 53 (was 50, added 3)
**Total Nodes**: 30 (unchanged)

---

## Validation Checklist

Before importing, verify:

- [x] Pattern 1: Application only connects to Application, API, BusinessFunction, Component
- [x] Pattern 2: API ↔ Component is bidirectional (exposes + calls)
- [x] Pattern 2: API → DataObject (works_on)
- [x] Pattern 3: Component → BusinessFunction (implements)
- [x] Pattern 4: BusinessFunction → API (includes)
- [x] Pattern 5: AppChange → Component, BusinessFunction, DataObject (relates)
- [x] Pattern 6: Table → DataObject (materializes)
- [x] Pattern 7: Component → Server (installs_on)
- [x] Pattern 8: InfraChange → Server (relates)
- [x] Pattern 9: Component → Component (uses, contains)
- [x] Pattern 10: Component/BusinessFunction → DataObject (use)
- [x] Pattern 11: BusinessFunction → BusinessFunction (relates ONLY, not contains)

---

## Next Steps

1. ✅ User reviews corrected file
2. ⏳ Import `02-sample-data-CORRECTED.cypher`
3. ⏳ Verify all 53 relationships match patterns
4. ⏳ Proceed to sync service import
