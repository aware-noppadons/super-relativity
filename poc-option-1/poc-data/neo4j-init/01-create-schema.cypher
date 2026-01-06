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

// Data Objects
CREATE CONSTRAINT data_object_id IF NOT EXISTS
FOR (d:DataObject) REQUIRE d.id IS UNIQUE;

// Business Capabilities
CREATE CONSTRAINT capability_id IF NOT EXISTS
FOR (c:BusinessCapability) REQUIRE c.id IS UNIQUE;

// Components
CREATE CONSTRAINT component_id IF NOT EXISTS
FOR (c:Component) REQUIRE c.id IS UNIQUE;

// Containers (C4 Model)
CREATE CONSTRAINT container_id IF NOT EXISTS
FOR (c:Container) REQUIRE c.id IS UNIQUE;

// Servers
CREATE CONSTRAINT server_id IF NOT EXISTS
FOR (s:Server) REQUIRE s.id IS UNIQUE;

// Application Changes
CREATE CONSTRAINT app_change_id IF NOT EXISTS
FOR (ac:AppChange) REQUIRE ac.id IS UNIQUE;

// Infrastructure Changes
CREATE CONSTRAINT infra_change_id IF NOT EXISTS
FOR (ic:InfraChange) REQUIRE ic.id IS UNIQUE;

// ============================================================================
// INDEXES - Improve query performance
// ============================================================================

// Text search indexes
CREATE INDEX requirement_name IF NOT EXISTS
FOR (r:Requirement) ON (r.name);

CREATE INDEX application_name IF NOT EXISTS
FOR (a:Application) ON (a.name);

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

// ============================================================================
// TIER 1 CRITICAL INDEXES - High-frequency properties (40+ queries)
// ============================================================================

// Name indexes for missing node types
CREATE INDEX component_name IF NOT EXISTS
FOR (c:Component) ON (c.name);

CREATE INDEX container_name IF NOT EXISTS
FOR (c:Container) ON (c.name);

CREATE INDEX server_name IF NOT EXISTS
FOR (s:Server) ON (s.name);

CREATE INDEX app_change_name IF NOT EXISTS
FOR (ac:AppChange) ON (ac.name);

CREATE INDEX infra_change_name IF NOT EXISTS
FOR (ic:InfraChange) ON (ic.name);

CREATE INDEX business_capability_name IF NOT EXISTS
FOR (bc:BusinessCapability) ON (bc.name);

// Compliance & Security (15+ queries)
CREATE INDEX requirement_compliance IF NOT EXISTS
FOR (r:Requirement) ON (r.compliance);

// Environment & Deployment (20+ queries)
CREATE INDEX server_environment IF NOT EXISTS
FOR (s:Server) ON (s.environment);

// ============================================================================
// TIER 2 IMPORTANT INDEXES - Moderate-frequency properties (10+ queries)
// ============================================================================

// Change Management
CREATE INDEX app_change_status IF NOT EXISTS
FOR (ac:AppChange) ON (ac.status);

CREATE INDEX app_change_priority IF NOT EXISTS
FOR (ac:AppChange) ON (ac.priority);

CREATE INDEX infra_change_status IF NOT EXISTS
FOR (ic:InfraChange) ON (ic.status);

CREATE INDEX infra_change_priority IF NOT EXISTS
FOR (ic:InfraChange) ON (ic.priority);

CREATE INDEX requirement_status IF NOT EXISTS
FOR (r:Requirement) ON (r.status);

// Technology & Type
CREATE INDEX component_technology IF NOT EXISTS
FOR (c:Component) ON (c.technology);

CREATE INDEX component_type IF NOT EXISTS
FOR (c:Component) ON (c.type);

CREATE INDEX container_technology IF NOT EXISTS
FOR (c:Container) ON (c.technology);

CREATE INDEX container_type IF NOT EXISTS
FOR (c:Container) ON (c.type);

CREATE INDEX application_type IF NOT EXISTS
FOR (a:Application) ON (a.type);

CREATE INDEX data_object_type IF NOT EXISTS
FOR (d:DataObject) ON (d.type);

