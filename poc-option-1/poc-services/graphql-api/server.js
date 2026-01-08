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

  type GraphNode {
    id: String!
    label: String!
    nodeType: String!
    level: Int!
    properties: String
  }

  type GraphEdge {
    id: String!
    source: String!
    target: String!
    label: String!
    relationshipType: String!
  }

  type HierarchicalGraph {
    nodes: [GraphNode]!
    edges: [GraphEdge]!
  }

  type AppChange {
    id: ID!
    name: String!
    changeType: String!
    status: String!
    priority: String!
    plannedDate: String
    implementedDate: String
    description: String
    impactLevel: String
    riskLevel: String
    components: [String]
    businessFunctions: [String]
    dataObjects: [String]
  }

  type InfraChange {
    id: ID!
    name: String!
    changeType: String!
    status: String!
    priority: String!
    plannedDate: String
    implementedDate: String
    description: String
    impactLevel: String
    riskLevel: String
    downtime: String
    rollbackPlan: String
    servers: [String]
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

    # Hierarchical graph visualization
    hierarchicalGraph(rootName: String!, rootType: String!): HierarchicalGraph

    # Custom Cypher query for graph visualization
    customCypherGraph(cypherQuery: String!): HierarchicalGraph

    # Change management
    appChanges(status: String, priority: String, changeType: String): [AppChange]
    appChange(id: ID!): AppChange
    infraChanges(status: String, priority: String, changeType: String): [InfraChange]
    infraChange(id: ID!): InfraChange
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

  // Change management
  appChanges: async ({ status, priority, changeType }) => {
    const session = neo4jDriver.session();
    try {
      let whereClauses = [];
      let params = {};

      if (status) {
        whereClauses.push('ac.status = $status');
        params.status = status;
      }
      if (priority) {
        whereClauses.push('ac.priority = $priority');
        params.priority = priority;
      }
      if (changeType) {
        whereClauses.push('ac.changeType = $changeType');
        params.changeType = changeType;
      }

      const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

      const result = await session.run(`
        MATCH (ac:AppChange)
        ${whereClause}
        OPTIONAL MATCH (ac)-[r1:CHANGES]->(comp:Component)
        OPTIONAL MATCH (ac)-[r2:CHANGES]->(bf:BusinessFunction)
        OPTIONAL MATCH (ac)-[r3:CHANGES]->(do:DataObject)
        RETURN ac,
               collect(DISTINCT comp.id) as components,
               collect(DISTINCT bf.id) as businessFunctions,
               collect(DISTINCT do.id) as dataObjects
        LIMIT 100
      `, params);

      return result.records.map(record => ({
        ...record.get('ac').properties,
        components: record.get('components').filter(id => id),
        businessFunctions: record.get('businessFunctions').filter(id => id),
        dataObjects: record.get('dataObjects').filter(id => id),
      }));
    } finally {
      await session.close();
    }
  },

  appChange: async ({ id }) => {
    const session = neo4jDriver.session();
    try {
      const result = await session.run(`
        MATCH (ac:AppChange {id: $id})
        OPTIONAL MATCH (ac)-[r1:CHANGES]->(comp:Component)
        OPTIONAL MATCH (ac)-[r2:CHANGES]->(bf:BusinessFunction)
        OPTIONAL MATCH (ac)-[r3:CHANGES]->(do:DataObject)
        RETURN ac,
               collect(DISTINCT comp.id) as components,
               collect(DISTINCT bf.id) as businessFunctions,
               collect(DISTINCT do.id) as dataObjects
      `, { id });

      if (result.records.length === 0) return null;

      const record = result.records[0];
      return {
        ...record.get('ac').properties,
        components: record.get('components').filter(id => id),
        businessFunctions: record.get('businessFunctions').filter(id => id),
        dataObjects: record.get('dataObjects').filter(id => id),
      };
    } finally {
      await session.close();
    }
  },

  infraChanges: async ({ status, priority, changeType }) => {
    const session = neo4jDriver.session();
    try {
      let whereClauses = [];
      let params = {};

      if (status) {
        whereClauses.push('ic.status = $status');
        params.status = status;
      }
      if (priority) {
        whereClauses.push('ic.priority = $priority');
        params.priority = priority;
      }
      if (changeType) {
        whereClauses.push('ic.changeType = $changeType');
        params.changeType = changeType;
      }

      const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

      const result = await session.run(`
        MATCH (ic:InfraChange)
        ${whereClause}
        OPTIONAL MATCH (ic)-[r:CHANGES]->(srv:Server)
        RETURN ic,
               collect(DISTINCT srv.id) as servers
        LIMIT 100
      `, params);

      return result.records.map(record => ({
        ...record.get('ic').properties,
        servers: record.get('servers').filter(id => id),
      }));
    } finally {
      await session.close();
    }
  },

  infraChange: async ({ id }) => {
    const session = neo4jDriver.session();
    try {
      const result = await session.run(`
        MATCH (ic:InfraChange {id: $id})
        OPTIONAL MATCH (ic)-[r:CHANGES]->(srv:Server)
        RETURN ic,
               collect(DISTINCT srv.id) as servers
      `, { id });

      if (result.records.length === 0) return null;

      const record = result.records[0];
      return {
        ...record.get('ic').properties,
        servers: record.get('servers').filter(id => id),
      };
    } finally {
      await session.close();
    }
  },

  // Hierarchical graph visualization
  hierarchicalGraph: async ({ rootName, rootType }) => {
    const session = neo4jDriver.session();
    try {
      // Query to get hierarchical structure using variable-length paths
      // Uses specific relationship types per MASTER-PATTERNS.md
      const result = await session.run(`
        MATCH (root {name: $rootName})
        WHERE $rootType IN labels(root)

        // Get all nodes within 3 hops using allowed relationship types
        OPTIONAL MATCH path = (root)-[r:WORKS_ON|IMPLEMENTS|RELATES|INSTALLED_ON|CHANGES|CALLS|OWNS|EXPOSES|MATERIALIZES|INCLUDES|CONTAINS*1..3]-(connected)

        WITH root,
             collect(DISTINCT {
               path: path,
               node: connected,
               distance: length(path)
             }) as connectedNodes

        // Extract nodes and relationships from paths
        UNWIND connectedNodes as cn

        WITH root,
             collect(DISTINCT {node: cn.node, level: cn.distance}) as nodes,
             [p in connectedNodes WHERE p.path IS NOT NULL | p.path] as paths

        // Extract all relationships from paths
        UNWIND paths as path
        UNWIND relationships(path) as rel

        RETURN root,
               nodes,
               collect(DISTINCT {
                 rel: rel,
                 start: startNode(rel),
                 end: endNode(rel)
               }) as edges
      `, { rootName, rootType });

      if (result.records.length === 0) {
        return { nodes: [], edges: [] };
      }

      const graphNodes = [];
      const graphEdges = [];
      const nodeIds = new Set();
      const edgeIds = new Set();

      const record = result.records[0];
      const root = record.get('root');

      // Add root node (level 0)
      if (root) {
        const rootId = root.identity.toString();
        graphNodes.push({
          id: rootId,
          label: root.properties.name || 'Root',
          nodeType: root.labels[0],
          level: 0,
          properties: JSON.stringify(root.properties),
        });
        nodeIds.add(rootId);
      }

      // Process connected nodes
      const connectedNodesList = record.get('nodes') || [];
      connectedNodesList.forEach(item => {
        if (item.node) {
          const nodeId = item.node.identity.toString();
          if (!nodeIds.has(nodeId)) {
            // Convert Neo4j Integer to JavaScript number
            const level = item.level && typeof item.level.toInt === 'function'
              ? item.level.toInt()
              : (typeof item.level === 'number' ? item.level : 1);

            graphNodes.push({
              id: nodeId,
              label: item.node.properties.name || item.node.properties.label || 'Unknown',
              nodeType: item.node.labels ? item.node.labels[0] : 'Unknown',
              level: level,
              properties: JSON.stringify(item.node.properties),
            });
            nodeIds.add(nodeId);
          }
        }
      });

      // Process edges
      const edgesList = record.get('edges') || [];
      edgesList.forEach(item => {
        if (item.rel) {
          const edgeId = item.rel.identity.toString();
          if (!edgeIds.has(edgeId)) {
            graphEdges.push({
              id: edgeId,
              source: item.start.identity.toString(),
              target: item.end.identity.toString(),
              label: item.rel.type,
              relationshipType: item.rel.type,
            });
            edgeIds.add(edgeId);
          }
        }
      });

      return { nodes: graphNodes, edges: graphEdges };
    } finally {
      await session.close();
    }
  },

  // Custom Cypher query for graph visualization
  customCypherGraph: async ({ cypherQuery }) => {
    const session = neo4jDriver.session();
    try {
      // Execute the custom Cypher query
      const result = await session.run(cypherQuery);

      const nodes = [];
      const edges = [];
      const nodeIds = new Set();
      const edgeIds = new Set();

      // Process all records
      result.records.forEach(record => {
        // Extract all nodes and relationships from the record
        record.keys.forEach(key => {
          const value = record.get(key);

          // Handle Node objects
          if (value && value.labels && value.identity) {
            const nodeId = value.identity.toString();
            if (!nodeIds.has(nodeId)) {
              nodes.push({
                id: nodeId,
                label: value.properties.name || value.properties.label || `Node ${nodeId}`,
                nodeType: value.labels[0] || 'Unknown',
                level: 0, // Custom queries don't have hierarchy by default
                properties: JSON.stringify(value.properties),
              });
              nodeIds.add(nodeId);
            }
          }

          // Handle Relationship objects
          if (value && value.type && value.start && value.end) {
            const edgeId = value.identity.toString();
            if (!edgeIds.has(edgeId)) {
              edges.push({
                id: edgeId,
                source: value.start.toString(),
                target: value.end.toString(),
                label: value.type,
                relationshipType: value.type,
              });
              edgeIds.add(edgeId);
            }
          }

          // Handle Path objects
          if (value && value.segments) {
            value.segments.forEach(segment => {
              // Add start node
              const startId = segment.start.identity.toString();
              if (!nodeIds.has(startId)) {
                nodes.push({
                  id: startId,
                  label: segment.start.properties.name || segment.start.properties.label || `Node ${startId}`,
                  nodeType: segment.start.labels[0] || 'Unknown',
                  level: 0,
                  properties: JSON.stringify(segment.start.properties),
                });
                nodeIds.add(startId);
              }

              // Add end node
              const endId = segment.end.identity.toString();
              if (!nodeIds.has(endId)) {
                nodes.push({
                  id: endId,
                  label: segment.end.properties.name || segment.end.properties.label || `Node ${endId}`,
                  nodeType: segment.end.labels[0] || 'Unknown',
                  level: 0,
                  properties: JSON.stringify(segment.end.properties),
                });
                nodeIds.add(endId);
              }

              // Add relationship
              const relId = segment.relationship.identity.toString();
              if (!edgeIds.has(relId)) {
                edges.push({
                  id: relId,
                  source: segment.relationship.start.toString(),
                  target: segment.relationship.end.toString(),
                  label: segment.relationship.type,
                  relationshipType: segment.relationship.type,
                });
                edgeIds.add(relId);
              }
            });
          }

          // Handle arrays
          if (Array.isArray(value)) {
            value.forEach(item => {
              // Handle nodes in arrays
              if (item && item.labels && item.identity) {
                const nodeId = item.identity.toString();
                if (!nodeIds.has(nodeId)) {
                  nodes.push({
                    id: nodeId,
                    label: item.properties.name || item.properties.label || `Node ${nodeId}`,
                    nodeType: item.labels[0] || 'Unknown',
                    level: 0,
                    properties: JSON.stringify(item.properties),
                  });
                  nodeIds.add(nodeId);
                }
              }

              // Handle relationships in arrays
              if (item && item.type && item.start && item.end) {
                const edgeId = item.identity.toString();
                if (!edgeIds.has(edgeId)) {
                  edges.push({
                    id: edgeId,
                    source: item.start.toString(),
                    target: item.end.toString(),
                    label: item.type,
                    relationshipType: item.type,
                  });
                  edgeIds.add(edgeId);
                }
              }
            });
          }
        });
      });

      return { nodes, edges };
    } catch (error) {
      // Return error information in a user-friendly way
      throw new Error(`Cypher query error: ${error.message}`);
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
