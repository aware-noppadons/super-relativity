# Quick Start Checklist for Production Integration

**For:** AI tools and developers working with real LeanIX and diagram data

**Time to complete:** 2-4 hours

---

## Prerequisites Check

Before starting, ensure you have:

- [ ] Access to actual LeanIX instance
- [ ] LeanIX API token with read permissions
- [ ] Access to architecture diagram files (PlantUML/Mermaid)
- [ ] Docker and Docker Compose installed
- [ ] Neo4j Browser access (for verification)
- [ ] Read all three guide documents:
  - `PRODUCTION-INTEGRATION-GUIDE.md`
  - `RELATIONSHIP-TYPE-DECISION-GUIDE.md`
  - `DATA-FORMAT-EXAMPLES.md`

---

## Phase 1: Environment Setup (15 minutes)

### 1.1 Start POC Environment

```bash
cd /path/to/poc-option-1

# Start all services
docker-compose up -d

# Verify services are running
docker-compose ps

# Check health
curl http://localhost:3001/health  # Sync service
curl http://localhost:3003/health  # Diagram parser
curl http://localhost:7474          # Neo4j browser
```

**Expected output:** All services should show "healthy" status.

### 1.2 Verify Neo4j Connection

```bash
# Connect to Neo4j
docker exec -it super-relativity-neo4j cypher-shell \
  -u neo4j -p super-relativity-2025

# Test query
neo4j> MATCH (n) RETURN labels(n)[0], count(*);

# Exit
neo4j> :exit
```

**Expected output:** Should show entity counts from mock data.

### 1.3 Test Mock Data Flow

```bash
# Trigger mock LeanIX sync
curl -X POST http://localhost:3001/api/sync/trigger

# Wait 5 seconds
sleep 5

# Verify relationships were created
docker exec super-relativity-neo4j cypher-shell \
  -u neo4j -p super-relativity-2025 \
  "MATCH ()-[r]->() WHERE r.syncedAt IS NOT NULL RETURN count(r)"
```

**Expected output:** Should return ~141 relationships (from mock LeanIX).

---

## Phase 2: LeanIX Data Exploration (30 minutes)

### 2.1 Get Sample Data from Real LeanIX

Create test GraphQL query:

```bash
# Save as test-leanix-query.json
cat > test-leanix-query.json <<'EOF'
{
  "query": "{ allFactSheets(first: 5, factSheetType: Application) { edges { node { id displayName description type } } } }"
}
EOF

# Test against real LeanIX
curl -X POST \
  "https://YOUR-INSTANCE.leanix.net/services/pathfinder/v1/graphql" \
  -H "Authorization: Bearer YOUR-TOKEN-HERE" \
  -H "Content-Type: application/json" \
  -d @test-leanix-query.json \
  | jq . > sample-leanix-apps.json
```

**Action:** Save this sample for analysis.

### 2.2 Compare Data Formats

Open `sample-leanix-apps.json` and compare with mock format in `DATA-FORMAT-EXAMPLES.md`.

**Check:**
- [ ] ID format (UUID vs APP-XXX)
- [ ] Field names (`displayName` vs `name`)
- [ ] Nested structures (`responsible.email` vs `owner`)
- [ ] Array fields (tags, relationships)

**Document differences:** Create notes file:

```bash
cat > leanix-format-differences.md <<'EOF'
# LeanIX Format Differences Found

## Applications
- ID format: UUID (need to convert to APP-XXXXXXXX)
- Owner: nested in `responsible.email`
- Lifecycle: nested in `lifecycle.phases[0].phase`

## Components
- Type: "ITComponent" (map to "Component")
- Relationships: embedded in `relToChild` edges

## Next steps:
1. Update transformation functions in sync-service/leanix-client.js
2. Add ID normalization
3. Test with small batch
EOF
```

### 2.3 Test Relationship Extraction

```bash
# Query for entity with relationships
cat > test-leanix-with-rels.json <<'EOF'
{
  "query": "{ allFactSheets(first: 1, factSheetType: Application) { edges { node { id displayName relToChild { edges { node { factSheet { id displayName type } type } } } } } } }"
}
EOF

curl -X POST \
  "https://YOUR-INSTANCE.leanix.net/services/pathfinder/v1/graphql" \
  -H "Authorization: Bearer YOUR-TOKEN-HERE" \
  -H "Content-Type: application/json" \
  -d @test-leanix-with-rels.json \
  | jq . > sample-leanix-relationships.json
```

**Check:** How are relationships structured? Embedded or separate?

---

## Phase 3: Update Sync Service (45 minutes)

### 3.1 Backup Current Code

```bash
cp poc-services/sync-service/leanix-client.js \
   poc-services/sync-service/leanix-client.js.backup
```

### 3.2 Update LeanIX Connection

Edit `poc-services/sync-service/leanix-client.js`:

```javascript
// Add at top
const LEANIX_URL = process.env.LEANIX_URL || 'https://YOUR-INSTANCE.leanix.net';
const LEANIX_TOKEN = process.env.LEANIX_TOKEN;

// Update fetchApplications() function
async function fetchApplications() {
  const query = `
    query {
      allFactSheets(factSheetType: Application) {
        edges {
          node {
            id
            displayName
            description
            responsible {
              email
              displayName
            }
            lifecycle {
              asString
              phases {
                phase
                startDate
              }
            }
          }
        }
      }
    }
  `;

  const response = await fetch(`${LEANIX_URL}/services/pathfinder/v1/graphql`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${LEANIX_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query })
  });

  if (!response.ok) {
    throw new Error(`LeanIX API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  if (data.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
  }

  // Transform from LeanIX format to internal format
  return data.data.allFactSheets.edges.map(e => transformLeanIXApplication(e.node));
}

// Add transformation function
function transformLeanIXApplication(lxApp) {
  return {
    id: `APP-${lxApp.id.substring(0, 8)}`,
    originalId: lxApp.id,
    name: lxApp.displayName,
    description: lxApp.description || '',
    owner: lxApp.responsible?.email,
    ownerName: lxApp.responsible?.displayName,
    status: lxApp.lifecycle?.asString || 'unknown',
    lifecyclePhase: lxApp.lifecycle?.phases?.[0]?.phase,
    type: 'Application',
    source: 'leanix'
  };
}
```

### 3.3 Add Environment Variables

Edit `docker-compose.yml`:

```yaml
sync-service:
  environment:
    - LEANIX_URL=https://YOUR-INSTANCE.leanix.net
    - LEANIX_TOKEN=${LEANIX_TOKEN}  # Set in .env file
```

Create `.env` file:

```bash
cat > .env <<'EOF'
LEANIX_TOKEN=your-actual-api-token-here
EOF
```

### 3.4 Test with Small Batch

```bash
# Rebuild sync service
docker-compose build sync-service
docker-compose restart sync-service

# Clear Neo4j
docker exec super-relativity-neo4j cypher-shell \
  -u neo4j -p super-relativity-2025 \
  "MATCH (n) WHERE n.syncedAt IS NOT NULL DETACH DELETE n"

# Trigger sync
curl -X POST http://localhost:3001/api/sync/trigger

# Check logs
docker-compose logs sync-service --tail 50

# Verify in Neo4j
docker exec super-relativity-neo4j cypher-shell \
  -u neo4j -p super-relativity-2025 \
  "MATCH (a:Application) WHERE a.syncedAt IS NOT NULL RETURN a.id, a.name, a.originalId LIMIT 10"
