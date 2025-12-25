import React, { useEffect, useRef } from 'react';
import cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre';

// Register the dagre layout
cytoscape.use(dagre);

function createSampleData() {
  const elements = [];

  // Level 0: BusinessCapability
  elements.push({
    group: 'nodes',
    data: {
      id: 'bc-1',
      label: 'Payment Processing',
      nodeType: 'BusinessCapability',
      criticality: 'Critical',
      level: 0,
    },
    classes: 'business-capability level-0',
  });

  // Level 1: DataObjects
  const dataObjects = [
    { id: 'do-1', label: 'PaymentTransactionTable', sensitivity: 'PCI' },
    { id: 'do-2', label: 'PaymentAuditLog', sensitivity: 'Standard' },
    { id: 'do-3', label: 'CustomerPaymentCache', sensitivity: 'PII' },
  ];

  dataObjects.forEach((do_) => {
    elements.push({
      group: 'nodes',
      data: {
        id: do_.id,
        label: do_.label,
        nodeType: 'DataObject',
        sensitivity: do_.sensitivity,
        level: 1,
      },
      classes: 'data-object level-1',
    });

    elements.push({
      group: 'edges',
      data: {
        id: `bc-1-${do_.id}`,
        source: 'bc-1',
        target: do_.id,
        label: 'CREATE/READ',
      },
    });
  });

  // Level 2: Components and BusinessCapabilities
  const components = [
    { id: 'comp-1', label: 'Payment Gateway', tech: 'Node.js', parent: 'do-1', type: 'Component' },
    { id: 'comp-2', label: 'Card Validator', tech: 'Java', parent: 'do-1', type: 'Component' },
    { id: 'comp-3', label: 'Audit Processor', tech: 'Python', parent: 'do-2', type: 'Component' },
    { id: 'comp-4', label: 'Cache Manager', tech: 'Redis', parent: 'do-3', type: 'Component' },
    { id: 'bc-2', label: 'Fraud Detection', criticality: 'High', parent: 'do-1', type: 'BusinessCapability' },
  ];

  components.forEach((comp) => {
    elements.push({
      group: 'nodes',
      data: {
        id: comp.id,
        label: comp.label,
        nodeType: comp.type,
        technology: comp.tech,
        criticality: comp.criticality,
        level: 2,
      },
      classes: comp.type === 'Component' ? 'component level-2' : 'business-capability level-2',
    });

    elements.push({
      group: 'edges',
      data: {
        id: `${comp.parent}-${comp.id}`,
        source: comp.parent,
        target: comp.id,
        label: comp.type === 'Component' ? 'MODIFIES' : 'SUPPORTS',
      },
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
    elements.push({
      group: 'nodes',
      data: {
        id: srv.id,
        label: srv.label,
        nodeType: 'Server',
        environment: srv.env,
        ip: srv.ip,
        level: 3,
      },
      classes: 'server level-3',
    });

    elements.push({
      group: 'edges',
      data: {
        id: `${srv.parent}-${srv.id}`,
        source: srv.parent,
        target: srv.id,
        label: 'INSTALLED_ON',
      },
    });
  });

  return elements;
}

function CytoscapeGraph() {
  const containerRef = useRef(null);
  const cyRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const elements = createSampleData();

    const cy = cytoscape({
      container: containerRef.current,
      elements,
      style: [
        // Base node styles
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
        // BusinessCapability nodes
        {
          selector: '.business-capability',
          style: {
            'background-color': '#4CAF50',
            'border-width': 3,
            'border-color': '#388E3C',
          },
        },
        // DataObject nodes
        {
          selector: '.data-object',
          style: {
            'background-color': '#2196F3',
            'border-width': 3,
            'border-color': '#1976D2',
          },
        },
        // Component nodes
        {
          selector: '.component',
          style: {
            'background-color': '#FF9800',
            'border-width': 3,
            'border-color': '#F57C00',
          },
        },
        // Server nodes
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
            'color': '#666',
            'text-outline-width': 1,
            'text-outline-color': '#fff',
          },
        },
        // Highlighted nodes (on tap)
        {
          selector: 'node:selected',
          style: {
            'border-width': 5,
            'border-color': '#FFD700',
          },
        },
        // Hidden nodes and edges
        {
          selector: '.hidden',
          style: {
            'display': 'none',
          },
        },
      ],
      layout: {
        name: 'dagre',
        rankDir: 'LR',
        nodeSep: 100,
        rankSep: 250,
        padding: 50,
      },
    });

    // Collapse/expand functionality
    cy.on('tap', 'node', function(evt) {
      const node = evt.target;
      const nodeId = node.id();

      // Get all descendants (nodes and edges)
      const descendants = node.successors();

      if (node.data('collapsed')) {
        // Expand - show descendants
        descendants.removeClass('hidden');
        node.data('collapsed', false);
        node.removeStyle('background-color');
      } else {
        // Collapse - hide descendants
        descendants.addClass('hidden');
        node.data('collapsed', true);
        // Darken the node to show it's collapsed
        const currentBg = node.style('background-color');
        node.style('background-color', '#555');
      }
    });

    // Hover effect
    cy.on('mouseover', 'node', function(evt) {
      const node = evt.target;
      node.style('border-width', '5');
    });

    cy.on('mouseout', 'node', function(evt) {
      const node = evt.target;
      if (!node.data('collapsed')) {
        node.style('border-width', '3');
      }
    });

    cyRef.current = cy;

    return () => {
      cy.destroy();
    };
  }, []);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%', background: '#fafafa' }} />
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        background: 'rgba(255,255,255,0.9)',
        padding: '10px',
        borderRadius: '4px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        fontSize: '12px',
      }}>
        <strong>Cytoscape.js</strong>
        <div style={{ marginTop: '5px', fontSize: '11px' }}>
          💡 Click nodes to collapse/expand
        </div>
        <div style={{ marginTop: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
            <div style={{ width: '16px', height: '16px', background: '#4CAF50', marginRight: '5px', borderRadius: '2px' }}></div>
            <span>BusinessCapability</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
            <div style={{ width: '16px', height: '16px', background: '#2196F3', marginRight: '5px', borderRadius: '2px' }}></div>
            <span>DataObject</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
            <div style={{ width: '16px', height: '16px', background: '#FF9800', marginRight: '5px', borderRadius: '2px' }}></div>
            <span>Component</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ width: '16px', height: '16px', background: '#9C27B0', marginRight: '5px', borderRadius: '2px' }}></div>
            <span>Server</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CytoscapeGraph;
