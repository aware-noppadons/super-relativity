# Relationship Type Decision Guide

**Purpose:** Help AI tools and developers choose the correct MASTER-PATTERNS v2.0 relationship type.

**Usage:** Follow this decision tree when encountering a new relationship from LeanIX, diagrams, or code.

---

## Decision Tree

```
START: You have a relationship between Source → Target

┌─────────────────────────────────────────────────────────────┐
│ Q1: Is this a CHANGE/MODIFICATION relationship?            │
│ (AppChange, InfraChange modifying something)                │
└───────────────────┬─────────────────────────────────────────┘
                    │
        YES ────────┼────────→ Use: CHANGES
                    │          Examples:
                    │          - AppChange→Component
                    │          - InfraChange→Server
                    NO
                    │
┌───────────────────┴─────────────────────────────────────────┐
│ Q2: Is this an OWNERSHIP relationship?                      │
│ (Application owns Component, etc.)                          │
└───────────────────┬─────────────────────────────────────────┘
                    │
        YES ────────┼────────→ Use: OWNS
                    │          Examples:
                    │          - Application→Component
                    │          - Application→BusinessCapability
                    NO
                    │
┌───────────────────┴─────────────────────────────────────────┐
│ Q3: Is this a DEPLOYMENT relationship?                      │
│ (Component deployed/installed on Server)                    │
└───────────────────┬─────────────────────────────────────────┘
                    │
        YES ────────┼────────→ Use: INSTALLED_ON
                    │          Examples:
                    │          - Component→Server
                    NO
                    │
┌───────────────────┴─────────────────────────────────────────┐
│ Q4: Is Source a COMPONENT and Target an API?                │
└───────────────────┬─────────────────────────────────────────┘
                    │
        YES ────────┼────────→ Use: CALLS
                    │          mode: "pushes" (usually)
                    │          Examples:
                    │          - Component→API
                    NO
                    │
┌───────────────────┴─────────────────────────────────────────┐
│ Q5: Is Source an API and Target a COMPONENT?                │
└───────────────────┬─────────────────────────────────────────┘
                    │
        YES ────────┼────────→ Use: EXPOSES
                    │          Examples:
                    │          - API→Component
                    NO
                    │
┌───────────────────┴─────────────────────────────────────────┐
│ Q6: Is Target a DATA OBJECT (Database, Table, Storage)?     │
└───────────────────┬─────────────────────────────────────────┘
                    │
        YES ────────┼────────→ Use: WORKS_ON
                    │          Set rw property:
                    │          - "reads" for read-only
                    │          - "writes" for write-only
                    │          - "read-n-writes" for both
                    │          Examples:
                    │          - API→DataObject
                    │          - Component→DataObject
                    │          - BusinessCapability→DataObject
                    NO
                    │
┌───────────────────┴─────────────────────────────────────────┐
│ Q7: Does Source IMPLEMENT a business capability?            │
│ (Component implements BusinessCapability)                   │
└───────────────────┬─────────────────────────────────────────┘
                    │
        YES ────────┼────────→ Use: IMPLEMENTS
                    │          Examples:
                    │          - Component→BusinessCapability
                    NO
                    │
┌───────────────────┴─────────────────────────────────────────┐
│ Q8: Does Source INCLUDE/INCORPORATE Target?                 │
│ (BusinessFunction includes API)                             │
└───────────────────┬─────────────────────────────────────────┘
                    │
        YES ────────┼────────→ Use: INCLUDES
                    │          Examples:
                    │          - BusinessFunction→API
                    NO
                    │
┌───────────────────┴─────────────────────────────────────────┐
│ Q9: Does Source CONTAIN Target (composition)?               │
│ (Parent component contains child component)                 │
└───────────────────┬─────────────────────────────────────────┘
                    │
        YES ────────┼────────→ Use: CONTAINS
                    │          Examples:
                    │          - Component→Component (parent/child)
                    NO
                    │
┌───────────────────┴─────────────────────────────────────────┐
│ Q10: Is this a generic integration/dependency?              │
│ (When none of the above apply)                              │
└───────────────────┬─────────────────────────────────────────┘
                    │
        ALWAYS ─────┴────────→ Use: RELATES
                               Set mode based on description:
                               - "pushes" for sends/publishes
                               - "pulls" for gets/subscribes
                               - "bidirectional" for unknown
                               Examples:
                               - Component→Component
                               - Application→Application
                               - BusinessFunction→BusinessFunction
```

