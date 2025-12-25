# Super Relativity - Sample Cypher Queries

## Overview

This document provides comprehensive Neo4j Cypher query examples for the Super Relativity POC. The data model ensures all entities belong to an application, creating clear ownership and traceability from business capabilities down to data storage.

## Data Model Architecture

### Core Principle: Application Ownership
**Every node in the system belongs to an application**, establishing clear ownership and accountability:
- BusinessCapabilities have an `application` field
- DataObjects have an `application` field
- Components belong to applications via `HAS_COMPONENT` relationship

### Data Flow Path
```
Application → BusinessCapability → Component → DataObject
     ↓              ↓                    ↓
  Owns       Implements               Access
                                  (MODIFIES/READS)
```

### Node Types
| Node Type | Count | Description | Application Field |
|-----------|-------|-------------|-------------------|
| **Application** | 10 | Software applications and services | N/A (is the owner) |
| **BusinessCapability** | 8 | Business functions and capabilities | ✓ Yes |
| **Component** | 8 | Application components and modules | Via HAS_COMPONENT |
| **DataObject** | 10 | Database tables, caches, queues, storage | ✓ Yes |
| **Requirement** | 3 | Business and technical requirements | Via IMPLEMENTED_BY |
| **Server** | 15 | Physical/virtual servers across environments | Via INSTALLED_ON |

### Relationship Types
| Relationship | Count | Description |
|--------------|-------|-------------|
| **IMPLEMENTS_CAPABILITY** | 8 | Application implements a BusinessCapability |
| **ENABLED_BY** | 10 | BusinessCapability enabled by Component(s) |
| **HAS_COMPONENT** | 8 | Application has Component |
| **MODIFIES** | 8 | Component modifies (writes to) DataObject |
| **READS** | 9 | Component reads from DataObject |
| **IMPLEMENTED_BY** | 6 | Requirement implemented by Component(s) |
| **SUPPORTS** | 3 | Requirement supports BusinessCapability |
| **CREATE** | 12 | BusinessCapability creates DataObject |
| **READ** | 19 | BusinessCapability reads DataObject |
| **UPDATE** | 3 | BusinessCapability updates DataObject |
| **DEACTIVATE** | 1 | BusinessCapability deactivates DataObject |
| **INSTALLED_ON** | 26 | Component installed on Server(s) for deployment |
| **LOAD_BALANCES_WITH** | 4 | Server load balances with another Server |
| **WORKS_WITH** | 14 | Server communicates/works with another Server |

---

## 1. Query Data from Each Source

### 1.1 Query Applications

```cypher
// Get all applications with their metadata
MATCH (app:Application)
RETURN app.id as ID,
       app.name as Name,
       app.type as Type,
       app.businessValue as BusinessValue,
       app.lifecycle as Lifecycle,
       app.techStack as TechStack
ORDER BY app.businessValue DESC, app.name

// Get applications by business value
MATCH (app:Application {businessValue: 'Critical'})
RETURN app.name as CriticalApplications
ORDER BY app.name

// Get application technology stack
MATCH (app:Application)
RETURN app.name as Application, app.techStack as Technologies
ORDER BY app.name
```

### 1.2 Query Business Capabilities

```cypher
// Get all business capabilities with their owning application
MATCH (cap:BusinessCapability)
RETURN cap.id as ID,
       cap.name as Name,
       cap.application as OwningApplication,
       cap.criticality as Criticality,
       cap.maturity as Maturity,
       cap.owner as Owner
ORDER BY cap.criticality DESC, cap.name

// Find capabilities by criticality
MATCH (cap:BusinessCapability)
WHERE cap.criticality IN ['Critical', 'High']
RETURN cap.name as Capability,
       cap.application as Application,
       cap.criticality as Criticality
ORDER BY cap.criticality DESC

// Get capability maturity by application
MATCH (cap:BusinessCapability)
RETURN cap.application as Application,
       collect(cap.name) as Capabilities,
       collect(cap.maturity) as MaturityLevels
ORDER BY Application
```

### 1.3 Query Components

```cypher
// Get all components and their parent applications
MATCH (app:Application)-[:HAS_COMPONENT]->(comp:Component)
RETURN app.name as Application,
       comp.name as Component,
       comp.type as Type,
       comp.technology as Technology,
       comp.responsibilities as Responsibilities
ORDER BY app.name, comp.name

// Find components by technology
MATCH (app:Application)-[:HAS_COMPONENT]->(comp:Component)
WHERE comp.technology CONTAINS 'React'
RETURN app.name as Application,
       comp.name as Component,
       comp.type as Type
ORDER BY app.name

// Get components by application
MATCH (app:Application {name: 'Customer Portal'})-[:HAS_COMPONENT]->(comp:Component)
RETURN comp.name as Component,
       comp.type as Type,
       comp.responsibilities as Responsibilities
ORDER BY comp.name
```

