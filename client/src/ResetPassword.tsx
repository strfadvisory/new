import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';
import './Login.css';
import { API_ENDPOINTS } from './config';
import AuthSidebar from './components/AuthSidebar';

const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [validToken, setValidToken] = useState(false);
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();

  useEffect(() => {
    verifyToken();
  }, [token]);

  const verifyToken = async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.verifyResetToken}/${token}`);
      const data = await response.json();
      
      if (response.ok) {
        setValidToken(true);
      } else {
        toast.error(data.message || 'Invalid or expired reset link');
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (error) {
      toast.error('Invalid reset link');
      setTimeout(() => navigate('/login'), 2000);
    } finally {
      setVerifying(false);
    }
  };

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 6) {
      return 'Password must be at least 6 characters long';
    }
    if (!/[A-Z]/.test(pwd)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/[a-z]/.test(pwd)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/[0-9]/.test(pwd)) {
      return 'Password must contain at least one number';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validatePassword(password);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_ENDPOINTS.resetPassword}/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success('Password reset successful! You can now login.');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        toast.error(data.message || 'Failed to reset password');
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className="login-container">
        <AuthSidebar />
        <div className="login-form-container">
          <div className="login-form" style={{ textAlign: 'center' }}>
            <i className="fas fa-spinner fa-spin" style={{ fontSize: '48px', color: '#0e519b' }}></i>
            <p style={{ marginTop: '20px' }}>Verifying reset link...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!validToken) {
    return null;
  }

  return (
    <div className="login-container">
      <AuthSidebar />
      
      <div className="login-form-container">
        <div className="login-form">
          <h1>Reset Password</h1>
          <p>Enter your new password below.</p>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>New Password*</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                  style={{ paddingRight: '45px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#6b7280',
                    fontSize: '16px'
                  }}
                >
                  <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
              <small style={{ color: '#6b7280', fontSize: '12px', marginTop: '5px', display: 'block' }}>
                Must be at least 6 characters with uppercase, lowercase, and number
              </small>
            </div>
            
            <div className="form-group">
              <label>Confirm Password*</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                  style={{ paddingRight: '45px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#6b7280',
                    fontSize: '16px'
                  }}
                >
                  <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>
            
            <button type="submit" className="login-button" disabled={loading}>
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Resetting...
                </>
              ) : (
                'Reset Password'
              )}
            </button>
            
            <div className="new-user" style={{ marginTop: '20px' }}>
              <button 
                type="button" 
                onClick={() => navigate('/login')}
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
              >
                Back to Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
