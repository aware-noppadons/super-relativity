// Super Relativity - Comprehensive LeanIX Data Import
// This script imports all data from the mock LeanIX API into Neo4j
// Run after 01-create-schema.cypher

// ============================================================================
// BUSINESS CAPABILITIES
// ============================================================================

CREATE (cap1:BusinessCapability {
  id: 'CAP-001',
  name: 'Customer Onboarding',
  level: 'L1',
  description: 'Acquire and onboard new customers',
  owner: 'Chief Customer Officer',
  criticality: 'Critical',
  maturity: 'Defined',
  source: 'leanix',
  syncedAt: datetime()
});

CREATE (cap2:BusinessCapability {
  id: 'CAP-002',
  name: 'Application Processing',
  level: 'L2',
  parent: 'CAP-001',
  description: 'Process customer applications end-to-end',
  owner: 'VP Operations',
  criticality: 'Critical',
  maturity: 'Managed',
  source: 'leanix',
  syncedAt: datetime()
});

CREATE (cap3:BusinessCapability {
  id: 'CAP-003',
  name: 'Document Management',
  level: 'L2',
  parent: 'CAP-001',
  description: 'Capture, store, and retrieve customer documents',
  owner: 'VP Operations',
  criticality: 'High',
  maturity: 'Defined',
  source: 'leanix',
  syncedAt: datetime()
});

CREATE (cap4:BusinessCapability {
  id: 'CAP-004',
  name: 'Customer Service & Support',
  level: 'L1',
  description: 'Support existing customers',
  owner: 'Chief Customer Officer',
  criticality: 'High',
  maturity: 'Optimized',
  source: 'leanix',
  syncedAt: datetime()
});

CREATE (cap5:BusinessCapability {
  id: 'CAP-005',
  name: 'Payment Processing',
  level: 'L1',
  description: 'Process customer payments and transactions',
  owner: 'CFO',
  criticality: 'Critical',
  maturity: 'Optimized',
  source: 'leanix',
  syncedAt: datetime()
});

CREATE (cap6:BusinessCapability {
  id: 'CAP-006',
  name: 'Risk Assessment & Fraud Detection',
  level: 'L2',
  parent: 'CAP-002',
  description: 'Assess risk and detect fraud',
  owner: 'Chief Risk Officer',
  criticality: 'Critical',
  maturity: 'Managed',
  source: 'leanix',
  syncedAt: datetime()
});

CREATE (cap7:BusinessCapability {
  id: 'CAP-007',
  name: 'Compliance & Reporting',
  level: 'L1',
  description: 'Generate regulatory compliance reports',
  owner: 'Chief Compliance Officer',
  criticality: 'Critical',
  maturity: 'Defined',
  source: 'leanix',
  syncedAt: datetime()
});

CREATE (cap8:BusinessCapability {
  id: 'CAP-008',
  name: 'Analytics & Business Intelligence',
  level: 'L1',
  description: 'Business analytics and reporting',
  owner: 'Chief Data Officer',
  criticality: 'Medium',
  maturity: 'Managed',
  source: 'leanix',
  syncedAt: datetime()
});

// Capability parent-child relationships
MATCH (parent:BusinessCapability {id: 'CAP-001'}), (child:BusinessCapability {id: 'CAP-002'})
CREATE (parent)-[:HAS_CHILD_CAPABILITY]->(child);

MATCH (parent:BusinessCapability {id: 'CAP-001'}), (child:BusinessCapability {id: 'CAP-003'})
CREATE (parent)-[:HAS_CHILD_CAPABILITY]->(child);

MATCH (parent:BusinessCapability {id: 'CAP-002'}), (child:BusinessCapability {id: 'CAP-006'})
CREATE (parent)-[:HAS_CHILD_CAPABILITY]->(child);

// ============================================================================
// ENHANCED REQUIREMENTS (with compliance tags and capability links)
// ============================================================================

