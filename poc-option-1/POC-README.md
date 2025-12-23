# Super Relativity POC - Docker Environment

🚀 **Quick-start POC environment for Super Relativity Option 1 architecture**

This Docker Compose setup provides a fully functional local environment to demonstrate the Super Relativity platform capabilities.

## 🎯 What's Included

### Core Infrastructure
- **Neo4j 5.15** - Graph database for relationship storage (port 7474/7687)
- **PostgreSQL 16** - Metadata and user management (port 5432)
- **Redis 7** - Caching and job queue (port 6379)

### Services
- **Mock LeanIX API** - Simulates LeanIX GraphQL API (port 8080)
- **Sync Service** - Bi-directional LeanIX ↔ Neo4j sync (port 3001)
- **Code Parser** - Analyzes code and extracts relationships (port 3002)
- **Diagram Parser** - Parses Mermaid/PlantUML diagrams (port 3003)
- **GraphQL API** - Unified query interface (port 4000)
- **Web UI** - React frontend with graph visualization (port 3000)

### Monitoring
- **Prometheus** - Metrics collection (port 9090)
- **Grafana** - Dashboards and visualization (port 3100)

## 🚀 Quick Start

### Prerequisites
- Docker Desktop 24+ with Docker Compose
- 8GB RAM minimum (16GB recommended)
- 10GB free disk space

### 1. Start the Environment

```bash
# Clone or navigate to the project
cd super-relativity

# Start all services
docker-compose up -d

# Watch the logs
docker-compose logs -f
```

### 2. Wait for Services to Start (~2-3 minutes)

```bash
# Check service health
docker-compose ps

# All services should show "healthy" or "Up"
```

### 3. Access the Applications

| Service | URL | Credentials |
|---------|-----|-------------|
| **Web UI** | http://localhost:3000 | - |
| **GraphQL Playground** | http://localhost:4000/graphql | - |
| **Neo4j Browser** | http://localhost:7474 | neo4j / super-relativity-2025 |
| **Mock LeanIX API** | http://localhost:8080 | - |
| **Grafana** | http://localhost:3100 | admin / admin |
| **Prometheus** | http://localhost:9090 | - |

### 4. Load Sample Data

```bash
# Trigger initial data load
curl -X POST http://localhost:3001/sync/initial-load

# Parse sample code
curl -X POST http://localhost:3002/parse/sample

# Parse sample diagrams
curl -X POST http://localhost:3003/parse/sample

# Check data in Neo4j
# Open http://localhost:7474 and run:
# MATCH (n) RETURN n LIMIT 100
```

## 📊 Sample Queries

### GraphQL API Queries

Open http://localhost:4000/graphql and try these queries:

#### 1. Get All Applications
```graphql
query GetApplications {
  applications {
    id
    name
    businessValue
    lifecycle
    relationships {
      type
      target {
        name
      }
    }
  }
}
```

#### 2. Impact Analysis
```graphql
query ImpactAnalysis {
  impactAnalysis(nodeId: "DATA-789", depth: 3) {
    affectedNodes {
      id
      name
      type
      distance
      path
    }
    blastRadius
    criticalityScore
  }
}
```

#### 3. Find Code Using Data Object
```graphql
query CodeUsingDataObject {
  dataObject(id: "DATA-789") {
    name
    usedByCode {
      name
      filePath
      repository
      operations
    }
  }
}
```

### Neo4j Cypher Queries

Open http://localhost:7474 and try these:

#### 1. Visualize All Relationships
```cypher
MATCH (n)-[r]->(m)
RETURN n, r, m
LIMIT 100
```

#### 2. Find Impact of Database Change
```cypher
MATCH (db:DataObject {name: 'CustomerTable'})<-[:USES]-(code:CodeComponent)
MATCH (code)<-[:CONTAINS]-(app:Application)
OPTIONAL MATCH (app)<-[:IMPLEMENTS]-(req:Requirement)
RETURN db, code, app, req
ORDER BY req.priority DESC
```

#### 3. Calculate Blast Radius
```cypher
MATCH path = (start:DataObject {id: 'DATA-789'})-[*1..5]-(affected)
WHERE affected:Application OR affected:Requirement OR affected:CodeComponent
RETURN
  start.name AS changedItem,
  labels(affected)[0] AS affectedType,
  affected.name AS affectedName,
  length(path) AS distance
ORDER BY distance, affectedType
```

