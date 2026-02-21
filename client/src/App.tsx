import React, { useState, useEffect } from 'react';
import Login from './Login';
import CompanySelection from './CompanySelection';
import CreateProfile from './CreateProfile';
import Dashboard from './Dashboard';

function App() {
  const [currentPage, setCurrentPage] = useState<'login' | 'company' | 'profile' | 'dashboard'>('login');
  const [user, setUser] = useState<any>(null);
  const [selectedCompanyType, setSelectedCompanyType] = useState<string>('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
      setCurrentPage('dashboard');
    }
  }, []);

  const handleNewUser = () => {
    setCurrentPage('company');
  };

  const handleBackToLogin = () => {
    setCurrentPage('login');
  };

  const handleCompanySelect = (companyType: string) => {
    setSelectedCompanyType(companyType);
    setCurrentPage('profile');
  };

  const handleBackToCompany = () => {
    setCurrentPage('company');
  };

  const handleLogin = (userData: any) => {
    setUser(userData);
    setCurrentPage('dashboard');
  };

  const handleRegister = (userData: any) => {
    setUser(userData);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setCurrentPage('login');
  };

  return (
    <div className="App">
      {currentPage === 'login' && (
        <Login onNewUser={handleNewUser} onLogin={handleLogin} />
      )}
      {currentPage === 'company' && (
        <CompanySelection onBack={handleBackToLogin} onSelect={handleCompanySelect} />
      )}
      {currentPage === 'profile' && (
        <CreateProfile onBack={handleBackToCompany} onRegister={handleRegister} companyType={selectedCompanyType} />
      )}
      {currentPage === 'dashboard' && (
        <Dashboard user={user} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;