CREATE (req1:Requirement {
  id: 'REQ-001',
  name: 'Enable customer self-service application submission',
  type: 'Functional Requirement',
  priority: 'High',
  status: 'Implemented',
  owner: 'Product Team',
  description: 'Allow customers to submit applications online without agent assistance',
  createdDate: datetime('2025-01-15'),
  compliance: ['SOC2', 'GDPR'],
  capability: 'CAP-002',
  source: 'leanix',
  syncedAt: datetime()
});

CREATE (req2:Requirement {
  id: 'REQ-002',
  name: 'Real-time application status tracking',
  type: 'Functional Requirement',
  priority: 'Medium',
  status: 'Implemented',
  owner: 'Product Team',
  description: 'Provide customers with real-time updates on application status',
  createdDate: datetime('2025-01-20'),
  capability: 'CAP-002',
  source: 'leanix',
  syncedAt: datetime()
});

CREATE (req3:Requirement {
  id: 'REQ-003',
  name: 'Secure document upload and storage',
  type: 'Non-Functional Requirement',
  priority: 'High',
  status: 'Implemented',
  owner: 'Security Team',
  description: 'Ensure PII data is encrypted in transit and at rest',
  createdDate: datetime('2025-01-18'),
  compliance: ['PCI-DSS', 'GDPR', 'HIPAA'],
  capability: 'CAP-003',
  source: 'leanix',
  syncedAt: datetime()
});

CREATE (req4:Requirement {
  id: 'REQ-004',
  name: 'Multi-language support',
  type: 'Functional Requirement',
  priority: 'Medium',
  status: 'In Progress',
  owner: 'Product Team',
  description: 'Support English, Spanish, and French interfaces',
  createdDate: datetime('2025-02-01'),
  capability: 'CAP-001',
  source: 'leanix',
  syncedAt: datetime()
});

CREATE (req5:Requirement {
  id: 'REQ-005',
  name: 'Automated fraud detection',
  type: 'Functional Requirement',
  priority: 'High',
  status: 'Implemented',
  owner: 'Risk Team',
  description: 'Implement ML-based fraud detection for application submissions',
  createdDate: datetime('2025-01-25'),
  capability: 'CAP-006',
  source: 'leanix',
  syncedAt: datetime()
});

// Capability → Requirement relationships
MATCH (c:BusinessCapability {id: 'CAP-001'}), (r:Requirement {id: 'REQ-001'})
CREATE (c)-[:REQUIRES]->(r);

MATCH (c:BusinessCapability {id: 'CAP-001'}), (r:Requirement {id: 'REQ-004'})
CREATE (c)-[:REQUIRES]->(r);

MATCH (c:BusinessCapability {id: 'CAP-002'}), (r:Requirement {id: 'REQ-001'})
CREATE (c)-[:REQUIRES]->(r);

MATCH (c:BusinessCapability {id: 'CAP-002'}), (r:Requirement {id: 'REQ-002'})
CREATE (c)-[:REQUIRES]->(r);

MATCH (c:BusinessCapability {id: 'CAP-003'}), (r:Requirement {id: 'REQ-003'})
CREATE (c)-[:REQUIRES]->(r);

MATCH (c:BusinessCapability {id: 'CAP-006'}), (r:Requirement {id: 'REQ-005'})
CREATE (c)-[:REQUIRES]->(r);

// ============================================================================
// ENHANCED INFRASTRUCTURE
// ============================================================================

CREATE (infra1:Infrastructure {
  id: 'INFRA-001',
  name: 'Production EKS Cluster',
  type: 'Kubernetes Cluster',
  provider: 'AWS',
  region: 'us-east-1',
  environment: 'Production',
  criticality: 'Critical',
  owner: 'Platform Team',
  costPerYear: 150000,
  source: 'leanix',
  syncedAt: datetime()
});