#### 4. Find Orphaned Components
```cypher
MATCH (code:CodeComponent)
WHERE NOT exists((code)-[:IMPLEMENTS]->(:Requirement))
  AND NOT exists((code)<-[:CONTAINS]-(:Application)-[:IMPLEMENTS]->(:Requirement))
RETURN code.name, code.filePath, code.lastModified
ORDER BY code.lastModified DESC
LIMIT 20
```

## 🧪 Sample Data Overview

The POC includes realistic sample data representing:

### Business Layer (from Mock LeanIX)
- **5 Requirements** - Business functional requirements
- **10 Applications** - Web apps, APIs, services
- **15 Data Objects** - Database tables, APIs, file systems

### Code Layer
- **3 Sample Repositories** - Java, JavaScript, Python
- **50+ Code Components** - Classes, functions, methods
- **100+ Relationships** - Uses, calls, depends on

### Architecture Layer
- **8 Diagrams** - Mermaid and PlantUML
- **20 Components** - Services, databases, queues
- **30+ Connections** - HTTP, SQL, messaging

### Infrastructure Layer
- **15 Servers** - EC2, VMs, containers
- **5 Databases** - PostgreSQL, MySQL, MongoDB
- **10 Network Rules** - Firewall, security groups

## 🔧 Development Workflow

### Making Changes to Services

```bash
# Rebuild a specific service after code changes
docker-compose build sync-service
docker-compose up -d sync-service

# View logs for debugging
docker-compose logs -f sync-service

# Restart a service
docker-compose restart sync-service
```

### Accessing Service Shells

```bash
# Neo4j Cypher Shell
docker exec -it super-relativity-neo4j cypher-shell -u neo4j -p super-relativity-2025

# PostgreSQL
docker exec -it super-relativity-postgres psql -U sr_user -d super_relativity

# Redis CLI
docker exec -it super-relativity-redis redis-cli -a sr_redis_2025
```

### Adding Your Own Data

#### Option 1: Via GraphQL Mutations
```graphql
mutation CreateApplication {
  createApplication(input: {
    name: "My New App"
    type: "Web Application"
    businessValue: "High"
    lifecycle: "Active"
  }) {
    id
    name
  }
}
```

#### Option 2: Via Mock LeanIX API
```bash
curl -X POST http://localhost:8080/applications \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My New App",
    "type": "Web Application",
    "businessValue": "High"
  }'
```

#### Option 3: Direct Neo4j Insert
```cypher
CREATE (a:Application {
  id: 'APP-999',
  name: 'My New App',
  type: 'Web Application',
  businessValue: 'High',
  lifecycle: 'Active'
})
RETURN a
```

## 📁 Directory Structure

```
super-relativity/
├── docker-compose.yml           # Main orchestration file
├── POC-README.md               # This file
│
├── poc-services/               # Microservices code
│   ├── mock-leanix/           # Mock LeanIX API
│   ├── sync-service/          # LeanIX ↔ Neo4j sync
│   ├── code-parser/           # Code analysis service
│   ├── diagram-parser/        # Diagram parsing service
│   ├── graphql-api/           # Unified GraphQL API
│   └── web-ui/                # React frontend
│
├── poc-data/                   # Sample data and init scripts
│   ├── leanix-sample-data/    # Mock LeanIX data
│   ├── neo4j-init/            # Neo4j initialization
│   ├── postgres-init/         # PostgreSQL schemas
│   ├── sample-code/           # Sample code repositories
│   └── sample-diagrams/       # Sample architecture diagrams
│
└── poc-config/                 # Configuration files
    ├── prometheus.yml         # Prometheus config
    └── grafana-datasources.yml # Grafana datasources
```

## 🎯 Use Case Demonstrations

### Use Case 1: "What data objects does 'submitApplication' function use?"

```graphql
query DataObjectUsage {
  codeComponent(name: "submitApplication") {
    name
    usesDataObjects {
      name
      operations
      sensitivity
    }
  }
}
```

**Expected Result:**
```json
{
  "data": {
    "codeComponent": {
      "name": "submitApplication",
      "usesDataObjects": [
        {
          "name": "CustomerTable",
          "operations": ["READ", "WRITE"],
          "sensitivity": "PII"
        },
        {
          "name": "ApplicationTable",
          "operations": ["WRITE"],
          "sensitivity": "Standard"
        }
      ]
    }
  }
}
```

### Use Case 2: "If we add a field to 'submitApplication', what's impacted?"

