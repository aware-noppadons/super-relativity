# Component-Level Architecture Queries

## Overview

This document demonstrates component-level architecture analysis, showing how individual application components interact with data objects through **MODIFIES** and **READS** relationships.

## Data Model

### Entities
- **Application** (10 nodes) - Software applications
- **Component** (8 nodes) - Application components/modules
- **DataObject** (12 nodes) - Database tables and data stores

### Relationships
- **HAS_COMPONENT** (8 relationships) - Application contains Component
- **MODIFIES** (4 relationships) - Component modifies DataObject (write operations)
- **READS** (8 relationships) - Component reads DataObject (read operations)

---

## Example: App A Component A.1 Modifies Data X, Component A.2 Reads Data X

### Real-World Scenario

**Application**: Customer Portal (APP-123)
- **Component A.1**: Registration Form (COMP-001) - **MODIFIES** CustomerTable
- **Component A.2**: Status Dashboard (COMP-002) - **READS** CustomerTable

This pattern shows:
1. Registration Form creates/updates customer records
2. Status Dashboard displays those customer records
3. Both components belong to the same application but have different data access patterns

### Query: Component-Level Data Flow

```cypher
// Find components that modify data that other components read
MATCH (app:Application {name: 'Customer Portal'})
      -[:HAS_COMPONENT]->(comp1:Component)
      -[:MODIFIES]->(data:DataObject)
      <-[:READS]-(comp2:Component)
      <-[:HAS_COMPONENT]-(app)
RETURN app.name as Application,
       comp1.name as ComponentModifies,
       data.name as DataObject,
       comp2.name as ComponentReads
```

**Results:**
| Application | ComponentModifies | DataObject | ComponentReads |
|-------------|------------------|------------|----------------|
| Customer Portal | Registration Form | CustomerTable | Status Dashboard |
| Customer Portal | Registration Form | CustomerTable | Authentication Service |
| Customer Portal | Registration Form | ApplicationTable | Status Dashboard |

### Visualization Query

```cypher
// Visualize complete component-level architecture for Customer Portal
MATCH (app:Application {name: 'Customer Portal'})
      -[:HAS_COMPONENT]->(comp)
OPTIONAL MATCH (comp)-[r:MODIFIES|READS]->(data:DataObject)
RETURN app, comp, r, data
```

---

## Component-Level Analysis Queries

### 1. View All Components by Application

```cypher
// List all components grouped by application
MATCH (app:Application)-[:HAS_COMPONENT]->(comp:Component)
RETURN app.name as Application,
       collect(comp.name) as Components,
       count(comp) as ComponentCount
ORDER BY ComponentCount DESC, app.name
```

### 2. Component Data Access Patterns

```cypher
// Show read vs write patterns for each component
MATCH (comp:Component)
OPTIONAL MATCH (comp)-[:MODIFIES]->(modData)
OPTIONAL MATCH (comp)-[:READS]->(readData)
WITH comp,
     collect(DISTINCT modData.name) as ModifiesData,
     collect(DISTINCT readData.name) as ReadsData
WHERE size(ModifiesData) > 0 OR size(ReadsData) > 0
RETURN comp.name as Component,
       comp.type as Type,
       ModifiesData,
       ReadsData,
       size(ModifiesData) as WriteCount,
       size(ReadsData) as ReadCount
ORDER BY WriteCount DESC, ReadCount DESC
```

**Example Results:**
| Component | Type | ModifiesData | ReadsData | WriteCount | ReadCount |
|-----------|------|--------------|-----------|------------|-----------|
| Registration Form | UI Component | [CustomerTable, ApplicationTable] | [] | 2 | 0 |
| Status Dashboard | UI Component | [] | [CustomerTable, ApplicationTable] | 0 | 2 |
| Application Validator | Service Layer | [ApplicationTable] | [CustomerTable] | 1 | 1 |

### 3. Find Read-Write Conflicts (Same Component)

```cypher
// Find components that both read and write to the same data object
MATCH (comp:Component)-[:MODIFIES]->(data:DataObject)
MATCH (comp)-[:READS]->(data)
RETURN comp.name as Component,
       comp.type as Type,
       data.name as DataObject,
       'READ-WRITE on same data' as Pattern
ORDER BY comp.name
```

