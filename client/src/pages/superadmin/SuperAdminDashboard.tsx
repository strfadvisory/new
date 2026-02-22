import React from 'react';

const SuperAdminDashboard: React.FC = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h2>Super Admin Dashboard</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginTop: '20px' }}>
        <div style={{ padding: '20px', background: '#f5f5f5', borderRadius: '8px' }}>
          <h3>Total Users</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold' }}>1,234</p>
        </div>
        <div style={{ padding: '20px', background: '#f5f5f5', borderRadius: '8px' }}>
          <h3>Total Companies</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold' }}>567</p>
        </div>
        <div style={{ padding: '20px', background: '#f5f5f5', borderRadius: '8px' }}>
          <h3>Active Simulators</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold' }}>890</p>
        </div>
        <div style={{ padding: '20px', background: '#f5f5f5', borderRadius: '8px' }}>
          <h3>System Health</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: 'green' }}>Good</p>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
