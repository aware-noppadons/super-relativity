// Super Relativity - Neo4j Schema Initialization
// Creates constraints, indexes, and sample data

// ============================================================================
// CONSTRAINTS - Ensure data integrity
// ============================================================================

// Requirements
CREATE CONSTRAINT requirement_id IF NOT EXISTS
FOR (r:Requirement) REQUIRE r.id IS UNIQUE;

// Applications
CREATE CONSTRAINT application_id IF NOT EXISTS
FOR (a:Application) REQUIRE a.id IS UNIQUE;

// Code Components
CREATE CONSTRAINT code_component_id IF NOT EXISTS
FOR (c:CodeComponent) REQUIRE c.id IS UNIQUE;

// Data Objects
CREATE CONSTRAINT data_object_id IF NOT EXISTS
FOR (d:DataObject) REQUIRE d.id IS UNIQUE;

// Infrastructure
CREATE CONSTRAINT infrastructure_id IF NOT EXISTS
FOR (i:Infrastructure) REQUIRE i.id IS UNIQUE;

// Repositories
CREATE CONSTRAINT repository_url IF NOT EXISTS
FOR (r:Repository) REQUIRE r.url IS UNIQUE;

// Diagrams
CREATE CONSTRAINT diagram_id IF NOT EXISTS
FOR (d:Diagram) REQUIRE d.id IS UNIQUE;

// Business Capabilities
CREATE CONSTRAINT capability_id IF NOT EXISTS
FOR (c:BusinessCapability) REQUIRE c.id IS UNIQUE;

// ============================================================================
// INDEXES - Improve query performance
// ============================================================================

// Text search indexes
CREATE INDEX requirement_name IF NOT EXISTS
FOR (r:Requirement) ON (r.name);

CREATE INDEX application_name IF NOT EXISTS
FOR (a:Application) ON (a.name);

CREATE INDEX code_component_name IF NOT EXISTS
FOR (c:CodeComponent) ON (c.name);

CREATE INDEX data_object_name IF NOT EXISTS
FOR (d:DataObject) ON (d.name);

// Property indexes for filtering
CREATE INDEX application_lifecycle IF NOT EXISTS
FOR (a:Application) ON (a.lifecycle);

CREATE INDEX requirement_priority IF NOT EXISTS
FOR (r:Requirement) ON (r.priority);

CREATE INDEX data_object_sensitivity IF NOT EXISTS
FOR (d:DataObject) ON (d.sensitivity);

CREATE INDEX capability_criticality IF NOT EXISTS
FOR (c:BusinessCapability) ON (c.criticality);

CREATE INDEX capability_level IF NOT EXISTS
FOR (c:BusinessCapability) ON (c.level);

// Full-text search indexes
CALL db.index.fulltext.createNodeIndex(
  'searchAllEntities',
  ['Requirement', 'Application', 'CodeComponent', 'DataObject', 'Infrastructure', 'BusinessCapability'],
  ['name', 'description']
) IF NOT EXISTS;

// ============================================================================
// SAMPLE DATA - Initial dataset for POC
// ============================================================================

// Sample Requirements
CREATE (r1:Requirement {
  id: 'REQ-001',
  name: 'Enable customer self-service application submission',
  type: 'Functional Requirement',
  priority: 'High',
  status: 'Approved',
  owner: 'Product Team',
  description: 'Allow customers to submit applications online without agent assistance',
  createdDate: datetime('2025-01-15'),
  source: 'leanix'
})

CREATE (r2:Requirement {
  id: 'REQ-002',
  name: 'Real-time application status tracking',
  type: 'Functional Requirement',
  priority: 'Medium',
  status: 'Approved',
  owner: 'Product Team',
  description: 'Provide customers with real-time updates on application status',
  createdDate: datetime('2025-01-20'),
  source: 'leanix'
})

CREATE (r3:Requirement {
  id: 'REQ-003',
  name: 'Secure document upload and storage',
  type: 'Non-Functional Requirement',
  priority: 'High',
  status: 'Approved',
  owner: 'Security Team',
  description: 'Ensure PII data is encrypted in transit and at rest',
  createdDate: datetime('2025-01-18'),
  source: 'leanix'
});

// Sample Applications
CREATE (a1:Application {
  id: 'APP-123',
  name: 'Customer Portal',
  type: 'Web Application',
  businessValue: 'High',
  technicalFit: 'Good',
  lifecycle: 'Active',
  techStack: ['React 18', 'Node.js 20', 'PostgreSQL 15'],
  owner: 'Digital Experience Team',
  users: 50000,
  costPerYear: 250000,
  source: 'leanix'
})

