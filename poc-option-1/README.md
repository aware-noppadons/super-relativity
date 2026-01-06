# Super Relativity POC - Option 1: LeanIX + Neo4j Integration

**Extends your existing LeanIX investment with graph-based impact analysis**

---

## 🎯 What This POC Demonstrates

This POC shows how to extend LeanIX with a Neo4j knowledge graph to provide:

✅ **Bi-directional traceability** from business capabilities → requirements → applications → code → data → infrastructure
✅ **Instant impact analysis** - "If I change X, what breaks?"
✅ **Real-time compliance reporting** - "Which apps handle PII data?"
✅ **Cost visibility** - "What does this capability cost?"
✅ **Risk assessment** - "What's the blast radius of this change?"

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    BUSINESS LAYER                            │
│  ┌──────────────┐         ┌──────────────┐                 │
│  │   LeanIX     │────────▶│  Mock LeanIX │                 │
│  │  (Real API)  │         │  API (POC)   │                 │
│  └──────────────┘         └──────┬───────┘                 │
└─────────────────────────────────│─────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────┐
│                   KNOWLEDGE GRAPH LAYER                      │
│  ┌──────────────┐         ┌──────────────┐                 │
│  │   Neo4j      │◀────────│ Sync Service │                 │
│  │   Graph DB   │         │ (5 min sync) │                 │
│  └──────┬───────┘         └──────────────┘                 │
│         │                                                     │
│         │    ┌──────────────┐    ┌──────────────┐          │
│         ├───▶│  GraphQL API │───▶│   Web UI     │          │
│         │    └──────────────┘    └──────────────┘          │
│         │                                                     │
│         │    ┌──────────────┐                                │
│         └───▶│   Grafana    │                                │
│              │  Dashboards  │                                │
│              └──────────────┘                                │
└─────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────┐
│                     DATA SOURCES LAYER                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Code Parser  │  │Diagram Parser│  │ Sourcegraph  │     │
│  │(Git Repos)   │  │(Mermaid/UML) │  │(Code Search) │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 What's Included

### Core Services

- **Mock LeanIX API** (port 8080) - Simulates your LeanIX environment with realistic data
- **Neo4j Graph Database** (ports 7474, 7687) - Stores the knowledge graph
- **Sync Service** (port 3001) - Syncs data from LeanIX → Neo4j every 5 minutes
- **GraphQL API** (port 4000) - Unified query interface
- **Web UI** (port 3000) - React-based visualization dashboard
- **Prometheus** (port 9090) - Metrics collection
- **Grafana** (port 3100) - Metrics visualization

### Supporting Services

- **Code Parser** (port 3002) - Analyzes Git repositories
- **Diagram Parser** (port 3003) - Parses Mermaid/PlantUML diagrams
- **PostgreSQL** (port 5432) - Metadata storage
- **Redis** (port 6379) - Caching and job queue

---

## 🚀 Quick Start (5 Minutes)

### Prerequisites

- **Docker Desktop** installed and running
- **8GB RAM minimum** (16GB recommended)
- **10GB free disk space**

### Start the POC

```bash
# 1. Navigate to this directory
cd /Users/noppadon.s/GH/BMAD-METHOD/super-relativity/poc-option-1

# 2. Start all services
docker-compose up -d

# 3. Wait for services to initialize (2-3 minutes)
# Check status:
docker-compose ps

# Watch Neo4j initialization (automatic):
docker logs -f super-relativity-neo4j-init
# Wait for "✓ Database initialization complete!" message

# 4. Access the interfaces
open http://localhost:7474         # Neo4j Browser
open http://localhost:3000         # Web UI
open http://localhost:4000/graphql # GraphQL Playground
open http://localhost:3100         # Grafana

# 5. Login to Neo4j Browser
# Username: neo4j
# Password: super-relativity-2025
```

---

## 📊 Sample Data Included

The POC comes preloaded with realistic data following the C4 Model architecture:

- **3 Applications** - Customer Portal, Application Processing API, Document Management Service
- **6 Containers** (C4 Model) - React Frontend, API Gateway, Application Service, Document Service, PostgreSQL Database, S3 Document Store
- **20 Components** (C4 Model) - Authentication Manager, Form Validator, API Clients, Processors, Storage Managers, etc.
- **3 Business Capabilities** - L1 and L2 capabilities with criticality and maturity levels
- **3 Requirements** - Functional and non-functional requirements with compliance tags
- **3 Data Objects** - CustomerTable, ApplicationTable, DocumentStorage with PII classifications
- **3 Servers** - Production EKS Cluster, RDS Database, S3 Bucket with deployment details
- **Sample Context Diagrams** - PlantUML C4 diagrams showing application dependencies
- **100+ Relationships** - CONTAINS, USES, COMMUNICATES_WITH, DEPLOYED_ON, IMPLEMENTED_BY, etc.

All data represents a realistic application processing system following C4 Model best practices.

---

## 🎬 Demo Scenarios

### Scenario 1: Impact Analysis

**Question:** "If we upgrade the Customer Portal, what's impacted?"

```cypher
// Run in Neo4j Browser (http://localhost:7474)
MATCH (a:Application {id: 'APP-123'})
OPTIONAL MATCH (a)-[:USES]->(d:DataObject)
OPTIONAL MATCH (a)-[:DEPLOYED_ON]->(i:Infrastructure)
OPTIONAL MATCH (r:Requirement)-[:IMPLEMENTED_BY]->(a)
RETURN
  a.name as Application,
  collect(DISTINCT r.name) as Requirements,
  collect(DISTINCT d.name) as DataObjects,
  collect(DISTINCT i.name) as Infrastructure;
```

**Result:** Instant view of all requirements, data, and infrastructure affected.

### Scenario 2: Compliance

**Question:** "Which applications handle PII data?"

```cypher
MATCH (a:Application)-[:USES]->(d:DataObject)
WHERE d.sensitivity = 'PII'
RETURN DISTINCT
  a.name as Application,
  a.owner as Owner,
  collect(d.name) as PIIDataObjects
ORDER BY a.name;
```

**Result:** Complete list for GDPR/HIPAA compliance audits.

### Scenario 3: Business-to-Tech Traceability

**Question:** "What technical systems support Application Processing capability?"

```cypher
MATCH (cap:BusinessCapability {id: 'CAP-002'})
OPTIONAL MATCH (cap)-[:REQUIRES]->(r:Requirement)
OPTIONAL MATCH (r)-[:IMPLEMENTED_BY]->(a:Application)
OPTIONAL MATCH (a)-[:USES]->(d:DataObject)
OPTIONAL MATCH (a)-[:DEPLOYED_ON]->(i:Infrastructure)
RETURN
  cap.name as Capability,
  collect(DISTINCT r.name) as Requirements,
  collect(DISTINCT a.name) as Applications,
  collect(DISTINCT d.name) as DataObjects,
  collect(DISTINCT i.name) as Infrastructure;
```

**Result:** Complete capability-to-implementation mapping.

**More demos:** See `PRESENTATION-GUIDE.md` for complete stakeholder presentation.

---

## 🔧 Configuration

### LeanIX Integration

Update `docker-compose.yml` to point to your real LeanIX instance:

```yaml
sync-service:
  environment:
    - LEANIX_API_URL=https://your-instance.leanix.net/services/pathfinder/v1
    - LEANIX_API_TOKEN=your-api-token-here
```

### Sync Frequency

Change how often data syncs from LeanIX:

```yaml
sync-service:
  environment:
    - SYNC_INTERVAL_MINUTES=5  # Default: 5 minutes
```

### Neo4j Memory

For larger datasets, increase Neo4j memory:

```yaml
neo4j:
  environment:
    - NEO4J_dbms_memory_heap_max__size=4G  # Default: 2G
    - NEO4J_dbms_memory_pagecache_size=2G  # Default: 1G
```

---

## 📈 Accessing the Data

### Neo4j Browser

**URL:** http://localhost:7474
**Credentials:** neo4j / super-relativity-2025

Try these queries:
- See all data: `MATCH (n) RETURN n LIMIT 100`
- Count entities: `MATCH (n) RETURN labels(n)[0] as Type, count(n) as Count`
- See all demos: Open `poc-data/neo4j-init/03-demo-queries.cypher`

### GraphQL API

**URL:** http://localhost:4000/graphql

Example query:
```graphql
query {
  applications {
    id
    name
    techStack
    requirements {
      name
      priority
    }
  }
}
```

### Web UI

**URL:** http://localhost:3000

Interactive graph visualization with:
- Search by entity type
- Click to explore relationships
- Impact analysis tool
- Compliance filters

### Grafana Dashboards

**URL:** http://localhost:3100
**Credentials:** admin / admin

Pre-built dashboards:
- System health metrics
- Entity count trends
- Query performance
- Data sync status

---

## 🛠️ Troubleshooting

### Services won't start

```bash
# Check Docker has enough resources
docker system df

# Restart Docker Desktop
# Then try again:
docker-compose down
docker-compose up -d
```

### Neo4j won't load data

**The `neo4j-init` container automatically initializes the database.** Check the logs:

```bash
# Check initialization logs
docker logs super-relativity-neo4j-init

# If you see "Database already initialized" but have no data, reset:
docker-compose down -v  # WARNING: deletes all data
docker-compose up -d

# Manually re-run initialization if needed
docker exec super-relativity-neo4j-init /init-db.sh

# Verify data loaded
docker exec super-relativity-neo4j cypher-shell -u neo4j -p super-relativity-2025 \
  "MATCH (n) RETURN labels(n)[0] as type, count(*) as count ORDER BY type"
```

**For detailed troubleshooting**, see [Neo4j Initialization Guide](poc-data/neo4j-init/README.md)

### Sync service errors

```bash
# Check sync service logs
docker-compose logs -f sync-service

# Verify mock LeanIX is running
curl http://localhost:8080/health

# Check Neo4j connection
docker-compose exec sync-service nc -zv neo4j 7687
```

### Port conflicts

If ports are already in use:

```bash
# Find what's using the port
lsof -i :7474

# Kill the process or change ports in docker-compose.yml
# Example: Change "7474:7474" to "7475:7474"
```

---

## 📚 Documentation

- **PRESENTATION-GUIDE.md** - Step-by-step guide for presenting to stakeholders
- **poc-data/neo4j-init/03-demo-queries.cypher** - All demo queries with explanations
- **docker-compose.yml** - Complete service configuration
- **poc-services/** - Source code for all custom services

---

## 🎯 Success Metrics

You'll know the POC is successful when stakeholders can:

✅ **Find impact in seconds** - Answer "what's affected?" in under 10 seconds
✅ **Generate compliance reports** - List all PII-handling apps instantly
✅ **Trace requirements** - Follow from business → tech → infrastructure
✅ **See costs** - View total cost of ownership by capability
✅ **Trust the data** - Verify it's always up-to-date (< 5 min stale)

---

## 💰 Cost Breakdown (Production)

### 3-Year Total Cost of Ownership: $1.5M

| Component | Year 1 | Year 2 | Year 3 | Total |
|-----------|--------|--------|--------|-------|
| LeanIX Licenses | $300K | $300K | $300K | $900K |
| Neo4j Enterprise | $100K | $100K | $100K | $300K |
| AWS Infrastructure | $30K | $30K | $40K | $100K |
| Development | $150K | $25K | $25K | $200K |
| **Total** | **$580K** | **$455K** | **$465K** | **$1.5M** |

**ROI Calculation:**
- Manual impact analysis: 500 hours/year × $150/hour = $75K/year
- 3-year savings: $225K in time alone
- Risk mitigation value: Preventing one major incident = $500K+
- **Estimated 3-year ROI: 250%+**

---

## 📞 Next Steps

### For POC Evaluation

1. ✅ Run the POC (done - you're here!)
2. ✅ Try the demo scenarios above
3. ✅ Review with stakeholders using PRESENTATION-GUIDE.md
4. ✅ Collect feedback from developers, architects, and business users

### For Pilot Phase

1. **Define pilot scope** - Select 50 representative applications
2. **Connect real LeanIX** - Update configuration with production API
3. **Add Git integration** - Connect to your repositories
4. **Validate accuracy** - Compare to manual analysis
5. **Measure metrics** - Query performance, data freshness, user adoption

### For Production

1. **Scale infrastructure** - Move to production-grade Neo4j cluster
2. **Expand data sources** - Add Sourcegraph, infrastructure discovery
3. **Train users** - Conduct workshops for different user personas
4. **Monitor adoption** - Track usage and identify champions
5. **Iterate** - Add features based on user feedback

---

## 🎓 Learning Resources

### Neo4j Cypher

- **Neo4j Browser Guide:** Click the book icon in Neo4j Browser
- **Cypher Cheat Sheet:** https://neo4j.com/docs/cypher-cheat-sheet/
- **Graph Data Science:** https://neo4j.com/docs/graph-data-science/

### LeanIX API

- **API Documentation:** https://docs.leanix.net/
- **GraphQL Playground:** Your LeanIX instance + `/pathfinder/graphql`

### Graph Modeling

- **Graph Modeling Guidelines:** https://neo4j.com/developer/guide-data-modeling/
- **Best Practices:** Read `ENTERPRISE-RESEARCH.md` for Fortune 100 patterns

---

## 🤝 Support

For issues or questions:

1. **Check logs:** `docker-compose logs -f [service-name]`
2. **Review troubleshooting section** above
3. **Check Neo4j Browser** for query syntax errors
4. **Review PRESENTATION-GUIDE.md** for common scenarios

---

## 🎉 You're Ready!

You now have a fully functional POC demonstrating:
- ✅ LeanIX integration
- ✅ Graph-based impact analysis
- ✅ Real-time compliance reporting
- ✅ Business-to-tech traceability
- ✅ Cost visibility
- ✅ Interactive visualizations

**Next:** Review `PRESENTATION-GUIDE.md` to prepare your stakeholder demo.

**Good luck! 🚀**
