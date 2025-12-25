# Graph Visualization Guide

**Rendering hierarchical graph relationships with collapse/expand capability**

## Overview

This guide provides approaches for visualizing Neo4j graph query results in a hierarchical, interactive layout with collapse/expand functionality - similar to Neo4j Browser's graph view but with controlled hierarchy.

### Your Requirements

1. **Hierarchical Layout**: Start from root node (e.g., "Payment Processing")
2. **Layered Visualization**:
   - Level 0: Root BusinessCapability
   - Level 1: Dependent DataObjects
   - Level 2: Impacted Components/BusinessCapabilities
   - Level 3: Impacting Servers
3. **Collapsible Nodes**: Expand/collapse parent nodes to manage complexity
4. **Visual Clarity**: Sorted, organized view that shows dependencies clearly

### Example Query

```cypher
MATCH (b:BusinessCapability {name:"Payment Processing"})-[rr]->(dd:DataObject)
MATCH (dd)<-[]->(dependants:BusinessCapability|Component)
OPTIONAL MATCH (dependants)-[]-(server:Server)
RETURN b, dd, dependants, server
```

---

## Recommended Approaches

### Option 1: Reactflow (Recommended for Modern React Apps) ⭐

**Why Reactflow:**
- ✅ Built-in hierarchical layouts
- ✅ Native React components
- ✅ Excellent TypeScript support
- ✅ Collapsible node groups (sub-flows)
- ✅ Custom node rendering
- ✅ Active development & great docs
- ✅ Performance optimized

**Installation:**
```bash
npm install reactflow
```

**Implementation:**

