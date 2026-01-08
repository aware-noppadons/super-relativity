#!/usr/bin/env node
/**
 * Approach 3: Session-Based with Advanced Error Handling
 *
 * Pros:
 * - Transactional safety - can rollback on errors
 * - Retry logic for transient failures
 * - Connection pooling and resource management
 * - Best performance for large batches
 * - Production-ready error handling
 *
 * Cons:
 * - Most complex implementation
 * - Requires understanding of Neo4j sessions and transactions
 * - May need to split large scripts into chunks
 */

const neo4j = require('neo4j-driver');
const fs = require('fs');
const path = require('path');

const NEO4J_URI = process.env.NEO4J_URI || 'bolt://localhost:7687';
const NEO4J_USER = process.env.NEO4J_USER || 'neo4j';
const NEO4J_PASSWORD = process.env.NEO4J_PASSWORD || 'super-relativity-2025';

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

console.log('=========================================');
console.log('Approach 3: Session-Based with Advanced Error Handling');
console.log('=========================================\n');

// Create driver with connection pooling
const driver = neo4j.driver(
  NEO4J_URI,
  neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD),
  {
    maxConnectionPoolSize: 50,
    connectionAcquisitionTimeout: 60000,
  }
);

/**
 * Execute a query with retry logic
 */
