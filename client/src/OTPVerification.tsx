import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import './CreateProfile.css';
import { API_ENDPOINTS } from './config';
import { updateSignupState, getSignupState, getFormData } from './utils/signupState';
import Breadcrumb from './components/Breadcrumb';
import AuthSidebar from './components/AuthSidebar';

interface OTPVerificationProps {
  onVerify: () => void;
  onBack: () => void;
  onNavigate?: (step: string) => void;
}

const OTPVerification: React.FC<OTPVerificationProps> = ({ onVerify, onBack, onNavigate }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  // Get email from signup state
  const email = getSignupState().email || getFormData().email || '';

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (!/^[0-9]*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    
    setResending(true);
    try {
      const response = await fetch(API_ENDPOINTS.resendOtp, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await response.json();
      if (response.ok) {
        toast.success('OTP resent successfully');
        setTimer(30);
        setCanResend(false);
        setOtp(['', '', '', '', '', '']);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  const maskEmail = (email: string) => {
    const [localPart, domain] = email.split('@');
    if (localPart.length <= 3) {
      return `${localPart[0]}***@${domain}`;
    }
    return `${localPart.slice(0, 3)}***@${domain}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join('');
    
    if (otpCode.length !== 6) {
      toast.error('Please enter complete OTP');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.verifyOtp, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otpCode })
      });
      const data = await response.json();
      
      if (response.ok) {
        toast.success('OTP verified successfully');
        onVerify();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container" style={{ display: 'flex', height: '100vh', fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      <AuthSidebar />
      
      <div className="form-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'white' }}>
        <Breadcrumb items={[
          { label: 'Select Company', onClick: () => {
            updateSignupState({ currentStep: 'company-selection' });
            onNavigate?.('/signup');
          }},
          { label: 'Create Profile', onClick: () => {
            updateSignupState({ currentStep: 'create-profile' });
            onNavigate?.('/create-profile');
          }},
          { label: 'OTP Verification', active: true }
        ]} />
        
        <div style={{ maxWidth: '800px', width: '100%', margin: '0 auto', padding: '20px' }}>
          <div className="form-card" style={{ background: '#ffffff', borderRadius: '10px', padding: '0', border: '1px solid #e6e6e6', width: '100%' }}>
            <h2 className="form-title" style={{ fontSize: '20px', fontWeight: '600', color: '#2f2f2f', margin: '0', marginBottom: '8px', borderBottom: '1px solid #e6e6e6', padding: '20px 20px 8px 20px' }}>OTP Verification</h2>
            <p className="form-description" style={{ fontSize: '14px', color: '#6b7280', margin: '0', marginBottom: '20px', lineHeight: '1.5', padding: '0 20px' }}>Verify your email address {maskEmail(email)}. Enter the OTP sent to your registered contact to verify and access the system.</p>
            
            <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      className="form-input"
                      style={{
                        width: 'calc((100% - 40px) / 6)',
                        height: '44px',
                        fontSize: '20px',
                        fontWeight: '600',
                        textAlign: 'center',
                        border: '1px solid #dcdcdc',
                        borderRadius: '8px',
                        background: '#fafafa',
                        transition: 'all 0.2s ease',
                        color: '#1f2937'
                      }}
                      value={digit}
                      onChange={(e) => handleChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#2b6cb0';
                        e.target.style.background = 'white';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#dcdcdc';
                        e.target.style.background = '#fafafa';
                      }}
                    />
                  ))}
                </div>
              </div>
              
              <div className="form-options" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', marginBottom: '25px', fontSize: '14px' }}>
                <span style={{ color: '#374151', fontWeight: '500', marginRight: '16px' }}>
                  {timer > 0 ? `${timer} Second` : ''}
                </span>
                <button 
                  type="button" 
                  onClick={handleResend} 
                  disabled={!canResend || resending}
                  className="forgot-password"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: canResend ? '#1f4f8f' : '#9ca3af',
                    fontSize: '14px',
                    cursor: canResend ? 'pointer' : 'not-allowed',
                    textDecoration: 'none',
                    fontWeight: '500'
                  }}
                  onMouseEnter={(e) => {
                    if (canResend) e.currentTarget.style.textDecoration = 'underline';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.textDecoration = 'none';
                  }}
                >
                  {resending ? 'Sending...' : 'Resend Code'}
                </button>
              </div>
              
              <button 
                type="submit" 
                disabled={loading || otp.join('').length !== 6}
                className="primary-button"
                style={{
                  height: '48px',
                  borderRadius: '8px',
                  background: '#1f4f8f',
                  color: 'white',
                  fontWeight: '600',
                  fontSize: '15px',
                  width: '100%',
                  border: 'none',
                  cursor: loading || otp.join('').length !== 6 ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  marginBottom: '16px',
                  opacity: loading || otp.join('').length !== 6 ? 0.6 : 1
                }}
                onMouseEnter={(e) => {
                  if (!loading && otp.join('').length === 6) {
                    e.currentTarget.style.background = '#173f74';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#1f4f8f';
                }}
              >
                {loading ? 'Verifying...' : 'Continue'}
              </button>
              
              <button 
                type="button" 
                onClick={onBack} 
                className="secondary-button"
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
                Back to Profile
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;