### 1.4 Query Data Objects

```cypher
// Get all data objects with their owning application
MATCH (data:DataObject)
RETURN data.id as ID,
       data.name as Name,
       data.type as Type,
       data.application as OwningApplication,
       data.sensitivity as Sensitivity,
       data.database as Database
ORDER BY data.sensitivity DESC, data.name

// Find sensitive data objects
MATCH (data:DataObject)
WHERE data.sensitivity IN ['PII', 'PCI']
RETURN data.name as DataObject,
       data.application as OwningApplication,
       data.sensitivity as Sensitivity,
       data.type as Type
ORDER BY data.sensitivity, data.name

// Get data objects by application
MATCH (data:DataObject)
WHERE data.application = 'APP-123'
RETURN data.name as DataObject,
       data.type as Type,
       data.sensitivity as Sensitivity
ORDER BY data.sensitivity DESC
```

---

## 2. Traceability Queries: From Business to Data

### 2.1 Application → BusinessCapability → Component → DataObject

```cypher
// Complete path: Which applications enable which capabilities through which components accessing which data
MATCH (app:Application)-[:IMPLEMENTS_CAPABILITY]->(cap:BusinessCapability)
      -[:ENABLED_BY]->(comp:Component)-[:MODIFIES|READS]->(data:DataObject)
RETURN app.name as Application,
       cap.name as Capability,
       comp.name as Component,
       type(last(relationships(path))) as AccessType,
       data.name as DataObject
ORDER BY app.name, cap.name
```

### 2.2 Find Data Modified by Business Capabilities

```cypher
// Which data is modified (written) by each business capability
MATCH (app:Application)-[:IMPLEMENTS_CAPABILITY]->(cap:BusinessCapability)
      -[:ENABLED_BY]->(comp:Component)-[:MODIFIES]->(data:DataObject)
RETURN cap.name as Capability,
       cap.application as ApplicationID,
       app.name as Application,
       collect(DISTINCT data.name) as DataModified,
       count(DISTINCT data) as DataObjectCount
ORDER BY cap.criticality DESC, DataObjectCount DESC
```

### 2.3 Find Data Read by Business Capabilities

```cypher
// Which data is read by each business capability
MATCH (app:Application)-[:IMPLEMENTS_CAPABILITY]->(cap:BusinessCapability)
      -[:ENABLED_BY]->(comp:Component)-[:READS]->(data:DataObject)
RETURN cap.name as Capability,
       app.name as Application,
       collect(DISTINCT data.name) as DataRead,
       count(DISTINCT data) as DataObjectCount
ORDER BY DataObjectCount DESC
```

---

## 3. Component-Level Analysis

### 3.1 Component Data Access Patterns

```cypher
// Show which components modify vs read data (CRUD analysis)
MATCH (app:Application)-[:HAS_COMPONENT]->(comp:Component)
OPTIONAL MATCH (comp)-[:MODIFIES]->(dataW:DataObject)
OPTIONAL MATCH (comp)-[:READS]->(dataR:DataObject)
RETURN app.name as Application,
       comp.name as Component,
       collect(DISTINCT dataW.name) as Writes,
       collect(DISTINCT dataR.name) as Reads
ORDER BY app.name, comp.name
```

### 3.2 Find Components That Modify Sensitive Data

```cypher
// Components accessing PII or PCI data
MATCH (app:Application)-[:HAS_COMPONENT]->(comp:Component)
      -[:MODIFIES]->(data:DataObject)
WHERE data.sensitivity IN ['PII', 'PCI']
RETURN app.name as Application,
       comp.name as Component,
       data.name as SensitiveData,
       data.sensitivity as Sensitivity,
       data.application as DataOwner
ORDER BY data.sensitivity, app.name
```

### 3.3 Shared Data Analysis: Write-Read Patterns

```cypher
// Find data where one component writes and another reads (within same app)
MATCH (app:Application)-[:HAS_COMPONENT]->(writer:Component)
      -[:MODIFIES]->(data:DataObject)
      <-[:READS]-(reader:Component)
      <-[:HAS_COMPONENT]-(app)
WHERE writer <> reader
RETURN app.name as Application,
       writer.name as WriterComponent,
       data.name as SharedData,
       reader.name as ReaderComponent
ORDER BY app.name, data.name
```

