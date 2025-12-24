# Super Relativity - Sample Cypher Queries

## Overview

This document provides sample Neo4j Cypher queries for exploring the complete enterprise architecture graph, including:
- **Business Capabilities** → **Requirements** → **Applications** → **Data Objects**
- Application-to-Application relationships
- Impact analysis queries
- Data lineage queries

## Current Data Model

### Node Types
- **BusinessCapability** (8 nodes) - Business functions and capabilities
- **Requirement** (5 nodes) - Business and technical requirements
- **Application** (10 nodes) - Software applications and services
- **DataObject** (12 nodes) - Database tables and data stores

### Relationship Types
- **SUPPORTS** (5 relationships) - Requirement supports BusinessCapability
- **IMPLEMENTED_BY** (8 relationships) - Requirement implemented by Application
- **DEPENDS_ON** (6 relationships) - Application depends on another Application
- **USES** (13 relationships) - Application uses DataObject
- **REQUIRES** (6 relationships) - Application requires something
- **CALLS** (1 relationship) - Application calls another Application
- **REQUIRES_DATA** (27 relationships) - BusinessCapability requires DataObject
- **HAS_COMPONENT** (8 relationships) - Application has Component
- **MODIFIES** (4 relationships) - Component modifies DataObject
- **READS** (8 relationships) - Component reads DataObject

---

## 1. Full Enterprise Architecture View

### View Complete Graph (All Entities and Relationships)

```cypher
// View everything - use carefully on large datasets
MATCH (n)-[r]-(m)
RETURN n, r, m
LIMIT 100
```

### View by Entity Type

```cypher
// View Business Capabilities
MATCH (c:BusinessCapability)
RETURN c.name, c.level, c.criticality, c.owner
ORDER BY c.level, c.name

// View Requirements
MATCH (r:Requirement)
RETURN r.name, r.type, r.priority, r.status
ORDER BY r.priority DESC, r.name

// View Applications
MATCH (a:Application)
RETURN a.name, a.type, a.businessCriticality, a.lifecycle
ORDER BY a.businessCriticality DESC, a.name

// View Data Objects
MATCH (d:DataObject)
RETURN d.name, d.type, d.sensitivity, d.recordCount
ORDER BY d.sensitivity DESC, d.name
```

---

## 2. Business Capability to Application Mapping

### Full Capability → Requirement → Application Chain

```cypher
// View complete business capability implementation chain
MATCH (cap:BusinessCapability)<-[:SUPPORTS]-(req:Requirement)-[:IMPLEMENTED_BY]->(app:Application)
RETURN cap.name as Capability,
       cap.criticality as Criticality,
       req.name as Requirement,
       req.priority as Priority,
       app.name as Application,
       app.businessCriticality as AppCriticality
ORDER BY cap.name, req.priority DESC
```

### Capability Implementation Overview

```cypher
// Show which capabilities are supported by which applications
MATCH (cap:BusinessCapability)<-[:SUPPORTS]-(req:Requirement)-[:IMPLEMENTED_BY]->(app:Application)
WITH cap, collect(DISTINCT app.name) as Applications, count(DISTINCT req) as RequirementCount
RETURN cap.name as Capability,
       cap.criticality as Criticality,
       RequirementCount,
       Applications
ORDER BY cap.criticality DESC, RequirementCount DESC
```

### Find Unsupported Capabilities

```cypher
// Find business capabilities with no requirements or applications
MATCH (cap:BusinessCapability)
WHERE NOT (cap)<-[:SUPPORTS]-()
RETURN cap.name as UnmappedCapability,
       cap.criticality as Criticality,
       cap.owner as Owner
ORDER BY cap.criticality DESC
```

---

## 3. Application to Data Model Mapping

### Applications and Their Data Objects

```cypher
// View which applications use which data objects
MATCH (app:Application)-[:USES]->(data:DataObject)
RETURN app.name as Application,
       app.type as ApplicationType,
       data.name as DataObject,
       data.type as DataType,
       data.sensitivity as Sensitivity
ORDER BY app.name, data.sensitivity DESC
```

