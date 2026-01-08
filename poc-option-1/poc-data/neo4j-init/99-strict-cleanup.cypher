// ============================================================================
// STRICT CLEANUP - Enforce Master Patterns v2.0
// ============================================================================
// This script removes ALL relationships and nodes that violate the Master
// Patterns specification (MASTER-PATTERNS.md v2.0).
// Run this after stopping the sync service.
// Reference: MASTER-PATTERNS.md
// ============================================================================

// ============================================================================
// STEP 1: Remove ALL Disallowed Node Types
// ============================================================================

MATCH (r:Requirement)
DETACH DELETE r;

MATCH (i:Infrastructure)
DETACH DELETE i;

MATCH (d:Diagram)
DETACH DELETE d;

MATCH (c:Container)
DETACH DELETE c;

MATCH (si:StorageInfrastructure)
DETACH DELETE si;

MATCH (bc:BusinessCapability)
DETACH DELETE bc;

// ============================================================================
// STEP 2: Remove ALL Server Outgoing Relationships (Server should only receive)
// ============================================================================

MATCH (s:Server)-[r]->(target)
DELETE r;

// ============================================================================
// STEP 3: Remove ALL DataObject Outgoing Relationships (DataObject should only receive)
// ============================================================================

MATCH (d:DataObject)-[r]->(target)
DELETE r;

// ============================================================================
// STEP 4: Enforce Pattern 1 - Application Relationships
// ============================================================================

// Allow: Application -[RELATES]-> Application
// Allow: Application -[CALLS]-> API
// Allow: Application -[OWNS]-> BusinessFunction
// Allow: Application -[OWNS]-> Component
// Disallow: Everything else from Application

MATCH (app:Application)-[r]->(target)
WHERE NOT (
  (labels(target)[0] = 'Application' AND type(r) = 'RELATES') OR
  (labels(target)[0] = 'API' AND type(r) = 'CALLS') OR
  (labels(target)[0] = 'BusinessFunction' AND type(r) = 'OWNS') OR
  (labels(target)[0] = 'Component' AND type(r) = 'OWNS')
)
DELETE r;

// Validate CALLS relationships have required properties (mode, rw)
MATCH (app:Application)-[r:CALLS]->(api:API)
WHERE r.mode IS NULL OR r.rw IS NULL
SET r.mode = COALESCE(r.mode, 'pulls'),
    r.rw = COALESCE(r.rw, 'read-n-writes');

// ============================================================================
// STEP 5: Enforce Pattern 2 - API Relationships
// ============================================================================

// Allow: API -[EXPOSES]-> Component
// Allow: API -[WORKS_ON]-> DataObject
// Disallow: Everything else from API

MATCH (api:API)-[r]->(target)
WHERE NOT (
  (labels(target)[0] = 'Component' AND type(r) = 'EXPOSES') OR
  (labels(target)[0] = 'DataObject' AND type(r) = 'WORKS_ON')
)
DELETE r;

// Validate WORKS_ON relationships have required properties (rw)
MATCH (api:API)-[r:WORKS_ON]->(data:DataObject)
WHERE r.rw IS NULL
SET r.rw = 'read-n-writes';

// ============================================================================
// STEP 6: Enforce Pattern 2 (Bidirectional) - Component → API
// ============================================================================

// Component → API must be CALLS relationship
MATCH (comp:Component)-[r]->(api:API)
WHERE type(r) <> 'CALLS'
DELETE r;

// Validate CALLS relationships have required properties (mode, rw)
MATCH (comp:Component)-[r:CALLS]->(api:API)
WHERE r.mode IS NULL OR r.rw IS NULL
SET r.mode = COALESCE(r.mode, 'pulls'),
    r.rw = COALESCE(r.rw, 'read-n-writes');

// ============================================================================
// STEP 7: Enforce Pattern 3 - Component → BusinessFunction
// ============================================================================

// Component → BusinessFunction must be IMPLEMENTS
MATCH (comp:Component)-[r]->(bf:BusinessFunction)
WHERE type(r) <> 'IMPLEMENTS'
DELETE r;

// ============================================================================
// STEP 8: Enforce Pattern 4 - BusinessFunction → API
// ============================================================================

// BusinessFunction → API must be INCLUDES
MATCH (bf:BusinessFunction)-[r]->(api:API)
WHERE type(r) <> 'INCLUDES'
DELETE r;

// ============================================================================
// STEP 9: Enforce Pattern 5 - AppChange Relationships
// ============================================================================

// Allow: AppChange -[CHANGES]-> Component
// Allow: AppChange -[CHANGES]-> BusinessFunction
// Allow: AppChange -[CHANGES]-> DataObject
// Disallow: Everything else from AppChange

MATCH (ac:AppChange)-[r]->(target)
WHERE NOT (
  labels(target)[0] IN ['Component', 'BusinessFunction', 'DataObject'] AND type(r) = 'CHANGES'
)
DELETE r;

// ============================================================================
// STEP 10: Enforce Pattern 6 - Table → DataObject
// ============================================================================

// Table → anything must be MATERIALIZES to DataObject
MATCH (tbl:Table)-[r]->(target)
WHERE NOT (labels(target)[0] = 'DataObject' AND type(r) = 'MATERIALIZES')
DELETE r;

// ============================================================================
// STEP 11: Enforce Pattern 7 - Component → Server
// ============================================================================

// Component → Server must be INSTALLED_ON
MATCH (comp:Component)-[r]->(srv:Server)
WHERE type(r) <> 'INSTALLED_ON'
DELETE r;

