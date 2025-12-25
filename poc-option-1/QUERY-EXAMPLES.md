# Super Relativity - Query Examples Manual

**A hands-on guide to querying your enterprise architecture knowledge graph**

This manual provides copy-paste ready queries you can run immediately in Neo4j Browser to explore your system architecture, deployments, and business-to-tech traceability.

---

## 📋 Table of Contents

1. [Getting Started](#getting-started)
2. [Quick Discovery Queries](#quick-discovery-queries)
3. [Component Deployment Queries](#component-deployment-queries)
4. [Business Capability Traceability](#business-capability-traceability)
5. [Requirement Implementation Tracking](#requirement-implementation-tracking)
6. [Data Lineage and Access](#data-lineage-and-access)
7. [Infrastructure and Server Analysis](#infrastructure-and-server-analysis)
8. [Compliance and Security](#compliance-and-security)
9. [Impact Analysis](#impact-analysis)
10. [Production Operations](#production-operations)
11. [Advanced Queries](#advanced-queries) - Graph traversal, connectivity analysis, dependency mapping
12. [GraphQL Traversal Queries](#graphql-traversal-queries) - GraphQL equivalents for graph traversal

---

## Getting Started

### Access Neo4j Browser

1. Open http://localhost:7474
2. Login with:
   - Username: `neo4j`
   - Password: `super-relativity-2025`
3. Copy-paste queries from this manual into the query editor
4. Click the play button (▶) or press Ctrl+Enter

### Understanding the Data Model

**Node Types:**
- Application (10) - Software applications and services
- BusinessCapability (8) - Business functions
- Component (8) - Technical components
- DataObject (10) - Databases, caches, storage
- Requirement (3) - Business and technical requirements
- Server (15) - Infrastructure servers across environments

**Key Relationships:**
- `IMPLEMENTS_CAPABILITY` - Application → BusinessCapability
- `ENABLED_BY` - BusinessCapability → Component
- `HAS_COMPONENT` - Application → Component
- `INSTALLED_ON` - Component → Server (deployment)
- `MODIFIES/READS` - Component → DataObject (technical access)
- `CREATE/READ/UPDATE/DEACTIVATE` - BusinessCapability → DataObject (business operations)
- `IMPLEMENTED_BY` - Requirement → Component
- `SUPPORTS` - Requirement → BusinessCapability
- `LOAD_BALANCES_WITH` - Server ↔ Server
- `WORKS_WITH` - Server → Server

---

## Quick Discovery Queries

### 1. See Everything in the System

```cypher
// Count all entities
MATCH (n)
RETURN labels(n)[0] as NodeType, count(n) as Count
ORDER BY Count DESC
```

### 2. Count All Relationships

```cypher
// Count relationships by type
MATCH ()-[r]->()
RETURN type(r) as RelationshipType, count(r) as Count
ORDER BY Count DESC
```

### 3. Visualize Sample Data

```cypher
// Show a sample of the complete graph
MATCH (n)
RETURN n LIMIT 50
```

### 4. Find All Applications

```cypher
// List all applications with key details
MATCH (app:Application)
RETURN app.name as Application,
       app.type as Type,
       app.businessValue as BusinessValue,
       app.lifecycle as Lifecycle,
       app.techStack as Technologies
ORDER BY app.businessValue DESC, app.name
```

### 5. Check Data Freshness

```cypher
// See when data was last synced
MATCH (n)
WHERE n.lastSyncedAt IS NOT NULL
RETURN labels(n)[0] as NodeType,
       max(n.lastSyncedAt) as LastSynced,
       count(n) as Count
ORDER BY NodeType
```

---

## Component Deployment Queries

### 6. Where Is Each Component Deployed?

```cypher
// Complete deployment map for all components
MATCH (c:Component)-[:INSTALLED_ON]->(s:Server)
RETURN c.name as Component,
       collect(DISTINCT s.environment) as Environments,
       collect(s.name) as Servers,
       count(s) as ServerCount
ORDER BY ServerCount DESC, c.name
```

**Use Case:** Understand deployment footprint across all environments

### 7. Production Deployment Map

```cypher
// Show only production deployments
MATCH (c:Component)-[:INSTALLED_ON]->(s:Server {environment: 'prod'})
RETURN c.name as Component,
       collect(s.name) as ProductionServers,
       collect(s.datacenter) as Datacenters
ORDER BY c.name
```

**Use Case:** Production deployment documentation

### 8. Find Load-Balanced Components

```cypher
// Components deployed on load-balanced servers
MATCH (c:Component)-[:INSTALLED_ON]->(s1:Server)-[:LOAD_BALANCES_WITH]->(s2:Server)
      <-[:INSTALLED_ON]-(c)
WHERE s1.name < s2.name
RETURN c.name as Component,
       s1.environment as Environment,
       collect(DISTINCT s1.name) + collect(DISTINCT s2.name) as LoadBalancedServers
ORDER BY Environment, Component
```

**Use Case:** Identify high-availability deployments

### 9. Multi-Environment Deployments

```cypher
// Components deployed across multiple environments
MATCH (c:Component)-[:INSTALLED_ON]->(s:Server)
WITH c, collect(DISTINCT s.environment) as Environments
WHERE size(Environments) > 1
RETURN c.name as Component,
       Environments,
       size(Environments) as EnvironmentCount
ORDER BY EnvironmentCount DESC
```

**Use Case:** Verify proper environment promotion paths

---

## Business Capability Traceability

### 10. From Capability to Implementation

```cypher
// Complete path: Capability → Component → Server
MATCH (cap:BusinessCapability)-[:ENABLED_BY]->(comp:Component)
      -[:INSTALLED_ON]->(srv:Server)
RETURN cap.name as Capability,
       cap.criticality as Criticality,
       comp.name as Component,
       srv.environment as Environment,
       collect(srv.name) as Servers
ORDER BY cap.criticality DESC, cap.name
```

**Use Case:** Understand technical implementation of business capabilities

### 11. Critical Capabilities and Infrastructure

```cypher
// Find where critical capabilities run
MATCH (cap:BusinessCapability)
WHERE cap.criticality IN ['Critical', 'High']
OPTIONAL MATCH (cap)-[:ENABLED_BY]->(comp:Component)
      -[:INSTALLED_ON]->(srv:Server {environment: 'prod'})
RETURN cap.name as CriticalCapability,
       collect(DISTINCT comp.name) as Components,
       collect(DISTINCT srv.name) as ProductionServers,
       collect(DISTINCT srv.datacenter) as Datacenters
ORDER BY cap.name
```

**Use Case:** Disaster recovery and business continuity planning

### 12. Capability Data Operations

```cypher
// What data does each capability operate on?
MATCH (cap:BusinessCapability)-[r:CREATE|READ|UPDATE|DEACTIVATE]->(data:DataObject)
RETURN cap.name as Capability,
       cap.criticality as Criticality,
       type(r) as Operation,
       data.name as DataObject,
       data.sensitivity as Sensitivity
ORDER BY cap.criticality DESC, cap.name, Operation
```

**Use Case:** Data governance and capability impact analysis

---

## Requirement Implementation Tracking

### 13. Requirements and Their Implementations

```cypher
// Complete requirement traceability
MATCH (req:Requirement)-[:IMPLEMENTED_BY]->(comp:Component)
      <-[:HAS_COMPONENT]-(app:Application)
OPTIONAL MATCH (req)-[:SUPPORTS]->(cap:BusinessCapability)
RETURN req.name as Requirement,
       req.priority as Priority,
       collect(DISTINCT comp.name) as ImplementedByComponents,
       collect(DISTINCT app.name) as InApplications,
       collect(DISTINCT cap.name) as SupportsCapabilities
ORDER BY req.priority DESC
```

**Use Case:** Requirements traceability matrix for compliance

### 14. Requirements Deployed to Production

```cypher
// Where are requirements running in production?
MATCH (req:Requirement)-[:IMPLEMENTED_BY]->(comp:Component)
      -[:INSTALLED_ON]->(srv:Server {environment: 'prod'})
RETURN req.name as Requirement,
       req.priority as Priority,
       comp.name as ImplementedBy,
       collect(srv.name) as ProductionServers
ORDER BY req.priority DESC
```

**Use Case:** Verify production readiness of requirements

### 15. High Priority Requirements Analysis

```cypher
// Focus on high priority requirements
MATCH (req:Requirement {priority: 'High'})-[:SUPPORTS]->(cap:BusinessCapability)
WHERE cap.criticality IN ['Critical', 'High']
RETURN req.name as HighPriorityRequirement,
       req.status as Status,
       cap.name as CriticalCapability,
       cap.maturity as CapabilityMaturity
ORDER BY req.status, cap.name
```

**Use Case:** Risk assessment and prioritization

---

## Data Lineage and Access

### 16. Component Data Access Patterns

```cypher
// Which components read vs write data?
MATCH (app:Application)-[:HAS_COMPONENT]->(comp:Component)
OPTIONAL MATCH (comp)-[:MODIFIES]->(dataW:DataObject)
OPTIONAL MATCH (comp)-[:READS]->(dataR:DataObject)
RETURN app.name as Application,
       comp.name as Component,
       collect(DISTINCT dataW.name) as Writes,
       collect(DISTINCT dataR.name) as Reads
ORDER BY app.name, comp.name
```

**Use Case:** Database dependency mapping

### 17. Sensitive Data Access Audit

```cypher
// Which components access PII or PCI data?
MATCH (app:Application)-[:HAS_COMPONENT]->(comp:Component)
      -[:MODIFIES|READS]->(data:DataObject)
WHERE data.sensitivity IN ['PII', 'PCI']
RETURN app.name as Application,
       comp.name as Component,
       data.name as SensitiveData,
       data.sensitivity as Sensitivity,
       data.application as DataOwner
ORDER BY data.sensitivity, app.name
```

**Use Case:** GDPR, HIPAA, PCI-DSS compliance audits

### 18. Cross-Application Data Sharing

```cypher
// Find data accessed by multiple applications
MATCH (app:Application)-[:HAS_COMPONENT]->(comp:Component)
      -[:MODIFIES|READS]->(data:DataObject)
WITH data, collect(DISTINCT app.name) as Applications, count(DISTINCT app) as AppCount
WHERE AppCount > 1
RETURN data.name as SharedDataObject,
       data.application as Owner,
       data.sensitivity as Sensitivity,
       Applications,
       AppCount
ORDER BY AppCount DESC, data.sensitivity DESC
```

**Use Case:** Identify tight coupling and refactoring opportunities

---

## Infrastructure and Server Analysis

### 19. Production Server Inventory

```cypher
// List all production servers with specs
MATCH (s:Server {environment: 'prod'})
RETURN s.name as ServerName,
       s.hostname as Hostname,
       s.ip as IP,
       s.purpose as Purpose,
       s.cpu as CPU,
       s.memory as Memory,
       s.datacenter as Datacenter
ORDER BY s.datacenter, s.name
```

**Use Case:** Infrastructure inventory and capacity planning

### 20. Server Communication Topology

```cypher
// Show which servers communicate in production
MATCH (s1:Server {environment: 'prod'})-[:WORKS_WITH]->(s2:Server {environment: 'prod'})
RETURN s1.name as Server,
       s1.purpose as Purpose,
       collect(s2.name) as CommunicatesWith
ORDER BY s1.name
```

**Use Case:** Network security and firewall rule documentation

### 21. Find Critical Servers

```cypher
// Servers with high number of connections
MATCH (s:Server)-[:WORKS_WITH]-(other:Server)
WITH s, count(DISTINCT other) as ConnectionCount
WHERE ConnectionCount >= 2
RETURN s.name as Server,
       s.environment as Environment,
       s.purpose as Purpose,
       ConnectionCount
ORDER BY ConnectionCount DESC, s.environment
```

**Use Case:** Identify single points of failure

### 22. Component Density per Server

```cypher
// How many components run on each server?
MATCH (s:Server)<-[:INSTALLED_ON]-(c:Component)
RETURN s.name as Server,
       s.environment as Environment,
       s.purpose as Purpose,
       count(c) as ComponentCount,
       collect(c.name) as Components
ORDER BY ComponentCount DESC
```

**Use Case:** Resource optimization and consolidation planning

---

## Compliance and Security

### 23. Complete PII Data Audit Trail

```cypher
// Full path from application to PII data access
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

**Use Case:** GDPR Article 30 processing records

### 24. Cross-Boundary Data Access

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

**Use Case:** Data governance and security boundaries

### 25. Compliance by Capability

```cypher
// Which capabilities handle sensitive data?
MATCH (cap:BusinessCapability)-[op:CREATE|READ|UPDATE|DEACTIVATE]
      ->(data:DataObject)
WHERE data.sensitivity IN ['PII', 'PCI', 'Confidential']
RETURN cap.name as Capability,
       cap.criticality as Criticality,
       collect(DISTINCT data.sensitivity) as DataTypes,
       collect(DISTINCT type(op) + ':' + data.name) as SensitiveDataOperations
ORDER BY cap.criticality DESC
```

**Use Case:** Compliance impact assessment for business changes

---

## Impact Analysis

### 26. Application Impact Analysis

```cypher
// If I change this application, what's affected?
MATCH (app:Application {name: 'Customer Portal'})
OPTIONAL MATCH (app)-[:IMPLEMENTS_CAPABILITY]->(cap:BusinessCapability)
OPTIONAL MATCH (app)-[:HAS_COMPONENT]->(comp:Component)
OPTIONAL MATCH (comp)-[:MODIFIES|READS]->(data:DataObject)
OPTIONAL MATCH (comp)-[:INSTALLED_ON]->(srv:Server)
RETURN app.name as Application,
       collect(DISTINCT cap.name) as Capabilities,
       collect(DISTINCT comp.name) as Components,
       collect(DISTINCT data.name) as DataDependencies,
       collect(DISTINCT srv.environment + ':' + srv.name) as Deployments
```

**Use Case:** Change impact analysis before upgrades

### 27. Data Object Impact Analysis

```cypher
// If I modify this data object, what breaks?
MATCH (data:DataObject {name: 'CustomerTable'})<-[:MODIFIES|READS]-(comp:Component)
      <-[:HAS_COMPONENT]-(app:Application)
OPTIONAL MATCH (comp)<-[:ENABLED_BY]-(cap:BusinessCapability)
OPTIONAL MATCH (req:Requirement)-[:IMPLEMENTED_BY]->(comp)
RETURN data.name as DataObject,
       data.sensitivity as Sensitivity,
       collect(DISTINCT comp.name) as AccessedByComponents,
       collect(DISTINCT app.name) as Applications,
       collect(DISTINCT cap.name) as Capabilities,
       collect(DISTINCT req.name) as Requirements
```

**Use Case:** Database schema change impact assessment

### 28. Server Failure Impact

```cypher
// If this server fails, what stops working?
MATCH (srv:Server {name: 'api-prod-01'})<-[:INSTALLED_ON]-(comp:Component)
      <-[:HAS_COMPONENT]-(app:Application)
OPTIONAL MATCH (app)-[:IMPLEMENTS_CAPABILITY]->(cap:BusinessCapability)
OPTIONAL MATCH (comp)-[:MODIFIES|READS]->(data:DataObject)
RETURN srv.name as Server,
       srv.environment as Environment,
       collect(DISTINCT comp.name) as ComponentsLost,
       collect(DISTINCT app.name) as ApplicationsAffected,
       collect(DISTINCT cap.name) as CapabilitiesImpacted,
       collect(DISTINCT data.name) as DataAccess
```

**Use Case:** Disaster recovery planning

---

## Production Operations

### 29. Production Health Check

```cypher
// Verify all critical capabilities are deployed
MATCH (cap:BusinessCapability)
WHERE cap.criticality IN ['Critical', 'High']
OPTIONAL MATCH (cap)-[:ENABLED_BY]->(comp:Component)
      -[:INSTALLED_ON]->(srv:Server {environment: 'prod'})
WITH cap, collect(DISTINCT srv.name) as ProdServers
RETURN cap.name as Capability,
       cap.criticality as Criticality,
       CASE WHEN size(ProdServers) > 0 THEN 'Deployed' ELSE 'NOT DEPLOYED' END as Status,
       ProdServers
ORDER BY Status, cap.criticality DESC
```

**Use Case:** Production readiness verification

### 30. Multi-Datacenter Verification

```cypher
// Verify critical components are in multiple datacenters
MATCH (c:Component)-[:INSTALLED_ON]->(s:Server {environment: 'prod'})
WITH c, collect(DISTINCT s.datacenter) as Datacenters
RETURN c.name as Component,
       Datacenters,
       CASE WHEN size(Datacenters) > 1 THEN 'Multi-DC ✓' ELSE 'Single DC ⚠' END as DRStatus
ORDER BY size(Datacenters), c.name
```

**Use Case:** Disaster recovery compliance check

### 31. Environment Parity Check

```cypher
// Compare component deployment across environments
MATCH (c:Component)-[:INSTALLED_ON]->(s:Server)
WITH c.name as Component, s.environment as Env, count(s) as Count
RETURN Component,
       collect({environment: Env, servers: Count}) as Deployments
ORDER BY Component
```

**Use Case:** Ensure UAT mirrors production

### 32. Technology Stack Summary

```cypher
// All technologies in use
MATCH (app:Application)-[:HAS_COMPONENT]->(comp:Component)
RETURN comp.technology as Technology,
       collect(DISTINCT app.name) as Applications,
       collect(DISTINCT comp.name) as Components,
       count(DISTINCT comp) as ComponentCount
ORDER BY ComponentCount DESC
```

**Use Case:** Technology rationalization and standardization

---

## Advanced Queries

### 33. Complete End-to-End Traceability

```cypher
// From requirement through to production servers
MATCH (req:Requirement)-[:IMPLEMENTED_BY]->(comp:Component)
      <-[:HAS_COMPONENT]-(app:Application)
OPTIONAL MATCH (req)-[:SUPPORTS]->(cap:BusinessCapability)
OPTIONAL MATCH (comp)-[:INSTALLED_ON]->(srv:Server)
OPTIONAL MATCH (cap)-[crud:CREATE|READ|UPDATE|DEACTIVATE]->(data:DataObject)
RETURN req.name as Requirement,
       req.priority as Priority,
       cap.name as Capability,
       comp.name as Component,
       app.name as Application,
       collect(DISTINCT srv.environment + ':' + srv.name) as Deployments,
       collect(DISTINCT type(crud) + ':' + data.name) as DataOperations
ORDER BY req.priority DESC
```

**Use Case:** Complete traceability matrix for audits

### 34. Orphaned Resources Finder

```cypher
// Find components not deployed anywhere
MATCH (c:Component)
WHERE NOT (c)-[:INSTALLED_ON]->(:Server)
RETURN c.name as UndeployedComponent,
       c.application as Application,
       c.type as Type
ORDER BY c.name
```

**Use Case:** Identify unused or obsolete components

### 35. Cost Hotspot Analysis

```cypher
// Components consuming most server resources
MATCH (app:Application)-[:HAS_COMPONENT]->(comp:Component)
      -[:INSTALLED_ON]->(srv:Server {environment: 'prod'})
WITH comp, count(DISTINCT srv) as ServerCount, collect(srv.name) as Servers
WHERE ServerCount > 1
RETURN comp.name as Component,
       ServerCount,
       Servers
ORDER BY ServerCount DESC
```

**Use Case:** Infrastructure cost optimization

### 36. Find All Connected Nodes (Graph Traversal)

```cypher
// Find all nodes connected to Payment Processing capability
MATCH (b:BusinessCapability {name: "Payment Processing"})-[*1..5]-(connected)
RETURN DISTINCT labels(connected)[0] as NodeType,
       connected.name as Name,
       connected.id as ID
ORDER BY NodeType, Name
```

**Use Case:** Discover all entities related to a business capability

**Tip:** Adjust `[*1..5]` to control traversal depth (1-5 hops)

### 37. Visual Subgraph Explorer

```cypher
// Get visual subgraph for Neo4j Browser visualization
MATCH path = (b:BusinessCapability {name: "Payment Processing"})-[*1..5]-(connected)
RETURN path
LIMIT 200
```

**Use Case:** Visual exploration of relationship networks in Neo4j Browser

**Tip:** Adjust LIMIT to control visualization complexity

### 38. Connection Analysis by Distance

```cypher
// Group connected nodes by how many hops away they are
MATCH path = (b:BusinessCapability {name: "Payment Processing"})-[*1..5]-(connected)
WITH DISTINCT connected, length(path) as distance, labels(connected)[0] as nodeType
RETURN nodeType as NodeType,
       distance as Hops,
       collect(connected.name) as Nodes,
       count(connected) as Count
ORDER BY Hops, NodeType
```

**Use Case:** Understand layers of connectivity (direct vs indirect relationships)

### 39. Bidirectional Dependency Analysis

```cypher
// Separate what depends on this capability vs what it depends on
MATCH (b:BusinessCapability {name: "Payment Processing"})

// What this capability depends on (outgoing)
OPTIONAL MATCH outPath = (b)-[outRel*1..3]->(out)
WITH b, collect(DISTINCT {
  type: labels(out)[0],
  name: out.name,
  relationships: [r in relationships(outPath) | type(r)]
}) as dependencies

// What depends on this capability (incoming)
OPTIONAL MATCH inPath = (b)<-[inRel*1..3]-(in)
WITH b, dependencies, collect(DISTINCT {
  type: labels(in)[0],
  name: in.name,
  relationships: [r in relationships(inPath) | type(r)]
}) as dependents

RETURN b.name as Capability,
       dependencies as DependsOn,
       dependents as DependedOnBy
```

**Use Case:** Complete dependency mapping for impact analysis

### 40. Filtered Traversal (Deployment Path Only)

```cypher
// Follow only deployment-related relationships
MATCH path = (app:Application {name: "Payment Service"})
             -[:HAS_COMPONENT|INSTALLED_ON*1..3]-(connected)
RETURN DISTINCT labels(connected)[0] as NodeType,
       connected.name as Name,
       length(path) as Hops
ORDER BY Hops, NodeType, Name
```

**Use Case:** Trace deployment path from application to servers

**Tip:** Replace relationship types to focus on specific paths (e.g., data flow, capability implementation)

---

## GraphQL Traversal Queries

GraphQL provides an alternative approach to graph traversal using nested queries instead of Cypher's variable-length paths. These queries assume a GraphQL endpoint is available.

### 41. Business Capability Network (GraphQL)

```graphql
query GetCapabilityNetwork {
  businessCapability(name: "Payment Processing") {
    name
    criticality

    # Components (1 hop)
    enabledBy {
      name
      technology

      # Applications (2 hops)
      application {
        name
        businessValue
      }

      # Deployments (2 hops)
      installedOn {
        name
        environment
        ip

        # Load balanced servers (3 hops)
        loadBalancesWith {
          name
          environment
        }
      }

      # Data access (2 hops)
      modifies {
        name
        sensitivity
      }
      reads {
        name
        sensitivity
      }
    }

    # Data operations (1 hop)
    creates {
      name
      sensitivity
    }
    readsData {
      name
      sensitivity
    }
  }
}
```

**Use Case:** Explore complete network around a business capability

**Cypher Equivalent:** Query 36 (Find All Connected Nodes)

### 42. Application Deployment View (GraphQL)

```graphql
query GetApplicationDeployment {
  application(name: "Payment Service") {
    name
    type
    businessValue

    # Components (1 hop)
    components {
      name
      technology

      # Server deployments (2 hops)
      installedOn {
        name
        hostname
        ip
        environment
        datacenter
        cpu
        memory
        status

        # Load balancing (3 hops)
        loadBalancesWith {
          name
          environment
        }
        worksWith {
          name
          purpose
        }
      }

      # Data access (2 hops)
      modifies {
        name
        type
        sensitivity
      }
      reads {
        name
        type
        sensitivity
      }
    }

    # Capabilities (1 hop)
    implementsCapability {
      name
      criticality
    }
  }
}
```

**Use Case:** Complete deployment view from application to infrastructure

**Cypher Equivalent:** Query 40 (Filtered Traversal - Deployment Path)

### 43. Server Failure Impact (GraphQL)

```graphql
query GetServerImpact {
  server(name: "api-prod-01") {
    name
    environment
    status

    # Components on server (1 hop)
    hosts {
      name
      technology

      # Applications affected (2 hops)
      application {
        name
        businessValue

        # Capabilities impacted (3 hops)
        implementsCapability {
          name
          criticality
        }
      }

      # Data at risk (2 hops)
      modifies {
        name
        sensitivity
      }
    }

    # Related servers (1 hop)
    loadBalancesWith {
      name
      environment
    }
    worksWith {
      name
      purpose
    }
  }
}
```

**Use Case:** Assess blast radius of server failure

**Cypher Equivalent:** Query 28 (Server Failure Impact Analysis)

### 44. Data Lineage Network (GraphQL)

```graphql
query GetDataLineage {
  dataObject(name: "PaymentTransactionTable") {
    name
    type
    database
    sensitivity
    application

    # Write access (1 hop)
    modifiedBy {
      name
      technology

      # Applications (2 hops)
      application {
        name
        businessValue
      }

      # Deployments (2 hops)
      installedOn {
        name
        environment
        datacenter
      }
    }

    # Read access (1 hop)
    readBy {
      name
      technology

      # Applications (2 hops)
      application {
        name
        businessValue
      }
    }

    # Business operations (1 hop)
    createdBy {
      name
      criticality
    }
    readByCapability {
      name
      criticality
    }
    updatedBy {
      name
      criticality
    }
  }
}
```

**Use Case:** Complete data access audit trail

**Cypher Equivalent:** Query 18 (Data Lineage Analysis)

### 45. GraphQL vs Cypher Quick Comparison

**GraphQL Advantages:**
- ✅ Type-safe queries
- ✅ Fetch exactly what you need
- ✅ Single endpoint for all data
- ✅ Great for client applications

**Cypher Advantages:**
- ✅ Variable-length paths `[*1..5]`
- ✅ Ad-hoc pattern matching
- ✅ Complex graph algorithms
- ✅ Better for exploration

**When to Use Each:**

| Scenario | Use |
|----------|-----|
| Building a UI dashboard | GraphQL |
| Exploratory data analysis | Cypher |
| Known query patterns | GraphQL |
| Unknown relationship depth | Cypher |
| Client applications | GraphQL |
| Database admin tasks | Cypher |

**Tip:** Use both! GraphQL for structured UI queries, Cypher for analysis and reporting.

---

## Tips for Using This Manual

### Copy-Paste Workflow

1. Find the query you need
2. Copy the entire code block
3. Paste into Neo4j Browser (http://localhost:7474)
4. Customize entity names if needed (e.g., change 'Customer Portal' to your app)
5. Run the query

### Modifying Queries

**Change the application:**
```cypher
// Original
MATCH (app:Application {name: 'Customer Portal'})

// Modified
MATCH (app:Application {name: 'Your App Name'})
```

**Change the environment:**
```cypher
// Original
MATCH (s:Server {environment: 'prod'})

// Modified
MATCH (s:Server {environment: 'uat'})
```

**Add filters:**
```cypher
// Add WHERE clause
MATCH (app:Application)
WHERE app.businessValue = 'Critical'
RETURN app.name
```

### Exporting Results

In Neo4j Browser:
- **CSV**: Click the download icon in results panel
- **JSON**: Use `RETURN` with `collect()` functions
- **Graph**: Click camera icon to save visualization

---

## Quick Reference

### Common Patterns

**Find by name:**
```cypher
MATCH (n:NodeType {name: 'ExactName'})
```

**Find by partial name:**
```cypher
MATCH (n:NodeType)
WHERE n.name CONTAINS 'Partial'
```

**Follow relationship:**
```cypher
MATCH (a:TypeA)-[:REL_TYPE]->(b:TypeB)
```

**Optional match (left join):**
```cypher
OPTIONAL MATCH (a)-[:REL_TYPE]->(b)
```

**Count related items:**
```cypher
WITH a, count(b) as RelatedCount
```

**Filter by multiple values:**
```cypher
WHERE n.field IN ['Value1', 'Value2']
```

### Performance Tips

- Use indexes on frequently queried properties
- Limit results for exploratory queries (`LIMIT 100`)
- Use `PROFILE` to analyze query performance
- Avoid `OPTIONAL MATCH` on large datasets when not needed

---

## Next Steps

After exploring these queries:

1. **Customize** - Adapt queries for your specific use cases
2. **Automate** - Build dashboards using these patterns
3. **Share** - Create a query library for your team
4. **Extend** - Add more data sources and relationships
5. **Monitor** - Track data quality and freshness

For more comprehensive documentation, see `SAMPLE-QUERIES.md`.

**Happy querying! 🚀**
