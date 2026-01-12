# Live Graph Sample Queries

**For:** Neo4j Browser exploration of Super Relativity graph with MASTER-PATTERNS v2.0

**Updated:** 2026-01-09 (complete schema coverage)
**Total Queries:** 63 (covering all 10 node types and 13 relationship patterns)

---

## Quick Start Queries

### 1. Overview - What's in the Graph?

```cypher
// Count all nodes by label
MATCH (n)
RETURN labels(n)[0] AS nodeType, count(*) AS count
ORDER BY count DESC;
```

### 2. Overview - What relationships exist?

```cypher
// Count all relationships by type
MATCH ()-[r]->()
RETURN type(r) AS relationshipType, count(*) AS count
ORDER BY count DESC;
```

### 3. Data Source Separation Check

```cypher
// Verify LeanIX vs Diagram relationship separation
MATCH ()-[r]->()
RETURN
  CASE
    WHEN r.syncedAt IS NOT NULL THEN 'LeanIX (Business)'
    WHEN r.diagramFile IS NOT NULL THEN 'Diagrams (Technical)'
    ELSE 'Other'
  END as source,
  type(r) as relType,
  count(*) as count
ORDER BY source, count DESC;
```

**Expected**: Two clear groups - LeanIX and Diagrams with distinct relationship types

---

## Node Exploration Queries

### 4. All Applications

```cypher
MATCH (a:Application)
RETURN a.id, a.name, a.description, a.owner, a.status
ORDER BY a.name
LIMIT 20;
```

### 5. All Components

```cypher
MATCH (c:Component)
RETURN c.id, c.name, c.description, c.technology
ORDER BY c.name
LIMIT 20;
```

### 6. All APIs

```cypher
MATCH (api:API)
RETURN api.id, api.name, api.description, api.type
ORDER BY api.name;
```

### 7. All DataObjects (Databases, Tables, Caches)

```cypher
MATCH (d:DataObject)
RETURN d.id, d.name, d.type, d.description
ORDER BY d.type, d.name
LIMIT 20;
```

### 8. All Business Capabilities

```cypher
MATCH (bc:BusinessFunction)
RETURN bc.id, bc.name, bc.description
ORDER BY bc.name;
```

### 9. All Servers

```cypher
MATCH (s:Server)
RETURN s.id, s.name, s.environment, s.status
ORDER BY s.environment, s.name;
```

### 10. All Application Changes

```cypher
MATCH (ac:AppChange)
RETURN ac.id, ac.name, ac.changeType, ac.status, ac.priority, ac.plannedDate
ORDER BY ac.priority DESC, ac.plannedDate;
```

### 11. All Infrastructure Changes

```cypher
MATCH (ic:InfraChange)
RETURN ic.id, ic.name, ic.changeType, ic.status, ic.priority, ic.plannedDate
ORDER BY ic.priority DESC, ic.plannedDate;
```

---

## Relationship Pattern Queries (MASTER-PATTERNS v2.0)

### 12. Pattern 1: Application CALLS Application

```cypher
// Business-level application integration
MATCH (a1:Application)-[r:CALLS]->(a2:Application)
RETURN a1.name AS from, a2.name AS to, r.description, r.mode, r.syncedAt
ORDER BY a1.name
LIMIT 10;
```

### 13. Pattern 2: Component WORKS_ON DataObject

```cypher
// Technical data access patterns
MATCH (c:Component)-[r:WORKS_ON]->(d:DataObject)
RETURN
  c.name AS component,
  d.name AS dataObject,
  d.type AS dataType,
  r.rw AS accessType,
  r.mode AS mode,
  r.description
ORDER BY c.name, r.rw;
```

### 14. Pattern 3: Application IMPLEMENTS BusinessFunction

```cypher
// Applications realizing business capabilities
MATCH (a:Application)-[r:IMPLEMENTS]->(bc:BusinessFunction)
RETURN
  a.name AS application,
  bc.name AS capability,
  r.description,
  r.syncedAt
ORDER BY bc.name;
```

### 15. Pattern 4: API EXPOSES Component

```cypher
// APIs exposing internal components
MATCH (api:API)-[r:EXPOSES]->(c:Component)
RETURN
  api.name AS api,
  c.name AS component,
  r.description,
  r.diagramFile
ORDER BY api.name;
```

### 16. Pattern 5a: Application OWNS Component

```cypher
// Ownership relationships
MATCH (a:Application)-[r:OWNS]->(c:Component)
RETURN
  a.name AS application,
  c.name AS component,
  r.description,
  r.syncedAt
ORDER BY a.name;
```

### 17. Pattern 5b: Application OWNS BusinessFunction

```cypher
// Application ownership of business capabilities
MATCH (a:Application)-[r:OWNS]->(bc:BusinessFunction)
RETURN
  a.name AS application,
  bc.name AS capability,
  r.description,
  r.syncedAt
ORDER BY a.name;
```

### 18. Pattern 6: Component CALLS API

```cypher
// Component-to-API communication
MATCH (c:Component)-[r:CALLS]->(api:API)
RETURN
  c.name AS component,
  api.name AS api,
  r.description,
  r.mode,
  r.rw,
  r.diagramFile
ORDER BY c.name;
```

### 19. Pattern 7a: InfraChange CHANGES Server

```cypher
// Infrastructure change tracking
MATCH (ic:InfraChange)-[r:CHANGES]->(s:Server)
RETURN
  ic.name AS change,
  ic.changeType AS type,
  s.name AS server,
  s.environment AS env,
  r.description,
  r.syncedAt
ORDER BY ic.changeType, s.environment;
```

### 20. Pattern 7b: AppChange CHANGES Component

```cypher
// Application changes affecting components
MATCH (ac:AppChange)-[r:CHANGES]->(c:Component)
RETURN
  ac.name AS change,
  ac.changeType AS type,
  ac.status AS status,
  c.name AS component,
  r.description,
  r.syncedAt
ORDER BY ac.priority DESC, ac.status;
```

### 21. Pattern 7c: AppChange CHANGES BusinessFunction

```cypher
// Application changes affecting business capabilities
MATCH (ac:AppChange)-[r:CHANGES]->(bc:BusinessFunction)
RETURN
  ac.name AS change,
  ac.changeType AS type,
  bc.name AS capability,
  r.description,
  r.syncedAt
ORDER BY ac.priority DESC;
```

### 22. Pattern 7d: AppChange CHANGES DataObject

```cypher
// Application changes affecting data objects
MATCH (ac:AppChange)-[r:CHANGES]->(d:DataObject)
RETURN
  ac.name AS change,
  ac.changeType AS type,
  d.name AS dataObject,
  d.type AS dataType,
  r.description,
  r.syncedAt
ORDER BY ac.priority DESC;
```

### 23. Pattern 8: Component INSTALLED_ON Server

```cypher
// Component deployment on infrastructure (CORRECTED DIRECTION)
MATCH (c:Component)-[r:INSTALLED_ON]->(s:Server)
RETURN
  c.name AS component,
  s.name AS server,
  s.environment AS env,
  r.syncedAt
ORDER BY s.environment, s.name;
```

### 24. Pattern 9: Container CONTAINS Component

```cypher
// Containment hierarchy (from diagrams)
MATCH (container:Application)-[r:CONTAINS]->(c:Component)
WHERE r.diagramFile IS NOT NULL
RETURN
  container.name AS container,
  c.name AS component,
  r.description,
  r.diagramFile
ORDER BY container.name;
```

### 25. Pattern 10a: API WORKS_ON DataObject

```cypher
// API data access patterns
MATCH (api:API)-[r:WORKS_ON]->(d:DataObject)
RETURN
  api.name AS api,
  d.name AS dataObject,
  d.type AS dataType,
  r.rw AS accessType,
  r.description,
  r.diagramFile
ORDER BY api.name, r.rw;
```

### 26. Pattern 10b: BusinessFunction WORKS_ON DataObject

```cypher
// Business capability data access patterns
MATCH (bc:BusinessFunction)-[r:WORKS_ON]->(d:DataObject)
RETURN
  bc.name AS capability,
  d.name AS dataObject,
  d.type AS dataType,
  r.rw AS accessType,
  r.description
ORDER BY bc.name, r.rw;
```

### 27. Pattern 11a: BusinessFunction RELATES BusinessFunction

```cypher
// Business capability interactions
MATCH (bc1:BusinessFunction)-[r:RELATES]->(bc2:BusinessFunction)
RETURN
  bc1.name AS from,
  bc2.name AS to,
  r.mode AS interactionMode,
  r.description,
  r.diagramFile
ORDER BY bc1.name;
```

### 28. Pattern 11b: Application RELATES Application

```cypher
// Application-to-application relationships
MATCH (a1:Application)-[r:RELATES]->(a2:Application)
RETURN
  a1.name AS from,
  a2.name AS to,
  r.mode AS interactionMode,
  r.description,
  r.syncedAt
ORDER BY a1.name;
```

### 29. Pattern 11c: Component RELATES Component

```cypher
// Component dependencies and relationships
MATCH (c1:Component)-[r:RELATES]->(c2:Component)
RETURN
  c1.name AS from,
  c2.name AS to,
  r.description,
  r.diagramFile
ORDER BY c1.name;
```

### 30. Pattern 12: Component IMPLEMENTS BusinessFunction

```cypher
// Components implementing business capabilities
MATCH (c:Component)-[r:IMPLEMENTS]->(bc:BusinessFunction)
RETURN
  c.name AS component,
  c.technology AS technology,
  bc.name AS capability,
  r.description
ORDER BY bc.name, c.name;
```

### 31. Pattern 13: BusinessFunction INCLUDES API

```cypher
// Business capabilities including APIs
MATCH (bc:BusinessFunction)-[r:INCLUDES]->(api:API)
RETURN
  bc.name AS capability,
  api.name AS api,
  r.description,
  r.diagramFile
ORDER BY bc.name;
```

---

## Data Quality Verification Queries

### 32. Check for Missing RW on WORKS_ON

```cypher
// All WORKS_ON relationships MUST have rw property
MATCH ()-[r:WORKS_ON]->()
WHERE r.rw IS NULL
RETURN
  startNode(r).name AS from,
  endNode(r).name AS to,
  r.description,
  'MISSING RW PROPERTY' AS issue;
```

**Expected**: 0 results (no missing rw properties)

### 33. Check for Invalid Mode Values

```cypher
// Mode must be pushes, pulls, or bidirectional
MATCH ()-[r]->()
WHERE r.mode IS NOT NULL
  AND NOT r.mode IN ['pushes', 'pulls', 'bidirectional']
RETURN
  type(r) AS relType,
  r.mode AS invalidMode,
  count(*) AS violations
ORDER BY violations DESC;
```

**Expected**: 0 results (no invalid modes)

### 34. Check for Missing Source Attribution

```cypher
// Every relationship should have either syncedAt or diagramFile
MATCH ()-[r]->()
WHERE r.syncedAt IS NULL AND r.diagramFile IS NULL
RETURN
  type(r) AS relType,
  startNode(r).name AS from,
  endNode(r).name AS to,
  'MISSING SOURCE ATTRIBUTION' AS issue
LIMIT 20;
```

**Expected**: Should only show base schema relationships (if any)

### 35. Orphaned Nodes (No Relationships)

```cypher
// Find nodes with no incoming or outgoing relationships
MATCH (n)
WHERE NOT (n)--()
RETURN labels(n)[0] AS nodeType, n.id, n.name
ORDER BY nodeType, n.name
LIMIT 20;
```

---

## Business Analysis Queries

### 36. Application Dependency Map

```cypher
// What does a specific application depend on?
MATCH (a:Application {id: 'APP-123'})-[r]->(target)
RETURN
  a.name AS application,
  type(r) AS relationship,
  labels(target)[0] AS targetType,
  target.name AS targetName,
  r.description
ORDER BY type(r), targetName;
```

### 37. Impact Analysis - What Uses This DataObject?

```cypher
// Find all components/APIs that access a specific data object
MATCH (source)-[r:WORKS_ON]->(d:DataObject {name: 'CustomerTable'})
RETURN
  labels(source)[0] AS sourceType,
  source.name AS sourceName,
  r.rw AS accessType,
  r.mode AS mode,
  r.description
ORDER BY sourceType, r.rw;
```

### 38. Application Technology Stack

```cypher
// What components and their technologies make up an application?
MATCH (a:Application {id: 'APP-123'})-[:OWNS]->(c:Component)
RETURN
  a.name AS application,
  c.name AS component,
  c.technology AS technology,
  c.description
ORDER BY c.name;
```

### 39. Cross-Application API Calls

```cypher
// Find all cross-application API communications
MATCH (app1:Application)-[:OWNS]->(c:Component)-[call:CALLS]->(api:API)<-[:OWNS]-(app2:Application)
WHERE app1.id <> app2.id
RETURN
  app1.name AS fromApp,
  c.name AS fromComponent,
  api.name AS apiCalled,
  app2.name AS toApp,
  call.mode AS mode,
  call.description
ORDER BY app1.name, app2.name;
```

### 40. Business Capability Fulfillment

```cypher
// Which applications implement each business capability?
MATCH (bc:BusinessFunction)<-[:IMPLEMENTS]-(a:Application)
RETURN
  bc.name AS capability,
  collect(a.name) AS implementingApplications,
  count(a) AS appCount
ORDER BY appCount DESC, bc.name;
```

### 41. Environment-based Server Distribution

```cypher
// How are applications distributed across environments?
MATCH (s:Server)-[:INSTALLED_ON]->(a:Application)
RETURN
  s.environment AS environment,
  a.name AS application,
  count(s) AS serverCount
ORDER BY environment, application;
```

---

## Technical Architecture Queries

### 42. Data Access Patterns by Type

```cypher
// Breakdown of read vs write vs read-write access
MATCH ()-[r:WORKS_ON]->(:DataObject)
RETURN
  r.rw AS accessPattern,
  count(*) AS count
ORDER BY count DESC;
```

### 43. API Integration Modes

```cypher
// How are APIs being called? (push vs pull vs bidirectional)
MATCH ()-[r:CALLS]->(:API)
RETURN
  r.mode AS callMode,
  count(*) AS count
ORDER BY count DESC;
```

### 44. Component Complexity (Relationship Count)

```cypher
// Which components have the most connections?
MATCH (c:Component)
OPTIONAL MATCH (c)-[r]-()
RETURN
  c.name AS component,
  c.technology AS technology,
  count(r) AS relationshipCount
ORDER BY relationshipCount DESC
LIMIT 10;
```

### 45. Find All Paths Between Two Applications

```cypher
// How are two applications connected?
MATCH path = shortestPath(
  (a1:Application {id: 'APP-123'})-[*..5]-(a2:Application {id: 'APP-456'})
)
RETURN
  [node IN nodes(path) | labels(node)[0] + ': ' + node.name] AS path,
  length(path) AS hops;
```

### 46. Diagram Coverage Analysis

```cypher
// Which components are documented in diagrams?
MATCH (c:Component)
OPTIONAL MATCH (c)-[r]-()
WHERE r.diagramFile IS NOT NULL
WITH c, count(DISTINCT r.diagramFile) AS diagramCount
RETURN
  c.name AS component,
  CASE
    WHEN diagramCount > 0 THEN 'Documented'
    ELSE 'Undocumented'
  END AS status,
  diagramCount AS diagrams
ORDER BY diagramCount DESC, c.name;
```

---

## Debugging Queries

### 47. Relationship Properties Inspection

```cypher
// See all properties on relationships of a specific type
MATCH ()-[r:WORKS_ON]->()
RETURN
  type(r) AS relType,
  keys(r) AS properties,
  r.mode AS mode,
  r.rw AS rw,
  r.syncedAt AS fromLeanIX,
  r.diagramFile AS fromDiagram,
  count(*) AS count
ORDER BY count DESC
LIMIT 10;
```

### 48. Node Properties Inspection

```cypher
// See what properties exist on Application nodes
MATCH (a:Application)
RETURN
  a.id,
  a.name,
  keys(a) AS allProperties,
  a.source AS source,
  a.diagramFile AS fromDiagram,
  a.syncedAt AS fromLeanIX
LIMIT 10;
```

### 49. Find Diagram-Sourced Entities

```cypher
// What entities were created from diagram parsing?
MATCH (n)
WHERE n.diagramFile IS NOT NULL
RETURN
  labels(n)[0] AS nodeType,
  n.name AS name,
  n.diagramFile AS sourceFile,
  n.elementType AS c4ElementType
ORDER BY n.diagramFile, nodeType;
```

### 50. Find LeanIX-Sourced Entities

```cypher
// What entities were synced from LeanIX?
MATCH (n)
WHERE n.syncedAt IS NOT NULL
RETURN
  labels(n)[0] AS nodeType,
  n.id AS id,
  n.name AS name,
  n.syncedAt AS syncTime
ORDER BY n.syncedAt DESC
LIMIT 20;
```

### 51. Relationship Type Distribution by Source

```cypher
// Which relationship types come from which sources?
MATCH ()-[r]->()
WITH
  type(r) AS relType,
  CASE
    WHEN r.syncedAt IS NOT NULL THEN 'LeanIX'
    WHEN r.diagramFile IS NOT NULL THEN 'Diagrams'
    ELSE 'Other'
  END AS source
RETURN relType, source, count(*) AS count
ORDER BY relType, source;
```

---

## Visualization Queries (for Neo4j Browser)

### 52. Visualize Application and Its Components

```cypher
// Show an application with all its components and data objects
MATCH path = (a:Application {id: 'APP-123'})-[:OWNS]->(c:Component)-[:WORKS_ON]->(d:DataObject)
RETURN path
LIMIT 50;
```

### 53. Visualize API Communication Layer

```cypher
// Show all APIs and what calls them
MATCH path = (c:Component)-[:CALLS]->(api:API)
RETURN path
LIMIT 30;
```

### 54. Visualize Business Capability Implementation

```cypher
// Show business capabilities and implementing applications
MATCH path = (a:Application)-[:IMPLEMENTS]->(bc:BusinessFunction)
RETURN path;
```

### 55. Visualize Infrastructure Changes

```cypher
// Show infrastructure changes and affected servers with deployed components
MATCH (ic:InfraChange)-[:CHANGES]->(s:Server)
OPTIONAL MATCH path = (c:Component)-[:INSTALLED_ON]->(s)
RETURN ic, s, path
LIMIT 20;
```

### 56. Visualize Complete Application Context (C4 Context Level)

```cypher
// Show an application with all its direct relationships
MATCH (a:Application {id: 'APP-123'})
OPTIONAL MATCH path1 = (a)-[r1]-(related)
WHERE type(r1) IN ['CALLS', 'IMPLEMENTS', 'OWNS']
RETURN a, path1
LIMIT 100;
```

---

## Performance Queries

### 57. Index Verification

```cypher
// Check what indexes exist
CALL db.indexes() YIELD name, type, labelsOrTypes, properties, state
RETURN name, type, labelsOrTypes, properties, state;
```

### 58. Constraint Verification

```cypher
// Check what constraints exist
CALL db.constraints() YIELD name, type, labelsOrTypes, properties
RETURN name, type, labelsOrTypes, properties;
```

### 59. Database Statistics

```cypher
// Overall graph statistics
CALL apoc.meta.stats() YIELD nodeCount, relCount, labelCount, relTypeCount
RETURN nodeCount, relCount, labelCount, relTypeCount;
```

---

## Custom Analysis Templates

### 60. Template: Find Entity by Name (Fuzzy Search)

```cypher
// Search for entities with name containing keyword
MATCH (n)
WHERE toLower(n.name) CONTAINS toLower('customer')
RETURN
  labels(n)[0] AS type,
  n.id AS id,
  n.name AS name,
  n.description AS description
ORDER BY type, name
LIMIT 20;
```

### 61. Template: Trace Data Lineage

```cypher
// Follow data from source to consumers
MATCH path = (source)-[:WORKS_ON*1..3]->(d:DataObject)<-[:WORKS_ON]-(consumer)
WHERE source.id = 'COMP-001'
RETURN
  source.name AS dataSource,
  [node IN nodes(path) | node.name] AS lineage,
  consumer.name AS dataConsumer,
  length(path) AS steps
ORDER BY steps;
```

---

## Tips for Using These Queries

1. **In Neo4j Browser**: Copy-paste queries directly into the query editor at `http://localhost:7474`

2. **Parameter Substitution**: Replace hardcoded IDs like `'APP-123'` with your actual entity IDs

3. **Limit Results**: Use `LIMIT` clause to prevent overwhelming results on large graphs

4. **Visualization**: Queries returning `path` or `RETURN a, b, c` will show graph visualization in Neo4j Browser

5. **Export Results**: Use the download button in Neo4j Browser to export query results as CSV/JSON

6. **Performance**: For large graphs, ensure indexes exist on frequently queried properties (id, name)

7. **Chaining Queries**: Combine patterns from different queries to answer complex questions

8. **Schema Reference**: See `GRAPH-SCHEMA-REFERENCE.md` for complete node types and relationship patterns

---

**Query Count**: 63 queries (updated with all node types and relationship patterns)

**Last Updated**: 2026-01-09
**Graph Schema**: MASTER-PATTERNS v2.0
**Data Sources**: LeanIX (business) + Diagrams (technical)
**Node Types Covered**: 8 types (Application, Component, API, DataObject, BusinessFunction, Server, AppChange, InfraChange)
**Relationship Patterns Covered**: 13 patterns (OWNS, CALLS, IMPLEMENTS, EXPOSES, INCLUDES, WORKS_ON, CHANGES, INSTALLED_ON, CONTAINS, RELATES)
