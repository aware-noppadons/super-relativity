# Neo4j Database Initialization

This directory contains scripts and data for initializing the Neo4j graph database with the Super Relativity schema and sample data.

## Overview

Neo4j Community Edition does **not** automatically execute `.cypher` files from `/docker-entrypoint-initdb.d` on startup (this feature is Enterprise-only). Therefore, we provide **three methods** for database initialization:

1. **Automatic Initialization (Recommended)** - Using the `neo4j-init` container
2. **Healthcheck-based Initialization** - Auto-initialize on first health check
3. **Manual Initialization** - Run scripts manually when needed

---

## Method 1: Automatic Initialization (Recommended)

The `neo4j-init` service in `docker-compose.yml` automatically initializes the database when you start the stack.

### How It Works

1. The `neo4j-init` container waits for Neo4j to be healthy
2. Checks if the database is already initialized (by counting nodes)
3. If empty, runs all `.cypher` files in order
4. Creates a `.initialized` marker file
5. Exits (does not restart)

### Usage

Simply start the Docker Compose stack:

```bash
docker-compose up -d
```

The initialization happens automatically. You can watch the logs:

```bash
docker logs -f super-relativity-neo4j-init
```

### First-Time Setup

On a fresh system or after `docker-compose down -v`:

```bash
# Remove old volumes (WARNING: deletes all data)
docker-compose down -v

# Start with automatic initialization
docker-compose up -d

# Wait for initialization to complete
docker logs -f super-relativity-neo4j-init
```

### Verify Initialization

Check that data was loaded:

```bash
docker exec super-relativity-neo4j cypher-shell -u neo4j -p super-relativity-2025 \
  "MATCH (n) RETURN labels(n)[0] as nodeType, count(*) as count ORDER BY nodeType"
```

Expected output should show:
- Application: 3 nodes
- Container: 6 nodes
- Component: 20 nodes
- DataObject: 3 nodes
- And more...

---

## Method 2: Healthcheck-based Initialization

Use the `healthcheck-init.sh` script to check and initialize the database automatically.

### From the Host

```bash
# Run the healthcheck script
bash poc-data/neo4j-init/healthcheck-init.sh
```

### From a Container

You can add this to any service that depends on Neo4j:

```yaml
services:
  your-service:
    # ... other config ...
    entrypoint: ["/bin/bash", "-c"]
    command:
      - |
        /healthcheck-init.sh
        # Then run your actual service
        node server.js
    volumes:
      - ./poc-data/neo4j-init/healthcheck-init.sh:/healthcheck-init.sh:ro
```

### What It Does

1. Waits for Neo4j to be available (with timeout)
2. Checks if database has any nodes
3. If empty, runs `init-db.sh` automatically
4. Exits with success if initialized, error if failed

---

## Method 3: Manual Initialization

For complete control, run the initialization scripts manually.

### Option A: Using the Init Script

```bash
# Run the init script from the neo4j-init container
docker exec super-relativity-neo4j-init /init-db.sh
```

Or build and run the init container manually:

```bash
cd poc-data/neo4j-init
docker build -t neo4j-init .
docker run --rm --network super-relativity_super-relativity \
  -e NEO4J_PASSWORD=super-relativity-2025 \
  neo4j-init
```

### Option B: Run Cypher Files Directly

```bash
# From the host machine
docker exec super-relativity-neo4j cypher-shell \
  -u neo4j -p super-relativity-2025 \
  < poc-data/neo4j-init/01-create-schema.cypher

docker exec super-relativity-neo4j cypher-shell \
  -u neo4j -p super-relativity-2025 \
  < poc-data/neo4j-init/02-import-leanix-data.cypher

docker exec super-relativity-neo4j cypher-shell \
  -u neo4j -p super-relativity-2025 \
  < poc-data/neo4j-init/03-demo-queries.cypher
```

### Option C: Copy-Paste into Neo4j Browser

1. Open Neo4j Browser: http://localhost:7474
2. Login with `neo4j` / `super-relativity-2025`
3. Open each `.cypher` file in a text editor
4. Copy and paste the content into the Neo4j Browser query editor
5. Execute each script in order

---

## Initialization Scripts

The initialization scripts run in alphabetical order:

