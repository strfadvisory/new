import React from 'react';

interface ComingSoonProps {
  title: string;
}

const ComingSoon: React.FC<ComingSoonProps> = ({ title }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 80px)', background: '#f8fafc' }}>
      <div style={{ textAlign: 'center', maxWidth: '500px', padding: '40px' }}>
        <div style={{ fontSize: '80px', marginBottom: '24px' }}>🚀</div>
        <h1 style={{ fontSize: '48px', fontWeight: '700', color: '#1f2937', marginBottom: '16px' }}>{title}</h1>
        <p style={{ fontSize: '20px', color: '#6b7280', marginBottom: '32px' }}>Coming Soon</p>
        <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <p style={{ fontSize: '16px', color: '#4b5563', lineHeight: '1.6' }}>
            We're working hard to bring you this feature. Stay tuned for updates!
          </p>
        </div>
      </div>
    </div>
  );
};

export default ComingSoon;
