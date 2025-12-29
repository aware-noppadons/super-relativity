# Quick Conversion Reference

**For AI Tools**: Fast lookup guide for common conversion tasks

---

## ID Patterns

```
APP-###    Application
CAP-###    Business Capability
REQ-###    Requirement
DATA-###   Data Object
SRV-###    Server/Infrastructure
COMP-###   Component
ACH-###    Application Change
ICH-###    Infrastructure Change
```

---

## Type Mappings

### Application Types
```
Web App, Portal, Website          → Web Application
Mobile, iOS, Android              → Mobile Application
API, REST, Service, Microservice  → API Service or Microservice
Database, DB                      → Database
Batch, Job, Cron                  → Batch Job
Desktop                           → Desktop Application
```

### Requirement Types
```
Feature, User Story               → Functional
NFR, Quality Attribute            → Non-Functional
Security, Auth, Encryption        → Security
GDPR, Compliance, Regulation      → Compliance
Performance, Speed, Latency       → Performance
UX, UI, Usability                 → Usability
```

### Data Object Types
```
Table, Relation                   → Database Table
Document, Collection              → Collection
File, CSV, JSON                   → File
Endpoint, API                     → API Endpoint
Queue, Topic                      → Message Queue
Redis, Memcached                  → Cache
```

---

## Status/Lifecycle Mappings

```
Production, Live, Prod            → Status: Active, Lifecycle: Run
Development, Dev, Building        → Status: Development, Lifecycle: Build
Planning, Roadmap                 → Status: Planned, Lifecycle: Plan
Deprecated, EOL                   → Status: Deprecated, Lifecycle: Retire
Retired, Decommissioned          → Status: Retired, Lifecycle: Retire
```

---

## Criticality Mappings

```
Very High, Essential, Critical    → Critical
High, Important                   → High
Normal, Medium, Standard          → Medium
Low, Minor, Nice-to-Have         → Low
```

---

## Relationship Keywords → Types

```
depends on, requires              → DEPENDS_ON
uses, utilizes, calls            → USES
implements, fulfills             → IMPLEMENTED_BY (reversed)
provides, exposes                → PROVIDES
consumes, subscribes             → CONSUMES
deployed on, hosted on           → DEPLOYED_ON
stored in, persisted in          → STORED_IN
supports, enables                → SUPPORTS
contains, includes               → CONTAINS
part of, belongs to              → PART_OF
modifies, updates, writes        → MODIFIES
reads, queries                   → READS
```

---

## Field Name Mappings

```
application name, app name, service name  → name
application type, kind, category          → type
state, current status                     → status
lifecycle stage, phase                    → lifecycle
business importance, importance           → businessCriticality
technologies, tech stack, built with      → techStack
repo, source code, git repo              → repositories
database, db name                        → database
criticality, priority                    → criticality/priority
```

---

## Validation Quick Check

```
✓ ID matches pattern (APP-###, CAP-###, etc.)
✓ Name is 1-200 characters
✓ Type is from valid enum list
✓ Status/Lifecycle are valid enums
✓ techStack is array format
✓ repositories are valid URLs
✓ Dates are ISO 8601 (YYYY-MM-DD)
✓ All referenced IDs exist
✓ No circular dependencies
```

---

## Common Conversions

### CSV Row → Application JSON

```csv
Customer Portal,Web App,Production,React;Node.js,CX Team,High
```

```json
{
  "id": "APP-###",
  "name": "Customer Portal",
  "type": "Web Application",
  "status": "Active",
  "lifecycle": "Run",
  "techStack": ["React", "Node.js"],
  "owner": "CX Team",
  "businessCriticality": "High"
}
```

### Free Text → Structured

```
The Order Processing API is a critical microservice built with Java and Spring Boot.
It's currently in production and maintained by the Backend Team.
```

```json
{
  "id": "APP-###",
  "name": "Order Processing API",
  "type": "Microservice",
  "status": "Active",
  "lifecycle": "Run",
  "techStack": ["Java", "Spring Boot"],
  "owner": "Backend Team",
  "businessCriticality": "Critical"
}
```

### Dependency Statement → Relationship

```
Customer Portal depends on Authentication Service
```

```json
{
  "from": "APP-123",
  "to": "APP-124",
  "type": "DEPENDS_ON",
  "confidence": 0.9,
  "source": "text_conversion"
}
```

---

## Required Fields by Entity

```
Application:     id, name, type
Capability:      id, name, level
Requirement:     id, name, type, priority
Data Object:     id, name, type
Server:          id, name, type, environment
Relationship:    from, to, type
```

---

## Default Values

```
status           → "Active"
lifecycle        → "Run"
priority         → "Medium"
criticality      → "Medium"
confidence       → 1.0
environment      → "Production"
sensitivity      → "Internal"
```

---

## Array Parsing

```
"React, Node.js, PostgreSQL"       → ["React", "Node.js", "PostgreSQL"]
"React; Node.js; PostgreSQL"       → ["React", "Node.js", "PostgreSQL"]
"- React\n- Node.js\n- PostgreSQL" → ["React", "Node.js", "PostgreSQL"]
```

---

## Neo4j Cypher Template

```cypher
MERGE (e:EntityType {id: $id})
SET e.name = $name,
    e.type = $type,
    e.status = $status,
    e.lastSyncedAt = datetime()

// Relationship
MATCH (from {id: $fromId})
MATCH (to {id: $toId})
MERGE (from)-[r:RELATIONSHIP_TYPE]->(to)
```

---

## Error Handling

```
Missing required field       → Generate if possible, else error
Invalid enum value          → Use closest match + warn
Invalid ID pattern          → Generate new ID + warn
Invalid relationship target → Skip relationship + warn
Ambiguous entity type       → Default to Application + warn
```

---

## Output Formats

### Bulk JSON
```json
{
  "entities": {
    "applications": [...],
    "capabilities": [...],
    "requirements": [...]
  },
  "relationships": [...]
}
```

### Individual Cypher
```cypher
MERGE (a:Application {id: 'APP-123'})
SET a.name = 'Customer Portal', ...
```

### CSV
```csv
entity_type,id,name,type,status
Application,APP-123,Customer Portal,Web Application,Active
```

---

## Tools & Validators

```bash
# Validate JSON against schema
ajv validate -s schemas/application.schema.json -d data.json

# Convert CSV to JSON (example)
python convert.py input.csv --schema application --output apps.json

# Bulk import to Neo4j
cypher-shell -u neo4j -p password < import.cypher
```

---

**See Also**:
- `AI_CONVERSION_GUIDE.md` - Detailed conversion instructions
- `schemas/` - JSON Schema validation files
- `DATA_SOURCES_AND_FORMATS.md` - Complete format reference

---

**Version**: 1.0
**Last Updated**: 2025-12-29
