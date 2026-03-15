import React, { useState, useEffect } from 'react';
import { getAllApiCallStats } from '../hooks/useApiCallTracker';
import { circuitBreaker } from '../utils/circuitBreaker';

const ApiMonitor: React.FC = () => {
  const [stats, setStats] = useState<any>({});
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(getAllApiCallStats());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          background: '#1f4f8f',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          cursor: 'pointer',
          zIndex: 9999,
          fontSize: '12px'
        }}
      >
        API
      </button>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      background: 'white',
      border: '2px solid #1f4f8f',
      borderRadius: '8px',
      padding: '16px',
      maxWidth: '400px',
      maxHeight: '300px',
      overflow: 'auto',
      zIndex: 9999,
      fontSize: '12px',
      fontFamily: 'monospace'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h4 style={{ margin: 0, color: '#1f4f8f' }}>🔍 API Monitor</h4>
        <button
          onClick={() => setIsVisible(false)}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '16px',
            cursor: 'pointer',
            color: '#666'
          }}
        >
          ×
        </button>
      </div>
      
      {Object.keys(stats).length === 0 ? (
        <p style={{ color: '#666', margin: 0 }}>No API calls tracked yet</p>
      ) : (
        Object.entries(stats).map(([apiName, data]: [string, any]) => (
          <div key={apiName} style={{ 
            marginBottom: '8px', 
            padding: '8px', 
            background: data.count > 5 ? '#fee' : '#f9f9f9',
            borderRadius: '4px',
            border: data.count > 5 ? '1px solid #f00' : '1px solid #ddd'
          }}>
            <div style={{ fontWeight: 'bold', color: data.count > 5 ? '#d00' : '#333' }}>
              {apiName}
            </div>
            <div>Calls: {data.count}</div>
            <div>Last: {data.lastCall ? new Date(data.lastCall).toLocaleTimeString() : 'Never'}</div>
            <div>Status: {data.isActive ? '🟢 Active' : '⚪ Idle'}</div>
            {data.count > 5 && (
              <div style={{ color: '#d00', fontWeight: 'bold' }}>⚠️ POTENTIAL LOOP</div>
            )}
          </div>
        ))
      )}
      
      <button
        onClick={() => {
          // Reset all trackers
          Object.keys(stats).forEach(apiName => {
            circuitBreaker.reset(apiName);
          });
          setStats({});
        }}
        style={{
          background: '#f44336',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          padding: '4px 8px',
          cursor: 'pointer',
          fontSize: '10px',
          marginTop: '8px'
        }}
      >
        Reset All
      </button>
    </div>
  );
};

export default ApiMonitor;