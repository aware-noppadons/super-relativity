// ============================================================================
// Super Relativity - Sample Data
// ============================================================================
// This file creates sample data following MASTER-PATTERNS.md v2.0
// All relationships use specific relationship types (CALLS, OWNS, EXPOSES, etc.)
// Reference: MASTER-PATTERNS.md for complete pattern definitions
// ============================================================================

// ============================================================================
// APPLICATIONS
// ============================================================================

CREATE (app1:Application {
  id: 'APP-001',
  name: 'Customer Portal',
  lifecycle: 'Active',
  owner: 'Digital Experience Team',
  description: 'Customer-facing web application for account management',
  technology: 'React, Node.js',
  source: 'sample'
});

CREATE (app2:Application {
  id: 'APP-002',
  name: 'Mobile Banking App',
  lifecycle: 'Active',
  owner: 'Mobile Team',
  description: 'Mobile application for banking services',
  technology: 'React Native, iOS, Android',
  source: 'sample'
});

CREATE (app3:Application {
  id: 'APP-003',
  name: 'Admin Dashboard',
  lifecycle: 'Active',
  owner: 'Operations Team',
  description: 'Internal admin dashboard for system management',
  technology: 'Angular, Java',
  source: 'sample'
});

// ============================================================================
// APIs
// ============================================================================

CREATE (api1:API {
  id: 'API-001',
  name: 'Customer API',
  type: 'REST',
  protocol: 'HTTPS',
  port: 8080,
  description: 'API for customer data operations',
  technology: 'Spring Boot',
  source: 'sample'
});

CREATE (api2:API {
  id: 'API-002',
  name: 'Transaction API',
  type: 'REST',
  protocol: 'HTTPS',
  port: 8081,
  description: 'API for transaction processing',
  technology: 'Spring Boot',
  source: 'sample'
});

CREATE (api3:API {
  id: 'API-003',
  name: 'Notification API',
  type: 'REST',
  protocol: 'HTTPS',
  port: 8082,
  description: 'API for notifications',
  technology: 'Node.js',
  source: 'sample'
});

// ============================================================================
// BUSINESS FUNCTIONS
// ============================================================================

CREATE (bf1:BusinessFunction {
  id: 'BF-001',
  name: 'Customer Management',
  level: 'L1',
  criticality: 'Critical',
  maturity: 'Optimized',
  description: 'Manage customer information and relationships',
  owner: 'Customer Operations',
  application: 'APP-001',
  source: 'sample'
});

CREATE (bf2:BusinessFunction {
  id: 'BF-002',
  name: 'Transaction Processing',
  level: 'L1',
  criticality: 'Critical',
  maturity: 'Managed',
  description: 'Process financial transactions',
  owner: 'Finance Operations',
  application: 'APP-002',
  source: 'sample'
});

CREATE (bf3:BusinessFunction {
  id: 'BF-003',
  name: 'Customer Onboarding',
  level: 'L2',
  criticality: 'High',
  maturity: 'Defined',
  description: 'Onboard new customers',
  owner: 'Customer Operations',
  application: 'APP-001',
  source: 'sample'
});

CREATE (bf4:BusinessFunction {
  id: 'BF-004',
  name: 'Fraud Detection',
  level: 'L2',
  criticality: 'Critical',
  maturity: 'Optimized',
  description: 'Detect and prevent fraudulent activities',
  owner: 'Risk Management',
  source: 'sample'
});

// ============================================================================
// COMPONENTS
// ============================================================================

CREATE (comp1:Component {
  id: 'COMP-001',
  name: 'Customer Service',
  type: 'Microservice',
  technology: 'Java Spring Boot',
  description: 'Handles customer CRUD operations',
  application: 'APP-001',
  source: 'sample'
});

CREATE (comp2:Component {
  id: 'COMP-002',
  name: 'Transaction Service',
  type: 'Microservice',
  technology: 'Java Spring Boot',
  description: 'Processes transactions',
  application: 'APP-002',
  source: 'sample'
});

CREATE (comp3:Component {
  id: 'COMP-003',
  name: 'Notification Service',
  type: 'Microservice',
  technology: 'Node.js',
  description: 'Sends notifications to customers',
  application: 'APP-001',
  source: 'sample'
});

CREATE (comp4:Component {
  id: 'COMP-004',
  name: 'Authentication Module',
  type: 'Library',
  technology: 'Java',
  description: 'Shared authentication library',
  source: 'sample'
});