### Data Sensitivity Analysis

```cypher
// Find applications that handle PII data
MATCH (app:Application)-[:USES]->(data:DataObject {sensitivity: 'PII'})
WITH app, collect(data.name) as PIIData
RETURN app.name as Application,
       app.businessCriticality as Criticality,
       size(PIIData) as PIITableCount,
       PIIData
ORDER BY PIITableCount DESC
```

### Data Object Usage

```cypher
// Find most used data objects
MATCH (data:DataObject)<-[:USES]-(app:Application)
WITH data, collect(app.name) as Applications, count(app) as AppCount
RETURN data.name as DataObject,
       data.type as Type,
       data.sensitivity as Sensitivity,
       AppCount,
       Applications
ORDER BY AppCount DESC, data.sensitivity DESC
```

### Orphaned Data Objects

```cypher
// Find data objects not used by any application
MATCH (data:DataObject)
WHERE NOT ()-[:USES]->(data)
RETURN data.name as UnusedDataObject,
       data.type as Type,
       data.database as Database,
       data.sensitivity as Sensitivity
ORDER BY data.sensitivity DESC
```

---

## 4. Business Capability to Data Object Mapping

### View Business Capabilities and Their Required Data

```cypher
// Show which data objects are required by each business capability
MATCH (cap:BusinessCapability)-[:REQUIRES_DATA]->(data:DataObject)
RETURN cap.name as Capability,
       cap.criticality as Criticality,
       collect(data.name) as RequiredData,
       count(data) as DataObjectCount
ORDER BY cap.criticality DESC, DataObjectCount DESC
```

**Example Results:**
| Capability | Criticality | RequiredData | DataObjectCount |
|------------|-------------|--------------|-----------------|
| Analytics & Business Intelligence | Medium | [TransactionTable, ApplicationTable, CustomerTable, AnalyticsDataWarehouse] | 4 |
| Risk Assessment & Fraud Detection | Critical | [FraudScoresTable, CustomerTable, ApplicationTable, TransactionTable] | 4 |
| Application Processing | Critical | [NotificationQueue, FraudScoresTable, CustomerTable, ApplicationTable] | 4 |

### Data Criticality by Business Capability

```cypher
// Find critical data objects based on capability usage
MATCH (cap:BusinessCapability)-[:REQUIRES_DATA]->(data:DataObject)
WHERE cap.criticality = 'Critical'
WITH data, collect(cap.name) as CriticalCapabilities, count(cap) as CriticalCapCount
RETURN data.name as DataObject,
       data.sensitivity as Sensitivity,
       CriticalCapCount,
       CriticalCapabilities
ORDER BY CriticalCapCount DESC, data.sensitivity DESC
```

### PII Data Usage by Business Capabilities

```cypher
// Find which business capabilities require PII data
MATCH (cap:BusinessCapability)-[:REQUIRES_DATA]->(data:DataObject)
WHERE data.sensitivity = 'PII'
RETURN cap.name as Capability,
       cap.criticality as Criticality,
       collect(data.name) as PIIData,
       count(data) as PIIDataCount
ORDER BY PIIDataCount DESC
```

### Business Capability Data Dependency

```cypher
// Full view of capability data dependencies with sensitivity
MATCH (cap:BusinessCapability)-[:REQUIRES_DATA]->(data:DataObject)
RETURN cap.name as Capability,
       cap.criticality as CapabilityCriticality,
       data.name as DataObject,
       data.type as DataType,
       data.sensitivity as Sensitivity,
       data.database as Database
ORDER BY cap.name, data.sensitivity DESC
```

### Find Shared Data Across Capabilities