### 01-create-schema.cypher
- Creates constraints and indexes for all node types
- Creates sample data for:
  - Applications (3 nodes)
  - Containers (6 nodes)
  - Components (20 nodes)
  - DataObjects (3 nodes)
  - BusinessCapabilities (3 nodes)
  - Requirements (3 nodes)
  - Servers (3 nodes)
- Establishes relationships between entities
- **Status**: ✓ Always run

### 02-import-leanix-data.cypher
- Imports additional data from mock LeanIX API
- Creates more Applications, DataObjects, and relationships
- **Status**: Optional (comment out if not needed)

### 03-demo-queries.cypher
- Contains example queries for testing
- Does not modify data
- **Status**: Optional (safe to skip)

---

## Troubleshooting

### Database Already Initialized

If you see "Database already initialized", the scripts detected existing nodes and skipped initialization. To force re-initialization:

```bash
# Option 1: Delete all data (WARNING: destructive)
docker exec super-relativity-neo4j cypher-shell -u neo4j -p super-relativity-2025 \
  "MATCH (n) DETACH DELETE n"

# Option 2: Recreate volumes
docker-compose down -v
docker-compose up -d
```

### Init Container Keeps Restarting

Check the logs:

```bash
docker logs super-relativity-neo4j-init
```

Common issues:
- Neo4j not healthy yet: Wait longer or check Neo4j logs
- Permission denied: Scripts need execute permission (`chmod +x *.sh`)
- Cypher syntax error: Check the `.cypher` files for errors

### Neo4j Not Starting

```bash
# Check Neo4j logs
docker logs super-relativity-neo4j

# Common fixes:
# 1. Increase memory in docker-compose.yml
# 2. Check port conflicts (7474, 7687)
# 3. Delete corrupted volumes: docker-compose down -v
```

### No Container Nodes After Initialization

If `CALL db.schema.visualization()` doesn't show Container nodes:

1. Verify nodes exist:
   ```cypher
   MATCH (c:Container) RETURN count(c)
   ```

2. If count is 0, run initialization again:
   ```bash
   docker exec super-relativity-neo4j-init /init-db.sh
   ```

3. Clear Neo4j query cache:
   ```cypher
   CALL db.clearQueryCaches()
   ```

4. Force schema visualization update:
   ```cypher
   MATCH (c:Container)-[r]-(other)
   RETURN DISTINCT labels(c), type(r), labels(other)
   ```

---

## File Structure

```
poc-data/neo4j-init/
├── README.md                      # This file
├── Dockerfile                     # Init container image
├── init-db.sh                     # Main initialization script
├── healthcheck-init.sh            # Healthcheck with auto-init
├── 01-create-schema.cypher        # Schema + sample data
├── 02-import-leanix-data.cypher   # Additional data import
└── 03-demo-queries.cypher         # Example queries
```

---

## Environment Variables

All scripts support these environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `NEO4J_URI` | `bolt://neo4j:7687` | Neo4j connection URI |
| `NEO4J_USER` | `neo4j` | Neo4j username |
| `NEO4J_PASSWORD` | `super-relativity-2025` | Neo4j password |

---

## Quick Reference

```bash
# Check if initialized
docker exec super-relativity-neo4j cypher-shell -u neo4j -p super-relativity-2025 \
  "MATCH (n) RETURN count(n)"

# Run initialization
docker exec super-relativity-neo4j-init /init-db.sh

# Run healthcheck
bash poc-data/neo4j-init/healthcheck-init.sh

# Force re-initialization
docker-compose down -v && docker-compose up -d

# View init logs
docker logs -f super-relativity-neo4j-init

# View Neo4j logs
docker logs -f super-relativity-neo4j
```

---

## Best Practices

1. **Always use docker-compose** - Ensures proper startup order and networking
2. **Check logs** - Watch initialization logs to catch errors early
3. **Backup before reset** - Export data before running `docker-compose down -v`
4. **Version control .cypher files** - Track schema changes in git
5. **Test locally first** - Verify initialization works before deploying

---

## Related Documentation

- [Neo4j Manual: Import Data](https://neo4j.com/docs/operations-manual/current/tutorial/neo4j-admin-import/)
- [Cypher Query Language](https://neo4j.com/docs/cypher-manual/current/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
