import React, { useState } from 'react';
import { toast } from 'react-toastify';
import './Login.css';
import { API_ENDPOINTS } from './config';
import AuthSidebar from './components/AuthSidebar';
import FormInput from './components/FormInput';
import PrimaryButton from './components/PrimaryButton';

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
        <div className="form-card">
          <h2 className="form-title">Access your Account</h2>
          <p className="form-description">Enter your credentials to access your account and manage your organization.</p>
          
          <form onSubmit={handleLogin}>
            <FormInput
              label="Email Address*"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Email Address*"
            />
            
            <FormInput
              label="Password*"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Password*"
            />
            
            <div className="form-options">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Remember me
              </label>
              <a href="/forgot-password" className="forgot-password">Forgot Password?</a>
            </div>
            
            <PrimaryButton type="submit" disabled={loading} loading={loading}>
              Continue
            </PrimaryButton>
          </form>
          
          <div className="secondary-action">
            <button 
              type="button" 
              onClick={onNewUser} 
              className="secondary-link"
            >
              Don't have an Account? Sign Up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;