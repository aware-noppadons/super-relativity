import React, { useEffect, useRef } from 'react';
import { Network } from 'vis-network';
import 'vis-network/styles/vis-network.css';

function createSampleData() {
  const nodes = [];
  const edges = [];

  // Level 0: BusinessCapability
  nodes.push({
    id: 'bc-1',
    label: 'Payment Processing',
    level: 0,
    group: 'BusinessCapability',
    title: 'BusinessCapability\nCriticality: Critical',
    font: { size: 14, color: '#ffffff' },
  });

  // Level 1: DataObjects
  const dataObjects = [
    { id: 'do-1', label: 'PaymentTransactionTable', sensitivity: 'PCI' },
    { id: 'do-2', label: 'PaymentAuditLog', sensitivity: 'Standard' },
    { id: 'do-3', label: 'CustomerPaymentCache', sensitivity: 'PII' },
  ];

  dataObjects.forEach((do_) => {
    nodes.push({
      id: do_.id,
      label: do_.label,
      level: 1,
      group: 'DataObject',
      title: `DataObject\nSensitivity: ${do_.sensitivity}`,
      font: { size: 14, color: '#ffffff' },
    });

    edges.push({
      from: 'bc-1',
      to: do_.id,
      label: 'CREATE/READ',
      arrows: 'to',
      font: { size: 11 },
    });
  });

  // Level 2: Components and BusinessCapabilities
  const components = [
    { id: 'comp-1', label: 'Payment Gateway', tech: 'Node.js', parent: 'do-1', group: 'Component' },
    { id: 'comp-2', label: 'Card Validator', tech: 'Java', parent: 'do-1', group: 'Component' },
    { id: 'comp-3', label: 'Audit Processor', tech: 'Python', parent: 'do-2', group: 'Component' },
    { id: 'comp-4', label: 'Cache Manager', tech: 'Redis', parent: 'do-3', group: 'Component' },
    { id: 'bc-2', label: 'Fraud Detection', criticality: 'High', parent: 'do-1', group: 'BusinessCapability' },
  ];

  components.forEach((comp) => {
    nodes.push({
      id: comp.id,
      label: comp.label,
      level: 2,
      group: comp.group,
      title: comp.group === 'Component'
        ? `Component\nTechnology: ${comp.tech}`
        : `BusinessCapability\nCriticality: ${comp.criticality}`,
      font: { size: 14, color: '#ffffff' },
    });

    edges.push({
      from: comp.parent,
      to: comp.id,
      label: comp.group === 'Component' ? 'MODIFIES' : 'SUPPORTS',
      arrows: 'to',
      font: { size: 11 },
    });
  });

  // Level 3: Servers
  const servers = [
    { id: 'srv-1', label: 'api-prod-01', env: 'prod', ip: '10.1.1.11', parent: 'comp-1' },
    { id: 'srv-2', label: 'api-prod-02', env: 'prod', ip: '10.1.1.12', parent: 'comp-1' },
    { id: 'srv-3', label: 'api-prod-03', env: 'prod', ip: '10.1.1.13', parent: 'comp-2' },
    { id: 'srv-4', label: 'db-prod-01', env: 'prod', ip: '10.1.2.11', parent: 'comp-3' },
    { id: 'srv-5', label: 'cache-prod-01', env: 'prod', ip: '10.1.3.11', parent: 'comp-4' },
  ];

  servers.forEach((srv) => {
    nodes.push({
      id: srv.id,
      label: srv.label,
      level: 3,
      group: 'Server',
      title: `Server\n${srv.env} - ${srv.ip}`,
      font: { size: 14, color: '#ffffff' },
    });

    edges.push({
      from: srv.parent,
      to: srv.id,
      label: 'INSTALLED_ON',
      arrows: 'to',
      font: { size: 11 },
    });
  });

  return { nodes, edges };
}

