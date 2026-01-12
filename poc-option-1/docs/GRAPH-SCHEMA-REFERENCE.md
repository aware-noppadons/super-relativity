# Graph Schema Reference

**Complete reference for all node types and relationship patterns in Super Relativity POC**

**Last Updated:** 2026-01-09
**Schema Version:** MASTER-PATTERNS v2.0

---

## Node Types (Labels)

All entity types currently supported in the graph database.

### 1. Application
**Source:** LeanIX (synced), Diagrams (parsed)
**Purpose:** Software applications, systems, microservices
**Key Properties:**
- `id` (String, unique identifier)
- `name` (String)
- `type` (String: "Web Application", "Backend Service", "Microservice", etc.)
- `description` (String)
- `businessValue` (String)
- `lifecycle` (String)
- `techStack` (Array of strings)
- `repositories` (Array of strings)
- `syncedAt` (DateTime, if from LeanIX)
- `diagramFile` (String, if from diagrams)

### 2. Component
**Source:** LeanIX (synced), Diagrams (parsed)
**Purpose:** Software modules, UI components, backend services, microservices components
**Key Properties:**
- `id` (String, unique identifier)
- `name` (String)
- `application` (String, parent application ID)
- `type` (String: "UI Component", "Backend Module", "Service Layer", etc.)
- `technology` (String)
- `description` (String)
- `responsibilities` (Array of strings)
- `syncedAt` (DateTime, if from LeanIX)
- `diagramFile` (String, if from diagrams)
- `elementType` (String: "Container", "ContainerDb", "Component" from C4)

### 3. API
**Source:** LeanIX (synced), Diagrams (parsed)
**Purpose:** REST APIs, GraphQL endpoints, messaging interfaces
**Key Properties:**
- `id` (String, unique identifier)
- `name` (String)
- `type` (String: "REST", "GraphQL", "gRPC", etc.)
- `version` (String)
- `baseUrl` (String)
- `authentication` (String)
- `rateLimit` (String)
- `description` (String)
- `owner` (String)
- `lifecycle` (String)
- `application` (String, parent application ID)
- `syncedAt` (DateTime, if from LeanIX)

### 4. DataObject
**Source:** LeanIX (synced), Diagrams (parsed)
**Purpose:** Databases, tables, caches, message queues, object storage
**Key Properties:**
- `id` (String, unique identifier)
- `name` (String)
- `type` (String: "Database Table", "Cache", "Object Storage", "Message Queue", "Log Store", "Data Warehouse", "Key-Value Store")
- `database` (String, optional)
- `schema` (String, optional)
- `location` (String, optional: "Redis", "S3", "Elasticsearch", etc.)
- `sensitivity` (String: "PII", "PCI", "Confidential", "Standard")
- `retention` (String)
- `columns` (Array of strings, optional)
- `application` (String, parent application ID)
- `syncedAt` (DateTime, if from LeanIX)

### 5. BusinessFunction
**Source:** LeanIX (synced)
**Purpose:** Business capabilities, business functions
**Key Properties:**
- `id` (String, unique identifier)
- `name` (String)
- `level` (String: "L1", "L2", "L3", etc.)
- `description` (String)
- `owner` (String)
- `criticality` (String: "Critical", "High", "Medium", "Low")
- `maturity` (String: "Emerging", "Defined", "Managed", "Optimized")
- `application` (String, related application ID)
- `syncedAt` (DateTime)

### 6. Server
**Source:** LeanIX (synced)
**Purpose:** Physical servers, virtual machines, infrastructure nodes
**Key Properties:**
- `id` (String, unique identifier)
- `name` (String)
- `hostname` (String)
- `ip` (String)
- `environment` (String: "prod", "uat", "sit", "dev", "nft")
- `os` (String)
- `region` (String)
- `datacenter` (String)
- `cpu` (String)
- `memory` (String)
- `status` (String: "active", "inactive", "decommissioned")
- `purpose` (String)
- `syncedAt` (DateTime)