CREATE (comp5:Component {
  id: 'COMP-005',
  name: 'Fraud Detection Engine',
  type: 'Microservice',
  technology: 'Python',
  description: 'ML-based fraud detection',
  source: 'sample'
});

// ============================================================================
// DATA OBJECTS
// ============================================================================

CREATE (data1:DataObject {
  id: 'DATA-001',
  name: 'Customer',
  type: 'Entity',
  sensitivity: 'PII',
  description: 'Customer master data',
  schema: 'public',
  source: 'sample'
});

CREATE (data2:DataObject {
  id: 'DATA-002',
  name: 'Transaction',
  type: 'Entity',
  sensitivity: 'Confidential',
  description: 'Financial transaction records',
  schema: 'public',
  source: 'sample'
});

CREATE (data3:DataObject {
  id: 'DATA-003',
  name: 'Notification',
  type: 'Entity',
  sensitivity: 'Internal',
  description: 'Notification messages',
  schema: 'public',
  source: 'sample'
});

CREATE (data4:DataObject {
  id: 'DATA-004',
  name: 'FraudScore',
  type: 'Entity',
  sensitivity: 'Confidential',
  description: 'Fraud risk scores',
  schema: 'public',
  source: 'sample'
});

// ============================================================================
// TABLES
// ============================================================================

CREATE (tbl1:Table {
  id: 'TBL-001',
  name: 'customers',
  database: 'app_db',
  schema: 'public',
  columns: ['id', 'name', 'email', 'phone', 'created_at'],
  primaryKey: 'id',
  recordCount: 150000,
  source: 'sample'
});

CREATE (tbl2:Table {
  id: 'TBL-002',
  name: 'transactions',
  database: 'app_db',
  schema: 'public',
  columns: ['id', 'customer_id', 'amount', 'type', 'timestamp'],
  primaryKey: 'id',
  recordCount: 2500000,
  source: 'sample'
});

CREATE (tbl3:Table {
  id: 'TBL-003',
  name: 'notifications',
  database: 'app_db',
  schema: 'public',
  columns: ['id', 'customer_id', 'message', 'sent_at'],
  primaryKey: 'id',
  recordCount: 500000,
  source: 'sample'
});

// ============================================================================
// SERVERS
// ============================================================================

CREATE (srv1:Server {
  id: 'SRV-001',
  name: 'app-server-01',
  type: 'Application Server',
  environment: 'production',
  provider: 'AWS',
  instanceType: 'c5.2xlarge',
  purpose: 'Microservices hosting',
  status: 'Active',
  source: 'sample'
});

CREATE (srv2:Server {
  id: 'SRV-002',
  name: 'app-server-02',
  type: 'Application Server',
  environment: 'production',
  provider: 'AWS',
  instanceType: 'c5.2xlarge',
  purpose: 'Microservices hosting',
  status: 'Active',
  source: 'sample'
});

CREATE (srv3:Server {
  id: 'SRV-003',
  name: 'db-server-01',
  type: 'Database Server',
  environment: 'production',
  provider: 'AWS RDS',
  instanceType: 'db.r5.xlarge',
  purpose: 'PostgreSQL database',
  status: 'Active',
  source: 'sample'
});

// ============================================================================
// APP CHANGES
// ============================================================================

CREATE (ac1:AppChange {
  id: 'AC-001',
  name: 'Add biometric authentication',
  type: 'Enhancement',
  status: 'Planned',
  priority: 'High',
  changeType: 'add',
  description: 'Add fingerprint/face recognition',
  source: 'sample'
});

CREATE (ac2:AppChange {
  id: 'AC-002',
  name: 'Improve fraud detection model',
  type: 'Enhancement',
  status: 'In Progress',
  priority: 'Critical',
  changeType: 'modify',
  description: 'Update ML model with new features',
  source: 'sample'
});

CREATE (ac3:AppChange {
  id: 'AC-003',
  name: 'Add real-time notifications',
  type: 'Enhancement',
  status: 'Planned',
  priority: 'Medium',
  changeType: 'enable',
  description: 'Enable push notifications',
  source: 'sample'
});

// ============================================================================
// INFRA CHANGES
// ============================================================================

CREATE (ic1:InfraChange {
  id: 'IC-001',
  name: 'Upgrade database instance',
  type: 'Upgrade',
  status: 'Planned',
  priority: 'High',
  changeType: 'upgrade',
  description: 'Upgrade to larger instance for better performance',
  source: 'sample'
});