### 4. Data Object Access Analysis

```cypher
// For each data object, show which components read vs modify it
MATCH (data:DataObject)
OPTIONAL MATCH (modComp:Component)-[:MODIFIES]->(data)
OPTIONAL MATCH (readComp:Component)-[:READS]->(data)
RETURN data.name as DataObject,
       data.sensitivity as Sensitivity,
       collect(DISTINCT modComp.name) as ModifiedBy,
       collect(DISTINCT readComp.name) as ReadBy,
       count(DISTINCT modComp) as WriterCount,
       count(DISTINCT readComp) as ReaderCount
ORDER BY data.sensitivity DESC, WriterCount DESC
```

**Example Results:**
| DataObject | Sensitivity | ModifiedBy | ReadBy | WriterCount | ReaderCount |
|------------|-------------|------------|--------|-------------|-------------|
| CustomerTable | PII | [Registration Form] | [Status Dashboard, Authentication Service, Validator, Fraud Detector] | 1 | 4 |
| ApplicationTable | Standard | [Registration Form, Validator] | [Status Dashboard, Fraud Detector] | 2 | 2 |

### 5. Cross-Application Component Data Sharing

```cypher
// Find data objects accessed by components from different applications
MATCH (app1:Application)-[:HAS_COMPONENT]->(comp1:Component)
      -[:MODIFIES|READS]->(data:DataObject)
      <-[:MODIFIES|READS]-(comp2:Component)
      <-[:HAS_COMPONENT]-(app2:Application)
WHERE app1 <> app2
RETURN data.name as SharedDataObject,
       app1.name as Application1,
       comp1.name as Component1,
       app2.name as Application2,
       comp2.name as Component2,
       data.sensitivity as Sensitivity
ORDER BY data.sensitivity DESC
```

---

## Advanced Component Queries

### 6. Component Dependency Chain

```cypher
// Find data flow chains: Component1 -> Data -> Component2 -> Data2
MATCH path = (comp1:Component)-[:MODIFIES]->(data1:DataObject)
             <-[:READS]-(comp2:Component)-[:MODIFIES]->(data2:DataObject)
WHERE comp1 <> comp2
RETURN comp1.name as SourceComponent,
       data1.name as IntermediateData,
       comp2.name as TargetComponent,
       data2.name as FinalData,
       length(path) as PathLength
ORDER BY comp1.name
```

### 7. Component Technology Stack with Data Access

```cypher
// Show which technologies are accessing which data
MATCH (comp:Component)-[r:MODIFIES|READS]->(data:DataObject)
RETURN comp.technology as Technology,
       type(r) as AccessType,
       collect(DISTINCT data.name) as DataObjects,
       count(data) as DataObjectCount
ORDER BY Technology, AccessType
```

**Example Results:**
| Technology | AccessType | DataObjects | DataObjectCount |
|------------|-----------|-------------|-----------------|
| FastAPI | MODIFIES | [DocumentStorage] | 1 |
| FastAPI | READS | [DocumentStorage] | 1 |
| Java Spring | MODIFIES | [ApplicationTable] | 1 |
| Java Spring | READS | [CustomerTable, ApplicationTable] | 2 |
| React | MODIFIES | [CustomerTable, ApplicationTable] | 2 |
| React | READS | [CustomerTable, ApplicationTable] | 2 |

### 8. PII Data Access at Component Level

```cypher
// Find all components accessing PII data with access type
MATCH (app:Application)-[:HAS_COMPONENT]->(comp:Component)
      -[r:MODIFIES|READS]->(data:DataObject {sensitivity: 'PII'})
RETURN app.name as Application,
       comp.name as Component,
       comp.type as ComponentType,
       type(r) as AccessType,
       data.name as PIIData,
       data.columns as PIIColumns
ORDER BY app.name, AccessType DESC
```

### 9. Component Blast Radius

