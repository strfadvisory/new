import React from 'react';

interface LeftPanelProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const LeftPanel: React.FC<LeftPanelProps> = ({ isCollapsed, onToggle }) => {
  return (
    <div style={{
      width: '300px',
      backgroundColor: 'white',
      padding: '20px',
      height: '100vh',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      position: 'relative',
      borderRight: '1px solid #EBEBEB'
    }}>
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          width: '30px',
          height: '30px',
          backgroundColor: 'transparent',
 
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '14px',
          zIndex: 10
        }}
      >
       <img src='/expend.png' /> 
      </button>

      <div style={{ textAlign: 'center', marginBottom: '20px', marginTop: '40px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1f2937', margin: '0 0 8px 0' }}>2032</h2>
      </div>
      
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Remaining Surplus</div>
        <div style={{ fontSize: '32px', fontWeight: '700', color: '#10b981' }}>$234,333</div>
      </div>

      <div style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '16px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span style={{ fontSize: '14px', color: '#374151' }}>Monthly Fee</span>
          <span style={{ fontSize: '14px', fontWeight: '500', color: '#10b981' }}>$345</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span style={{ fontSize: '14px', color: '#374151' }}>Year Priority</span>
          <span style={{ fontSize: '14px', fontWeight: '500', color: '#10b981' }}>$234,333</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '14px', color: '#374151' }}>Loans & Assessments</span>
          <span style={{ fontSize: '14px', fontWeight: '500', color: '#10b981' }}>0.0</span>
        </div>
      </div>

      <div>
        <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', marginBottom: '16px' }}>Others Details</h3>
        
        {[
          { label: 'Starting Amount', value: '$234,333' },
          { label: 'Annual Fee', value: '$234,333' },
          { label: 'Assessment', value: '$234,333' },
          { label: 'Available to Invest', value: '$234,333' },
          { label: 'Total Amount Invested', value: '$234,333' },
          { label: 'Total Loan Taken', value: '$234,333' },
          { label: 'Projected Net Earnings', value: '$234,333' }
        ].map((item, index) => (
          <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: '#6b7280' }}>{item.label}</span>
            <span style={{ fontSize: '13px', fontWeight: '500', color: '#1f2937' }}>{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeftPanel;