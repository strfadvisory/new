import React from 'react';

const LTMManager: React.FC = () => {
  return (
    <div className="ltm-manager-container">
      <div className="page-header">
        <h1>LTM Manager</h1>
        <p>Manage Long Term Maintenance operations and configurations</p>
      </div>
      
      <div className="ltm-content">
        <div className="coming-soon">
          <i className="fas fa-tools" style={{ fontSize: '48px', color: '#6b7280', marginBottom: '16px' }}></i>
          <h2>LTM Manager</h2>
          <p>Long Term Maintenance management features are coming soon.</p>
        </div>
      </div>
    </div>
  );
};

export default LTMManager;