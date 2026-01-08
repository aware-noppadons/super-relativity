#!/usr/bin/env node
/**
 * Approach 2: Line-by-Line Execution
 *
 * Pros:
 * - Better error handling - can pinpoint which statement failed
 * - Can log progress for each statement
 * - Platform-independent (pure JavaScript)
 * - Can add custom logic between statements
 *
 * Cons:
 * - Requires parsing Cypher syntax (comments, multi-line statements)
 * - More complex code
 * - May have issues with certain Cypher constructs
 * - Slower due to multiple round trips
 */

const neo4j = require('neo4j-driver');
const fs = require('fs');
const path = require('path');

const NEO4J_URI = process.env.NEO4J_URI || 'bolt://localhost:7687';
const NEO4J_USER = process.env.NEO4J_USER || 'neo4j';
const NEO4J_PASSWORD = process.env.NEO4J_PASSWORD || 'super-relativity-2025';

console.log('=========================================');
console.log('Approach 2: Line-by-Line Execution');
console.log('=========================================\n');

// Create driver
const driver = neo4j.driver(
  NEO4J_URI,
  neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD)
);

/**
 * Parse Cypher script into individual statements
 * Handles:
 * - Single-line comments (//)
 * - Multi-line statements
 * - Empty lines
 */
function parseCypherStatements(scriptContent) {
  const lines = scriptContent.split('\n');
  const statements = [];
  let currentStatement = '';
  let inComment = false;

  for (let line of lines) {
    // Trim whitespace
    line = line.trim();

    // Skip empty lines
    if (line.length === 0) {
      continue;
    }

    // Skip single-line comments
    if (line.startsWith('//')) {
      continue;
    }

    // Add line to current statement
    currentStatement += line + ' ';

    // Check if statement is complete (ends with semicolon)
    if (line.endsWith(';')) {
      // Remove trailing semicolon and whitespace
      const statement = currentStatement.trim().slice(0, -1);
      if (statement.length > 0) {
        statements.push(statement);
      }
      currentStatement = '';
    }
  }

  // Add any remaining statement (no semicolon at end)
  if (currentStatement.trim().length > 0) {
    statements.push(currentStatement.trim());
  }

  return statements;
}

async function runDemo() {
  const session = driver.session();

  try {
    // Test connection
    console.log('Testing Neo4j connection...');
    await session.run('RETURN 1 as test');
    console.log('✓ Connection successful\n');

    // Get current node count
    console.log('Checking current database state...');
    const result = await session.run('MATCH (n) RETURN count(n) as count');
    const nodeCount = result.records[0].get('count').toNumber();
    console.log(`Current node count: ${nodeCount}\n`);

    // Create a test script
    const testScript = `
// Test script for Approach 2
// This demonstrates line-by-line execution

// Query 1: Get node types
MATCH (n)
RETURN labels(n)[0] as nodeType, count(*) as count
ORDER BY count DESC
LIMIT 5;

// Query 2: Get relationship types
MATCH ()-[r]->()
RETURN type(r) as relType, count(*) as count
ORDER BY count DESC
LIMIT 5;

// Query 3: Check BusinessFunction nodes
MATCH (bf:BusinessFunction)
RETURN count(bf) as businessFunctionCount;
`;

    console.log('Parsing Cypher script...');
    const statements = parseCypherStatements(testScript);
    console.log(`Found ${statements.length} statements to execute\n`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`\nExecuting statement ${i + 1}/${statements.length}:`);
      console.log(`  ${statement.substring(0, 60)}${statement.length > 60 ? '...' : ''}`);

      try {
        const result = await session.run(statement);
        console.log(`  ✓ Success: ${result.records.length} records returned`);

        // Show first few results
        if (result.records.length > 0 && result.records.length <= 5) {
          result.records.forEach((record, idx) => {
            const obj = record.toObject();
            console.log(`    [${idx + 1}]`, JSON.stringify(obj));
          });
        }
      } catch (error) {
        console.error(`  ✗ Failed: ${error.message}`);
        // Could choose to continue or abort here
        throw error;
      }
    }

    console.log('\n✓ All statements executed successfully');

  } catch (error) {
    console.error('\n✗ Error during execution:', error.message);
    throw error;
  } finally {
    await session.close();
  }
}

// Run demo
runDemo()
  .then(() => {
    console.log('\n=========================================');
    console.log('Approach 2 Demo Complete');
    console.log('=========================================');
    console.log('\nSummary:');
    console.log('- Method: Parse script and execute statements one by one');
    console.log('- Pros: Better error handling, progress logging, platform-independent');
    console.log('- Cons: More complex, requires parsing, slower');
    console.log('- Use case: Best when you need detailed control and error reporting');
  })
  .catch((error) => {
    console.error('Demo failed:', error);
    process.exit(1);
  })
  .finally(() => {
    driver.close();
  });
