import React from 'react';
import { useNavigate } from 'react-router-dom';

function GraphComparison() {
  const navigate = useNavigate();

  const libraries = [
    {
      name: 'Reactflow',
      path: '/graph/reactflow',
      description: 'Native React integration with modern hooks',
      pros: [
        'Best React integration',
        'TypeScript support',
        'Custom React components for nodes',
        'Excellent documentation',
        'Active development'
      ],
      cons: [
        'Newer library (less mature)',
        'Smaller ecosystem than others'
      ],
      bestFor: 'Modern React applications',
      color: '#4CAF50'
    },
    {
      name: 'Cytoscape.js',
      path: '/graph/cytoscape',
      description: 'Advanced graph analysis and visualization',
      pros: [
        'Powerful graph algorithms',
        'Compound nodes (parent-child)',
        'Extensive customization',
        'Large ecosystem',
        'Battle-tested'
      ],
      cons: [
        'Steeper learning curve',
        'Not React-native',
        'Requires wrapper'
      ],
      bestFor: 'Complex graph operations and analysis',
      color: '#2196F3'
    },
    {
      name: 'vis.js Network',
      path: '/graph/visnetwork',
      description: 'Easy-to-use network visualization',
      pros: [
        'Very easy to get started',
        'Good documentation',
        'Built-in hierarchical layout',
        'Physics simulations'
      ],
      cons: [
        'Less flexible than others',
        'Not React-native',
        'Limited customization'
      ],
      bestFor: 'Quick prototypes and simple visualizations',
      color: '#FF9800'
    }
  ];

  return (
    <div style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '36px', marginBottom: '10px', color: '#333' }}>
          Graph Visualization Library Comparison
        </h1>
        <p style={{ fontSize: '18px', color: '#666', lineHeight: '1.6' }}>
          Compare three popular JavaScript graph visualization libraries rendering the same hierarchical data.
          Each implementation shows Payment Processing capability → DataObjects → Components → Servers.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '30px',
        marginBottom: '40px'
      }}>
        {libraries.map((lib) => (
          <div
            key={lib.name}
            style={{
              border: `3px solid ${lib.color}`,
              borderRadius: '12px',
              padding: '30px',
              background: '#fff',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              cursor: 'pointer'
            }}
            onClick={() => navigate(lib.path)}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
            }}
          >
            <h2 style={{ fontSize: '28px', marginBottom: '10px', color: lib.color }}>
              {lib.name}
            </h2>
            <p style={{ fontSize: '15px', color: '#666', marginBottom: '20px', lineHeight: '1.5' }}>
              {lib.description}
            </p>

            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', marginBottom: '10px', color: '#333' }}>✅ Pros:</h3>
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                {lib.pros.map((pro, idx) => (
                  <li key={idx} style={{ fontSize: '14px', color: '#555', marginBottom: '5px' }}>
                    {pro}
                  </li>
                ))}
              </ul>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', marginBottom: '10px', color: '#333' }}>⚠️ Cons:</h3>
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                {lib.cons.map((con, idx) => (
                  <li key={idx} style={{ fontSize: '14px', color: '#555', marginBottom: '5px' }}>
                    {con}
                  </li>
                ))}
              </ul>
            </div>

            <div style={{
              padding: '12px',
              background: `${lib.color}15`,
              borderRadius: '6px',
              marginBottom: '20px'
            }}>
              <strong style={{ fontSize: '14px', color: '#333' }}>Best for:</strong>
              <span style={{ fontSize: '14px', color: '#555', marginLeft: '5px' }}>{lib.bestFor}</span>
            </div>

            <button
              style={{
                width: '100%',
                padding: '14px',
                background: lib.color,
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'opacity 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              View {lib.name} Demo →
            </button>
          </div>
        ))}
      </div>

      <div style={{
        background: '#f5f5f5',
        padding: '30px',
        borderRadius: '12px',
        marginTop: '40px'
      }}>
        <h2 style={{ fontSize: '24px', marginBottom: '15px', color: '#333' }}>
          Feature Comparison
        </h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#fff' }}>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Feature</th>
              <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #ddd', color: '#4CAF50' }}>Reactflow</th>
              <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #ddd', color: '#2196F3' }}>Cytoscape.js</th>
              <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #ddd', color: '#FF9800' }}>vis.js Network</th>
            </tr>
          </thead>
          <tbody>
            {[
              { feature: 'React Native', reactflow: '✅', cytoscape: '⚠️', visjs: '⚠️' },
              { feature: 'TypeScript', reactflow: '✅', cytoscape: '⚠️', visjs: '⚠️' },
              { feature: 'Hierarchical Layout', reactflow: '✅', cytoscape: '✅', visjs: '✅' },
              { feature: 'Collapse/Expand', reactflow: '✅', cytoscape: '✅', visjs: '✅' },
              { feature: 'Custom Nodes', reactflow: '✅ React', cytoscape: '⚠️ CSS', visjs: '⚠️ CSS' },
              { feature: 'Performance', reactflow: 'Excellent', cytoscape: 'Excellent', visjs: 'Good' },
              { feature: 'Learning Curve', reactflow: 'Low', cytoscape: 'Medium', visjs: 'Low' },
              { feature: 'Graph Algorithms', reactflow: 'Basic', cytoscape: 'Advanced', visjs: 'Basic' },
            ].map((row, idx) => (
              <tr key={idx} style={{ background: idx % 2 === 0 ? '#fff' : '#fafafa' }}>
                <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>{row.feature}</td>
                <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>{row.reactflow}</td>
                <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>{row.cytoscape}</td>
                <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>{row.visjs}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{
        marginTop: '40px',
        padding: '30px',
        background: '#E3F2FD',
        borderRadius: '12px',
        borderLeft: '5px solid #2196F3'
      }}>
        <h3 style={{ fontSize: '20px', marginBottom: '10px', color: '#1976D2' }}>
          💡 Recommendation
        </h3>
        <p style={{ fontSize: '16px', color: '#555', lineHeight: '1.6', marginBottom: '10px' }}>
          <strong>For this project:</strong> We recommend <strong style={{ color: '#4CAF50' }}>Reactflow</strong> because:
        </p>
        <ul style={{ fontSize: '15px', color: '#555', lineHeight: '1.8', paddingLeft: '20px' }}>
          <li>You're already using React</li>
          <li>Best TypeScript support</li>
          <li>Native React components for custom nodes</li>
          <li>Excellent performance for hierarchical layouts</li>
          <li>Active development and modern API</li>
        </ul>
      </div>
    </div>
  );
}

export default GraphComparison;
