const express = require('express');
const neo4j = require('neo4j-driver');
const fs = require('fs').promises;
const path = require('path');
const { glob } = require('glob');
const contextDiagramParser = require('./context-diagram-parser');

const app = express();
const PORT = process.env.PORT || 3003;

// Neo4j connection
const neo4jDriver = neo4j.driver(
  process.env.NEO4J_URI || 'bolt://neo4j:7687',
  neo4j.auth.basic(
    process.env.NEO4J_USER || 'neo4j',
    process.env.NEO4J_PASSWORD || 'super-relativity-2025'
  )
);

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'diagram-parser' });
});

// Parse diagram file endpoint
app.post('/api/parse/diagram', async (req, res) => {
  const { content, fileName, diagramType } = req.body;

  if (!content) {
    return res.status(400).json({ error: 'content is required' });
  }

  try {
    const result = await parseDiagram(content, fileName || 'unknown', diagramType || 'mermaid');
    res.json(result);
  } catch (error) {
    console.error('Parse error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Parse diagrams from directory
app.post('/api/parse/directory', async (req, res) => {
  const { directoryPath } = req.body;

  if (!directoryPath) {
    return res.status(400).json({ error: 'directoryPath is required' });
  }

  try {
    const result = await parseDirectory(directoryPath);
    res.json(result);
  } catch (error) {
    console.error('Parse error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Parse single C4 context diagram
app.post('/api/parse/context-diagram', async (req, res) => {
  const { content, fileName } = req.body;

  if (!content) {
    return res.status(400).json({ error: 'content is required' });
  }

  try {
    const parsed = contextDiagramParser.parseContextDiagram(content, fileName || 'unknown.puml');

    const session = neo4jDriver.session();
    try {
      const result = await contextDiagramParser.storeContextDiagram(session, parsed);
      res.json({ ...parsed, ...result });
    } finally {
      await session.close();
    }
  } catch (error) {
    console.error('Context diagram parse error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Parse context diagrams from directory
app.post('/api/parse/context-diagrams', async (req, res) => {
  const { directoryPath } = req.body;

  if (!directoryPath) {
    return res.status(400).json({ error: 'directoryPath is required' });
  }

  try {
    const result = await parseContextDiagramDirectory(directoryPath);
    res.json(result);
  } catch (error) {
    console.error('Context diagrams parse error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Parse Mermaid diagram
function parseMermaidDiagram(content, fileName) {
  const entities = [];
  const relationships = [];

  // Simple Mermaid parser (POC level)
  const lines = content.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();

    // Match entity definitions (e.g., "UserService" or "A[User Service]")
    const entityMatch = trimmed.match(/^([A-Za-z0-9_]+)(\[.*?\])?$/);
    if (entityMatch) {
      const id = entityMatch[1];
      const label = entityMatch[2]?.replace(/[\[\]]/g, '') || id;
      entities.push({ id, label, type: 'DiagramEntity' });
    }

    // Match relationships (e.g., "A --> B" or "UserService -->|uses| Database")
    const relMatch = trimmed.match(/([A-Za-z0-9_]+)\s*(-->|---|\-\.\->)\s*(?:\|(.+?)\|)?\s*([A-Za-z0-9_]+)/);
    if (relMatch) {
      const [, from, arrow, label, to] = relMatch;
      relationships.push({
        from,
        to,
        type: label || 'CONNECTED_TO',
        arrow,
      });
    }
  }

  return { entities, relationships, diagramType: 'mermaid', fileName };
}

// Parse PlantUML diagram
function parsePlantUMLDiagram(content, fileName) {
  const entities = [];
  const relationships = [];

  // Simple PlantUML parser (POC level)
  const lines = content.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();

    // Match class/component definitions
    const entityMatch = trimmed.match(/^(class|component|interface)\s+([A-Za-z0-9_]+)/);
    if (entityMatch) {
      const [, type, id] = entityMatch;
      entities.push({ id, label: id, type: type.toUpperCase() });
    }

    // Match relationships
    const relMatch = trimmed.match(/([A-Za-z0-9_]+)\s*(-->|--|\.\.>)\s*([A-Za-z0-9_]+)\s*:\s*(.+)?/);
    if (relMatch) {
      const [, from, arrow, to, label] = relMatch;
      relationships.push({
        from,
        to,
        type: label || 'RELATED_TO',
        arrow,
      });
    }
  }

  return { entities, relationships, diagramType: 'plantuml', fileName };
}

// Main parse diagram function
async function parseDiagram(content, fileName, diagramType) {
  console.log(`Parsing ${diagramType} diagram: ${fileName}`);

  let parsed;
  if (diagramType === 'mermaid') {
    parsed = parseMermaidDiagram(content, fileName);
  } else if (diagramType === 'plantuml') {
    parsed = parsePlantUMLDiagram(content, fileName);
  } else {
    throw new Error(`Unsupported diagram type: ${diagramType}`);
  }

  // Store in Neo4j
  const session = neo4jDriver.session();
  try {
    // Create diagram node
    await session.run(
      `
      MERGE (d:Diagram {fileName: $fileName})
      SET d.type = $diagramType,
          d.parsedAt = datetime(),
          d.entityCount = $entityCount,
          d.relationshipCount = $relationshipCount
      `,
      {
        fileName,
        diagramType,
        entityCount: parsed.entities.length,
        relationshipCount: parsed.relationships.length,
      }
    );

    // Create entities
    for (const entity of parsed.entities) {
      await session.run(
        `
        MATCH (d:Diagram {fileName: $fileName})
        MERGE (e:DiagramEntity {id: $id, diagramFile: $fileName})
        SET e.label = $label,
            e.type = $type
        MERGE (d)-[:CONTAINS]->(e)
        `,
        { fileName, ...entity }
      );
    }

    // Create relationships
    for (const rel of parsed.relationships) {
      await session.run(
        `
        MATCH (from:DiagramEntity {id: $from, diagramFile: $fileName})
        MATCH (to:DiagramEntity {id: $to, diagramFile: $fileName})
        MERGE (from)-[r:DIAGRAM_RELATIONSHIP {diagramFile: $fileName}]->(to)
        SET r.type = $type,
            r.arrow = $arrow
        `,
        { fileName, ...rel }
      );
    }

    console.log(`Parsed ${parsed.entities.length} entities and ${parsed.relationships.length} relationships from ${fileName}`);
  } finally {
    await session.close();
  }

  return parsed;
}

// Parse directory of diagrams
async function parseDirectory(directoryPath) {
  console.log(`Parsing diagrams from directory: ${directoryPath}`);

  // Find all diagram files
  const mermaidFiles = await glob('**/*.{mmd,mermaid}', { cwd: directoryPath });
  const plantumlFiles = await glob('**/*.{puml,plantuml}', { cwd: directoryPath });

  const results = [];

  // Parse Mermaid files
  for (const file of mermaidFiles) {
    try {
      const filePath = path.join(directoryPath, file);
      const content = await fs.readFile(filePath, 'utf-8');
      const result = await parseDiagram(content, file, 'mermaid');
      results.push(result);
    } catch (error) {
      console.warn(`Failed to parse ${file}:`, error.message);
    }
  }

  // Parse PlantUML files
  for (const file of plantumlFiles) {
    try {
      const filePath = path.join(directoryPath, file);
      const content = await fs.readFile(filePath, 'utf-8');
      const result = await parseDiagram(content, file, 'plantuml');
      results.push(result);
    } catch (error) {
      console.warn(`Failed to parse ${file}:`, error.message);
    }
  }

  return {
    totalFiles: mermaidFiles.length + plantumlFiles.length,
    mermaidFiles: mermaidFiles.length,
    plantumlFiles: plantumlFiles.length,
    parsed: results.length,
    results,
  };
}

// Parse context diagrams from directory
async function parseContextDiagramDirectory(directoryPath) {
  console.log(`Parsing context diagrams from directory: ${directoryPath}`);

  // Find all MD and PlantUML files
  const mdFiles = await glob('**/*.md', { cwd: directoryPath });
  const pumlFiles = await glob('**/*.{puml,plantuml}', { cwd: directoryPath });

  const results = [];
  const session = neo4jDriver.session();

  try {
    // Parse MD files that contain PlantUML blocks
    for (const file of mdFiles) {
      try {
        const filePath = path.join(directoryPath, file);
        const content = await fs.readFile(filePath, 'utf-8');

        // Only process if it contains PlantUML content
        if (content.includes('@startuml')) {
          const parsed = contextDiagramParser.parseContextDiagram(content, file);
          const result = await contextDiagramParser.storeContextDiagram(session, parsed);
          results.push({ file, ...parsed, ...result });
        }
      } catch (error) {
        console.warn(`Failed to parse ${file}:`, error.message);
      }
    }

    // Parse PlantUML files
    for (const file of pumlFiles) {
      try {
        const filePath = path.join(directoryPath, file);
        const content = await fs.readFile(filePath, 'utf-8');
        const parsed = contextDiagramParser.parseContextDiagram(content, file);
        const result = await contextDiagramParser.storeContextDiagram(session, parsed);
        results.push({ file, ...parsed, ...result });
      } catch (error) {
        console.warn(`Failed to parse ${file}:`, error.message);
      }
    }
  } finally {
    await session.close();
  }

  return {
    totalFiles: mdFiles.length + pumlFiles.length,
    mdFiles: mdFiles.length,
    pumlFiles: pumlFiles.length,
    parsed: results.length,
    results,
  };
}

// Initialize and start server
async function start() {
  try {
    await neo4jDriver.verifyConnectivity();
    console.log('✓ Connected to Neo4j');

    app.listen(PORT, () => {
      console.log(`✓ Diagram parser service listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start diagram parser service:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully...');
  await neo4jDriver.close();
  process.exit(0);
});

start();
