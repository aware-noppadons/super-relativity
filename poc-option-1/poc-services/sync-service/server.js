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
      // 1. Sync Business Capabilities
      console.log(`[${jobId}] Syncing business capabilities...`);
      const { data: capabilitiesData } = await axios.get(`${LEANIX_API_URL}/capabilities`);
      for (const cap of capabilitiesData.data || []) {
        await session.run(
          `
          MERGE (c:BusinessCapability {id: $id})
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
      console.log(`[${jobId}] Synced ${capabilitiesData.data?.length || 0} business capabilities`);
      totalEntities += capabilitiesData.data?.length || 0;

      // 2. Sync Requirements
      console.log(`[${jobId}] Syncing requirements...`);
      const { data: requirementsData } = await axios.get(`${LEANIX_API_URL}/requirements`);
      for (const req of requirementsData.data || []) {
        await session.run(
          `
          MERGE (r:Requirement {id: $id})
          SET r.name = $name,
              r.type = $type,
              r.priority = $priority,
              r.status = $status,
              r.owner = $owner,
              r.description = $description,
              r.createdDate = $createdDate,
              r.compliance = $compliance,
              r.lastSyncedAt = datetime()
          `,
          {
            id: req.id,
            name: req.name,
            type: req.type || 'Functional Requirement',
            priority: req.priority || 'Medium',
            status: req.status || 'Draft',
            owner: req.owner || '',
            description: req.description || '',
            createdDate: req.createdDate || '',
            compliance: req.compliance || [],
          }
        );

        // Link requirement to capability if exists
        if (req.capability) {
          await session.run(
            `
            MATCH (r:Requirement {id: $reqId})
            MATCH (c:BusinessCapability {id: $capId})
            MERGE (r)-[:SUPPORTS]->(c)
            `,
            { reqId: req.id, capId: req.capability }
          );
        }
      }
      console.log(`[${jobId}] Synced ${requirementsData.data?.length || 0} requirements`);
      totalEntities += requirementsData.data?.length || 0;

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

      // Fetch and sync relationships
      console.log(`[${jobId}] Fetching relationships from LeanIX...`);
      const { data: relationshipsData } = await axios.get(`${LEANIX_API_URL}/relationships`);

      let relationshipsSynced = 0;
      for (const rel of relationshipsData.data || []) {
        try {
          await session.run(
            `
            MATCH (from {id: $fromId})
            MATCH (to {id: $toId})
            MERGE (from)-[r:${rel.type.replace(/[^A-Z_]/g, '_')}]->(to)
            SET r.syncedAt = datetime()
            `,
            {
              fromId: rel.from,
              toId: rel.to,
            }
          );
          relationshipsSynced++;
        } catch (error) {
          console.warn(`[${jobId}] Failed to create relationship ${rel.from} -[${rel.type}]-> ${rel.to}: ${error.message}`);
        }
      }

      console.log(`[${jobId}] Successfully synced ${relationshipsSynced} relationships to Neo4j`);
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
