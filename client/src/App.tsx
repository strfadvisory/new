import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { QueryProvider, clearAllQueries, invalidateAllQueries } from './hooks/QueryProvider';
import { updateSignupState, getSignupState, clearSignupState, getFormData } from './utils/signupState';
import { API_ENDPOINTS } from './config';
import SignupStateDebug from './components/SignupStateDebug';
import ChangeCompanyModal from './components/ChangeCompanyModal';
import Login from './Login';
import ForgotPassword from './ForgotPassword';
import ResetPassword from './ResetPassword';
import CompanySelection from './CompanySelection';
import CreateProfile from './CreateProfile';
import OTPVerification from './OTPVerification';
import CompanyProfile from './CompanyProfile';
import AdvisoryVerification from './AdvisoryVerification';
import MemberVerification from './MemberVerification';
import Dashboard from './Dashboard';
import DashboardLayout from './DashboardLayout';
import SuperAdminLayout from './SuperAdminLayout';
import Simulator from './pages/Simulator';
import Invitations from './pages/Invitations';
import Companies from './pages/Companies';
import Associations from './pages/Associations';
import Users from './pages/Users';
import Banking from './pages/Banking';
import UserManagement from './pages/UserManagement';
import AssociationControl from './pages/AssociationControl';
import Profile from './pages/Profile';

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCompanyType, setSelectedCompanyType] = useState<string>('');
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [selectedRoleName, setSelectedRoleName] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [showCompanySelectionModal, setShowCompanySelectionModal] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string>('');
  const [isCreatingNewCompany, setIsCreatingNewCompany] = useState(false);
  const navigate = useNavigate();

  // Load persisted state on app start
  useEffect(() => {
    const handleStorageChange = () => {
      // Force re-render when signup state changes
      setLoading(prev => !prev && prev); // Trigger re-render
    };
    
    window.addEventListener('signupStateChanged', handleStorageChange);
    return () => window.removeEventListener('signupStateChanged', handleStorageChange);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      const user = JSON.parse(userData);
      setUser(user);
      
      // Clear any stale simulator state on app load
      sessionStorage.removeItem('simulator_complete_state');
      
      // Force fresh data fetch
      setTimeout(() => {
        invalidateAllQueries();
      }, 100);
    }
    setLoading(false);
  }, []);

  const handleNewUser = () => {
    navigate('/signup');
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  const handleCompanySelect = (roleId: string, roleName: string) => {
    updateSignupState({ roleId, roleName });
    navigate('/create-profile');
  };

  const handleBackToCompany = () => {
    navigate('/signup');
  };

  const handleLogin = async (userData: any) => {
    setLoading(true);
    
    // Clear all React Query cache to ensure fresh data for new user
    clearAllQueries();
    
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    
    if (userData.isSuperAdmin) {
      navigate('/admin/simulators');
      setLoading(false);
    } else {
      // Check if user has already selected a company
      const hasSelectedCompany = localStorage.getItem('selectedCompany');
      
      if (!hasSelectedCompany) {
        // Show company selection modal after successful login
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(API_ENDPOINTS.userPermissions, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          const data = await response.json();
          const targetPath = (response.ok && data.menu && data.menu.length > 0) 
            ? data.menu[0].path 
            : '/dashboard/simulator-management';
          
          setPendingNavigation(targetPath);
          setShowCompanySelectionModal(true);
        } catch (error) {
          console.error('Error fetching permissions:', error);
          setPendingNavigation('/dashboard/simulator-management');
          setShowCompanySelectionModal(true);
        }
        setLoading(false);
      } else {
        // Navigate directly if company already selected
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(API_ENDPOINTS.userPermissions, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          const data = await response.json();
          if (response.ok && data.menu && data.menu.length > 0) {
            navigate(data.menu[0].path);
          } else {
            navigate('/dashboard/simulator-management');
          }
        } catch (error) {
          console.error('Error fetching permissions:', error);
          navigate('/dashboard/simulator-management');
        }
        setLoading(false);
      }
    }
    
    // Force fresh data fetch after login
    setTimeout(() => {
      invalidateAllQueries();
    }, 100);
  };

  const handleRegister = (userData: any) => {
    setUser(userData);
    updateSignupState({ email: userData.email });
    navigate('/verify-otp');
  };

  const handleOTPVerified = async () => {
    // Get user data from localStorage (set during registration)
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (userData && token) {
      const user = JSON.parse(userData);
      setUser(user);
      
      // For new users after OTP verification, always go to company-profile first
      // The company-profile completion will handle the final navigation
      navigate('/company-profile');
    } else {
      // If no user data, redirect to login
      toast.error('Session expired. Please login again.');
      navigate('/login');
    }
  };

  const handleBackToProfile = () => {
    navigate('/create-profile');
  };

  const handleCompanyProfileComplete = async () => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (userData && token) {
      const user = JSON.parse(userData);
      setUser(user);
      
      // Clear signup state after setting user
      clearSignupState();
      // Reset creating new company flag
      setIsCreatingNewCompany(false);
      
      // After successful company profile creation, set the user's own company as selected
      // The user becomes the owner of their newly created company
      localStorage.setItem('selectedCompany', user._id);
      
      // Navigate to the appropriate dashboard based on user permissions
      if (!user.isSuperAdmin) {
        try {
          const response = await fetch(API_ENDPOINTS.userPermissions, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          const data = await response.json();
          if (response.ok && data.menu && data.menu.length > 0) {
            navigate(data.menu[0].path);
          } else {
            navigate('/dashboard/simulator-management');
          }
        } catch (error) {
          console.error('Error fetching permissions:', error);
          navigate('/dashboard/simulator-management');
        }
      } else {
        navigate('/admin/simulators');
      }
    } else {
      // If no user data, redirect to login
      toast.error('Session expired. Please login again.');
      navigate('/login');
    }
  };

  const handleUserUpdate = (updatedUser: any) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const handleLogout = () => {
    // Clear all React Query cache on logout
    clearAllQueries();
    
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('tempEmail');
    localStorage.removeItem('selectedCompany');
    
    // Clear simulator state
    sessionStorage.removeItem('simulator_complete_state');
    
    setUser(null);
    navigate('/login');
  };

  const handleCompanySelectionComplete = () => {
    setShowCompanySelectionModal(false);
    if (pendingNavigation) {
      navigate(pendingNavigation);
      setPendingNavigation('');
    } else {
      // Fallback navigation
      navigate('/dashboard/simulator-management');
    }
  };

  const handleCreateNewCompany = () => {
    console.log('Create new company clicked - closing modal');
    // Force close modal immediately
    setShowCompanySelectionModal(false);
    setPendingNavigation('');
    setIsCreatingNewCompany(true);
    
    // Clear any existing signup state
    clearSignupState();
    
    // Force re-render to ensure modal is closed
    setLoading(prev => !prev && prev);
    
    // Navigate after ensuring state is updated
    setTimeout(() => {
      navigate('/signup');
    }, 50);
  };

  // Add effect to handle company selection requirement on route changes
  useEffect(() => {
    if (user && !user.isSuperAdmin && !localStorage.getItem('selectedCompany') && !isCreatingNewCompany) {
      const currentPath = window.location.pathname;
      // Don't show modal if user is in signup flow or on login page
      const isInSignupFlow = currentPath.includes('/signup') || 
                            currentPath.includes('/create-profile') || 
                            currentPath.includes('/verify-otp') || 
                            currentPath.includes('/company-profile') ||
                            currentPath === '/login' ||
                            currentPath === '/forgot-password' ||
                            currentPath.includes('/reset-password');
      
      // Only show modal if user is trying to access protected routes
      if ((currentPath.startsWith('/dashboard') || currentPath === '/profile') && !isInSignupFlow && !showCompanySelectionModal) {
        setShowCompanySelectionModal(true);
        setPendingNavigation(currentPath);
      }
    }
  }, [user, isCreatingNewCompany, showCompanySelectionModal]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      }}>
        <div style={{ textAlign: 'center' }}>
          <i className="fas fa-spinner fa-spin" style={{ fontSize: '24px', color: '#1f4f8f', marginBottom: '16px' }}></i>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <QueryProvider>
      <div className="App">
        {/* {  <SignupStateDebug />  } */}
        
        {/* Company Selection Modal for non-super admin users */}
        {showCompanySelectionModal && !isCreatingNewCompany && (
          <ChangeCompanyModal 
            key={`modal-${showCompanySelectionModal}-${isCreatingNewCompany}`}
            isOpen={showCompanySelectionModal && !isCreatingNewCompany}
            onClose={() => {}} // Prevent closing without selection
            onCompanyChanged={handleCompanySelectionComplete}
            onCreateNewCompany={handleCreateNewCompany}
            isInitialSelection={true}
          />
        )}
        
        <Routes>
          <Route path="/login" element={!user ? <Login onNewUser={handleNewUser} onLogin={handleLogin} /> : <Navigate to={user.isSuperAdmin ? '/admin/simulators' : '/dashboard/simulator-management'} replace />} />
          <Route path="/forgot-password" element={!user ? <ForgotPassword /> : <Navigate to={user.isSuperAdmin ? '/admin/simulators' : '/dashboard/simulator-management'} replace />} />
          <Route path="/reset-password/:token" element={!user ? <ResetPassword /> : <Navigate to={user.isSuperAdmin ? '/admin/simulators' : '/dashboard/simulator-management'} replace />} />
          <Route path="/signup" element={<CompanySelection onBack={handleBackToLogin} onSelect={handleCompanySelect} />} />
          <Route path="/create-profile" element={<CreateProfile onBack={handleBackToCompany} onRegister={handleRegister} onNavigate={(step) => navigate(step)} />} />
          <Route path="/verify-otp" element={<OTPVerification onVerify={handleOTPVerified} onBack={handleBackToProfile} onNavigate={(step) => navigate(step)} />} />
          <Route path="/company-profile" element={<CompanyProfile onComplete={handleCompanyProfileComplete} onNavigate={(step) => navigate(step)} />} />
          <Route path="/verify-advisory/:token" element={<AdvisoryVerification />} />
          <Route path="/verify-member/:token" element={<MemberVerification />} />
          <Route path="/admin/*" element={user?.isSuperAdmin ? <SuperAdminLayout user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />} />
          <Route path="/dashboard" element={user && !user.isSuperAdmin ? (
            localStorage.getItem('selectedCompany') || showCompanySelectionModal ? 
              <DashboardLayout user={user} onLogout={handleLogout} onUserUpdate={handleUserUpdate} /> : 
              <Navigate to="/login" replace />
          ) : <Navigate to="/login" replace />}>
            <Route index element={<Dashboard user={user} onLogout={handleLogout} />} />
            <Route path="simulator" element={<Simulator />} />
            <Route path="simulator-management" element={<Simulator />} />
            <Route path="invitations" element={<Invitations />} />
            <Route path="companies" element={<Companies />} />
            <Route path="associations" element={<Associations />} />
            <Route path="user-management" element={<UserManagement />} />
            <Route path="banking" element={<Banking />} />
            <Route path="association-control" element={<AssociationControl user={user} onLogout={handleLogout} />} />
          </Route>
          <Route path="/profile" element={user ? (
            user.isSuperAdmin || localStorage.getItem('selectedCompany') || showCompanySelectionModal ? 
              <DashboardLayout user={user} onLogout={handleLogout} onUserUpdate={handleUserUpdate} /> : 
              <Navigate to="/login" replace />
          ) : <Navigate to="/login" replace />}>
            <Route index element={<Profile />} />
          </Route>
          <Route path="/" element={<Navigate to={user ? (user.isSuperAdmin ? '/admin/simulators' : '/dashboard/simulator-management') : '/login'} replace />} />
        </Routes>
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      </div>
    </QueryProvider>
  );
}

export default App;