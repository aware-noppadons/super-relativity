import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, gql } from '@apollo/client';
import ReactFlow, {
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  Position,
  Handle,
} from 'reactflow';
import 'reactflow/dist/style.css';

const GET_CUSTOM_CYPHER_GRAPH = gql`
  query GetCustomCypherGraph($cypherQuery: String!) {
    customCypherGraph(cypherQuery: $cypherQuery) {
      nodes {
        id
        label
        nodeType
        level
        properties
      }
      edges {
        id
        source
        target
        label
        relationshipType
      }
    }
  }
`;

// Custom node components (reuse from ReactflowGraph)
const BusinessCapabilityNode = ({ data }) => (
  <div style={{
    padding: '12px 20px',
    borderRadius: '8px',
    background: '#4CAF50',
    color: 'white',
    border: '3px solid #388E3C',
    minWidth: '200px',
    textAlign: 'center',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    cursor: data.collapsible ? 'pointer' : 'default',
  }}>
    <Handle type="target" position={Position.Left} />
    <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>
      {data.collapsible && (data.collapsed ? '▶ ' : '▼ ')}{data.label}
    </div>
    <div style={{ fontSize: '10px', opacity: 0.8, marginTop: '2px' }}>
      BusinessCapability
    </div>
    <Handle type="source" position={Position.Right} />
  </div>
);

const DataObjectNode = ({ data }) => (
  <div style={{
    padding: '12px 20px',
    borderRadius: '8px',
    background: '#2196F3',
    color: 'white',
    border: '3px solid #1976D2',
    minWidth: '180px',
    textAlign: 'center',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    cursor: data.collapsible ? 'pointer' : 'default',
  }}>
    <Handle type="target" position={Position.Left} />
    <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>
      {data.collapsible && (data.collapsed ? '▶ ' : '▼ ')}{data.label}
    </div>
    <div style={{ fontSize: '10px', opacity: 0.8, marginTop: '2px' }}>
      DataObject
    </div>
    <Handle type="source" position={Position.Right} />
  </div>
);

const ComponentNode = ({ data }) => (
  <div style={{
    padding: '12px 20px',
    borderRadius: '8px',
    background: '#FF9800',
    color: 'white',
    border: '3px solid #F57C00',
    minWidth: '180px',
    textAlign: 'center',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    cursor: data.collapsible ? 'pointer' : 'default',
  }}>
    <Handle type="target" position={Position.Left} />
    <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>
      {data.collapsible && (data.collapsed ? '▶ ' : '▼ ')}{data.label}
    </div>
    <div style={{ fontSize: '10px', opacity: 0.8, marginTop: '2px' }}>
      Component
    </div>
    <Handle type="source" position={Position.Right} />
  </div>
);

const ServerNode = ({ data }) => (
  <div style={{
    padding: '12px 20px',
    borderRadius: '8px',
    background: '#9C27B0',
    color: 'white',
    border: '3px solid #7B1FA2',
    minWidth: '180px',
    textAlign: 'center',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  }}>
    <Handle type="target" position={Position.Left} />
    <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>
      {data.label}
    </div>
    <div style={{ fontSize: '10px', opacity: 0.8, marginTop: '2px' }}>
      Server
    </div>
    <Handle type="source" position={Position.Right} />
  </div>
);

const AppChangeNode = ({ data }) => (
  <div style={{
    padding: '12px 20px',
    borderRadius: '8px',
    background: '#00BCD4',
    color: 'white',
    border: '3px solid #0097A7',
    minWidth: '180px',
    textAlign: 'center',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    cursor: data.collapsible ? 'pointer' : 'default',
  }}>
    <Handle type="target" position={Position.Left} />
    <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>
      {data.collapsible && (data.collapsed ? '▶ ' : '▼ ')}{data.label}
    </div>
    <div style={{ fontSize: '10px', opacity: 0.8, marginTop: '2px' }}>
      AppChange
    </div>
    <Handle type="source" position={Position.Right} />
  </div>
);

const InfraChangeNode = ({ data }) => (
  <div style={{
    padding: '12px 20px',
    borderRadius: '8px',
    background: '#795548',
    color: 'white',
    border: '3px solid #5D4037',
    minWidth: '180px',
    textAlign: 'center',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    cursor: data.collapsible ? 'pointer' : 'default',
  }}>
    <Handle type="target" position={Position.Left} />
    <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>
      {data.collapsible && (data.collapsed ? '▶ ' : '▼ ')}{data.label}
    </div>
    <div style={{ fontSize: '10px', opacity: 0.8, marginTop: '2px' }}>
      InfraChange
    </div>
    <Handle type="source" position={Position.Right} />
  </div>
);

