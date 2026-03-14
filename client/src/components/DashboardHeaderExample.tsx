import React, { useState } from 'react';
import ChangeCompanyModal from './ChangeCompanyModal';

const DashboardHeader: React.FC = () => {
  const [showChangeCompanyModal, setShowChangeCompanyModal] = useState(false);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      padding: '20px',
      borderBottom: '1px solid #e6e6e6'
    }}>
      <h1>Dashboard</h1>
      
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        {/* Change Company Button */}
        <button
          onClick={() => setShowChangeCompanyModal(true)}
          style={{
            padding: '8px 16px',
            backgroundColor: '#1f4f8f',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M3 7V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7Z" stroke="currentColor" strokeWidth="2"/>
            <path d="M8 21L16 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M12 17L12 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Change Company
        </button>

        {/* User Profile Dropdown */}
        <div style={{
          width: '40px',
          height: '40px',
          backgroundColor: '#f3f4f6',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer'
        }}>
          👤
        </div>
      </div>

      {/* Change Company Modal */}
      <ChangeCompanyModal
        isOpen={showChangeCompanyModal}
        onClose={() => setShowChangeCompanyModal(false)}
        onCompanyChanged={() => {
          // Handle company change - update context, refresh data, etc.
          console.log('Company changed successfully');
        }}
      />
    </div>
  );
};

export default DashboardHeader;