```cypher
// Find impact radius if a component fails or changes
MATCH (comp:Component {name: 'Registration Form'})
OPTIONAL MATCH (comp)-[:MODIFIES]->(modData:DataObject)
OPTIONAL MATCH (modData)<-[:READS]-(impactedComp:Component)
OPTIONAL MATCH (impactedComp)<-[:HAS_COMPONENT]-(impactedApp:Application)
RETURN comp.name as Component,
       collect(DISTINCT modData.name) as DataModified,
       collect(DISTINCT impactedComp.name) as ImpactedComponents,
       collect(DISTINCT impactedApp.name) as ImpactedApplications,
       count(DISTINCT impactedComp) as ImpactRadius
```

**Example Result:**
| Component | DataModified | ImpactedComponents | ImpactedApplications | ImpactRadius |
|-----------|-------------|-------------------|---------------------|--------------|
| Registration Form | [CustomerTable, ApplicationTable] | [Status Dashboard, Auth Service, Validator, Fraud Detector] | [Customer Portal, App Processing API] | 4 |

### 10. Read-Only vs Read-Write Components

```cypher
// Classify components by their data access patterns
MATCH (comp:Component)
OPTIONAL MATCH (comp)-[:MODIFIES]->()
OPTIONAL MATCH (comp)-[:READS]->()
WITH comp,
     count(DISTINCT CASE WHEN exists((comp)-[:MODIFIES]->()) THEN 1 END) as writeCount,
     count(DISTINCT CASE WHEN exists((comp)-[:READS]->()) THEN 1 END) as readCount
RETURN CASE
         WHEN writeCount > 0 AND readCount > 0 THEN 'Read-Write'
         WHEN writeCount > 0 THEN 'Write-Only'
         WHEN readCount > 0 THEN 'Read-Only'
         ELSE 'No Data Access'
       END as ComponentType,
       collect(comp.name) as Components,
       count(comp) as Count
ORDER BY Count DESC
```

---

## Application Architecture Patterns

### 11. Complete Application Component Architecture

```cypher
// Full architecture view for one application
MATCH (app:Application {name: 'Customer Portal'})
OPTIONAL MATCH (app)-[:HAS_COMPONENT]->(comp:Component)
OPTIONAL MATCH (comp)-[r:MODIFIES|READS]->(data:DataObject)
RETURN app.name as Application,
       comp.name as Component,
       comp.type as ComponentType,
       comp.technology as Technology,
       type(r) as AccessType,
       data.name as DataObject,
       data.sensitivity as Sensitivity
ORDER BY comp.name, AccessType DESC
```

### 12. Component Responsibilities Matrix

```cypher
// Show component responsibilities with data access
MATCH (comp:Component)
WHERE size(comp.responsibilities) > 0
OPTIONAL MATCH (comp)-[:MODIFIES]->(modData)
OPTIONAL MATCH (comp)-[:READS]->(readData)
RETURN comp.name as Component,
       comp.responsibilities as Responsibilities,
       collect(DISTINCT modData.name) as Modifies,
       collect(DISTINCT readData.name) as Reads
ORDER BY comp.name
```

### 13. Data Flow Diagram Query

```cypher
// Generate data for a data flow diagram
MATCH (app:Application)-[:HAS_COMPONENT]->(comp:Component)
      -[r:MODIFIES|READS]->(data:DataObject)
RETURN app.name as Application,
       comp.name as Component,
       type(r) as Operation,
       data.name as DataObject,
       data.type as DataType,
       CASE type(r)
         WHEN 'MODIFIES' THEN 'Write'
         WHEN 'READS' THEN 'Read'
       END as Direction
ORDER BY app.name, comp.name, Direction DESC
```

---

## Security and Compliance Queries

### 14. Component-Level PII Access Audit

```cypher
// Audit trail: Which components can modify PII data
MATCH (app:Application)-[:HAS_COMPONENT]->(comp:Component)
      -[:MODIFIES]->(data:DataObject)
WHERE data.sensitivity = 'PII'
RETURN app.name as Application,
       comp.name as Component,
       comp.type as ComponentType,
       comp.technology as Technology,
       data.name as PIIDataObject,
       data.database as Database,
       comp.responsibilities as ComponentResponsibilities
ORDER BY app.name, comp.name
```

### 15. Unauthorized Data Access Detection

```cypher
// Find components with unexpected data access patterns
// (Example: UI components should not directly modify database tables)
MATCH (comp:Component)-[:MODIFIES]->(data:DataObject {type: 'Database Table'})
WHERE comp.type CONTAINS 'UI'
RETURN comp.name as UIComponent,
       comp.technology as Technology,
       data.name as DatabaseTable,
       'POTENTIAL ARCHITECTURE VIOLATION: UI directly modifying database' as Warning
```

---

## Statistics and Reports

### 16. Component-Level Architecture Statistics

```cypher
// Overall component architecture metrics
MATCH (app:Application)
WITH count(app) as AppCount
MATCH (comp:Component)
WITH AppCount, count(comp) as CompCount
MATCH ()-[m:MODIFIES]->()
WITH AppCount, CompCount, count(m) as ModifyCount
MATCH ()-[r:READS]->()
WITH AppCount, CompCount, ModifyCount, count(r) as ReadCount
MATCH ()-[h:HAS_COMPONENT]->()
RETURN AppCount as Applications,
       CompCount as Components,
       count(h) as ComponentRelationships,
       ModifyCount as WriteOperations,
       ReadCount as ReadOperations,
       CompCount * 1.0 / AppCount as AvgComponentsPerApp
```

### 17. Data Hotspots

```cypher
// Find most accessed data objects at component level
MATCH (data:DataObject)
OPTIONAL MATCH (data)<-[r:MODIFIES|READS]-()
WITH data, count(r) as AccessCount, type(r) as AccessType
RETURN data.name as DataObject,
       data.sensitivity as Sensitivity,
       AccessCount,
       collect(AccessType) as AccessTypes
ORDER BY AccessCount DESC
LIMIT 10
```

---

## Export Queries

### 18. Export Component-Data Mapping for Documentation

```cypher
// Export format suitable for documentation
MATCH (app:Application)-[:HAS_COMPONENT]->(comp:Component)
OPTIONAL MATCH (comp)-[:MODIFIES]->(modData:DataObject)
OPTIONAL MATCH (comp)-[:READS]->(readData:DataObject)
RETURN app.id as ApplicationID,
       app.name as ApplicationName,
       comp.id as ComponentID,
       comp.name as ComponentName,
       comp.type as ComponentType,
       comp.technology as Technology,
       collect(DISTINCT modData.name) as ModifiesData,
       collect(DISTINCT readData.name) as ReadsData,
       comp.description as Description,
       comp.responsibilities as Responsibilities
ORDER BY app.name, comp.name
```

---

## Quick Reference

### Key Component Patterns

1. **Write-Then-Read Pattern**: Component modifies data, other components read it
   ```cypher
   MATCH (c1)-[:MODIFIES]->(d)<-[:READS]-(c2)
   WHERE c1 <> c2
   ```

2. **Shared Data Access**: Multiple components accessing same data
   ```cypher
   MATCH (d:DataObject)<-[:MODIFIES|READS]-(c:Component)
   WITH d, count(c) as accessors
   WHERE accessors > 2
   ```

3. **Cross-Application Data Sharing**: Components from different apps accessing same data
   ```cypher
   MATCH (app1)-[:HAS_COMPONENT]->(c1)-[:MODIFIES|READS]->(d)
         <-[:MODIFIES|READS]-(c2)<-[:HAS_COMPONENT]-(app2)
   WHERE app1 <> app2
   ```

---

## Best Practices

1. **Use Component-Level Queries For**:
   - Detailed impact analysis
   - Data lineage tracking
   - Security audits
   - Architecture documentation
   - Performance optimization

2. **Performance Tips**:
   - Use specific component or application names when possible
   - Add LIMIT clauses for large result sets
   - Create indexes on component.name and component.application

3. **Visualization**:
   - Use Neo4j Browser for interactive exploration
   - Export results to CSV for documentation
   - Use graph visualization for architecture diagrams

---

**Last Updated**: December 24, 2025
**Data Model Version**: 2.0.0 (with Components)
**Total Components**: 8
**Component Relationships**: 20 (8 HAS_COMPONENT + 4 MODIFIES + 8 READS)