```cypher
// Find data objects required by multiple business capabilities
MATCH (data:DataObject)<-[:REQUIRES_DATA]-(cap:BusinessCapability)
WITH data, collect(cap.name) as Capabilities, count(cap) as CapabilityCount
WHERE CapabilityCount > 1
RETURN data.name as SharedDataObject,
       data.sensitivity as Sensitivity,
       CapabilityCount,
       Capabilities
ORDER BY CapabilityCount DESC, data.sensitivity DESC
```

**Example Results:**
| SharedDataObject | Sensitivity | CapabilityCount | Capabilities |
|------------------|-------------|-----------------|--------------|
| CustomerTable | PII | 6 | [Customer Onboarding, Application Processing, Customer Service, Payment Processing, Risk Assessment, Compliance] |
| ApplicationTable | Standard | 4 | [Application Processing, Customer Service, Risk Assessment, Analytics] |

### Capability Impact Analysis by Data

```cypher
// If a data object fails, which capabilities are impacted?
MATCH (data:DataObject {name: 'CustomerTable'})<-[:REQUIRES_DATA]-(cap:BusinessCapability)
RETURN data.name as DataObject,
       data.sensitivity as Sensitivity,
       collect(cap.name) as ImpactedCapabilities,
       count(cap) as ImpactRadius
```

### Business Capability to Data Visualization

```cypher
// Visualize complete capability-to-data mapping
MATCH (cap:BusinessCapability)-[:REQUIRES_DATA]->(data:DataObject)
RETURN cap, data
ORDER BY cap.name
LIMIT 50
```

---

## 5. End-to-End Traceability

### Business Capability → Application → Data (Complete Chain)

```cypher
// Full traceability: Capability to data objects
MATCH path = (cap:BusinessCapability)<-[:SUPPORTS]-(req:Requirement)-[:IMPLEMENTED_BY]->(app:Application)-[:USES]->(data:DataObject)
RETURN cap.name as BusinessCapability,
       req.name as Requirement,
       app.name as Application,
       data.name as DataObject,
       data.sensitivity as DataSensitivity
ORDER BY cap.name, app.name, data.sensitivity DESC
```

### Visual Path Query

```cypher
// Visualize complete flow from one capability to its data
MATCH path = (cap:BusinessCapability {name: 'Customer Onboarding'})<-[:SUPPORTS]-(req:Requirement)-[:IMPLEMENTED_BY]->(app:Application)-[:USES]->(data:DataObject)
RETURN path
```

### Multi-Hop Analysis

```cypher
// Find all data objects related to a business capability (3 hops)
MATCH (cap:BusinessCapability {name: 'Customer Onboarding'})<-[:SUPPORTS]-(req)-[:IMPLEMENTED_BY]->(app)-[:USES]->(data)
RETURN DISTINCT data.name as DataObject,
       data.type as Type,
       data.sensitivity as Sensitivity,
       collect(DISTINCT app.name) as UsedByApplications
ORDER BY data.sensitivity DESC
```

---

## 5. Application Dependencies and Integration

### Application-to-Application Dependencies

```cypher
// View application dependencies
MATCH (app1:Application)-[:DEPENDS_ON]->(app2:Application)
RETURN app1.name as Application,
       app2.name as DependsOn,
       app1.businessCriticality as Criticality
ORDER BY app1.name
```

### Dependency Graph Visualization

```cypher
// Visualize full application dependency graph
MATCH (app:Application)
OPTIONAL MATCH (app)-[r:DEPENDS_ON|CALLS]-(other:Application)
RETURN app, r, other
```

### Find Critical Dependencies

```cypher
// Find applications with highest number of dependencies
MATCH (app:Application)-[:DEPENDS_ON]->(dep:Application)
WITH app, collect(dep.name) as Dependencies, count(dep) as DepCount
RETURN app.name as Application,
       app.businessCriticality as Criticality,
       DepCount,
       Dependencies
ORDER BY DepCount DESC
```

### Find Dependency Chains

```cypher
// Find transitive dependencies (2 levels deep)
MATCH path = (app:Application)-[:DEPENDS_ON*1..2]->(dep:Application)
WHERE app <> dep
RETURN app.name as Application,
       length(path) as HopCount,
       [node in nodes(path) | node.name] as DependencyChain
ORDER BY app.name, HopCount
```

### Circular Dependencies

```cypher
// Check for circular dependencies
MATCH (app1:Application)-[:DEPENDS_ON*]->(app2:Application)-[:DEPENDS_ON*]->(app1)
RETURN DISTINCT app1.name as App1,
       app2.name as App2,
       'CIRCULAR DEPENDENCY DETECTED' as Warning
```

---

## 6. Impact Analysis

### Upstream Impact (What Depends on This?)

```cypher
// Find what would be impacted if an application fails
MATCH (app:Application {name: 'Customer Portal'})<-[:DEPENDS_ON*1..3]-(impacted)
RETURN DISTINCT impacted.name as ImpactedApplication,
       labels(impacted)[0] as EntityType,
       'Upstream Dependency' as ImpactType
ORDER BY impacted.name
```

### Downstream Impact (What Does This Depend On?)

```cypher
// Find what an application depends on (full downstream)
MATCH (app:Application {name: 'Customer Portal'})-[:DEPENDS_ON|USES*1..3]->(dependency)
RETURN DISTINCT dependency.name as Dependency,
       labels(dependency)[0] as EntityType,
       'Downstream Dependency' as DependencyType
ORDER BY EntityType, dependency.name
```

### Complete Impact Analysis

```cypher
// Full impact analysis for an application
MATCH (app:Application {name: 'Customer Portal'})
OPTIONAL MATCH (upstream)-[:DEPENDS_ON|IMPLEMENTED_BY]->(app)
OPTIONAL MATCH (app)-[:DEPENDS_ON|USES]->(downstream)
RETURN app.name as Application,
       collect(DISTINCT upstream.name) as UpstreamImpact,
       collect(DISTINCT downstream.name) as DownstreamDependencies
```

### Data Impact Analysis

```cypher
// Find all applications impacted if a data object changes
MATCH (data:DataObject {name: 'CustomerTable'})<-[:USES]-(app:Application)
OPTIONAL MATCH (req:Requirement)-[:IMPLEMENTED_BY]->(app)
OPTIONAL MATCH (req)-[:SUPPORTS]->(cap:BusinessCapability)
RETURN data.name as DataObject,
       collect(DISTINCT app.name) as ImpactedApplications,
       collect(DISTINCT req.name) as RelatedRequirements,
       collect(DISTINCT cap.name) as ImpactedCapabilities
```

---

## 7. Compliance and Governance

### PII Data Flow

```cypher
// Trace PII data through the system
MATCH (cap:BusinessCapability)<-[:SUPPORTS]-(req:Requirement)-[:IMPLEMENTED_BY]->(app:Application)-[:USES]->(data:DataObject {sensitivity: 'PII'})
RETURN cap.name as BusinessFunction,
       req.name as Requirement,
       req.compliance as ComplianceReqs,
       app.name as Application,
       data.name as PIIData,
       data.columns as Columns
ORDER BY cap.name, app.name
```

### Compliance Coverage

```cypher
// Check which requirements have compliance tags
MATCH (req:Requirement)
WHERE size(req.compliance) > 0
OPTIONAL MATCH (req)-[:IMPLEMENTED_BY]->(app:Application)
RETURN req.name as Requirement,
       req.compliance as ComplianceStandards,
       req.status as Status,
       collect(app.name) as ImplementedBy
ORDER BY req.name
```

### High-Priority Requirements Status

```cypher
// Check implementation status of high-priority requirements
MATCH (req:Requirement {priority: 'High'})
OPTIONAL MATCH (req)-[:IMPLEMENTED_BY]->(app:Application)
OPTIONAL MATCH (req)-[:SUPPORTS]->(cap:BusinessCapability)
RETURN req.name as Requirement,
       req.status as Status,
       cap.name as SupportsCapability,
       collect(app.name) as ImplementedBy,
       CASE WHEN app IS NULL THEN 'NOT IMPLEMENTED' ELSE 'IMPLEMENTED' END as ImplementationStatus
ORDER BY req.status, req.name
```

