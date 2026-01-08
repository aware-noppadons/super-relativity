# Master Relationship Patterns - Official Reference

**Last Updated**: 2026-01-08
**Status**: Source of Truth
**Purpose**: This document defines the ONLY allowed relationship patterns in the Super Relativity Neo4j database.

---

## Overview

The Super Relativity database uses a **simplified schema** with:
- **9 allowed node types**
- **11 specific relationship types** (CALLS, OWNS, EXPOSES, WORKS_ON, IMPLEMENTS, INCLUDES, CHANGES, MATERIALIZES, INSTALLED_ON, RELATES, CONTAINS)
- **Multiple relationship patterns** (defined below)
- **Semantic properties** on relationships (mode, rw, etc.)

All relationships use specific relationship types with optional properties to distinguish behavior and data access patterns.

---

## Core Principles

### 🚨 WHITELIST APPROACH - CRITICAL

**Only patterns explicitly defined in this document are allowed. Everything else is automatically disallowed.**

This means:
- ✅ If a relationship pattern is documented below → **ALLOWED**
- ❌ If a relationship pattern is NOT documented below → **DISALLOWED** (even if it seems logical)

**Enforcement:**
- Sync service MUST reject any pattern not in this document
- Cleanup scripts MUST remove any pattern not in this document
- Sample data MUST only use patterns from this document

**No Exceptions:** When in doubt, the pattern is disallowed unless explicitly listed below.

---

## The 9 Allowed Node Types

1. **Application** - Software applications
2. **API** - API endpoints (REST, GraphQL, etc.)
3. **BusinessFunction** - Business capabilities/functions
4. **Component** - Software components (services, modules, libraries)
5. **DataObject** - Logical data entities
6. **Table** - Physical database tables
7. **Server** - Physical/virtual servers
8. **AppChange** - Application change requests/tickets
9. **InfraChange** - Infrastructure change requests/tickets

---

## The 11 Relationship Patterns

### Pattern 1: Application Relationships

**Application** can connect to:
- **Application** (mode: `relates`) - Application integrates with another application
- **API** (mode: `calls`) - Application calls an API (may not need if we can identify which component in App A call API of App B)
- **BusinessFunction** (mode: `owns`) - Application owns/provides a business function
- **Component** (mode: `owns`) - Application owns/contains a component

**Direction**: Application → [Application | API | BusinessFunction | Component]

**NOT ALLOWED**: Application → DataObject, AppChange, Table, Server, InfraChange

```cypher
// Example
(app:Application)-[:CALLS {mode: 'pushes'|'pulls', rw: 'reads'|'writes'|'read-n-writes'}]->(api:API)
(app:Application)-[:OWNS]->(bf:BusinessFunction)
```

---

### Pattern 2: API Relationships (Bidirectional with Component)

**API** can connect to:
- **Component** (mode: `exposes`) - API exposes a component
- **DataObject** (mode: `works_on`) - API works on/manipulates data

**Component** can connect to:
- **API** (mode: `calls`) - Component calls an API

**Direction**:
- API → Component (exposes)
- API → DataObject (works_on)
- Component → API (calls)

**NOT ALLOWED**: API → Application, AppChange, InfraChange, BusinessFunction, Table, Server

```cypher
// Bidirectional relationship
(api:API)-[:EXPOSES]->(comp:Component)
(comp:Component)-[:CALLS {mode: 'pushes'|'pulls', rw: 'reads'|'writes'|'read-n-writes'}]->(api:API)

// Data access
(api:API)-[:WORKS_ON {rw: 'reads'|'writes'}]->(data:DataObject)
```

---

### Pattern 3: Component implements BusinessFunction

**Component** can connect to:
- **BusinessFunction** (mode: `implements`) - Component implements a business function

**Direction**: Component → BusinessFunction
**Direction**: Component → DataObject

```cypher
// BusinessFunction
(comp:Component)-[:IMPLEMENTS]->(bf:BusinessFunction)
```

---

### Pattern 4: BusinessFunction includes API

**BusinessFunction** can connect to:
- **API** (mode: `includes`) - Business function includes/uses an API (via Component implementing it)

**Direction**: BusinessFunction → API

```cypher
(bf:BusinessFunction)-[:INCLUDES]->(api:API)
```

---

### Pattern 5: AppChange relates to App-level entities

**AppChange** can connect to:
- **Component** (mode: `relates`) - Change impacts a component
- **BusinessFunction** (mode: `relates`) - Change impacts a business function
- **DataObject** (mode: `relates`) - Change impacts data