---

## Quick Reference Table

| Source Type | Target Type | Relationship | Properties |
|-------------|-------------|--------------|------------|
| **AppChange** | Component, Capability, DataObject | **CHANGES** | `description` |
| **InfraChange** | Server | **CHANGES** | `description` |
| **Application** | Component | **OWNS** | - |
| **Application** | BusinessCapability | **OWNS** | - |
| **Application** | API | **CALLS** | `mode: "pushes"` usually |
| **Component** | Server | **INSTALLED_ON** | - |
| **Component** | API | **CALLS** | `mode: "pushes"` usually |
| **Component** | DataObject | **WORKS_ON** | `rw: reads/writes/read-n-writes` |
| **Component** | BusinessCapability | **IMPLEMENTS** | - |
| **Component** | Component | **CONTAINS** | (parent→child) |
| **Component** | Component | **RELATES** | (peer→peer), set `mode` |
| **API** | Component | **EXPOSES** | - |
| **API** | DataObject | **WORKS_ON** | `rw: reads/writes/read-n-writes` |
| **BusinessFunction** | API | **INCLUDES** | - |
| **BusinessFunction** | BusinessFunction | **RELATES** | set `mode` |
| **BusinessCapability** | DataObject | **WORKS_ON** | `rw: reads/writes/read-n-writes` |
| **Any** | **Any** | **RELATES** | fallback, set `mode` |

---

## Description-Based Type Inference

When relationship type is not explicit, infer from description keywords:

### Keywords → CALLS
- "calls", "invokes", "requests"
- "API call", "REST call", "RPC"
- "sends request to"
- "uses API"

**Example:**
```
Description: "Component calls Customer API"
→ Type: CALLS, mode: "pushes"
```

### Keywords → EXPOSES
- "exposes", "provides", "serves"
- "endpoint for", "API for"
- "makes available"

**Example:**
```
Description: "API exposes Customer Lookup service"
→ Type: EXPOSES
```

### Keywords → WORKS_ON (with rw inference)

**Read operations:**
- "reads", "queries", "fetches", "retrieves", "gets", "selects"

**Example:**
```
Description: "Component reads CustomerTable"
→ Type: WORKS_ON, mode: "pulls", rw: "reads"
```

**Write operations:**
- "writes", "updates", "inserts", "creates", "posts", "publishes", "sends"

**Example:**
```
Description: "Component writes to AuditLog"
→ Type: WORKS_ON, mode: "pushes", rw: "writes"
```

**Read and write:**
- "read and write", "read & write", "updates", "modifies", "manages"

**Example:**
```
Description: "Component manages CustomerTable"
→ Type: WORKS_ON, rw: "read-n-writes"
```

### Keywords → IMPLEMENTS
- "implements", "realizes", "executes"
- "provides functionality for"

**Example:**
```
Description: "Registration Form implements Customer Onboarding"
→ Type: IMPLEMENTS
```

### Keywords → INCLUDES
- "includes", "incorporates", "comprises"
- "contains" (business level, not technical composition)

**Example:**
```
Description: "Customer Onboarding includes Customer API"
→ Type: INCLUDES
```

### Keywords → CONTAINS
- "contains" (technical composition)
- "has component", "parent of"
- "composed of"

**Example:**
```
Description: "Registration Form contains Authentication Service"
→ Type: CONTAINS
```

