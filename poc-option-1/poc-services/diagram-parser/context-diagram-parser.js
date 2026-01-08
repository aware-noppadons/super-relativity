/**
 * Enhanced PlantUML Context Diagram Parser
 * Handles C4 context diagrams with MASTER-PATTERNS v2.0 relationship types
 */

/**
 * Relationship type mapping based on description keywords
 * Maps to MASTER-PATTERNS v2.0 relationship types
 * NOTE: Patterns are checked in order - more specific patterns must come first
 */
const RELATIONSHIP_PATTERNS = [
  // Call/Invoke operations - source CALLS target (Pattern 1, 2)
  { pattern: /call|invoke|request|api|rest|rpc/i, type: 'CALLS', mode: 'pushes', rw: null },

  // Expose/Serve operations - source EXPOSES target (Pattern 4)
  { pattern: /expose|serve|provide/i, type: 'EXPOSES', mode: null, rw: null },

  // Read and Write operations - source WORKS_ON target (Pattern 2, 10)
  { pattern: /read and write|read & write|update data|modify data/i, type: 'WORKS_ON', mode: null, rw: 'read-n-writes' },

  // Write operations - source WORKS_ON target with writes (Pattern 2, 10)
  { pattern: /write|send|publish|push|post|emit|insert|create/i, type: 'WORKS_ON', mode: 'pushes', rw: 'writes' },

  // Read operations - source WORKS_ON target with reads (Pattern 2, 10)
  { pattern: /read|fetch|retrieve|get|pull|query|select/i, type: 'WORKS_ON', mode: 'pulls', rw: 'reads' },

  // Subscribe operations - source RELATES to target (Pattern 1, 11)
  { pattern: /subscribe|listen|watch/i, type: 'RELATES', mode: 'pulls', rw: null },

  // Contains operations - source CONTAINS target (Pattern 9)
  { pattern: /contain|include|has/i, type: 'CONTAINS', mode: null, rw: null },

  // Implements operations - source IMPLEMENTS target (Pattern 3)
  { pattern: /implement|realize|execute/i, type: 'IMPLEMENTS', mode: null, rw: null },

  // Generic integration - source RELATES to target (Pattern 1, 9, 11)
  { pattern: /.*/, type: 'RELATES', mode: 'bidirectional', rw: null }
];

/**
 * Extract PlantUML blocks from markdown content
 */
function extractPlantUMLFromMarkdown(content) {
  const plantumlBlocks = [];
  const regex = /@startuml([\s\S]*?)@enduml/g;
  let match;

  while ((match = regex.exec(content)) !== null) {
    plantumlBlocks.push(match[1].trim());
  }

  return plantumlBlocks;
}

/**
 * Parse Rel() statements from PlantUML content
 * Format: Rel(source, target, "description", ...)
 */
function parseRelationships(plantumlContent) {
  const relationships = [];

  // Match Rel() statements with various formats
  // Rel(app1, app2, "description")
  // Rel(app1, app2, "description", "technology")
  // Rel_D, Rel_U, Rel_L, Rel_R (directional hints in PlantUML)
  const relRegex = /Rel(?:_[UDLR])?\s*\(\s*([^,\s]+)\s*,\s*([^,\s]+)\s*,\s*"([^"]+)"(?:,\s*"([^"]+)")?\s*\)/g;

  let match;
  while ((match = relRegex.exec(plantumlContent)) !== null) {
    const [, source, target, description, technology] = match;

    // Determine relationship type based on description
    const relType = inferRelationshipType(description);

    relationships.push({
      source: source.trim(),
      target: target.trim(),
      description: description.trim(),
      technology: technology?.trim(),
      relationshipType: relType.type,
      mode: relType.mode,
      rw: relType.rw,
      originalStatement: match[0]
    });
  }

  return relationships;
}

/**
 * Infer relationship type from description using pattern matching
 * Returns MASTER-PATTERNS v2.0 compliant relationship type with properties
 */
function inferRelationshipType(description) {
  for (const { pattern, type, mode, rw } of RELATIONSHIP_PATTERNS) {
    if (pattern.test(description)) {
      return { type, mode, rw };
    }
  }

  // Default fallback
  return { type: 'RELATES', mode: 'bidirectional', rw: null };
}

/**
 * Parse application/system definitions from PlantUML
 * Formats:
 * - System(id, "name", "description")
 * - System_Ext(id, "name", "description")
 * - Container(id, "name", "technology", "description")
 * - ContainerDb(id, "name", "technology", "description")
 * - Component(id, "name", "technology", "description")
 */