```javascript
// components/HierarchicalGraph.jsx
import React, { useState, useCallback, useEffect } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';

// Transform Neo4j results to Reactflow format
function transformCypherToReactflow(cypherResults) {
  const nodes = [];
  const edges = [];
  const nodeMap = new Map();
  let nodeIdCounter = 0;

  cypherResults.forEach(record => {
    const b = record.get('b');
    const dd = record.get('dd');
    const dependants = record.get('dependants');
    const server = record.get('server');

    // Add root BusinessCapability (Level 0)
    if (b && !nodeMap.has(b.properties.id)) {
      const nodeId = `node-${nodeIdCounter++}`;
      nodeMap.set(b.properties.id, nodeId);
      nodes.push({
        id: nodeId,
        type: 'businessCapability',
        data: {
          label: b.properties.name,
          ...b.properties,
          level: 0,
          nodeType: 'BusinessCapability',
          collapsible: true,
          collapsed: false,
        },
        position: { x: 0, y: 0 }, // Will be laid out by algorithm
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      });
    }

    // Add DataObject (Level 1)
    if (dd && !nodeMap.has(dd.properties.id)) {
      const nodeId = `node-${nodeIdCounter++}`;
      nodeMap.set(dd.properties.id, nodeId);
      nodes.push({
        id: nodeId,
        type: 'dataObject',
        data: {
          label: dd.properties.name,
          ...dd.properties,
          level: 1,
          nodeType: 'DataObject',
          parentId: nodeMap.get(b.properties.id),
          collapsible: true,
          collapsed: false,
        },
        position: { x: 250, y: 0 },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      });

      // Add edge from BusinessCapability to DataObject
      edges.push({
        id: `edge-${b.properties.id}-${dd.properties.id}`,
        source: nodeMap.get(b.properties.id),
        target: nodeId,
        label: 'CREATE/READ/UPDATE',
        type: 'smoothstep',
      });
    }

    // Add dependants (Level 2)
    if (dependants && !nodeMap.has(dependants.properties.id)) {
      const nodeId = `node-${nodeIdCounter++}`;
      nodeMap.set(dependants.properties.id, nodeId);
      const nodeType = dependants.labels[0];

      nodes.push({
        id: nodeId,
        type: nodeType.toLowerCase(),
        data: {
          label: dependants.properties.name,
          ...dependants.properties,
          level: 2,
          nodeType,
          parentId: nodeMap.get(dd.properties.id),
          collapsible: true,
          collapsed: false,
        },
        position: { x: 500, y: 0 },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      });

      // Add edge from DataObject to dependant
      edges.push({
        id: `edge-${dd.properties.id}-${dependants.properties.id}`,
        source: nodeMap.get(dd.properties.id),
        target: nodeId,
        label: 'MODIFIES/READS',
        type: 'smoothstep',
      });
    }

    // Add Server (Level 3)
    if (server && !nodeMap.has(server.properties.id)) {
      const nodeId = `node-${nodeIdCounter++}`;
      nodeMap.set(server.properties.id, nodeId);

      nodes.push({
        id: nodeId,
        type: 'server',
        data: {
          label: server.properties.name,
          ...server.properties,
          level: 3,
          nodeType: 'Server',
          parentId: nodeMap.get(dependants?.properties.id),
        },
        position: { x: 750, y: 0 },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      });

      // Add edge from dependant to Server
      if (dependants) {
        edges.push({
          id: `edge-${dependants.properties.id}-${server.properties.id}`,
          source: nodeMap.get(dependants.properties.id),
          target: nodeId,
          label: 'INSTALLED_ON',
          type: 'smoothstep',
        });
      }
    }
  });

  return { nodes, edges };
}

// Apply hierarchical layout
function applyHierarchicalLayout(nodes, edges) {
  const levelWidth = 300;
  const nodeHeight = 80;
  const verticalSpacing = 100;

  // Group nodes by level
  const nodesByLevel = nodes.reduce((acc, node) => {
    const level = node.data.level;
    if (!acc[level]) acc[level] = [];
    acc[level].push(node);
    return acc;
  }, {});

  // Position nodes
  Object.keys(nodesByLevel).forEach(level => {
    const nodesInLevel = nodesByLevel[level];
    const levelInt = parseInt(level);

    nodesInLevel.forEach((node, index) => {
      node.position = {
        x: levelInt * levelWidth,
        y: index * verticalSpacing,
      };
    });
  });

  return nodes;
}

// Custom node components
const BusinessCapabilityNode = ({ data }) => (
  <div style={{
    padding: '10px 20px',
    borderRadius: '8px',
    background: '#4CAF50',
    color: 'white',
    border: '2px solid #388E3C',
    minWidth: '200px',
    textAlign: 'center',
  }}>
    <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{data.label}</div>
    <div style={{ fontSize: '11px', marginTop: '4px' }}>
      Criticality: {data.criticality}
    </div>
  </div>
);

const DataObjectNode = ({ data }) => (
  <div style={{
    padding: '10px 20px',
    borderRadius: '8px',
    background: '#2196F3',
    color: 'white',
    border: '2px solid #1976D2',
    minWidth: '180px',
    textAlign: 'center',
  }}>
    <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{data.label}</div>
    <div style={{ fontSize: '11px', marginTop: '4px' }}>
      Sensitivity: {data.sensitivity}
    </div>
  </div>
);

const ComponentNode = ({ data }) => (
  <div style={{
    padding: '10px 20px',
    borderRadius: '8px',
    background: '#FF9800',
    color: 'white',
    border: '2px solid #F57C00',
    minWidth: '180px',
    textAlign: 'center',
  }}>
    <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{data.label}</div>
    <div style={{ fontSize: '11px', marginTop: '4px' }}>
      {data.technology}
    </div>
  </div>
);

const ServerNode = ({ data }) => (
  <div style={{
    padding: '10px 20px',
    borderRadius: '8px',
    background: '#9C27B0',
    color: 'white',
    border: '2px solid #7B1FA2',
    minWidth: '180px',
    textAlign: 'center',
  }}>
    <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{data.label}</div>
    <div style={{ fontSize: '11px', marginTop: '4px' }}>
      {data.environment} - {data.ip}
    </div>
  </div>
);

const nodeTypes = {
  businessCapability: BusinessCapabilityNode,
  dataObject: DataObjectNode,
  component: ComponentNode,
  server: ServerNode,
};

// Main component
function HierarchicalGraph({ cypherResults }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [collapsedNodes, setCollapsedNodes] = useState(new Set());

  useEffect(() => {
    if (cypherResults && cypherResults.length > 0) {
      const { nodes: transformedNodes, edges: transformedEdges } =
        transformCypherToReactflow(cypherResults);

      const layoutedNodes = applyHierarchicalLayout(transformedNodes, transformedEdges);

      setNodes(layoutedNodes);
      setEdges(transformedEdges);
    }
  }, [cypherResults, setNodes, setEdges]);

  const onNodeClick = useCallback((event, node) => {
    if (!node.data.collapsible) return;

    const isCollapsed = collapsedNodes.has(node.id);
    const newCollapsedNodes = new Set(collapsedNodes);

    if (isCollapsed) {
      newCollapsedNodes.delete(node.id);
    } else {
      newCollapsedNodes.add(node.id);
    }

    setCollapsedNodes(newCollapsedNodes);

    // Hide/show child nodes
    setNodes(nds =>
      nds.map(n => {
        if (n.data.parentId === node.id) {
          return {
            ...n,
            hidden: !isCollapsed,
          };
        }
        return n;
      })
    );

    // Hide/show edges
    setEdges(eds =>
      eds.map(e => {
        const sourceNode = nodes.find(n => n.id === e.source);
        const targetNode = nodes.find(n => n.id === e.target);

        if (targetNode?.data.parentId === node.id) {
          return {
            ...e,
            hidden: !isCollapsed,
          };
        }
        return e;
      })
    );
  }, [collapsedNodes, nodes, setNodes, setEdges]);

  return (
    <div style={{ width: '100%', height: '800px' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-right"
      >
        <Controls />
        <MiniMap />
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}

export default HierarchicalGraph;
```

