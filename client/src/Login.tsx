import React, { useState } from 'react';
import { toast } from 'react-toastify';
import './Login.css';
import { API_ENDPOINTS } from './config';
import AuthSidebar from './components/AuthSidebar';

interface LoginProps {
  onNewUser: () => void;
  onLogin: (user: any) => void;
}

const Login: React.FC<LoginProps> = ({ onNewUser, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.login, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data));
        onLogin(data);
      } else {
        toast.error(data.message || 'Login failed');
      }
    } catch (error) {
      toast.error('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <AuthSidebar />
      
      <div className="login-form-container">
        <div className="login-form">
          <h1>Access your Account</h1>
          <p>Set up a new organisational entity to manage Users, modules, and operations efficiently.</p>
          
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Register Email Address*</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Password*</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <div className="form-options">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Remember me
              </label>
              <a href="#" className="forgot-password">Forgot Password?</a>
            </div>
            
            <button type="submit" className="login-button" disabled={loading}>
              {loading ? <><i className="fas fa-spinner fa-spin"></i> Loading...</> : 'Login'}
            </button>
            
            <div className="new-user">
              <button 
                type="button" 
                onClick={onNewUser} 
                className="company-not-listed-btn"
                style={{
                  background: 'white',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                  width: '100%'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                  e.currentTarget.style.borderColor = '#9ca3af';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.borderColor = '#d1d5db';
                }}
              >
                I am new user
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;