const express = require('express');
const neo4j = require('neo4j-driver');
const { Pool } = require('pg');
const redis = require('redis');
const axios = require('axios');
const cron = require('node-cron');

const app = express();
const PORT = process.env.PORT || 3001;

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

// LeanIX API configuration
const LEANIX_API_URL = process.env.LEANIX_API_URL || 'http://mock-leanix:8080';
const SYNC_INTERVAL_MINUTES = parseInt(process.env.SYNC_INTERVAL_MINUTES || '5');

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'sync-service' });
});

// Sync status endpoint
app.get('/api/sync/status', async (req, res) => {
  try {
    const result = await pgPool.query(
      'SELECT * FROM sync_jobs ORDER BY started_at DESC LIMIT 10'
    );
    res.json({ jobs: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Manual trigger sync
app.post('/api/sync/trigger', async (req, res) => {
  try {
    await performSync();
    res.json({ message: 'Sync triggered successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Parse node type from ID prefix
function parseNodeType(id) {
  const prefix = id.split('-')[0];
  const typeMap = {
    'APP': 'Application',
    'API': 'API',
    'CAP': 'BusinessFunction',
    'COMP': 'Component',
    'DATA': 'DataObject',
    'TBL': 'Table',
    'SRV': 'Server',
    'ACH': 'AppChange',
    'ICH': 'InfraChange'
  };
  return typeMap[prefix] || 'Unknown';
}

// Validate relationship against Master Patterns and return specific relationship type
// Reference: MASTER-PATTERNS.md v2.0
function validateAndMapRelationship(rel) {
  const relType = rel.type.toLowerCase();
  const fromType = rel.fromType || parseNodeType(rel.from);
  const toType = rel.toType || parseNodeType(rel.to);

  // Helper to infer data access pattern from relationship type
  const inferRW = (relTypeStr) => {
    if (relTypeStr.includes('read') && !relTypeStr.includes('write')) return 'reads';
    if (relTypeStr.includes('write') && !relTypeStr.includes('read')) return 'writes';
    return 'read-n-writes'; // Default
  };

  // Helper to infer mode from relationship type
  const inferMode = (relTypeStr) => {
    if (relTypeStr.includes('push') || relTypeStr.includes('send') || relTypeStr.includes('publish')) return 'pushes';
    if (relTypeStr.includes('pull') || relTypeStr.includes('fetch') || relTypeStr.includes('subscribe')) return 'pulls';
    return 'pulls'; // Default for API calls
  };

  // Pattern 1: Application → Application (RELATES)
  if (fromType === 'Application' && toType === 'Application') {
    if (relType.includes('integrat') || relType.includes('connect') || relType.includes('link')) {
      return {
        isAllowed: true,
        relationshipType: 'RELATES',
        properties: { description: `${rel.from} relates to ${rel.to}` }
      };
    }
  }

  // Pattern 1: Application → API (CALLS)
  if (fromType === 'Application' && toType === 'API') {
    if (relType.includes('call') || relType.includes('use') || relType.includes('consume')) {
      return {
        isAllowed: true,
        relationshipType: 'CALLS',
        properties: {
          mode: inferMode(relType),
          rw: inferRW(relType),
          description: `${rel.from} calls ${rel.to}`
        }
      };
    }
  }

  // Pattern 1: Application → BusinessFunction (OWNS)
  if (fromType === 'Application' && toType === 'BusinessFunction') {
    if (relType.includes('own') || relType.includes('support') || relType.includes('provide')) {
      return {
        isAllowed: true,
        relationshipType: 'OWNS',
        properties: { description: `${rel.from} owns ${rel.to}` }
      };
    }
  }

  // Pattern 1: Application → Component (OWNS)
  if (fromType === 'Application' && toType === 'Component') {
    if (relType.includes('own') || relType.includes('contain') || relType.includes('include')) {
      return {
        isAllowed: true,
        relationshipType: 'OWNS',
        properties: { description: `${rel.from} owns ${rel.to}` }
      };
    }
  }

  // Pattern 2: API → Component (EXPOSES)
  if (fromType === 'API' && toType === 'Component') {
    if (relType.includes('expose') || relType.includes('provide') || relType.includes('serve')) {
      return {
        isAllowed: true,
        relationshipType: 'EXPOSES',
        properties: { description: `${rel.from} exposes ${rel.to}` }
      };
    }
  }

  // Pattern 2: API → DataObject (WORKS_ON)
  if (fromType === 'API' && toType === 'DataObject') {
    if (relType.includes('work') || relType.includes('operate') || relType.includes('manipulate') ||
        relType.includes('use') || relType.includes('read') || relType.includes('write')) {
      return {
        isAllowed: true,
        relationshipType: 'WORKS_ON',
        properties: {
          rw: inferRW(relType),
          description: `${rel.from} works on ${rel.to}`
        }
      };
    }
  }

  // Pattern 2 (Bidirectional): Component → API (CALLS)
  if (fromType === 'Component' && toType === 'API') {
    if (relType.includes('call') || relType.includes('use') || relType.includes('consume')) {
      return {
        isAllowed: true,
        relationshipType: 'CALLS',
        properties: {
          mode: inferMode(relType),
          rw: inferRW(relType),
          description: `${rel.from} calls ${rel.to}`
        }
      };
    }
  }

  // Pattern 3: Component → BusinessFunction (IMPLEMENTS)
  if (fromType === 'Component' && toType === 'BusinessFunction') {
    if (relType.includes('implement') || relType.includes('realize') || relType.includes('execute')) {
      return {
        isAllowed: true,
        relationshipType: 'IMPLEMENTS',
        properties: { description: `${rel.from} implements ${rel.to}` }
      };
    }
  }

  // Pattern 4: BusinessFunction → API (INCLUDES)
  if (fromType === 'BusinessFunction' && toType === 'API') {
    if (relType.includes('include') || relType.includes('use') || relType.includes('leverage')) {
      return {
        isAllowed: true,
        relationshipType: 'INCLUDES',
        properties: { description: `${rel.from} includes ${rel.to}` }
      };
    }
  }

  // Pattern 5: AppChange → Component, BusinessFunction, DataObject (CHANGES)
  if (fromType === 'AppChange' && ['Component', 'BusinessFunction', 'DataObject'].includes(toType)) {
    return {
      isAllowed: true,
      relationshipType: 'CHANGES',
      properties: { description: `${rel.from} changes ${rel.to}` }
    };
  }

  // Pattern 6: Table → DataObject (MATERIALIZES)
  if (fromType === 'Table' && toType === 'DataObject') {
    if (relType.includes('materialize') || relType.includes('store') || relType.includes('persist')) {
      return {
        isAllowed: true,
        relationshipType: 'MATERIALIZES',
        properties: { description: `${rel.from} materializes ${rel.to}` }
      };
    }
  }

  // Pattern 7: Component → Server (INSTALLED_ON)
  if (fromType === 'Component' && toType === 'Server') {
    if (relType.includes('install') || relType.includes('deploy') || relType.includes('host') || relType.includes('run')) {
      return {
        isAllowed: true,
        relationshipType: 'INSTALLED_ON',
        properties: { description: `${rel.from} installed on ${rel.to}` }
      };
    }
  }

  // Pattern 8: InfraChange → Server (CHANGES)
  if (fromType === 'InfraChange' && toType === 'Server') {
    return {
      isAllowed: true,
      relationshipType: 'CHANGES',
      properties: { description: `${rel.from} changes ${rel.to}` }
    };
  }

  // Pattern 9: Component → Component (RELATES or CONTAINS)
  if (fromType === 'Component' && toType === 'Component') {
    if (relType.includes('contain') || relType.includes('include')) {
      return {
        isAllowed: true,
        relationshipType: 'CONTAINS',
        properties: { description: `${rel.from} contains ${rel.to}` }
      };
    }
    // Default to RELATES for Component→Component (uses, depends, etc.)
    return {
      isAllowed: true,
      relationshipType: 'RELATES',
      properties: { description: `${rel.from} relates to ${rel.to}` }
    };
  }

  // Pattern 10: Component → DataObject (WORKS_ON)
  if (fromType === 'Component' && toType === 'DataObject') {
    if (relType.includes('use') || relType.includes('read') || relType.includes('write') ||
        relType.includes('modify') || relType.includes('inquire') || relType.includes('access') ||
        relType.includes('work')) {
      return {
        isAllowed: true,
        relationshipType: 'WORKS_ON',
        properties: {
          rw: inferRW(relType),
          description: `${rel.from} works on ${rel.to}`
        }
      };
    }
  }

  // Pattern 10: BusinessFunction → DataObject (WORKS_ON)
  if (fromType === 'BusinessFunction' && toType === 'DataObject') {
    if (relType.includes('use') || relType.includes('manage') || relType.includes('read') ||
        relType.includes('write') || relType.includes('access') || relType.includes('work')) {
      return {
        isAllowed: true,
        relationshipType: 'WORKS_ON',
        properties: {
          rw: inferRW(relType),
          description: `${rel.from} works on ${rel.to}`
        }
      };
    }
  }

  // Pattern 11: BusinessFunction → BusinessFunction (RELATES)
  if (fromType === 'BusinessFunction' && toType === 'BusinessFunction') {
    return {
      isAllowed: true,
      relationshipType: 'RELATES',
      properties: {
        mode: inferMode(relType),
        description: `${rel.from} relates to ${rel.to}`
      }
    };
  }

  // WHITELIST APPROACH: Disallow all other relationship patterns
  console.warn(`Disallowed pattern: ${fromType} → ${toType} (${relType})`);
  return { isAllowed: false, relationshipType: null, properties: {} };
}

// Main sync function
async function performSync() {
  const jobId = `sync-${Date.now()}`;
  const startTime = new Date();

  console.log(`[${jobId}] Starting sync at ${startTime.toISOString()}`);

  try {
    // Record sync job start
    await pgPool.query(
      'INSERT INTO sync_jobs (job_id, status, started_at) VALUES ($1, $2, $3)',
      [jobId, 'running', startTime]
    );

    // Fetch data from LeanIX mock API
    console.log(`[${jobId}] Fetching data from LeanIX...`);
    const session = neo4jDriver.session();
    let totalEntities = 0;

    try {
      // 1. Sync Business Functions
      console.log(`[${jobId}] Syncing business functions...`);
      const { data: capabilitiesData } = await axios.get(`${LEANIX_API_URL}/capabilities`);
      for (const cap of capabilitiesData.data || []) {
        await session.run(
          `
          MERGE (c:BusinessFunction {id: $id})
          SET c.name = $name,
              c.level = $level,
              c.description = $description,
              c.owner = $owner,
              c.criticality = $criticality,
              c.maturity = $maturity,
              c.application = $application,
              c.lastSyncedAt = datetime()
          `,
          {
            id: cap.id,
            name: cap.name,
            level: cap.level || 'L1',
            description: cap.description || '',
            owner: cap.owner || '',
            criticality: cap.criticality || 'Medium',
            maturity: cap.maturity || 'Defined',
            application: cap.application || '',
          }
        );
      }
      console.log(`[${jobId}] Synced ${capabilitiesData.data?.length || 0} business functions`);
      totalEntities += capabilitiesData.data?.length || 0;

      // 2. Sync Requirements - REMOVED
      // Requirement nodes are not part of the simplified schema.
      // See schema definition: only Application, API, BusinessFunction,
      // Component, DataObject, Table, Server, AppChange, InfraChange are allowed.
      console.log(`[${jobId}] Skipping requirements (not in simplified schema)`);

      // 3. Sync Applications
      console.log(`[${jobId}] Syncing applications...`);
      const { data: leanixData } = await axios.get(`${LEANIX_API_URL}/applications`);
      for (const app of leanixData.data || []) {
        await session.run(
          `
          MERGE (a:Application {id: $id})
          SET a.name = $name,
              a.description = $description,
              a.status = $status,
              a.businessCriticality = $businessCriticality,
              a.type = $type,
              a.lifecycle = $lifecycle,
              a.techStack = $techStack,
              a.lastSyncedAt = datetime()
          `,
          {
            id: app.id,
            name: app.name,
            description: app.description || '',
            status: app.status || 'ACTIVE',
            businessCriticality: app.businessCriticality || 'MEDIUM',
            type: app.type || 'Application',
            lifecycle: app.lifecycle || 'Active',
            techStack: app.techStack || [],
          }
        );
      }
      console.log(`[${jobId}] Synced ${leanixData.data?.length || 0} applications`);
      totalEntities += leanixData.data?.length || 0;

      // 4. Sync Data Objects
      console.log(`[${jobId}] Syncing data objects...`);
      const { data: dataObjectsData } = await axios.get(`${LEANIX_API_URL}/data-objects`);
      for (const data of dataObjectsData.data || []) {
        await session.run(
          `
          MERGE (d:DataObject {id: $id})
          SET d.name = $name,
              d.type = $type,
              d.database = $database,
              d.schema = $schema,
              d.sensitivity = $sensitivity,
              d.columns = $columns,
              d.recordCount = $recordCount,
              d.growthRate = $growthRate,
              d.application = $application,
              d.lastSyncedAt = datetime()
          `,
          {
            id: data.id,
            name: data.name,
            type: data.type || 'Database Table',
            database: data.database || '',
            schema: data.schema || '',
            sensitivity: data.sensitivity || 'Standard',
            columns: data.columns || [],
            recordCount: data.recordCount || 0,
            growthRate: data.growthRate || '',
            application: data.application || '',
          }
        );
      }
      console.log(`[${jobId}] Synced ${dataObjectsData.data?.length || 0} data objects`);
      totalEntities += dataObjectsData.data?.length || 0;

      // 5. Sync Components
      console.log(`[${jobId}] Syncing components...`);
      const { data: componentsData } = await axios.get(`${LEANIX_API_URL}/components`);
      for (const comp of componentsData.data || []) {
        await session.run(
          `
          MERGE (c:Component {id: $id})
          SET c.name = $name,
              c.application = $application,
              c.type = $type,
              c.technology = $technology,
              c.description = $description,
              c.responsibilities = $responsibilities,
              c.lastSyncedAt = datetime()
          `,
          {
            id: comp.id,
            name: comp.name,
            application: comp.application || '',
            type: comp.type || 'Component',
            technology: comp.technology || '',
            description: comp.description || '',
            responsibilities: comp.responsibilities || [],
          }
        );
      }
      console.log(`[${jobId}] Synced ${componentsData.data?.length || 0} components`);
      totalEntities += componentsData.data?.length || 0;

      // 6. Sync Servers
      console.log(`[${jobId}] Syncing servers...`);
      const { data: serversData } = await axios.get(`${LEANIX_API_URL}/servers`);
      for (const srv of serversData.data || []) {
        await session.run(
          `
          MERGE (s:Server {id: $id})
          SET s.name = $name,
              s.hostname = $hostname,
              s.ip = $ip,
              s.environment = $environment,
              s.os = $os,
              s.region = $region,
              s.datacenter = $datacenter,
              s.cpu = $cpu,
              s.memory = $memory,
              s.status = $status,
              s.purpose = $purpose,
              s.lastSyncedAt = datetime()
          `,
          {
            id: srv.id,
            name: srv.name,
            hostname: srv.hostname || '',
            ip: srv.ip || '',
            environment: srv.environment || 'unknown',
            os: srv.os || '',
            region: srv.region || '',
            datacenter: srv.datacenter || '',
            cpu: srv.cpu || '',
            memory: srv.memory || '',
            status: srv.status || 'unknown',
            purpose: srv.purpose || '',
          }
        );
      }
      console.log(`[${jobId}] Synced ${serversData.data?.length || 0} servers`);
      totalEntities += serversData.data?.length || 0;

      // 6. Sync Application Changes
      console.log(`[${jobId}] Syncing application changes...`);
      const { data: appChangesData } = await axios.get(`${LEANIX_API_URL}/app-changes`);
      for (const change of appChangesData.data || []) {
        await session.run(
          `
          MERGE (ac:AppChange {id: $id})
          SET ac.name = $name,
              ac.changeType = $changeType,
              ac.status = $status,
              ac.priority = $priority,
              ac.plannedDate = $plannedDate,
              ac.implementedDate = $implementedDate,
              ac.description = $description,
              ac.impactLevel = $impactLevel,
              ac.riskLevel = $riskLevel,
              ac.syncedAt = datetime()
          `,
          {
            id: change.id,
            name: change.name,
            changeType: change.changeType,
            status: change.status,
            priority: change.priority,
            plannedDate: change.plannedDate,
            implementedDate: change.implementedDate,
            description: change.description,
            impactLevel: change.impactLevel,
            riskLevel: change.riskLevel,
          }
        );
      }
      console.log(`[${jobId}] Synced ${appChangesData.data?.length || 0} application changes`);
      totalEntities += appChangesData.data?.length || 0;

      // 7. Sync Infrastructure Changes
      console.log(`[${jobId}] Syncing infrastructure changes...`);
      const { data: infraChangesData } = await axios.get(`${LEANIX_API_URL}/infra-changes`);
      for (const change of infraChangesData.data || []) {
        await session.run(
          `
          MERGE (ic:InfraChange {id: $id})
          SET ic.name = $name,
              ic.changeType = $changeType,
              ic.status = $status,
              ic.priority = $priority,
              ic.plannedDate = $plannedDate,
              ic.implementedDate = $implementedDate,
              ic.description = $description,
              ic.impactLevel = $impactLevel,
              ic.riskLevel = $riskLevel,
              ic.downtime = $downtime,
              ic.rollbackPlan = $rollbackPlan,
              ic.syncedAt = datetime()
          `,
          {
            id: change.id,
            name: change.name,
            changeType: change.changeType,
            status: change.status,
            priority: change.priority,
            plannedDate: change.plannedDate,
            implementedDate: change.implementedDate,
            description: change.description,
            impactLevel: change.impactLevel,
            riskLevel: change.riskLevel,
            downtime: change.downtime,
            rollbackPlan: change.rollbackPlan,
          }
        );
      }
      console.log(`[${jobId}] Synced ${infraChangesData.data?.length || 0} infrastructure changes`);
      totalEntities += infraChangesData.data?.length || 0;

      // Fetch and sync relationships following the 11 patterns
      console.log(`[${jobId}] Fetching relationships from LeanIX...`);
      const { data: relationshipsData } = await axios.get(`${LEANIX_API_URL}/relationships`);

      let relationshipsSynced = 0;
      let relationshipsSkipped = 0;

      for (const rel of relationshipsData.data || []) {
        try {
          // Validate against Master Patterns and get specific relationship type
          const { isAllowed, relationshipType, properties } = validateAndMapRelationship(rel);

          if (!isAllowed) {
            relationshipsSkipped++;
            console.warn(`[${jobId}] Skipping disallowed relationship: ${rel.from} -[${rel.type}]-> ${rel.to}`);
            continue;
          }

          // Build property SET clause dynamically
          const propKeys = Object.keys(properties);
          const propSetClauses = propKeys.map(key => `r.${key} = $${key}`).join(', ');
          const cypherQuery = `
            MATCH (from {id: $fromId})
            MATCH (to {id: $toId})
            MERGE (from)-[r:${relationshipType}]->(to)
            ${propSetClauses ? `SET ${propSetClauses},` : 'SET'} r.syncedAt = datetime()
          `;

          // Build parameters object
          const params = {
            fromId: rel.from,
            toId: rel.to,
            ...properties
          };

          await session.run(cypherQuery, params);
          relationshipsSynced++;
          console.log(`[${jobId}] Created ${relationshipType}: ${rel.from} → ${rel.to}`);
        } catch (error) {
          console.warn(`[${jobId}] Failed to create relationship ${rel.from} -[${rel.type}]-> ${rel.to}: ${error.message}`);
        }
      }

      console.log(`[${jobId}] Successfully synced ${relationshipsSynced} relationships to Neo4j (${relationshipsSkipped} skipped as disallowed)`);
    } finally {
      await session.close();
    }

    // Cache sync result in Redis
    await redisClient.set(
      'last-sync',
      JSON.stringify({
        jobId,
        timestamp: new Date().toISOString(),
        totalEntities,
      }),
      { EX: 3600 } // Expire after 1 hour
    );

    // Update sync job status
    await pgPool.query(
      'UPDATE sync_jobs SET status = $1, completed_at = $2, records_synced = $3 WHERE job_id = $4',
      ['completed', new Date(), totalEntities, jobId]
    );

    console.log(`[${jobId}] Sync completed successfully - ${totalEntities} entities synced`);
  } catch (error) {
    console.error(`[${jobId}] Sync failed:`, error.message);

    // Update sync job with error
    await pgPool.query(
      'UPDATE sync_jobs SET status = $1, completed_at = $2, error_message = $3 WHERE job_id = $4',
      ['failed', new Date(), error.message, jobId]
    );

    throw error;
  }
}

// Initialize connections and start server
async function start() {
  try {
    // Test Neo4j connection
    await neo4jDriver.verifyConnectivity();
    console.log('✓ Connected to Neo4j');

    // Test PostgreSQL connection
    await pgPool.query('SELECT NOW()');
    console.log('✓ Connected to PostgreSQL');

    // Connect to Redis
    await redisClient.connect();
    console.log('✓ Connected to Redis');

    // Create sync_jobs table if not exists
    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS sync_jobs (
        id SERIAL PRIMARY KEY,
        job_id VARCHAR(100) UNIQUE NOT NULL,
        status VARCHAR(20) NOT NULL,
        started_at TIMESTAMP NOT NULL,
        completed_at TIMESTAMP,
        records_synced INTEGER,
        error_message TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✓ Database tables ready');

    // Schedule periodic sync
    cron.schedule(`*/${SYNC_INTERVAL_MINUTES} * * * *`, async () => {
      console.log('Running scheduled sync...');
      try {
        await performSync();
      } catch (error) {
        console.error('Scheduled sync failed:', error.message);
      }
    });
    console.log(`✓ Scheduled sync every ${SYNC_INTERVAL_MINUTES} minutes`);

    // Perform initial sync
    setTimeout(async () => {
      console.log('Performing initial sync...');
      try {
        await performSync();
      } catch (error) {
        console.error('Initial sync failed:', error.message);
      }
    }, 5000); // Wait 5 seconds after startup

    // Start Express server
    app.listen(PORT, () => {
      console.log(`✓ Sync service listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start sync service:', error);
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
