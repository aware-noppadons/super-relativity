# Graph Visualization Implementation

**Three libraries, side-by-side comparison for hierarchical graph visualization**

## Overview

This implementation provides three different graph visualization approaches using popular JavaScript libraries: Reactflow, Cytoscape.js, and vis.js Network. All three render the same hierarchical data model showing relationships from BusinessCapability → DataObject → Component → Server.

## Quick Start

### Access the Visualizations

1. **Start the services:**
   ```bash
   docker-compose up
   ```

2. **Open the web UI:**
   ```
   http://localhost:3000
   ```

3. **Navigate to Graph Visualization:**
   - Click "Graph Visualization" button in the navigation
   - Or directly visit: `http://localhost:3000/graph`

### Available URLs

| Library | URL | Description |
|---------|-----|-------------|
| **Comparison** | `/graph` | Side-by-side comparison page |
| **Reactflow** | `/graph/reactflow` | Native React implementation |
| **Cytoscape.js** | `/graph/cytoscape` | Advanced graph analysis |
| **vis.js Network** | `/graph/visnetwork` | Easy-to-use network viz |

## Features

### All Three Implementations Include:

- ✅ **Hierarchical Layout**: 4-level hierarchy (L0: BusinessCapability, L1: DataObject, L2: Component, L3: Server)
- ✅ **Collapse/Expand**: Click/double-click nodes to show/hide children
- ✅ **Color Coding**: Different colors for each node type
- ✅ **Interactive**: Pan, zoom, hover tooltips
- ✅ **Same Data**: All use identical sample data for fair comparison

### Interaction Guide

| Library | Collapse/Expand | Highlight | Pan/Zoom |
|---------|----------------|-----------|----------|
| **Reactflow** | Click node with ▼ | Auto | Drag / Scroll |
| **Cytoscape.js** | Click node | Hover | Drag / Scroll |
| **vis.js Network** | Double-click node | Single-click | Drag / Scroll + Nav buttons |

## Implementation Details

### Directory Structure

```
poc-services/web-ui/src/
├── components/
│   └── visualizations/
│       ├── ReactflowGraph.jsx       # Reactflow implementation
│       ├── CytoscapeGraph.jsx       # Cytoscape.js implementation
│       └── VisNetworkGraph.jsx      # vis.js Network implementation
├── pages/
│   ├── GraphComparison.jsx          # Comparison landing page
│   ├── ReactflowPage.jsx            # Reactflow page wrapper
│   ├── CytoscapePage.jsx            # Cytoscape page wrapper
│   └── VisNetworkPage.jsx           # vis.js page wrapper
└── App.js                           # Updated with routing
```

### Dependencies

```json
{
  "reactflow": "^11.11.4",
  "cytoscape": "^3.33.1",
  "cytoscape-dagre": "^2.5.0",
  "vis-network": "^10.0.2",
  "react-router-dom": "^6.x"
}
```

### Sample Data Structure

All three implementations use the same hierarchical data:

```
Payment Processing (BusinessCapability)
├─ PaymentTransactionTable (DataObject - PCI)
│  ├─ Payment Gateway (Component - Node.js)
│  │  ├─ api-prod-01 (Server - prod)
│  │  └─ api-prod-02 (Server - prod)
│  ├─ Card Validator (Component - Java)
│  │  └─ api-prod-03 (Server - prod)
│  └─ Fraud Detection (BusinessCapability - High)
├─ PaymentAuditLog (DataObject - Standard)
│  └─ Audit Processor (Component - Python)
│     └─ db-prod-01 (Server - prod)
└─ CustomerPaymentCache (DataObject - PII)
   └─ Cache Manager (Component - Redis)
      └─ cache-prod-01 (Server - prod)
```

## Color Scheme

Consistent across all implementations:

- 🟢 **BusinessCapability**: Green (#4CAF50)
- 🔵 **DataObject**: Blue (#2196F3)
- 🟠 **Component**: Orange (#FF9800)
- 🟣 **Server**: Purple (#9C27B0)

## Library Comparison

### Reactflow ⭐ **RECOMMENDED**

**Best for:** Modern React applications

**Pros:**
- Native React integration
- TypeScript support
- Custom React components for nodes
- Excellent documentation
- Active development

**Cons:**
- Newer library (smaller ecosystem)
- Less mature than Cytoscape

**Code Example:**
```javascript
import ReactflowGraph from './components/visualizations/ReactflowGraph';

<ReactflowGraph />
```

### Cytoscape.js

**Best for:** Complex graph operations and analysis

**Pros:**
- Powerful graph algorithms
- Compound nodes (native parent-child)
- Large ecosystem
- Battle-tested
- Extensive customization

**Cons:**
- Steeper learning curve
- Not React-native (requires wrapper)
- More complex API

**Code Example:**
```javascript
import CytoscapeGraph from './components/visualizations/CytoscapeGraph';

<CytoscapeGraph />
```

### vis.js Network

**Best for:** Quick prototypes and simple visualizations

**Pros:**
- Very easy to get started
- Good documentation
- Built-in hierarchical layout
- Physics simulations
- Navigation controls

**Cons:**
- Less flexible than others
- Not React-native
- Limited customization

**Code Example:**
```javascript
import VisNetworkGraph from './components/visualizations/VisNetworkGraph';

<VisNetworkGraph />
```

## Customization

### Connecting to Real Data

All three implementations currently use sample data generated in `createSampleData()`. To connect to real Neo4j data:

1. **Add GraphQL query** in your page component
2. **Transform data** to the library's format
3. **Pass data** to the graph component

Example for Reactflow:

```javascript
// In ReactflowPage.jsx
import { useQuery, gql } from '@apollo/client';

const GET_GRAPH_DATA = gql`
  query GetPaymentProcessingGraph {
    businessCapability(name: "Payment Processing") {
      id name criticality
      creates { id name sensitivity }
      # ... rest of query
    }
  }
`;

function ReactflowPage() {
  const { data } = useQuery(GET_GRAPH_DATA);

  return (
    <ReactflowGraph data={data} />
  );
}
```

### Styling

Each implementation has its own styling approach:

**Reactflow:** React component styles (inline or CSS-in-JS)
**Cytoscape:** JSON stylesheet configuration
**vis.js:** Options object with groups configuration

See the component files for detailed styling examples.

## Performance

All three libraries handle the sample dataset well. For larger graphs:

**Reactflow:** Excellent performance up to 1000+ nodes
**Cytoscape:** Excellent performance with graph algorithms
**vis.js:** Good performance up to 500 nodes

## Troubleshooting

### Build Issues

If you encounter build errors:

```bash
cd poc-services/web-ui
rm -rf node_modules package-lock.json
npm config set strict-ssl false
npm install
```

### Docker Build

```bash
docker-compose build --no-cache web-ui
docker-compose up web-ui
```

### CSS Import Issues

Ensure CSS imports are present:
- Reactflow: `import 'reactflow/dist/style.css';`
- vis.js: `import 'vis-network/styles/vis-network.css';`

## Next Steps

1. **Connect to real data**: Replace `createSampleData()` with GraphQL queries
2. **Add filters**: Implement filtering by environment, sensitivity, criticality
3. **Export functionality**: Add export to image/PDF
4. **Search**: Add node search and highlighting
5. **Path highlighting**: Click two nodes to show path between them
6. **Real-time updates**: Subscribe to GraphQL mutations for live updates

## Resources

### Documentation
- **Reactflow**: https://reactflow.dev/
- **Cytoscape.js**: https://js.cytoscape.org/
- **vis.js Network**: https://visjs.github.io/vis-network/

### Examples
- **Reactflow Examples**: https://reactflow.dev/examples
- **Cytoscape Demos**: https://js.cytoscape.org/demos/
- **vis.js Examples**: https://visjs.github.io/vis-network/examples/

### This Project
- **Full Guide**: `GRAPH-VISUALIZATION-GUIDE.md`
- **Quick Start**: `VISUALIZATION-QUICKSTART.md`
- **Query Examples**: `QUERY-EXAMPLES.md`
- **Sample Queries**: `SAMPLE-QUERIES.md`

## Support

For questions or issues:
1. Check the library documentation (links above)
2. Review the implementation files in `src/components/visualizations/`
3. See the full guide: `GRAPH-VISUALIZATION-GUIDE.md`

---

**Built for Super Relativity POC**
*Enterprise Architecture Relationship Discovery Platform*
