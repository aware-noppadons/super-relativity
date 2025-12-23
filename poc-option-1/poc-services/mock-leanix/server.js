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
let requirements = [];
let dataObjects = [];
let infrastructure = [];
let contextDiagrams = [];
let relationships = [];

// Load sample data on startup
function loadSampleData() {
  const dataPath = path.join(__dirname, 'data', 'sample-data.json');

  if (fs.existsSync(dataPath)) {
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    businessCapabilities = data.businessCapabilities || [];
    applications = data.applications || [];
    requirements = data.requirements || [];
    dataObjects = data.dataObjects || [];
    infrastructure = data.infrastructure || [];
    contextDiagrams = data.contextDiagrams || [];
    relationships = data.relationships || [];
    console.log(`✅ Sample data loaded successfully:`);
    console.log(`   - ${businessCapabilities.length} business capabilities`);
    console.log(`   - ${applications.length} applications`);
    console.log(`   - ${requirements.length} requirements`);
    console.log(`   - ${dataObjects.length} data objects`);
    console.log(`   - ${infrastructure.length} infrastructure components`);
    console.log(`   - ${contextDiagrams.length} context diagrams`);
    console.log(`   - ${relationships.length} relationships`);
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
      description: 'Allow customers to submit applications online without agent assistance'
    },
    {
      id: 'REQ-002',
      name: 'Real-time application status tracking',
      type: 'Functional Requirement',
      priority: 'Medium',
      status: 'Approved',
      owner: 'Product Team',
      description: 'Provide customers with real-time updates on application status'
    },
    {
      id: 'REQ-003',
      name: 'Secure document upload and storage',
      type: 'Non-Functional Requirement',
      priority: 'High',
      status: 'Approved',
      owner: 'Security Team',
      description: 'Ensure PII data is encrypted in transit and at rest'
    }
  ];

  // Sample Applications
  applications = [
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
      id: 'APP-456',
      name: 'Application Processing API',
      type: 'Backend Service',
      businessValue: 'High',
      lifecycle: 'Active',
      techStack: ['Java', 'Spring Boot', 'PostgreSQL'],
      repositories: ['github.com/org/app-processing-api']
    },
    {
      id: 'APP-789',
      name: 'Document Management Service',
      type: 'Microservice',
      businessValue: 'Medium',
      lifecycle: 'Active',
      techStack: ['Python', 'FastAPI', 'S3'],
      repositories: ['github.com/org/doc-mgmt-service']
    }
  ];

  // Sample Data Objects
  dataObjects = [
    {
      id: 'DATA-789',
      name: 'CustomerTable',
      type: 'Database Table',
      database: 'customer_db',
      schema: 'public',
      sensitivity: 'PII',
      columns: ['id', 'name', 'email', 'phone', 'address']
    },
    {
      id: 'DATA-012',
      name: 'ApplicationTable',
      type: 'Database Table',
      database: 'application_db',
      schema: 'public',
      sensitivity: 'Standard',
      columns: ['id', 'customer_id', 'status', 'submitted_date', 'type']
    },
    {
      id: 'DATA-345',
      name: 'DocumentStorage',
      type: 'Object Storage',
      location: 'S3',
      sensitivity: 'PII',
      retention: '7 years'
    }
  ];

  // Sample Relationships
  relationships = [
    { from: 'REQ-001', to: 'APP-123', type: 'IMPLEMENTED_BY' },
    { from: 'REQ-001', to: 'APP-456', type: 'IMPLEMENTED_BY' },
    { from: 'REQ-002', to: 'APP-123', type: 'IMPLEMENTED_BY' },
    { from: 'REQ-003', to: 'APP-789', type: 'IMPLEMENTED_BY' },
    { from: 'APP-123', to: 'DATA-789', type: 'USES' },
    { from: 'APP-456', to: 'DATA-012', type: 'USES' },
    { from: 'APP-456', to: 'DATA-789', type: 'USES' },
    { from: 'APP-789', to: 'DATA-345', type: 'USES' }
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

// Requirements
app.get('/requirements', (req, res) => {
  res.json({ data: requirements, count: requirements.length });
});

app.get('/requirements/:id', (req, res) => {
  const req = requirements.find(r => r.id === req.params.id);
  if (req) {
    res.json({ data: req });
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
    requirements,
    dataObjects,
    infrastructure,
    contextDiagrams,
    relationships,
    timestamp: new Date().toISOString(),
    statistics: {
      totalEntities: businessCapabilities.length + applications.length + requirements.length +
                     dataObjects.length + infrastructure.length,
      totalRelationships: relationships.length
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Mock LeanIX API running on port ${PORT}`);
  loadSampleData();
});