function VisNetworkGraph() {
  const containerRef = useRef(null);
  const networkRef = useRef(null);
  const collapsedNodes = useRef(new Set());

  useEffect(() => {
    // Suppress ResizeObserver errors (benign vis-network issue)
    const resizeObserverErr = window.console.error;
    window.console.error = (...args) => {
      const msg = args[0]?.toString?.() || '';
      if (msg.includes('ResizeObserver')) {
        return;
      }
      resizeObserverErr(...args);
    };

    // Also suppress the actual ResizeObserver error at the window level
    const originalOnError = window.onerror;
    window.onerror = (message, source, lineno, colno, error) => {
      if (message && message.toString().includes('ResizeObserver')) {
        return true; // Suppress the error
      }
      if (originalOnError) {
        return originalOnError(message, source, lineno, colno, error);
      }
      return false;
    };

    if (!containerRef.current) return;

    const { nodes, edges } = createSampleData();

    const data = { nodes, edges };

    const options = {
      layout: {
        hierarchical: {
          direction: 'LR',
          sortMethod: 'directed',
          levelSeparation: 300,
          nodeSpacing: 120,
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
        heightConstraint: {
          minimum: 50,
        },
        font: {
          size: 14,
          color: '#ffffff',
        },
        borderWidth: 3,
        shadow: {
          enabled: true,
          color: 'rgba(0,0,0,0.2)',
          size: 10,
          x: 0,
          y: 4,
        },
      },
      edges: {
        smooth: {
          type: 'cubicBezier',
          forceDirection: 'horizontal',
          roundness: 0.4,
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
          color: '#666',
          background: 'rgba(255,255,255,0.8)',
        },
        width: 2,
        color: {
          color: '#999',
          highlight: '#FFD700',
          hover: '#FFD700',
        },
      },
      groups: {
        BusinessCapability: {
          color: {
            background: '#4CAF50',
            border: '#388E3C',
            highlight: {
              background: '#66BB6A',
              border: '#2E7D32',
            },
            hover: {
              background: '#66BB6A',
              border: '#2E7D32',
            },
          },
        },
        DataObject: {
          color: {
            background: '#2196F3',
            border: '#1976D2',
            highlight: {
              background: '#42A5F5',
              border: '#1565C0',
            },
            hover: {
              background: '#42A5F5',
              border: '#1565C0',
            },
          },
        },
        Component: {
          color: {
            background: '#FF9800',
            border: '#F57C00',
            highlight: {
              background: '#FFA726',
              border: '#EF6C00',
            },
            hover: {
              background: '#FFA726',
              border: '#EF6C00',
            },
          },
        },
        Server: {
          color: {
            background: '#9C27B0',
            border: '#7B1FA2',
            highlight: {
              background: '#AB47BC',
              border: '#6A1B9A',
            },
            hover: {
              background: '#AB47BC',
              border: '#6A1B9A',
            },
          },
        },
      },
      interaction: {
        hover: true,
        tooltipDelay: 100,
        navigationButtons: true,
        keyboard: true,
      },
      physics: {
        enabled: false,
      },
    };

    const network = new Network(containerRef.current, data, options);
    networkRef.current = network;

    // Collapse/expand functionality on double-click
    network.on('doubleClick', function(params) {
      if (params.nodes.length > 0) {
        const nodeId = params.nodes[0];
        const isCollapsed = collapsedNodes.current.has(nodeId);

        // Get connected nodes
        const connectedNodes = network.getConnectedNodes(nodeId, 'to');

        if (isCollapsed) {
          // Expand - show connected nodes
          collapsedNodes.current.delete(nodeId);
          connectedNodes.forEach(id => {
            nodes.update({ id, hidden: false });
          });
        } else {
          // Collapse - hide connected nodes and their descendants
          collapsedNodes.current.add(nodeId);

          const hideDescendants = (parentId) => {
            const children = network.getConnectedNodes(parentId, 'to');
            children.forEach(childId => {
              nodes.update({ id: childId, hidden: true });
              hideDescendants(childId);
            });
          };

          hideDescendants(nodeId);
        }

        // Update the network
        network.setData(data);
      }
    });

    // Single click to highlight path
    network.on('click', function(params) {
      if (params.nodes.length > 0) {
        const nodeId = params.nodes[0];

        // Highlight all connected edges
        const connectedEdges = network.getConnectedEdges(nodeId);

        edges.forEach(edge => {
          if (connectedEdges.includes(edge.id)) {
            edges.update({ id: edge.id, width: 4, color: { color: '#FFD700' } });
          } else {
            edges.update({ id: edge.id, width: 2, color: { color: '#999' } });
          }
        });
      } else {
        // Reset all edges
        edges.forEach(edge => {
          edges.update({ id: edge.id, width: 2, color: { color: '#999' } });
        });
      }
    });

    return () => {
      if (network) {
        network.destroy();
      }
      // Restore original console.error and window.onerror
      window.console.error = resizeObserverErr;
      window.onerror = originalOnError;
    };
  }, []);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%', background: '#fafafa' }} />
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
      }}>
        <strong style={{ fontSize: '14px' }}>vis.js Network</strong>
        <div style={{ marginTop: '8px', fontSize: '11px', lineHeight: '1.5' }}>
          💡 <strong>Double-click</strong> nodes to collapse/expand<br/>
          💡 <strong>Single-click</strong> to highlight connections
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
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ width: '18px', height: '18px', background: '#9C27B0', marginRight: '6px', borderRadius: '3px' }}></div>
            <span style={{ fontSize: '11px' }}>Server</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VisNetworkGraph;
