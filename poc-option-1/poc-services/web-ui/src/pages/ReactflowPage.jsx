import React from 'react';
import { useNavigate } from 'react-router-dom';
import ReactflowGraph from '../components/visualizations/ReactflowGraph';

function ReactflowPage() {
  const navigate = useNavigate();

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        padding: '20px 30px',
        background: '#4CAF50',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '28px' }}>Reactflow Visualization</h1>
          <p style={{ margin: '5px 0 0 0', fontSize: '14px', opacity: 0.9 }}>
            Native React graph visualization with custom components
          </p>
        </div>
        <button
          onClick={() => navigate('/graph')}
          style={{
            padding: '10px 20px',
            background: 'white',
            color: '#4CAF50',
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
            <strong>Library:</strong> <a href="https://reactflow.dev" target="_blank" rel="noopener noreferrer" style={{ color: '#4CAF50' }}>Reactflow</a>
          </div>
          <div>
            <strong>Features:</strong> Click nodes with ▼ to collapse/expand | Drag to pan | Scroll to zoom
          </div>
          <div>
            <strong>Data:</strong> Payment Processing → DataObjects → Components → Servers
          </div>
        </div>
      </div>

      {/* Graph Container */}
      <div style={{ flex: 1, background: '#fafafa' }}>
        <ReactflowGraph />
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
            <strong>Legend:</strong>
            <span style={{ marginLeft: '15px', color: '#4CAF50' }}>● BusinessCapability</span>
            <span style={{ marginLeft: '15px', color: '#2196F3' }}>● DataObject</span>
            <span style={{ marginLeft: '15px', color: '#FF9800' }}>● Component</span>
            <span style={{ marginLeft: '15px', color: '#9C27B0' }}>● Server</span>
          </div>
          <div>
            <strong>URL:</strong> <code>/graph/reactflow</code>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReactflowPage;
