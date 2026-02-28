import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import './CreateProfile.css';
import { API_BASE_URL } from './config';
import Breadcrumb from './components/Breadcrumb';

interface OTPVerificationProps {
  email: string;
  onVerify: () => void;
  onBack: () => void;
  onNavigate?: (step: string) => void;
}

const OTPVerification: React.FC<OTPVerificationProps> = ({ email, onVerify, onBack, onNavigate }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

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
      const response = await fetch(`${API_BASE_URL}/api/auth/resend-otp`, {
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
      const response = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
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
    <div className="create-profile-container">
      <div className="profile-sidebar">
        <div className="logo">
          <img src="/logo.png" alt="Reserve Fund Advisory" className="logo-image" />
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
      
      <div className="profile-content">
        <Breadcrumb items={[
          { label: 'Select Company', onClick: () => onNavigate?.('/signup') },
          { label: 'Create Profile', onClick: () => onNavigate?.('/create-profile') },
          { label: 'OTP Verification', active: true }
        ]} />
        
        <div className="profile-form" style={{maxWidth: '600px', margin: '0 auto'}}>
          <h1 style={{fontSize: '32px', fontWeight: '700', marginBottom: '8px', textAlign: 'left'}}>OTP Verification</h1>
          <p style={{fontSize: '16px', color: '#6b7280', marginBottom: '8px', textAlign: 'left'}}>Verify your email address {maskEmail(email)}</p>
          <p style={{fontSize: '16px', color: '#6b7280', marginBottom: '40px', textAlign: 'left'}}>Enter the OTP sent to your registered contact to verify and access the system.</p>
          
          <form onSubmit={handleSubmit}>
            <div style={{display: 'flex', justifyContent: 'space-between', gap: '8px', marginBottom: '32px'}}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  style={{
                    width: 'calc((100% - 40px) / 6)',
                    height: '50px',
                    fontSize: '20px',
                    fontWeight: '600',
                    textAlign: 'center',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    outline: 'none',
                    backgroundColor: '#ffffff',
                    color: '#1f2937'
                  }}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              ))}
            </div>
            
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'flex-start', marginBottom: '32px', fontSize: '16px'}}>
              <span style={{color: '#1f2937', fontWeight: '500', marginRight: '16px'}}>
                {timer > 0 ? `${timer} Second` : ''}
              </span>
              <button 
                type="button" 
                onClick={handleResend} 
                disabled={!canResend || resending}
                style={{
                  background: 'none',
                  border: 'none',
                  color: canResend ? '#3b82f6' : '#9ca3af',
                  fontSize: '16px',
                  cursor: canResend ? 'pointer' : 'not-allowed',
                  textDecoration: 'underline',
                  fontWeight: '500'
                }}
              >
                {resending ? 'Sending...' : 'Resend Code'}
              </button>
            </div>
            
            <button 
              type="submit" 
              disabled={loading || otp.join('').length !== 6}
              style={{
                width: '100%',
                backgroundColor: '#1e40af',
                color: 'white',
                border: 'none',
                padding: '16px 24px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: loading || otp.join('').length !== 6 ? 'not-allowed' : 'pointer',
                marginBottom: '16px',
                opacity: loading || otp.join('').length !== 6 ? 0.6 : 1
              }}
            >
              {loading ? 'Verifying...' : 'Continue'}
            </button>
            
            <button 
              type="button" 
              onClick={onBack} 
              style={{
                width: '100%',
                backgroundColor: 'transparent',
                color: '#6b7280',
                border: '1px solid #d1d5db',
                padding: '16px 24px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Back to Profile
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;