const nodeTypes = {
  BusinessCapability: BusinessCapabilityNode,
  DataObject: DataObjectNode,
  Component: ComponentNode,
  Server: ServerNode,
  AppChange: AppChangeNode,
  InfraChange: InfraChangeNode,
};

function transformGraphQLToReactflow(graphData) {
  if (!graphData || !graphData.nodes) {
    return { nodes: [], edges: [] };
  }

  // Calculate hierarchical levels using BFS from nodes with no incoming edges
  const nodeMap = new Map(graphData.nodes.map(n => [n.id, { ...n, level: 0 }]));
  const incomingEdges = new Map();
  const outgoingEdges = new Map();

  // Build adjacency lists
  graphData.edges.forEach(edge => {
    if (!incomingEdges.has(edge.target)) incomingEdges.set(edge.target, []);
    if (!outgoingEdges.has(edge.source)) outgoingEdges.set(edge.source, []);
    incomingEdges.get(edge.target).push(edge.source);
    outgoingEdges.get(edge.source).push(edge.target);
  });

  // Find root nodes (no incoming edges)
  const rootNodes = graphData.nodes
    .filter(node => !incomingEdges.has(node.id) || incomingEdges.get(node.id).length === 0)
    .map(node => node.id);

  // If no root nodes, pick nodes with most outgoing edges
  const startNodes = rootNodes.length > 0
    ? rootNodes
    : graphData.nodes
        .sort((a, b) => (outgoingEdges.get(b.id)?.length || 0) - (outgoingEdges.get(a.id)?.length || 0))
        .slice(0, 3)
        .map(n => n.id);

  // BFS to assign levels
  const visited = new Set();
  const queue = startNodes.map(id => ({ id, level: 0 }));

  while (queue.length > 0) {
    const { id, level } = queue.shift();

    if (visited.has(id)) continue;
    visited.add(id);

    const node = nodeMap.get(id);
    if (node) {
      node.level = Math.max(node.level, level);
    }

    const children = outgoingEdges.get(id) || [];
    children.forEach(childId => {
      if (!visited.has(childId)) {
        queue.push({ id: childId, level: level + 1 });
      }
    });
  }

  // Identify reverse BusinessCapabilities (BusinessCapabilities that point to already-visited nodes)
  // These should be positioned to the right of the nodes they point to
  const reverseBusinessCapabilities = new Set();
  graphData.nodes.forEach(node => {
    if (node.nodeType === 'BusinessCapability' && !startNodes.includes(node.id)) {
      // Check if this BC points to any nodes that are already visited (e.g., DataObjects)
      const targets = outgoingEdges.get(node.id) || [];
      const pointsToVisitedNodes = targets.some(targetId => visited.has(targetId));

      if (pointsToVisitedNodes && !visited.has(node.id)) {
        // This is a reverse BC - position it to the right of its target
        const maxTargetLevel = Math.max(...targets.map(targetId => {
          const targetNode = nodeMap.get(targetId);
          return targetNode ? targetNode.level : 0;
        }));
        const nodeData = nodeMap.get(node.id);
        if (nodeData) {
          nodeData.level = maxTargetLevel + 1;
          nodeData.isReverse = true; // Mark as reverse for collapse logic
        }
        reverseBusinessCapabilities.add(node.id);
      }
    }
  });

  // Group nodes by level
  const nodesByLevel = new Map();
  nodeMap.forEach(node => {
    if (!nodesByLevel.has(node.level)) {
      nodesByLevel.set(node.level, []);
    }
    nodesByLevel.get(node.level).push(node);
  });

  // Build parent-child relationships from edges
  const childToParent = new Map();
  graphData.edges.forEach(edge => {
    // The source is the parent of the target in a directed graph
    if (!childToParent.has(edge.target)) {
      childToParent.set(edge.target, []);
    }
    childToParent.get(edge.target).push(edge.source);
  });

  // Position nodes and track initially collapsed nodes
  const nodes = [];
  const initiallyCollapsedNodeIds = [];

  nodesByLevel.forEach((levelNodes, level) => {
    levelNodes.forEach((node, indexInLevel) => {
      const parents = childToParent.get(node.id) || [];
      const hasChildren = (outgoingEdges.get(node.id) || []).length > 0;
      const isReverse = node.isReverse || false;

      // Collapse logic:
      // - Nodes at level 1 with children (default behavior)
      // - OR reverse BusinessCapabilities (always collapsed)
      const shouldBeCollapsed = (level === 1 && hasChildren) || (isReverse && hasChildren);
      if (shouldBeCollapsed) {
        initiallyCollapsedNodeIds.push(node.id);
      }

      // Hide nodes at level > 1 by default
      // EXCEPT reverse BusinessCapabilities themselves (they should be visible)
      const shouldBeHidden = level > 1 && !isReverse;

      nodes.push({
        id: node.id,
        type: node.nodeType,
        data: {
          label: node.label,
          level: node.level,
          nodeType: node.nodeType,
          properties: node.properties,
          parentId: parents[0], // Primary parent for collapse tracking
          collapsible: hasChildren,
          collapsed: shouldBeCollapsed,
          isReverse: isReverse,
        },
        position: {
          x: level * 350,
          y: indexInLevel * 120,
        },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
        hidden: shouldBeHidden,
      });
    });
  });

  // Hide edges connected to hidden nodes
  const hiddenNodeIds = new Set(nodes.filter(n => n.hidden).map(n => n.id));
  const edges = graphData.edges.map(edge => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    label: edge.label,
    type: 'smoothstep',
    animated: false,
    style: { stroke: '#999', strokeWidth: 2 },
    markerEnd: {
      type: 'arrowclosed',
      color: '#999',
    },
    hidden: hiddenNodeIds.has(edge.source) || hiddenNodeIds.has(edge.target),
  }));

  return { nodes, edges, initiallyCollapsedNodeIds };
}

