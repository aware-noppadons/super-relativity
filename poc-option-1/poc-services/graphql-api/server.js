const express = require('express');
const { createHandler } = require('graphql-http/lib/use/express');
const { buildSchema } = require('graphql');
const neo4j = require('neo4j-driver');
const { Pool } = require('pg');
const redis = require('redis');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 4000;

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

// Redis connection
const redisClient = redis.createClient({
  socket: {
    host: process.env.REDIS_HOST || 'redis',
    port: process.env.REDIS_PORT || 6379,
  },
  password: process.env.REDIS_PASSWORD || 'sr_redis_2025',
});

// GraphQL Schema
const schema = buildSchema(`
  type Application {
    id: ID!
    name: String!
    description: String
    status: String
    businessCriticality: String
    dependencies: [Application]
  }

  type CodeFile {
    path: String!
    name: String!
    extension: String!
    functions: [Function]
  }

  type Function {
    name: String!
    filePath: String!
  }

  type Diagram {
    fileName: String!
    type: String!
    entityCount: Int!
    relationshipCount: Int!
    entities: [DiagramEntity]
  }

  type DiagramEntity {
    id: String!
    label: String!
    type: String!
  }

  type Repository {
    name: String!
    path: String!
    fileCount: Int!
    files: [CodeFile]
  }

  type SyncJob {
    jobId: String!
    status: String!
    recordsSynced: Int
    startedAt: String!
    completedAt: String
  }

  type Query {
    # Applications
    applications: [Application]
    application(id: ID!): Application

    # Code analysis
    repositories: [Repository]
    repository(name: String!): Repository
    codeFiles: [CodeFile]

    # Diagrams
    diagrams: [Diagram]
    diagram(fileName: String!): Diagram

    # Jobs/Status
    syncJobs: [SyncJob]

    # Graph queries
    findRelatedApplications(applicationId: ID!, depth: Int): [Application]
    searchApplications(query: String!): [Application]
  }

  type Mutation {
    triggerSync: SyncJob
  }
`);

// Resolver functions
const root = {
  // Applications
  applications: async () => {
    const session = neo4jDriver.session();
    try {
      const result = await session.run(`
        MATCH (a:Application)
        RETURN a
        LIMIT 100
      `);
      return result.records.map(record => record.get('a').properties);
    } finally {
      await session.close();
    }
  },

  application: async ({ id }) => {
    const session = neo4jDriver.session();
    try {
      const result = await session.run(`
        MATCH (a:Application {id: $id})
        RETURN a
      `, { id });

      if (result.records.length === 0) return null;
      return result.records[0].get('a').properties;
    } finally {
      await session.close();
    }
  },

  // Repositories
  repositories: async () => {
    const session = neo4jDriver.session();
    try {
      const result = await session.run(`
        MATCH (r:Repository)
        RETURN r
      `);
      return result.records.map(record => record.get('r').properties);
    } finally {
      await session.close();
    }
  },

  repository: async ({ name }) => {
    const session = neo4jDriver.session();
    try {
      const result = await session.run(`
        MATCH (r:Repository {name: $name})
        OPTIONAL MATCH (r)-[:CONTAINS]->(f:CodeFile)
        RETURN r, collect(f) as files
      `, { name });

      if (result.records.length === 0) return null;

      const repo = result.records[0].get('r').properties;
      const files = result.records[0].get('files').map(f => f.properties);

      return { ...repo, files };
    } finally {
      await session.close();
    }
  },

  // Code files
  codeFiles: async () => {
    const session = neo4jDriver.session();
    try {
      const result = await session.run(`
        MATCH (f:CodeFile)
        RETURN f
        LIMIT 100
      `);
      return result.records.map(record => record.get('f').properties);
    } finally {
      await session.close();
    }
  },

  // Diagrams
  diagrams: async () => {
    const session = neo4jDriver.session();
    try {
      const result = await session.run(`
        MATCH (d:Diagram)
        RETURN d
      `);
      return result.records.map(record => record.get('d').properties);
    } finally {
      await session.close();
    }
  },

  diagram: async ({ fileName }) => {
    const session = neo4jDriver.session();
    try {
      const result = await session.run(`
        MATCH (d:Diagram {fileName: $fileName})
        OPTIONAL MATCH (d)-[:CONTAINS]->(e:DiagramEntity)
        RETURN d, collect(e) as entities
      `, { fileName });

      if (result.records.length === 0) return null;

      const diagram = result.records[0].get('d').properties;
      const entities = result.records[0].get('entities').map(e => e.properties);

      return { ...diagram, entities };
    } finally {
      await session.close();
    }
  },

  // Jobs
  syncJobs: async () => {
    const result = await pgPool.query(`
      SELECT job_id as "jobId", status, records_synced as "recordsSynced",
             started_at as "startedAt", completed_at as "completedAt"
      FROM sync_jobs
      ORDER BY started_at DESC
      LIMIT 20
    `);
    return result.rows;
  },

  // Graph queries
  findRelatedApplications: async ({ applicationId, depth = 2 }) => {
    const session = neo4jDriver.session();
    try {
      const result = await session.run(`
        MATCH path = (a:Application {id: $applicationId})-[*1..${depth}]-(related:Application)
        RETURN DISTINCT related
        LIMIT 50
      `, { applicationId });

      return result.records.map(record => record.get('related').properties);
    } finally {
      await session.close();
    }
  },

  searchApplications: async ({ query }) => {
    const session = neo4jDriver.session();
    try {
      const result = await session.run(`
        MATCH (a:Application)
        WHERE toLower(a.name) CONTAINS toLower($query)
           OR toLower(a.description) CONTAINS toLower($query)
        RETURN a
        LIMIT 50
      `, { query });

      return result.records.map(record => record.get('a').properties);
    } finally {
      await session.close();
    }
  },

  // Mutations
  triggerSync: async () => {
    // Trigger sync via HTTP call to sync service
    const axios = require('axios');
    try {
      await axios.post('http://sync-service:3001/api/sync/trigger');
      return {
        jobId: `manual-${Date.now()}`,
        status: 'triggered',
        startedAt: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(`Failed to trigger sync: ${error.message}`);
    }
  },
};

app.use(cors());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'graphql-api' });
});

// GraphQL endpoint
app.all('/graphql', createHandler({
  schema: schema,
  rootValue: root,
}));

// Initialize and start server
async function start() {
  try {
    await neo4jDriver.verifyConnectivity();
    console.log('✓ Connected to Neo4j');

    await pgPool.query('SELECT NOW()');
    console.log('✓ Connected to PostgreSQL');

    await redisClient.connect();
    console.log('✓ Connected to Redis');

    app.listen(PORT, () => {
      console.log(`✓ GraphQL API listening on port ${PORT}`);
      console.log(`✓ GraphiQL available at http://localhost:${PORT}/graphql`);
    });
  } catch (error) {
    console.error('Failed to start GraphQL API:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully...');
  await neo4jDriver.close();
  await pgPool.end();
  await redisClient.quit();
  process.exit(0);
});

start();