---

## 8. Technology and Architecture Analysis

### Technology Stack Overview

```cypher
// View technology stack distribution
MATCH (app:Application)
UNWIND app.techStack as tech
RETURN tech as Technology,
       count(app) as ApplicationCount,
       collect(app.name) as Applications
ORDER BY ApplicationCount DESC
```

### Find Technology Dependencies

```cypher
// Find applications using specific technology
MATCH (app:Application)
WHERE 'React' IN app.techStack
OPTIONAL MATCH (app)-[:USES]->(data:DataObject)
RETURN app.name as Application,
       app.techStack as TechStack,
       collect(data.name) as DataObjects
ORDER BY app.name
```

### Database Usage Patterns

```cypher
// Analyze database usage
MATCH (data:DataObject)
WITH data.database as Database, count(data) as ObjectCount, collect(data.name) as Objects
MATCH (app:Application)-[:USES]->(d:DataObject {database: Database})
WITH Database, ObjectCount, Objects, count(DISTINCT app) as AppCount, collect(DISTINCT app.name) as Applications
RETURN Database,
       ObjectCount as TotalObjects,
       AppCount as ApplicationsUsing,
       Applications
ORDER BY AppCount DESC, ObjectCount DESC
```

---

## 9. Architecture Health Checks

### Find Single Points of Failure

```cypher
// Applications with no redundancy (no similar apps)
MATCH (app:Application)
WHERE app.businessCriticality = 'High'
AND NOT (app)-[:DEPENDS_ON]->()
RETURN app.name as CriticalApplication,
       app.type as Type,
       'No backup dependencies' as Risk
ORDER BY app.name
```

### Find Over-Coupled Applications

```cypher
// Applications with too many dependencies (>3)
MATCH (app:Application)-[:DEPENDS_ON]->(dep)
WITH app, collect(dep.name) as Dependencies, count(dep) as DepCount
WHERE DepCount > 3
RETURN app.name as Application,
       app.businessCriticality as Criticality,
       DepCount,
       Dependencies,
       'High coupling' as ArchitectureRisk
ORDER BY DepCount DESC
```

### Underutilized Applications

```cypher
// Applications that aren't implementing any requirements
MATCH (app:Application)
WHERE NOT ()-[:IMPLEMENTED_BY]->(app)
RETURN app.name as Application,
       app.type as Type,
       app.lifecycle as Lifecycle,
       'No mapped requirements' as Status
ORDER BY app.businessCriticality DESC
```

---

## 10. Statistics and Summary Queries

### Overall Architecture Statistics

```cypher
// Get overall statistics
MATCH (cap:BusinessCapability)
WITH count(cap) as CapabilityCount
MATCH (req:Requirement)
WITH CapabilityCount, count(req) as RequirementCount
MATCH (app:Application)
WITH CapabilityCount, RequirementCount, count(app) as ApplicationCount
MATCH (data:DataObject)
WITH CapabilityCount, RequirementCount, ApplicationCount, count(data) as DataObjectCount
MATCH ()-[r]->()
RETURN CapabilityCount,
       RequirementCount,
       ApplicationCount,
       DataObjectCount,
       count(r) as TotalRelationships
```

### Relationship Distribution

```cypher
// Count relationships by type
MATCH ()-[r]->()
RETURN type(r) as RelationshipType,
       count(r) as Count
ORDER BY Count DESC
```

### Coverage Analysis

