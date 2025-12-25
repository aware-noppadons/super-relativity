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

const GET_HIERARCHICAL_GRAPH = gql`
  query GetHierarchicalGraph($rootName: String!, $rootType: String!) {
    hierarchicalGraph(rootName: $rootName, rootType: $rootType) {
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
  }}>
    <Handle type="target" position={Position.Left} />
    <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>
      {data.label}
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
  }}>
    <Handle type="target" position={Position.Left} />
    <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>
      {data.label}
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
  }}>
    <Handle type="target" position={Position.Left} />
    <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>
      {data.label}
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

const nodeTypes = {
  BusinessCapability: BusinessCapabilityNode,
  DataObject: DataObjectNode,
  Component: ComponentNode,
  Server: ServerNode,
};

function transformGraphQLToReactflow(graphData) {
  if (!graphData || !graphData.nodes) {
    return { nodes: [], edges: [] };
  }

  const nodes = graphData.nodes.map((node, index) => ({
    id: node.id,
    type: node.nodeType,
    data: {
      label: node.label,
      level: node.level,
      nodeType: node.nodeType,
      properties: node.properties,
    },
    position: {
      x: node.level * 350,
      y: index * 120,
    },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  }));

  const edges = graphData.edges.map(edge => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    label: edge.label,
    type: 'smoothstep',
    animated: false,
    style: { stroke: '#999', strokeWidth: 2 },
  }));

  return { nodes, edges };
}

function LiveGraphVisualization() {
  const navigate = useNavigate();
  const [rootName, setRootName] = useState('Payment Processing');
  const [rootType, setRootType] = useState('BusinessCapability');
  const [queryVars, setQueryVars] = useState({ rootName: 'Payment Processing', rootType: 'BusinessCapability' });

  const { loading, error, data } = useQuery(GET_HIERARCHICAL_GRAPH, {
    variables: queryVars,
    fetchPolicy: 'network-only',
  });

  const handleQuery = (e) => {
    e.preventDefault();
    setQueryVars({ rootName, rootType });
  };

  const { nodes, edges } = data?.hierarchicalGraph
    ? transformGraphQLToReactflow(data.hierarchicalGraph)
    : { nodes: [], edges: [] };

  const [displayNodes, setNodes, onNodesChange] = useNodesState(nodes);
  const [displayEdges, setEdges, onEdgesChange] = useEdgesState(edges);

  React.useEffect(() => {
    if (nodes.length > 0) {
      setNodes(nodes);
      setEdges(edges);
    }
  }, [nodes, edges, setNodes, setEdges]);

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

      {/* Query Form */}
      <div style={{
        padding: '15px 30px',
        background: '#f5f5f5',
        borderBottom: '1px solid #ddd',
      }}>
        <form onSubmit={handleQuery} style={{ display: 'flex', gap: '15px', alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' }}>
              Root Node Name:
            </label>
            <input
              type="text"
              value={rootName}
              onChange={(e) => setRootName(e.target.value)}
              placeholder="e.g., Payment Processing"
              style={{
                width: '100%',
                padding: '8px 12px',
                fontSize: '14px',
                border: '1px solid #ddd',
                borderRadius: '4px',
              }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' }}>
              Root Node Type:
            </label>
            <select
              value={rootType}
              onChange={(e) => setRootType(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                fontSize: '14px',
                border: '1px solid #ddd',
                borderRadius: '4px',
              }}
            >
              <option value="BusinessCapability">BusinessCapability</option>
              <option value="Application">Application</option>
              <option value="Component">Component</option>
              <option value="DataObject">DataObject</option>
            </select>
          </div>
          <button
            type="submit"
            style={{
              padding: '8px 24px',
              background: '#673AB7',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            Query
          </button>
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
          }}>
            <div style={{ fontSize: '18px', color: '#666' }}>No data found for "{queryVars.rootName}"</div>
            <div style={{ fontSize: '14px', color: '#999', marginTop: '10px' }}>
              Try a different node name or type
            </div>
          </div>
        )}

        {!loading && !error && displayNodes.length > 0 && (
          <ReactFlow
            nodes={displayNodes}
            edges={displayEdges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
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
            <strong>Note:</strong> This visualization queries real Neo4j data via GraphQL. Results are hierarchical: Root → DataObjects → Components/BusinessCapabilities → Servers
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
