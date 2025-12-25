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

// Custom node components
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
    <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>
      {data.collapsed ? '▶' : '▼'} {data.label}
    </div>
    <div style={{ fontSize: '11px', opacity: 0.9 }}>
      {data.criticality && `Criticality: ${data.criticality}`}
    </div>
    <div style={{ fontSize: '10px', opacity: 0.8, marginTop: '2px' }}>
      BusinessCapability
    </div>
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
    <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>
      {data.collapsed ? '▶' : '▼'} {data.label}
    </div>
    <div style={{ fontSize: '11px', opacity: 0.9 }}>
      {data.sensitivity && `Sensitivity: ${data.sensitivity}`}
    </div>
    <div style={{ fontSize: '10px', opacity: 0.8, marginTop: '2px' }}>
      DataObject
    </div>
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
    <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>
      {data.collapsible && (data.collapsed ? '▶' : '▼')} {data.label}
    </div>
    <div style={{ fontSize: '11px', opacity: 0.9 }}>
      {data.technology || 'Component'}
    </div>
    <div style={{ fontSize: '10px', opacity: 0.8, marginTop: '2px' }}>
      Component
    </div>
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
    <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>
      {data.label}
    </div>
    <div style={{ fontSize: '11px', opacity: 0.9 }}>
      {data.environment && `${data.environment}`} {data.ip && `- ${data.ip}`}
    </div>
    <div style={{ fontSize: '10px', opacity: 0.8, marginTop: '2px' }}>
      Server
    </div>
  </div>
);

const nodeTypes = {
  businessCapability: BusinessCapabilityNode,
  dataObject: DataObjectNode,
  component: ComponentNode,
  businesscapability: BusinessCapabilityNode,
  server: ServerNode,
};

// Transform sample data to Reactflow format
function createSampleData() {
  const nodes = [];
  const edges = [];
  let nodeId = 0;

  // Level 0: BusinessCapability
  nodes.push({
    id: 'bc-1',
    type: 'businessCapability',
    data: {
      label: 'Payment Processing',
      criticality: 'Critical',
      level: 0,
      nodeType: 'BusinessCapability',
      collapsible: true,
      collapsed: false,
    },
    position: { x: 0, y: 200 },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  });

  // Level 1: DataObjects
  const dataObjects = [
    { id: 'do-1', label: 'PaymentTransactionTable', sensitivity: 'PCI', parentId: 'bc-1' },
    { id: 'do-2', label: 'PaymentAuditLog', sensitivity: 'Standard', parentId: 'bc-1' },
    { id: 'do-3', label: 'CustomerPaymentCache', sensitivity: 'PII', parentId: 'bc-1' },
  ];

  dataObjects.forEach((do_, index) => {
    nodes.push({
      id: do_.id,
      type: 'dataObject',
      data: {
        label: do_.label,
        sensitivity: do_.sensitivity,
        level: 1,
        nodeType: 'DataObject',
        parentId: do_.parentId,
        collapsible: true,
        collapsed: false,
      },
      position: { x: 300, y: index * 150 },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    });

    edges.push({
      id: `edge-${do_.parentId}-${do_.id}`,
      source: do_.parentId,
      target: do_.id,
      label: 'CREATE/READ',
      type: 'smoothstep',
      animated: false,
      style: { stroke: '#999', strokeWidth: 2 },
    });
  });

  // Level 2: Components
  const components = [
    { id: 'comp-1', label: 'Payment Gateway', tech: 'Node.js', parentId: 'do-1' },
    { id: 'comp-2', label: 'Card Validator', tech: 'Java', parentId: 'do-1' },
    { id: 'comp-3', label: 'Audit Processor', tech: 'Python', parentId: 'do-2' },
    { id: 'comp-4', label: 'Cache Manager', tech: 'Redis', parentId: 'do-3' },
    { id: 'bc-2', label: 'Fraud Detection', criticality: 'High', parentId: 'do-1', isCap: true },
  ];

  components.forEach((comp, index) => {
    nodes.push({
      id: comp.id,
      type: comp.isCap ? 'businessCapability' : 'component',
      data: {
        label: comp.label,
        technology: comp.tech,
        criticality: comp.criticality,
        level: 2,
        nodeType: comp.isCap ? 'BusinessCapability' : 'Component',
        parentId: comp.parentId,
        collapsible: !comp.isCap,
        collapsed: false,
      },
      position: { x: 600, y: index * 100 },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    });

    edges.push({
      id: `edge-${comp.parentId}-${comp.id}`,
      source: comp.parentId,
      target: comp.id,
      label: comp.isCap ? 'SUPPORTS' : 'MODIFIES',
      type: 'smoothstep',
      style: { stroke: '#999', strokeWidth: 2 },
    });
  });

  // Level 3: Servers
  const servers = [
    { id: 'srv-1', label: 'api-prod-01', env: 'prod', ip: '10.1.1.11', parentId: 'comp-1' },
    { id: 'srv-2', label: 'api-prod-02', env: 'prod', ip: '10.1.1.12', parentId: 'comp-1' },
    { id: 'srv-3', label: 'api-prod-03', env: 'prod', ip: '10.1.1.13', parentId: 'comp-2' },
    { id: 'srv-4', label: 'db-prod-01', env: 'prod', ip: '10.1.2.11', parentId: 'comp-3' },
    { id: 'srv-5', label: 'cache-prod-01', env: 'prod', ip: '10.1.3.11', parentId: 'comp-4' },
  ];

  servers.forEach((srv, index) => {
    nodes.push({
      id: srv.id,
      type: 'server',
      data: {
        label: srv.label,
        environment: srv.env,
        ip: srv.ip,
        level: 3,
        nodeType: 'Server',
        parentId: srv.parentId,
      },
      position: { x: 900, y: index * 100 },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    });

    edges.push({
      id: `edge-${srv.parentId}-${srv.id}`,
      source: srv.parentId,
      target: srv.id,
      label: 'INSTALLED_ON',
      type: 'smoothstep',
      style: { stroke: '#999', strokeWidth: 2 },
    });
  });

  return { nodes, edges };
}