CREATE (infra2:Infrastructure {
  id: 'INFRA-002',
  name: 'Production SageMaker',
  type: 'ML Platform',
  provider: 'AWS',
  region: 'us-east-1',
  environment: 'Production',
  criticality: 'High',
  owner: 'Data Science Team',
  costPerYear: 200000,
  source: 'leanix',
  syncedAt: datetime()
});

CREATE (infra3:Infrastructure {
  id: 'INFRA-003',
  name: 'Production RDS PostgreSQL',
  type: 'Managed Database',
  provider: 'AWS',
  region: 'us-east-1',
  environment: 'Production',
  criticality: 'Critical',
  owner: 'Database Team',
  instanceType: 'db.r6g.4xlarge',
  costPerYear: 80000,
  source: 'leanix',
  syncedAt: datetime()
});

CREATE (infra4:Infrastructure {
  id: 'INFRA-004',
  name: 'S3 Document Storage',
  type: 'Object Storage',
  provider: 'AWS',
  region: 'us-east-1',
  environment: 'Production',
  criticality: 'Critical',
  owner: 'Platform Team',
  storageGB: 5000,
  costPerYear: 30000,
  source: 'leanix',
  syncedAt: datetime()
});

CREATE (infra5:Infrastructure {
  id: 'INFRA-005',
  name: 'CloudFront CDN',
  type: 'CDN',
  provider: 'AWS',
  region: 'Global',
  environment: 'Production',
  criticality: 'High',
  owner: 'Platform Team',
  costPerYear: 40000,
  source: 'leanix',
  syncedAt: datetime()
});

CREATE (infra6:Infrastructure {
  id: 'INFRA-006',
  name: 'Application Load Balancer',
  type: 'Load Balancer',
  provider: 'AWS',
  region: 'us-east-1',
  environment: 'Production',
  criticality: 'Critical',
  owner: 'Platform Team',
  costPerYear: 20000,
  source: 'leanix',
  syncedAt: datetime()
});

CREATE (infra7:Infrastructure {
  id: 'INFRA-007',
  name: 'Redis Cluster',
  type: 'Managed Cache',
  provider: 'AWS ElastiCache',
  region: 'us-east-1',
  environment: 'Production',
  criticality: 'High',
  owner: 'Platform Team',
  nodeType: 'cache.r6g.xlarge',
  costPerYear: 45000,
  source: 'leanix',
  syncedAt: datetime()
});

CREATE (infra8:Infrastructure {
  id: 'INFRA-008',
  name: 'VPC Production Network',
  type: 'Virtual Network',
  provider: 'AWS',
  region: 'us-east-1',
  environment: 'Production',
  criticality: 'Critical',
  owner: 'Network Team',
  costPerYear: 10000,
  source: 'leanix',
  syncedAt: datetime()
});

// ============================================================================
// CONTEXT DIAGRAMS
// ============================================================================

CREATE (diag1:Diagram {
  id: 'DIAGRAM-001',
  name: 'Customer Onboarding Flow',
  type: 'Context Diagram',
  format: 'Mermaid',
  capability: 'CAP-001',
  description: 'End-to-end customer onboarding process from application submission to approval',
  components: ['APP-123', 'APP-456', 'APP-567', 'APP-901'],
  lastUpdated: datetime('2025-12-15'),
  source: 'leanix',
  syncedAt: datetime()
});

CREATE (diag2:Diagram {
  id: 'DIAGRAM-002',
  name: 'Application Processing Architecture',
  type: 'Component Diagram',
  format: 'PlantUML',
  capability: 'CAP-002',
  description: 'Microservices architecture for application processing',
  components: ['APP-456', 'APP-567', 'APP-901', 'APP-234', 'APP-789'],
  lastUpdated: datetime('2025-12-10'),
  source: 'leanix',
  syncedAt: datetime()
});

