# Graph Visualization Quick Start

**TL;DR: How to render your Neo4j graph queries with hierarchical layout and collapse/expand**

## The Problem

You have a Cypher query like this:
```cypher
MATCH (b:BusinessCapability {name:"Payment Processing"})-[rr]->(dd:DataObject)
MATCH (dd)<-[]->(dependants:BusinessCapability|Component)
OPTIONAL MATCH (dependants)-[]-(server:Server)
RETURN b,dd,dependants,server
```

You want to visualize it as:
```
Payment Processing → DataObject → Component → Server
    (Level 0)         (Level 1)    (Level 2)   (Level 3)

With ability to collapse/expand each parent node
```

## The Solution

**Use Reactflow** - It's already in your dependencies!

### Step 1: Install (Already Done ✅)

You already have `react-force-graph` but Reactflow is better for hierarchical layouts:
```bash
cd poc-services/web-ui
npm install reactflow
```

### Step 2: Create Component

Create `src/components/GraphVisualization.jsx`:

```javascript
import React, { useEffect, useState } from 'react';
import ReactFlow, { Controls, Background } from 'reactflow';
import 'reactflow/dist/style.css';

// Transform your Cypher results
function transformData(cypherResults) {
  const nodes = [];
  const edges = [];
  const seen = new Set();

  cypherResults.forEach(record => {
    const b = record.get('b');
    const dd = record.get('dd');
    const dep = record.get('dependants');
    const srv = record.get('server');

    // Add nodes (only once)
    if (b && !seen.has(b.properties.id)) {
      seen.add(b.properties.id);
      nodes.push({
        id: b.properties.id,
        data: { label: b.properties.name, level: 0 },
        position: { x: 0, y: 100 },
        style: { background: '#4CAF50', color: 'white', padding: 10 },
      });
    }

    if (dd && !seen.has(dd.properties.id)) {
      seen.add(dd.properties.id);
      nodes.push({
        id: dd.properties.id,
        data: { label: dd.properties.name, level: 1 },
        position: { x: 300, y: nodes.length * 80 },
        style: { background: '#2196F3', color: 'white', padding: 10 },
      });
      edges.push({ id: `e-${b.properties.id}-${dd.properties.id}`, source: b.properties.id, target: dd.properties.id });
    }

    // Continue for dep and srv...
  });

  return { nodes, edges };
}

function GraphVisualization({ data }) {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  useEffect(() => {
    if (data) {
      const { nodes: n, edges: e } = transformData(data);
      setNodes(n);
      setEdges(e);
    }
  }, [data]);

  return (
    <div style={{ height: '600px' }}>
      <ReactFlow nodes={nodes} edges={edges} fitView>
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  );
}

export default GraphVisualization;
```

### Step 3: Use in Your App

```javascript
// In your App.js or dashboard component
import GraphVisualization from './components/GraphVisualization';
import { useQuery, gql } from '@apollo/client';

const QUERY = gql`
  query GetGraph {
    businessCapability(name: "Payment Processing") {
      id name
      creates { id name }
      # ... your query
    }
  }
`;

function Dashboard() {
  const { data } = useQuery(QUERY);

  return (
    <div>
      <h1>Payment Processing Graph</h1>
      <GraphVisualization data={data} />
    </div>
  );
}
```

## Visual Layout

```
┌─────────────────────┐
│ Payment Processing  │  Level 0 (Green)
│  BusinessCapability │
└──────────┬──────────┘
           │
     ┌─────┴─────┬─────────────┐
     │           │             │
┌────▼────┐ ┌────▼────┐  ┌────▼────┐
│ Data 1  │ │ Data 2  │  │ Data 3  │  Level 1 (Blue)
│DataObject│ │DataObject│  │DataObject│
└────┬────┘ └────┬────┘  └────┬────┘
     │           │             │
 ┌───┴───┐   ┌───┴───┐     ┌──┴───┐
 │       │   │       │     │      │
┌▼──┐  ┌▼──┐┌▼──┐  ┌▼──┐ ┌▼──┐ ┌▼──┐
│Cmp│  │Cmp││Cap│  │Cmp│ │Cmp│ │Cap│  Level 2 (Orange)
└┬──┘  └┬──┘└───┘  └┬──┘ └┬──┘ └───┘
 │      │           │     │
┌▼─┐   ┌▼─┐        ┌▼─┐  ┌▼─┐
│Srv│  │Srv│       │Srv│ │Srv│         Level 3 (Purple)
└───┘  └───┘       └───┘ └───┘
```

## Collapse/Expand Feature

Add click handler to hide/show children:

```javascript
const onNodeClick = (event, node) => {
  const childNodes = nodes.filter(n => n.data.parentId === node.id);

  setNodes(nodes.map(n => {
    if (n.data.parentId === node.id) {
      return { ...n, hidden: !n.hidden };
    }
    return n;
  }));
};

// In ReactFlow component:
<ReactFlow nodes={nodes} edges={edges} onNodeClick={onNodeClick} fitView>
```

## Styling by Node Type

```javascript
const nodeStyles = {
  BusinessCapability: { background: '#4CAF50', border: '2px solid #388E3C' },
  DataObject: { background: '#2196F3', border: '2px solid #1976D2' },
  Component: { background: '#FF9800', border: '2px solid #F57C00' },
  Server: { background: '#9C27B0', border: '2px solid #7B1FA2' },
};

nodes.push({
  id: node.id,
  data: { label: node.name },
  style: { ...nodeStyles[node.type], color: 'white', padding: 10 },
});
```

## Layout Algorithm

Apply hierarchical positioning:

```javascript
function applyLayout(nodes) {
  const levelWidth = 300;
  const nodeSpacing = 100;

  // Group by level
  const levels = {};
  nodes.forEach(node => {
    if (!levels[node.data.level]) levels[node.data.level] = [];
    levels[node.data.level].push(node);
  });

  // Position nodes
  Object.keys(levels).forEach(level => {
    levels[level].forEach((node, index) => {
      node.position = {
        x: parseInt(level) * levelWidth,
        y: index * nodeSpacing,
      };
    });
  });

  return nodes;
}
```

## Complete Example

See `GRAPH-VISUALIZATION-GUIDE.md` for:
- ✅ Full working code for all 3 options (Reactflow, Cytoscape, vis.js)
- ✅ Data transformation logic
- ✅ Collapse/expand implementation
- ✅ Custom node components
- ✅ Comparison matrix

## Recommendation

**Use Reactflow** because:
1. Native React integration
2. TypeScript support
3. Modern, actively maintained
4. Great documentation
5. Best performance
6. Easy to customize

## Resources

- **Reactflow Docs**: https://reactflow.dev/
- **Examples**: https://reactflow.dev/examples
- **Full Implementation**: See `GRAPH-VISUALIZATION-GUIDE.md`

---

**Next Steps:**
1. Read the full guide: `GRAPH-VISUALIZATION-GUIDE.md`
2. Install Reactflow: `npm install reactflow`
3. Copy the HierarchicalGraph component
4. Integrate with your GraphQL queries
5. Customize styling and colors

**Need help?** The full guide has three complete implementations ready to use!
