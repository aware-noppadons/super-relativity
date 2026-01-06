/**
 * Enhanced PlantUML Context Diagram Parser
 * Handles C4 context diagrams with data flow semantics
 */

/**
 * Relationship type mapping based on description keywords
 * Considers data flow direction, not just network connection
 * NOTE: Patterns are checked in order - more specific patterns must come first
 */
const RELATIONSHIP_PATTERNS = [
  // Subscribe operations - source SUBSCRIBES TO target (must come before CONFIGURES to avoid matching "change")
  { pattern: /subscribe|listen|watch/i, type: 'SUBSCRIBES_TO', dataFlow: 'target-to-source' },

  // Pull operations - source READS FROM target
  { pattern: /pull|fetch|retrieve|get|read|query/i, type: 'READS_FROM', dataFlow: 'target-to-source' },

  // Push operations - source WRITES TO target
  { pattern: /push|send|write|publish|emit|post/i, type: 'WRITES_TO', dataFlow: 'source-to-target' },

  // Call/Invoke operations - source CALLS target
  { pattern: /call|invoke|request|api|rest|rpc/i, type: 'CALLS', dataFlow: 'source-to-target' },

  // Set/Configure operations - source CONFIGURES target (broader pattern, comes after more specific ones)
  { pattern: /set|configure|update|modify|change/i, type: 'CONFIGURES', dataFlow: 'source-to-target' },

  // Generic integration - fallback
  { pattern: /.*/, type: 'INTEGRATES_WITH', dataFlow: 'bidirectional' }
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
      dataFlow: relType.dataFlow,
      originalStatement: match[0]
    });
  }

  return relationships;
}

/**
 * Infer relationship type from description using pattern matching
 */
function inferRelationshipType(description) {
  for (const { pattern, type, dataFlow } of RELATIONSHIP_PATTERNS) {
    if (pattern.test(description)) {
      return { type, dataFlow };
    }
  }

  // Default fallback
  return { type: 'INTEGRATES_WITH', dataFlow: 'bidirectional' };
}

/**
 * Parse application/system definitions from PlantUML
 * Formats:
 * - System(id, "name", "description")
 * - System_Ext(id, "name", "description")
 * - Container(id, "name", "technology", "description")
 */
function parseApplications(plantumlContent) {
  const applications = [];

  // Match System and System_Ext definitions
  const systemRegex = /System(?:_Ext)?\s*\(\s*([^,\s]+)\s*,\s*"([^"]+)"(?:\s*,\s*"([^"]+)")?\s*\)/g;

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
    await session.run(
      `
      MERGE (a:Application {id: $id})
      ON CREATE SET
        a.name = $name,
        a.description = $description,
        a.source = $source,
        a.createdFrom = 'context-diagram',
        a.diagramFile = $fileName
      ON MATCH SET
        a.description = COALESCE(a.description, $description),
        a.lastUpdatedFrom = $fileName
      `,
      { ...app, fileName }
    );
  }

  // Create relationships between Applications
  for (const rel of relationships) {
    const { source, target, description, technology, relationshipType, dataFlow } = rel;

    // Use dynamic relationship type
    await session.run(
      `
      MATCH (from:Application {id: $source})
      MATCH (to:Application {id: $target})
      CALL apoc.merge.relationship(
        from,
        $relationshipType,
        {},
        {
          description: $description,
          technology: $technology,
          dataFlow: $dataFlow,
          source: 'context-diagram',
          diagramFile: $fileName
        },
        to,
        {}
      ) YIELD rel
      RETURN rel
      `,
      {
        source,
        target,
        relationshipType,
        description,
        technology,
        dataFlow,
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