CREATE (ic2:InfraChange {
  id: 'IC-002',
  name: 'Patch application servers',
  type: 'Maintenance',
  status: 'Scheduled',
  priority: 'High',
  changeType: 'patch',
  description: 'Apply security patches',
  source: 'sample'
});

// ============================================================================
// RELATIONSHIPS - Following MASTER-PATTERNS.md v2.0
// ============================================================================

// Pattern 1: Application → Application (RELATES)
MATCH (app1:Application {id: 'APP-001'}), (app2:Application {id: 'APP-002'})
CREATE (app1)-[:RELATES {
  description: 'Customer Portal integrates with Mobile Banking App'
}]->(app2);

MATCH (app2:Application {id: 'APP-002'}), (app3:Application {id: 'APP-003'})
CREATE (app2)-[:RELATES {
  description: 'Mobile App shares data with Admin Dashboard'
}]->(app3);

// Pattern 1: Application → API (CALLS with mode and rw)
MATCH (app1:Application {id: 'APP-001'}), (api1:API {id: 'API-001'})
CREATE (app1)-[:CALLS {
  mode: 'pulls',
  rw: 'read-n-writes',
  description: 'Customer Portal calls Customer API'
}]->(api1);

MATCH (app2:Application {id: 'APP-002'}), (api2:API {id: 'API-002'})
CREATE (app2)-[:CALLS {
  mode: 'pulls',
  rw: 'read-n-writes',
  description: 'Mobile App calls Transaction API'
}]->(api2);

MATCH (app1:Application {id: 'APP-001'}), (api3:API {id: 'API-003'})
CREATE (app1)-[:CALLS {
  mode: 'pushes',
  rw: 'writes',
  description: 'Customer Portal calls Notification API'
}]->(api3);

// Pattern 1: Application → BusinessFunction (OWNS)
MATCH (app1:Application {id: 'APP-001'}), (bf1:BusinessFunction {id: 'BF-001'})
CREATE (app1)-[:OWNS {
  description: 'Customer Portal owns Customer Management'
}]->(bf1);

MATCH (app2:Application {id: 'APP-002'}), (bf2:BusinessFunction {id: 'BF-002'})
CREATE (app2)-[:OWNS {
  description: 'Mobile App owns Transaction Processing'
}]->(bf2);

MATCH (app1:Application {id: 'APP-001'}), (bf3:BusinessFunction {id: 'BF-003'})
CREATE (app1)-[:OWNS {
  description: 'Customer Portal owns Customer Onboarding'
}]->(bf3);

// Pattern 1: Application → Component (OWNS)
MATCH (app1:Application {id: 'APP-001'}), (comp1:Component {id: 'COMP-001'})
CREATE (app1)-[:OWNS {
  description: 'Customer Portal owns Customer Service'
}]->(comp1);

MATCH (app2:Application {id: 'APP-002'}), (comp2:Component {id: 'COMP-002'})
CREATE (app2)-[:OWNS {
  description: 'Mobile App owns Transaction Service'
}]->(comp2);

MATCH (app1:Application {id: 'APP-001'}), (comp3:Component {id: 'COMP-003'})
CREATE (app1)-[:OWNS {
  description: 'Customer Portal owns Notification Service'
}]->(comp3);

// Pattern 2: API → Component (EXPOSES)
MATCH (api1:API {id: 'API-001'}), (comp1:Component {id: 'COMP-001'})
CREATE (api1)-[:EXPOSES {
  description: 'Customer API exposes Customer Service'
}]->(comp1);

MATCH (api2:API {id: 'API-002'}), (comp2:Component {id: 'COMP-002'})
CREATE (api2)-[:EXPOSES {
  description: 'Transaction API exposes Transaction Service'
}]->(comp2);

MATCH (api3:API {id: 'API-003'}), (comp3:Component {id: 'COMP-003'})
CREATE (api3)-[:EXPOSES {
  description: 'Notification API exposes Notification Service'
}]->(comp3);

// Pattern 2: API → DataObject (WORKS_ON with rw)
MATCH (api1:API {id: 'API-001'}), (data1:DataObject {id: 'DATA-001'})
CREATE (api1)-[:WORKS_ON {
  rw: 'read-n-writes',
  description: 'Customer API works on Customer data'
}]->(data1);

MATCH (api2:API {id: 'API-002'}), (data2:DataObject {id: 'DATA-002'})
CREATE (api2)-[:WORKS_ON {
  rw: 'read-n-writes',
  description: 'Transaction API works on Transaction data'
}]->(data2);