---

## 4. Business Capability Analysis

### 4.1 Capability Implementation Status

```cypher
// Show which applications implement which capabilities
MATCH (app:Application)-[:IMPLEMENTS_CAPABILITY]->(cap:BusinessCapability)
RETURN cap.name as Capability,
       cap.criticality as Criticality,
       cap.maturity as Maturity,
       collect(app.name) as ImplementedBy,
       count(app) as AppCount
ORDER BY cap.criticality DESC, AppCount DESC
```

### 4.2 Capability Enablement by Components

```cypher
// Show which components enable each business capability
MATCH (cap:BusinessCapability)-[:ENABLED_BY]->(comp:Component)
      <-[:HAS_COMPONENT]-(app:Application)
RETURN cap.name as Capability,
       cap.criticality as Criticality,
       collect(comp.name) as EnabledByComponents,
       collect(DISTINCT app.name) as Applications
ORDER BY cap.criticality DESC
```

### 4.3 Critical Capabilities and Their Dependencies

```cypher
// Identify critical capabilities and their complete technology stack
MATCH (cap:BusinessCapability {criticality: 'Critical'})
      -[:ENABLED_BY]->(comp:Component)
      <-[:HAS_COMPONENT]-(app:Application)
OPTIONAL MATCH (comp)-[:MODIFIES|READS]->(data:DataObject)
RETURN cap.name as CriticalCapability,
       app.name as Application,
       collect(DISTINCT comp.name) as Components,
       collect(DISTINCT comp.technology) as Technologies,
       collect(DISTINCT data.name) as DataDependencies
ORDER BY cap.name
```

### 4.4 Capability CRUD Operations on Data

```cypher
// Show what data operations each business capability performs
MATCH (cap:BusinessCapability)-[r:CREATE|READ|UPDATE|DEACTIVATE]->(data:DataObject)
RETURN cap.name as Capability,
       type(r) as Operation,
       collect(data.name) as DataObjects
ORDER BY cap.name, Operation
```

```cypher
// Find capabilities that create specific data
MATCH (cap:BusinessCapability)-[:CREATE]->(data:DataObject)
RETURN cap.name as Capability,
       collect(data.name) as CreatesData
ORDER BY cap.name
```

```cypher
// Complete view: Capability data operations with sensitivity
MATCH (cap:BusinessCapability)-[r:CREATE|READ|UPDATE|DEACTIVATE]->(data:DataObject)
RETURN cap.name as Capability,
       cap.criticality as Criticality,
       type(r) as Operation,
       data.name as DataObject,
       data.sensitivity as Sensitivity
ORDER BY cap.criticality DESC, cap.name, Operation
```

### 4.5 Requirement Traceability

```cypher
// Show which components implement each requirement
MATCH (req:Requirement)-[:IMPLEMENTED_BY]->(comp:Component)
      <-[:HAS_COMPONENT]-(app:Application)
RETURN req.name as Requirement,
       req.priority as Priority,
       collect(comp.name) as ImplementedByComponents,
       collect(DISTINCT app.name) as InApplications
ORDER BY req.priority DESC
```

```cypher
// Show which requirements support which capabilities
MATCH (req:Requirement)-[:SUPPORTS]->(cap:BusinessCapability)
RETURN req.name as Requirement,
       req.priority as Priority,
       req.status as Status,
       cap.name as SupportsCapability,
       cap.criticality as Criticality
ORDER BY req.priority DESC, cap.criticality DESC
```

```cypher
// Complete requirement traceability: Implementation + Support
MATCH (req:Requirement)-[:IMPLEMENTED_BY]->(comp:Component)
      <-[:HAS_COMPONENT]-(app:Application)
OPTIONAL MATCH (req)-[:SUPPORTS]->(cap:BusinessCapability)
RETURN req.name as Requirement,
       collect(DISTINCT comp.name) as ImplementedByComponents,
       collect(DISTINCT app.name) as InApplications,
       collect(DISTINCT cap.name) as SupportsCapabilities
ORDER BY req.name
```

```cypher
// Complete requirement lineage: Requirement → Capability → Components → Data
MATCH (req:Requirement)-[:SUPPORTS]->(cap:BusinessCapability)
      -[:ENABLED_BY]->(comp:Component)
OPTIONAL MATCH (cap)-[crud:CREATE|READ|UPDATE|DEACTIVATE]->(data:DataObject)
RETURN req.name as Requirement,
       cap.name as Capability,
       collect(DISTINCT comp.name) as EnabledByComponents,
       collect(DISTINCT type(crud) + ':' + data.name) as DataOperations
ORDER BY req.priority DESC
```

