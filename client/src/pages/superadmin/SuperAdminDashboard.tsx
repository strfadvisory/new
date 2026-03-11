import React, { useState } from 'react';

const SuperAdminDashboard: React.FC = () => {
  const [selectedAssociation, setSelectedAssociation] = useState('');
  const [selectedModel, setSelectedModel] = useState('');

  return (
    <div style={{  minHeight: '100vh', padding: '40px 20px' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        {/* Main Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ 
            fontSize: '28px', 
            fontWeight: '400', 
            color: '#2f2f2f', 
            lineHeight: '1.4',
            margin: '0 0 20px 0'
          }}>
            Choose an Association and Model to access and view the Simulator.
          </h1>
        </div>

 <div> <img src='/simu.png' />  </div>

        {/* Or Other Action */}
        <div style={{ 
          textAlign: 'center', 
          margin: '40px 0',
          position: 'relative'
        }}>
          <div style={{
            height: '1px',
            background: '#e6e6e6',
            position: 'absolute',
            top: '50%',
            left: '0',
            right: '0'
          }} />
          <span style={{
            background: 'white',
            padding: '0 20px',
            color: '#6b7280',
            fontSize: '14px',
            position: 'relative'
          }}>Or Other Action</span>
        </div>

        {/* Action Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Invite New Associations */}
          <div style={{
            background: 'white',
            border: '1px solid #e6e6e6',
            borderRadius: '10px',
            padding: '24px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '20px',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.5">
                <path d="M3 21h18M5 21V7l8-4v18M13 9h4v12M17 9v12"/>
                <path d="M9 9v12M9 12h4M9 15h4"/>
              </svg>
            </div>
            <div>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#1f2937',
                margin: '0 0 8px 0'
              }}>Invite New Associations</h3>
              <p style={{
                fontSize: '14px',
                color: '#6b7280',
                margin: '0',
                lineHeight: '1.5'
              }}>Add a new association and manage, control, and analyze reserve study planning.</p>
            </div>
          </div>

          {/* Add New Members */}
          <div style={{
            background: 'white',
            border: '1px solid #e6e6e6',
            borderRadius: '10px',
            padding: '24px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '20px',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.5">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <line x1="19" y1="8" x2="19" y2="14"/>
                <line x1="22" y1="11" x2="16" y2="11"/>
              </svg>
            </div>
            <div>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#1f2937',
                margin: '0 0 8px 0'
              }}>Add New Members</h3>
              <p style={{
                fontSize: '14px',
                color: '#6b7280',
                margin: '0',
                lineHeight: '1.5'
              }}>Assign managers who can manage the association and handle reserve study data and research.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