MATCH (api3:API {id: 'API-003'}), (data3:DataObject {id: 'DATA-003'})
CREATE (api3)-[:WORKS_ON {
  rw: 'writes',
  description: 'Notification API works on Notification data'
}]->(data3);

// Pattern 2 (Bidirectional): Component → API (CALLS with mode and rw)
MATCH (comp1:Component {id: 'COMP-001'}), (api1:API {id: 'API-001'})
CREATE (comp1)-[:CALLS {
  mode: 'pulls',
  rw: 'read-n-writes',
  description: 'Customer Service calls Customer API'
}]->(api1);

MATCH (comp2:Component {id: 'COMP-002'}), (api2:API {id: 'API-002'})
CREATE (comp2)-[:CALLS {
  mode: 'pulls',
  rw: 'read-n-writes',
  description: 'Transaction Service calls Transaction API'
}]->(api2);

MATCH (comp3:Component {id: 'COMP-003'}), (api3:API {id: 'API-003'})
CREATE (comp3)-[:CALLS {
  mode: 'pushes',
  rw: 'writes',
  description: 'Notification Service calls Notification API'
}]->(api3);

// Pattern 3: Component → BusinessFunction (IMPLEMENTS)
MATCH (comp1:Component {id: 'COMP-001'}), (bf1:BusinessFunction {id: 'BF-001'})
CREATE (comp1)-[:IMPLEMENTS {
  description: 'Customer Service implements Customer Management'
}]->(bf1);

MATCH (comp2:Component {id: 'COMP-002'}), (bf2:BusinessFunction {id: 'BF-002'})
CREATE (comp2)-[:IMPLEMENTS {
  description: 'Transaction Service implements Transaction Processing'
}]->(bf2);

MATCH (comp5:Component {id: 'COMP-005'}), (bf4:BusinessFunction {id: 'BF-004'})
CREATE (comp5)-[:IMPLEMENTS {
  description: 'Fraud Detection Engine implements Fraud Detection'
}]->(bf4);

// Pattern 4: BusinessFunction → API (INCLUDES)
MATCH (bf1:BusinessFunction {id: 'BF-001'}), (api1:API {id: 'API-001'})
CREATE (bf1)-[:INCLUDES {
  description: 'Customer Management includes Customer API'
}]->(api1);

MATCH (bf2:BusinessFunction {id: 'BF-002'}), (api2:API {id: 'API-002'})
CREATE (bf2)-[:INCLUDES {
  description: 'Transaction Processing includes Transaction API'
}]->(api2);

// Pattern 5: AppChange → Component (CHANGES)
MATCH (ac1:AppChange {id: 'AC-001'}), (comp4:Component {id: 'COMP-004'})
CREATE (ac1)-[:CHANGES {
  description: 'Biometric auth change affects Authentication Module'
}]->(comp4);

MATCH (ac2:AppChange {id: 'AC-002'}), (comp5:Component {id: 'COMP-005'})
CREATE (ac2)-[:CHANGES {
  description: 'Fraud model improvement affects Fraud Detection Engine'
}]->(comp5);

// Pattern 5: AppChange → BusinessFunction (CHANGES)
MATCH (ac1:AppChange {id: 'AC-001'}), (bf1:BusinessFunction {id: 'BF-001'})
CREATE (ac1)-[:CHANGES {
  description: 'Biometric auth impacts Customer Management'
}]->(bf1);

MATCH (ac2:AppChange {id: 'AC-002'}), (bf4:BusinessFunction {id: 'BF-004'})
CREATE (ac2)-[:CHANGES {
  description: 'Model improvement impacts Fraud Detection'
}]->(bf4);

// Pattern 5: AppChange → DataObject (CHANGES)
MATCH (ac1:AppChange {id: 'AC-001'}), (data1:DataObject {id: 'DATA-001'})
CREATE (ac1)-[:CHANGES {
  description: 'Biometric auth impacts Customer data structure'
}]->(data1);

MATCH (ac2:AppChange {id: 'AC-002'}), (data4:DataObject {id: 'DATA-004'})
CREATE (ac2)-[:CHANGES {
  description: 'Model improvement impacts FraudScore data'
}]->(data4);

MATCH (ac3:AppChange {id: 'AC-003'}), (data3:DataObject {id: 'DATA-003'})
CREATE (ac3)-[:CHANGES {
  description: 'Real-time notifications impact Notification data'
}]->(data3);