### Keywords → RELATES
- "depends on", "integrates with"
- "connects to", "related to"
- "communicates with"
- Any unclear relationship

**Example:**
```
Description: "Component depends on Validator"
→ Type: RELATES, mode: "pulls"
```

---

## Mode Property Guidelines

The `mode` property indicates data flow direction:

### Set mode = "pushes" when:
- Source **sends** data to target
- Source **publishes** events to target
- Source **writes** to target
- Source **posts** to target
- Source **pushes** updates to target

**Examples:**
```
Component→API (POST request) → mode: "pushes"
Component→Queue (publishes event) → mode: "pushes"
Component→DataObject (writes data) → mode: "pushes"
```

### Set mode = "pulls" when:
- Source **reads** from target
- Source **fetches** from target
- Source **queries** target
- Source **subscribes** to target
- Source **retrieves** from target

**Examples:**
```
Component→API (GET request) → mode: "pulls"
Component→DataObject (reads data) → mode: "pulls"
Component→Queue (subscribes) → mode: "pulls"
```

### Set mode = "bidirectional" when:
- Two-way communication
- Both reads and writes
- Unclear direction
- Peer-to-peer relationship

**Examples:**
```
Application→Application (integration) → mode: "bidirectional"
Component→Component (peers) → mode: "bidirectional"
```

### Set mode = null when:
- Not applicable (OWNS, CONTAINS, INSTALLED_ON, CHANGES)
- Structural relationship, not data flow

**Examples:**
```
Application→Component (OWNS) → mode: null
Component→Server (INSTALLED_ON) → mode: null
```

---

## RW Property Guidelines

The `rw` (read/write) property is used **only with WORKS_ON relationships** to DataObjects:

### Set rw = "reads" when:
- Read-only access
- Query only
- SELECT operations
- Fetches data without modification

**SQL analogy:** Only SELECT statements

**Examples:**
```
Dashboard→CustomerTable (displays data) → rw: "reads"
ReportGenerator→TransactionTable (generates reports) → rw: "reads"
```

### Set rw = "writes" when:
- Write-only access
- Append-only (logs, events)
- INSERT operations
- Does not read back

**SQL analogy:** Only INSERT/UPDATE/DELETE statements

**Examples:**
```
AuditService→AuditLog (writes logs) → rw: "writes"
EventPublisher→EventStore (publishes events) → rw: "writes"
```

### Set rw = "read-n-writes" when:
- Both reads and writes
- UPDATE operations (reads first)
- Full CRUD access
- Most application data access

**SQL analogy:** All SQL operations (SELECT, INSERT, UPDATE, DELETE)

**Examples:**
```
CustomerService→CustomerTable (full CRUD) → rw: "read-n-writes"
OrderProcessor→OrderTable (reads, updates status) → rw: "read-n-writes"
```

### Set rw = null when:
- Not a WORKS_ON relationship
- Not accessing data

---

## Context-Based Inference

When description alone is insufficient, use source/target types:

### Rule 1: Component → API
```javascript
if (sourceType === 'Component' && targetType === 'API') {
  return {
    type: 'CALLS',
    mode: 'pushes',  // Most API calls push requests
    rw: null
  };
}
```

### Rule 2: API → DataObject
```javascript
if (sourceType === 'API' && targetType === 'DataObject') {
  // Check description for read/write keywords
  if (description.match(/read|query|fetch|get/i)) {
    return { type: 'WORKS_ON', mode: 'pulls', rw: 'reads' };
  } else if (description.match(/write|update|insert|create/i)) {
    return { type: 'WORKS_ON', mode: 'pushes', rw: 'writes' };
  } else {
    return { type: 'WORKS_ON', mode: null, rw: 'read-n-writes' };
  }
}
```

### Rule 3: Application → Component
```javascript
if (sourceType === 'Application' && targetType === 'Component') {
  return {
    type: 'OWNS',
    mode: null,
    rw: null
  };
}
```