function parseApplications(plantumlContent) {
  const applications = [];

  // Match System and System_Ext definitions (2 or 3 params)
  const systemRegex = /System(?:_Ext)?(?:_Boundary)?\s*\(\s*([^,\s]+)\s*,\s*"([^"]+)"(?:\s*,\s*"([^"]+)")?\s*\)/g;

  let match;
  while ((match = systemRegex.exec(plantumlContent)) !== null) {
    const [, id, name, description] = match;

    applications.push({
      id: id.trim(),
      name: name.trim(),
      description: description?.trim(),
      source: 'plantuml-context-diagram'
    });
  }

  // Match Container, ContainerDb, and Component definitions (3 or 4 params)
  // Format: Container(id, "name", "technology", "description")
  const containerRegex = /(Container(?:Db)?|Component)\s*\(\s*([^,\s]+)\s*,\s*"([^"]+)"(?:\s*,\s*"([^"]+)")?(?:\s*,\s*"([^"]+)")?\s*\)/g;

  while ((match = containerRegex.exec(plantumlContent)) !== null) {
    const [, type, id, name, techOrDesc, description] = match;

    applications.push({
      id: id.trim(),
      name: name.trim(),
      technology: description ? techOrDesc?.trim() : undefined,
      description: description?.trim() || techOrDesc?.trim(),
      source: 'plantuml-context-diagram',
      elementType: type
    });
  }

  return applications;
}

/**
 * Main parser function for context diagrams
 */
function parseContextDiagram(content, fileName) {
  console.log(`Parsing context diagram: ${fileName}`);

  // Extract PlantUML blocks if content is markdown
  let plantumlContent = content;
  if (content.includes('@startuml')) {
    const blocks = extractPlantUMLFromMarkdown(content);
    if (blocks.length > 0) {
      plantumlContent = blocks.join('\n');
    }
  }

  // Parse applications and relationships
  const applications = parseApplications(plantumlContent);
  const relationships = parseRelationships(plantumlContent);

  console.log(`Found ${applications.length} applications and ${relationships.length} relationships`);

  return {
    fileName,
    applications,
    relationships,
    diagramType: 'c4-context',
    parsedAt: new Date().toISOString()
  };
}

/**
 * Store parsed context diagram in Neo4j
 */
async function storeContextDiagram(session, parsed) {
  const { fileName, applications, relationships } = parsed;

  // Create or update Application nodes
  for (const app of applications) {
    // Build parameters, only including non-null/undefined values
    const params = {
      id: app.id,
      name: app.name,
      source: app.source,
      fileName
    };

    // Add optional properties only if they exist
    if (app.description) params.description = app.description;
    if (app.technology) params.technology = app.technology;
    if (app.elementType) params.elementType = app.elementType;

    // Build dynamic SET clauses
    const createSetClauses = [
      'a.name = $name',
      'a.source = $source',
      'a.createdFrom = \'context-diagram\'',
      'a.diagramFile = $fileName'
    ];
    const matchSetClauses = ['a.lastUpdatedFrom = $fileName'];

    if (app.description) {
      createSetClauses.push('a.description = $description');
      matchSetClauses.push('a.description = COALESCE(a.description, $description)');
    }
    if (app.technology) {
      createSetClauses.push('a.technology = $technology');
      matchSetClauses.push('a.technology = COALESCE(a.technology, $technology)');
    }
    if (app.elementType) {
      createSetClauses.push('a.elementType = $elementType');
      matchSetClauses.push('a.elementType = COALESCE(a.elementType, $elementType)');
    }

    await session.run(
      `
      MERGE (a:Application {id: $id})
      ON CREATE SET ${createSetClauses.join(',\n        ')}
      ON MATCH SET ${matchSetClauses.join(',\n        ')}
      `,
      params
    );
  }

  // Create relationships between Applications
  for (const rel of relationships) {
    const { source, target, description, technology, relationshipType, mode, rw } = rel;

    // Build properties object, only including non-null values
    const properties = {
      description,
      source: 'context-diagram',
      diagramFile: fileName
    };
    if (technology) properties.technology = technology;
    if (mode) properties.mode = mode;
    if (rw) properties.rw = rw;

    // Use dynamic relationship type
    await session.run(
      `
      MATCH (from:Application {id: $source})
      MATCH (to:Application {id: $target})
      CALL apoc.merge.relationship(
        from,
        $relationshipType,
        {},
        $properties,
        to,
        {}
      ) YIELD rel
      RETURN rel
      `,
      {
        source,
        target,
        relationshipType,
        properties,
        fileName
      }
    );
  }

  // Create diagram metadata node for traceability
  await session.run(
    `
    MERGE (d:ContextDiagram {fileName: $fileName})
    SET d.parsedAt = datetime(),
        d.applicationCount = $applicationCount,
        d.relationshipCount = $relationshipCount,
        d.type = 'C4-Context'
    `,
    {
      fileName,
      applicationCount: applications.length,
      relationshipCount: relationships.length
    }
  );

  console.log(`Stored ${applications.length} applications and ${relationships.length} relationships from ${fileName}`);

  return {
    stored: true,
    applications: applications.length,
    relationships: relationships.length
  };
}

module.exports = {
  parseContextDiagram,
  storeContextDiagram,
  extractPlantUMLFromMarkdown,
  parseRelationships,
  parseApplications,
  inferRelationshipType
};
