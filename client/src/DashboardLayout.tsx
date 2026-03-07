import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import './Dashboard.css';
import { API_ENDPOINTS } from './config';
import SimulatorSubheader from './components/SimulatorSubheader';
import DashboardHeader from './components/DashboardHeader';
import CalculatorPage from './components/CalculatorPage';

interface DashboardLayoutProps {
  user: any;
  onLogout: () => void;
  onUserUpdate?: (updatedUser: any) => void;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ user, onLogout, onUserUpdate }) => {
  const [menu, setMenu] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState(user);
  const [showCalculator, setShowCalculator] = useState(false);
  const [calculatorData, setCalculatorData] = useState({ association: '', reserveStudy: '' });
  const [selectedAssociation, setSelectedAssociation] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleReset = () => {
    setIsResetting(true);
    setShowCalculator(false);
    setSelectedAssociation('');
    setSelectedCompany('');
    setCalculatorData({ association: '', reserveStudy: '' });
    // Reset the flag after a brief delay
    setTimeout(() => setIsResetting(false), 200);
  };

  const handleShowCalculator = (association: string, reserveStudy: string) => {
    if (!isResetting) {
      setCalculatorData({ association, reserveStudy });
      setShowCalculator(true);
    }
  };

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

  // Check if current route is simulator page
  const isSimulatorPage = location.pathname === '/dashboard/simulator' || location.pathname === '/dashboard/simulator-management';

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
          {isSimulatorPage && (
            <SimulatorSubheader 
              onShowCalculator={handleShowCalculator} 
              onReset={handleReset}
              selectedAssociation={selectedAssociation}
              selectedCompany={selectedCompany}
              onAssociationChange={setSelectedAssociation}
              onCompanyChange={setSelectedCompany}
            />
          )}   
         
          {showCalculator ? (
            <CalculatorPage 
              association={calculatorData.association} 
              reserveStudy={calculatorData.reserveStudy} 
            />
          ) : (
            <Outlet />
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
