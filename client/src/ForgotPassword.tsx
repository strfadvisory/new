import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import { API_ENDPOINTS } from './config';
import AuthSidebar from './components/AuthSidebar';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.forgotPassword, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSubmitted(true);
        toast.success('Password reset link sent! Check your email.');
      } else {
        toast.error(data.message || 'Failed to send reset link');
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <AuthSidebar />
      
      <div className="login-form-container">
        <div className="login-form">
          {!submitted ? (
            <>
              <h1>Forgot Password?</h1>
              <p>Enter your email address and we'll send you a link to reset your password.</p>
              
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <input
                    type="email"
                    className="form-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email Address *"
                    required
                    style={{width: '100%'}}
                  />
                </div>
                
                <button type="submit" className="login-button" disabled={loading}>
                  {loading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i> Sending...
                    </>
                  ) : (
                    'Send Reset Link'
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
            </>
          ) : (
            <>
              <div style={{ textAlign: 'center' }}>
                <i className="fas fa-check-circle" style={{ fontSize: '64px', color: '#10b981', marginBottom: '20px' }}></i>
                <h1>Check Your Email</h1>
                <p>We've sent a password reset link to <strong>{email}</strong></p>
                <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '20px' }}>
                  The link will expire in 15 minutes. If you don't see the email, check your spam folder.
                </p>
              </div>
              
              <div className="new-user" style={{ marginTop: '30px' }}>
                <button 
                  type="button" 
                  onClick={() => navigate('/login')}
                  className="login-button"
                >
                  Back to Login
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