// Example Cypher queries
const EXAMPLE_QUERIES = {
  paymentProcessing: `// Forward relationships from Payment Processing
MATCH path1 = (bc:BusinessCapability {name: 'Payment Processing'})-[*1..3]->(related)
// Also find other BusinessCapabilities that share the same DataObjects (reverse direction)
OPTIONAL MATCH path2 = (related)<-[r]-(otherBc:BusinessCapability)
WHERE otherBc <> bc AND labels(related)[0] IN ['DataObject']
RETURN path1, path2
LIMIT 50`,
  allBusinessCapabilities: `MATCH (bc:BusinessCapability)-[r]->(related)
RETURN bc, r, related
LIMIT 100`,
  applicationProcessing: `MATCH path = (bc:BusinessCapability {name: 'Application Processing'})-[*1..2]->(related)
RETURN path
LIMIT 50`,
  applicationRequirements: `MATCH path = (app:Application)-[:SATISFIES]->(req:Requirement)-[:SUPPORTS]->(cap:BusinessCapability)
RETURN path
LIMIT 50`,
  dataObjectFlow: `MATCH path = (do:DataObject)-[*1..2]->(related)
RETURN path
LIMIT 50`,
  serverDependencies: `MATCH path = (s:Server)<-[:INSTALLED_ON]-(c:Component)
RETURN path
LIMIT 100`,
};

function LiveGraphVisualization() {
  const navigate = useNavigate();
  const [cypherQuery, setCypherQuery] = useState(EXAMPLE_QUERIES.paymentProcessing);
  const [queryVars, setQueryVars] = useState({ cypherQuery: EXAMPLE_QUERIES.paymentProcessing });
  const [collapsedNodes, setCollapsedNodes] = React.useState(new Set());

  const { loading, error, data } = useQuery(GET_CUSTOM_CYPHER_GRAPH, {
    variables: queryVars,
    fetchPolicy: 'network-only',
  });

  const handleQuery = (e) => {
    e.preventDefault();
    setQueryVars({ cypherQuery });
  };

  const loadExample = (exampleName) => {
    const query = EXAMPLE_QUERIES[exampleName];
    setCypherQuery(query);
    setQueryVars({ cypherQuery: query });
  };

  const [displayNodes, setNodes, onNodesChange] = useNodesState([]);
  const [displayEdges, setEdges, onEdgesChange] = useEdgesState([]);

  React.useEffect(() => {
    if (data?.customCypherGraph) {
      const { nodes, edges, initiallyCollapsedNodeIds } = transformGraphQLToReactflow(data.customCypherGraph);
      if (nodes.length > 0) {
        setNodes(nodes);
        setEdges(edges);
        setCollapsedNodes(new Set(initiallyCollapsedNodeIds)); // Set initial collapsed state
      }
    }
  }, [data, setNodes, setEdges]);

  const toggleNodeCollapse = React.useCallback((nodeId) => {
    setCollapsedNodes((prevCollapsed) => {
      const newCollapsedNodes = new Set(prevCollapsed);
      const isCurrentlyCollapsed = prevCollapsed.has(nodeId);

      if (isCurrentlyCollapsed) {
        newCollapsedNodes.delete(nodeId);
      } else {
        newCollapsedNodes.add(nodeId);
      }

      const shouldHide = !isCurrentlyCollapsed;

      // Get all descendants to hide/show
      const getDescendants = (parentId, currentNodes) => {
        const descendants = [];
        const queue = [parentId];

        while (queue.length > 0) {
          const current = queue.shift();
          const children = currentNodes.filter(n => n.data.parentId === current);
          children.forEach(child => {
            descendants.push(child.id);
            queue.push(child.id);
          });
        }

        return descendants;
      };

      // Update nodes
      setNodes((nds) => {
        const descendants = getDescendants(nodeId, nds);

        return nds.map((n) => {
          if (n.id === nodeId) {
            return {
              ...n,
              data: { ...n.data, collapsed: shouldHide },
            };
          }
          if (descendants.includes(n.id)) {
            return { ...n, hidden: shouldHide };
          }
          return n;
        });
      });

      // Update edges
      setEdges((eds) => {
        const descendants = getDescendants(nodeId, displayNodes);

        return eds.map((e) => {
          const isAffected = descendants.includes(e.target) ||
                            descendants.includes(e.source) ||
                            (e.source === nodeId && shouldHide);

          if (isAffected) {
            return { ...e, hidden: shouldHide };
          }
          return e;
        });
      });

      return newCollapsedNodes;
    });
  }, [displayNodes, setNodes, setEdges]);

  const onNodeClick = React.useCallback(
    (event, node) => {
      if (node.data.collapsible) {
        toggleNodeCollapse(node.id);
      }
    },
    [toggleNodeCollapse]
  );

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        padding: '20px 30px',
        background: '#673AB7',
        color: 'white',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '28px' }}>Live Graph Visualization</h1>
            <p style={{ margin: '5px 0 0 0', fontSize: '14px', opacity: 0.9 }}>
              Query Neo4j and visualize hierarchical relationships
            </p>
          </div>
          <button
            onClick={() => navigate('/graph')}
            style={{
              padding: '10px 20px',
              background: 'white',
              color: '#673AB7',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            ← Back to Comparison
          </button>
        </div>
      </div>

      {/* Cypher Query Form */}
      <div style={{
        padding: '15px 30px',
        background: '#f5f5f5',
        borderBottom: '1px solid #ddd',
      }}>
        <form onSubmit={handleQuery} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ fontSize: '12px', fontWeight: 'bold' }}>
              Custom Cypher Query:
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => loadExample('paymentProcessing')}
                style={{
                  padding: '5px 12px',
                  background: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '11px',
                  cursor: 'pointer',
                }}
              >
                Payment Processing
              </button>
              <button
                type="button"
                onClick={() => loadExample('applicationProcessing')}
                style={{
                  padding: '5px 12px',
                  background: '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '11px',
                  cursor: 'pointer',
                }}
              >
                Application Processing
              </button>
              <button
                type="button"
                onClick={() => loadExample('allBusinessCapabilities')}
                style={{
                  padding: '5px 12px',
                  background: '#FF9800',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '11px',
                  cursor: 'pointer',
                }}
              >
                All Capabilities
              </button>
              <button
                type="button"
                onClick={() => loadExample('applicationRequirements')}
                style={{
                  padding: '5px 12px',
                  background: '#9C27B0',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '11px',
                  cursor: 'pointer',
                }}
              >
                App Requirements
              </button>
              <button
                type="button"
                onClick={() => loadExample('dataObjectFlow')}
                style={{
                  padding: '5px 12px',
                  background: '#E91E63',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '11px',
                  cursor: 'pointer',
                }}
              >
                DataObject Flow
              </button>
              <button
                type="button"
                onClick={() => loadExample('serverDependencies')}
                style={{
                  padding: '5px 12px',
                  background: '#607D8B',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '11px',
                  cursor: 'pointer',
                }}
              >
                Server Dependencies
              </button>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <textarea
              value={cypherQuery}
              onChange={(e) => setCypherQuery(e.target.value)}
              placeholder="Enter your Cypher query here..."
              rows={4}
              style={{
                flex: 1,
                padding: '10px',
                fontSize: '13px',
                fontFamily: 'monospace',
                border: '1px solid #ddd',
                borderRadius: '4px',
                resize: 'vertical',
              }}
            />
            <button
              type="submit"
              style={{
                padding: '12px 24px',
                background: '#673AB7',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              Execute Query
            </button>
          </div>
          <div style={{ fontSize: '11px', color: '#666' }}>
            💡 Tip: Use MATCH, RETURN, and LIMIT to control your query. Click example buttons above to load sample queries.
          </div>
        </form>
      </div>

      {/* Graph Container */}
      <div style={{ flex: 1, background: '#fafafa', position: 'relative' }}>
        {loading && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '18px', color: '#666' }}>Loading graph...</div>
          </div>
        )}

        {error && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            padding: '20px',
            background: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}>
            <div style={{ fontSize: '18px', color: '#f44336', marginBottom: '10px' }}>Error loading graph</div>
            <div style={{ fontSize: '14px', color: '#666' }}>{error.message}</div>
          </div>
        )}

        {!loading && !error && displayNodes.length === 0 && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            maxWidth: '500px',
          }}>
            <div style={{ fontSize: '18px', color: '#666', marginBottom: '10px' }}>No data found</div>
            <div style={{ fontSize: '14px', color: '#999', marginTop: '10px' }}>
              Your query returned no results. Try:
            </div>
            <ul style={{ fontSize: '13px', color: '#777', textAlign: 'left', marginTop: '10px' }}>
              <li>Clicking one of the example query buttons above</li>
              <li>Using MATCH to find nodes, and RETURN to specify what to display</li>
              <li>Adding LIMIT to control the number of results</li>
            </ul>
          </div>
        )}

        {!loading && !error && displayNodes.length > 0 && (
          <ReactFlow
            nodes={displayNodes}
            edges={displayEdges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
            attributionPosition="bottom-right"
          >
            <Controls />
            <MiniMap
              nodeColor={(node) => {
                switch (node.type) {
                  case 'BusinessCapability':
                    return '#4CAF50';
                  case 'DataObject':
                    return '#2196F3';
                  case 'Component':
                    return '#FF9800';
                  case 'Server':
                    return '#9C27B0';
                  default:
                    return '#ddd';
                }
              }}
            />
            <Background variant="dots" gap={12} size={1} />
          </ReactFlow>
        )}

        {/* Legend */}
        {!loading && !error && displayNodes.length > 0 && (
          <div style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            background: 'rgba(255,255,255,0.95)',
            padding: '12px',
            borderRadius: '6px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            fontSize: '12px',
            maxWidth: '200px',
            zIndex: 10,
          }}>
            <strong style={{ fontSize: '14px' }}>Legend</strong>
            <div style={{ marginTop: '8px', fontSize: '11px', lineHeight: '1.5' }}>
              💡 <strong>Click</strong> nodes with ▶/▼ to expand/collapse
            </div>
            <div style={{ marginTop: '12px', borderTop: '1px solid #ddd', paddingTop: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px' }}>
                <div style={{ width: '18px', height: '18px', background: '#4CAF50', marginRight: '6px', borderRadius: '3px' }}></div>
                <span style={{ fontSize: '11px' }}>BusinessCapability</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px' }}>
                <div style={{ width: '18px', height: '18px', background: '#2196F3', marginRight: '6px', borderRadius: '3px' }}></div>
                <span style={{ fontSize: '11px' }}>DataObject</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px' }}>
                <div style={{ width: '18px', height: '18px', background: '#FF9800', marginRight: '6px', borderRadius: '3px' }}></div>
                <span style={{ fontSize: '11px' }}>Component</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px' }}>
                <div style={{ width: '18px', height: '18px', background: '#9C27B0', marginRight: '6px', borderRadius: '3px' }}></div>
                <span style={{ fontSize: '11px' }}>Server</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px' }}>
                <div style={{ width: '18px', height: '18px', background: '#00BCD4', marginRight: '6px', borderRadius: '3px' }}></div>
                <span style={{ fontSize: '11px' }}>AppChange</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: '18px', height: '18px', background: '#795548', marginRight: '6px', borderRadius: '3px' }}></div>
                <span style={{ fontSize: '11px' }}>InfraChange</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div style={{
        padding: '15px 30px',
        background: '#fff',
        borderTop: '1px solid #ddd',
        fontSize: '13px',
        color: '#666',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <strong>Note:</strong> This visualization executes custom Cypher queries against real Neo4j data via GraphQL. Write any Cypher query or use the example buttons to get started.
          </div>
          <div>
            <strong>Nodes:</strong> {displayNodes.length} | <strong>Edges:</strong> {displayEdges.length}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LiveGraphVisualization;