CREATE (a2:Application {
  id: 'APP-456',
  name: 'Application Processing API',
  type: 'Backend Service',
  businessValue: 'High',
  technicalFit: 'Excellent',
  lifecycle: 'Active',
  techStack: ['Java 17', 'Spring Boot 3', 'PostgreSQL 15'],
  owner: 'Backend Services Team',
  transactions: 1000000,
  costPerYear: 180000,
  source: 'leanix'
})

CREATE (a3:Application {
  id: 'APP-789',
  name: 'Document Management Service',
  type: 'Microservice',
  businessValue: 'Medium',
  technicalFit: 'Good',
  lifecycle: 'Active',
  techStack: ['Python 3.11', 'FastAPI', 'AWS S3'],
  owner: 'Platform Team',
  documents: 5000000,
  costPerYear: 120000,
  source: 'leanix'
});

// Sample Data Objects
CREATE (d1:DataObject {
  id: 'DATA-789',
  name: 'CustomerTable',
  type: 'Database Table',
  database: 'customer_db',
  schema: 'public',
  sensitivity: 'PII',
  columns: ['id', 'name', 'email', 'phone', 'address', 'ssn_encrypted'],
  recordCount: 1500000,
  growthRate: '10% annually',
  source: 'leanix'
})

CREATE (d2:DataObject {
  id: 'DATA-012',
  name: 'ApplicationTable',
  type: 'Database Table',
  database: 'application_db',
  schema: 'public',
  sensitivity: 'Standard',
  columns: ['id', 'customer_id', 'status', 'submitted_date', 'type', 'amount'],
  recordCount: 3000000,
  growthRate: '15% annually',
  source: 'leanix'
})

CREATE (d3:DataObject {
  id: 'DATA-345',
  name: 'DocumentStorage',
  type: 'Object Storage',
  location: 'AWS S3',
  bucket: 'prod-documents',
  sensitivity: 'PII',
  retention: '7 years',
  sizeGB: 5000,
  encryption: 'AES-256',
  source: 'leanix'
});

// Sample Code Components
CREATE (c1:CodeComponent {
  id: 'CODE-001',
  name: 'ApplicationSubmissionService',
  type: 'Class',
  language: 'Java',
  repository: 'github.com/org/app-processing-api',
  filePath: '/src/main/java/com/company/services/ApplicationSubmissionService.java',
  startLine: 15,
  endLine: 234,
  complexity: 12,
  lastModified: datetime('2025-12-10'),
  lastAuthor: 'john.doe@company.com',
  source: 'code-parser'
})

CREATE (c2:CodeComponent {
  id: 'CODE-002',
  name: 'submitApplication',
  type: 'Method',
  language: 'Java',
  repository: 'github.com/org/app-processing-api',
  filePath: '/src/main/java/com/company/services/ApplicationSubmissionService.java',
  startLine: 45,
  endLine: 89,
  complexity: 8,
  lastModified: datetime('2025-12-10'),
  lastAuthor: 'john.doe@company.com',
  source: 'code-parser'
})

CREATE (c3:CodeComponent {
  id: 'CODE-003',
  name: 'validateCustomer',
  type: 'Method',
  language: 'Java',
  repository: 'github.com/org/app-processing-api',
  filePath: '/src/main/java/com/company/services/ApplicationSubmissionService.java',
  startLine: 91,
  endLine: 125,
  complexity: 6,
  lastModified: datetime('2025-12-05'),
  lastAuthor: 'jane.smith@company.com',
  source: 'code-parser'
});

// Sample Infrastructure
CREATE (i1:Infrastructure {
  id: 'SERVER-001',
  name: 'customer-portal-prod-01',
  type: 'EC2 Instance',
  provider: 'AWS',
  region: 'us-east-1',
  instanceType: 't3.large',
  cpu: 2,
  memoryGB: 8,
  status: 'Running',
  costMonthly: 150,
  source: 'infrastructure-discovery'
})

CREATE (i2:Infrastructure {
  id: 'SERVER-002',
  name: 'app-api-prod-01',
  type: 'EC2 Instance',
  provider: 'AWS',
  region: 'us-east-1',
  instanceType: 't3.xlarge',
  cpu: 4,
  memoryGB: 16,
  status: 'Running',
  costMonthly: 300,
  source: 'infrastructure-discovery'
})

CREATE (i3:Infrastructure {
  id: 'DB-001',
  name: 'customer-db-prod',
  type: 'RDS PostgreSQL',
  provider: 'AWS',
  region: 'us-east-1',
  instanceType: 'db.r5.large',
  storage: 500,
  status: 'Available',
  costMonthly: 450,
  source: 'infrastructure-discovery'
});

// ============================================================================
// RELATIONSHIPS - Create connections between entities
// ============================================================================

// Requirements → Applications
MATCH (r:Requirement {id: 'REQ-001'}), (a:Application {id: 'APP-123'})
CREATE (r)-[:IMPLEMENTED_BY {confidence: 1.0, source: 'leanix'}]->(a);

MATCH (r:Requirement {id: 'REQ-001'}), (a:Application {id: 'APP-456'})
CREATE (r)-[:IMPLEMENTED_BY {confidence: 1.0, source: 'leanix'}]->(a);

MATCH (r:Requirement {id: 'REQ-002'}), (a:Application {id: 'APP-123'})
CREATE (r)-[:IMPLEMENTED_BY {confidence: 1.0, source: 'leanix'}]->(a);

MATCH (r:Requirement {id: 'REQ-003'}), (a:Application {id: 'APP-789'})
CREATE (r)-[:IMPLEMENTED_BY {confidence: 1.0, source: 'leanix'}]->(a);

// Applications → Code Components
MATCH (a:Application {id: 'APP-456'}), (c:CodeComponent {id: 'CODE-001'})
CREATE (a)-[:CONTAINS]->(c);

MATCH (c1:CodeComponent {id: 'CODE-001'}), (c2:CodeComponent {id: 'CODE-002'})
CREATE (c1)-[:CONTAINS]->(c2);

MATCH (c1:CodeComponent {id: 'CODE-001'}), (c3:CodeComponent {id: 'CODE-003'})
CREATE (c1)-[:CONTAINS]->(c3);

// Code → Data Objects
MATCH (c:CodeComponent {id: 'CODE-002'}), (d:DataObject {id: 'DATA-789'})
CREATE (c)-[:USES {operations: ['READ'], frequency: 'High', source: 'code-parser'}]->(d);

MATCH (c:CodeComponent {id: 'CODE-002'}), (d:DataObject {id: 'DATA-012'})
CREATE (c)-[:USES {operations: ['WRITE'], frequency: 'High', source: 'code-parser'}]->(d);

MATCH (c:CodeComponent {id: 'CODE-003'}), (d:DataObject {id: 'DATA-789'})
CREATE (c)-[:USES {operations: ['READ'], frequency: 'Medium', source: 'code-parser'}]->(d);

// Applications → Data Objects (high-level)
MATCH (a:Application {id: 'APP-123'}), (d:DataObject {id: 'DATA-789'})
CREATE (a)-[:USES {operations: ['READ', 'WRITE'], source: 'leanix'}]->(d);

MATCH (a:Application {id: 'APP-456'}), (d:DataObject {id: 'DATA-012'})
CREATE (a)-[:USES {operations: ['READ', 'WRITE'], source: 'leanix'}]->(d);

MATCH (a:Application {id: 'APP-789'}), (d:DataObject {id: 'DATA-345'})
CREATE (a)-[:USES {operations: ['READ', 'WRITE'], source: 'leanix'}]->(d);

// Applications → Infrastructure
MATCH (a:Application {id: 'APP-123'}), (i:Infrastructure {id: 'SERVER-001'})
CREATE (a)-[:DEPLOYED_ON {environment: 'production'}]->(i);

MATCH (a:Application {id: 'APP-456'}), (i:Infrastructure {id: 'SERVER-002'})
CREATE (a)-[:DEPLOYED_ON {environment: 'production'}]->(i);

// Data Objects → Infrastructure
MATCH (d:DataObject {id: 'DATA-789'}), (i:Infrastructure {id: 'DB-001'})
CREATE (d)-[:STORED_IN]->(i);

MATCH (d:DataObject {id: 'DATA-012'}), (i:Infrastructure {id: 'DB-001'})
CREATE (d)-[:STORED_IN]->(i);

// ============================================================================
// VERIFICATION QUERIES
// ============================================================================

// Count nodes by type
MATCH (n:Requirement) RETURN 'Requirements' as Type, count(n) as Count
UNION
MATCH (n:Application) RETURN 'Applications' as Type, count(n) as Count
UNION
MATCH (n:CodeComponent) RETURN 'Code Components' as Type, count(n) as Count
UNION
MATCH (n:DataObject) RETURN 'Data Objects' as Type, count(n) as Count
UNION
MATCH (n:Infrastructure) RETURN 'Infrastructure' as Type, count(n) as Count;

// Count relationships by type
MATCH ()-[r:IMPLEMENTED_BY]->() RETURN 'IMPLEMENTED_BY' as Type, count(r) as Count
UNION
MATCH ()-[r:CONTAINS]->() RETURN 'CONTAINS' as Type, count(r) as Count
UNION
MATCH ()-[r:USES]->() RETURN 'USES' as Type, count(r) as Count
UNION
MATCH ()-[r:DEPLOYED_ON]->() RETURN 'DEPLOYED_ON' as Type, count(r) as Count
UNION
MATCH ()-[r:STORED_IN]->() RETURN 'STORED_IN' as Type, count(r) as Count;