**Usage:**

```javascript
// App.js or parent component
import HierarchicalGraph from './components/HierarchicalGraph';
import { useQuery, gql } from '@apollo/client';

const GET_HIERARCHY = gql`
  query GetPaymentProcessingHierarchy {
    businessCapability(name: "Payment Processing") {
      name
      criticality
      creates { name sensitivity }
      reads { name sensitivity }
      # ... rest of GraphQL query
    }
  }
`;

function App() {
  const { data, loading } = useQuery(GET_HIERARCHY);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Payment Processing Hierarchy</h1>
      <HierarchicalGraph cypherResults={data} />
    </div>
  );
}
```

---

### Option 2: Cytoscape.js (Best for Complex Graph Operations)

**Why Cytoscape.js:**
- ✅ Advanced graph algorithms
- ✅ Excellent hierarchical layouts
- ✅ Compound nodes (native parent-child)
- ✅ Rich styling options
- ✅ Proven at scale

**Installation:**
```bash
npm install cytoscape
npm install cytoscape-dagre  # For hierarchical layout
```

**Implementation:**

```javascript
// components/CytoscapeGraph.jsx
import React, { useEffect, useRef } from 'react';
import cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre';

cytoscape.use(dagre);

function transformCypherToCytoscape(cypherResults) {
  const elements = [];
  const nodeSet = new Set();

  cypherResults.forEach(record => {
    const b = record.get('b');
    const dd = record.get('dd');
    const dependants = record.get('dependants');
    const server = record.get('server');

    // Add BusinessCapability node
    if (b && !nodeSet.has(b.properties.id)) {
      nodeSet.add(b.properties.id);
      elements.push({
        group: 'nodes',
        data: {
          id: b.properties.id,
          label: b.properties.name,
          nodeType: 'BusinessCapability',
          level: 0,
          ...b.properties,
        },
        classes: 'business-capability level-0',
      });
    }

    // Add DataObject node
    if (dd && !nodeSet.has(dd.properties.id)) {
      nodeSet.add(dd.properties.id);
      elements.push({
        group: 'nodes',
        data: {
          id: dd.properties.id,
          label: dd.properties.name,
          nodeType: 'DataObject',
          level: 1,
          parent: b.properties.id, // Compound node - child of BusinessCapability
          ...dd.properties,
        },
        classes: 'data-object level-1',
      });
    }

    // Add edge
    if (b && dd) {
      elements.push({
        group: 'edges',
        data: {
          id: `${b.properties.id}-${dd.properties.id}`,
          source: b.properties.id,
          target: dd.properties.id,
          label: 'CREATE/READ',
        },
      });
    }

    // Add dependant nodes
    if (dependants && !nodeSet.has(dependants.properties.id)) {
      nodeSet.add(dependants.properties.id);
      const nodeType = dependants.labels[0];

      elements.push({
        group: 'nodes',
        data: {
          id: dependants.properties.id,
          label: dependants.properties.name,
          nodeType,
          level: 2,
          parent: dd?.properties.id,
          ...dependants.properties,
        },
        classes: `${nodeType.toLowerCase()} level-2`,
      });

      if (dd) {
        elements.push({
          group: 'edges',
          data: {
            id: `${dd.properties.id}-${dependants.properties.id}`,
            source: dd.properties.id,
            target: dependants.properties.id,
            label: 'MODIFIES/READS',
          },
        });
      }
    }

    // Add Server nodes
    if (server && !nodeSet.has(server.properties.id)) {
      nodeSet.add(server.properties.id);

      elements.push({
        group: 'nodes',
        data: {
          id: server.properties.id,
          label: server.properties.name,
          nodeType: 'Server',
          level: 3,
          parent: dependants?.properties.id,
          ...server.properties,
        },
        classes: 'server level-3',
      });

      if (dependants) {
        elements.push({
          group: 'edges',
          data: {
            id: `${dependants.properties.id}-${server.properties.id}`,
            source: dependants.properties.id,
            target: server.properties.id,
            label: 'INSTALLED_ON',
          },
        });
      }
    }
  });

  return elements;
}

function CytoscapeGraph({ cypherResults }) {
  const containerRef = useRef(null);
  const cyRef = useRef(null);

  useEffect(() => {
    if (!cypherResults || cypherResults.length === 0) return;

    const elements = transformCypherToCytoscape(cypherResults);

    const cy = cytoscape({
      container: containerRef.current,
      elements,
      style: [
        // Node styles
        {
          selector: 'node',
          style: {
            'label': 'data(label)',
            'text-valign': 'center',
            'text-halign': 'center',
            'font-size': '12px',
            'color': '#fff',
            'text-outline-width': 2,
            'text-outline-color': '#000',
            'width': '180px',
            'height': '60px',
            'shape': 'roundrectangle',
          },
        },
        {
          selector: '.business-capability',
          style: {
            'background-color': '#4CAF50',
            'border-width': 3,
            'border-color': '#388E3C',
          },
        },
        {
          selector: '.data-object',
          style: {
            'background-color': '#2196F3',
            'border-width': 3,
            'border-color': '#1976D2',
          },
        },
        {
          selector: '.component',
          style: {
            'background-color': '#FF9800',
            'border-width': 3,
            'border-color': '#F57C00',
          },
        },
        {
          selector: '.server',
          style: {
            'background-color': '#9C27B0',
            'border-width': 3,
            'border-color': '#7B1FA2',
          },
        },
        // Edge styles
        {
          selector: 'edge',
          style: {
            'width': 2,
            'line-color': '#999',
            'target-arrow-color': '#999',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'label': 'data(label)',
            'font-size': '10px',
            'text-rotation': 'autorotate',
            'text-margin-y': -10,
          },
        },
        // Parent nodes (compound nodes)
        {
          selector: ':parent',
          style: {
            'background-opacity': 0.1,
            'border-width': 2,
            'border-color': '#ccc',
            'text-valign': 'top',
            'text-halign': 'center',
          },
        },
      ],
      layout: {
        name: 'dagre',
        rankDir: 'LR', // Left to right
        nodeSep: 100,
        rankSep: 250,
        padding: 50,
      },
    });

    // Collapse/expand on node tap
    cy.on('tap', 'node', function(evt) {
      const node = evt.target;

      if (node.isParent()) {
        const children = node.children();

        if (node.data('collapsed')) {
          children.show();
          node.data('collapsed', false);
        } else {
          children.hide();
          node.data('collapsed', true);
        }
      }
    });

    cyRef.current = cy;

    return () => {
      cy.destroy();
    };
  }, [cypherResults]);

  return (
    <div>
      <div ref={containerRef} style={{ width: '100%', height: '800px', border: '1px solid #ddd' }} />
      <div style={{ marginTop: '10px', padding: '10px', background: '#f5f5f5' }}>
        <strong>Tip:</strong> Click on parent nodes to collapse/expand their children
      </div>
    </div>
  );
}

export default CytoscapeGraph;
```

