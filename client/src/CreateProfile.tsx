import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import './CreateProfile.css';
import { API_BASE_URL } from './config';

interface CreateProfileProps {
  onBack: () => void;
  onRegister: (user: any) => void;
  companyType?: string;
  roleId?: string;
  roleName?: string;
}

const CreateProfile: React.FC<CreateProfileProps> = ({ onBack, onRegister, companyType, roleId, roleName }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    designation: '',
    phone: '',
    password: '',
    rePassword: '',
    zipCode: '',
    state: '',
    city: '',
    address1: '',
    address2: ''
  });

  const [emailValidation, setEmailValidation] = useState<{ valid: boolean | null, message: string, checking: boolean }>({ valid: null, message: '', checking: false });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!companyType && !roleName) {
      navigate('/');
    }
  }, [companyType, roleName, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateEmail = async (email: string) => {
    if (!email) {
      setEmailValidation({ valid: null, message: '', checking: false });
      return;
    }

    setEmailValidation({ valid: null, message: '', checking: true });
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/validate/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await response.json();
      
      setEmailValidation({ 
        valid: data.valid, 
        message: data.message, 
        checking: false 
      });
    } catch (error) {
      setEmailValidation({ 
        valid: false, 
        message: 'Error validating email', 
        checking: false 
      });
    }
  };

  const handleEmailBlur = () => {
    validateEmail(formData.email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.rePassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          designation: formData.designation,
          phone: formData.phone,
          password: formData.password,
          address: {
            zipCode: formData.zipCode,
            state: formData.state,
            city: formData.city,
            address1: formData.address1,
            address2: formData.address2
          },
          roleId
        })
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        toast.success('OTP sent to your email');
        onRegister({ ...data, email: formData.email });
      } else {
        toast.error(data.message || 'Registration failed');
      }
    } catch (error) {
      toast.error('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-profile-container">
      <div className="profile-sidebar">
        <div className="logo">
          <img src="/logo.png" alt="Reserve Fund Advisory" className="logo-image" />
          <div className="logo-text">
            <div className="company-name">RESERVE FUND</div>
            <div className="company-subtitle">ADVISORY LLC</div>
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
      
      <div className="profile-content">
        <div className="breadcrumb">
          <span>Select Company</span>
          <i className="fas fa-chevron-right"></i>
          <span className="active">{roleName || companyType}</span>
          <i className="fas fa-chevron-right"></i>
          <span>Create Profile</span>
        </div>
        
        <div className="profile-form" style={{maxWidth: '600px', margin: '0 auto'}}>
          <h1>Create your profile</h1>
          <p>Set up a new organizational entity to manage Users, modules, and operations efficiently.</p>
          
          <form onSubmit={handleSubmit}>
            <div className="row g-4">
              <div className="col-md-6">
                <div className="form-group">
                  <label>First name *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <label>Last Name*</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </div>
            
            <div className="row g-4 mt-2">
              <div className="col-12">
                <div className="form-group">
                  <label>Email Address*</label>
                  <input
                    type="email"
                    className={emailValidation.valid === false ? 'is-invalid' : emailValidation.valid === true ? 'is-valid' : ''}
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    onBlur={handleEmailBlur}
                    required
                  />
                  {emailValidation.checking && (
                    <div className="text-muted small mt-1">
                      <i className="fas fa-spinner fa-spin me-1"></i>Checking email...
                    </div>
                  )}
                  {emailValidation.valid === false && (
                    <div className="invalid-feedback" style={{display: 'block', color: '#ef4444', fontSize: '12px', marginTop: '4px'}}>{emailValidation.message}</div>
                  )}
                  {emailValidation.valid === true && (
                    <div className="valid-feedback" style={{display: 'block', color: '#10b981', fontSize: '12px', marginTop: '4px'}}>{emailValidation.message}</div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="row g-4 mt-2">
              <div className="col-12">
                <div className="form-group">
                  <label>Designation*</label>
                  <input
                    type="text"
                    name="designation"
                    value={formData.designation}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </div>
            
            <div className="row g-4 mt-2">
              <div className="col-12">
                <div className="form-group phone-group">
                  <label>Phone*</label>
                  <div className="phone-input">
                    <span className="country-code">
                      <img src="https://flagcdn.com/w20/us.png" alt="US" />
                      +1
                    </span>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="99999 99999"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="section-title mt-5">
              <h3>Create Your Password</h3>
              <p>Create a new password to set up your account and access the system.</p>
            </div>
            
            <div className="row g-4">
              <div className="col-12">
                <div className="form-group">
                  <label>Password*</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </div>
            
            <div className="row g-4 mt-2">
              <div className="col-12">
                <div className="form-group">
                  <label>Re Password*</label>
                  <input
                    type="password"
                    name="rePassword"
                    value={formData.rePassword}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </div>
            
            <div className="section-title mt-5">
              <h3>Add your Address</h3>
              <p>Provide the official location details of , including street, city, state, country, and ZIP code.</p>
            </div>
            
            <div className="row g-4">
              <div className="col-md-6">
                <div className="form-group">
                  <label>Zip Code*</label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <label>State*</label>
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select State</option>
                    <option value="FL">Florida</option>
                    <option value="CA">California</option>
                    <option value="NY">New York</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="row g-4 mt-2">
              <div className="col-12">
                <div className="form-group">
                  <label>City*</label>
                  <select
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select City</option>
                    <option value="miami">Miami</option>
                    <option value="tampa">Tampa</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="row g-4 mt-2">
              <div className="col-12">
                <div className="form-group">
                  <label>Address 1*</label>
                  <input
                    type="text"
                    name="address1"
                    value={formData.address1}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </div>
            
            <div className="row g-4 mt-2">
              <div className="col-12">
                <div className="form-group">
                  <label>Address 2*</label>
                  <input
                    type="text"
                    name="address2"
                    value={formData.address2}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </div>
            
            <div className="form-note mt-4">
              <p className="text-muted small">Please note that fields marked with * are mandatory.</p>
            </div>
            
            <button type="submit" className="continue-button" disabled={loading}>
              {loading ? <><i className="fas fa-spinner fa-spin"></i> Loading...</> : 'Continue'}
            </button>
            
            <div className="change-company">
              <button type="button" onClick={onBack} className="change-company-link">
                Change my company type
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateProfile;