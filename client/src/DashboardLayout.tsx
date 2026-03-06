import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import './Dashboard.css';
import { API_ENDPOINTS } from './config';
import SimulatorSubheader from './components/SimulatorSubheader';
import DashboardHeader from './components/DashboardHeader';

interface DashboardLayoutProps {
  user: any;
  onLogout: () => void;
  onUserUpdate?: (updatedUser: any) => void;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ user, onLogout, onUserUpdate }) => {
  const [menu, setMenu] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState(user);
  const navigate = useNavigate();
  const location = useLocation();

  const handleUserUpdate = (updatedUser: any) => {
    setCurrentUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    if (onUserUpdate) {
      onUserUpdate(updatedUser);
    }
  };

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(API_ENDPOINTS.userPermissions, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (response.ok) {
          setMenu(data.menu || []);
          // Only redirect to first menu item if on dashboard root AND it's the initial load
          if (location.pathname === '/dashboard' && data.menu && data.menu.length > 0 && !sessionStorage.getItem('dashboardVisited')) {
            navigate(data.menu[0].path, { replace: true });
          }
          // Mark dashboard as visited
          sessionStorage.setItem('dashboardVisited', 'true');
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
        <DashboardHeader 
          user={currentUser} 
          menu={menu} 
          onLogout={onLogout} 
          onUserUpdate={handleUserUpdate}
        />
        
        <div className="dashboard-content">
          <SimulatorSubheader />
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