```cypher
// Find requirements with high priority supporting critical capabilities
MATCH (req:Requirement)-[:SUPPORTS]->(cap:BusinessCapability)
WHERE req.priority = 'High' AND cap.criticality IN ['Critical', 'High']
RETURN req.name as HighPriorityRequirement,
       req.status as Status,
       cap.name as CriticalCapability,
       cap.maturity as CapabilityMaturity
ORDER BY req.status, cap.name
```

---

## 5. Data Lineage and Impact Analysis

### 5.1 Reverse Lineage: From Data to Business Capability

```cypher
// Given a data object, find which capabilities depend on it
MATCH (data:DataObject)<-[:MODIFIES|READS]-(comp:Component)
      <-[:ENABLED_BY]-(cap:BusinessCapability)
      <-[:IMPLEMENTS_CAPABILITY]-(app:Application)
WHERE data.name = 'CustomerTable'
RETURN data.name as DataObject,
       data.sensitivity as Sensitivity,
       comp.name as AccessedByComponent,
       type(r) as AccessType,
       cap.name as SupportsCapability,
       app.name as Application
```

### 5.2 Data Ownership and Access Matrix

```cypher
// Show which applications access data they don't own
MATCH (app:Application)-[:HAS_COMPONENT]->(comp:Component)
      -[r:MODIFIES|READS]->(data:DataObject)
WHERE data.application <> app.id
RETURN app.name as AccessingApplication,
       comp.name as Component,
       type(r) as AccessType,
       data.name as DataObject,
       data.application as DataOwner
ORDER BY data.name, app.name
```

### 5.3 Cross-Application Data Sharing

```cypher
// Find data objects accessed by multiple applications
MATCH (comp:Component)-[:MODIFIES|READS]->(data:DataObject)
      <-[:HAS_COMPONENT]-(app:Application)
WITH data, collect(DISTINCT app.name) as Applications, count(DISTINCT app) as AppCount
WHERE AppCount > 1
RETURN data.name as SharedDataObject,
       data.application as Owner,
       data.sensitivity as Sensitivity,
       Applications,
       AppCount
ORDER BY AppCount DESC, data.sensitivity DESC
```

---

## 6. Application Ownership Queries

### 6.1 Application Ownership Summary

```cypher
// Show everything owned by each application
MATCH (app:Application)
OPTIONAL MATCH (app)-[:IMPLEMENTS_CAPABILITY]->(cap:BusinessCapability)
OPTIONAL MATCH (app)-[:HAS_COMPONENT]->(comp:Component)
OPTIONAL MATCH (data:DataObject {application: app.id})
RETURN app.name as Application,
       count(DISTINCT cap) as CapabilitiesImplemented,
       count(DISTINCT comp) as ComponentCount,
       count(DISTINCT data) as DataObjectsOwned
ORDER BY app.name
```

### 6.2 Application Dependency Map

```cypher
// Show application's internal architecture
MATCH (app:Application)
OPTIONAL MATCH (app)-[:IMPLEMENTS_CAPABILITY]->(cap:BusinessCapability)
OPTIONAL MATCH (app)-[:HAS_COMPONENT]->(comp:Component)
OPTIONAL MATCH (data:DataObject {application: app.id})
WHERE app.name = 'Customer Portal'
RETURN app.name as Application,
       collect(DISTINCT cap.name) as Capabilities,
       collect(DISTINCT comp.name) as Components,
       collect(DISTINCT data.name) as OwnedData
```

### 6.3 Find Orphaned or Unlinked Entities

```cypher
// Find business capabilities not linked to any components
MATCH (cap:BusinessCapability)
WHERE NOT (cap)-[:ENABLED_BY]->(:Component)
RETURN cap.name as UnlinkedCapability,
       cap.application as Application

// Find components not linked to any capabilities
MATCH (comp:Component)
WHERE NOT (comp)<-[:ENABLED_BY]-(:BusinessCapability)
RETURN comp.name as UnlinkedComponent,
       comp.application as Application

// Find data objects not accessed by any components
MATCH (data:DataObject)
WHERE NOT (data)<-[:MODIFIES|READS]-(:Component)
RETURN data.name as UnusedDataObject,
       data.application as Owner
```

---

## 7. Compliance and Security Queries

### 7.1 PII Data Access Audit Trail

