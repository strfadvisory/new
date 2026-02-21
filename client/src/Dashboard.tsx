import React, { useState } from 'react';
import './Dashboard.css';
import Simulators from './pages/Simulators';
import Companies from './pages/Companies';
import UserManager from './pages/UserManager';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';

interface DashboardProps {
  user: any;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [currentPage, setCurrentPage] = useState('simulators');
  const navigation = user?.navigation || [];
  const permissions = user?.permissions || [];
  
  const companies = [
    { name: 'Company name', type: 'Management Company', members: 30, models: 30 },
    { name: 'Company name', type: 'Management Company', members: 30, models: 30 },
    { name: 'Company name', type: 'Management Company', members: 30, models: 30 },
    { name: 'Company name', type: 'Management Company', members: 30, models: 30 },
    { name: 'Company name', type: 'Management Company', members: 30, models: 30 }
  ];

  const getIconClass = (iconName: string) => {
    const iconMap: { [key: string]: string } = {
      'dashboard': 'fas fa-chart-bar',
      'business': 'fas fa-building',
      'group': 'fas fa-users',
      'person': 'fas fa-user',
      'notifications': 'fas fa-bell',
      'logout': 'fas fa-sign-out-alt',
      'account_balance': 'fas fa-university'
    };
    return iconMap[iconName] || 'fas fa-circle';
  };

  const handleNavClick = (navItem: any) => {
    if (navItem.id === 'logout') {
      onLogout();
    } else {
      setCurrentPage(navItem.id);
    }
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'simulators':
        return <Simulators />;
      case 'companies':
        return <Companies />;
      case 'user-manager':
        return <UserManager />;
      case 'profile':
        return <Profile user={user} />;
      case 'notifications':
        return <Notifications />;
      default:
        return <Simulators />;
    }
  };

  const isMainPage = ['simulators', 'companies', 'user-manager'].includes(currentPage);

  return (
    <div className="dashboard-container">
      <div className="dashboard-sidebar">
        <div className="logo">
          <div className="logo-icon">
            <div className="signal-bars">
              <div className="bar"></div>
              <div className="bar"></div>
              <div className="bar"></div>
            </div>
          </div>
          <div className="logo-text">
            <div>RESERVE FUND</div>
            <div>ADVISORY</div>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          {navigation.filter((item: any) => item.id !== 'logout').map((navItem: any) => (
            <div 
              key={navItem.id} 
              className={`nav-item ${currentPage === navItem.id ? 'active' : ''}`}
              onClick={() => handleNavClick(navItem)}
            >
              <i className={getIconClass(navItem.icon)}></i>
              <span>{navItem.label}</span>
            </div>
          ))}
        </nav>
      </div>
      
      <div className="dashboard-main">
        <header className="dashboard-header">
          <div className="header-left">
            <button className="menu-toggle">
              <i className="fas fa-bars"></i>
            </button>
            <nav className="header-nav">
              {navigation.filter((item: any) => ['simulators', 'companies', 'user-manager'].includes(item.id)).map((navItem: any) => (
                <span 
                  key={navItem.id} 
                  className={`nav-link ${currentPage === navItem.id ? 'active' : ''}`}
                  onClick={() => handleNavClick(navItem)}
                >
                  {navItem.id === 'user-manager' ? 'Role Manager' : navItem.label}
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
          {isMainPage ? (
            <>
              <div className="content-header">
                <div className="results-info">
                  <span className="results-count">200 Results founded</span>
                  {permissions.includes('MANAGE_USERS') && (
                    <button className="add-new-btn">
                      <i className="fas fa-plus"></i> Add New
                    </button>
                  )}
                </div>
                <div className="breadcrumb">
                  <span>Company name</span>
                  <i className="fas fa-chevron-right"></i>
                  <span>{user?.firstName} {user?.lastName}</span>
                </div>
              </div>
              
              <div className="main-content">
                <div className="left-panel">
                  <div className="search-filter">
                    <input type="text" placeholder="Search by name" className="search-input" />
                    <select className="filter-select">
                      <option>All Companies</option>
                    </select>
                  </div>
                  
                  <div className="companies-list">
                    {companies.map((company, index) => (
                      <div key={index} className="company-item">
                        <div className="company-info">
                          <h4>{company.name}</h4>
                          <p>{company.type}</p>
                          <small>Complete address and details Complete address and details</small>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="right-panel">
                  {renderCurrentPage()}
                </div>
              </div>
            </>
          ) : (
            <div className="full-page-content">
              {renderCurrentPage()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;