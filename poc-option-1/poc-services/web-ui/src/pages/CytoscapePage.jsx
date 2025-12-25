import React from 'react';
import { useNavigate } from 'react-router-dom';
import CytoscapeGraph from '../components/visualizations/CytoscapeGraph';

function CytoscapePage() {
  const navigate = useNavigate();

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        padding: '20px 30px',
        background: '#2196F3',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '28px' }}>Cytoscape.js Visualization</h1>
          <p style={{ margin: '5px 0 0 0', fontSize: '14px', opacity: 0.9 }}>
            Advanced graph analysis with powerful algorithms
          </p>
        </div>
        <button
          onClick={() => navigate('/graph')}
          style={{
            padding: '10px 20px',
            background: 'white',
            color: '#2196F3',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          ← Back to Comparison
        </button>
      </div>

      {/* Info Panel */}
      <div style={{
        padding: '15px 30px',
        background: '#f5f5f5',
        borderBottom: '1px solid #ddd'
      }}>
        <div style={{ display: 'flex', gap: '30px', fontSize: '13px' }}>
          <div>
            <strong>Library:</strong> <a href="https://js.cytoscape.org" target="_blank" rel="noopener noreferrer" style={{ color: '#2196F3' }}>Cytoscape.js</a>
          </div>
          <div>
            <strong>Features:</strong> Click nodes to collapse/expand | Hover to highlight | Click and drag to move
          </div>
          <div>
            <strong>Layout:</strong> Dagre hierarchical algorithm (left to right)
          </div>
        </div>
      </div>

      {/* Graph Container */}
      <div style={{ flex: 1, background: '#fafafa' }}>
        <CytoscapeGraph />
      </div>

      {/* Footer Info */}
      <div style={{
        padding: '15px 30px',
        background: '#fff',
        borderTop: '1px solid #ddd',
        fontSize: '13px',
        color: '#666'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <strong>Note:</strong> Cytoscape excels at complex graph algorithms and large-scale network analysis
          </div>
          <div>
            <strong>URL:</strong> <code>/graph/cytoscape</code>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CytoscapePage;