### 7. AppChange
**Source:** LeanIX (synced)
**Purpose:** Application-level changes (features, enhancements, migrations, deprecations)
**Key Properties:**
- `id` (String, unique identifier)
- `name` (String)
- `changeType` (String: "New Feature", "Enhancement", "Migration", "Deprecation", "Bug Fix")
- `status` (String: "Planned", "In Progress", "Completed", "Cancelled")
- `priority` (String: "Critical", "High", "Medium", "Low")
- `plannedDate` (Date)
- `implementedDate` (Date, optional)
- `description` (String)
- `components` (Array of component IDs)
- `businessCapabilities` (Array of capability IDs)
- `dataObjects` (Array of data object IDs)
- `impactLevel` (String: "High", "Medium", "Low")
- `riskLevel` (String: "High", "Medium", "Low")
- `syncedAt` (DateTime)

### 8. InfraChange
**Source:** LeanIX (synced)
**Purpose:** Infrastructure-level changes (OS upgrades, scaling, hardware changes, patches, decommissions)
**Key Properties:**
- `id` (String, unique identifier)
- `name` (String)
- `changeType` (String: "OS Upgrade", "Scaling", "Hardware Upgrade", "Security Patch", "Decommission")
- `status` (String: "Planned", "In Progress", "Completed", "Cancelled")
- `priority` (String: "Critical", "High", "Medium", "Low")
- `plannedDate` (Date)
- `implementedDate` (Date, optional)
- `description` (String)
- `servers` (Array of server IDs)
- `impactLevel` (String: "High", "Medium", "Low")
- `riskLevel` (String: "High", "Medium", "Low")
- `downtime` (String)
- `rollbackPlan` (String)
- `syncedAt` (DateTime)

---

## Relationship Types

All relationship patterns following MASTER-PATTERNS v2.0.

### Pattern 1: OWNS
**Direction:** Application → Component, Application → BusinessFunction
**Semantic:** Ownership relationship (parent-child)
**Properties:**
- `description` (String)
- `syncedAt` (DateTime, if from LeanIX)
- `diagramFile` (String, if from diagrams)

**Example:**
```cypher
(APP-123:Application)-[:OWNS {description: "Customer Portal owns Registration Form", syncedAt: ...}]->(COMP-001:Component)
```

### Pattern 2: CALLS
**Direction:** Application → Application, Application → API, Component → API
**Semantic:** Synchronous invocation, API call, RPC
**Properties:**
- `description` (String)
- `mode` (String: "pushes", "pulls", "bidirectional") - REQUIRED
- `rw` (String: "reads", "writes", "read-n-writes") - Optional
- `syncedAt` (DateTime, if from LeanIX)
- `diagramFile` (String, if from diagrams)

**Example:**
```cypher
(COMP-001:Component)-[:CALLS {description: "Registration Form calls Customer API", mode: "pushes", rw: "writes", diagramFile: "..."}]->(API-001:API)
```

### Pattern 3: IMPLEMENTS
**Direction:** Application → BusinessFunction, Component → BusinessFunction
**Semantic:** Implementation of a capability or interface
**Properties:**
- `description` (String)
- `syncedAt` (DateTime, if from LeanIX)
- `diagramFile` (String, if from diagrams)

**Example:**
```cypher
(COMP-001:Component)-[:IMPLEMENTS {description: "Registration Form implements Customer Onboarding", syncedAt: ...}]->(CAP-001:BusinessFunction)
```

### Pattern 4: EXPOSES
**Direction:** API → Component
**Semantic:** API exposes internal component as endpoint
**Properties:**
- `description` (String)
- `diagramFile` (String) - Usually from diagrams

**Example:**
```cypher
(API-001:API)-[:EXPOSES {description: "Customer API exposes Customer Lookup Service", diagramFile: "..."}]->(COMP-006:Component)
```

### Pattern 5: INCLUDES
**Direction:** BusinessFunction → API
**Semantic:** Business capability includes/encompasses API
**Properties:**
- `description` (String)
- `diagramFile` (String) - Usually from diagrams

**Example:**
```cypher
(CAP-001:BusinessFunction)-[:INCLUDES {description: "Customer Onboarding includes Customer API", diagramFile: "..."}]->(API-001:API)
```

### Pattern 6: WORKS_ON
**Direction:** Component → DataObject, API → DataObject, BusinessFunction → DataObject
**Semantic:** Data access operations (read, write, or both)
**Properties:**
- `description` (String)
- `rw` (String: "reads", "writes", "read-n-writes") - REQUIRED
- `mode` (String: "pushes", "pulls", "bidirectional") - Optional
- `syncedAt` (DateTime, if from LeanIX)
- `diagramFile` (String, if from diagrams)

