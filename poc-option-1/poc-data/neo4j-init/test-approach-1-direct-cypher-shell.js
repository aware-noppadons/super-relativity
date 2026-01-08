#!/usr/bin/env node
/**
 * Approach 1: Direct cypher-shell Execution
 *
 * Pros:
 * - Simple and straightforward
 * - Uses Neo4j's native CLI tool
 * - Handles multi-statement scripts automatically
 * - No need to parse Cypher syntax
 *
 * Cons:
 * - Requires cypher-shell to be installed
 * - Less control over error handling
 * - Harder to get detailed feedback on which statement failed
 * - Platform-dependent (shell command execution)
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const NEO4J_USER = process.env.NEO4J_USER || 'neo4j';
const NEO4J_PASSWORD = process.env.NEO4J_PASSWORD || 'super-relativity-2025';
const NEO4J_HOST = process.env.NEO4J_HOST || 'localhost';
const NEO4J_PORT = process.env.NEO4J_PORT || '7687';

console.log('=========================================');
console.log('Approach 1: Direct cypher-shell Execution');
console.log('=========================================\n');

// Test if we can connect
console.log('Testing Neo4j connection...');
try {
  execSync(
    `docker exec super-relativity-neo4j cypher-shell -u ${NEO4J_USER} -p ${NEO4J_PASSWORD} "RETURN 1 as test"`,
    { stdio: 'pipe' }
  );
  console.log('✓ Connection successful\n');
} catch (error) {
  console.error('✗ Connection failed:', error.message);
  process.exit(1);
}

// Get current node count
console.log('Checking current database state...');
try {
  const output = execSync(
    `docker exec super-relativity-neo4j cypher-shell -u ${NEO4J_USER} -p ${NEO4J_PASSWORD} --format plain "MATCH (n) RETURN count(n) as count"`,
    { encoding: 'utf-8' }
  );
  const nodeCount = output.trim().split('\n').pop().replace(/"/g, '');
  console.log(`Current node count: ${nodeCount}\n`);
} catch (error) {
  console.error('✗ Failed to query node count:', error.message);
}

// Run a simple test query
console.log('Running test query with cypher-shell...');
const testScript = path.join(__dirname, 'test-query.cypher');
fs.writeFileSync(testScript, `
// Test query for Approach 1
MATCH (n)
RETURN labels(n)[0] as nodeType, count(*) as count
ORDER BY count DESC
LIMIT 5;
`);

try {
  const output = execSync(
    `docker exec -i super-relativity-neo4j cypher-shell -u ${NEO4J_USER} -p ${NEO4J_PASSWORD} < ${testScript}`,
    { encoding: 'utf-8' }
  );
  console.log('✓ Query executed successfully\n');
  console.log('Results:');
  console.log(output);
} catch (error) {
  console.error('✗ Query failed:', error.message);
  if (error.stdout) console.log('stdout:', error.stdout);
  if (error.stderr) console.log('stderr:', error.stderr);
} finally {
  // Clean up test file
  fs.unlinkSync(testScript);
}

console.log('\n=========================================');
console.log('Approach 1 Demo Complete');
console.log('=========================================');
console.log('\nSummary:');
console.log('- Method: Execute .cypher files via cypher-shell');
console.log('- Pros: Simple, native tool, handles multi-statement scripts');
console.log('- Cons: Less control, platform-dependent');
console.log('- Use case: Best for Docker-based deployments with cypher-shell available');
