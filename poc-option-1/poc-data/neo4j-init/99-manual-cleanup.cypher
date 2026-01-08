// ============================================================================
// MANUAL CLEANUP SCRIPT
// ============================================================================
// Run this script manually after sync activities to clean up stray nodes
// and relationships that may be introduced by LeanIX, PlantUML, or other
// external data sources.
//
// Usage:
//   docker exec super-relativity-neo4j cypher-shell -u neo4j \
//     -p super-relativity-2025 < 99-manual-cleanup.cypher
//
// Or run individual queries in Neo4j Browser as needed.
// ============================================================================

// Cleanup 1: Remove Requirement nodes (not in simplified schema)
// Requirement nodes may be synced from LeanIX but are not part of our schema
MATCH (r:Requirement)
DETACH DELETE r;

// Cleanup 2: Remove disallowed Server→Server relationships
// Server nodes should only have incoming relationships from Component and InfraChange
MATCH (s1:Server)-[r:RELATED_TO]-(s2:Server)
DELETE r;

// Cleanup 3: Remove Infrastructure nodes (if synced from LeanIX)
MATCH (i:Infrastructure)
DETACH DELETE i;

// Cleanup 4: Remove Diagram nodes (if synced from PlantUML)
MATCH (d:Diagram)
DETACH DELETE d;

// Cleanup 5: Remove Container nodes (should be migrated to API already)
MATCH (c:Container)
DETACH DELETE c;

// Cleanup 6: Remove StorageInfrastructure nodes (should be deleted already)
MATCH (si:StorageInfrastructure)
DETACH DELETE si;

// Cleanup 7: Add missing mode tags to AppChange relationships
MATCH (ac:AppChange)-[r:RELATED_TO]->(target)
WHERE (labels(target)[0] IN ['Component', 'BusinessFunction', 'DataObject'])
  AND r.mode IS NULL
SET r.mode = 'relates';

// Cleanup 8: Remove any non-RELATED_TO relationships that might have been synced
MATCH ()-[r]->()
WHERE type(r) <> 'RELATED_TO'
DELETE r;

// Cleanup 9: Ensure all RELATED_TO relationships have tags
MATCH ()-[r:RELATED_TO]->()
WHERE r.tags IS NULL OR size(r.tags) = 0
SET r.tags = ['RELATED_TO'];

// ============================================================================
// Cleanup 10: Remove relationships that don't match allowed patterns
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

// Server: only incoming from Component, InfraChange (delete all outgoing)
MATCH (s:Server)-[r:RELATED_TO]->(other)
DELETE r;

// ============================================================================
// VERIFICATION QUERIES
// ============================================================================

// Count node types (should only show allowed types)
MATCH (n)
RETURN labels(n)[0] as nodeType, count(*) as count
ORDER BY count DESC;

// Count relationships without mode tags (should be 0)
MATCH ()-[r:RELATED_TO]->()
WHERE r.mode IS NULL
RETURN count(*) as relationshipsWithoutMode;

// Count non-RELATED_TO relationships (should be 0)
MATCH ()-[r]->()
WHERE type(r) <> 'RELATED_TO'
RETURN type(r) as relationshipType, count(*) as count;

// Check for disallowed node types (should all be 0)
MATCH (r:Requirement) WITH count(r) as requirementCount
MATCH (i:Infrastructure) WITH requirementCount, count(i) as infraCount
MATCH (d:Diagram) WITH requirementCount, infraCount, count(d) as diagramCount
MATCH (c:Container) WITH requirementCount, infraCount, diagramCount, count(c) as containerCount
MATCH (si:StorageInfrastructure)
RETURN
  requirementCount as Requirements,
  infraCount as Infrastructure,
  diagramCount as Diagrams,
  containerCount as Containers,
  count(si) as StorageInfra;
