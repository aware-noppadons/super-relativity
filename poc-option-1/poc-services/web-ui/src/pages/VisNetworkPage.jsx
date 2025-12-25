import React from 'react';
import { useNavigate } from 'react-router-dom';
import VisNetworkGraph from '../components/visualizations/VisNetworkGraph';

function VisNetworkPage() {
  const navigate = useNavigate();

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        padding: '20px 30px',
        background: '#FF9800',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '28px' }}>vis.js Network Visualization</h1>
          <p style={{ margin: '5px 0 0 0', fontSize: '14px', opacity: 0.9 }}>
            Easy-to-use network visualization with built-in interactions
          </p>
        </div>
        <button
          onClick={() => navigate('/graph')}
          style={{
            padding: '10px 20px',
            background: 'white',
            color: '#FF9800',
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
            <strong>Library:</strong> <a href="https://visjs.github.io/vis-network/" target="_blank" rel="noopener noreferrer" style={{ color: '#FF9800' }}>vis.js Network</a>
          </div>
          <div>
            <strong>Features:</strong> Double-click to collapse/expand | Single-click to highlight | Use navigation buttons
          </div>
          <div>
            <strong>Layout:</strong> Built-in hierarchical layout
          </div>
        </div>
      </div>

      {/* Graph Container */}
      <div style={{ flex: 1, background: '#fafafa' }}>
        <VisNetworkGraph />
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
            <strong>Note:</strong> vis.js is great for quick prototypes and has excellent built-in features
          </div>
          <div>
            <strong>URL:</strong> <code>/graph/visnetwork</code>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VisNetworkPage;
