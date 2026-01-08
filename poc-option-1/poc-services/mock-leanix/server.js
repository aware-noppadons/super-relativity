/**
 * Mock LeanIX API Server
 * Simulates LeanIX GraphQL API for Super Relativity POC
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// In-memory data store (simulates LeanIX)
let businessCapabilities = [];
let applications = [];
let components = [];
let requirements = [];
let dataObjects = [];
let apis = [];
let infrastructure = [];
let contextDiagrams = [];
let relationships = [];
let appChanges = [];
let infraChanges = [];

// Load sample data on startup
function loadSampleData() {
  const dataPath = path.join(__dirname, 'data', 'sample-data.json');

  if (fs.existsSync(dataPath)) {
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    businessCapabilities = data.businessCapabilities || [];
    applications = data.applications || [];
    components = data.components || [];
    requirements = data.requirements || [];
    dataObjects = data.dataObjects || [];
    apis = data.apis || [];
    infrastructure = data.infrastructure || [];
    contextDiagrams = data.contextDiagrams || [];
    relationships = data.relationships || [];
    appChanges = data.appChanges || [];
    infraChanges = data.infraChanges || [];
    console.log(`✅ Sample data loaded successfully:`);
    console.log(`   - ${businessCapabilities.length} business capabilities`);
    console.log(`   - ${applications.length} applications`);
    console.log(`   - ${components.length} components`);
    console.log(`   - ${requirements.length} requirements`);
    console.log(`   - ${dataObjects.length} data objects`);
    console.log(`   - ${apis.length} APIs`);
    console.log(`   - ${infrastructure.length} infrastructure components`);
    console.log(`   - ${contextDiagrams.length} context diagrams`);
    console.log(`   - ${relationships.length} relationships`);
    console.log(`   - ${appChanges.length} app changes`);
    console.log(`   - ${infraChanges.length} infra changes`);
  } else {
    // Initialize with default sample data
    initializeDefaultData();
    console.log('✅ Default sample data initialized');
  }
}

function initializeDefaultData() {
  // Sample Requirements
  requirements = [
    {
      id: 'REQ-001',
      name: 'Enable customer self-service application submission',
      type: 'Functional Requirement',
      priority: 'High',
      status: 'Approved',
      owner: 'Product Team',
      description: 'Allow customers to submit applications online without agent assistance',
      capability: 'CAP-001'  // Supports Customer Onboarding
    },
    {
      id: 'REQ-002',
      name: 'Real-time application status tracking',
      type: 'Functional Requirement',
      priority: 'Medium',
      status: 'Approved',
      owner: 'Product Team',
      description: 'Provide customers with real-time updates on application status',
      capability: 'CAP-004'  // Supports Customer Service & Support
    },
    {
      id: 'REQ-003',
      name: 'Secure document upload and storage',
      type: 'Non-Functional Requirement',
      priority: 'High',
      status: 'Approved',
      owner: 'Security Team',
      description: 'Ensure PII data is encrypted in transit and at rest',
      capability: 'CAP-003'  // Supports Document Management
    }
  ];

  // Sample Business Capabilities
  businessCapabilities = [
    {
      id: 'CAP-001',
      name: 'Customer Onboarding',
      level: 'L2',
      description: 'Ability to onboard new customers through digital channels',
      owner: 'Customer Experience',
      criticality: 'High',
      maturity: 'Optimized',
      application: 'APP-123'
    },
    {
      id: 'CAP-002',
      name: 'Application Processing',
      level: 'L2',
      description: 'Process and validate customer applications',
      owner: 'Operations',
      criticality: 'High',
      maturity: 'Defined',
      application: 'APP-456'
    },
    {
      id: 'CAP-003',
      name: 'Document Management',
      level: 'L2',
      description: 'Store and retrieve customer documents',
      owner: 'IT Operations',
      criticality: 'Medium',
      maturity: 'Managed',
      application: 'APP-789'
    },
    {
      id: 'CAP-004',
      name: 'Customer Service & Support',
      level: 'L2',
      description: 'Provide customer support and service',
      owner: 'Customer Service',
      criticality: 'High',
      maturity: 'Defined',
      application: 'APP-123'
    },
    {
      id: 'CAP-005',
      name: 'Payment Processing',
      level: 'L2',
      description: 'Process payments and transactions',
      owner: 'Finance',
      criticality: 'Critical',
      maturity: 'Optimized',
      application: 'APP-901'
    },
    {
      id: 'CAP-006',
      name: 'Risk Assessment & Fraud Detection',
      level: 'L2',
      description: 'Detect and prevent fraud',
      owner: 'Risk Management',
      criticality: 'Critical',
      maturity: 'Defined',
      application: 'APP-567'
    },
    {
      id: 'CAP-007',
      name: 'Compliance & Reporting',
      level: 'L2',
      description: 'Ensure regulatory compliance and reporting',
      owner: 'Compliance',
      criticality: 'High',
      maturity: 'Defined',
      application: 'APP-012'
    },
    {
      id: 'CAP-008',
      name: 'Analytics & Business Intelligence',
      level: 'L2',
      description: 'Provide business insights and analytics',
      owner: 'Data Analytics',
      criticality: 'Medium',
      maturity: 'Emerging',
      application: 'APP-890'
    }
  ];

  // Sample Applications
  applications = [
    {
      id: 'APP-012',
      name: 'Reporting Engine',
      type: 'Backend Service',
      businessValue: 'High',
      lifecycle: 'Active',
      techStack: ['Python', 'Apache Spark', 'PostgreSQL'],
      repositories: ['github.com/org/reporting-engine']
    },
    {
      id: 'APP-123',
      name: 'Customer Portal',
      type: 'Web Application',
      businessValue: 'High',
      lifecycle: 'Active',
      techStack: ['React', 'Node.js', 'PostgreSQL'],
      repositories: ['github.com/org/customer-portal-frontend', 'github.com/org/customer-portal-backend']
    },
    {
      id: 'APP-234',
      name: 'Notification Service',
      type: 'Microservice',
      businessValue: 'Medium',
      lifecycle: 'Active',
      techStack: ['Node.js', 'Redis', 'SendGrid'],
      repositories: ['github.com/org/notification-service']
    },
    {
      id: 'APP-345',
      name: 'Legacy Mainframe Bridge',
      type: 'Integration Service',
      businessValue: 'Low',
      lifecycle: 'Sunset',
      techStack: ['COBOL', 'IBM MQ', 'Java'],
      repositories: ['github.com/org/mainframe-bridge']
    },
    {
      id: 'APP-456',
      name: 'Application Processing API',
      type: 'Backend Service',
      businessValue: 'High',
      lifecycle: 'Active',
      techStack: ['Java', 'Spring Boot', 'PostgreSQL'],
      repositories: ['github.com/org/app-processing-api']
    },
    {
      id: 'APP-567',
      name: 'Fraud Detection Engine',
      type: 'Backend Service',
      businessValue: 'Critical',
      lifecycle: 'Active',
      techStack: ['Python', 'TensorFlow', 'Redis'],
      repositories: ['github.com/org/fraud-detection']
    },
    {
      id: 'APP-678',
      name: 'Mobile App',
      type: 'Mobile Application',
      businessValue: 'High',
      lifecycle: 'Active',
      techStack: ['React Native', 'iOS', 'Android'],
      repositories: ['github.com/org/mobile-app']
    },
    {
      id: 'APP-789',
      name: 'Document Management Service',
      type: 'Microservice',
      businessValue: 'Medium',
      lifecycle: 'Active',
      techStack: ['Python', 'FastAPI', 'S3'],
      repositories: ['github.com/org/doc-mgmt-service']
    },
    {
      id: 'APP-890',
      name: 'Analytics Dashboard',
      type: 'Web Application',
      businessValue: 'Medium',
      lifecycle: 'Active',
      techStack: ['Vue.js', 'D3.js', 'ClickHouse'],
      repositories: ['github.com/org/analytics-dashboard']
    },
    {
      id: 'APP-901',
      name: 'Payment Gateway',
      type: 'Backend Service',
      businessValue: 'Critical',
      lifecycle: 'Active',
      techStack: ['Java', 'Spring Boot', 'Stripe API'],
      repositories: ['github.com/org/payment-gateway']
    }
  ];

  // Sample Data Objects
  dataObjects = [
    {
      id: 'DATA-012',
      name: 'ApplicationTable',
      type: 'Database Table',
      database: 'application_db',
      schema: 'public',
      sensitivity: 'Standard',
      columns: ['id', 'customer_id', 'status', 'submitted_date', 'type'],
      application: 'APP-456'
    },
    {
      id: 'DATA-123',
      name: 'AnalyticsDataWarehouse',
      type: 'Data Warehouse',
      database: 'analytics_dw',
      schema: 'public',
      sensitivity: 'Confidential',
      columns: ['customer_id', 'application_id', 'transaction_id', 'metrics'],
      application: 'APP-890'
    },
    {
      id: 'DATA-234',
      name: 'ConfigurationStore',
      type: 'Key-Value Store',
      location: 'Redis',
      sensitivity: 'Standard',
      retention: '90 days',
      application: 'APP-123'
    },
    {
      id: 'DATA-345',
      name: 'DocumentStorage',
      type: 'Object Storage',
      location: 'S3',
      sensitivity: 'PII',
      retention: '7 years',
      application: 'APP-789'
    },
    {
      id: 'DATA-456',
      name: 'TransactionTable',
      type: 'Database Table',
      database: 'payment_db',
      schema: 'public',
      sensitivity: 'PCI',
      columns: ['id', 'customer_id', 'amount', 'status', 'timestamp'],
      application: 'APP-901'
    },
    {
      id: 'DATA-567',
      name: 'AuditLog',
      type: 'Log Store',
      location: 'Elasticsearch',
      sensitivity: 'Confidential',
      retention: '10 years',
      application: 'APP-012'
    },
    {
      id: 'DATA-678',
      name: 'UserSessionCache',
      type: 'Cache',
      location: 'Redis',
      sensitivity: 'PII',
      retention: '24 hours',
      application: 'APP-123'
    },
    {
      id: 'DATA-789',
      name: 'CustomerTable',
      type: 'Database Table',
      database: 'customer_db',
      schema: 'public',
      sensitivity: 'PII',
      columns: ['id', 'name', 'email', 'phone', 'address'],
      application: 'APP-123'
    },
    {
      id: 'DATA-890',
      name: 'FraudScoresTable',
      type: 'Database Table',
      database: 'fraud_db',
      schema: 'public',
      sensitivity: 'Confidential',
      columns: ['id', 'customer_id', 'application_id', 'score', 'risk_level'],
      application: 'APP-567'
    },
    {
      id: 'DATA-901',
      name: 'NotificationQueue',
      type: 'Message Queue',
      location: 'RabbitMQ',
      sensitivity: 'Standard',
      retention: '7 days',
      application: 'APP-234'
    }
  ];

  // Sample APIs
  apis = [
    {
      id: 'API-001',
      name: 'Customer API',
      type: 'REST',
      version: 'v2',
      baseUrl: 'https://api.example.com/customers',
      authentication: 'OAuth 2.0',
      rateLimit: '1000 req/min',
      description: 'Customer data access and management',
      owner: 'Customer Experience Team',
      lifecycle: 'Active',
      application: 'APP-456'
    },
    {
      id: 'API-002',
      name: 'Payment API',
      type: 'REST',
      version: 'v1',
      baseUrl: 'https://api.example.com/payments',
      authentication: 'API Key',
      rateLimit: '500 req/min',
      description: 'Payment processing and transaction management',
      owner: 'Finance Team',
      lifecycle: 'Active',
      application: 'APP-901'
    },
    {
      id: 'API-003',
      name: 'Document API',
      type: 'REST',
      version: 'v1',
      baseUrl: 'https://api.example.com/documents',
      authentication: 'JWT',
      rateLimit: '2000 req/min',
      description: 'Document upload, retrieval, and management',
      owner: 'IT Operations',
      lifecycle: 'Active',
      application: 'APP-789'
    },
    {
      id: 'API-004',
      name: 'Transaction API',
      type: 'REST',
      version: 'v2',
      baseUrl: 'https://api.example.com/transactions',
      authentication: 'OAuth 2.0',
      rateLimit: '1500 req/min',
      description: 'Transaction history and reporting',
      owner: 'Finance Team',
      lifecycle: 'Active',
      application: 'APP-901'
    }
  ];

  // Sample Servers
  servers = [
    // Production Web Servers (Load Balanced)
    {
      id: 'SRV-001',
      name: 'web-prod-01',
      hostname: 'web-prod-01.company.com',
      ip: '10.1.1.11',
      environment: 'prod',
      os: 'Ubuntu 22.04 LTS',
      region: 'us-east-1',
      datacenter: 'DC1',
      cpu: '8 vCPU',
      memory: '16GB',
      status: 'active',
      purpose: 'Web Application Server'
    },
    {
      id: 'SRV-002',
      name: 'web-prod-02',
      hostname: 'web-prod-02.company.com',
      ip: '10.1.1.12',
      environment: 'prod',
      os: 'Ubuntu 22.04 LTS',
      region: 'us-east-1',
      datacenter: 'DC1',
      cpu: '8 vCPU',
      memory: '16GB',
      status: 'active',
      purpose: 'Web Application Server'
    },
    {
      id: 'SRV-003',
      name: 'api-prod-01',
      hostname: 'api-prod-01.company.com',
      ip: '10.1.2.11',
      environment: 'prod',
      os: 'Ubuntu 22.04 LTS',
      region: 'us-east-1',
      datacenter: 'DC1',
      cpu: '16 vCPU',
      memory: '32GB',
      status: 'active',
      purpose: 'API Backend Server'
    },
    {
      id: 'SRV-004',
      name: 'api-prod-02',
      hostname: 'api-prod-02.company.com',
      ip: '10.1.2.12',
      environment: 'prod',
      os: 'Ubuntu 22.04 LTS',
      region: 'us-east-1',
      datacenter: 'DC2',
      cpu: '16 vCPU',
      memory: '32GB',
      status: 'active',
      purpose: 'API Backend Server'
    },
    {
      id: 'SRV-005',
      name: 'db-prod-01',
      hostname: 'db-prod-01.company.com',
      ip: '10.1.3.11',
      environment: 'prod',
      os: 'Red Hat Enterprise Linux 8',
      region: 'us-east-1',
      datacenter: 'DC1',
      cpu: '32 vCPU',
      memory: '128GB',
      status: 'active',
      purpose: 'Primary Database Server'
    },
    {
      id: 'SRV-006',
      name: 'cache-prod-01',
      hostname: 'cache-prod-01.company.com',
      ip: '10.1.4.11',
      environment: 'prod',
      os: 'Ubuntu 22.04 LTS',
      region: 'us-east-1',
      datacenter: 'DC1',
      cpu: '4 vCPU',
      memory: '32GB',
      status: 'active',
      purpose: 'Redis Cache Server'
    },
    {
      id: 'SRV-007',
      name: 'fraud-prod-01',
      hostname: 'fraud-prod-01.company.com',
      ip: '10.1.5.11',
      environment: 'prod',
      os: 'Ubuntu 22.04 LTS',
      region: 'us-east-1',
      datacenter: 'DC1',
      cpu: '16 vCPU',
      memory: '64GB',
      status: 'active',
      purpose: 'Fraud Detection ML Server'
    },
    {
      id: 'SRV-008',
      name: 'docs-prod-01',
      hostname: 'docs-prod-01.company.com',
      ip: '10.1.6.11',
      environment: 'prod',
      os: 'Ubuntu 22.04 LTS',
      region: 'us-east-1',
      datacenter: 'DC1',
      cpu: '8 vCPU',
      memory: '16GB',
      status: 'active',
      purpose: 'Document Management Server'
    },
    // UAT Environment
    {
      id: 'SRV-009',
      name: 'web-uat-01',
      hostname: 'web-uat-01.company.com',
      ip: '10.2.1.11',
      environment: 'uat',
      os: 'Ubuntu 22.04 LTS',
      region: 'us-east-1',
      datacenter: 'DC1',
      cpu: '4 vCPU',
      memory: '8GB',
      status: 'active',
      purpose: 'UAT Web Server'
    },
    {
      id: 'SRV-010',
      name: 'api-uat-01',
      hostname: 'api-uat-01.company.com',
      ip: '10.2.2.11',
      environment: 'uat',
      os: 'Ubuntu 22.04 LTS',
      region: 'us-east-1',
      datacenter: 'DC1',
      cpu: '8 vCPU',
      memory: '16GB',
      status: 'active',
      purpose: 'UAT API Server'
    },
    // SIT Environment
    {
      id: 'SRV-011',
      name: 'web-sit-01',
      hostname: 'web-sit-01.company.com',
      ip: '10.3.1.11',
      environment: 'sit',
      os: 'Ubuntu 22.04 LTS',
      region: 'us-east-1',
      datacenter: 'DC1',
      cpu: '4 vCPU',
      memory: '8GB',
      status: 'active',
      purpose: 'SIT Web Server'
    },
    {
      id: 'SRV-012',
      name: 'api-sit-01',
      hostname: 'api-sit-01.company.com',
      ip: '10.3.2.11',
      environment: 'sit',
      os: 'Ubuntu 22.04 LTS',
      region: 'us-east-1',
      datacenter: 'DC1',
      cpu: '8 vCPU',
      memory: '16GB',
      status: 'active',
      purpose: 'SIT API Server'
    },
    // Dev Environment
    {
      id: 'SRV-013',
      name: 'dev-all-in-one',
      hostname: 'dev-all-in-one.company.com',
      ip: '10.4.1.11',
      environment: 'dev',
      os: 'Ubuntu 22.04 LTS',
      region: 'us-east-1',
      datacenter: 'DC1',
      cpu: '8 vCPU',
      memory: '16GB',
      status: 'active',
      purpose: 'Development All-in-One Server'
    },
    // NFT (Non-Functional Test) Environment
    {
      id: 'SRV-014',
      name: 'nft-perf-01',
      hostname: 'nft-perf-01.company.com',
      ip: '10.5.1.11',
      environment: 'nft',
      os: 'Ubuntu 22.04 LTS',
      region: 'us-east-1',
      datacenter: 'DC1',
      cpu: '16 vCPU',
      memory: '32GB',
      status: 'active',
      purpose: 'Performance Testing Server'
    },
    {
      id: 'SRV-015',
      name: 'nft-load-01',
      hostname: 'nft-load-01.company.com',
      ip: '10.5.2.11',
      environment: 'nft',
      os: 'Ubuntu 22.04 LTS',
      region: 'us-east-1',
      datacenter: 'DC1',
      cpu: '8 vCPU',
      memory: '16GB',
      status: 'active',
      purpose: 'Load Testing Server'
    }
  ];

  // Sample Components
  components = [
    // Customer Portal Components
    {
      id: 'COMP-001',
      name: 'Registration Form',
      application: 'APP-123',
      type: 'UI Component',
      technology: 'React',
      description: 'Customer registration and application submission form',
      responsibilities: ['Validate customer input', 'Create new customer records', 'Submit applications']
    },
    {
      id: 'COMP-002',
      name: 'Status Dashboard',
      application: 'APP-123',
      type: 'UI Component',
      technology: 'React',
      description: 'Display application status and customer information',
      responsibilities: ['Show application progress', 'Display customer profile', 'Real-time status updates']
    },
    {
      id: 'COMP-003',
      name: 'Authentication Service',
      application: 'APP-123',
      type: 'Backend Module',
      technology: 'Node.js',
      description: 'User authentication and session management',
      responsibilities: ['User login/logout', 'Session management', 'JWT token generation']
    },
    // Application Processing API Components
    {
      id: 'COMP-004',
      name: 'Application Validator',
      application: 'APP-456',
      type: 'Service Layer',
      technology: 'Java Spring',
      description: 'Validates application data and business rules',
      responsibilities: ['Validate application data', 'Check business rules', 'Update application status']
    },
    {
      id: 'COMP-005',
      name: 'Fraud Detector',
      application: 'APP-456',
      type: 'Service Layer',
      technology: 'Java Spring',
      description: 'Analyzes applications for fraud patterns',
      responsibilities: ['Calculate fraud scores', 'Flag suspicious applications', 'Store fraud analysis results']
    },
    {
      id: 'COMP-006',
      name: 'Customer Lookup Service',
      application: 'APP-456',
      type: 'Data Access Layer',
      technology: 'Java Spring Data',
      description: 'Retrieves and validates customer information',
      responsibilities: ['Fetch customer data', 'Validate customer exists', 'Check customer eligibility']
    },
    // Document Management Service Components
    {
      id: 'COMP-007',
      name: 'Document Upload Handler',
      application: 'APP-789',
      type: 'API Endpoint',
      technology: 'FastAPI',
      description: 'Handles document uploads and storage',
      responsibilities: ['Accept file uploads', 'Validate file types', 'Store in S3', 'Update metadata']
    },
    {
      id: 'COMP-008',
      name: 'Document Retrieval Service',
      application: 'APP-789',
      type: 'API Endpoint',
      technology: 'FastAPI',
      description: 'Retrieves documents from storage',
      responsibilities: ['Fetch documents from S3', 'Generate signed URLs', 'Audit document access']
    }
  ];

  // Sample Application Changes
  appChanges = [
    {
      id: 'ACH-001',
      name: 'Add Payment Processing API Endpoint',
      changeType: 'New Feature',
      status: 'Planned',
      priority: 'High',
      plannedDate: '2025-02-01',
      implementedDate: null,
      description: 'Add new API endpoint for payment processing',
      components: ['COMP-001'],  // Registration Form
      businessCapabilities: ['CAP-005'],  // Payment Processing
      dataObjects: ['DATA-456'],  // Transactions
      impactLevel: 'Medium',
      riskLevel: 'Low'
    },
    {
      id: 'ACH-002',
      name: 'Enhance Fraud Detection Algorithm',
      changeType: 'Enhancement',
      status: 'In Progress',
      priority: 'Critical',
      plannedDate: '2025-01-15',
      implementedDate: null,
      description: 'Improve ML model for fraud detection',
      components: ['COMP-005'],  // Fraud Detector
      businessCapabilities: ['CAP-006'],  // Risk Assessment & Fraud Detection
      dataObjects: ['DATA-890', 'DATA-456'],  // FraudScores, Transactions
      impactLevel: 'High',
      riskLevel: 'Medium'
    },
    {
      id: 'ACH-003',
      name: 'Customer Portal UI Redesign',
      changeType: 'Enhancement',
      status: 'In Progress',
      priority: 'Medium',
      plannedDate: '2025-01-20',
      implementedDate: null,
      description: 'Modernize customer portal user interface',
      components: ['COMP-001', 'COMP-002'],  // Registration Form, Status Dashboard
      businessCapabilities: ['CAP-001', 'CAP-004'],  // Customer Onboarding, Customer Service
      dataObjects: [],  // No direct data object changes
      impactLevel: 'Low',
      riskLevel: 'Low'
    },
    {
      id: 'ACH-004',
      name: 'Document Storage Migration to S3',
      changeType: 'Migration',
      status: 'Completed',
      priority: 'High',
      plannedDate: '2024-12-01',
      implementedDate: '2024-12-20',
      description: 'Migrate document storage from on-prem to AWS S3',
      components: ['COMP-007', 'COMP-008'],  // Document Upload/Retrieval
      businessCapabilities: ['CAP-003'],  // Document Management
      dataObjects: ['DATA-345'],  // DocumentStore
      impactLevel: 'High',
      riskLevel: 'Medium'
    },
    {
      id: 'ACH-005',
      name: 'Add Real-time Analytics Dashboard',
      changeType: 'New Feature',
      status: 'Planned',
      priority: 'Medium',
      plannedDate: '2025-03-01',
      implementedDate: null,
      description: 'Create real-time analytics dashboard for business metrics',
      components: ['COMP-002'],  // Status Dashboard
      businessCapabilities: ['CAP-008'],  // Analytics & BI
      dataObjects: ['DATA-123', 'DATA-789', 'DATA-456'],  // Analytics, Customer, Transactions
      impactLevel: 'Medium',
      riskLevel: 'Low'
    },
    {
      id: 'ACH-006',
      name: 'Deprecate Legacy Authentication',
      changeType: 'Deprecation',
      status: 'Planned',
      priority: 'Medium',
      plannedDate: '2025-04-01',
      implementedDate: null,
      description: 'Remove legacy authentication method and migrate to OAuth2',
      components: ['COMP-003'],  // Authentication Service
      businessCapabilities: ['CAP-001', 'CAP-004'],  // Customer Onboarding, Customer Service
      dataObjects: ['DATA-789'],  // CustomerTable
      impactLevel: 'High',
      riskLevel: 'High'
    }
  ];

  // Sample Infrastructure Changes
  infraChanges = [
    {
      id: 'ICH-001',
      name: 'Upgrade Production Web Servers to Ubuntu 24.04',
      changeType: 'OS Upgrade',
      status: 'Planned',
      priority: 'Medium',
      plannedDate: '2025-02-15',
      implementedDate: null,
      description: 'Upgrade all production web servers from Ubuntu 22.04 to 24.04',
      servers: ['SRV-001', 'SRV-002'],  // web-prod-01, web-prod-02
      impactLevel: 'Medium',
      riskLevel: 'Medium',
      downtime: '2 hours',
      rollbackPlan: 'Snapshot available for quick rollback'
    },
    {
      id: 'ICH-002',
      name: 'Scale API Server Capacity',
      changeType: 'Scaling',
      status: 'In Progress',
      priority: 'High',
      plannedDate: '2025-01-10',
      implementedDate: null,
      description: 'Add 2 additional API servers to handle increased load',
      servers: ['SRV-003', 'SRV-004'],  // api-prod-01, api-prod-02
      impactLevel: 'Low',
      riskLevel: 'Low',
      downtime: 'None',
      rollbackPlan: 'Remove new servers from load balancer'
    },
    {
      id: 'ICH-003',
      name: 'Database Server Memory Upgrade',
      changeType: 'Hardware Upgrade',
      status: 'Completed',
      priority: 'Critical',
      plannedDate: '2024-12-15',
      implementedDate: '2024-12-18',
      description: 'Upgrade database server memory from 32GB to 64GB',
      servers: ['SRV-005'],  // db-prod-01
      impactLevel: 'High',
      riskLevel: 'Medium',
      downtime: '30 minutes',
      rollbackPlan: 'Restore from backup if issues arise'
    },
    {
      id: 'ICH-004',
      name: 'Install Security Patches on All Servers',
      changeType: 'Security Patch',
      status: 'Planned',
      priority: 'Critical',
      plannedDate: '2025-01-25',
      implementedDate: null,
      description: 'Apply critical security patches across all environments',
      servers: ['SRV-001', 'SRV-002', 'SRV-003', 'SRV-004', 'SRV-005', 'SRV-006', 'SRV-007', 'SRV-008'],
      impactLevel: 'Low',
      riskLevel: 'Low',
      downtime: 'Rolling restart - 5 min per server',
      rollbackPlan: 'Revert patches if system instability detected'
    },
    {
      id: 'ICH-005',
      name: 'Decommission NFT Performance Server',
      changeType: 'Decommission',
      status: 'Planned',
      priority: 'Low',
      plannedDate: '2025-03-01',
      implementedDate: null,
      description: 'Decommission NFT performance testing server',
      servers: ['SRV-014'],  // nft-perf-01
      impactLevel: 'Low',
      riskLevel: 'Low',
      downtime: 'N/A',
      rollbackPlan: 'Restore from backup if needed'
    }
  ];

  // Sample Relationships - Using MASTER-PATTERNS v2.0
  relationships = [
    // NOTE: Requirements removed from simplified schema - all REQ-xxx relationships deleted

    // Applications Own Business Capabilities (Pattern 1)
    { from: 'APP-123', to: 'CAP-001', type: 'OWNS', description: 'Customer Portal owns Customer Onboarding' },
    { from: 'APP-123', to: 'CAP-004', type: 'OWNS', description: 'Customer Portal owns Customer Service & Support' },
    { from: 'APP-456', to: 'CAP-002', type: 'OWNS', description: 'App Processing API owns Application Processing' },
    { from: 'APP-567', to: 'CAP-006', type: 'OWNS', description: 'Fraud Detection Engine owns Risk Assessment' },
    { from: 'APP-789', to: 'CAP-003', type: 'OWNS', description: 'Doc Management Service owns Document Management' },
    { from: 'APP-890', to: 'CAP-008', type: 'OWNS', description: 'Analytics Dashboard owns Analytics & BI' },
    { from: 'APP-901', to: 'CAP-005', type: 'OWNS', description: 'Payment Gateway owns Payment Processing' },
    { from: 'APP-012', to: 'CAP-007', type: 'OWNS', description: 'Reporting Engine owns Compliance & Reporting' },

    // Applications Own Components (Pattern 1)
    { from: 'APP-123', to: 'COMP-001', type: 'OWNS', description: 'Customer Portal owns Registration Form' },
    { from: 'APP-123', to: 'COMP-002', type: 'OWNS', description: 'Customer Portal owns Status Dashboard' },
    { from: 'APP-123', to: 'COMP-003', type: 'OWNS', description: 'Customer Portal owns Authentication Service' },
    { from: 'APP-456', to: 'COMP-004', type: 'OWNS', description: 'App Processing API owns Application Validator' },
    { from: 'APP-456', to: 'COMP-005', type: 'OWNS', description: 'App Processing API owns Fraud Detector' },
    { from: 'APP-456', to: 'COMP-006', type: 'OWNS', description: 'App Processing API owns Customer Lookup Service' },
    { from: 'APP-789', to: 'COMP-007', type: 'OWNS', description: 'Doc Management Service owns Document Upload Handler' },
    { from: 'APP-789', to: 'COMP-008', type: 'OWNS', description: 'Doc Management Service owns Document Retrieval Service' },

    // Components Implement Business Capabilities (Pattern 3)
    // NOTE: ENABLED_BY removed - reversed to IMPLEMENTS per MASTER-PATTERNS
    { from: 'COMP-001', to: 'CAP-001', type: 'IMPLEMENTS', description: 'Registration Form implements Customer Onboarding' },
    { from: 'COMP-003', to: 'CAP-001', type: 'IMPLEMENTS', description: 'Authentication Service implements Customer Onboarding' },
    { from: 'COMP-004', to: 'CAP-002', type: 'IMPLEMENTS', description: 'Application Validator implements Application Processing' },
    { from: 'COMP-005', to: 'CAP-002', type: 'IMPLEMENTS', description: 'Fraud Detector implements Application Processing' },
    { from: 'COMP-006', to: 'CAP-002', type: 'IMPLEMENTS', description: 'Customer Lookup implements Application Processing' },
    { from: 'COMP-007', to: 'CAP-003', type: 'IMPLEMENTS', description: 'Document Upload Handler implements Document Management' },
    { from: 'COMP-008', to: 'CAP-003', type: 'IMPLEMENTS', description: 'Document Retrieval Service implements Document Management' },
    { from: 'COMP-002', to: 'CAP-004', type: 'IMPLEMENTS', description: 'Status Dashboard implements Customer Service & Support' },
    { from: 'COMP-003', to: 'CAP-004', type: 'IMPLEMENTS', description: 'Authentication Service implements Customer Service & Support' },
    { from: 'COMP-005', to: 'CAP-006', type: 'IMPLEMENTS', description: 'Fraud Detector implements Risk Assessment & Fraud Detection' },

    // Application to Application RELATES (Pattern 1)
    { from: 'APP-123', to: 'APP-678', type: 'RELATES', description: 'Customer Portal relates to Mobile App', mode: 'pulls' },
    { from: 'APP-456', to: 'APP-123', type: 'RELATES', description: 'App Processing API relates to Customer Portal', mode: 'pushes' },

    // Application to API CALLS (Pattern 2)
    { from: 'APP-123', to: 'API-001', type: 'CALLS', mode: 'pulls', rw: 'reads', description: 'Customer Portal calls Customer API' },
    { from: 'APP-678', to: 'API-001', type: 'CALLS', mode: 'pulls', rw: 'read-n-writes', description: 'Mobile App calls Customer API' },
    { from: 'APP-901', to: 'API-002', type: 'CALLS', mode: 'pushes', rw: 'writes', description: 'Payment Gateway calls Payment API' },
    { from: 'APP-789', to: 'API-003', type: 'CALLS', mode: 'pushes', rw: 'read-n-writes', description: 'Doc Management calls Document API' },
    { from: 'APP-890', to: 'API-004', type: 'CALLS', mode: 'pulls', rw: 'reads', description: 'Analytics Dashboard calls Transaction API' },

    // NOTE: Component→API CALLS relationships moved to diagrams (customer-portal-components.md)
    // NOTE: API→Component EXPOSES relationships moved to diagrams (api-container-diagram.md)

    // Component to Data Relationships - Using WORKS_ON (Pattern 10)
    // Customer Portal (APP-123) Component Data Relationships
    { from: 'COMP-001', to: 'DATA-789', type: 'WORKS_ON', rw: 'read-n-writes', description: 'Registration Form works on CustomerTable' },
    { from: 'COMP-001', to: 'DATA-012', type: 'WORKS_ON', rw: 'read-n-writes', description: 'Registration Form works on ApplicationTable' },
    { from: 'COMP-001', to: 'DATA-678', type: 'WORKS_ON', rw: 'read-n-writes', description: 'Registration Form works on UserSessionCache' },
    { from: 'COMP-002', to: 'DATA-789', type: 'WORKS_ON', rw: 'reads', description: 'Status Dashboard reads CustomerTable' },
    { from: 'COMP-002', to: 'DATA-012', type: 'WORKS_ON', rw: 'reads', description: 'Status Dashboard reads ApplicationTable' },
    { from: 'COMP-003', to: 'DATA-789', type: 'WORKS_ON', rw: 'reads', description: 'Authentication reads CustomerTable' },
    { from: 'COMP-003', to: 'DATA-678', type: 'WORKS_ON', rw: 'reads', description: 'Authentication reads UserSessionCache' },

    // Application Processing API (APP-456) Component Data Relationships
    { from: 'COMP-004', to: 'DATA-012', type: 'WORKS_ON', rw: 'read-n-writes', description: 'Validator works on ApplicationTable' },
    { from: 'COMP-004', to: 'DATA-789', type: 'WORKS_ON', rw: 'reads', description: 'Validator reads CustomerTable' },
    { from: 'COMP-005', to: 'DATA-012', type: 'WORKS_ON', rw: 'reads', description: 'Fraud Detector reads ApplicationTable' },
    { from: 'COMP-005', to: 'DATA-789', type: 'WORKS_ON', rw: 'reads', description: 'Fraud Detector reads CustomerTable' },
    { from: 'COMP-005', to: 'DATA-890', type: 'WORKS_ON', rw: 'read-n-writes', description: 'Fraud Detector works on FraudScoresTable' },
    { from: 'COMP-006', to: 'DATA-789', type: 'WORKS_ON', rw: 'reads', description: 'Customer Lookup reads CustomerTable' },

    // Document Management (APP-789) Component Data Relationships
    { from: 'COMP-007', to: 'DATA-345', type: 'WORKS_ON', rw: 'read-n-writes', description: 'Upload Handler works on DocumentStorage' },
    { from: 'COMP-007', to: 'DATA-567', type: 'WORKS_ON', rw: 'writes', description: 'Upload Handler writes to AuditLog' },
    { from: 'COMP-008', to: 'DATA-345', type: 'WORKS_ON', rw: 'reads', description: 'Retrieval Service reads DocumentStorage' },
    { from: 'COMP-008', to: 'DATA-567', type: 'WORKS_ON', rw: 'writes', description: 'Retrieval Service writes to AuditLog' },

    // Business Capability Operations on Data Objects - Using WORKS_ON (Pattern 10)
    // Customer Onboarding (CAP-001)
    { from: 'CAP-001', to: 'DATA-789', type: 'WORKS_ON', rw: 'read-n-writes', description: 'Customer Onboarding works on CustomerTable' },
    { from: 'CAP-001', to: 'DATA-678', type: 'WORKS_ON', rw: 'writes', description: 'Customer Onboarding creates session cache' },
    { from: 'CAP-001', to: 'DATA-345', type: 'WORKS_ON', rw: 'writes', description: 'Customer Onboarding creates documents' },

    // Application Processing (CAP-002)
    { from: 'CAP-002', to: 'DATA-012', type: 'WORKS_ON', rw: 'read-n-writes', description: 'Application Processing works on ApplicationTable' },
    { from: 'CAP-002', to: 'DATA-789', type: 'WORKS_ON', rw: 'reads', description: 'Application Processing reads customer data' },
    { from: 'CAP-002', to: 'DATA-890', type: 'WORKS_ON', rw: 'writes', description: 'Application Processing creates fraud scores' },
    { from: 'CAP-002', to: 'DATA-901', type: 'WORKS_ON', rw: 'writes', description: 'Application Processing creates notifications' },

    // Document Management (CAP-003)
    { from: 'CAP-003', to: 'DATA-345', type: 'WORKS_ON', rw: 'read-n-writes', description: 'Document Management works on DocumentStorage' },
    { from: 'CAP-003', to: 'DATA-567', type: 'WORKS_ON', rw: 'writes', description: 'Document Management creates audit logs' },

    // Customer Service & Support (CAP-004)
    { from: 'CAP-004', to: 'DATA-789', type: 'WORKS_ON', rw: 'reads', description: 'Customer Service reads customer data' },
    { from: 'CAP-004', to: 'DATA-012', type: 'WORKS_ON', rw: 'read-n-writes', description: 'Customer Service works on applications' },
    { from: 'CAP-004', to: 'DATA-678', type: 'WORKS_ON', rw: 'reads', description: 'Customer Service reads session cache' },

    // Payment Processing (CAP-005)
    { from: 'CAP-005', to: 'DATA-456', type: 'WORKS_ON', rw: 'read-n-writes', description: 'Payment Processing works on TransactionTable' },
    { from: 'CAP-005', to: 'DATA-789', type: 'WORKS_ON', rw: 'reads', description: 'Payment Processing reads customer data' },
    { from: 'CAP-005', to: 'DATA-567', type: 'WORKS_ON', rw: 'writes', description: 'Payment Processing creates audit logs' },

    // Risk Assessment & Fraud Detection (CAP-006)
    { from: 'CAP-006', to: 'DATA-890', type: 'WORKS_ON', rw: 'read-n-writes', description: 'Fraud Detection works on FraudScoresTable' },
    { from: 'CAP-006', to: 'DATA-789', type: 'WORKS_ON', rw: 'reads', description: 'Fraud Detection reads customer data' },
    { from: 'CAP-006', to: 'DATA-012', type: 'WORKS_ON', rw: 'reads', description: 'Fraud Detection reads application data' },
    { from: 'CAP-006', to: 'DATA-456', type: 'WORKS_ON', rw: 'reads', description: 'Fraud Detection reads transaction data' },

    // Compliance & Reporting (CAP-007)
    { from: 'CAP-007', to: 'DATA-567', type: 'WORKS_ON', rw: 'reads', description: 'Compliance reads audit logs' },
    { from: 'CAP-007', to: 'DATA-789', type: 'WORKS_ON', rw: 'reads', description: 'Compliance reads customer data' },
    { from: 'CAP-007', to: 'DATA-456', type: 'WORKS_ON', rw: 'reads', description: 'Compliance reads transaction data' },
    { from: 'CAP-007', to: 'DATA-345', type: 'WORKS_ON', rw: 'reads', description: 'Compliance reads documents' },

    // Analytics & Business Intelligence (CAP-008)
    { from: 'CAP-008', to: 'DATA-123', type: 'WORKS_ON', rw: 'read-n-writes', description: 'Analytics works on DataWarehouse' },
    { from: 'CAP-008', to: 'DATA-789', type: 'WORKS_ON', rw: 'reads', description: 'Analytics reads customer data' },
    { from: 'CAP-008', to: 'DATA-012', type: 'WORKS_ON', rw: 'reads', description: 'Analytics reads application data' },
    { from: 'CAP-008', to: 'DATA-456', type: 'WORKS_ON', rw: 'reads', description: 'Analytics reads transaction data' },

    // Component Installations on Servers (INSTALLED_ON)
    // Production deployments
    { from: 'COMP-001', to: 'SRV-001', type: 'INSTALLED_ON' },  // Registration Form on web-prod-01
    { from: 'COMP-001', to: 'SRV-002', type: 'INSTALLED_ON' },  // Registration Form on web-prod-02 (load balanced)
    { from: 'COMP-002', to: 'SRV-001', type: 'INSTALLED_ON' },  // Status Dashboard on web-prod-01
    { from: 'COMP-002', to: 'SRV-002', type: 'INSTALLED_ON' },  // Status Dashboard on web-prod-02 (load balanced)
    { from: 'COMP-003', to: 'SRV-003', type: 'INSTALLED_ON' },  // Auth Service on api-prod-01
    { from: 'COMP-003', to: 'SRV-004', type: 'INSTALLED_ON' },  // Auth Service on api-prod-02 (load balanced)
    { from: 'COMP-004', to: 'SRV-003', type: 'INSTALLED_ON' },  // App Validator on api-prod-01
    { from: 'COMP-004', to: 'SRV-004', type: 'INSTALLED_ON' },  // App Validator on api-prod-02 (load balanced)
    { from: 'COMP-005', to: 'SRV-007', type: 'INSTALLED_ON' },  // Fraud Detector on fraud-prod-01
    { from: 'COMP-006', to: 'SRV-003', type: 'INSTALLED_ON' },  // Customer Lookup on api-prod-01
    { from: 'COMP-006', to: 'SRV-004', type: 'INSTALLED_ON' },  // Customer Lookup on api-prod-02 (load balanced)
    { from: 'COMP-007', to: 'SRV-008', type: 'INSTALLED_ON' },  // Doc Upload Handler on docs-prod-01
    { from: 'COMP-008', to: 'SRV-008', type: 'INSTALLED_ON' },  // Doc Retrieval Service on docs-prod-01

    // UAT deployments
    { from: 'COMP-001', to: 'SRV-009', type: 'INSTALLED_ON' },  // Registration Form on web-uat-01
    { from: 'COMP-002', to: 'SRV-009', type: 'INSTALLED_ON' },  // Status Dashboard on web-uat-01
    { from: 'COMP-003', to: 'SRV-010', type: 'INSTALLED_ON' },  // Auth Service on api-uat-01
    { from: 'COMP-004', to: 'SRV-010', type: 'INSTALLED_ON' },  // App Validator on api-uat-01

    // SIT deployments
    { from: 'COMP-001', to: 'SRV-011', type: 'INSTALLED_ON' },  // Registration Form on web-sit-01
    { from: 'COMP-002', to: 'SRV-011', type: 'INSTALLED_ON' },  // Status Dashboard on web-sit-01
    { from: 'COMP-003', to: 'SRV-012', type: 'INSTALLED_ON' },  // Auth Service on api-sit-01

    // Dev deployments (all-in-one)
    { from: 'COMP-001', to: 'SRV-013', type: 'INSTALLED_ON' },  // Registration Form on dev-all-in-one
    { from: 'COMP-002', to: 'SRV-013', type: 'INSTALLED_ON' },  // Status Dashboard on dev-all-in-one
    { from: 'COMP-003', to: 'SRV-013', type: 'INSTALLED_ON' },  // Auth Service on dev-all-in-one
    { from: 'COMP-004', to: 'SRV-013', type: 'INSTALLED_ON' },  // App Validator on dev-all-in-one

    // NFT deployments
    { from: 'COMP-001', to: 'SRV-014', type: 'INSTALLED_ON' },  // Registration Form on nft-perf-01
    { from: 'COMP-003', to: 'SRV-014', type: 'INSTALLED_ON' },  // Auth Service on nft-perf-01

    // NOTE: Server→Server relationships removed (WORKS_WITH, LOAD_BALANCES_WITH)
    // Per MASTER-PATTERNS.md: Server nodes are leaf nodes with no outgoing relationships

    // AppChange to Component (Pattern 5 - uses CHANGES)
    { from: 'ACH-001', to: 'COMP-001', type: 'CHANGES', description: 'Payment API changes Registration Form' },
    { from: 'ACH-002', to: 'COMP-005', type: 'CHANGES', description: 'Fraud enhancement changes Fraud Detector' },
    { from: 'ACH-003', to: 'COMP-001', type: 'CHANGES', description: 'UI Redesign changes Registration Form' },
    { from: 'ACH-003', to: 'COMP-002', type: 'CHANGES', description: 'UI Redesign changes Status Dashboard' },
    { from: 'ACH-004', to: 'COMP-007', type: 'CHANGES', description: 'S3 Migration changes Document Upload' },
    { from: 'ACH-004', to: 'COMP-008', type: 'CHANGES', description: 'S3 Migration changes Document Retrieval' },
    { from: 'ACH-005', to: 'COMP-002', type: 'CHANGES', description: 'Analytics Dashboard changes Status Dashboard' },
    { from: 'ACH-006', to: 'COMP-003', type: 'CHANGES', description: 'Auth deprecation changes Authentication Service' },

    // AppChange to BusinessCapability (Pattern 5 - uses CHANGES)
    { from: 'ACH-001', to: 'CAP-005', type: 'CHANGES', description: 'Payment API changes Payment Processing' },
    { from: 'ACH-002', to: 'CAP-006', type: 'CHANGES', description: 'Fraud enhancement changes Risk Assessment' },
    { from: 'ACH-003', to: 'CAP-001', type: 'CHANGES', description: 'UI Redesign changes Customer Onboarding' },
    { from: 'ACH-003', to: 'CAP-004', type: 'CHANGES', description: 'UI Redesign changes Customer Service' },
    { from: 'ACH-004', to: 'CAP-003', type: 'CHANGES', description: 'S3 Migration changes Document Management' },
    { from: 'ACH-005', to: 'CAP-008', type: 'CHANGES', description: 'Analytics Dashboard changes Analytics & BI' },
    { from: 'ACH-006', to: 'CAP-001', type: 'CHANGES', description: 'Auth deprecation changes Customer Onboarding' },
    { from: 'ACH-006', to: 'CAP-004', type: 'CHANGES', description: 'Auth deprecation changes Customer Service' },

    // AppChange to DataObject (Pattern 5 - uses CHANGES)
    { from: 'ACH-001', to: 'DATA-456', type: 'CHANGES', description: 'Payment API changes Transactions' },
    { from: 'ACH-002', to: 'DATA-890', type: 'CHANGES', description: 'Fraud enhancement changes FraudScores' },
    { from: 'ACH-002', to: 'DATA-456', type: 'CHANGES', description: 'Fraud enhancement changes Transactions' },
    { from: 'ACH-004', to: 'DATA-345', type: 'CHANGES', description: 'S3 Migration changes DocumentStore' },
    { from: 'ACH-005', to: 'DATA-123', type: 'CHANGES', description: 'Analytics Dashboard changes Analytics' },
    { from: 'ACH-005', to: 'DATA-789', type: 'CHANGES', description: 'Analytics Dashboard changes CustomerTable' },
    { from: 'ACH-005', to: 'DATA-456', type: 'CHANGES', description: 'Analytics Dashboard changes Transactions' },
    { from: 'ACH-006', to: 'DATA-789', type: 'CHANGES', description: 'Auth deprecation changes CustomerTable' },

    // InfraChange to Server (Pattern 8 - uses CHANGES)
    { from: 'ICH-001', to: 'SRV-001', type: 'CHANGES', description: 'OS Upgrade changes web-prod-01' },
    { from: 'ICH-001', to: 'SRV-002', type: 'CHANGES', description: 'OS Upgrade changes web-prod-02' },
    { from: 'ICH-002', to: 'SRV-003', type: 'CHANGES', description: 'Scaling changes api-prod-01' },
    { from: 'ICH-002', to: 'SRV-004', type: 'CHANGES', description: 'Scaling changes api-prod-02' },
    { from: 'ICH-003', to: 'SRV-005', type: 'CHANGES', description: 'Memory upgrade changes db-prod-01' },
    { from: 'ICH-004', to: 'SRV-001', type: 'CHANGES', description: 'Security patches change web-prod-01' },
    { from: 'ICH-004', to: 'SRV-002', type: 'CHANGES', description: 'Security patches change web-prod-02' },
    { from: 'ICH-004', to: 'SRV-003', type: 'CHANGES', description: 'Security patches change api-prod-01' },
    { from: 'ICH-004', to: 'SRV-004', type: 'CHANGES', description: 'Security patches change api-prod-02' },
    { from: 'ICH-004', to: 'SRV-005', type: 'CHANGES', description: 'Security patches change db-prod-01' },
    { from: 'ICH-004', to: 'SRV-006', type: 'CHANGES', description: 'Security patches change cache-prod-01' },
    { from: 'ICH-004', to: 'SRV-007', type: 'CHANGES', description: 'Security patches change fraud-prod-01' },
    { from: 'ICH-004', to: 'SRV-008', type: 'CHANGES', description: 'Security patches change docs-prod-01' },
    { from: 'ICH-005', to: 'SRV-014', type: 'CHANGES', description: 'Decommission changes nft-perf-01' }

    // NOTE: Technical relationships moved to diagram files:
    // - BusinessFunction→BusinessFunction RELATES → business-functions-api.md
    // - Component→Component RELATES/CONTAINS → customer-portal-components.md
    // - API→DataObject WORKS_ON → api-container-diagram.md
    // - BusinessFunction→API INCLUDES → business-functions-api.md
  ];
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'mock-leanix-api' });
});

// GraphQL endpoint (simplified)
app.post('/graphql', (req, res) => {
  const { query, variables } = req.body;

  // Simple query parsing (in real implementation, use proper GraphQL parser)
  if (query.includes('allFactSheets') || query.includes('applications')) {
    res.json({
      data: {
        allFactSheets: {
          edges: applications.map(app => ({
            node: {
              id: app.id,
              name: app.name,
              type: app.type,
              ...app
            }
          }))
        }
      }
    });
  } else if (query.includes('requirements')) {
    res.json({
      data: {
        requirements: requirements
      }
    });
  } else if (query.includes('dataObjects')) {
    res.json({
      data: {
        dataObjects: dataObjects
      }
    });
  } else {
    res.json({
      data: {
        applications,
        requirements,
        dataObjects,
        relationships
      }
    });
  }
});

// REST API endpoints for easier access

// Applications
app.get('/applications', (req, res) => {
  res.json({ data: applications, count: applications.length });
});

app.get('/applications/:id', (req, res) => {
  const app = applications.find(a => a.id === req.params.id);
  if (app) {
    res.json({ data: app });
  } else {
    res.status(404).json({ error: 'Application not found' });
  }
});

app.post('/applications', (req, res) => {
  const newApp = {
    id: `APP-${uuidv4().substring(0, 8)}`,
    ...req.body
  };
  applications.push(newApp);
  res.status(201).json({ data: newApp });
});

// Components
app.get('/components', (req, res) => {
  const { application } = req.query;
  let filtered = components;

  if (application) {
    filtered = components.filter(c => c.application === application);
  }

  res.json({ data: filtered, count: filtered.length });
});

app.get('/components/:id', (req, res) => {
  const component = components.find(c => c.id === req.params.id);
  if (component) {
    res.json({ data: component });
  } else {
    res.status(404).json({ error: 'Component not found' });
  }
});

app.post('/components', (req, res) => {
  const newComponent = {
    id: `COMP-${uuidv4().substring(0, 8)}`,
    ...req.body
  };
  components.push(newComponent);
  res.status(201).json({ data: newComponent });
});

// Servers
app.get('/servers', (req, res) => {
  const { environment, datacenter, status } = req.query;
  let filtered = servers;

  if (environment) {
    filtered = filtered.filter(s => s.environment === environment);
  }
  if (datacenter) {
    filtered = filtered.filter(s => s.datacenter === datacenter);
  }
  if (status) {
    filtered = filtered.filter(s => s.status === status);
  }

  res.json({ data: filtered, count: filtered.length });
});

app.get('/servers/:id', (req, res) => {
  const server = servers.find(s => s.id === req.params.id);
  if (server) {
    res.json({ data: server });
  } else {
    res.status(404).json({ error: 'Server not found' });
  }
});

app.post('/servers', (req, res) => {
  const newServer = {
    id: `SRV-${uuidv4().substring(0, 8)}`,
    ...req.body
  };
  servers.push(newServer);
  res.status(201).json({ data: newServer });
});

// Requirements
app.get('/requirements', (req, res) => {
  res.json({ data: requirements, count: requirements.length });
});

app.get('/requirements/:id', (req, res) => {
  const requirement = requirements.find(r => r.id === req.params.id);
  if (requirement) {
    res.json({ data: requirement });
  } else {
    res.status(404).json({ error: 'Requirement not found' });
  }
});

// Data Objects
app.get('/data-objects', (req, res) => {
  res.json({ data: dataObjects, count: dataObjects.length });
});

app.get('/data-objects/:id', (req, res) => {
  const obj = dataObjects.find(d => d.id === req.params.id);
  if (obj) {
    res.json({ data: obj });
  } else {
    res.status(404).json({ error: 'Data object not found' });
  }
});

// APIs
app.get('/apis', (req, res) => {
  res.json({ data: apis, count: apis.length });
});

app.get('/apis/:id', (req, res) => {
  const api = apis.find(a => a.id === req.params.id);
  if (api) {
    res.json({ data: api });
  } else {
    res.status(404).json({ error: 'API not found' });
  }
});

// Relationships
app.get('/relationships', (req, res) => {
  const { from, to, type } = req.query;
  let filtered = relationships;

  if (from) filtered = filtered.filter(r => r.from === from);
  if (to) filtered = filtered.filter(r => r.to === to);
  if (type) filtered = filtered.filter(r => r.type === type);

  res.json({ data: filtered, count: filtered.length });
});

// Business Capabilities
app.get('/capabilities', (req, res) => {
  res.json({ data: businessCapabilities, count: businessCapabilities.length });
});

app.get('/capabilities/:id', (req, res) => {
  const cap = businessCapabilities.find(c => c.id === req.params.id);
  if (cap) {
    res.json({ data: cap });
  } else {
    res.status(404).json({ error: 'Capability not found' });
  }
});

// Application Changes
app.get('/app-changes', (req, res) => {
  const { status, priority, changeType } = req.query;
  let filtered = appChanges;

  if (status) filtered = filtered.filter(ac => ac.status === status);
  if (priority) filtered = filtered.filter(ac => ac.priority === priority);
  if (changeType) filtered = filtered.filter(ac => ac.changeType === changeType);

  res.json({ data: filtered, count: filtered.length });
});

app.get('/app-changes/:id', (req, res) => {
  const change = appChanges.find(ac => ac.id === req.params.id);
  if (change) {
    res.json({ data: change });
  } else {
    res.status(404).json({ error: 'App change not found' });
  }
});

// Infrastructure Changes
app.get('/infra-changes', (req, res) => {
  const { status, priority, changeType } = req.query;
  let filtered = infraChanges;

  if (status) filtered = filtered.filter(ic => ic.status === status);
  if (priority) filtered = filtered.filter(ic => ic.priority === priority);
  if (changeType) filtered = filtered.filter(ic => ic.changeType === changeType);

  res.json({ data: filtered, count: filtered.length });
});

app.get('/infra-changes/:id', (req, res) => {
  const change = infraChanges.find(ic => ic.id === req.params.id);
  if (change) {
    res.json({ data: change });
  } else {
    res.status(404).json({ error: 'Infra change not found' });
  }
});

// Infrastructure
app.get('/infrastructure', (req, res) => {
  res.json({ data: infrastructure, count: infrastructure.length });
});

app.get('/infrastructure/:id', (req, res) => {
  const infra = infrastructure.find(i => i.id === req.params.id);
  if (infra) {
    res.json({ data: infra });
  } else {
    res.status(404).json({ error: 'Infrastructure not found' });
  }
});

// Context Diagrams
app.get('/diagrams', (req, res) => {
  res.json({ data: contextDiagrams, count: contextDiagrams.length });
});

app.get('/diagrams/:id', (req, res) => {
  const diagram = contextDiagrams.find(d => d.id === req.params.id);
  if (diagram) {
    res.json({ data: diagram });
  } else {
    res.status(404).json({ error: 'Diagram not found' });
  }
});

// Impact Analysis - key feature for stakeholder demo
app.get('/impact/:entityId', (req, res) => {
  const { entityId } = req.params;
  const impacts = {
    upstream: [],
    downstream: [],
    relatedRequirements: [],
    relatedCapabilities: [],
    relatedInfrastructure: []
  };

  // Find all relationships involving this entity
  const upstreamRels = relationships.filter(r => r.to === entityId);
  const downstreamRels = relationships.filter(r => r.from === entityId);

  impacts.upstream = upstreamRels.map(r => {
    const source = findEntity(r.from);
    return { ...source, relationshipType: r.type };
  });

  impacts.downstream = downstreamRels.map(r => {
    const target = findEntity(r.to);
    return { ...target, relationshipType: r.type };
  });

  // Find related requirements
  const entity = findEntity(entityId);
  if (entity && entity.capability) {
    impacts.relatedRequirements = requirements.filter(r => r.capability === entity.capability);
  }

  res.json({ entityId, impacts, timestamp: new Date().toISOString() });
});

// Helper function to find any entity by ID
function findEntity(id) {
  let entity = applications.find(a => a.id === id);
  if (entity) return { ...entity, entityType: 'Application' };

  entity = requirements.find(r => r.id === id);
  if (entity) return { ...entity, entityType: 'Requirement' };

  entity = dataObjects.find(d => d.id === id);
  if (entity) return { ...entity, entityType: 'DataObject' };

  entity = infrastructure.find(i => i.id === id);
  if (entity) return { ...entity, entityType: 'Infrastructure' };

  entity = businessCapabilities.find(c => c.id === id);
  if (entity) return { ...entity, entityType: 'Capability' };

  return null;
}

// Get all data (for initial sync)
app.get('/sync/all', (req, res) => {
  res.json({
    businessCapabilities,
    applications,
    components,
    requirements,
    dataObjects,
    infrastructure,
    contextDiagrams,
    relationships,
    timestamp: new Date().toISOString(),
    statistics: {
      totalEntities: businessCapabilities.length + applications.length + components.length +
                     requirements.length + dataObjects.length + infrastructure.length,
      totalRelationships: relationships.length
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Mock LeanIX API running on port ${PORT}`);
  loadSampleData();
});
