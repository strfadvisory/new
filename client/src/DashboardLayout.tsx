import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import './Dashboard.css';
import { API_BASE_URL } from './config';

interface DashboardLayoutProps {
  user: any;
  onLogout: () => void;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ user, onLogout }) => {
  const [menu, setMenu] = useState<any[]>([]);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/roles/user-permissions`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (response.ok) {
          setMenu(data.menu || []);
          // Redirect to first menu item if on dashboard root
          if (location.pathname === '/dashboard' && data.menu && data.menu.length > 0) {
            navigate(data.menu[0].path, { replace: true });
          }
        }
      } catch (error) {
        console.error('Error fetching permissions:', error);
      }
    };

    fetchPermissions();
  }, [navigate, location.pathname]);

  return (
    <div className="dashboard-container-no-sidebar">
      <div className="dashboard-main">
        <header className="dashboard-header">
          <div className="header-left">
            <div className="logo" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
              <img src="/logo.png" alt="Reserve Fund Advisory" style={{ height: '40px' }} />
              <div className="logo-text">
                <div className="company-name">{user?.companyType || 'User'}</div>
                <div className="company-subtitle">{user?.companyProfile?.companyName || 'Company name'}</div>
              </div>
            </div>
            <nav className="header-nav">
              {menu.map((menuItem: any, index: number) => (
                <span 
                  key={index} 
                  className={`nav-link ${location.pathname === menuItem.path ? 'active' : ''}`}
                  onClick={() => navigate(menuItem.path)} 
                  style={{ cursor: 'pointer' }}
                >
                  {menuItem.level}
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
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
