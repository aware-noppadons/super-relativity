// Super Relativity POC - Option 4 (Backstage + Istio + Neo4j)
// Neo4j Initialization Script - Business Context Layer

// ============================================================================
// CREATE CONSTRAINTS
// ============================================================================

CREATE CONSTRAINT requirement_id IF NOT EXISTS
FOR (r:Requirement) REQUIRE r.id IS UNIQUE;

CREATE CONSTRAINT backstage_service_name IF NOT EXISTS
FOR (s:BackstageService) REQUIRE s.name IS UNIQUE;

CREATE CONSTRAINT business_capability_id IF NOT EXISTS
FOR (bc:BusinessCapability) REQUIRE bc.id IS UNIQUE;

CREATE CONSTRAINT data_object_id IF NOT EXISTS
FOR (d:DataObject) REQUIRE d.id IS UNIQUE;

// ============================================================================
// CREATE INDEXES
// ============================================================================

CREATE INDEX requirement_priority IF NOT EXISTS
FOR (r:Requirement) ON (r.priority);

CREATE INDEX service_lifecycle IF NOT EXISTS
FOR (s:BackstageService) ON (s.lifecycle);

CREATE INDEX service_owner IF NOT EXISTS
FOR (s:BackstageService) ON (s.owner);

// ============================================================================
// SAMPLE BUSINESS REQUIREMENTS
// ============================================================================

CREATE (req1:Requirement {
  id: 'REQ-001',
  name: 'Enable customer self-service order placement',
  description: 'Customers must be able to place orders through web and mobile interfaces without agent assistance',
  type: 'Functional',
  priority: 'High',
  status: 'Approved',
  source: 'Product Management',
  created_date: '2025-01-15',
  compliance: ['PCI-DSS', 'GDPR']
})

CREATE (req2:Requirement {
  id: 'REQ-002',
  name: 'Real-time order tracking',
  description: 'Customers must be able to track order status in real-time from placement to delivery',
  type: 'Functional',
  priority: 'High',
  status: 'Approved',
  source: 'Customer Feedback',
  created_date: '2025-01-20'
})

CREATE (req3:Requirement {
  id: 'REQ-003',
  name: 'Secure payment processing',
  description: 'All payment transactions must be processed securely with PCI-DSS compliance',
  type: 'Non-Functional',
  priority: 'Critical',
  status: 'Approved',
  source: 'Security Team',
  created_date: '2025-01-10',
  compliance: ['PCI-DSS', 'SOC2']
})

CREATE (req4:Requirement {
  id: 'REQ-004',
  name: 'Multi-channel notifications',
  description: 'System must send order updates via email, SMS, and push notifications',
  type: 'Functional',
  priority: 'Medium',
  status: 'In Progress',
  source: 'Product Management',
  created_date: '2025-02-01'
})

// ============================================================================
// BUSINESS CAPABILITIES
// ============================================================================

CREATE (bc1:BusinessCapability {
  id: 'BC-SALES',
  name: 'Sales & Revenue Generation',
  description: 'Core capability for generating revenue through online sales',
  level: 1,
  owner: 'VP Sales'
})

CREATE (bc2:BusinessCapability {
  id: 'BC-CUSTOMER-MGMT',
  name: 'Customer Relationship Management',
  description: 'Managing customer data and interactions',
  level: 2,
  owner: 'Director Customer Experience',
  parent: 'BC-SALES'
})

CREATE (bc3:BusinessCapability {
  id: 'BC-ORDER-FULFILLMENT',
  name: 'Order Fulfillment',
  description: 'Processing and fulfilling customer orders',
  level: 2,
  owner: 'Director Operations',
  parent: 'BC-SALES'
})

CREATE (bc4:BusinessCapability {
  id: 'BC-PAYMENT-PROCESSING',
  name: 'Payment Processing',
  description: 'Secure processing of customer payments',
  level: 2,
  owner: 'Director Finance',
  parent: 'BC-SALES'
})

// ============================================================================
// BACKSTAGE SERVICES (will be synced from Backstage catalog)
// ============================================================================

CREATE (svc1:BackstageService {
  name: 'customer-service',
  description: 'Manages customer data and profiles',
  type: 'service',
  lifecycle: 'production',
  owner: 'team-customer-experience',
  system: 'ecommerce-system',
  domain: 'sales-domain',
  url: 'http://localhost:8001',
  health_check: 'http://localhost:8001/health',
  github_repo: 'your-org/customer-service',
  tags: ['microservice', 'java', 'customer']
})

CREATE (svc2:BackstageService {
  name: 'order-service',
  description: 'Handles order creation, processing, and fulfillment',
  type: 'service',
  lifecycle: 'production',
  owner: 'team-order-management',
  system: 'ecommerce-system',
  domain: 'sales-domain',
  url: 'http://localhost:8002',
  health_check: 'http://localhost:8002/health',
  github_repo: 'your-org/order-service',
  tags: ['microservice', 'java', 'orders']
})

CREATE (svc3:BackstageService {
  name: 'payment-service',
  description: 'Processes payments and manages payment methods',
  type: 'service',
  lifecycle: 'production',
  owner: 'team-payments',
  system: 'ecommerce-system',
  domain: 'sales-domain',
  url: 'http://localhost:8003',
  health_check: 'http://localhost:8003/health',
  github_repo: 'your-org/payment-service',
  tags: ['microservice', 'java', 'payment', 'pci-compliant']
})

CREATE (svc4:BackstageService {
  name: 'notification-service',
  description: 'Sends notifications via email, SMS, and push',
  type: 'service',
  lifecycle: 'production',
  owner: 'team-platform',
  system: 'ecommerce-system',
  domain: 'platform-domain',
  url: 'http://localhost:8004',
  health_check: 'http://localhost:8004/health',
  github_repo: 'your-org/notification-service',
  tags: ['microservice', 'nodejs', 'notifications']
})

