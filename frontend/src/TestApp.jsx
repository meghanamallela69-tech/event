import React from 'react';

const TestApp = () => {
  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f0f0f0',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: '#333' }}>React Test App</h1>
      <div style={{ 
        background: 'white', 
        padding: '20px', 
        borderRadius: '8px',
        margin: '20px 0',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h2>✅ React is working!</h2>
        <p>If you can see this, React is rendering correctly.</p>
        <p>Current time: {new Date().toLocaleString()}</p>
        
        <div style={{ marginTop: '20px' }}>
          <h3>Next Steps:</h3>
          <ol>
            <li>Check browser console (F12) for any errors</li>
            <li>Verify all components are imported correctly</li>
            <li>Test individual components</li>
          </ol>
        </div>
        
        <div style={{ marginTop: '20px' }}>
          <button 
            onClick={() => alert('Button clicked! React events are working.')}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Test Button
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestApp;