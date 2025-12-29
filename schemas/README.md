# Super Relativity JSON Schemas

This directory contains JSON Schema definitions for all entity types in the Super Relativity knowledge graph.

## Purpose

These schemas enable:
- **Automated validation** of converted data
- **AI tool integration** for parsing and conversion
- **IDE autocomplete** when writing conversion scripts
- **Documentation generation** for entity structures
- **Type checking** in development tools

## Schema Files

| Schema | File | Description |
|--------|------|-------------|
| Application | `application.schema.json` | Applications and services |
| Business Capability | `capability.schema.json` | Business capabilities and processes |
| Requirement | `requirement.schema.json` | Requirements and user stories |
| Data Object | `data-object.schema.json` | Databases, tables, data stores |
| Infrastructure | `server.schema.json` | Servers, VMs, containers |
| Relationship | `relationship.schema.json` | Entity relationships |

## Usage

### Validation with JSON Schema Validator

```bash
npm install -g ajv-cli

# Validate an application entity
ajv validate -s schemas/application.schema.json -d my-application.json

# Validate multiple entities
ajv validate -s schemas/application.schema.json -d "applications/*.json"
```

### Python Validation

```python
import json
import jsonschema

# Load schema
with open('schemas/application.schema.json') as f:
    schema = json.load(f)

# Load data
with open('my-application.json') as f:
    data = json.load(f)

# Validate
try:
    jsonschema.validate(instance=data, schema=schema)
    print("Valid!")
except jsonschema.ValidationError as e:
    print(f"Validation error: {e.message}")
```

### JavaScript/TypeScript Validation

```javascript
const Ajv = require('ajv');
const schema = require('./schemas/application.schema.json');

const ajv = new Ajv();
const validate = ajv.compile(schema);

const data = {
  id: "APP-123",
  name: "Customer Portal",
  type: "Web Application"
};

const valid = validate(data);
if (!valid) {
  console.log(validate.errors);
}
```

### TypeScript Type Generation

Generate TypeScript types from JSON Schema:

```bash
npm install -g json-schema-to-typescript

# Generate TypeScript types
json-schema-to-typescript schemas/application.schema.json > types/Application.ts
```

## Schema Structure

All schemas follow this pattern:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://super-relativity.example.com/schemas/{entity}.json",
  "title": "Super Relativity {Entity}",
  "description": "Schema for {entity} entities",
  "type": "object",
  "required": ["id", "name", ...],
  "properties": {
    "id": {
      "type": "string",
      "pattern": "^{PREFIX}-[0-9]+$"
    },
    ...
  },
  "additionalProperties": false
}
```

## ID Patterns

| Entity Type | ID Pattern | Example |
|-------------|------------|---------|
| Application | `^APP-[0-9]+$` | APP-123 |
| Capability | `^CAP-[0-9]+$` | CAP-042 |
| Requirement | `^REQ-[0-9]+$` | REQ-001 |
| Data Object | `^DATA-[0-9]+$` | DATA-789 |
| Server | `^SRV-[0-9]+$` | SRV-015 |
| Component | `^COMP-[0-9]+$` | COMP-008 |

## Enum Values

### Common Enums Across Schemas

**Status** (Applications, Servers):
- Active
- Development
- Deprecated
- Retired
- Planned

**Lifecycle** (Applications):
- Plan
- Build
- Run
- Retire

**Criticality** (Applications, Capabilities):
- Critical
- High
- Medium
- Low

**Environment** (Servers):
- Production
- Staging
- Development
- QA
- UAT
- DR

**Sensitivity** (Data Objects):
- Public
- Internal
- Confidential
- PII
- Restricted

## Required vs Optional Fields

### Always Required
- `id` - Unique identifier
- `name` - Entity name
- `type` - Entity type/classification

### Entity-Specific Required
- **Application**: type
- **Capability**: level
- **Requirement**: type, priority
- **Server**: environment

### Always Optional
- `description` - Detailed description
- `source` - Data source origin
- `lastSyncedAt` - Sync timestamp

## Additional Properties

All schemas have `"additionalProperties": false` to ensure strict validation and prevent typos.

## Validation Examples

### Valid Application Entity

```json
{
  "id": "APP-123",
  "name": "Customer Portal",
  "type": "Web Application",
  "status": "Active",
  "lifecycle": "Run",
  "businessCriticality": "High",
  "techStack": ["React", "Node.js"],
  "owner": "CX Team"
}
```

✅ Valid - has all required fields and valid enum values

### Invalid Application Entity

```json
{
  "id": "123",
  "name": "Customer Portal",
  "type": "Web App",
  "status": "Production"
}
```

❌ Invalid - Issues:
1. `id` doesn't match pattern (should be APP-123)
2. `type` is not a valid enum value (should be "Web Application")
3. `status` is not a valid enum value (should be "Active")

## Integration with AI Conversion Guide

These schemas are referenced in `AI_CONVERSION_GUIDE.md` for:
1. Automated validation of AI-converted data
2. Field mapping rules
3. Enum value normalization
4. Required field detection

## Updates

When adding new entity types or modifying existing schemas:

1. Update the schema file
2. Update this README
3. Update AI_CONVERSION_GUIDE.md
4. Update DATA_SOURCES_AND_FORMATS.md
5. Regenerate TypeScript types if used
6. Update validation tests

---

**Last Updated**: 2025-12-29
**Schema Version**: 1.0
**JSON Schema Spec**: Draft 07
