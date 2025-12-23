const express = require('express');
const neo4j = require('neo4j-driver');
const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');
const { parse } = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const { glob } = require('glob');

const app = express();
const PORT = process.env.PORT || 3002;

// Neo4j connection
const neo4jDriver = neo4j.driver(
  process.env.NEO4J_URI || 'bolt://neo4j:7687',
  neo4j.auth.basic(
    process.env.NEO4J_USER || 'neo4j',
    process.env.NEO4J_PASSWORD || 'super-relativity-2025'
  )
);

// PostgreSQL connection
const pgPool = new Pool({
  host: process.env.POSTGRES_HOST || 'postgres',
  port: process.env.POSTGRES_PORT || 5432,
  database: process.env.POSTGRES_DB || 'super_relativity',
  user: process.env.POSTGRES_USER || 'sr_user',
  password: process.env.POSTGRES_PASSWORD || 'sr_password_2025',
});

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'code-parser' });
});

// Parse code repository endpoint
app.post('/api/parse/repository', async (req, res) => {
  const { repositoryPath, repositoryName } = req.body;

  if (!repositoryPath) {
    return res.status(400).json({ error: 'repositoryPath is required' });
  }

  try {
    const result = await parseRepository(repositoryPath, repositoryName);
    res.json(result);
  } catch (error) {
    console.error('Parse error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get parsing jobs status
app.get('/api/parse/jobs', async (req, res) => {
  try {
    const result = await pgPool.query(
      'SELECT * FROM parse_jobs ORDER BY started_at DESC LIMIT 20'
    );
    res.json({ jobs: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Main parsing function
async function parseRepository(repoPath, repoName = 'unknown') {
  const jobId = `parse-${Date.now()}`;
  const startTime = new Date();

  console.log(`[${jobId}] Parsing repository: ${repoName} at ${repoPath}`);

  try {
    // Record parse job
    await pgPool.query(
      'INSERT INTO parse_jobs (job_id, repository_name, repository_path, status, started_at) VALUES ($1, $2, $3, $4, $5)',
      [jobId, repoName, repoPath, 'running', startTime]
    );

    // Find all JavaScript/TypeScript files
    const files = await glob('**/*.{js,jsx,ts,tsx}', {
      cwd: repoPath,
      ignore: ['**/node_modules/**', '**/dist/**', '**/build/**'],
    });

    console.log(`[${jobId}] Found ${files.length} code files`);

    const session = neo4jDriver.session();
    let filesProcessed = 0;
    let functionsFound = 0;
    let importsFound = 0;

    try {
      // Create repository node
      await session.run(
        `
        MERGE (r:Repository {name: $name})
        SET r.path = $path,
            r.lastParsedAt = datetime(),
            r.fileCount = $fileCount
        `,
        { name: repoName, path: repoPath, fileCount: files.length }
      );

      // Parse each file
      for (const file of files.slice(0, 50)) { // Limit to 50 files for POC
        try {
          const filePath = path.join(repoPath, file);
          const content = await fs.readFile(filePath, 'utf-8');

          // Parse with Babel
          const ast = parse(content, {
            sourceType: 'module',
            plugins: ['jsx', 'typescript'],
          });

          const fileNode = {
            path: file,
            name: path.basename(file),
            extension: path.extname(file),
          };

          // Create file node
          await session.run(
            `
            MATCH (r:Repository {name: $repoName})
            MERGE (f:CodeFile {path: $path})
            SET f.name = $name,
                f.extension = $extension
            MERGE (r)-[:CONTAINS]->(f)
            `,
            { repoName, ...fileNode }
          );

          // Extract functions and imports
          traverse(ast, {
            FunctionDeclaration(path) {
              const funcName = path.node.id?.name;
              if (funcName) {
                session.run(
                  `
                  MATCH (f:CodeFile {path: $filePath})
                  MERGE (fn:Function {name: $funcName, filePath: $filePath})
                  MERGE (f)-[:DEFINES]->(fn)
                  `,
                  { filePath: file, funcName }
                );
                functionsFound++;
              }
            },
            ImportDeclaration(path) {
              const importSource = path.node.source.value;
              session.run(
                `
                MATCH (f:CodeFile {path: $filePath})
                MERGE (m:Module {name: $moduleName})
                MERGE (f)-[:IMPORTS]->(m)
                `,
                { filePath: file, moduleName: importSource }
              );
              importsFound++;
            },
          });

          filesProcessed++;
        } catch (error) {
          console.warn(`[${jobId}] Failed to parse ${file}:`, error.message);
        }
      }
    } finally {
      await session.close();
    }

    // Update job status
    await pgPool.query(
      'UPDATE parse_jobs SET status = $1, completed_at = $2, files_processed = $3 WHERE job_id = $4',
      ['completed', new Date(), filesProcessed, jobId]
    );

    console.log(`[${jobId}] Parsing completed: ${filesProcessed} files, ${functionsFound} functions, ${importsFound} imports`);

    return {
      jobId,
      filesProcessed,
      functionsFound,
      importsFound,
      duration: Date.now() - startTime.getTime(),
    };
  } catch (error) {
    console.error(`[${jobId}] Parsing failed:`, error);

    await pgPool.query(
      'UPDATE parse_jobs SET status = $1, completed_at = $2, error_message = $3 WHERE job_id = $4',
      ['failed', new Date(), error.message, jobId]
    );

    throw error;
  }
}

// Initialize and start server
async function start() {
  try {
    // Test connections
    await neo4jDriver.verifyConnectivity();
    console.log('✓ Connected to Neo4j');

    await pgPool.query('SELECT NOW()');
    console.log('✓ Connected to PostgreSQL');

    // Create parse_jobs table
    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS parse_jobs (
        id SERIAL PRIMARY KEY,
        job_id VARCHAR(100) UNIQUE NOT NULL,
        repository_name VARCHAR(255),
        repository_path TEXT,
        status VARCHAR(20) NOT NULL,
        started_at TIMESTAMP NOT NULL,
        completed_at TIMESTAMP,
        files_processed INTEGER,
        error_message TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✓ Database tables ready');

    app.listen(PORT, () => {
      console.log(`✓ Code parser service listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start code parser service:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully...');
  await neo4jDriver.close();
  await pgPool.end();
  process.exit(0);
});

start();
