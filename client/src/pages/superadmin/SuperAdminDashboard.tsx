import React from 'react';

const SuperAdminDashboard: React.FC = () => {
  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
      {/* Horizontal Toolbar */}
      <div style={{
        height: '56px',
        width: '100%',
        background: '#f3f4f6',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px'
      }}>
        {/* Left Section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            height: '36px',
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '10px',
            padding: '0 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            fontWeight: '500',
            color: '#111827',
            cursor: 'pointer'
          }}>
            <div style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              background: '#e5e7eb'
            }}></div>
            Stepssevers-M3235
            <i className="fas fa-chevron-down" style={{ fontSize: '16px' }}></i>
          </div>
          <div style={{
            height: '36px',
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '10px',
            padding: '0 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            fontWeight: '500',
            color: '#111827',
            cursor: 'pointer'
          }}>
            <div style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              background: '#e5e7eb'
            }}></div>
            Stepssevers-M3235
            <i className="fas fa-chevron-down" style={{ fontSize: '16px' }}></i>
          </div>
          <button style={{
            height: '36px',
            padding: '0 16px',
            borderRadius: '10px',
            border: '1px solid #e5e7eb',
            background: 'white',
            fontSize: '14px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer'
          }}>
            Change View <i className="fas fa-chart-bar"></i>
          </button>
        </div>
        
        {/* Right Section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: '#e9d5ff',
              color: '#4c1d95',
              fontSize: '12px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid white',
              boxShadow: '0 0 0 1px rgba(0,0,0,0.05)',
              marginLeft: '0',
              position: 'relative',
              zIndex: 30
            }}>A</div>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: '#e9d5ff',
              color: '#4c1d95',
              fontSize: '12px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid white',
              boxShadow: '0 0 0 1px rgba(0,0,0,0.05)',
              marginLeft: '-8px',
              position: 'relative',
              zIndex: 20
            }}>B</div>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: '#e9d5ff',
              color: '#4c1d95',
              fontSize: '12px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid white',
              boxShadow: '0 0 0 1px rgba(0,0,0,0.05)',
              marginLeft: '-8px',
              position: 'relative',
              zIndex: 10
            }}>N</div>
          </div>
          <button style={{
            height: '36px',
            padding: '0 14px',
            borderRadius: '10px',
            border: '1px solid #e5e7eb',
            background: 'white',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer'
          }}>
            <i className="fas fa-undo"></i> Reset All
          </button>
          <button style={{
            width: '36px',
            height: '36px',
            border: '1px solid #e5e7eb',
            borderRadius: '10px',
            background: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}>
            <i className="fas fa-undo"></i>
          </button>
          <button style={{
            width: '36px',
            height: '36px',
            border: '1px solid #e5e7eb',
            borderRadius: '10px',
            background: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}>
            <i className="fas fa-redo"></i>
          </button>
          <button style={{
            height: '36px',
            padding: '0 18px',
            borderRadius: '10px',
            background: '#facc15',
            color: '#111827',
            fontWeight: '600',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
          }}>
            Save Changes <i className="fas fa-save"></i>
          </button>
        </div>
      </div>
      
      <div style={{ padding: '40px' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          {/* Placeholder Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '48px' }}>
            {[1, 2, 3].map((item) => (
              <div 
                key={item}
                style={{
                  width: '100%',
                  height: '120px',
                  backgroundColor: '#e5e7eb',
                  borderRadius: '12px',
                  border: '2px dashed #d1d5db'
                }}
              />
            ))}
          </div>

          {/* Action Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div 
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '24px',
                backgroundColor: 'white',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{
                width: '48px',
                height: '48px',
                backgroundColor: '#eff6ff',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '20px'
              }}>
                <i className="fas fa-file-alt" style={{ fontSize: '20px', color: '#3b82f6' }}></i>
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>
                  Enter reserve study data manually
                </h3>
                <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                  Create a brand-new Reserve Study from scratch with guided steps and automated insights.
                </p>
              </div>
              <i className="fas fa-chevron-right" style={{ fontSize: '16px', color: '#9ca3af' }}></i>
            </div>

            <div 
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '24px',
                backgroundColor: 'white',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{
                width: '48px',
                height: '48px',
                backgroundColor: '#f0f9ff',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '20px'
              }}>
                <i className="fas fa-chart-bar" style={{ fontSize: '20px', color: '#0ea5e9' }}></i>
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>
                  Take a demo of Simulator
                </h3>
                <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                  Explore the Simulator with a guided demo to see how it works in real time.
                </p>
              </div>
              <i className="fas fa-chevron-right" style={{ fontSize: '16px', color: '#9ca3af' }}></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