// ============================================================================
// STEP 12: Enforce Pattern 8 - InfraChange → Server
// ============================================================================

// InfraChange → anything must be CHANGES to Server
MATCH (ic:InfraChange)-[r]->(target)
WHERE NOT (labels(target)[0] = 'Server' AND type(r) = 'CHANGES')
DELETE r;

// ============================================================================
// STEP 13: Enforce Pattern 9 - Component → Component
// ============================================================================

// Component → Component must be RELATES or CONTAINS
MATCH (c1:Component)-[r]->(c2:Component)
WHERE NOT type(r) IN ['RELATES', 'CONTAINS']
DELETE r;

// ============================================================================
// STEP 14: Enforce Pattern 10 - Component/BusinessFunction → DataObject
// ============================================================================

// Component → DataObject must be WORKS_ON
MATCH (comp:Component)-[r]->(data:DataObject)
WHERE type(r) <> 'WORKS_ON'
DELETE r;

// Validate WORKS_ON relationships have required properties (rw)
MATCH (comp:Component)-[r:WORKS_ON]->(data:DataObject)
WHERE r.rw IS NULL
SET r.rw = 'read-n-writes';

// BusinessFunction → DataObject must be WORKS_ON
MATCH (bf:BusinessFunction)-[r]->(data:DataObject)
WHERE type(r) <> 'WORKS_ON'
DELETE r;

// Validate WORKS_ON relationships have required properties (rw)
MATCH (bf:BusinessFunction)-[r:WORKS_ON]->(data:DataObject)
WHERE r.rw IS NULL
SET r.rw = 'read-n-writes';

// ============================================================================
// STEP 15: Enforce Pattern 11 - BusinessFunction → BusinessFunction
// ============================================================================

// BusinessFunction → BusinessFunction must be RELATES (NOT CONTAINS)
MATCH (bf1:BusinessFunction)-[r]->(bf2:BusinessFunction)
WHERE type(r) <> 'RELATES'
DELETE r;

// Validate RELATES relationships have required properties (mode)
MATCH (bf1:BusinessFunction)-[r:RELATES]->(bf2:BusinessFunction)
WHERE r.mode IS NULL
SET r.mode = 'pulls';

// ============================================================================
// STEP 16: Remove Orphaned OLD-STYLE Relationships
// ============================================================================

// Remove any remaining RELATED_TO relationships (from old v1.0 schema)
MATCH ()-[r:RELATED_TO]->()
DELETE r;

// ============================================================================
// STEP 17: Validate Allowed Relationship Types
// ============================================================================

// Delete ANY relationship type that is not one of the 11 allowed types
MATCH ()-[r]->()
WHERE NOT type(r) IN [
  'CALLS', 'OWNS', 'EXPOSES', 'WORKS_ON', 'IMPLEMENTS',
  'INCLUDES', 'CHANGES', 'MATERIALIZES', 'INSTALLED_ON',
  'RELATES', 'CONTAINS'
]
DELETE r;

// ============================================================================
// VERIFICATION QUERIES
// ============================================================================

// Count node types
MATCH (n)
RETURN 'Node Count' as metric, labels(n)[0] as type, count(*) as count
ORDER BY type;

// Count relationships by type and pattern
MATCH (source)-[r]->(target)
RETURN 'Relationship Pattern' as metric,
       type(r) as relationshipType,
       labels(source)[0] + ' → ' + labels(target)[0] as pattern,
       count(*) as count
ORDER BY relationshipType, pattern;

// Verify CALLS relationships have required properties
MATCH (source)-[r:CALLS]->(target)
RETURN 'CALLS Validation' as metric,
       labels(source)[0] + ' → ' + labels(target)[0] as pattern,
       count(*) as total,
       count(r.mode) as withMode,
       count(r.rw) as withRW
ORDER BY pattern;

// Verify WORKS_ON relationships have required properties
MATCH (source)-[r:WORKS_ON]->(target)
RETURN 'WORKS_ON Validation' as metric,
       labels(source)[0] + ' → ' + labels(target)[0] as pattern,
       count(*) as total,
       count(r.rw) as withRW
ORDER BY pattern;

// Verify RELATES (BF→BF) relationships have required properties
MATCH (bf1:BusinessFunction)-[r:RELATES]->(bf2:BusinessFunction)
RETURN 'RELATES (BF→BF) Validation' as metric,
       count(*) as total,
       count(r.mode) as withMode;

// Check for disallowed nodes
MATCH (r:Requirement) WITH count(r) as reqCount
OPTIONAL MATCH (i:Infrastructure) WITH reqCount, count(i) as infraCount
OPTIONAL MATCH (d:Diagram) WITH reqCount, infraCount, count(d) as diagramCount
OPTIONAL MATCH (c:Container) WITH reqCount, infraCount, diagramCount, count(c) as containerCount
OPTIONAL MATCH (si:StorageInfrastructure) WITH reqCount, infraCount, diagramCount, containerCount, count(si) as storageCount
OPTIONAL MATCH (bc:BusinessCapability)
RETURN 'Disallowed Nodes' as metric,
  reqCount as Requirements,
  infraCount as Infrastructure,
  diagramCount as Diagrams,
  containerCount as Containers,
  storageCount as StorageInfra,
  count(bc) as BusinessCapability;

// Final summary
MATCH (n)
WITH count(n) as totalNodes
MATCH ()-[r]->()
WITH totalNodes, count(r) as totalRels, collect(DISTINCT type(r)) as relTypes
RETURN 'Database Summary' as metric,
       totalNodes,
       totalRels,
       relTypes;