```cypher
// Complete audit trail for PII data access
MATCH (app:Application)-[:IMPLEMENTS_CAPABILITY]->(cap:BusinessCapability)
      -[:ENABLED_BY]->(comp:Component)-[r:MODIFIES|READS]
      ->(data:DataObject {sensitivity: 'PII'})
RETURN app.name as Application,
       cap.name as Capability,
       comp.name as Component,
       type(r) as AccessType,
       data.name as PIIData,
       data.type as DataType,
       data.application as DataOwner
ORDER BY data.name, app.name
```

### 7.2 Cross-Boundary Data Access

```cypher
// Find components accessing data from different applications
MATCH (app1:Application)-[:HAS_COMPONENT]->(comp:Component)
      -[r:MODIFIES|READS]->(data:DataObject)
MATCH (app2:Application {id: data.application})
WHERE app1.id <> app2.id
RETURN app1.name as ConsumerApp,
       comp.name as ConsumerComponent,
       type(r) as AccessType,
       data.name as DataObject,
       data.sensitivity as Sensitivity,
       app2.name as OwnerApp
ORDER BY data.sensitivity DESC, app1.name
```

---

## 8. Technology and Architecture Queries

### 8.1 Technology Stack Analysis

```cypher
// Identify all technologies used across components
MATCH (app:Application)-[:HAS_COMPONENT]->(comp:Component)
RETURN comp.technology as Technology,
       collect(DISTINCT app.name) as Applications,
       collect(DISTINCT comp.name) as Components,
       count(DISTINCT comp) as ComponentCount
ORDER BY ComponentCount DESC
```

### 8.2 Application Modernization Candidates

```cypher
// Find legacy applications with critical capabilities
MATCH (app:Application {lifecycle: 'Sunset'})
      -[:IMPLEMENTS_CAPABILITY]->(cap:BusinessCapability)
WHERE cap.criticality IN ['Critical', 'High']
RETURN app.name as LegacyApplication,
       collect(cap.name) as CriticalCapabilities,
       count(cap) as CapabilityCount
ORDER BY CapabilityCount DESC
```

---

## 9. Server Infrastructure and Deployment Queries

### 9.1 Query Servers by Environment

```cypher
// Get all servers grouped by environment
MATCH (s:Server)
RETURN s.environment as Environment,
       count(s) as ServerCount,
       collect(s.name) as Servers
ORDER BY s.environment
```

```cypher
// Get production servers with details
MATCH (s:Server {environment: 'prod'})
RETURN s.name as ServerName,
       s.hostname as Hostname,
       s.ip as IP,
       s.purpose as Purpose,
       s.cpu as CPU,
       s.memory as Memory,
       s.datacenter as Datacenter
ORDER BY s.name
```

### 9.2 Component Deployment Analysis

```cypher
// Show where each component is deployed
MATCH (c:Component)-[:INSTALLED_ON]->(s:Server)
RETURN c.name as Component,
       collect(DISTINCT s.environment) as Environments,
       collect(s.name) as Servers,
       count(s) as ServerCount
ORDER BY ServerCount DESC, c.name
```

```cypher
// Find components deployed across multiple environments
MATCH (c:Component)-[:INSTALLED_ON]->(s:Server)
WITH c, collect(DISTINCT s.environment) as Environments
WHERE size(Environments) > 1
RETURN c.name as Component,
       Environments,
       size(Environments) as EnvironmentCount
ORDER BY EnvironmentCount DESC
```

```cypher
// Production deployment map
MATCH (c:Component)-[:INSTALLED_ON]->(s:Server {environment: 'prod'})
RETURN c.name as Component,
       collect(s.name) as ProductionServers,
       collect(s.datacenter) as Datacenters
ORDER BY c.name
```

### 9.3 Load Balancing and High Availability

```cypher
// Find load-balanced server pairs
MATCH (s1:Server)-[:LOAD_BALANCES_WITH]->(s2:Server)
WHERE s1.name < s2.name  // Avoid duplicates
RETURN s1.name as Server1,
       s2.name as Server2,
       s1.environment as Environment,
       s1.purpose as Purpose
ORDER BY Environment, Server1
```

```cypher
// Find components with load-balanced deployments
MATCH (c:Component)-[:INSTALLED_ON]->(s1:Server)-[:LOAD_BALANCES_WITH]->(s2:Server)
      <-[:INSTALLED_ON]-(c)
WHERE s1.name < s2.name
RETURN c.name as Component,
       s1.environment as Environment,
       collect(DISTINCT s1.name) + collect(DISTINCT s2.name) as LoadBalancedServers
ORDER BY Environment, Component
```