// Pattern 6: Table → DataObject (MATERIALIZES)
MATCH (tbl1:Table {id: 'TBL-001'}), (data1:DataObject {id: 'DATA-001'})
CREATE (tbl1)-[:MATERIALIZES {
  description: 'customers table materializes Customer data'
}]->(data1);

MATCH (tbl2:Table {id: 'TBL-002'}), (data2:DataObject {id: 'DATA-002'})
CREATE (tbl2)-[:MATERIALIZES {
  description: 'transactions table materializes Transaction data'
}]->(data2);

MATCH (tbl3:Table {id: 'TBL-003'}), (data3:DataObject {id: 'DATA-003'})
CREATE (tbl3)-[:MATERIALIZES {
  description: 'notifications table materializes Notification data'
}]->(data3);

// Pattern 7: Component → Server (INSTALLED_ON)
MATCH (comp1:Component {id: 'COMP-001'}), (srv1:Server {id: 'SRV-001'})
CREATE (comp1)-[:INSTALLED_ON {
  description: 'Customer Service deployed on app-server-01'
}]->(srv1);

MATCH (comp2:Component {id: 'COMP-002'}), (srv1:Server {id: 'SRV-001'})
CREATE (comp2)-[:INSTALLED_ON {
  description: 'Transaction Service deployed on app-server-01'
}]->(srv1);

MATCH (comp3:Component {id: 'COMP-003'}), (srv2:Server {id: 'SRV-002'})
CREATE (comp3)-[:INSTALLED_ON {
  description: 'Notification Service deployed on app-server-02'
}]->(srv2);

MATCH (comp5:Component {id: 'COMP-005'}), (srv2:Server {id: 'SRV-002'})
CREATE (comp5)-[:INSTALLED_ON {
  description: 'Fraud Detection Engine deployed on app-server-02'
}]->(srv2);

// Pattern 8: InfraChange → Server (CHANGES)
MATCH (ic1:InfraChange {id: 'IC-001'}), (srv3:Server {id: 'SRV-003'})
CREATE (ic1)-[:CHANGES {
  description: 'Database upgrade affects db-server-01'
}]->(srv3);

MATCH (ic2:InfraChange {id: 'IC-002'}), (srv1:Server {id: 'SRV-001'})
CREATE (ic2)-[:CHANGES {
  description: 'Patching affects app-server-01'
}]->(srv1);

MATCH (ic2:InfraChange {id: 'IC-002'}), (srv2:Server {id: 'SRV-002'})
CREATE (ic2)-[:CHANGES {
  description: 'Patching affects app-server-02'
}]->(srv2);

// Pattern 9: Component → Component (RELATES for uses)
MATCH (comp1:Component {id: 'COMP-001'}), (comp4:Component {id: 'COMP-004'})
CREATE (comp1)-[:RELATES {
  description: 'Customer Service uses Authentication Module'
}]->(comp4);

MATCH (comp2:Component {id: 'COMP-002'}), (comp4:Component {id: 'COMP-004'})
CREATE (comp2)-[:RELATES {
  description: 'Transaction Service uses Authentication Module'
}]->(comp4);

MATCH (comp2:Component {id: 'COMP-002'}), (comp5:Component {id: 'COMP-005'})
CREATE (comp2)-[:RELATES {
  description: 'Transaction Service uses Fraud Detection Engine'
}]->(comp5);

// Pattern 9: Component → Component (CONTAINS)
MATCH (comp1:Component {id: 'COMP-001'}), (comp3:Component {id: 'COMP-003'})
CREATE (comp1)-[:CONTAINS {
  description: 'Customer Service contains Notification Service module'
}]->(comp3);

// Pattern 10: Component → DataObject (WORKS_ON with rw)
MATCH (comp1:Component {id: 'COMP-001'}), (data1:DataObject {id: 'DATA-001'})
CREATE (comp1)-[:WORKS_ON {
  rw: 'read-n-writes',
  description: 'Customer Service uses Customer data'
}]->(data1);

MATCH (comp2:Component {id: 'COMP-002'}), (data2:DataObject {id: 'DATA-002'})
CREATE (comp2)-[:WORKS_ON {
  rw: 'read-n-writes',
  description: 'Transaction Service uses Transaction data'
}]->(data2);

MATCH (comp3:Component {id: 'COMP-003'}), (data3:DataObject {id: 'DATA-003'})
CREATE (comp3)-[:WORKS_ON {
  rw: 'writes',
  description: 'Notification Service uses Notification data'
}]->(data3);

MATCH (comp5:Component {id: 'COMP-005'}), (data4:DataObject {id: 'DATA-004'})
CREATE (comp5)-[:WORKS_ON {
  rw: 'read-n-writes',
  description: 'Fraud Detection Engine uses FraudScore data'
}]->(data4);

MATCH (comp2:Component {id: 'COMP-002'}), (data1:DataObject {id: 'DATA-001'})
CREATE (comp2)-[:WORKS_ON {
  rw: 'reads',
  description: 'Transaction Service reads Customer data'
}]->(data1);

// Pattern 10: BusinessFunction → DataObject (WORKS_ON with rw)
MATCH (bf1:BusinessFunction {id: 'BF-001'}), (data1:DataObject {id: 'DATA-001'})
CREATE (bf1)-[:WORKS_ON {
  rw: 'read-n-writes',
  description: 'Customer Management uses Customer data'
}]->(data1);

MATCH (bf2:BusinessFunction {id: 'BF-002'}), (data2:DataObject {id: 'DATA-002'})
CREATE (bf2)-[:WORKS_ON {
  rw: 'read-n-writes',
  description: 'Transaction Processing uses Transaction data'
}]->(data2);

MATCH (bf3:BusinessFunction {id: 'BF-003'}), (data1:DataObject {id: 'DATA-001'})
CREATE (bf3)-[:WORKS_ON {
  rw: 'read-n-writes',
  description: 'Customer Onboarding uses Customer data'
}]->(data1);

MATCH (bf4:BusinessFunction {id: 'BF-004'}), (data4:DataObject {id: 'DATA-004'})
CREATE (bf4)-[:WORKS_ON {
  rw: 'read-n-writes',
  description: 'Fraud Detection uses FraudScore data'
}]->(data4);

// Pattern 11: BusinessFunction → BusinessFunction (RELATES with mode)
MATCH (bf1:BusinessFunction {id: 'BF-001'}), (bf3:BusinessFunction {id: 'BF-003'})
CREATE (bf1)-[:RELATES {
  mode: 'pushes',
  description: 'Customer Management relates to Customer Onboarding'
}]->(bf3);

MATCH (bf2:BusinessFunction {id: 'BF-002'}), (bf4:BusinessFunction {id: 'BF-004'})
CREATE (bf2)-[:RELATES {
  mode: 'pulls',
  description: 'Transaction Processing depends on Fraud Detection'
}]->(bf4);

// ============================================================================
// VERIFICATION QUERIES
// ============================================================================

// Count all node types
MATCH (n)
RETURN labels(n)[0] as nodeType, count(*) as count
ORDER BY nodeType;

// Count all relationships by type and pattern
MATCH (a)-[r]->(b)
RETURN labels(a)[0] + ' → ' + labels(b)[0] as pattern,
       type(r) as relationshipType,
       count(*) as count
ORDER BY pattern, relationshipType;

// Verify specific relationship types exist (should have counts)
MATCH ()-[r:CALLS]->()
RETURN 'CALLS relationships' as check, count(*) as count
UNION
MATCH ()-[r:OWNS]->()
RETURN 'OWNS relationships' as check, count(*) as count
UNION
MATCH ()-[r:EXPOSES]->()
RETURN 'EXPOSES relationships' as check, count(*) as count
UNION
MATCH ()-[r:IMPLEMENTS]->()
RETURN 'IMPLEMENTS relationships' as check, count(*) as count
UNION
MATCH ()-[r:INCLUDES]->()
RETURN 'INCLUDES relationships' as check, count(*) as count
UNION
MATCH ()-[r:CHANGES]->()
RETURN 'CHANGES relationships' as check, count(*) as count
UNION
MATCH ()-[r:MATERIALIZES]->()
RETURN 'MATERIALIZES relationships' as check, count(*) as count
UNION
MATCH ()-[r:INSTALLED_ON]->()
RETURN 'INSTALLED_ON relationships' as check, count(*) as count
UNION
MATCH ()-[r:CONTAINS]->()
RETURN 'CONTAINS relationships' as check, count(*) as count
UNION
MATCH ()-[r:RELATES]->()
RETURN 'RELATES relationships' as check, count(*) as count
UNION
MATCH ()-[r:WORKS_ON]->()
RETURN 'WORKS_ON relationships' as check, count(*) as count;

// Verify no old RELATED_TO relationships exist (should be 0)
MATCH ()-[r:RELATED_TO]->()
RETURN 'OLD RELATED_TO (should be 0)' as check, count(*) as count;
