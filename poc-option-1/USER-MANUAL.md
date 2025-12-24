# Super Relativity POC - User Manual

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Getting Started](#getting-started)
4. [Service Access Points](#service-access-points)
5. [Browsing Relationships](#browsing-relationships)
6. [API Documentation](#api-documentation)
7. [Monitoring and Observability](#monitoring-and-observability)
8. [Troubleshooting](#troubleshooting)
9. [Data Model](#data-model)

---

## Overview

Super Relativity is a proof-of-concept system that demonstrates graph-based enterprise architecture visualization and impact analysis. The system ingests data from LeanIX (mocked), parses code repositories and diagrams, and stores everything in a Neo4j graph database for relationship analysis.

### Key Capabilities

- **Automated Data Synchronization**: Syncs applications, requirements, data objects, and infrastructure from LeanIX every 5 minutes
- **Relationship Tracking**: Maintains relationships between entities (DEPENDS_ON, IMPLEMENTED_BY, USES, etc.)
- **Code Analysis**: Parses JavaScript/TypeScript repositories to extract functions, imports, and dependencies
- **Diagram Parsing**: Extracts entities and relationships from Mermaid and PlantUML diagrams
- **GraphQL API**: Unified query interface for all data
- **Visual Dashboard**: React-based web UI with graph visualization
- **Impact Analysis**: Trace upstream and downstream dependencies

---

## Architecture

### Services

| Service | Port | Purpose | Dependencies |
|---------|------|---------|--------------|
| **Neo4j** | 7474 (HTTP)<br>7687 (Bolt) | Graph database storing entities and relationships | None |
| **PostgreSQL** | 5432 | Metadata storage for sync/parse jobs | None |
| **Redis** | 6379 | Caching and job queue | None |
| **Mock LeanIX** | 8080 | Simulates LeanIX API with sample data | PostgreSQL |
| **Sync Service** | 3001 | LeanIX ↔ Neo4j synchronization | Neo4j, PostgreSQL, Redis, Mock LeanIX |
| **Code Parser** | 3002 | Code repository analysis | Neo4j, PostgreSQL |
| **Diagram Parser** | 3003 | Mermaid/PlantUML diagram parsing | Neo4j |
| **GraphQL API** | 4000 | Unified query interface | Neo4j, PostgreSQL, Redis |
| **Web UI** | 3000 | React dashboard | GraphQL API |
| **Prometheus** | 9090 | Metrics collection | All services |
| **Grafana** | 3100 | Metrics visualization | Prometheus, Neo4j |

### Data Flow

```
LeanIX (Mock) → Sync Service → Neo4j → GraphQL API → Web UI
                                  ↓
Code Repos → Code Parser ────────┘
                                  ↓
Diagrams → Diagram Parser ───────┘
```

---

## Getting Started

### Prerequisites

- Docker Desktop
- Docker Compose
- Git

### Starting the System

```bash
cd poc-option-1
docker-compose up -d
```

This will start all services. The initial sync will run automatically after 5 seconds.

### Stopping the System

```bash
docker-compose down
```

To stop and remove all data:

```bash
docker-compose down -v
```

### Viewing Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker logs super-relativity-sync -f
docker logs super-relativity-neo4j -f
```

### Checking Service Health

```bash
docker-compose ps
```

All services should show status as "healthy" or "running".

---

## Service Access Points

### Neo4j Browser
- **URL**: http://localhost:7474
- **Username**: `neo4j`
- **Password**: `super-relativity-2025`
- **Purpose**: Interactive graph database browser and query interface

### Web UI Dashboard
- **URL**: http://localhost:3000
- **Purpose**: Main application dashboard
- **Features**:
  - Applications overview
  - Code repositories
  - Sync job status

### GraphQL Playground
- **URL**: http://localhost:4000/graphql
- **Purpose**: Interactive GraphQL API explorer

### Grafana Dashboards
- **URL**: http://localhost:3100
- **Username**: `admin`
- **Password**: `admin`
- **Purpose**: System metrics and Neo4j visualizations

### Prometheus
- **URL**: http://localhost:9090
- **Purpose**: Metrics data source

### Sync Service API
- **Base URL**: http://localhost:3001
- **Endpoints**:
  - `GET /health` - Health check
  - `GET /api/sync/status` - View last 10 sync jobs
  - `POST /api/sync/trigger` - Manually trigger sync

### Mock LeanIX API
- **Base URL**: http://localhost:8080
- **Endpoints**: See [API Documentation](#api-documentation)

---

## Browsing Relationships

### Current Sync Status

As of the latest sync:
- **10 Applications** synced to Neo4j
- **44 Relationships** available in mock LeanIX
- **6 DEPENDS_ON relationships** successfully synced
- **38 Relationships** pending (require additional entity types)

### Relationship Types

| Type | Count | Status | Description |
|------|-------|--------|-------------|
| **DEPENDS_ON** | 6 | ✓ Synced | Application dependencies |
| **IMPLEMENTED_BY** | 8 | Pending | Requirements → Applications |
| **USES** | 13 | Pending | Applications → Data Objects |
| **DEPLOYED_ON** | 6 | Pending | Applications → Infrastructure |
| **REQUIRES** | 6 | Pending | Application requirements |
| **STORED_ON** | 4 | Pending | Data storage relationships |
| **CALLS** | 1 | Pending | API calls between applications |

### Option 1: Neo4j Browser (Recommended)

**Access**: http://localhost:7474

**Credentials**:
- Username: `neo4j`
- Password: `super-relativity-2025`

**Useful Cypher Queries**:

```cypher
// View all relationships with nodes
MATCH (a)-[r]->(b)
RETURN a, r, b
LIMIT 25

// Count relationships by type
MATCH ()-[r]->()
RETURN type(r) as RelationType, count(r) as Count
ORDER BY Count DESC

// View application dependencies
MATCH (a:Application)-[r:DEPENDS_ON]->(b:Application)
RETURN a.name as Application, b.name as DependsOn

// View all applications and their connections
MATCH (n:Application)
OPTIONAL MATCH (n)-[r]-(m)
RETURN n, r, m

// Find all relationships for a specific application
MATCH (a:Application {id: 'APP-123'})-[r]-(connected)
RETURN a.name, type(r), connected

// Show full graph (use with caution on large datasets)
MATCH (n)-[r]-(m)
RETURN n, r, m
LIMIT 100

// Find applications with no dependencies
MATCH (a:Application)
WHERE NOT (a)-[:DEPENDS_ON]->()
RETURN a.name, a.id

// Find most connected applications
MATCH (a:Application)-[r]-()
RETURN a.name, count(r) as connections
ORDER BY connections DESC
LIMIT 10
```

### Option 2: GraphQL API

**Access**: http://localhost:4000/graphql

**Example Query**:

```graphql
query {
  applications {
    id
    name
    description
    status
    businessCriticality
  }
}
```

**Note**: Relationship queries may need schema updates.

### Option 3: REST API (Mock LeanIX)

**View All Relationships**:
```bash
curl http://localhost:8080/relationships | jq
```

**Filter by Type**:
```bash
curl "http://localhost:8080/relationships?type=DEPENDS_ON" | jq
```

**Filter by Source**:
```bash
curl "http://localhost:8080/relationships?from=APP-123" | jq
```

**Impact Analysis**:
```bash
curl http://localhost:8080/impact/APP-123 | jq
```

---

## API Documentation

### Mock LeanIX API Endpoints

#### Applications

```bash
# Get all applications
GET /applications

# Get specific application
GET /applications/{id}

# Create application
POST /applications
Content-Type: application/json
{
  "name": "New App",
  "type": "Web Application",
  "businessValue": "High"
}
```

#### Requirements

```bash
# Get all requirements
GET /requirements

# Get specific requirement
GET /requirements/{id}
```

#### Data Objects

```bash
# Get all data objects
GET /data-objects

# Get specific data object
GET /data-objects/{id}
```

#### Relationships

```bash
# Get all relationships
GET /relationships

# Filter relationships
GET /relationships?from={id}&to={id}&type={type}
```

#### Business Capabilities

```bash
# Get all capabilities
GET /capabilities

# Get specific capability
GET /capabilities/{id}
```

#### Infrastructure

```bash
# Get all infrastructure
GET /infrastructure

# Get specific infrastructure
GET /infrastructure/{id}
```

#### Diagrams

```bash
# Get all diagrams
GET /diagrams

# Get specific diagram
GET /diagrams/{id}
```

#### Impact Analysis

```bash
# Get impact analysis for entity
GET /impact/{entityId}

Response:
{
  "entityId": "APP-123",
  "impacts": {
    "upstream": [...],
    "downstream": [...],
    "relatedRequirements": [...],
    "relatedCapabilities": [...],
    "relatedInfrastructure": [...]
  }
}
```

#### Sync Endpoint

```bash
# Get all data for initial sync
GET /sync/all

Response:
{
  "businessCapabilities": [...],
  "applications": [...],
  "requirements": [...],
  "dataObjects": [...],
  "infrastructure": [...],
  "contextDiagrams": [...],
  "relationships": [...],
  "timestamp": "2025-12-24T03:24:06.742Z",
  "statistics": {
    "totalEntities": 25,
    "totalRelationships": 44
  }
}
```

### Sync Service API

```bash
# Health check
GET http://localhost:3001/health

# View sync job history
GET http://localhost:3001/api/sync/status

# Manually trigger sync
POST http://localhost:3001/api/sync/trigger
```

### Code Parser API

```bash
# Health check
GET http://localhost:3002/health

# Parse repository
POST http://localhost:3002/api/parse
Content-Type: application/json
{
  "repositoryPath": "/sample-code/customer-portal",
  "repositoryUrl": "github.com/org/customer-portal"
}

# View parse job history
GET http://localhost:3002/api/parse/status
```

### Diagram Parser API

```bash
# Health check
GET http://localhost:3003/health

# Parse diagram
POST http://localhost:3003/api/parse
Content-Type: application/json
{
  "diagramPath": "/sample-diagrams/architecture.mmd",
  "diagramType": "mermaid"
}

# View parse job history
GET http://localhost:3003/api/parse/status
```

---

## Monitoring and Observability

### Sync Job Monitoring

**View Recent Sync Jobs**:
```bash
curl http://localhost:3001/api/sync/status | jq
```

**PostgreSQL Query**:
```bash
docker exec super-relativity-postgres psql -U sr_user -d super_relativity \
  -c "SELECT job_id, status, started_at, completed_at, records_synced FROM sync_jobs ORDER BY started_at DESC LIMIT 10;"
```

### Redis Cache Inspection

**Connect to Redis**:
```bash
docker exec -it super-relativity-redis redis-cli -a sr_redis_2025
```

**View Last Sync**:
```
> GET last-sync
```

### Neo4j Statistics

**Count All Nodes**:
```cypher
MATCH (n)
RETURN labels(n) as NodeType, count(n) as Count
ORDER BY Count DESC
```

**Count All Relationships**:
```cypher
MATCH ()-[r]->()
RETURN type(r) as RelationType, count(r) as Count
ORDER BY Count DESC
```

**Database Info**:
```cypher
CALL dbms.components() YIELD name, versions, edition
RETURN name, versions, edition
```

### Prometheus Metrics

Access http://localhost:9090 and query:
- `up` - Service availability
- `neo4j_*` - Neo4j specific metrics
- `process_*` - Process metrics for Node.js services

### Grafana Dashboards

1. Access http://localhost:3100
2. Login with `admin` / `admin`
3. Navigate to Dashboards
4. Pre-configured data sources:
   - Prometheus (default)
   - Neo4j

---

## Troubleshooting

### Service Won't Start

**Check Service Status**:
```bash
docker-compose ps
```

**View Logs**:
```bash
docker-compose logs [service-name]
```

**Common Issues**:

1. **Port Already in Use**:
   - Stop other services using the same ports
   - Or modify port mappings in `docker-compose.yml`

2. **Healthcheck Failed**:
   - Wait 30 seconds for services to fully start
   - Check logs for specific errors

3. **Out of Memory**:
   - Increase Docker Desktop memory allocation
   - Default requires ~4GB RAM

### Sync Not Running

**Check Sync Service Logs**:
```bash
docker logs super-relativity-sync
```

**Manually Trigger Sync**:
```bash
curl -X POST http://localhost:3001/api/sync/trigger
```

**Verify Mock LeanIX is Running**:
```bash
curl http://localhost:8080/health
```

### No Relationships in Neo4j

**Possible Causes**:

1. **Missing Entity Types**: Relationships require both source and target entities to exist
   - Currently only Applications are synced
   - IMPLEMENTED_BY requires Requirements
   - USES requires Data Objects
   - DEPLOYED_ON requires Infrastructure

2. **Sync Not Run**: Wait for automatic sync or manually trigger

3. **Relationship Query Issues**: Some relationship types may not match Neo4j naming conventions

**Verify Relationships in Mock API**:
```bash
curl http://localhost:8080/relationships | jq '.data | length'
```

### Container Keeps Restarting

**Check Logs**:
```bash
docker logs [container-name]
```

**Common Causes**:
- Missing environment variables
- Database connection failures
- Syntax errors in code
- Port conflicts

**Rebuild Container**:
```bash
docker-compose build [service-name]
docker-compose up -d [service-name]
```

### GraphQL API Errors

**Check Schema**:
```bash
curl http://localhost:4000/graphql -H "Content-Type: application/json" \
  -d '{"query": "{__schema{types{name}}}"}'
```

**Verify Neo4j Connection**:
```bash
docker exec super-relativity-graphql npm test
```

### Database Connection Issues

**Neo4j Connection Test**:
```bash
docker exec super-relativity-neo4j cypher-shell -u neo4j -p super-relativity-2025 "RETURN 1"
```

**PostgreSQL Connection Test**:
```bash
docker exec super-relativity-postgres psql -U sr_user -d super_relativity -c "SELECT NOW();"
```

**Redis Connection Test**:
```bash
docker exec super-relativity-redis redis-cli -a sr_redis_2025 PING
```

### Reset Everything

**Complete Reset** (WARNING: Deletes all data):
```bash
docker-compose down -v
docker-compose up -d
```

---

## Data Model

### Current Entities in Neo4j

#### Application Node
```
Properties:
- id: String (unique identifier)
- name: String
- description: String
- status: String (ACTIVE, INACTIVE, etc.)
- businessCriticality: String (HIGH, MEDIUM, LOW)
- lastSyncedAt: DateTime
```

### Planned Entities (Pending Implementation)

#### Requirement Node
```
Properties:
- id: String
- name: String
- type: String (Functional, Non-Functional)
- priority: String (High, Medium, Low)
- status: String (Approved, Draft, etc.)
- owner: String
- description: String
```

#### DataObject Node
```
Properties:
- id: String
- name: String
- type: String (Database Table, Object Storage, etc.)
- database: String
- schema: String
- sensitivity: String (PII, Standard, etc.)
- columns: Array<String>
```

#### Infrastructure Node
```
Properties:
- id: String
- name: String
- type: String
- provider: String
- region: String
```

#### Function Node (from Code Parser)
```
Properties:
- name: String
- filePath: String
- parameters: Array<String>
- returnType: String
```

#### Module Node (from Code Parser)
```
Properties:
- name: String
- type: String (npm package, local module, etc.)
```

#### CodeFile Node (from Code Parser)
```
Properties:
- path: String
- language: String
- linesOfCode: Integer
```

### Relationship Types

| Relationship | Source | Target | Description |
|--------------|--------|--------|-------------|
| DEPENDS_ON | Application | Application | Runtime dependency |
| IMPLEMENTED_BY | Requirement | Application | Implementation link |
| USES | Application | DataObject | Data access |
| DEPLOYED_ON | Application | Infrastructure | Deployment location |
| REQUIRES | Application | Requirement | Functional requirement |
| STORED_ON | DataObject | Infrastructure | Storage location |
| CALLS | Application | Application | API/Service call |
| DEFINES | CodeFile | Function | Function definition |
| IMPORTS | CodeFile | Module | Module import |

---

## Configuration

### Environment Variables

All services can be configured via environment variables in `docker-compose.yml`.

#### Sync Service Configuration

```yaml
- SYNC_INTERVAL_MINUTES=5  # Sync frequency
- NEO4J_URI=bolt://neo4j:7687
- NEO4J_USER=neo4j
- NEO4J_PASSWORD=super-relativity-2025
- LEANIX_API_URL=http://mock-leanix:8080
- POSTGRES_HOST=postgres
- POSTGRES_DB=super_relativity
- REDIS_HOST=redis
```

#### Neo4j Configuration

```yaml
- NEO4J_PLUGINS=["apoc", "graph-data-science"]
- NEO4J_dbms_memory_heap_initial__size=512m
- NEO4J_dbms_memory_heap_max__size=2G
- NEO4J_dbms_memory_pagecache_size=1G
```

### Passwords and Security

**Default Credentials** (Change in production!):

- Neo4j: `neo4j` / `super-relativity-2025`
- PostgreSQL: `sr_user` / `sr_password_2025`
- Redis: `sr_redis_2025`
- Grafana: `admin` / `admin`

To change:
1. Update environment variables in `docker-compose.yml`
2. Update corresponding service configurations
3. Rebuild and restart: `docker-compose down && docker-compose up -d --build`

---

## Next Steps

### Expanding Entity Types

To sync additional entity types (Requirements, Data Objects, Infrastructure):

1. Add entity sync logic to `sync-service/server.js`
2. Create corresponding node types in Neo4j
3. Update GraphQL schema to expose new entities
4. Enhance Web UI to display new entity types

### Custom Data Import

To import your own data:

1. **Mock LeanIX**: Edit `poc-services/mock-leanix/data/sample-data.json`
2. **Code Repositories**: Place code in `poc-data/sample-code/`
3. **Diagrams**: Place diagrams in `poc-data/sample-diagrams/`

### Integration with Real LeanIX

Replace mock LeanIX with real API:

1. Update `LEANIX_API_URL` in `docker-compose.yml`
2. Add authentication logic to `sync-service/server.js`
3. Update GraphQL queries to match real LeanIX schema
4. Configure API token in environment variables

---

## Support and Contributions

### Repository
https://github.com/aware-noppadons/super-relativity

### Reporting Issues
Please report issues via GitHub Issues

### Documentation
- `README.md` - Project overview
- `POC-COMPARISON-EXPANDED.md` - Architecture comparison
- `USER-MANUAL.md` - This document

---

**Last Updated**: December 24, 2025
**Version**: 1.0.0
**POC Status**: Operational with relationship syncing