function ReactflowGraph() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [collapsedNodes, setCollapsedNodes] = useState(new Set());

  useEffect(() => {
    const { nodes: initialNodes, edges: initialEdges } = createSampleData();
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [setNodes, setEdges]);

  const toggleNodeCollapse = useCallback((nodeId) => {
    const newCollapsedNodes = new Set(collapsedNodes);
    const isCurrentlyCollapsed = collapsedNodes.has(nodeId);

    if (isCurrentlyCollapsed) {
      newCollapsedNodes.delete(nodeId);
    } else {
      newCollapsedNodes.add(nodeId);
    }

    setCollapsedNodes(newCollapsedNodes);

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

    const shouldHide = !isCurrentlyCollapsed;

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

    setEdges((eds) => {
      setNodes((nds) => {
        const descendants = getDescendants(nodeId, nds);
        const affectedNodes = [nodeId, ...descendants];

        // Update edges - hide edges connected to hidden nodes
        const updatedEdges = eds.map((e) => {
          const isAffected = descendants.includes(e.target) ||
                            descendants.includes(e.source) ||
                            (e.source === nodeId && shouldHide);

          if (isAffected) {
            return { ...e, hidden: shouldHide };
          }
          return e;
        });

        setEdges(updatedEdges);
        return nds;
      });

      return eds;
    });
  }, [collapsedNodes, setNodes, setEdges]);

  const onNodeClick = useCallback(
    (event, node) => {
      if (node.data.collapsible) {
        toggleNodeCollapse(node.id);
      }
    },
    [toggleNodeCollapse]
  );

  return (
    <div style={{ width: '100%', height: '100%' }}>
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
        <MiniMap
          nodeColor={(node) => {
            switch (node.type) {
              case 'businessCapability':
                return '#4CAF50';
              case 'dataObject':
                return '#2196F3';
              case 'component':
                return '#FF9800';
              case 'server':
                return '#9C27B0';
              default:
                return '#ddd';
            }
          }}
        />
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}

export default ReactflowGraph;