// ============================================================================
// DATA OBJECTS
// ============================================================================

CREATE (data1:DataObject {
  id: 'DATA-CUSTOMER',
  name: 'Customer',
  type: 'Entity',
  description: 'Customer profile and account information',
  database: 'customer_db',
  schema: 'public',
  table_name: 'customers',
  pii: true,
  sensitivity: 'High',
  compliance: ['GDPR', 'CCPA']
})

CREATE (data2:DataObject {
  id: 'DATA-ORDER',
  name: 'Order',
  type: 'Entity',
  description: 'Customer order details',
  database: 'order_db',
  schema: 'public',
  table_name: 'orders',
  pii: false,
  sensitivity: 'Medium'
})

CREATE (data3:DataObject {
  id: 'DATA-PAYMENT',
  name: 'Payment',
  type: 'Entity',
  description: 'Payment transaction data',
  database: 'payment_db',
  schema: 'public',
  table_name: 'payments',
  pii: true,
  sensitivity: 'Critical',
  compliance: ['PCI-DSS']
})

// ============================================================================
// CREATE RELATIONSHIPS
// ============================================================================

// Requirements → Business Capabilities
CREATE (req1)-[:SUPPORTS_CAPABILITY {strength: 'direct'}]->(bc3)
CREATE (req2)-[:SUPPORTS_CAPABILITY {strength: 'direct'}]->(bc3)
CREATE (req3)-[:SUPPORTS_CAPABILITY {strength: 'direct'}]->(bc4)
CREATE (req4)-[:SUPPORTS_CAPABILITY {strength: 'supporting'}]->(bc2)

// Requirements → Services (Implementation)
CREATE (req1)-[:IMPLEMENTED_BY {
  confidence: 1.0,
  source: 'manual',
  verified_date: '2025-12-23'
}]->(svc2)

CREATE (req2)-[:IMPLEMENTED_BY {
  confidence: 1.0,
  source: 'manual',
  verified_date: '2025-12-23'
}]->(svc2)

CREATE (req3)-[:IMPLEMENTED_BY {
  confidence: 1.0,
  source: 'manual',
  verified_date: '2025-12-23'
}]->(svc3)

CREATE (req4)-[:IMPLEMENTED_BY {
  confidence: 0.9,
  source: 'inferred',
  verified_date: '2025-12-23'
}]->(svc4)

// Business Capabilities → Services
CREATE (bc2)-[:REALIZED_BY]->(svc1)
CREATE (bc3)-[:REALIZED_BY]->(svc2)
CREATE (bc4)-[:REALIZED_BY]->(svc3)

// Services → Data Objects
CREATE (svc1)-[:READS {frequency: 'high', pattern: 'CRUD'}]->(data1)
CREATE (svc1)-[:WRITES {frequency: 'high', pattern: 'CRUD'}]->(data1)

CREATE (svc2)-[:READS {frequency: 'high', pattern: 'read-heavy'}]->(data1)
CREATE (svc2)-[:READS {frequency: 'high', pattern: 'CRUD'}]->(data2)
CREATE (svc2)-[:WRITES {frequency: 'high', pattern: 'CRUD'}]->(data2)

CREATE (svc3)-[:READS {frequency: 'medium', pattern: 'write-heavy'}]->(data3)
CREATE (svc3)-[:WRITES {frequency: 'high', pattern: 'write-heavy'}]->(data3)

// Service Dependencies (Design-time - complemented by Istio runtime data)
CREATE (svc2)-[:DEPENDS_ON {
  type: 'synchronous',
  protocol: 'HTTP',
  source: 'design'
}]->(svc1)

CREATE (svc2)-[:DEPENDS_ON {
  type: 'synchronous',
  protocol: 'HTTP',
  source: 'design'
}]->(svc3)

CREATE (svc2)-[:DEPENDS_ON {
  type: 'asynchronous',
  protocol: 'Event',
  source: 'design'
}]->(svc4)

// ============================================================================
// SAMPLE QUERIES
// ============================================================================

// Query 1: Find all services implementing a requirement
// MATCH (r:Requirement {id: 'REQ-001'})-[:IMPLEMENTED_BY]->(s:BackstageService)
// RETURN r.name as requirement, collect(s.name) as implementing_services;

// Query 2: Find data objects accessed by a service
// MATCH (s:BackstageService {name: 'order-service'})-[rel:READS|WRITES]->(d:DataObject)
// RETURN s.name, type(rel) as access_type, d.name, d.sensitivity;

// Query 3: Impact analysis - which services affected if requirement changes
// MATCH (r:Requirement {id: 'REQ-001'})-[:IMPLEMENTED_BY]->(s:BackstageService)
// OPTIONAL MATCH (s)-[:DEPENDS_ON*1..3]->(dependent:BackstageService)
// RETURN r.name, s.name as direct_service, collect(DISTINCT dependent.name) as downstream_services;

// Query 4: Compliance - which services handle PII data
// MATCH (s:BackstageService)-[:READS|WRITES]->(d:DataObject {pii: true})
// RETURN s.name as service, s.owner as owner, collect(d.name) as pii_data;

// Query 5: Business capability realization
// MATCH (bc:BusinessCapability)-[:REALIZED_BY]->(s:BackstageService)
// OPTIONAL MATCH (r:Requirement)-[:SUPPORTS_CAPABILITY]->(bc)
// RETURN bc.name, collect(DISTINCT s.name) as services, count(DISTINCT r) as requirements;
