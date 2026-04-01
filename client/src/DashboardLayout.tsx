import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import './Dashboard.css';
import { API_ENDPOINTS } from './config';
import SimulatorSubheader from './components/SimulatorSubheader';
import DashboardHeader from './components/DashboardHeader';
import CalculatorPage from './components/CalculatorPage';
import LoadingSpinner from './components/LoadingSpinner';
import { studySelectionEmitter } from './utils/eventEmitter';
import SimulatorStateManager from './utils/simulatorStateManager';
import type { SimulatorState } from './utils/simulatorStateManager';

interface DashboardLayoutProps {
  user: any;
  onLogout: () => void;
  onUserUpdate?: (updatedUser: any) => void;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ user, onLogout, onUserUpdate }) => {
  const [menu, setMenu] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState(user);
  
  // Use centralized state manager for all simulator state
  const stateManager = SimulatorStateManager.getInstance();
  const [simulatorState, setSimulatorState] = useState<SimulatorState>(stateManager.getState());
  
  const [isResetting, setIsResetting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Subscribe to state manager changes
  useEffect(() => {
    const unsubscribe = stateManager.subscribe('stateChange', (newState: SimulatorState) => {
      console.log('[DashboardLayout] State manager update received:', newState);
      setSimulatorState(newState);
    });

    const unsubscribeReset = stateManager.subscribe('stateReset', (newState: SimulatorState) => {
      console.log('[DashboardLayout] State manager reset received:', newState);
      setSimulatorState(newState);
    });

    return () => {
      unsubscribe();
      unsubscribeReset();
    };
  }, [stateManager]);

  // Debug viewMode changes
  useEffect(() => {
    console.log('[DashboardLayout] ViewMode state changed to:', simulatorState.viewMode);
  }, [simulatorState.viewMode]);

  // Listen for new study selection events with enhanced handling
  useEffect(() => {
    const handleNewStudyAdded = (data: { studyId: string; studyName: string; association: string }) => {
      console.log('[DashboardLayout] New study added event received:', data);
      
      // Update state through state manager
      stateManager.updateState({
        selectedAssociation: data.association,
        selectedCompany: data.studyName,
        selectedStudyId: data.studyId,
        viewMode: 'graph',
        showCalculator: true,
        calculatorData: {
          association: data.association,
          reserveStudy: data.studyName,
          excelData: null
        }
      });
      
      console.log('[DashboardLayout] Calculator forced to show for new study');
    };

    studySelectionEmitter.on('newStudyAdded', handleNewStudyAdded);

    return () => {
      studySelectionEmitter.off('newStudyAdded', handleNewStudyAdded);
    };
  }, [stateManager]);

  // Check if current route is simulator page
  const isSimulatorPage = location.pathname === '/dashboard/simulator' || location.pathname === '/dashboard/simulator-management';

  console.log('[DashboardLayout] Render - Current state:', {
    viewMode: simulatorState.viewMode,
    showCalculator: simulatorState.showCalculator,
    isSimulatorPage,
    selectedAssociation: simulatorState.selectedAssociation,
    selectedCompany: simulatorState.selectedCompany
  });

  const handleReset = () => {
    setIsResetting(true);
    stateManager.resetState();
    
    // Reset the flag after a brief delay
    setTimeout(() => setIsResetting(false), 200);
  };

  const handleAssociationChange = (value: string, associationData?: any) => {
    console.log('[DashboardLayout] Association changed to:', value, associationData);
    stateManager.setAssociation(value, associationData);
  };

  const handleCompanyChange = (value: string, studyId?: string) => {
    console.log('[DashboardLayout] Company change:', { value, studyId });
    if (studyId) {
      // Clear old excelData immediately so loading spinner shows
      stateManager.updateState({
        selectedCompany: value,
        selectedStudyId: studyId,
        showCalculator: true,
        calculatorData: {
          association: simulatorState.selectedAssociation,
          reserveStudy: value,
          excelData: null
        }
      });
    } else {
      stateManager.setCompany(value, studyId);
    }
  };

  const handleViewModeChange = (mode: 'graph' | 'list') => {
    console.log('[DashboardLayout] ViewMode change requested:', mode);
    stateManager.updateState({ viewMode: mode });
  };

  const handleShowCalculator = (association: string, reserveStudy: string, excelData?: any) => {
    const newCalculatorData = { association, reserveStudy, excelData };
    stateManager.setCalculatorData(newCalculatorData);
  };

  const handleUserUpdate = (updatedUser: any) => {
    setCurrentUser(updatedUser);
    sessionStorage.setItem('user', JSON.stringify(updatedUser));
    if (onUserUpdate) {
      onUserUpdate(updatedUser);
    }
  };

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const token = sessionStorage.getItem('token');
        const response = await fetch(API_ENDPOINTS.userPermissions, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (response.ok) {
          setMenu(data.menu || []);
          // Only redirect to first menu item if on dashboard root
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

  // Cleanup dashboard state on component unmount (user logout)
  useEffect(() => {
    return () => {
      // Reset simulator state on logout
      stateManager.resetState();
    };
  }, [stateManager]);

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
              onChangeView={handleViewModeChange}
              selectedAssociation={simulatorState.selectedAssociation}
              selectedCompany={simulatorState.selectedCompany}
              onAssociationChange={handleAssociationChange}
              onCompanyChange={handleCompanyChange}
              selectedAssociationData={simulatorState.selectedAssociationData}
              selectedStudyId={simulatorState.selectedStudyId}
            />
          )}   
         
          {stateManager.shouldShowCalculator() && isSimulatorPage ? (
            simulatorState.calculatorData.excelData ? (
              <CalculatorPage
                association={simulatorState.calculatorData.association}
                reserveStudy={simulatorState.calculatorData.reserveStudy}
                excelData={simulatorState.calculatorData.excelData}
                viewMode={simulatorState.viewMode}
                onViewModeChange={handleViewModeChange}
              />
            ) : (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <LoadingSpinner size="large" />
              </div>
            )
          ) : (
            <Outlet />
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
