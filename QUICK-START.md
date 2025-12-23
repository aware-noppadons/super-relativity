# Super Relativity POC - Quick Start Guide

**Get started with any POC option in under 10 minutes**

---

## 📋 Prerequisites

### Required for All Options
- **Docker Desktop** installed and running
- **8GB RAM minimum** (16GB recommended)
- **20GB free disk space**
- **macOS, Linux, or Windows with WSL2**

### Check Your Setup
```bash
# Verify Docker is running
docker --version
docker-compose --version

# Verify you have enough resources
docker info | grep "Total Memory"
df -h
```

---

## 🚀 Quick Start (5 Options)

### Option 1: LeanIX + Neo4j + Sourcegraph

**Best For:** Lowest risk, extends existing LeanIX, mixed legacy/modern architecture

```bash
# Navigate to POC directory
cd /Users/noppadon.s/GH/BMAD-METHOD/super-relativity/poc-option-1

# Start all services
docker-compose up -d

# Wait 2-3 minutes for services to start, then access:
# - Neo4j Browser: http://localhost:7474 (neo4j / super-relativity-2025)
# - GraphQL API: http://localhost:4000/graphql
# - Mock LeanIX: http://localhost:8080
# - Grafana: http://localhost:3100 (admin / admin)
```

**First Steps:**
1. Open Neo4j Browser → Run: `MATCH (n) RETURN n LIMIT 25`
2. Open GraphQL Playground → Try sample queries from README
3. Explore mock LeanIX data → `curl http://localhost:8080/applications`

**Full Guide:** `poc-option-1/POC-README.md`

---

### Option 2: Ardoq Platform

**Best For:** Single vendor, best visualization, willing to migrate from LeanIX

```bash
# Navigate to POC directory
cd /Users/noppadon.s/GH/BMAD-METHOD/super-relativity/poc-option-2

# Start all services
docker-compose up -d

# Access:
# - Ardoq UI (simulated): http://localhost:3000
# - Ardoq API: http://localhost:4000
# - Neo4j Browser: http://localhost:7474 (neo4j / ardoq-poc-2025)
```

**First Steps:**
1. Load sample data → `curl -X POST http://localhost:4000/api/import/leanix-migration`
2. Explore graph visualization
3. Try impact analysis queries

**Full Guide:** `poc-option-2/POC-README.md`

---

### Option 3: Custom Neo4j Solution

**Best For:** Maximum control, own IP, unique requirements, long-term strategic platform

```bash
# Navigate to POC directory
cd /Users/noppadon.s/GH/BMAD-METHOD/super-relativity/poc-option-3

# Start all services (note: more services = longer startup)
docker-compose up -d

# Wait 3-4 minutes, then access:
# - Web UI: http://localhost:3000
# - GraphQL API: http://localhost:4000/graphql
# - Neo4j Browser: http://localhost:7474 (neo4j / custom-poc-2025)
# - ML Service: http://localhost:5000
# - Grafana: http://localhost:3100 (admin / admin)
```

**First Steps:**
1. Load sample data → `curl -X POST http://localhost:3001/ingest/all`
2. Try ML-powered impact prediction → See README for API calls
3. Explore custom GraphQL queries

**Full Guide:** `poc-option-3/POC-README.md`

---

### Option 4: Backstage + Istio + Neo4j ⭐ NEW

**Best For:** Developer experience, microservices, Kubernetes environments, self-service

```bash
# Navigate to POC directory
cd /Users/noppadon.s/GH/BMAD-METHOD/super-relativity/poc-option-4

# Start all services
docker-compose up -d

# Wait 3-4 minutes, then access:
# - Backstage Portal: http://localhost:3000
# - Kiali (Service Mesh UI): http://localhost:20001
# - Jaeger (Tracing): http://localhost:16686
# - Grafana: http://localhost:3100 (admin / admin)
# - Prometheus: http://localhost:9090
# - Neo4j Browser: http://localhost:7474 (neo4j / backstage-poc-2025)
```

**First Steps:**
1. Open Backstage → Browse service catalog
2. Open Kiali → View service dependency graph (automatic discovery!)
3. Open Jaeger → View distributed traces
4. Try impact analysis combining Backstage + Istio data

**Full Guide:** `poc-option-4/POC-README.md`

---

### Option 5: Istio Service Mesh First 💰 LOWEST COST

**Best For:** Microservices-heavy, Kubernetes, lowest cost, runtime observability

```bash
# Navigate to POC directory
cd /Users/noppadon.s/GH/BMAD-METHOD/super-relativity/poc-option-5

# Start all services (includes 6 sample microservices)
docker-compose up -d

# Wait 3-4 minutes, then access:
# - Kiali (PRIMARY UI): http://localhost:20001
# - Jaeger (Tracing): http://localhost:16686
# - Grafana: http://localhost:3100 (admin / admin)
# - Prometheus: http://localhost:9090
# - GitLab: http://localhost:8080 (root / rootpassword)
# - Neo4j Browser: http://localhost:7474 (neo4j / mesh-poc-2025)
# - Query API: http://localhost:4000/graphql
```

**First Steps:**
1. **Start here:** Open Kiali → http://localhost:20001
2. View service graph (automatic discovery - zero configuration!)
3. Generate traffic → `curl -X POST http://localhost:4000/api/simulate-traffic`
4. Watch Kiali graph update in real-time
5. Click on a service → View metrics, traces, logs

**Full Guide:** `poc-option-5/POC-README.md`

---

## 🎯 Which Option Should You Try?

### Try This Quick Assessment:

**Question 1:** Do you have microservices on Kubernetes?
- **YES** → Try Option 4 or Option 5
- **NO** → Try Option 1 or Option 2

**Question 2:** What's more important?
- **Low risk** → Try Option 1
- **Low cost** → Try Option 5
- **Developer experience** → Try Option 4
- **Business portfolio management** → Try Option 1 or 2

**Still unsure?** Read `DECISION-GUIDE.md` for comprehensive guidance.

---

## 📊 POC Evaluation Checklist

Use this checklist while evaluating each POC:

### Functional Testing
- [ ] Load sample data successfully
- [ ] Query for dependencies (which services does X call?)
- [ ] Perform impact analysis (if I change X, what's affected?)
- [ ] View visualization/graph
- [ ] Test API performance with realistic data volume

### User Experience Testing
- [ ] Can developers find information easily?
- [ ] Can architects perform impact analysis quickly?
- [ ] Can business stakeholders understand the interface?
- [ ] Is the learning curve acceptable for your team?

### Technical Assessment
- [ ] Does it integrate with your existing tools?
- [ ] Can it scale to your application count (1000+)?
- [ ] Does it meet security/compliance requirements?
- [ ] How complex is ongoing maintenance?

### Business Assessment
- [ ] Calculate custom ROI with your metrics
- [ ] Assess 3-year TCO vs. budget
- [ ] Consider vendor lock-in risk
- [ ] Evaluate team skill gaps and training needs

---

## 🛠️ Common Commands

### Start POC
```bash
cd poc-option-X
docker-compose up -d
```

### View Logs
```bash
docker-compose logs -f [service-name]

# Examples:
docker-compose logs -f neo4j
docker-compose logs -f graphql-api
```

### Stop POC
```bash
docker-compose down
```

### Stop and Remove All Data
```bash
docker-compose down -v  # ⚠️ Removes all volumes/data
```

### Restart a Service
```bash
docker-compose restart [service-name]

# Example:
docker-compose restart neo4j
```

### Check Service Health
```bash
docker-compose ps
```

---

## 🐛 Troubleshooting

### Issue: Services Won't Start

**Symptom:** `docker-compose up` fails or services crash

**Solutions:**
```bash
# 1. Check Docker has enough resources
docker system df
docker system prune  # Free up space

# 2. Check ports aren't already in use
lsof -i :7474  # Check Neo4j port
lsof -i :3000  # Check UI port

# 3. Increase Docker memory (Docker Desktop → Settings → Resources)
# Recommended: 8GB minimum, 16GB ideal

# 4. Restart Docker Desktop
```

---

### Issue: Neo4j Browser Shows "No Connection"

**Symptom:** Can't connect to Neo4j at http://localhost:7474

**Solutions:**
```bash
# 1. Wait longer (Neo4j takes 1-2 minutes to start)
docker-compose logs -f neo4j

# 2. Check Neo4j is running
docker-compose ps neo4j

# 3. Verify credentials match docker-compose.yml
# Option 1: neo4j / super-relativity-2025
# Option 2: neo4j / ardoq-poc-2025
# Option 3: neo4j / custom-poc-2025
# Option 4: neo4j / backstage-poc-2025
# Option 5: neo4j / mesh-poc-2025
```

---

### Issue: GraphQL API Not Responding

**Symptom:** GraphQL Playground at http://localhost:4000 won't load

**Solutions:**
```bash
# 1. Check API is running
docker-compose ps | grep api

# 2. Check API logs for errors
docker-compose logs -f graphql-api

# 3. Verify Neo4j is ready (API depends on it)
docker-compose logs neo4j | grep "Started"

# 4. Restart API service
docker-compose restart graphql-api
```

---

### Issue: "Port Already in Use" Error

**Symptom:** `Error: bind: address already in use`

**Solutions:**
```bash
# Find what's using the port (example for port 7474)
lsof -i :7474
kill <PID>  # Kill the process if safe

# OR: Change ports in docker-compose.yml
# Example: Change "7474:7474" to "7475:7474"
```

---

### Issue: Sample Data Not Loading

**Symptom:** Neo4j is empty or queries return no results

**Solutions:**
```bash
# 1. Check if init scripts ran
docker-compose logs neo4j | grep -i "init"

# 2. Manually run init script
docker-compose exec neo4j cypher-shell -u neo4j -p <password> < poc-data/neo4j-init/01-create-schema.cypher

# 3. Check Neo4j Browser → Run: MATCH (n) RETURN count(n)
# Should see > 0 nodes
```

---

## 📈 Performance Optimization

### If POC is Running Slow

```bash
# 1. Allocate more memory to Docker
# Docker Desktop → Settings → Resources → Memory (set to 8GB+)

# 2. Reduce number of running services
# Comment out services you're not actively testing in docker-compose.yml

# 3. Use Docker's built-in cleanup
docker system prune -a  # ⚠️ Removes all unused images/containers

# 4. Check system resources
docker stats  # See which containers are using most resources
```

---

## 🎓 Next Steps After POC Evaluation

### 1. Compare Your Results

Use the scoring matrix in `POC-COMPARISON-EXPANDED.md`:

| Criteria | Weight | Option 1 Score | Option 4 Score | Option 5 Score |
|----------|--------|----------------|----------------|----------------|
| Cost | 20% | (Your score) | (Your score) | (Your score) |
| Risk | 25% | (Your score) | (Your score) | (Your score) |
| Features | 25% | (Your score) | (Your score) | (Your score) |
| Developer UX | 15% | (Your score) | (Your score) | (Your score) |
| Time to Value | 15% | (Your score) | (Your score) | (Your score) |

### 2. Pilot with Real Data

- Onboard 10-20 real applications to winning option
- Test with your actual Git repos, requirements, infrastructure
- Measure impact on team productivity
- Validate performance at realistic scale

### 3. Get Stakeholder Buy-In

- Present findings to executives
- Demo winning option to key stakeholders
- Show ROI calculation with your metrics
- Get budget approval for implementation

### 4. Plan Implementation

Follow the implementation timeline in chosen option's README:
- Option 1: 9-12 months to full scale
- Option 2: 6-9 months to full scale
- Option 3: 12-18 months to full scale
- Option 4: 9-12 months to full scale
- Option 5: 6-9 months to full scale

---

## 📞 Resources

### Documentation
- **Enterprise Research:** `ENTERPRISE-RESEARCH.md` - How Fortune 100 companies do this
- **Decision Guide:** `DECISION-GUIDE.md` - Interactive decision tree
- **Full Comparison:** `POC-COMPARISON-EXPANDED.md` - All 5 options compared
- **Completion Summary:** `RESEARCH-COMPLETION-SUMMARY.md` - What was delivered

### POC-Specific READMEs
- **Option 1:** `poc-option-1/POC-README.md`
- **Option 2:** `poc-option-2/POC-README.md`
- **Option 3:** `poc-option-3/POC-README.md`
- **Option 4:** `poc-option-4/POC-README.md` ⭐ NEW
- **Option 5:** `poc-option-5/POC-README.md` ⭐ NEW

### External Resources
- **Backstage:** https://backstage.io
- **Istio:** https://istio.io
- **Neo4j:** https://neo4j.com
- **LeanIX:** https://www.leanix.net
- **Ardoq:** https://www.ardoq.com

---

## 🎉 Quick Win: Option 5 in 5 Minutes

Want the fastest way to see automatic dependency discovery?

```bash
# 1. Start Option 5
cd poc-option-5
docker-compose up -d

# 2. Wait 3 minutes
sleep 180

# 3. Open Kiali
open http://localhost:20001

# 4. Navigate to Graph
# Click: Graph → Display → Traffic Animation: Every 1s

# 5. Generate traffic
curl -X POST http://localhost:4000/api/simulate-traffic

# 6. Watch the magic! ✨
# You'll see services and their dependencies appear automatically
# No configuration. No manual entry. Pure runtime truth.
```

**This is the future of architecture management.**

---

## ✅ Success Criteria

You'll know the POC was successful when you can:

### For Developers
- [ ] Find which services a specific service depends on
- [ ] Discover who owns a service
- [ ] Find API documentation quickly
- [ ] Understand impact of changing a service

### For Architects
- [ ] Perform impact analysis in <2 minutes
- [ ] Trace requirements to implementation
- [ ] Identify services handling sensitive data
- [ ] Generate architecture diagrams automatically

### For Business Stakeholders
- [ ] See which applications support business capabilities
- [ ] Assess compliance coverage
- [ ] Understand portfolio composition
- [ ] Plan application rationalization

---

## 🚀 Ready to Start?

Pick your first option and run it:

```bash
# Option 1 (lowest risk)
cd /Users/noppadon.s/GH/BMAD-METHOD/super-relativity/poc-option-1
docker-compose up -d

# Option 5 (lowest cost, most modern)
cd /Users/noppadon.s/GH/BMAD-METHOD/super-relativity/poc-option-5
docker-compose up -d
```

**Good luck! 🎯**

---

**Questions or issues?** Check the troubleshooting section above or refer to the detailed README for your chosen option.
