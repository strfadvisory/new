import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { API_ENDPOINTS } from '../config';

interface DashboardHeaderProps {
  user: any;
  menu?: any[];
  onLogout: () => void;
  isSuperAdmin?: boolean;
  headerTabs?: Array<{ id: string; label: string; path: string }>;
  onUserUpdate?: (updatedUser: any) => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ 
  user, 
  menu = [], 
  onLogout, 
  isSuperAdmin = false, 
  headerTabs = [],
  onUserUpdate
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPage = location.pathname.split('/').pop() || '';
  const [companyName, setCompanyName] = useState(user?.companyProfile?.companyName || 'Company name');

  useEffect(() => {
    const createCompanyProfileIfNeeded = async () => {
      if (!isSuperAdmin && (!user?.companyProfile?.companyName)) {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(API_ENDPOINTS.createCompanyProfile, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            setCompanyName(data.companyProfile.companyName);
            if (onUserUpdate) {
              onUserUpdate({ ...user, companyProfile: data.companyProfile });
            }
          }
        } catch (error) {
          console.error('Error creating company profile:', error);
        }
      }
    };

    createCompanyProfileIfNeeded();
  }, [user, isSuperAdmin, onUserUpdate]);

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
              {isSuperAdmin ? '' : companyName}
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