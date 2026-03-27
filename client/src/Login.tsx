import React, { useState } from 'react';
import { toast } from 'react-toastify';
import './Login.css';
import { API_ENDPOINTS } from './config';
import AuthSidebar from './components/AuthSidebar';
import FormInput from './components/FormInput';
import PrimaryButton from './components/PrimaryButton';
import SimulatorStateManager from './utils/simulatorStateManager';
import { transform } from 'typescript';

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
        // Clear any existing simulator state for fresh login
        const stateManager = SimulatorStateManager.getInstance();
        stateManager.forceReset();
        
        sessionStorage.setItem('token', data.token);
        sessionStorage.setItem('user', JSON.stringify(data));
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
      <div className="login-form-container login-form-container-new">
        <div className="form-card-new">
          <div className="row m-0 align-items-center">
              <div className="col-9 ps-0">
                <h2 className="login-title">Sign in to Your Account</h2> 
                <p className="login-description">Enter your credentials to securely access your account and manage your activities.</p>
              </div>
              <div className="col-3 d-flex justify-content-end pe-0">
                <img src="/lock-icon.png" alt="Lock Icon" className="logo-image" />
              </div>
          </div>
          
          <div className='login-form-div'>
               <form onSubmit={handleLogin}>
            <label className='mb-2'>Register Email Address</label>
            <FormInput
              label="Email Address*"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Company name"
            />
            <label htmlFor="password" className='mb-2'>Password</label>
            <FormInput
              label="Password*"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter Password"
            />
            
            <div className="form-options">
              <label className="checkbox-label mb-0">
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
             I don’t have Account  Create new
            </button>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;