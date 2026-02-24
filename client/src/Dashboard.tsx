import React, { useState, useEffect } from 'react';
import './Dashboard.css';

interface DashboardProps {
  user: any;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [navigation, setNavigation] = useState<string[]>([]);

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/roles/user-permissions', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (response.ok) {
          setNavigation(data.navigation || []);
        }
      } catch (error) {
        console.error('Error fetching permissions:', error);
      }
    };

    fetchPermissions();
  }, []);

  return (
    <div className="dashboard-container-no-sidebar">

      <div className="dashboard-main">
        <header className="dashboard-header">
          <div className="header-left">
            <div className="logo">
              <img src="/logo.png" alt="Reserve Fund Advisory" style={{ height: '40px' }} />
              <div className="logo-text">
                <div className="company-name">{user?.companyType || 'User'}</div>
                <div className="company-subtitle">{user?.companyProfile?.companyName || 'Company name'}</div>
              </div>
            </div>
            <nav className="header-nav">
              {navigation.map((navItem: string) => (
                <span key={navItem} className="nav-link">
                  {navItem}
                </span>
              ))}
            </nav>
          </div>
          <div className="header-right">
            <div className="user-menu">
              <i className="fas fa-user-circle"></i>
              <button onClick={onLogout} className="logout-btn">
                <i className="fas fa-sign-out-alt"></i>
              </button>
            </div>
          </div>
        </header>
        
        <div className="dashboard-content">
          <div className="fluid-content" style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 20px' }}>
            <div style={{ marginBottom: '40px' }}>
              <h1 style={{ fontSize: '32px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>Welcome, {user?.firstName}</h1>
              <p style={{ fontSize: '16px', color: '#6b7280' }}>Choose your Company type you like to signup</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '60px' }}>
              {[1, 2, 3].map((item) => (
                <div key={item} style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  <div style={{ background: '#f3f4f6', borderRadius: '8px', height: '180px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: '60px', height: '60px', background: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <i className="fas fa-play" style={{ color: 'white', fontSize: '24px' }}></i>
                    </div>
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: '500', color: '#1f2937' }}>How to us Simulator for associations</h3>
                </div>
              ))}
            </div>

            <div>
              <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1f2937', marginBottom: '24px' }}>Choose Next Step</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="step-card">
                  <div style={{ width: '48px', height: '48px', background: '#f3f4f6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className="fas fa-user" style={{ fontSize: '24px', color: '#1f2937' }}></i>
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>Invite Property Manager</h3>
                    <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Set up a new organizational entity to manage members, modules.ional entity to manage members, modules.</p>
                  </div>
                  <i className="fas fa-chevron-right" style={{ fontSize: '20px', color: '#9ca3af' }}></i>
                </div>

                <div className="step-card">
                  <div style={{ width: '48px', height: '48px', background: '#f3f4f6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className="fas fa-building" style={{ fontSize: '24px', color: '#1f2937' }}></i>
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>Invite a Association</h3>
                    <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Set up a new organizational entity to manage members, modules.ional entity to manage members, modules.</p>
                  </div>
                  <i className="fas fa-chevron-right" style={{ fontSize: '20px', color: '#9ca3af' }}></i>
                </div>

                <div className="step-card">
                  <div style={{ width: '48px', height: '48px', background: '#f3f4f6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className="fas fa-calendar" style={{ fontSize: '24px', color: '#1f2937' }}></i>
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>Schedule meeting with Expert</h3>
                    <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Set up a new organizational entity to manage members, modules.ional entity to manage members, modules.</p>
                  </div>
                  <i className="fas fa-chevron-right" style={{ fontSize: '20px', color: '#9ca3af' }}></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;