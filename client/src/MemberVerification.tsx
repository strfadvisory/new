import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { API_BASE_URL } from './config';
import './CreateProfile.css';
import AuthSidebar from './components/AuthSidebar';

const MemberVerification: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRePassword, setShowRePassword] = useState(false);
  const [userInfo, setUserInfo] = useState({ firstName: '', lastName: '', email: '', companyName: '' });
  const [password, setPassword] = useState('');
  const [rePassword, setRePassword] = useState('');

  useEffect(() => {
    const verify = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/verify-member/${token}`);
        const data = await response.json();
        if (response.ok) {
          setUserInfo(data);
        } else {
          toast.error(data.message || 'Invalid or expired verification link');
          navigate('/login');
        }
      } catch {
        toast.error('Failed to verify link');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    verify();
  }, [token, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== rePassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setSubmitLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/complete-member/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const data = await response.json();
      if (response.ok) {
        sessionStorage.setItem('token', data.token);
        sessionStorage.setItem('user', JSON.stringify(data.user));
        toast.success('Account activated successfully!');
        navigate('/dashboard');
      } else {
        toast.error(data.message || 'Failed to activate account');
      }
    } catch {
      toast.error('Failed to submit');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontSize: '16px', color: '#6b7280' }}>Verifying link...</div>;

  return (
    <div className="create-profile-container">
      <AuthSidebar />
      <div className="profile-content">
        <div className="profile-form" style={{ maxWidth: '500px', margin: '40px auto' }}>
          <div className="form-card">
            <h2 className="form-title">Activate Your Account</h2>
            <p className="form-description">
              Welcome <strong>{userInfo.firstName} {userInfo.lastName}</strong>! You've been invited to join <strong>{userInfo.companyName || 'the organization'}</strong>. Set a password to activate your account.
            </p>

            <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
              <div style={{ marginBottom: '16px' }}>
                <div style={{ padding: '12px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', color: '#6b7280' }}>
                  <i className="fas fa-envelope" style={{ marginRight: '8px' }}></i>
                  {userInfo.email}
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <div className="password-input">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Password *"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{ width: '100%' }}
                  />
                  <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)} aria-label="Toggle password">
                    <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <div className="password-input">
                  <input
                    type={showRePassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Confirm Password *"
                    value={rePassword}
                    onChange={(e) => setRePassword(e.target.value)}
                    required
                    style={{ width: '100%' }}
                  />
                  <button type="button" className="password-toggle" onClick={() => setShowRePassword(!showRePassword)} aria-label="Toggle confirm password">
                    <i className={`fas ${showRePassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
              </div>

              <button type="submit" className="primary-button" disabled={submitLoading}>
                {submitLoading ? <><i className="fas fa-spinner fa-spin"></i> Activating...</> : 'Activate Account'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberVerification;
