import React, { useState } from 'react';
import './Login.css';

interface LoginProps {
  onNewUser: () => void;
  onLogin: (user: any) => void;
}

const Login: React.FC<LoginProps> = ({ onNewUser, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
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
        alert(data.message);
      }
    } catch (error) {
      alert('Login failed');
    }
  };

  return (
    <div className="login-container">
      <div className="login-sidebar">
        <div className="logo">
          <div className="logo-icon">
            <div className="signal-bars">
              <div className="bar"></div>
              <div className="bar"></div>
              <div className="bar"></div>
            </div>
          </div>
          <div className="logo-text">
            <div>RESERVE FUND</div>
            <div>ADVISORY</div>
          </div>
        </div>
        <div className="contact-info">
          <div className="contact-item">
            <i className="fas fa-envelope"></i> info@reservefundadvisory.com
          </div>
          <div className="contact-item">
            <i className="fas fa-phone"></i> 727-788-4800
          </div>
        </div>
      </div>
      
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
            
            <button type="submit" className="login-button">Login</button>
            
            <div className="new-user">
              <button type="button" onClick={onNewUser} className="new-user-link">
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