**Example:**
```cypher
(COMP-001:Component)-[:WORKS_ON {description: "Registration Form works on CustomerTable", rw: "read-n-writes", syncedAt: ...}]->(DATA-789:DataObject)
```

### Pattern 7: CHANGES
**Direction:** AppChange → Component, AppChange → BusinessFunction, AppChange → DataObject, InfraChange → Server
**Semantic:** Change/modification impacts target entity
**Properties:**
- `description` (String)
- `syncedAt` (DateTime)

**Example:**
```cypher
(ACH-001:AppChange)-[:CHANGES {description: "Payment API changes Registration Form", syncedAt: ...}]->(COMP-001:Component)
(ICH-001:InfraChange)-[:CHANGES {description: "OS Upgrade changes web-prod-01", syncedAt: ...}]->(SRV-001:Server)
```

### Pattern 8: INSTALLED_ON
**Direction:** Component → Server
**Semantic:** Component deployed on server infrastructure
**Properties:**
- `syncedAt` (DateTime)

**Example:**
```cypher
(COMP-001:Component)-[:INSTALLED_ON {syncedAt: ...}]->(SRV-001:Server)
```

### Pattern 9: CONTAINS
**Direction:** Application → Component (Container → Component in C4 diagrams)
**Semantic:** Containment hierarchy
**Properties:**
- `description` (String)
- `diagramFile` (String) - Usually from diagrams

**Example:**
```cypher
(APP-123:Application)-[:CONTAINS {description: "Registration Form contains Authentication Service", diagramFile: "..."}]->(COMP-003:Component)
```

### Pattern 10: RELATES
**Direction:** Application → Application, BusinessFunction → BusinessFunction, Component → Component
**Semantic:** Generic bidirectional relationship or interaction
**Properties:**
- `description` (String)
- `mode` (String: "pushes", "pulls", "bidirectional")
- `syncedAt` (DateTime, if from LeanIX)
- `diagramFile` (String, if from diagrams)

**Example:**
```cypher
(CAP-001:BusinessFunction)-[:RELATES {description: "Customer Onboarding sends documents to Document Management", mode: "pushes", diagramFile: "..."}]->(CAP-003:BusinessFunction)
```

---

## Relationship Properties Reference

### Required Properties (All Relationships)
- `description` (String) - Human-readable explanation

### Source Attribution Properties (Mutually Exclusive)
- `syncedAt` (DateTime) - For relationships from LeanIX
- `diagramFile` (String) - For relationships from diagram parsing

### Semantic Properties (Pattern-Specific)
- `mode` (String) - Direction of data/control flow
  - Values: `"pushes"`, `"pulls"`, `"bidirectional"`
  - Required for: CALLS, RELATES
  - Optional for: WORKS_ON

- `rw` (String) - Data access type
  - Values: `"reads"`, `"writes"`, `"read-n-writes"`
  - Required for: WORKS_ON
  - Optional for: CALLS

---

## Entity Relationship Diagram (ERD)

```
┌─────────────┐
│ Application │◄───OWNS───────┐
└──────┬──────┘               │
       │                      │
       │ OWNS                 │ IMPLEMENTS
       │                      │
       ▼                      │
  ┌─────────┐           ┌────┴────────────┐
  │Component│           │BusinessFunction│
  └────┬────┘           └─────────────────┘
       │                      │
       │ WORKS_ON             │ WORKS_ON
       │                      │
       ▼                      ▼
  ┌──────────┐           ┌──────────┐
  │DataObject│◄─WORKS_ON─│   API    │
  └──────────┘           └────┬─────┘
       ▲                      │
       │                      │ EXPOSES
       │ CHANGES              │
       │                      ▼
  ┌────┴─────┐           ┌─────────┐
  │AppChange │           │Component│
  └──────────┘           └─────────┘
                              │
                              │ INSTALLED_ON
                              ▼
                         ┌────────┐
                         │ Server │
                         └────┬───┘
                              ▲
                              │ CHANGES
                              │
                         ┌────┴──────┐
                         │InfraChange│
                         └───────────┘

Additional Relationships:
- Application ──CALLS──> API
- Component ──CALLS──> API
- Application ──CALLS──> Application
- Application ──RELATES──> Application
- BusinessFunction ──RELATES──> BusinessFunction
- Component ──RELATES──> Component
- Application ──CONTAINS──> Component
- BusinessFunction ──INCLUDES──> API
- AppChange ──CHANGES──> Component
- AppChange ──CHANGES──> BusinessFunction
```

---

## Coverage Matrix

### Node Types

| Node Type | In Mock Data | In Documentation | In Sample Queries |
|-----------|--------------|------------------|-------------------|
| Application | ✅ | ✅ | ✅ |
| Component | ✅ | ✅ | ✅ |
| API | ✅ | ✅ | ✅ |
| DataObject | ✅ | ✅ | ✅ |
| BusinessFunction | ✅ | ✅ | ✅ |
| Server | ✅ | ✅ | ✅ |
| AppChange | ✅ | ✅ | ❌ |
| InfraChange | ✅ | ✅ | ✅ |

### Relationship Patterns

| Relationship | Source→Target | In Mock Data | In Documentation | In Sample Queries |
|--------------|---------------|--------------|------------------|-------------------|
| OWNS | Application→Component | ✅ | ✅ | ✅ |
| OWNS | Application→BusinessFunction | ✅ | ❌ | ❌ |
| CALLS | Application→API | ✅ | ✅ | ✅ |
| CALLS | Application→Application | ✅ | ✅ | ✅ |
| CALLS | Component→API | ✅ | ✅ | ✅ |
| IMPLEMENTS | Application→BusinessFunction | ❌ | ✅ | ✅ |
| IMPLEMENTS | Component→BusinessFunction | ✅ | ✅ | ❌ |
| EXPOSES | API→Component | ✅ | ✅ | ✅ |
| INCLUDES | BusinessFunction→API | ✅ | ✅ | ❌ |
| WORKS_ON | Component→DataObject | ✅ | ✅ | ✅ |
| WORKS_ON | API→DataObject | ✅ | ✅ | ✅ |
| WORKS_ON | BusinessFunction→DataObject | ✅ | ✅ | ❌ |
| CHANGES | AppChange→Component | ✅ | ✅ | ❌ |
| CHANGES | AppChange→BusinessFunction | ✅ | ✅ | ❌ |
| CHANGES | AppChange→DataObject | ✅ | ✅ | ❌ |
| CHANGES | InfraChange→Server | ✅ | ✅ | ✅ |
| INSTALLED_ON | Component→Server | ✅ | ❌ | ❌ (wrong direction!) |
| CONTAINS | Application→Component | ✅ | ✅ | ✅ |
| RELATES | Application→Application | ✅ | ✅ | ❌ |
| RELATES | BusinessFunction→BusinessFunction | ✅ | ✅ | ✅ |
| RELATES | Component→Component | ✅ | ✅ | ❌ |

---

## Gaps Identified

### Missing Node Type Queries
1. **AppChange** - No query to explore application changes

### Missing Relationship Queries
1. **Application OWNS BusinessFunction** - Should be documented
2. **Component IMPLEMENTS BusinessFunction** - Exists in mock but not queried
3. **BusinessFunction INCLUDES API** - Exists in mock but not queried
4. **BusinessFunction WORKS_ON DataObject** - Exists in mock but not queried
5. **AppChange CHANGES Component/BusinessFunction/DataObject** - Exists in mock but not queried
6. **Component INSTALLED_ON Server** - Query 17 has WRONG DIRECTION (shows Server→Application)
7. **Application RELATES Application** - Exists in mock but not queried
8. **Component RELATES Component** - Exists in mock but not queried

### Documentation Errors
1. **Query 17**: Shows `Server INSTALLED_ON Application` but mock data has `Component INSTALLED_ON Server`

---

## Recommendations

1. **Update LIVE-GRAPH-SAMPLE-QUERIES.md** with:
   - Queries for AppChange nodes
   - Fix Query 17 direction
   - Add missing relationship pattern queries

2. **Update PRODUCTION-INTEGRATION-GUIDE.md** with:
   - Complete node type list including AppChange and InfraChange
   - Complete relationship pattern list

3. **Create validation queries** to check for all expected relationship patterns

---

**Last Updated:** 2026-01-09
**Next Review:** When schema changes occur
