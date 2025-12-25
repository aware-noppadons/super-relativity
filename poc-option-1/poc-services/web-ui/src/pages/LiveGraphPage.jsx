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

// Example Cypher queries
const EXAMPLE_QUERIES = {
  paymentProcessing: `MATCH path = (bc:BusinessCapability {name: 'Payment Processing'})-[*1..3]-(related)
RETURN path
LIMIT 50`,
  allBusinessCapabilities: `MATCH (bc:BusinessCapability)-[r]-(related)
RETURN bc, r, related
LIMIT 100`,
  applicationProcessing: `MATCH path = (bc:BusinessCapability {name: 'Application Processing'})-[*1..2]-(related)
RETURN path
LIMIT 50`,
  applicationRequirements: `MATCH (app:Application)-[r:SATISFIES]->(req:Requirement)-[r2:SUPPORTS]->(cap:BusinessCapability)
RETURN app, r, req, r2, cap
LIMIT 50`,
  dataObjectFlow: `MATCH path = (do:DataObject)-[*1..2]-(related)
RETURN path
LIMIT 50`,
  serverDependencies: `MATCH (s:Server)-[r]-(c:Component)
RETURN s, r, c
LIMIT 100`,
};

function LiveGraphVisualization() {
  const navigate = useNavigate();
  const [cypherQuery, setCypherQuery] = useState(EXAMPLE_QUERIES.paymentProcessing);
  const [queryVars, setQueryVars] = useState({ cypherQuery: EXAMPLE_QUERIES.paymentProcessing });

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

  const { nodes, edges } = data?.customCypherGraph
    ? transformGraphQLToReactflow(data.customCypherGraph)
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