**Direction**: AppChange → [Component | BusinessFunction | DataObject]

**NOT ALLOWED**: AppChange → Application, API, Table, Server, InfraChange

```cypher
(ac:AppChange)-[:CHANGES]->(comp:Component)
(ac:AppChange)-[:CHANGES]->(bf:BusinessFunction)
(ac:AppChange)-[:CHANGES]->(data:DataObject)
```

---

### Pattern 6: Table materializes DataObject

**Table** can connect to:
- **DataObject** (mode: `materializes`) - Physical table materializes logical data

**Direction**: Table → DataObject

**NOT ALLOWED**: Table → any other node type

```cypher
(tbl:Table)-[:MATERIALIZES]->(data:DataObject)
```

---

### Pattern 7: Component installs on Server

**Component** can connect to:
- **Server** (mode: `installs_on`) - Component is deployed/installed on server

**Direction**: Component → Server

```cypher
(comp:Component)-[:INSTALLED_ON]->(srv:Server)
```

---

### Pattern 8: InfraChange relates to Server

**InfraChange** can connect to:
- **Server** (mode: `relates`) - Infrastructure change impacts a server

**Direction**: InfraChange → Server

**NOT ALLOWED**: InfraChange → any other node type

```cypher
(ic:InfraChange)-[:CHANGES]->(srv:Server)
```

---

### Pattern 9: Component relates to Component

**Component** can connect to:
- **Component** (mode: `uses`) - Component uses/depends on another component
- **Component** (mode: `contains`) - Component contains another component

**Direction**: Component → Component

**Allowed Modes**: `uses`, `contains`

```cypher
(c1:Component)-[:RELATES]->(c2:Component)
(c1:Component)-[:CONTAINS]->(c2:Component)
```

---

### Pattern 10: Component/BusinessFunction use DataObject

**Component** can connect to:
- **DataObject** (mode: `use`) - Component reads/writes data

**BusinessFunction** can connect to:
- **DataObject** (mode: `use`) - Business function uses data

**Direction**:
- Component → DataObject
- BusinessFunction → DataObject

```cypher
(comp:Component)-[:WORKS_ON {rw: 'reads'|'writes'|'read-n-writes'}]->(data:DataObject)
(bf:BusinessFunction)-[:WORKS_ON {rw: 'reads'|'writes'|'read-n-writes'}]->(data:DataObject)
```

---

### Pattern 11: BusinessFunction relates to BusinessFunction

**BusinessFunction** can connect to:
- **BusinessFunction** (mode: `relates`) - Function relates to another function (hierarchy, dependency, etc.)

**Direction**: BusinessFunction → BusinessFunction

**Allowed Modes**: `relates` ONLY (NOT `contains`)

```cypher
(bf1:BusinessFunction)-[:RELATES {mode: 'pushes'|'pulls'}]->(bf2:BusinessFunction)
```

---

## Pattern Summary Table

| Pattern | From | To | Relationship Type | Properties | Bidirectional? |
|---------|------|-----|-------------------|------------|----------------|
| 1 | Application | Application | `RELATES` | - | No |
| 1 | Application | API | `CALLS` | mode, rw | No |
| 1 | Application | BusinessFunction | `OWNS` | - | No |
| 1 | Application | Component | `OWNS` | - | No |
| 2 | API | Component | `EXPOSES` | - | Yes (Component→API: `CALLS`) |
| 2 | API | DataObject | `WORKS_ON` | rw | No |
| 2 | Component | API | `CALLS` | mode, rw | Part of bidirectional |
| 3 | Component | BusinessFunction | `IMPLEMENTS` | - | No |
| 4 | BusinessFunction | API | `INCLUDES` | - | No |
| 5 | AppChange | Component | `CHANGES` | - | No |
| 5 | AppChange | BusinessFunction | `CHANGES` | - | No |
| 5 | AppChange | DataObject | `CHANGES` | - | No |
| 6 | Table | DataObject | `MATERIALIZES` | - | No |
| 7 | Component | Server | `INSTALLED_ON` | - | No |
| 8 | InfraChange | Server | `CHANGES` | - | No |
| 9 | Component | Component | `RELATES` | - | No |
| 9 | Component | Component | `CONTAINS` | - | No |
| 10 | Component | DataObject | `WORKS_ON` | rw | No |
| 10 | BusinessFunction | DataObject | `WORKS_ON` | rw | No |
| 11 | BusinessFunction | BusinessFunction | `RELATES` | mode | No |

