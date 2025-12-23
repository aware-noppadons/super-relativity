// Super Relativity POC - Option 5 (Service Mesh First)
// Neo4j Lightweight Business Context Layer
// Note: Technical dependencies come from Istio runtime data

// ============================================================================
// CREATE CONSTRAINTS
// ============================================================================

CREATE CONSTRAINT requirement_id IF NOT EXISTS
FOR (r:Requirement) REQUIRE r.id IS UNIQUE;

CREATE CONSTRAINT istio_service_name IF NOT EXISTS
FOR (s:IstioService) REQUIRE s.name IS UNIQUE;

CREATE CONSTRAINT gitlab_project_id IF NOT EXISTS
FOR (p:GitLabProject) REQUIRE p.id IS UNIQUE;

// ============================================================================
// CREATE INDEXES
// ============================================================================

CREATE INDEX requirement_priority IF NOT EXISTS
FOR (r:Requirement) ON (r.priority);

CREATE INDEX service_mesh_namespace IF NOT EXISTS
FOR (s:IstioService) ON (s.namespace);

// ============================================================================
// MINIMAL BUSINESS REQUIREMENTS (Lightweight approach)
// ============================================================================

CREATE (req1:Requirement {
  id: 'REQ-001',
  name: 'Enable customer order placement',
  priority: 'High',
  status: 'Implemented'
})

CREATE (req2:Requirement {
  id: 'REQ-002',
  name: 'Secure payment processing',
  priority: 'Critical',
  status: 'Implemented',
  compliance: ['PCI-DSS']
})

CREATE (req3:Requirement {
  id: 'REQ-003',
  name: 'Order tracking and notifications',
  priority: 'Medium',
  status: 'In Progress'
})

// ============================================================================
// ISTIO SERVICES (Synced from service mesh discovery)
// ============================================================================

CREATE (svc1:IstioService {
  name: 'customer-service',
  namespace: 'default',
  version: 'v1',
  port: 8001,
  protocol: 'HTTP',
  discovered_date: '2025-12-23',
  mesh_id: 'super-relativity-mesh'
})

CREATE (svc2:IstioService {
  name: 'order-service',
  namespace: 'default',
  version: 'v1',
  port: 8002,
  protocol: 'HTTP',
  discovered_date: '2025-12-23',
  mesh_id: 'super-relativity-mesh'
})

CREATE (svc3:IstioService {
  name: 'payment-service',
  namespace: 'default',
  version: 'v1',
  port: 8003,
  protocol: 'HTTP',
  discovered_date: '2025-12-23',
  mesh_id: 'super-relativity-mesh'
})

CREATE (svc4:IstioService {
  name: 'notification-service',
  namespace: 'default',
  version: 'v1',
  port: 8004,
  protocol: 'HTTP',
  discovered_date: '2025-12-23',
  mesh_id: 'super-relativity-mesh'
})

CREATE (svc5:IstioService {
  name: 'inventory-service',
  namespace: 'default',
  version: 'v1',
  port: 8005,
  protocol: 'HTTP',
  discovered_date: '2025-12-23',
  mesh_id: 'super-relativity-mesh'
})

CREATE (svc6:IstioService {
  name: 'fraud-detection-service',
  namespace: 'default',
  version: 'v1',
  port: 8006,
  protocol: 'HTTP',
  discovered_date: '2025-12-23',
  mesh_id: 'super-relativity-mesh'
})

// ============================================================================
// GITLAB PROJECTS (Code repositories)
// ============================================================================

CREATE (proj1:GitLabProject {
  id: 1,
  name: 'customer-service',
  path: 'services/customer-service',
  default_branch: 'main',
  web_url: 'http://gitlab:8080/services/customer-service'
})

CREATE (proj2:GitLabProject {
  id: 2,
  name: 'order-service',
  path: 'services/order-service',
  default_branch: 'main',
  web_url: 'http://gitlab:8080/services/order-service'
})

CREATE (proj3:GitLabProject {
  id: 3,
  name: 'payment-service',
  path: 'services/payment-service',
  default_branch: 'main',
  web_url: 'http://gitlab:8080/services/payment-service'
})

CREATE (proj4:GitLabProject {
  id: 4,
  name: 'notification-service',
  path: 'services/notification-service',
  default_branch: 'main',
  web_url: 'http://gitlab:8080/services/notification-service'
})

// ============================================================================
// RELATIONSHIPS (Minimal - Focus on business context only)
// ============================================================================

// Requirements → Services (Manual mapping)
CREATE (req1)-[:IMPLEMENTED_BY {confidence: 1.0, source: 'manual'}]->(svc2)
CREATE (req2)-[:IMPLEMENTED_BY {confidence: 1.0, source: 'manual'}]->(svc3)
CREATE (req3)-[:IMPLEMENTED_BY {confidence: 0.9, source: 'inferred'}]->(svc4)

// Services → GitLab Projects
CREATE (svc1)-[:SOURCE_CODE]->(proj1)
CREATE (svc2)-[:SOURCE_CODE]->(proj2)
CREATE (svc3)-[:SOURCE_CODE]->(proj3)
CREATE (svc4)-[:SOURCE_CODE]->(proj4)

// NOTE: Service-to-service dependencies are NOT stored here
// They come from Istio runtime data (always up-to-date)
// This Neo4j layer only adds business context

// ============================================================================
// ENRICHMENT PLACEHOLDERS
// ============================================================================

// These nodes will be enriched by the context-enrichment service
// which pulls data from Istio/Prometheus/Kiali

CREATE (:EnrichmentMetadata {
  last_sync_istio: datetime(),
  last_sync_gitlab: datetime(),
  services_discovered: 6,
  dependencies_discovered_istio: 0,  // Updated by sync service
  note: 'Technical dependencies discovered automatically by Istio'
})

// ============================================================================
// SAMPLE QUERIES FOR HYBRID MODEL
// ============================================================================

// Query 1: Get service with both business context (Neo4j) and runtime metrics (Prometheus)
// This would be executed by the Query API which combines both sources
// MATCH (r:Requirement)-[:IMPLEMENTED_BY]->(s:IstioService {name: 'order-service'})
// RETURN r.name as requirement, s.name as service
// + Prometheus query for runtime metrics
// + Kiali query for runtime dependencies

// Query 2: Impact analysis combining design and runtime
// MATCH (r:Requirement {id: 'REQ-001'})-[:IMPLEMENTED_BY]->(s:IstioService)
// RETURN r.name, s.name
// + Query Kiali API for downstream services (runtime dependencies)
// + Combine both for complete impact view

// Query 3: Compliance - which services handle PCI data
// MATCH (r:Requirement {compliance: 'PCI-DSS'})-[:IMPLEMENTED_BY]->(s:IstioService)
// RETURN s.name, s.namespace
// + Query Istio for mTLS status (compliance requirement)

// Query 4: Code to deployment trace
// MATCH (s:IstioService {name: 'payment-service'})-[:SOURCE_CODE]->(p:GitLabProject)
// RETURN s.name, p.web_url
// + Query GitLab CI/CD pipelines
// + Query Istio for deployment status