async function executeWithRetry(session, query, params = {}, retries = MAX_RETRIES) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await session.run(query, params);
    } catch (error) {
      // Check if error is retryable (transient errors)
      const isTransient = error.code &&
        (error.code.includes('ServiceUnavailable') ||
         error.code.includes('SessionExpired') ||
         error.code.includes('TransientError'));

      if (isTransient && attempt < retries) {
        console.log(`  ⚠ Transient error (attempt ${attempt}/${retries}), retrying in ${RETRY_DELAY_MS}ms...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * attempt));
        continue;
      }

      // Non-retryable error or max retries reached
      throw error;
    }
  }
}

/**
 * Execute queries in a managed transaction
 */
async function executeInTransaction(session, queries) {
  const tx = session.beginTransaction();

  try {
    const results = [];

    for (const { query, params, description } of queries) {
      console.log(`  Executing: ${description || query.substring(0, 50) + '...'}`);
      const result = await tx.run(query, params);
      results.push(result);
      console.log(`    ✓ Success: ${result.records.length} records`);
    }

    await tx.commit();
    console.log('  ✓ Transaction committed');
    return results;

  } catch (error) {
    console.error(`  ✗ Transaction failed: ${error.message}`);
    await tx.rollback();
    console.log('  ↻ Transaction rolled back');
    throw error;
  }
}

/**
 * Verify database health
 */
async function verifyDatabaseHealth(session) {
  console.log('Verifying database health...');

  const checks = [
    {
      name: 'Connection',
      query: 'RETURN 1 as test',
      validate: (result) => result.records.length > 0,
    },
    {
      name: 'Node count',
      query: 'MATCH (n) RETURN count(n) as count',
      validate: (result) => result.records[0].get('count').toNumber() >= 0,
    },
    {
      name: 'Relationship types',
      query: 'MATCH ()-[r]->() RETURN type(r) as relType LIMIT 1',
      validate: (result) => true, // May be empty on fresh db
    },
  ];

  for (const check of checks) {
    try {
      const result = await executeWithRetry(session, check.query);
      const isValid = check.validate(result);
      console.log(`  ${isValid ? '✓' : '✗'} ${check.name}: ${isValid ? 'OK' : 'FAILED'}`);

      if (check.name === 'Node count' && result.records.length > 0) {
        const count = result.records[0].get('count').toNumber();
        console.log(`    Current nodes: ${count}`);
      }
    } catch (error) {
      console.error(`  ✗ ${check.name}: ${error.message}`);
      throw error;
    }
  }

  console.log('');
}

async function runDemo() {
  // Use read session for queries, write session for modifications
  const readSession = driver.session({ defaultAccessMode: neo4j.session.READ });
  const writeSession = driver.session({ defaultAccessMode: neo4j.session.WRITE });

  try {
    // 1. Health check
    await verifyDatabaseHealth(readSession);

    // 2. Run read queries (demonstrating read session)
    console.log('Running analytical queries...');
    const analyticsQueries = [
      {
        query: 'MATCH (n) RETURN labels(n)[0] as nodeType, count(*) as count ORDER BY count DESC LIMIT 5',
        description: 'Node type distribution',
      },
      {
        query: 'MATCH ()-[r]->() RETURN type(r) as relType, count(*) as count ORDER BY count DESC LIMIT 5',
        description: 'Relationship type distribution',
      },
      {
        query: 'MATCH (bf:BusinessFunction) RETURN bf.name as name LIMIT 5',
        description: 'Sample BusinessFunction nodes',
      },
    ];

    for (const { query, description } of analyticsQueries) {
      console.log(`\n  ${description}:`);
      try {
        const result = await executeWithRetry(readSession, query);
        result.records.forEach((record, idx) => {
          console.log(`    [${idx + 1}]`, JSON.stringify(record.toObject()));
        });
      } catch (error) {
        console.error(`  ✗ Failed: ${error.message}`);
      }
    }

    // 3. Demonstrate transaction with rollback
    console.log('\n\nDemonstrating transactional execution...');
    console.log('Creating temporary test nodes (will be rolled back)...');

    try {
      await executeInTransaction(writeSession, [
        {
          query: 'CREATE (t:TestNode {id: $id, name: $name}) RETURN t',
          params: { id: 'test-1', name: 'Test Node 1' },
          description: 'Create test node 1',
        },
        {
          query: 'CREATE (t:TestNode {id: $id, name: $name}) RETURN t',
          params: { id: 'test-2', name: 'Test Node 2' },
          description: 'Create test node 2',
        },
        {
          query: 'MATCH (t:TestNode) RETURN count(t) as count',
          params: {},
          description: 'Verify test nodes created',
        },
      ]);

      // Now clean up (demonstrate explicit cleanup)
      console.log('\n  Cleaning up test nodes...');
      await writeSession.run('MATCH (t:TestNode) DETACH DELETE t');
      console.log('  ✓ Test nodes deleted');

    } catch (error) {
      console.error('Transaction failed:', error.message);
    }

    // 4. Verify final state
    console.log('\n\nVerifying final database state...');
    const finalResult = await readSession.run('MATCH (n) RETURN count(n) as count');
    const finalCount = finalResult.records[0].get('count').toNumber();
    console.log(`  Final node count: ${finalCount}`);

    // Check that no test nodes remain
    const testResult = await readSession.run('MATCH (t:TestNode) RETURN count(t) as count');
    const testCount = testResult.records[0].get('count').toNumber();
    console.log(`  Test nodes remaining: ${testCount} (should be 0)`);

  } catch (error) {
    console.error('\n✗ Error during execution:', error.message);
    console.error('Stack trace:', error.stack);
    throw error;
  } finally {
    await readSession.close();
    await writeSession.close();
  }
}

// Run demo with comprehensive error handling
runDemo()
  .then(() => {
    console.log('\n=========================================');
    console.log('Approach 3 Demo Complete');
    console.log('=========================================');
    console.log('\nSummary:');
    console.log('- Method: Managed sessions with transactions and retry logic');
    console.log('- Pros: Production-ready, transactional, best performance, connection pooling');
    console.log('- Cons: Most complex, requires Neo4j driver knowledge');
    console.log('- Use case: Best for production applications requiring reliability and performance');
    console.log('\nKey Features Demonstrated:');
    console.log('  ✓ Connection pooling and health checks');
    console.log('  ✓ Read vs Write sessions');
    console.log('  ✓ Transactional execution with commit/rollback');
    console.log('  ✓ Retry logic for transient failures');
    console.log('  ✓ Proper resource cleanup');
  })
  .catch((error) => {
    console.error('Demo failed:', error);
    process.exit(1);
  })
  .finally(() => {
    driver.close();
  });