---

## Disallowed Patterns

### Server Relationships
- ❌ **Server CANNOT have outgoing relationships**
- ✅ Server can only RECEIVE relationships (from Component, InfraChange)

### DataObject Relationships
- ❌ **DataObject CANNOT have outgoing relationships**
- ✅ DataObject can only RECEIVE relationships (from API, Component, BusinessFunction, Table, AppChange)

### Application Restrictions
- ❌ Application → DataObject
- ❌ Application → AppChange
- ❌ Application → Table
- ❌ Application → Server
- ❌ Application → InfraChange

### API Restrictions
- ❌ API → Application
- ❌ API → BusinessFunction
- ❌ API → AppChange
- ❌ API → InfraChange
- ❌ API → Table
- ❌ API → Server

### Table Restrictions
- ❌ Table → anything except DataObject

### InfraChange Restrictions
- ❌ InfraChange → anything except Server

---

## Enforcement Strategy

### 1. Schema Level (Database Initialization)
- Unique ID constraints on all node types
- Performance indexes on commonly queried fields
- Schema enforced during initial database setup

### 2. Application Level (Synchronization Service)
- **CRITICAL**: Sync service MUST validate all relationships before creation
- `validateAndMapRelationship()` function MUST enforce these patterns
- MUST reject disallowed patterns with warnings
- MUST use correct relationship types (CALLS, OWNS, etc.) not generic RELATED_TO
- MUST validate relationship properties (mode, rw) match pattern requirements

### 3. Cleanup Scripts (Post-Import Validation)
- `99-strict-cleanup.cypher` - Removes violations after external imports
- Run manually after syncing data from sources that don't follow patterns
- **NOTE**: Cleanup script needs updating to handle new relationship types

---

## Relationship Properties

### Required Properties by Relationship Type

**CALLS** (Application→API, Component→API):
- **mode** (string): Direction of data flow - `'pushes'` or `'pulls'`
- **rw** (string): Data access pattern - `'reads'`, `'writes'`, or `'read-n-writes'`

**RELATES** (BusinessFunction→BusinessFunction):
- **mode** (string): Direction of data flow - `'pushes'` or `'pulls'`

**WORKS_ON** (API→DataObject, Component→DataObject, BusinessFunction→DataObject):
- **rw** (string): Data access pattern - `'reads'`, `'writes'`, or `'read-n-writes'`

**All Relationship Types**:
- **description** (string, optional): Human-readable explanation
- **syncedAt** (datetime, optional): Last sync timestamp
- **metadata** (object, optional): Additional contextual data

**Relationship Types without Required Properties**:
- OWNS, EXPOSES, IMPLEMENTS, INCLUDES, CHANGES, MATERIALIZES, INSTALLED_ON, CONTAINS
- These use only optional properties (description, syncedAt, metadata)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 2.0 | 2026-01-08 | **BREAKING**: Changed from single RELATED_TO with mode to 11 specific relationship types (CALLS, OWNS, EXPOSES, etc.). Added property requirements. Renamed to "Master Patterns" to allow pattern evolution. |
| 1.0 | 2026-01-08 | Initial official reference with clarifications |

---

## Future Updates

**CRITICAL**: When adding/modifying/deleting patterns, you MUST update ALL enforcement layers:

1. **Source of Truth**: Update this `MASTER-PATTERNS.md` document first
2. **Sync Service Validation**: Update `validateAndMapRelationship()` in `poc-services/sync-service/server.js`
   - Add/modify relationship type mappings
   - Add/modify property validation
   - Update allowed pattern checks
3. **Sample Data**: Update `02-sample-data.cypher` with examples of new patterns
4. **Cleanup Scripts**: Update `99-strict-cleanup.cypher` to handle new patterns
5. **Schema Files**: Update `01-schema-only.cypher` if constraints/indexes needed
6. **Testing**: Rebuild database and test both initialization AND synchronization

---

## References

- **This Document**: `MASTER-PATTERNS.md` - Source of truth for all relationship patterns
- **Schema File**: `01-schema-only.cypher` - Database constraints and indexes
- **Sample Data**: `02-sample-data.cypher` - Reference implementation of patterns
- **Sync Service**: `poc-services/sync-service/server.js` - Runtime validation and mapping
- **Cleanup Script**: `99-strict-cleanup.cypher` - Post-import validation (needs update for v2.0)