---

### Option 3: vis.js Network (Easiest to Get Started)

**Why vis.js:**
- ✅ Very easy to use
- ✅ Built-in hierarchical layout
- ✅ Good documentation
- ✅ Works out of the box

**Installation:**
```bash
npm install vis-network
```

**Implementation:**

```javascript
// components/VisGraph.jsx
import React, { useEffect, useRef } from 'react';
import { Network } from 'vis-network';

function transformCypherToVis(cypherResults) {
  const nodes = [];
  const edges = [];
  const nodeSet = new Set();

  cypherResults.forEach(record => {
    const b = record.get('b');
    const dd = record.get('dd');
    const dependants = record.get('dependants');
    const server = record.get('server');

    // Add BusinessCapability
    if (b && !nodeSet.has(b.properties.id)) {
      nodeSet.add(b.properties.id);
      nodes.push({
        id: b.properties.id,
        label: b.properties.name,
        level: 0,
        group: 'BusinessCapability',
        title: `Criticality: ${b.properties.criticality}`,
      });
    }

    // Add DataObject
    if (dd && !nodeSet.has(dd.properties.id)) {
      nodeSet.add(dd.properties.id);
      nodes.push({
        id: dd.properties.id,
        label: dd.properties.name,
        level: 1,
        group: 'DataObject',
        title: `Sensitivity: ${dd.properties.sensitivity}`,
      });

      edges.push({
        from: b.properties.id,
        to: dd.properties.id,
        label: 'CREATE/READ',
        arrows: 'to',
      });
    }

    // Add dependants
    if (dependants && !nodeSet.has(dependants.properties.id)) {
      nodeSet.add(dependants.properties.id);
      const nodeType = dependants.labels[0];

      nodes.push({
        id: dependants.properties.id,
        label: dependants.properties.name,
        level: 2,
        group: nodeType,
        title: `Type: ${nodeType}`,
      });

      if (dd) {
        edges.push({
          from: dd.properties.id,
          to: dependants.properties.id,
          label: 'MODIFIES/READS',
          arrows: 'to',
        });
      }
    }

    // Add Server
    if (server && !nodeSet.has(server.properties.id)) {
      nodeSet.add(server.properties.id);

      nodes.push({
        id: server.properties.id,
        label: server.properties.name,
        level: 3,
        group: 'Server',
        title: `${server.properties.environment} - ${server.properties.ip}`,
      });

      if (dependants) {
        edges.push({
          from: dependants.properties.id,
          to: server.properties.id,
          label: 'INSTALLED_ON',
          arrows: 'to',
        });
      }
    }
  });

  return { nodes, edges };
}

function VisGraph({ cypherResults }) {
  const containerRef = useRef(null);
  const networkRef = useRef(null);

  useEffect(() => {
    if (!cypherResults || cypherResults.length === 0) return;

    const { nodes, edges } = transformCypherToVis(cypherResults);

    const data = { nodes, edges };

    const options = {
      layout: {
        hierarchical: {
          direction: 'LR', // Left to Right
          sortMethod: 'directed',
          levelSeparation: 300,
          nodeSpacing: 150,
          treeSpacing: 200,
        },
      },
      nodes: {
        shape: 'box',
        margin: 10,
        widthConstraint: {
          minimum: 150,
          maximum: 200,
        },
        font: {
          size: 14,
          color: '#ffffff',
        },
      },
      edges: {
        smooth: {
          type: 'cubicBezier',
          forceDirection: 'horizontal',
        },
        arrows: {
          to: {
            enabled: true,
            scaleFactor: 0.5,
          },
        },
        font: {
          size: 11,
          align: 'middle',
        },
      },
      groups: {
        BusinessCapability: {
          color: {
            background: '#4CAF50',
            border: '#388E3C',
          },
        },
        DataObject: {
          color: {
            background: '#2196F3',
            border: '#1976D2',
          },
        },
        Component: {
          color: {
            background: '#FF9800',
            border: '#F57C00',
          },
        },
        Server: {
          color: {
            background: '#9C27B0',
            border: '#7B1FA2',
          },
        },
      },
      interaction: {
        hover: true,
        tooltipDelay: 100,
      },
      physics: {
        enabled: false, // Disable for strict hierarchical layout
      },
    };

    const network = new Network(containerRef.current, data, options);
    networkRef.current = network;

    // Collapse/expand functionality
    network.on('doubleClick', function(params) {
      if (params.nodes.length > 0) {
        const nodeId = params.nodes[0];
        const connectedNodes = network.getConnectedNodes(nodeId);

        // Toggle visibility of connected nodes
        connectedNodes.forEach(id => {
          const node = nodes.find(n => n.id === id);
          if (node) {
            node.hidden = !node.hidden;
          }
        });

        network.setData(data);
      }
    });

    return () => {
      network.destroy();
    };
  }, [cypherResults]);

  return (
    <div>
      <div ref={containerRef} style={{ width: '100%', height: '800px', border: '1px solid #ddd' }} />
      <div style={{ marginTop: '10px', padding: '10px', background: '#f5f5f5' }}>
        <strong>Tip:</strong> Double-click nodes to collapse/expand connected nodes
      </div>
    </div>
  );
}

export default VisGraph;
```

---

## Comparison Matrix

| Feature | Reactflow | Cytoscape.js | vis.js Network |
|---------|-----------|--------------|----------------|
| **React Integration** | Native | Wrapper needed | Wrapper needed |
| **Hierarchical Layout** | ✅ Built-in | ✅ Via dagre plugin | ✅ Built-in |
| **Collapse/Expand** | ✅ Manual impl. | ✅ Compound nodes | ⚠️ Manual impl. |
| **Custom Nodes** | ✅ React components | CSS styling | CSS styling |
| **Performance** | Excellent | Excellent | Good |
| **Learning Curve** | Low | Medium | Low |
| **TypeScript** | ✅ Excellent | ⚠️ Types available | ⚠️ Types available |
| **Documentation** | ✅ Excellent | ✅ Excellent | ✅ Good |
| **Best For** | Modern React apps | Complex graphs | Quick prototypes |

---

## Recommended Solution

### For Your Use Case: **Reactflow** ⭐

**Reasons:**
1. You're already using React
2. Native support for hierarchical layouts
3. Easy to implement collapse/expand
4. Custom node components for each node type
5. Excellent performance
6. Active development

### Implementation Plan

1. **Install Reactflow**
   ```bash
   cd poc-services/web-ui
   npm install reactflow
   ```

2. **Create the Graph Component**
   - Use the HierarchicalGraph component provided above
   - Customize node styles for each type
   - Implement collapse/expand logic

3. **Data Flow**
   ```
   GraphQL Query → Transform to Reactflow Format → Apply Layout → Render
   ```

4. **Collapse/Expand Strategy**
   - Store collapsed state in component state
   - On node click, toggle visibility of child nodes
   - Filter edges based on visible nodes
   - Animate transitions for smooth UX

---

## Next Steps

1. **Create a new component**: `src/components/HierarchicalGraph.jsx`
2. **Add to your page**: Import and use in your main app
3. **Style customization**: Adjust colors, sizes, spacing
4. **Add features**:
   - Export to image
   - Search/filter nodes
   - Highlight paths
   - Zoom controls
   - Legend

Would you like me to create the complete implementation in your web-ui service?
