import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Login from './Login';
import CompanySelection from './CompanySelection';
import CreateProfile from './CreateProfile';
import OTPVerification from './OTPVerification';
import CompanyProfile from './CompanyProfile';
import Dashboard from './Dashboard';
import SuperAdminLayout from './SuperAdminLayout';

function App() {
  const [user, setUser] = useState<any>(null);
  const [selectedCompanyType, setSelectedCompanyType] = useState<string>('');
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [selectedRoleName, setSelectedRoleName] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    const currentPath = window.location.pathname;
    
    if (token && userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      
      // Only redirect if on login or root page
      if (currentPath === '/login' || currentPath === '/') {
        if (parsedUser.isSuperAdmin) {
          navigate('/admin/companies');
        } else {
          navigate('/dashboard');
        }
      }
    } else if (currentPath !== '/login' && currentPath !== '/' && !currentPath.startsWith('/signup') && !currentPath.startsWith('/create-profile') && !currentPath.startsWith('/verify-otp') && !currentPath.startsWith('/company-profile')) {
      // Redirect to login if token expired and not on public pages
      navigate('/login');
    }
  }, [navigate]);

  const handleNewUser = () => {
    navigate('/signup');
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  const handleCompanySelect = (roleId: string, roleName: string) => {
    setSelectedRoleId(roleId);
    setSelectedRoleName(roleName);
    navigate('/create-profile');
  };

  const handleBackToCompany = () => {
    navigate('/signup');
  };

  const handleLogin = (userData: any) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    if (userData.isSuperAdmin) {
      navigate('/admin/companies');
    } else {
      navigate('/dashboard');
    }
  };

  const handleRegister = (userData: any) => {
    setUser(userData);
    setUserEmail(userData.email || localStorage.getItem('tempEmail') || '');
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
    navigate('/dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('tempEmail');
    setUser(null);
    navigate('/login');
  };

  return (
    <div className="App">
      <Routes>
        <Route path="/login" element={<Login onNewUser={handleNewUser} onLogin={handleLogin} />} />
        <Route path="/signup" element={<CompanySelection onBack={handleBackToLogin} onSelect={handleCompanySelect} />} />
        <Route path="/create-profile" element={<CreateProfile onBack={handleBackToCompany} onRegister={handleRegister} roleId={selectedRoleId} roleName={selectedRoleName} />} />
        <Route path="/verify-otp" element={<OTPVerification email={userEmail} onVerify={handleOTPVerified} onBack={handleBackToProfile} />} />
        <Route path="/company-profile" element={<CompanyProfile onComplete={handleCompanyProfileComplete} />} />
        <Route path="/admin/*" element={user?.isSuperAdmin ? <SuperAdminLayout user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} />
        <Route path="/dashboard" element={user && !user.isSuperAdmin ? <Dashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
    </div>
  );
}

export default App;