```graphql
query ChangeImpact {
  impactAnalysis(
    nodeId: "CODE-submitApplication"
    changeType: "MODIFY"
    depth: 5
  ) {
    affectedNodes {
      name
      type
      distance
      impactType
    }
    affectedCount
    criticalityScore
  }
}
```

### Use Case 3: "If we drop Firewall Rule FW-001, which functions break?"

```cypher
// In Neo4j Browser
MATCH (fw:Firewall {id: 'FW-001'})-[:PROTECTS]->(server:Server)
MATCH (server)<-[:DEPLOYED_ON]-(app:Application)
MATCH (app)-[:CONTAINS]->(code:CodeComponent)
MATCH (code)-[:IMPLEMENTS]->(req:Requirement)
RETURN
  fw.name AS firewallRule,
  req.name AS businessFunction,
  req.priority AS priority,
  app.name AS affectedApplication,
  count(code) AS affectedCodeComponents
ORDER BY req.priority DESC
```

## 🛠️ Troubleshooting

### Services Won't Start

```bash
# Check Docker resources
docker system df

# Clean up old containers and volumes
docker-compose down -v
docker system prune -a

# Restart Docker Desktop
# Then try again
docker-compose up -d
```

### Neo4j Connection Issues

```bash
# Check Neo4j logs
docker-compose logs neo4j

# Verify Neo4j is ready
docker exec super-relativity-neo4j cypher-shell -u neo4j -p super-relativity-2025 "RETURN 1"

# If password issues, reset:
docker-compose down neo4j
docker volume rm super-relativity_neo4j-data
docker-compose up -d neo4j
```

### Sync Service Not Working

```bash
# Check sync service logs
docker-compose logs -f sync-service

# Manually trigger sync
curl -X POST http://localhost:3001/sync/run

# Check sync status
curl http://localhost:3001/sync/status
```

### Out of Memory

```bash
# Increase Docker Desktop memory to 8GB+
# Or run minimal setup:
docker-compose up -d neo4j postgres redis mock-leanix graphql-api
```

## 📊 Monitoring and Observability

### Grafana Dashboards

1. Open http://localhost:3100 (admin/admin)
2. Navigate to Dashboards
3. Pre-configured dashboards:
   - **Super Relativity Overview** - System health
   - **Neo4j Performance** - Graph database metrics
   - **API Performance** - GraphQL response times
   - **Sync Service Status** - LeanIX sync monitoring

### Prometheus Metrics

Open http://localhost:9090 and query:

```promql
# API request rate
rate(graphql_requests_total[5m])

# Neo4j query duration
neo4j_query_duration_seconds

# Sync service lag
sync_lag_seconds
```

## 🧹 Cleanup

### Stop All Services
```bash
docker-compose down
```

### Stop and Remove All Data
```bash
docker-compose down -v
```

### Complete Cleanup
```bash
docker-compose down -v
docker system prune -a
```

## 🚀 Next Steps

### 1. Evaluate the POC (Week 1-2)
- [ ] Test all use cases
- [ ] Load your own sample data
- [ ] Present to stakeholders
- [ ] Gather feedback

### 2. Extend the POC (Week 3-4)
- [ ] Connect to real Git repositories
- [ ] Integrate with actual LeanIX instance
- [ ] Add more sample applications
- [ ] Test with realistic data volumes

### 3. Production Planning (Month 2-3)
- [ ] Security hardening
- [ ] Kubernetes deployment plan
- [ ] Production Neo4j cluster design
- [ ] Monitoring and alerting setup
- [ ] Disaster recovery planning

## 📚 Additional Resources

- [Neo4j Documentation](https://neo4j.com/docs/)
- [GraphQL Documentation](https://graphql.org/learn/)
- [Full POC Plan](/_bmad-output/super-relativity-poc-plan.md)
- [Market Research](./market_research/comprehensive_market_research.md)

## 💬 Support

For questions about this POC:
1. Review the full POC plan document
2. Check the troubleshooting section above
3. Review service logs: `docker-compose logs -f [service-name]`

## 🎯 Success Criteria

This POC successfully demonstrates:
- ✅ Multi-source data integration (LeanIX, Code, Diagrams)
- ✅ Bi-directional traceability (Business → Code → Infrastructure)
- ✅ Impact analysis capabilities
- ✅ Graph-based relationship modeling
- ✅ Real-time synchronization
- ✅ Scalable architecture pattern

**POC Version:** 1.0
**Last Updated:** December 22, 2025
**Status:** Ready for Evaluation