```cypher
// Check requirement coverage
MATCH (cap:BusinessCapability)
OPTIONAL MATCH (cap)<-[:SUPPORTS]-(req:Requirement)
OPTIONAL MATCH (req)-[:IMPLEMENTED_BY]->(app:Application)
RETURN cap.name as Capability,
       cap.criticality as Criticality,
       count(DISTINCT req) as RequirementCount,
       count(DISTINCT app) as ApplicationCount,
       CASE
         WHEN count(app) = 0 THEN 'NOT IMPLEMENTED'
         WHEN count(req) = 0 THEN 'NO REQUIREMENTS'
         ELSE 'MAPPED'
       END as Status
ORDER BY cap.criticality DESC, Status
```

---

## 11. Quick Reference Queries

### Get Specific Entity Details

```cypher
// Get application details with all relationships
MATCH (app:Application {name: 'Customer Portal'})
OPTIONAL MATCH (app)-[r1]-(related1)
RETURN app,
       collect(DISTINCT {type: type(r1), node: related1.name, direction: CASE WHEN startNode(r1) = app THEN 'OUTGOING' ELSE 'INCOMING' END}) as Relationships
```

### Search by Name

```cypher
// Find entities by partial name
MATCH (n)
WHERE n.name CONTAINS 'Customer'
RETURN labels(n)[0] as EntityType,
       n.name as Name,
       n.id as ID
ORDER BY EntityType, Name
```

### Recent Changes

```cypher
// Find recently synced entities (last 24 hours)
MATCH (n)
WHERE n.lastSyncedAt IS NOT NULL
AND datetime(n.lastSyncedAt) > datetime() - duration({hours: 24})
RETURN labels(n)[0] as EntityType,
       n.name as Name,
       n.lastSyncedAt as LastSynced
ORDER BY n.lastSyncedAt DESC
LIMIT 20
```

---

## 12. Custom Queries for Your Use Case

### Template: Find All Related Entities

```cypher
// Replace 'ENTITY_NAME' with your entity
MATCH (entity {name: 'ENTITY_NAME'})
OPTIONAL MATCH path = (entity)-[*1..3]-(related)
RETURN entity,
       collect(DISTINCT related.name) as RelatedEntities,
       collect(DISTINCT labels(related)[0]) as RelatedTypes
```

### Template: Impact Radius

```cypher
// Find everything within N hops of an entity
MATCH (start:Application {name: 'Customer Portal'})
CALL apoc.path.subgraphAll(start, {
    maxLevel: 3,
    relationshipFilter: 'DEPENDS_ON>|USES>|IMPLEMENTED_BY<'
})
YIELD nodes, relationships
RETURN nodes, relationships
```

---

## Tips for Using These Queries

1. **Start Small**: Test queries with `LIMIT 25` first
2. **Use EXPLAIN**: Add `EXPLAIN` before queries to see execution plan
3. **Use PROFILE**: Add `PROFILE` to see actual query performance
4. **Index Keys**: The `id` property is used for MERGE operations
5. **Visualization**: Use Neo4j Browser for visual exploration
6. **Export**: Results can be exported as CSV, JSON, or graph format

## Performance Notes

- Queries with `MATCH (n)-[r]-(m)` can be slow on large graphs - always use LIMIT
- Path queries (`-[*1..3]-`) can be expensive - limit max depth
- Use indexes on frequently queried properties
- Consider using parameters for repeated queries

## Next Steps

1. **Create Indexes**:
   ```cypher
   CREATE INDEX app_name FOR (a:Application) ON (a.name)
   CREATE INDEX req_priority FOR (r:Requirement) ON (r.priority)
   CREATE INDEX data_sensitivity FOR (d:DataObject) ON (d.sensitivity)
   ```

2. **Add Custom Properties**: Extend nodes with your specific metadata
3. **Create Custom Relationships**: Add domain-specific relationship types
4. **Build Dashboards**: Use Grafana with Neo4j plugin for monitoring

---

**Last Updated**: December 24, 2025
**Data Model Version**: 1.1.0
**Total Entities**: 35 (8 Capabilities + 5 Requirements + 10 Applications + 12 Data Objects)
**Total Relationships**: 44
