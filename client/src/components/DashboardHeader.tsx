import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { API_ENDPOINTS } from '../config';
import ChangeCompanyModal from './ChangeCompanyModal';
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
  const [companyName, setCompanyName] = useState('Company name');
  const [userRole, setUserRole] = useState('User');
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [showChangeCompanyModal, setShowChangeCompanyModal] = useState(false);
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
    const fetchUserMemberInfo = async () => {
      if (!isSuperAdmin) {
        try {
          const token = sessionStorage.getItem('token');
          const response = await fetch(API_ENDPOINTS.userMemberInfo, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            setCompanyName(data.companyName || 'Company name');
            setUserRole(data.userRole || 'User');
            
            // Store current company info in sessionStorage for consistency
            sessionStorage.setItem('currentCompany', JSON.stringify({
              id: data.currentCompanyId,
              name: data.companyName,
              role: data.userRole,
              roleId: data.roleId
            }));
          } else {
            console.error('Failed to fetch user member info:', response.statusText);
          }
        } catch (error) {
          console.error('Error fetching user member info:', error);
        }
      }
    };

    fetchUserMemberInfo();
    
    // Listen for company change events
    const handleCompanyChange = (event: CustomEvent) => {
      if (event.detail) {
        setCompanyName(event.detail.companyName || 'Company name');
        setUserRole(event.detail.userRole || 'User');
        
        // Also refresh from API to ensure consistency
        setTimeout(() => {
          refreshHeaderInfo();
        }, 500);
      }
    };
    
    window.addEventListener('companyChanged', handleCompanyChange as EventListener);
    
    return () => {
      window.removeEventListener('companyChanged', handleCompanyChange as EventListener);
    };
  }, [user, isSuperAdmin]);

  const handleCompanyChanged = () => {
    // Refresh the page to update company context
    window.location.reload();
  };
  
  const refreshHeaderInfo = async () => {
    if (!isSuperAdmin) {
      try {
        const token = sessionStorage.getItem('token');
        const response = await fetch(API_ENDPOINTS.userMemberInfo, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setCompanyName(data.companyName || 'Company name');
          setUserRole(data.userRole || 'User');
        }
      } catch (error) {
        console.error('Error refreshing header info:', error);
      }
    }
  };

  return (
    <header className="dashboard-header">
      <div className="header-left">
        <div className="logo" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
          <img src="/logo.png" alt="Reserve Fund Advisory" style={{ height: '40px' }} />
          </div>
          
          <div className="logo-text">
           <div className="company-dropdown">
             <div className="company-info">
               <div className="company-name" style={{color:"white"}}>{companyName}</div>
               <div className="user-role" style={{color:"white"}}>{userRole}</div>
             </div>
             
             <button className="menu-toggle" onClick={() => setShowChangeCompanyModal(true)}>
               <img src="/3line.png" alt="Menu" />
             </button>
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
      
      <ChangeCompanyModal 
        isOpen={showChangeCompanyModal}
        onClose={() => setShowChangeCompanyModal(false)}
        onCompanyChanged={handleCompanyChanged}
        isInitialSelection={false}
      />
      
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
      
      <style>{`
        .company-dropdown {
          padding: 12px 20px;
          width: 300px;
          color: white;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: relative;
        }
        
        .company-info {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          flex: 1;
        }
        
        .company-name {
          font-size: 15px;
          font-weight: 500; 
          line-height: 1.2;
          margin-bottom: 2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 200px;
        }
        
        .user-role {
          color: #6C9CD2;
          font-size: 12px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 400;
          line-height: 1;
        }
        
        .menu-toggle {
          background: transparent;
          border: none;
          color: white;
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .menu-toggle img {
          width: 20px;
          height: 20px;
        }
      `}</style>
    </header>
  );
};

export default DashboardHeader;