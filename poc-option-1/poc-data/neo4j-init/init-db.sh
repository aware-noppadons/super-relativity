#!/bin/bash
set -e

echo "========================================="
echo "Neo4j Database Initialization Script"
echo "========================================="

# Wait for Neo4j to be fully ready
echo "Waiting for Neo4j to be ready..."
until cypher-shell -u neo4j -p "$NEO4J_PASSWORD" "RETURN 1" > /dev/null 2>&1; do
  echo "  Neo4j is unavailable - sleeping"
  sleep 2
done

echo "✓ Neo4j is ready!"

# Check if database is already initialized
echo "Checking if database is already initialized..."
NODE_COUNT=$(cypher-shell -u neo4j -p "$NEO4J_PASSWORD" --format plain "MATCH (n) RETURN count(n) as count" | tail -n 1 | tr -d '"')

if [ "$NODE_COUNT" -gt 0 ]; then
  echo "✓ Database already initialized with $NODE_COUNT nodes. Skipping initialization."
  exit 0
fi

echo "Database is empty. Running initialization scripts..."

# Run initialization scripts in order
for script in /docker-entrypoint-initdb.d/*.cypher; do
  if [ -f "$script" ]; then
    echo "Running: $(basename $script)"
    cypher-shell -u neo4j -p "$NEO4J_PASSWORD" < "$script"
    echo "✓ Completed: $(basename $script)"
  fi
done

echo "========================================="
echo "✓ Database initialization complete!"
echo "========================================="

# Create marker file to indicate initialization is complete
touch /docker-entrypoint-initdb.d/.initialized