### Rule 4: Component → BusinessCapability
```javascript
if (sourceType === 'Component' && targetType === 'BusinessCapability') {
  return {
    type: 'IMPLEMENTS',
    mode: null,
    rw: null
  };
}
```

---

## Validation Checklist

After assigning relationship type and properties, verify:

✅ **Type is valid:**
- Must be one of: CALLS, OWNS, EXPOSES, WORKS_ON, IMPLEMENTS, INCLUDES, CHANGES, MATERIALIZES, INSTALLED_ON, RELATES, CONTAINS

✅ **Mode is valid (if set):**
- Must be: "pushes", "pulls", "bidirectional", or null
- Should be null for: OWNS, CONTAINS, INSTALLED_ON, CHANGES

✅ **RW is valid (if set):**
- Must be: "reads", "writes", "read-n-writes", or null
- Should only be set for WORKS_ON relationships

✅ **Combination makes sense:**
```
WORKS_ON + rw = null → ⚠️ Warning: rw should be set
CALLS + rw != null → ❌ Error: rw should be null
OWNS + mode != null → ❌ Error: mode should be null
WORKS_ON + mode = "pushes" + rw = "reads" → ❌ Conflict: pushes implies writes
WORKS_ON + mode = "pulls" + rw = "writes" → ❌ Conflict: pulls implies reads
```

✅ **Direction is correct:**
- OWNS: Owner → Owned (Application → Component ✓, Component → Application ✗)
- IMPLEMENTS: Implementer → Capability (Component → Capability ✓)
- INSTALLED_ON: Installed → Host (Component → Server ✓)
- EXPOSES: Exposer → Exposed (API → Component ✓)
- CALLS: Caller → Called (Component → API ✓)

---

## Common Mistakes to Avoid

### Mistake 1: Using RELATES for everything

**Wrong:**
```cypher
(component)-[:RELATES]->(api)
(api)-[:RELATES]->(dataobject)
```

**Right:**
```cypher
(component)-[:CALLS {mode: "pushes"}]->(api)
(api)-[:WORKS_ON {rw: "reads"}]->(dataobject)
```

**Why:** RELATES is a fallback. Use specific types when available.

### Mistake 2: Forgetting rw on WORKS_ON

**Wrong:**
```cypher
(component)-[:WORKS_ON {mode: "pulls"}]->(database)
```

**Right:**
```cypher
(component)-[:WORKS_ON {mode: "pulls", rw: "reads"}]->(database)
```

**Why:** WORKS_ON should always have rw property.

### Mistake 3: Setting mode on structural relationships

**Wrong:**
```cypher
(application)-[:OWNS {mode: "pushes"}]->(component)
```

**Right:**
```cypher
(application)-[:OWNS]->(component)
```

**Why:** OWNS is structural, not data flow.

### Mistake 4: Wrong relationship direction

**Wrong:**
```cypher
(component)-[:EXPOSES]->(api)  // Component exposes API? No!
```

**Right:**
```cypher
(api)-[:EXPOSES]->(component)  // API exposes Component ✓
```

**Why:** APIs expose components, not the other way around.

### Mistake 5: Conflicting mode and rw

**Wrong:**
```cypher
(component)-[:WORKS_ON {mode: "pushes", rw: "reads"}]->(db)
```

**Right:**
```cypher
// If pushes (writes):
(component)-[:WORKS_ON {mode: "pushes", rw: "writes"}]->(db)

// If reads:
(component)-[:WORKS_ON {mode: "pulls", rw: "reads"}]->(db)
```

**Why:** "pushes" implies writes, "pulls" implies reads.

---

## Real-World Examples

### Example 1: REST API Call

**Scenario:** Registration Form calls Customer API to create new customer

**Analysis:**
- Source: Component (Registration Form)
- Target: API (Customer API)
- Operation: POST (write operation)