### 9.4 Server Communication Topology

```cypher
// Show server-to-server communication in production
MATCH (s1:Server {environment: 'prod'})-[:WORKS_WITH]->(s2:Server {environment: 'prod'})
RETURN s1.name as Server,
       s1.purpose as Purpose,
       collect(s2.name) as CommunicatesWith
ORDER BY s1.name
```

```cypher
// Find critical servers (high number of connections)
MATCH (s:Server)-[:WORKS_WITH]-(other:Server)
WITH s, count(DISTINCT other) as ConnectionCount
WHERE ConnectionCount >= 2
RETURN s.name as Server,
       s.environment as Environment,
       s.purpose as Purpose,
       ConnectionCount
ORDER BY ConnectionCount DESC, s.environment
```

### 9.5 Complete Deployment Lineage

```cypher
// Trace from Application to Server deployment
MATCH (app:Application)-[:HAS_COMPONENT]->(comp:Component)
      -[:INSTALLED_ON]->(srv:Server)
RETURN app.name as Application,
       comp.name as Component,
       collect(DISTINCT srv.environment) as Environments,
       collect(srv.name) as Servers
ORDER BY app.name, comp.name
```

```cypher
// Complete path: Requirement → Component → Server → Environment
MATCH (req:Requirement)-[:IMPLEMENTED_BY]->(comp:Component)
      -[:INSTALLED_ON]->(srv:Server)
RETURN req.name as Requirement,
       comp.name as ImplementedBy,
       srv.environment as Environment,
       collect(srv.name) as Servers
ORDER BY req.priority DESC, Environment
```

### 9.6 Environment Comparison

```cypher
// Compare component deployment across environments
MATCH (c:Component)-[:INSTALLED_ON]->(s:Server)
WITH c.name as Component, s.environment as Env, count(s) as Count
RETURN Component,
       collect({environment: Env, servers: Count}) as Deployments
ORDER BY Component
```

```cypher
// Find components not deployed to production
MATCH (c:Component)
WHERE NOT (c)-[:INSTALLED_ON]->(:Server {environment: 'prod'})
RETURN c.name as ComponentNotInProduction,
       c.application as Application
ORDER BY c.name
```

### 9.7 Datacenter and Region Analysis

```cypher
// Server distribution by datacenter
MATCH (s:Server)
RETURN s.datacenter as Datacenter,
       s.environment as Environment,
       count(s) as ServerCount,
       collect(s.name) as Servers
ORDER BY Datacenter, Environment
```

```cypher
// Find multi-datacenter deployments (for disaster recovery)
MATCH (c:Component)-[:INSTALLED_ON]->(s:Server {environment: 'prod'})
WITH c, collect(DISTINCT s.datacenter) as Datacenters
WHERE size(Datacenters) > 1
RETURN c.name as Component,
       Datacenters,
       'Multi-DC' as DeploymentType
ORDER BY c.name
```

### 9.8 Capacity Planning Queries

```cypher
// Server resource utilization summary
MATCH (s:Server)
RETURN s.environment as Environment,
       count(s) as TotalServers,
       collect(DISTINCT s.cpu) as CPUConfigs,
       collect(DISTINCT s.memory) as MemoryConfigs
ORDER BY Environment
```

```cypher
// Components per server (density analysis)
MATCH (s:Server)<-[:INSTALLED_ON]-(c:Component)
RETURN s.name as Server,
       s.environment as Environment,
       s.purpose as Purpose,
       count(c) as ComponentCount,
       collect(c.name) as Components
ORDER BY ComponentCount DESC
```

---

## 10. Graph Traversal and Connectivity Queries

Graph traversal queries allow you to explore all nodes and relationships connected to a specific starting point, either directly or through multiple hops. These queries are essential for understanding dependencies, impact analysis, and relationship mapping.

### 10.1 Simple Traversal - Find All Connected Nodes

Find all nodes connected to a BusinessCapability within 5 hops, grouped by type:

```cypher
// Find all nodes connected to Payment Processing
MATCH (b:BusinessCapability {name: "Payment Processing"})-[*1..5]-(connected)
RETURN DISTINCT labels(connected)[0] as NodeType,
       connected.name as Name,
       connected.id as ID
ORDER BY NodeType, Name
```

**Use Case:** Quick overview of all entities related to a specific business capability

**Adjust traversal depth:**
- `[*1..3]` - Up to 3 hops (closer relationships)
- `[*1..5]` - Up to 5 hops (broader scope)
- `[*]` - Unlimited hops (use with caution on large graphs)

