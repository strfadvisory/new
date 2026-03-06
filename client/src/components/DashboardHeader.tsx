import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface DashboardHeaderProps {
  user: any;
  menu?: any[];
  onLogout: () => void;
  isSuperAdmin?: boolean;
  headerTabs?: Array<{ id: string; label: string; path: string }>;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ 
  user, 
  menu = [], 
  onLogout, 
  isSuperAdmin = false, 
  headerTabs = [] 
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPage = location.pathname.split('/').pop() || '';

  return (
    <header className="dashboard-header">
      <div className="header-left">
        <div className="logo" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
          <img src="/logo.png" alt="Reserve Fund Advisory" style={{ height: '40px' }} />
          <div className="logo-text">
            <div className="company-name">
              {isSuperAdmin ? 'Super Admin' : (user?.companyType || 'User')}
            </div>
            <div className="company-subtitle">
              {isSuperAdmin ? '' : (user?.companyProfile?.companyName || 'Company name')}
            </div>
          </div>
        </div>
        <nav className="header-nav">
          {isSuperAdmin ? (
            headerTabs.map((tab) => (
              <span 
                key={tab.id} 
                className={`nav-link ${currentPage === tab.id ? 'active' : ''}`}
                onClick={() => navigate(tab.path)}
                style={{ cursor: 'pointer' }}
              >
                {tab.label}
              </span>
            ))
          ) : (
            menu.map((menuItem: any, index: number) => (
              <span 
                key={index} 
                className={`nav-link ${location.pathname === menuItem.path ? 'active' : ''}`}
                onClick={() => navigate(menuItem.path)} 
                style={{ cursor: 'pointer' }}
              >
                {menuItem.level}
              </span>
            ))
          )}
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
  );
};

export default DashboardHeader;