// Business Value
CREATE INDEX application_business_value IF NOT EXISTS
FOR (a:Application) ON (a.businessValue);

CREATE INDEX business_capability_maturity IF NOT EXISTS
FOR (bc:BusinessCapability) ON (bc.maturity);

// ============================================================================
// COMPOSITE INDEXES - Common filter combinations
// ============================================================================

// Application filtering
CREATE INDEX application_lifecycle_value IF NOT EXISTS
FOR (a:Application) ON (a.lifecycle, a.businessValue);

// Compliance scoping
CREATE INDEX data_object_sensitivity_app IF NOT EXISTS
FOR (d:DataObject) ON (d.sensitivity, d.application);

// Change management
CREATE INDEX app_change_status_priority IF NOT EXISTS
FOR (ac:AppChange) ON (ac.status, ac.priority);

CREATE INDEX infra_change_status_priority IF NOT EXISTS
FOR (ic:InfraChange) ON (ic.status, ic.priority);

// Server deployment
CREATE INDEX server_env_purpose IF NOT EXISTS
FOR (s:Server) ON (s.environment, s.purpose);

// Full-text search indexes (all entity types)
CALL db.index.fulltext.createNodeIndex(
  'searchAllEntities',
  [
    'Requirement', 'Application', 'DataObject', 'BusinessCapability',
    'Component', 'Container', 'Server', 'AppChange', 'InfraChange'
  ],
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

// Sample Containers (C4 Model)
CREATE (cont1:Container {
  id: 'CONT-001',
  name: 'React Frontend',
  type: 'Single-Page Application',
  technology: 'React 18',
  description: 'Customer-facing web application for application submission and tracking',
  responsibilities: ['User authentication', 'Application submission forms', 'Status tracking UI', 'Document upload interface'],
  communicationProtocol: 'HTTPS/REST',
  port: 3000,
  deployment: 'Containerized (Docker)',
  scaling: 'Horizontal',
  source: 'architecture'
})

CREATE (cont2:Container {
  id: 'CONT-002',
  name: 'API Gateway',
  type: 'API Gateway',
  technology: 'Node.js 20 / Express',
  description: 'Backend API gateway routing requests to microservices',
  responsibilities: ['Request routing', 'Authentication/Authorization', 'Rate limiting', 'API composition'],
  communicationProtocol: 'HTTPS/REST',
  port: 8080,
  deployment: 'Containerized (Docker)',
  scaling: 'Horizontal',
  source: 'architecture'
})

CREATE (cont3:Container {
  id: 'CONT-003',
  name: 'Application Service',
  type: 'Microservice',
  technology: 'Java 17 / Spring Boot 3',
  description: 'Core application processing microservice',
  responsibilities: ['Application validation', 'Business logic processing', 'Workflow orchestration', 'Status management'],
  communicationProtocol: 'HTTPS/REST',
  port: 8081,
  deployment: 'Containerized (Docker)',
  scaling: 'Horizontal',
  source: 'architecture'
})

CREATE (cont4:Container {
  id: 'CONT-004',
  name: 'Document Service',
  type: 'Microservice',
  technology: 'Python 3.11 / FastAPI',
  description: 'Document management and storage microservice',
  responsibilities: ['Document upload', 'Document retrieval', 'Format conversion', 'Encryption/Decryption'],
  communicationProtocol: 'HTTPS/REST',
  port: 8082,
  deployment: 'Containerized (Docker)',
  scaling: 'Horizontal',
  source: 'architecture'
})

CREATE (cont5:Container {
  id: 'CONT-005',
  name: 'PostgreSQL Database',
  type: 'Database',
  technology: 'PostgreSQL 15',
  description: 'Relational database for customer and application data',
  responsibilities: ['Data persistence', 'ACID transactions', 'Query processing', 'Data integrity'],
  communicationProtocol: 'PostgreSQL Wire Protocol',
  port: 5432,
  deployment: 'Managed Service (AWS RDS)',
  scaling: 'Vertical',
  source: 'architecture'
})

CREATE (cont6:Container {
  id: 'CONT-006',
  name: 'S3 Document Store',
  type: 'Object Storage',
  technology: 'AWS S3',
  description: 'Object storage for document files',
  responsibilities: ['Document storage', 'Versioning', 'Encryption at rest', 'Lifecycle management'],
  communicationProtocol: 'HTTPS/S3 API',
  deployment: 'Managed Service (AWS S3)',
  scaling: 'Auto-scaling',
  source: 'architecture'
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

// Applications → Data Objects (high-level)
MATCH (a:Application {id: 'APP-123'}), (d:DataObject {id: 'DATA-789'})
CREATE (a)-[:USES {operations: ['READ', 'WRITE'], source: 'leanix'}]->(d);

MATCH (a:Application {id: 'APP-456'}), (d:DataObject {id: 'DATA-012'})
CREATE (a)-[:USES {operations: ['READ', 'WRITE'], source: 'leanix'}]->(d);

MATCH (a:Application {id: 'APP-789'}), (d:DataObject {id: 'DATA-345'})
CREATE (a)-[:USES {operations: ['READ', 'WRITE'], source: 'leanix'}]->(d);

// Applications → Containers (C4 Model Layer)
MATCH (a:Application {id: 'APP-123'}), (c:Container {id: 'CONT-001'})
CREATE (a)-[:CONTAINS {level: 'container', source: 'architecture'}]->(c);

MATCH (a:Application {id: 'APP-123'}), (c:Container {id: 'CONT-002'})
CREATE (a)-[:CONTAINS {level: 'container', source: 'architecture'}]->(c);

MATCH (a:Application {id: 'APP-456'}), (c:Container {id: 'CONT-003'})
CREATE (a)-[:CONTAINS {level: 'container', source: 'architecture'}]->(c);

MATCH (a:Application {id: 'APP-789'}), (c:Container {id: 'CONT-004'})
CREATE (a)-[:CONTAINS {level: 'container', source: 'architecture'}]->(c);

// Container inter-communication
MATCH (c1:Container {id: 'CONT-001'}), (c2:Container {id: 'CONT-002'})
CREATE (c1)-[:COMMUNICATES_WITH {
  protocol: 'HTTPS/REST',
  synchronous: true,
  description: 'Frontend calls API Gateway for all backend operations',
  source: 'architecture'
}]->(c2);

MATCH (c1:Container {id: 'CONT-002'}), (c2:Container {id: 'CONT-003'})
CREATE (c1)-[:COMMUNICATES_WITH {
  protocol: 'HTTPS/REST',
  synchronous: true,
  description: 'API Gateway routes application requests to Application Service',
  source: 'architecture'
}]->(c2);

MATCH (c1:Container {id: 'CONT-002'}), (c2:Container {id: 'CONT-004'})
CREATE (c1)-[:COMMUNICATES_WITH {
  protocol: 'HTTPS/REST',
  synchronous: true,
  description: 'API Gateway routes document requests to Document Service',
  source: 'architecture'
}]->(c2);

MATCH (c1:Container {id: 'CONT-003'}), (c2:Container {id: 'CONT-004'})
CREATE (c1)-[:COMMUNICATES_WITH {
  protocol: 'HTTPS/REST',
  synchronous: true,
  description: 'Application Service requests document validation from Document Service',
  source: 'architecture'
}]->(c2);

// Containers → Data Objects
MATCH (c:Container {id: 'CONT-003'}), (d:DataObject {id: 'DATA-789'})
CREATE (c)-[:USES {
  operations: ['READ', 'WRITE'],
  frequency: 'High',
  description: 'Application Service reads/writes customer data',
  source: 'architecture'
}]->(d);

MATCH (c:Container {id: 'CONT-003'}), (d:DataObject {id: 'DATA-012'})
CREATE (c)-[:USES {
  operations: ['READ', 'WRITE'],
  frequency: 'High',
  description: 'Application Service manages application records',
  source: 'architecture'
}]->(d);

MATCH (c:Container {id: 'CONT-004'}), (d:DataObject {id: 'DATA-345'})
CREATE (c)-[:USES {
  operations: ['READ', 'WRITE'],
  frequency: 'High',
  description: 'Document Service stores and retrieves documents',
  source: 'architecture'
}]->(d);

MATCH (c:Container {id: 'CONT-005'}), (d:DataObject {id: 'DATA-789'})
CREATE (c)-[:STORES {
  description: 'PostgreSQL database physically stores customer data',
  source: 'architecture'
}]->(d);

MATCH (c:Container {id: 'CONT-005'}), (d:DataObject {id: 'DATA-012'})
CREATE (c)-[:STORES {
  description: 'PostgreSQL database physically stores application data',
  source: 'architecture'
}]->(d);

MATCH (c:Container {id: 'CONT-006'}), (d:DataObject {id: 'DATA-345'})
CREATE (c)-[:STORES {
  description: 'S3 physically stores document files',
  source: 'architecture'
}]->(d);

// Containers → Servers
MATCH (c:Container {id: 'CONT-001'}), (s:Server {id: 'SRV-001'})
CREATE (c)-[:DEPLOYED_ON {
  environment: 'production',
  replicas: 3,
  description: 'React Frontend deployed on web server',
  source: 'architecture'
}]->(s);

MATCH (c:Container {id: 'CONT-002'}), (s:Server {id: 'SRV-003'})
CREATE (c)-[:DEPLOYED_ON {
  environment: 'production',
  replicas: 2,
  description: 'API Gateway deployed on API server',
  source: 'architecture'
}]->(s);

MATCH (c:Container {id: 'CONT-003'}), (s:Server {id: 'SRV-003'})
CREATE (c)-[:DEPLOYED_ON {
  environment: 'production',
  replicas: 4,
  description: 'Application Service deployed on API server',
  source: 'architecture'
}]->(s);

MATCH (c:Container {id: 'CONT-005'}), (s:Server {id: 'SRV-005'})
CREATE (c)-[:DEPLOYED_ON {
  environment: 'production',
  description: 'PostgreSQL database running on database server',
  source: 'architecture'
}]->(s);

// ============================================================================
// VERIFICATION QUERIES
// ============================================================================

// Count nodes by type
MATCH (n:Requirement) RETURN 'Requirements' as Type, count(n) as Count
UNION
MATCH (n:Application) RETURN 'Applications' as Type, count(n) as Count
UNION
MATCH (n:Container) RETURN 'Containers' as Type, count(n) as Count
UNION
MATCH (n:Component) RETURN 'Components' as Type, count(n) as Count
UNION
MATCH (n:DataObject) RETURN 'Data Objects' as Type, count(n) as Count
UNION
MATCH (n:Server) RETURN 'Servers' as Type, count(n) as Count
UNION
MATCH (n:BusinessCapability) RETURN 'Business Capabilities' as Type, count(n) as Count
UNION
MATCH (n:AppChange) RETURN 'Application Changes' as Type, count(n) as Count
UNION
MATCH (n:InfraChange) RETURN 'Infrastructure Changes' as Type, count(n) as Count;

// Count relationships by type
MATCH ()-[r:IMPLEMENTED_BY]->() RETURN 'IMPLEMENTED_BY' as Type, count(r) as Count
UNION
MATCH ()-[r:CONTAINS]->() RETURN 'CONTAINS' as Type, count(r) as Count
UNION
MATCH ()-[r:COMMUNICATES_WITH]->() RETURN 'COMMUNICATES_WITH' as Type, count(r) as Count
UNION
MATCH ()-[r:USES]->() RETURN 'USES' as Type, count(r) as Count
UNION
MATCH ()-[r:STORES]->() RETURN 'STORES' as Type, count(r) as Count
UNION
MATCH ()-[r:DEPLOYED_ON]->() RETURN 'DEPLOYED_ON' as Type, count(r) as Count
UNION
MATCH ()-[r:STORED_IN]->() RETURN 'STORED_IN' as Type, count(r) as Count;