### 10.2 Visual Subgraph Exploration

Return graph paths for visualization in Neo4j Browser:

```cypher
// Get visual subgraph centered on Payment Processing
MATCH path = (b:BusinessCapability {name: "Payment Processing"})-[*1..5]-(connected)
RETURN path
LIMIT 200
```

**Use Case:** Visual exploration in Neo4j Browser to understand the network of relationships

**Tip:** Adjust LIMIT based on graph size to prevent overwhelming the visualization

### 10.3 Detailed Path Analysis

Show the exact path taken to reach each connected node:

```cypher
// Analyze paths from Payment Processing to all connected nodes
MATCH path = (b:BusinessCapability {name: "Payment Processing"})-[*1..5]-(connected)
WITH path, relationships(path) as rels, nodes(path) as pathNodes
RETURN
  b.name as StartNode,
  [rel in rels | type(rel)] as Relationships,
  [node in pathNodes | labels(node)[0] + ':' + coalesce(node.name, node.id)] as PathNodes,
  length(path) as PathLength
ORDER BY PathLength, PathNodes
LIMIT 50
```

**Use Case:** Understanding how nodes are connected and the relationship chain

**Example Output:**
```
StartNode: "Payment Processing"
Relationships: ["ENABLED_BY", "HAS_COMPONENT", "INSTALLED_ON"]
PathNodes: ["BusinessCapability:Payment Processing", "Component:Payment Gateway", "Server:api-prod-01"]
PathLength: 3
```

### 10.4 Connected Nodes by Type and Distance

Group connected nodes by their type and distance (number of hops):

```cypher
// Analyze connection patterns by node type and distance
MATCH path = (b:BusinessCapability {name: "Payment Processing"})-[*1..5]-(connected)
WITH DISTINCT connected, length(path) as distance, labels(connected)[0] as nodeType
RETURN
  nodeType as NodeType,
  distance as Hops,
  collect(connected.name) as Nodes,
  count(connected) as Count
ORDER BY Hops, NodeType
```

**Use Case:** Understanding the layers of connectivity and which types of nodes are directly vs indirectly connected

**Example Output:**
```
NodeType: "Component", Hops: 1, Nodes: ["Payment Gateway", "Card Validator"], Count: 2
NodeType: "Application", Hops: 2, Nodes: ["Payment Service", "Core Banking"], Count: 2
NodeType: "Server", Hops: 3, Nodes: ["api-prod-01", "api-prod-02"], Count: 2
```

### 10.5 Bidirectional Traversal with Relationship Direction

Separate outgoing and incoming relationships for directional analysis:

```cypher
// Analyze incoming and outgoing relationships separately
MATCH (b:BusinessCapability {name: "Payment Processing"})

// Outgoing relationships
OPTIONAL MATCH outPath = (b)-[outRel*1..3]->(out)
WITH b, collect(DISTINCT {
  type: labels(out)[0],
  name: out.name,
  relationships: [r in relationships(outPath) | type(r)],
  direction: 'outgoing'
}) as outgoing

// Incoming relationships
OPTIONAL MATCH inPath = (b)<-[inRel*1..3]-(in)
WITH b, outgoing, collect(DISTINCT {
  type: labels(in)[0],
  name: in.name,
  relationships: [r in relationships(inPath) | type(r)],
  direction: 'incoming'
}) as incoming

RETURN
  b.name as Capability,
  outgoing,
  incoming
```

**Use Case:** Understanding which nodes depend on this capability (incoming) vs which nodes this capability depends on (outgoing)

**Example Analysis:**
- **Outgoing:** Shows what this capability creates/reads/updates (data dependencies)
- **Incoming:** Shows what implements/supports this capability (implementation chain)

### 10.6 Traversal from Any Node Type

These patterns work from any starting node type. Examples:

**From Application:**
```cypher
// Find all nodes connected to an application
MATCH (app:Application {name: "Payment Service"})-[*1..5]-(connected)
RETURN DISTINCT labels(connected)[0] as NodeType,
       count(connected) as Count
ORDER BY NodeType
```

**From Server:**
```cypher
// Find all nodes connected to a production server
MATCH (srv:Server {name: "api-prod-01"})-[*1..5]-(connected)
RETURN DISTINCT labels(connected)[0] as NodeType,
       connected.name as Name
ORDER BY NodeType, Name
```

**From DataObject:**
```cypher
// Find all nodes related to sensitive data
MATCH (data:DataObject {sensitivity: "PII"})-[*1..5]-(connected)
RETURN DISTINCT labels(connected)[0] as NodeType,
       count(connected) as Count,
       collect(DISTINCT connected.name)[0..5] as SampleNodes
ORDER BY Count DESC
```

### 10.7 Filtered Traversal by Relationship Type

Traverse only specific relationship types:

```cypher
// Follow only deployment and component relationships
MATCH path = (app:Application {name: "Payment Service"})
             -[:HAS_COMPONENT|INSTALLED_ON*1..3]-(connected)
RETURN DISTINCT labels(connected)[0] as NodeType,
       connected.name as Name
ORDER BY NodeType, Name
```

**Use Case:** Focus on specific relationship chains (e.g., deployment path, data flow, capability implementation)

### 10.8 Traversal Performance Tips

**For Large Graphs:**
1. **Limit traversal depth:** Use `[*1..3]` instead of `[*1..5]`
2. **Filter early:** Add WHERE clauses to reduce initial matches
3. **Use LIMIT:** Prevent overwhelming results
4. **Specify relationship types:** Use `[:SPECIFIC_TYPE*1..3]` instead of `[*1..3]`

**Example Optimized Query:**
```cypher
// Optimized traversal with filtering
MATCH (b:BusinessCapability {name: "Payment Processing"})
      -[:ENABLED_BY|HAS_COMPONENT|INSTALLED_ON*1..3]-(connected)
WHERE labels(connected)[0] IN ['Component', 'Server', 'Application']
RETURN DISTINCT labels(connected)[0] as NodeType,
       connected.name as Name
ORDER BY NodeType, Name
LIMIT 100
```

---

## 11. Mock LeanIX API Query Examples

The mock LeanIX API provides REST endpoints to query the source data:

### 11.1 Query Applications
```bash
# Get all applications
curl http://localhost:8080/applications

# Get specific application
curl http://localhost:8080/applications/APP-123

# Get application count
curl http://localhost:8080/applications | jq '.count'
```

### 11.2 Query Business Capabilities
```bash
# Get all business capabilities
curl http://localhost:8080/capabilities

# Get specific capability
curl http://localhost:8080/capabilities/CAP-001
```

### 11.3 Query Components
```bash
# Get all components
curl http://localhost:8080/components

# Get components for specific application
curl http://localhost:8080/components?application=APP-123

# Get specific component
curl http://localhost:8080/components/COMP-001
```

### 11.4 Query Data Objects
```bash
# Get all data objects
curl http://localhost:8080/data-objects

# Get specific data object
curl http://localhost:8080/data-objects/DATA-789
```

### 11.5 Query Servers
```bash
# Get all servers
curl http://localhost:8080/servers

# Get servers by environment
curl http://localhost:8080/servers?environment=prod

# Get servers by datacenter
curl http://localhost:8080/servers?datacenter=DC1

# Get specific server
curl http://localhost:8080/servers/SRV-001

# Count servers by environment
curl http://localhost:8080/servers?environment=prod | jq '.count'
```

### 11.6 Query Relationships
```bash
# Get all relationships
curl http://localhost:8080/relationships

# Get sync status
curl http://localhost:8080/sync/all
```

---

## 12. GraphQL API Query Examples

The GraphQL API provides a unified query interface:

### 12.1 Query Application with Components
```graphql
query GetApplicationDetails {
  application(name: "Customer Portal") {
    name
    type
    components {
      name
      type
      technology
    }
  }
}
```

### 12.2 Query Capability Lineage
```graphql
query GetCapabilityLineage {
  businessCapability(name: "Customer Onboarding") {
    name
    criticality
    implementedBy {
      name
    }
    enabledBy {
      name
      technology
    }
  }
}
```

### 12.3 Query Data Lineage
```graphql
query GetDataLineage {
  dataObject(name: "CustomerTable") {
    name
    sensitivity
    owner
    readBy {
      name
      application
    }
    modifiedBy {
      name
      application
    }
  }
}
```

---

## Summary

This query guide demonstrates the complete traceability model where:
1. **All nodes belong to an application** (via application field or HAS_COMPONENT)
2. **Clear ownership** is established at every level
3. **Business capabilities** are enabled by **components**
4. **Components** access **data objects** (read/write)
5. **Applications** tie everything together

The model enables:
- **Forward traceability**: Business capability → Component → Data
- **Reverse traceability**: Data → Component → Capability → Application
- **Impact analysis**: Change any entity and trace affected systems
- **Compliance auditing**: Track all access to sensitive data
- **Ownership clarity**: Every entity has a clear owner
