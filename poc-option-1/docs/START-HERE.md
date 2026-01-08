# START HERE - Production Integration Entry Point

**For AI tools/developers integrating real LeanIX and diagram data**

---

## Your Mission

Integrate **real production data** into this Super Relativity POC by:
1. Connecting to actual LeanIX instance (replacing mock data)
2. Parsing real architecture diagrams (PlantUML/Mermaid files)
3. Ensuring clean data source separation with MASTER-PATTERNS v2.0 compliance

---

## Quick Context (What's Already Built)

This POC demonstrates **data source separation** between:
- **LeanIX**: Business-level relationships (ownership, capabilities, lifecycle)
- **Diagrams**: Technical relationships (API calls, data access, component structure)

All code is working with **mock data**. Your job is to adapt it for **real data**.

---

## Critical Reading Order (30 minutes)

Read these **4 documents** in this exact order:

### 1. QUICK-START-CHECKLIST.md (START HERE)
**Purpose**: Step-by-step execution guide (7 phases, 2-4 hours)
**Read first**: Phases 1-3 to understand the workflow
**Action**: Follow phase-by-phase as you work

### 2. PRODUCTION-INTEGRATION-GUIDE.md
**Purpose**: Deep architecture understanding and adaptation strategies
**Focus on**:
- Section 2 (Data Source Separation) - understand the philosophy
- Section 3 (LeanIX Integration) - your main coding work
- Section 4 (Diagram Parser) - adaptation for your diagram formats

### 3. DATA-FORMAT-EXAMPLES.md
**Purpose**: Mock vs Real data format transformations
**Use when**: Writing transformation functions in sync-service
**Key sections**: LeanIX transformations, PlantUML/Mermaid variations

### 4. RELATIONSHIP-TYPE-DECISION-GUIDE.md
**Purpose**: Choose correct MASTER-PATTERNS relationship types
**Use when**: Unsure which relationship type to use
**Reference**: Decision tree flowchart and quick lookup table

---

## Your First 3 Steps (Start Immediately)

### Step 1: Verify Environment (5 min)
```bash
cd /path/to/poc-option-1

# Start services
docker-compose up -d

# Verify health
curl http://localhost:3001/health  # Should return {"status":"healthy"}
curl http://localhost:7474          # Should open Neo4j Browser
```

**If services fail**: Check Docker, Docker Compose installation

### Step 2: Test with Mock Data (10 min)
```bash
# Trigger mock sync
curl -X POST http://localhost:3001/api/sync/trigger

# Wait 5 seconds
sleep 5

# Verify in Neo4j
docker exec super-relativity-neo4j cypher-shell \
  -u neo4j -p super-relativity-2025 \
  "MATCH (n) RETURN labels(n)[0], count(*)"
```

**Expected output**: Should show Applications, Components, DataObjects, BusinessCapabilities

**If this fails**: Environment is broken. Fix before proceeding.

### Step 3: Open QUICK-START-CHECKLIST.md and Begin Phase 2
```bash
# Now you know the POC works with mock data
# Time to integrate real data
# Follow QUICK-START-CHECKLIST.md Phase 2: "LeanIX Data Exploration"
```

---

## Critical Gotchas (Read This!)

### 1. Real LeanIX Format is Different
Mock data uses simplified format:
```json
{"id": "APP-001", "name": "My App", "owner": "john@example.com"}
```

Real LeanIX uses nested format:
```json
{
  "id": "uuid-here",
  "displayName": "My App",
  "responsible": {
    "email": "john@example.com"
  }
}
```

**Solution**: See DATA-FORMAT-EXAMPLES.md Section 2.1 for transformation code

### 2. Relationship Types Must Follow MASTER-PATTERNS v2.0
Not all relationships are equal. Use the decision guide:
- Application → BusinessCapability = `IMPLEMENTS`
- Component → DataObject = `WORKS_ON` (with `rw` property!)
- Application → Application = `CALLS` (with `mode` property)

**Wrong types will break queries!**

**Solution**: Use RELATIONSHIP-TYPE-DECISION-GUIDE.md

### 3. Source Attribution is Mandatory
Every relationship MUST have either:
- `syncedAt` property (from LeanIX sync)
- `diagramFile` property (from diagram parsing)

**This is how we separate data sources!**

### 4. Docker Container Caching
If you rebuild a service and it still shows old behavior:
```bash
# Full reset
docker-compose build [service-name]
docker-compose restart [service-name]  # CRITICAL: Must restart!

# If still broken
docker-compose down
docker-compose up -d
```

---

## What Success Looks Like

When you're done, this query should show clean separation:

```cypher
// In Neo4j Browser
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
```

**Expected**: Two clear groups - LeanIX (business) and Diagrams (technical)
**Red flag**: Many "Other" relationships (missing source attribution)

---

## If You Get Stuck

### "LeanIX sync fails with 401/403"
- Check API token validity
- Verify token has read permissions
- Test token with curl first (see QUICK-START Phase 2.1)

### "Diagrams not parsing"
- Verify PlantUML format (@startuml present?)
- Check file is readable (permissions)
- Test with single diagram first
- Compare format with DATA-FORMAT-EXAMPLES.md Section 3

### "Wrong relationship types"
- Use RELATIONSHIP-TYPE-DECISION-GUIDE.md decision tree
- Check description keywords
- Verify mode and rw properties set correctly

### "Duplicate entities"
- Check ID normalization (UUIDs → APP-XXXXXXXX)
- Verify MERGE vs CREATE in Neo4j queries
- See PRODUCTION-INTEGRATION-GUIDE.md Section 6.1

---

## Suggested Prompt for AI Tools

If you're an AI tool starting this work, here's what you should do:

```
I need to integrate production LeanIX and diagram data into the Super Relativity POC.

I have read:
- START-HERE.md (this document)
- QUICK-START-CHECKLIST.md (skimmed phases)

I have access to:
- LeanIX instance at https://[INSTANCE].leanix.net
- LeanIX API token: [TOKEN]
- Architecture diagram files at: [PATH]

Please help me:
1. Start with Phase 1 (Environment Setup) from QUICK-START-CHECKLIST.md
2. Proceed through phases 2-7 systematically
3. Adapt transformation code for my real LeanIX format
4. Parse my diagram files correctly
5. Verify data quality and MASTER-PATTERNS compliance

Let me know when you need me to provide sample data or clarify formats.
```

---

## Time Estimates

- **Environment setup**: 15 minutes
- **LeanIX exploration**: 30 minutes
- **Sync service updates**: 45 minutes
- **Diagram parser setup**: 30 minutes
- **Data quality verification**: 30 minutes
- **Full sync run**: 30 minutes
- **GraphQL testing**: 15 minutes

**Total**: 2-4 hours (depending on format differences)

---

## Files You'll Edit

You will primarily work in these files:

1. **`/poc-services/sync-service/leanix-client.js`**
   - Update GraphQL queries for real LeanIX schema
   - Add transformation functions
   - Handle pagination if needed

2. **`/poc-services/diagram-parser/context-diagram-parser.js`**
   - May need to adjust regex patterns for your diagram format
   - Add new RELATIONSHIP_PATTERNS if needed

3. **`/docker-compose.yml`**
   - Add environment variables (LEANIX_URL, LEANIX_TOKEN)
   - Mount diagram directories if needed

4. **`/.env`** (create this)
   - Store sensitive credentials (API tokens)

---

## Ready to Start?

1. Open QUICK-START-CHECKLIST.md
2. Start with Phase 1: Environment Setup
3. Follow phases sequentially
4. Reference other guides as needed
5. Come back here if you get lost

**Good luck!**

---

**Created**: 2026-01-08
**POC Location**: `/Users/noppadon.s/GH/super-relativity/poc-option-1/`
**Documentation**: `/poc-option-1/docs/`