CREATE (diag3:Diagram {
  id: 'DIAGRAM-003',
  name: 'Data Flow - PII Data',
  type: 'Data Flow Diagram',
  format: 'Mermaid',
  capability: 'CAP-003',
  description: 'PII data flow showing encryption and security controls',
  components: ['APP-123', 'APP-789', 'DATA-789', 'DATA-345'],
  lastUpdated: datetime('2025-11-20'),
  source: 'leanix',
  syncedAt: datetime()
});

CREATE (diag4:Diagram {
  id: 'DIAGRAM-004',
  name: 'Infrastructure Overview',
  type: 'Infrastructure Diagram',
  format: 'Mermaid',
  description: 'AWS infrastructure architecture overview',
  components: ['INFRA-001', 'INFRA-003', 'INFRA-004', 'INFRA-005', 'INFRA-006', 'INFRA-008'],
  lastUpdated: datetime('2025-12-01'),
  source: 'leanix',
  syncedAt: datetime()
});

// Diagram relationships
MATCH (cap:BusinessCapability {id: 'CAP-001'}), (diag:Diagram {id: 'DIAGRAM-001'})
CREATE (cap)-[:DOCUMENTED_BY]->(diag);

MATCH (cap:BusinessCapability {id: 'CAP-002'}), (diag:Diagram {id: 'DIAGRAM-002'})
CREATE (cap)-[:DOCUMENTED_BY]->(diag);

MATCH (cap:BusinessCapability {id: 'CAP-003'}), (diag:Diagram {id: 'DIAGRAM-003'})
CREATE (cap)-[:DOCUMENTED_BY]->(diag);

// ============================================================================
// ENHANCED APPLICATION → INFRASTRUCTURE RELATIONSHIPS
// ============================================================================

// Link existing applications to new infrastructure
MATCH (a:Application {id: 'APP-123'}), (i:Infrastructure {id: 'INFRA-001'})
CREATE (a)-[:DEPLOYED_ON {environment: 'production', syncedAt: datetime()}]->(i);

MATCH (a:Application {id: 'APP-456'}), (i:Infrastructure {id: 'INFRA-001'})
CREATE (a)-[:DEPLOYED_ON {environment: 'production', syncedAt: datetime()}]->(i);

MATCH (a:Application {id: 'APP-789'}), (i:Infrastructure {id: 'INFRA-001'})
CREATE (a)-[:DEPLOYED_ON {environment: 'production', syncedAt: datetime()}]->(i);

// Data objects → infrastructure
MATCH (d:DataObject {id: 'DATA-789'}), (i:Infrastructure {id: 'INFRA-003'})
CREATE (d)-[:STORED_ON {syncedAt: datetime()}]->(i);

MATCH (d:DataObject {id: 'DATA-012'}), (i:Infrastructure {id: 'INFRA-003'})
CREATE (d)-[:STORED_ON {syncedAt: datetime()}]->(i);

MATCH (d:DataObject {id: 'DATA-345'}), (i:Infrastructure {id: 'INFRA-004'})
CREATE (d)-[:STORED_ON {syncedAt: datetime()}]->(i);

// ============================================================================
// SUMMARY STATISTICS
// ============================================================================

// Count all entity types
MATCH (n:BusinessCapability) WITH count(n) as capCount
MATCH (n:Requirement) WITH capCount, count(n) as reqCount
MATCH (n:Application) WITH capCount, reqCount, count(n) as appCount
MATCH (n:DataObject) WITH capCount, reqCount, appCount, count(n) as dataCount
MATCH (n:Infrastructure) WITH capCount, reqCount, appCount, dataCount, count(n) as infraCount
MATCH (n:Diagram) WITH capCount, reqCount, appCount, dataCount, infraCount, count(n) as diagCount
RETURN
  'Data Import Summary' as Summary,
  capCount as BusinessCapabilities,
  reqCount as Requirements,
  appCount as Applications,
  dataCount as DataObjects,
  infraCount as Infrastructure,
  diagCount as Diagrams;