**Relationship:**
```cypher
(regForm:Component)-[:CALLS {
  mode: "pushes",
  description: "Creates new customer via POST"
}]->(customerAPI:API)
```

### Example 2: Database Read

**Scenario:** Dashboard reads Customer Table to display customer list

**Analysis:**
- Source: Component (Dashboard)
- Target: DataObject (Customer Table)
- Operation: SELECT (read operation)

**Relationship:**
```cypher
(dashboard:Component)-[:WORKS_ON {
  mode: "pulls",
  rw: "reads",
  description: "Reads customer data for display"
}]->(customerTable:DataObject)
```

### Example 3: Audit Logging

**Scenario:** Upload Handler writes to Audit Log

**Analysis:**
- Source: Component (Upload Handler)
- Target: DataObject (Audit Log)
- Operation: INSERT (write-only)

**Relationship:**
```cypher
(uploadHandler:Component)-[:WORKS_ON {
  mode: "pushes",
  rw: "writes",
  description: "Writes audit entries"
}]->(auditLog:DataObject)
```

### Example 4: Full CRUD Access

**Scenario:** Customer Service manages Customer Table (full access)

**Analysis:**
- Source: Component (Customer Service)
- Target: DataObject (Customer Table)
- Operation: All operations (CRUD)

**Relationship:**
```cypher
(customerService:Component)-[:WORKS_ON {
  rw: "read-n-writes",
  description: "Full CRUD access to customer data"
}]->(customerTable:DataObject)
```

### Example 5: API Exposes Service

**Scenario:** Customer API exposes Customer Lookup service

**Analysis:**
- Source: API (Customer API)
- Target: Component (Customer Lookup)
- Operation: Exposure (makes service available)

**Relationship:**
```cypher
(customerAPI:API)-[:EXPOSES {
  description: "Exposes customer lookup functionality"
}]->(customerLookup:Component)
```

### Example 6: Business Process Integration

**Scenario:** Customer Onboarding sends documents to Document Management

**Analysis:**
- Source: BusinessFunction (Customer Onboarding)
- Target: BusinessFunction (Document Management)
- Operation: Sends/pushes

**Relationship:**
```cypher
(onboarding:BusinessFunction)-[:RELATES {
  mode: "pushes",
  description: "Sends customer documents to document management"
}]->(docMgmt:BusinessFunction)
```

### Example 7: Component Ownership

**Scenario:** Customer Portal owns Registration Form

**Analysis:**
- Source: Application (Customer Portal)
- Target: Component (Registration Form)
- Operation: Ownership

**Relationship:**
```cypher
(portal:Application)-[:OWNS {
  description: "Customer Portal owns Registration Form"
}]->(regForm:Component)
```

### Example 8: Change Management

**Scenario:** Payment API Migration changes Registration Form

**Analysis:**
- Source: AppChange (Payment API Migration)
- Target: Component (Registration Form)
- Operation: Modification

**Relationship:**
```cypher
(migration:AppChange)-[:CHANGES {
  description: "Payment API migration requires form updates"
}]->(regForm:Component)
```

---

## When to Ask for Clarification

If you encounter these situations, ask the user or source for clarification:

1. **Ambiguous description:**
   - "integrates with" → Could be CALLS, RELATES, or multiple relationships
   - "uses" → Could be CALLS, WORKS_ON, or RELATES

2. **Missing entity types:**
   - Cannot determine relationship without knowing source/target types

3. **Conflicting information:**
   - Description says "writes" but context implies read-only access

4. **New patterns:**
   - Relationship type not covered in MASTER-PATTERNS
   - Unusual entity type combinations

5. **Business vs. Technical:**
   - Unclear if relationship should come from LeanIX or diagrams

---

**END OF RELATIONSHIP TYPE DECISION GUIDE**

*Use this guide in conjunction with MASTER-PATTERNS.md and PRODUCTION-INTEGRATION-GUIDE.md*
