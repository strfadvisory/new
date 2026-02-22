import React from 'react';

const Analytics: React.FC = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h2>Platform Analytics</h2>
      <div style={{ marginTop: '20px' }}>
        <div style={{ padding: '20px', background: '#f5f5f5', borderRadius: '8px', marginBottom: '20px' }}>
          <h3>User Growth</h3>
          <p>Chart placeholder - User registration trends over time</p>
        </div>
        <div style={{ padding: '20px', background: '#f5f5f5', borderRadius: '8px', marginBottom: '20px' }}>
          <h3>Company Distribution</h3>
          <p>Chart placeholder - Companies by type</p>
        </div>
        <div style={{ padding: '20px', background: '#f5f5f5', borderRadius: '8px' }}>
          <h3>System Usage</h3>
          <p>Chart placeholder - Active users and simulators</p>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
