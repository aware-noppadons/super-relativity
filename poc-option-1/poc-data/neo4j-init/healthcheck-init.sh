#!/bin/bash
# Healthcheck script that auto-initializes Neo4j if empty
# Can be called from other services or as a periodic healthcheck

set -e

NEO4J_URI="${NEO4J_URI:-bolt://neo4j:7687}"
NEO4J_USER="${NEO4J_USER:-neo4j}"
NEO4J_PASSWORD="${NEO4J_PASSWORD:-super-relativity-2025}"

echo "[Neo4j Healthcheck] Checking database status..."

# Function to run cypher query
run_cypher() {
  cypher-shell -a "$NEO4J_URI" -u "$NEO4J_USER" -p "$NEO4J_PASSWORD" "$1" 2>/dev/null
}

# Wait for Neo4j to be available (with timeout)
MAX_ATTEMPTS=30
ATTEMPT=0

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
  if run_cypher "RETURN 1" > /dev/null 2>&1; then
    echo "[Neo4j Healthcheck] ✓ Neo4j is available"
    break
  fi

  ATTEMPT=$((ATTEMPT + 1))
  if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
    echo "[Neo4j Healthcheck] ✗ Neo4j is not available after $MAX_ATTEMPTS attempts"
    exit 1
  fi

  echo "[Neo4j Healthcheck] Waiting for Neo4j... (attempt $ATTEMPT/$MAX_ATTEMPTS)"
  sleep 2
done

# Check if database is initialized
NODE_COUNT=$(run_cypher "MATCH (n) RETURN count(n) as count" | tail -n 1 | tr -d '"' | xargs)

if [ -z "$NODE_COUNT" ]; then
  echo "[Neo4j Healthcheck] ✗ Failed to query database"
  exit 1
fi

if [ "$NODE_COUNT" -gt 0 ]; then
  echo "[Neo4j Healthcheck] ✓ Database is initialized with $NODE_COUNT nodes"
  exit 0
fi

# Database is empty - run initialization
echo "[Neo4j Healthcheck] ⚠ Database is empty. Running initialization..."

SCRIPT_DIR="$(dirname "$0")"
if [ -f "$SCRIPT_DIR/init-db.sh" ]; then
  bash "$SCRIPT_DIR/init-db.sh"
  echo "[Neo4j Healthcheck] ✓ Database initialization complete"
else
  echo "[Neo4j Healthcheck] ⚠ init-db.sh not found. Skipping auto-initialization."
  echo "[Neo4j Healthcheck] Run manually: docker exec super-relativity-neo4j-init /init-db.sh"
  exit 1
fi
