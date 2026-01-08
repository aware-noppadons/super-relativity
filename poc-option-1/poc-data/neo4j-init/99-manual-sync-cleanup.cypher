// ============================================================================
// Phase 3: Sync Data Cleanup
// ============================================================================
// This file cleans up data that may be synced from external sources
// (LeanIX, PlantUML, etc.) that don't follow our simplified schema.
//
// Run this manually after sync operations:
// docker exec -i super-relativity-neo4j cypher-shell -u neo4j \
//   -p super-relativity-2025 < 03-sync-cleanup.cypher
// ============================================================================

// ============================================================================
// Remove Disallowed Node Types
// ============================================================================

// Remove Requirement nodes (not in simplified schema)
MATCH (r:Requirement)
DETACH DELETE r;

// Remove Infrastructure nodes (replaced by Server)
MATCH (i:Infrastructure)
DETACH DELETE i;

// Remove Diagram nodes (not needed at runtime)
MATCH (d:Diagram)
DETACH DELETE d;

// Remove Container nodes (should be migrated to API)
MATCH (c:Container)
DETACH DELETE c;

// Remove StorageInfrastructure nodes
MATCH (si:StorageInfrastructure)
DETACH DELETE si;

// Remove BusinessCapability nodes (should be BusinessFunction)
MATCH (bc:BusinessCapability)
DETACH DELETE bc;

// ============================================================================
// Remove Disallowed Relationship Patterns
// ============================================================================

// Remove Server → Server relationships (not allowed)
MATCH (s1:Server)-[r:RELATED_TO]-(s2:Server)
DELETE r;

// Remove any non-RELATED_TO relationships
MATCH ()-[r]->()
WHERE type(r) <> 'RELATED_TO'
DELETE r;

// ============================================================================
// Fix Relationship Directions (if synced incorrectly)
// ============================================================================

// If Component → API exists, reverse to API → Component
MATCH (c:Component)-[r:RELATED_TO {mode: 'exposes'}]->(api:API)
WITH c, api, r
CREATE (api)-[:RELATED_TO {
  mode: 'exposes',
  tags: COALESCE(r.tags, ['EXPOSES']),
  description: r.description
}]->(c)
DELETE r;

// If BusinessFunction → Component with 'implemented_by', reverse to Component → BusinessFunction with 'implements'
MATCH (bf:BusinessFunction)-[r:RELATED_TO {mode: 'implemented_by'}]->(c:Component)
WITH bf, c, r
CREATE (c)-[:RELATED_TO {
  mode: 'implements',
  tags: ['IMPLEMENTS'],
  description: r.description
}]->(bf)
DELETE r;

// If DataObject → Table with 'materialized_by', reverse to Table → DataObject with 'materializes'
MATCH (d:DataObject)-[r:RELATED_TO {mode: 'materialized_by'}]->(t:Table)
WITH d, t, r
CREATE (t)-[:RELATED_TO {
  mode: 'materializes',
  tags: ['MATERIALIZES'],
  description: r.description
}]->(d)
DELETE r;

// ============================================================================
// Ensure All Relationships Have Mode Tags
// ============================================================================

// Set default mode for relationships without mode
MATCH (a)-[r:RELATED_TO]->(b)
WHERE r.mode IS NULL
SET r.mode = 'relates';

// Ensure all relationships have tags
MATCH ()-[r:RELATED_TO]->()
WHERE r.tags IS NULL OR size(r.tags) = 0
SET r.tags = ['RELATED_TO'];

// ============================================================================
// Enforce Allowed Relationship Patterns
// ============================================================================

// Application: only → Application, API, BusinessFunction, Component
MATCH (app:Application)-[r:RELATED_TO]-(other)
WHERE NOT (labels(other)[0] IN ['Application', 'API', 'BusinessFunction', 'Component'])
DELETE r;

// API: only → Component, DataObject
MATCH (api:API)-[r:RELATED_TO]-(other)
WHERE NOT (labels(other)[0] IN ['Component', 'DataObject'])
DELETE r;

// Component: only → BusinessFunction, Server, Component, DataObject, API, Application
MATCH (c:Component)-[r:RELATED_TO]-(other)
WHERE NOT (labels(other)[0] IN ['BusinessFunction', 'Server', 'Component', 'DataObject', 'API', 'Application'])
DELETE r;

// BusinessFunction: only → API, BusinessFunction, DataObject, Component, Application
MATCH (bf:BusinessFunction)-[r:RELATED_TO]-(other)
WHERE NOT (labels(other)[0] IN ['API', 'BusinessFunction', 'DataObject', 'Component', 'Application'])
DELETE r;

// AppChange: only → Component, BusinessFunction, DataObject
MATCH (ac:AppChange)-[r:RELATED_TO]-(other)
WHERE NOT (labels(other)[0] IN ['Component', 'BusinessFunction', 'DataObject'])
DELETE r;

// Table: only → DataObject
MATCH (t:Table)-[r:RELATED_TO]-(other)
WHERE NOT (labels(other)[0] IN ['DataObject'])
DELETE r;

// InfraChange: only → Server
MATCH (ic:InfraChange)-[r:RELATED_TO]-(other)
WHERE NOT (labels(other)[0] IN ['Server'])
DELETE r;

// Server: only incoming (delete all outgoing)
MATCH (s:Server)-[r:RELATED_TO]->(other)
DELETE r;

// ============================================================================
// Verification
// ============================================================================

// Count node types
MATCH (n)
RETURN 'Node Count' as metric, labels(n)[0] as type, count(*) as count
ORDER BY type;

// Count relationships without mode
MATCH ()-[r:RELATED_TO]->()
WHERE r.mode IS NULL
RETURN 'Missing Mode Tags' as metric, count(*) as count;

// Check for disallowed nodes
MATCH (r:Requirement) WITH count(r) as reqCount
MATCH (i:Infrastructure) WITH reqCount, count(i) as infraCount
MATCH (d:Diagram) WITH reqCount, infraCount, count(d) as diagramCount
MATCH (c:Container) WITH reqCount, infraCount, diagramCount, count(c) as containerCount
MATCH (si:StorageInfrastructure) WITH reqCount, infraCount, diagramCount, containerCount, count(si) as storageCount
MATCH (bc:BusinessCapability)
RETURN 'Disallowed Nodes' as metric,
  reqCount as Requirements,
  infraCount as Infrastructure,
  diagramCount as Diagrams,
  containerCount as Containers,
  storageCount as StorageInfra,
  count(bc) as BusinessCapability;
