import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { updateSignupState, getSignupState, clearSignupState, getFormData } from './utils/signupState';
import SignupStateDebug from './components/SignupStateDebug';
import Login from './Login';
import CompanySelection from './CompanySelection';
import CreateProfile from './CreateProfile';
import OTPVerification from './OTPVerification';
import CompanyProfile from './CompanyProfile';
import AdvisoryVerification from './AdvisoryVerification';
import Dashboard from './Dashboard';
import DashboardLayout from './DashboardLayout';
import SuperAdminLayout from './SuperAdminLayout';
import Simulator from './pages/Simulator';
import Invitations from './pages/Invitations';
import Companies from './pages/Companies';
import Associations from './pages/Associations';
import Users from './pages/Users';
import Banking from './pages/Banking';

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCompanyType, setSelectedCompanyType] = useState<string>('');
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [selectedRoleName, setSelectedRoleName] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
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
      setUser(JSON.parse(userData));
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

  const handleLogin = (userData: any) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    navigate(userData.isSuperAdmin ? '/admin/companies' : '/dashboard');
  };

  const handleRegister = (userData: any) => {
    setUser(userData);
    updateSignupState({ email: userData.email });
    navigate('/verify-otp');
  };

  const handleOTPVerified = () => {
    navigate('/company-profile');
  };

  const handleBackToProfile = () => {
    navigate('/create-profile');
  };

  const handleCompanyProfileComplete = () => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    clearSignupState();
    navigate('/dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('tempEmail');
    setUser(null);
    navigate('/login');
  };

  if (loading) return null;

  return (
    <div className="App">
      {/* <SignupStateDebug /> */}
      <Routes>
        <Route path="/login" element={!user ? <Login onNewUser={handleNewUser} onLogin={handleLogin} /> : <Navigate to={user.isSuperAdmin ? '/admin/companies' : '/dashboard'} replace />} />
        <Route path="/signup" element={<CompanySelection onBack={handleBackToLogin} onSelect={handleCompanySelect} />} />
        <Route path="/create-profile" element={<CreateProfile onBack={handleBackToCompany} onRegister={handleRegister} onNavigate={(step) => navigate(step)} />} />
        <Route path="/verify-otp" element={<OTPVerification onVerify={handleOTPVerified} onBack={handleBackToProfile} onNavigate={(step) => navigate(step)} />} />
        <Route path="/company-profile" element={<CompanyProfile onComplete={handleCompanyProfileComplete} onNavigate={(step) => navigate(step)} />} />
        <Route path="/verify-advisory/:token" element={<AdvisoryVerification />} />
        <Route path="/admin/*" element={user?.isSuperAdmin ? <SuperAdminLayout user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />} />
        <Route path="/dashboard" element={user && !user.isSuperAdmin ? <DashboardLayout user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />}>
          <Route index element={<Dashboard user={user} onLogout={handleLogout} />} />
          <Route path="simulator" element={<Simulator />} />
          <Route path="invitations" element={<Invitations />} />
          <Route path="companies" element={<Companies />} />
          <Route path="associations" element={<Associations />} />
          <Route path="users" element={<Users />} />
          <Route path="banking" element={<Banking />} />
        </Route>
        <Route path="/" element={<Navigate to={user ? (user.isSuperAdmin ? '/admin/companies' : '/dashboard') : '/login'} replace />} />
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
    </div>
  );
}

export default App;