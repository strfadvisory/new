import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { API_ENDPOINTS } from '../config';
import CompanyDropdown from './CompanyDropdown';
import ProfileModal from './ProfileModal';
import ChangePasswordModal from './ChangePasswordModal';
import DeleteAccountModal from './DeleteAccountModal';

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
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
    };

    if (showProfileDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileDropdown]);

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
          </div>
          
          <div className="logo-text">
           <CompanyDropdown />
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
        <div className="role-name">
          {user?.role === 'SUPER_ADMIN' ? 'Super Admin' : 
           user?.role === 'ADMIN' ? 'Admin' : 
           user?.role || 'User'}
        </div>
        <div className="notification-icon">
          <i className="fas fa-bell"></i>
        </div>
        <div className="profile-menu" ref={profileDropdownRef}>
          <div 
            className="profile-icon" 
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
          >
            <i className="fas fa-user-circle"></i>
          </div>
          {showProfileDropdown && (
            <div className="profile-dropdown">
              <div className="dropdown-item" onClick={() => {
                setShowProfileModal(true);
                setShowProfileDropdown(false);
              }}>
                <i className="fas fa-user"></i>
                My Profile
              </div>
              <div className="dropdown-item" onClick={onLogout}>
                <i className="fas fa-sign-out-alt"></i>
                Logout
              </div>
            </div>
          )}
        </div>
      </div>
      
      <ProfileModal 
        isOpen={showProfileModal} 
        onClose={() => setShowProfileModal(false)} 
        user={user}
        onChangePassword={() => {
          setShowProfileModal(false);
          setShowChangePassword(true);
        }}
        onDeleteAccount={() => {
          setShowProfileModal(false);
          setShowDeleteAccount(true);
        }}
      />
      
      <ChangePasswordModal 
        isOpen={showChangePassword} 
        onClose={() => setShowChangePassword(false)} 
      />
      
      <DeleteAccountModal 
        isOpen={showDeleteAccount} 
        onClose={() => setShowDeleteAccount(false)} 
      />
    </header>
  );
};

export default DashboardHeader;