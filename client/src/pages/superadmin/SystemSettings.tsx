import React from 'react';

const SystemSettings: React.FC = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h2>System Settings</h2>
      <div style={{ marginTop: '20px' }}>
        <div style={{ padding: '20px', background: '#f5f5f5', borderRadius: '8px', marginBottom: '20px' }}>
          <h3>Application Settings</h3>
          <div style={{ marginTop: '10px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              Application Name:
              <input type="text" defaultValue="Enterprise Reserve Management System" style={{ marginLeft: '10px', padding: '5px' }} />
            </label>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              Version:
              <input type="text" defaultValue="1.0.0" style={{ marginLeft: '10px', padding: '5px' }} />
            </label>
          </div>
        </div>
        <div style={{ padding: '20px', background: '#f5f5f5', borderRadius: '8px' }}>
          <h3>Email Configuration</h3>
          <div style={{ marginTop: '10px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              SMTP Host:
              <input type="text" placeholder="smtp.example.com" style={{ marginLeft: '10px', padding: '5px' }} />
            </label>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              SMTP Port:
              <input type="text" placeholder="587" style={{ marginLeft: '10px', padding: '5px' }} />
            </label>
          </div>
        </div>
        <button style={{ marginTop: '20px', padding: '10px 20px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}>
          Save Settings
        </button>
      </div>
    </div>
  );
};

export default SystemSettings;