```

**Expected:** Should see real applications with UUID original IDs.

---

## Phase 4: Diagram Parser Setup (30 minutes)

### 4.1 Locate Diagram Files

Find your PlantUML/Mermaid diagram files:

```bash
# Example locations
/path/to/architecture-docs/diagrams/
/path/to/confluence-exports/
/path/to/design-docs/c4-models/
```

**Document:** Create inventory:

```bash
find /path/to/diagrams -type f \( -name "*.puml" -o -name "*.md" \) > diagram-inventory.txt
wc -l diagram-inventory.txt
```

### 4.2 Analyze Diagram Format

Pick 3 representative diagram files and check format:

```bash
# Check for PlantUML blocks
grep -l "@startuml" /path/to/diagrams/*.md

# Check for C4 syntax
grep -l "System\|Container\|Component" /path/to/diagrams/*.puml
```

**Compare with:** `/poc-data/sample-diagrams/context-diagrams/` examples.

### 4.3 Test Parser with One File

```bash
# Copy one real diagram to test location
cp /path/to/diagrams/your-diagram.md /path/to/poc-option-1/poc-data/sample-diagrams/test/

# Parse it
curl -X POST http://localhost:3003/api/parse/context-diagram \
  -H "Content-Type: application/json" \
  -d "{\"content\": \"$(cat /path/to/diagrams/your-diagram.md | sed 's/"/\\"/g')\", \"fileName\": \"your-diagram.md\"}"

# Check results
docker exec super-relativity-neo4j cypher-shell \
  -u neo4j -p super-relativity-2025 \
  "MATCH ()-[r]->() WHERE r.diagramFile = 'your-diagram.md' RETURN type(r), count(*)"
```

**Expected:** Should see parsed relationships.

### 4.4 Update Parser for Real Format

If format differs, update `context-diagram-parser.js`:

```bash
# Edit parser
code poc-services/diagram-parser/context-diagram-parser.js

# Add new regex patterns as shown in DATA-FORMAT-EXAMPLES.md

# Rebuild
docker-compose build diagram-parser
docker-compose restart diagram-parser

# Re-test
```

---

## Phase 5: Data Quality Verification (30 minutes)

### 5.1 Run Entity Count Checks

```cypher
// In Neo4j Browser (http://localhost:7474)

// Count entities by source
MATCH (n)
RETURN
  CASE
    WHEN n.syncedAt IS NOT NULL THEN 'LeanIX'
    WHEN n.diagramFile IS NOT NULL THEN 'Diagrams'
    ELSE 'Other'
  END as source,
  labels(n)[0] as type,
  count(*) as count
ORDER BY source, count DESC;
```

**Expected:** Should see entities from both sources.

### 5.2 Validate Relationships

```cypher
// Count relationships by source and type
MATCH ()-[r]->()
RETURN
  CASE
    WHEN r.syncedAt IS NOT NULL THEN 'LeanIX'
    WHEN r.diagramFile IS NOT NULL THEN 'Diagrams'
    ELSE 'Other'
  END as source,
  type(r) as relType,
  count(*) as count
ORDER BY source, count DESC;

// Check for invalid relationships
MATCH ()-[r]->()
WHERE r.mode IS NOT NULL
  AND NOT r.mode IN ['pushes', 'pulls', 'bidirectional']
RETURN type(r), r.mode, count(*) as violations;

// Check for missing rw on WORKS_ON
MATCH ()-[r:WORKS_ON]->()
WHERE r.rw IS NULL
RETURN count(*) as missingRw;
```

**Action:** Fix any violations found.

### 5.3 Compare Counts

```bash
# Count from LeanIX
curl -s "https://YOUR-INSTANCE.leanix.net/services/pathfinder/v1/graphql" \
  -H "Authorization: Bearer $LEANIX_TOKEN" \
  -d '{"query": "{ allFactSheets(factSheetType: Application) { totalCount } }"}' \
  | jq '.data.allFactSheets.totalCount'

# Count from Neo4j
docker exec super-relativity-neo4j cypher-shell \
  -u neo4j -p super-relativity-2025 \
  "MATCH (a:Application) WHERE a.syncedAt IS NOT NULL RETURN count(a)" \
  --format plain | tail -1
```

**Expected:** Counts should match (or be close if pagination/filtering differs).

---

## Phase 6: Full Sync Run (30 minutes)

### 6.1 Clear All Data

```bash
docker exec super-relativity-neo4j cypher-shell \
  -u neo4j -p super-relativity-2025 \
  "MATCH (n) DETACH DELETE n"
```

### 6.2 Run Full LeanIX Sync

```bash
# Trigger sync
curl -X POST http://localhost:3001/api/sync/trigger

# Monitor progress
docker-compose logs -f sync-service
```

**Watch for:**
- Errors or warnings
- Number of entities/relationships synced
- Sync duration

### 6.3 Run Full Diagram Parse

```bash
# If diagrams are mounted in docker-compose.yml
curl -X POST http://localhost:3003/api/parse/context-diagrams \
  -H "Content-Type: application/json" \
  -d '{"directoryPath": "/diagrams"}'

# Monitor
docker-compose logs -f diagram-parser
```

### 6.4 Final Verification

```cypher
// Total counts
MATCH (n) RETURN labels(n)[0], count(*);

MATCH ()-[r]->() RETURN type(r), count(*);

// Verify data separation
MATCH ()-[r]->()
RETURN
  CASE
    WHEN r.syncedAt IS NOT NULL THEN 'LeanIX'
    WHEN r.diagramFile IS NOT NULL THEN 'Diagrams'
    ELSE 'Other'
  END as source,
  type(r) as relType,
  count(*) as count
ORDER BY source, relType;
```

---

## Phase 7: GraphQL API Testing (15 minutes)

### 7.1 Test Basic Queries

```bash
# Open GraphQL Playground
open http://localhost:4000/graphql

# Test query:
query {
  applications(limit: 5) {
    id
    name
    description
    components {
      id
      name
    }
  }
}
```

### 7.2 Test Relationship Queries

```graphql
query {
  application(id: "APP-XXXXXXXX") {
    id
    name
    components {
      id
      name
      dataObjects {
        id
        name
      }
    }
    capabilities {
      id
      name
    }
  }
}
```

---

## Troubleshooting Checklist

If something doesn't work:

### Issue: LeanIX Sync Fails

- [ ] Check API token validity
- [ ] Verify network connectivity to LeanIX
- [ ] Check GraphQL query syntax
- [ ] Review sync-service logs
- [ ] Test with smaller query (first: 10)

### Issue: Diagrams Not Parsing

- [ ] Check file format (@startuml present)
- [ ] Verify directory path in docker-compose.yml
- [ ] Check file permissions (readable)
- [ ] Test with sample diagram first
- [ ] Review diagram-parser logs

### Issue: Duplicate Entities

- [ ] Check MERGE vs CREATE in Neo4j queries
- [ ] Verify ID normalization consistency
- [ ] Run deduplication script

### Issue: Missing Relationships

- [ ] Check relationship type inference
- [ ] Verify source/target entities exist
- [ ] Check for typos in entity IDs
- [ ] Review relationship description patterns

### Issue: Wrong Relationship Types

- [ ] Review RELATIONSHIP_PATTERNS in context-diagram-parser.js
- [ ] Check RELATIONSHIP-TYPE-DECISION-GUIDE.md
- [ ] Add new patterns if needed
- [ ] Re-parse diagrams after fixes

---

## Success Criteria

You've successfully integrated production data when:

- [ ] LeanIX sync completes without errors
- [ ] Application count in Neo4j matches LeanIX
- [ ] Diagrams are parsed successfully
- [ ] Relationships have correct MASTER-PATTERNS types
- [ ] All WORKS_ON relationships have rw property
- [ ] No relationship type violations
- [ ] GraphQL API returns correct data
- [ ] Data lineage is preserved (source attribution)

---

## Next Steps After Integration

1. **Performance Optimization**
   - Add pagination for large datasets
   - Implement incremental sync
   - Add caching where appropriate

2. **Monitoring**
   - Set up health checks
   - Add logging/metrics
   - Create alerts for sync failures

3. **Documentation**
   - Document any adaptations made
   - Update transformation functions
   - Create runbook for operations

4. **Testing**
   - Add integration tests
   - Test with full dataset
   - Verify data quality over time

---

## Quick Reference Commands

```bash
# Restart everything
docker-compose restart

# View logs
docker-compose logs -f [service-name]

# Clear Neo4j data
docker exec super-relativity-neo4j cypher-shell -u neo4j -p super-relativity-2025 \
  "MATCH (n) DETACH DELETE n"

# Trigger LeanIX sync
curl -X POST http://localhost:3001/api/sync/trigger

# Parse diagrams
curl -X POST http://localhost:3003/api/parse/context-diagrams \
  -H "Content-Type: application/json" \
  -d '{"directoryPath": "/diagrams"}'

# Count entities
docker exec super-relativity-neo4j cypher-shell -u neo4j -p super-relativity-2025 \
  "MATCH (n) RETURN labels(n)[0], count(*)"

# Count relationships by source
docker exec super-relativity-neo4j cypher-shell -u neo4j -p super-relativity-2025 \
  "MATCH ()-[r]->() RETURN CASE WHEN r.syncedAt IS NOT NULL THEN 'LeanIX' WHEN r.diagramFile IS NOT NULL THEN 'Diagrams' ELSE 'Other' END as source, count(*)"
```

---

**END OF QUICK START CHECKLIST**

*Complete all phases in order. Don't skip verification steps. Document any issues or adaptations made.*
