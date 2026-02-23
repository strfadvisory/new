import React, { useState } from 'react';
import { toast } from 'react-toastify';
import './CreateProfile.css';

interface CreateProfileProps {
  onBack: () => void;
  onRegister: (user: any) => void;
  companyType: string;
}

const CreateProfile: React.FC<CreateProfileProps> = ({ onBack, onRegister, companyType }) => {
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
      const response = await fetch('http://localhost:5000/api/validate/email', {
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
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
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
          companyType
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
          <span className="active">{companyType}</span>
          <i className="fas fa-chevron-right"></i>
          <span>Create Profile</span>
        </div>
        
        <div className="profile-form" style={{maxWidth: '600px', margin: '0 auto'}}>
          <h1>Create your profile</h1>
          <p>Set up a new organizational entity to manage Users, modules, and operations efficiently.</p>
          
          <form onSubmit={handleSubmit}>
            <div className="row g-4">
              <div className="col-md-6">
                <label className="form-label">First name *</label>
                <input
                  type="text"
                  className="form-control"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Last Name*</label>
                <input
                  type="text"
                  className="form-control"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            
            <div className="row g-4 mt-2">
              <div className="col-12">
                <label className="form-label">Email Address*</label>
                <input
                  type="email"
                  className={`form-control ${
                    emailValidation.valid === false ? 'is-invalid' : 
                    emailValidation.valid === true ? 'is-valid' : ''
                  }`}
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
                  <div className="invalid-feedback">{emailValidation.message}</div>
                )}
                {emailValidation.valid === true && (
                  <div className="valid-feedback">{emailValidation.message}</div>
                )}
              </div>
            </div>
            
            <div className="row g-4 mt-2">
              <div className="col-12">
                <label className="form-label">Designation*</label>
                <input
                  type="text"
                  className="form-control"
                  name="designation"
                  value={formData.designation}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            
            <div className="row g-4 mt-2">
              <div className="col-12">
                <label className="form-label">Phone*</label>
                <div className="input-group">
                  <span className="input-group-text">
                    <img src="https://flagcdn.com/w20/us.png" alt="US" className="me-2" style={{width: '16px'}} />
                    +1
                  </span>
                  <input
                    type="tel"
                    className="form-control"
                    name="phone"
                    placeholder="99999 99999"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </div>
            
            <div className="section-title mt-5">
              <h3>Create Your Password</h3>
              <p>Create a new password to set up your account and access the system.</p>
            </div>
            
            <div className="row g-4">
              <div className="col-12">
                <label className="form-label">Password*</label>
                <input
                  type="password"
                  className="form-control"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            
            <div className="row g-4 mt-2">
              <div className="col-12">
                <label className="form-label">Re Password*</label>
                <input
                  type="password"
                  className="form-control"
                  name="rePassword"
                  value={formData.rePassword}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            
            <div className="section-title mt-5">
              <h3>Add your Address</h3>
              <p>Provide the official location details of , including street, city, state, country, and ZIP code.</p>
            </div>
            
            <div className="row g-4">
              <div className="col-md-6">
                <label className="form-label">Zip Code*</label>
                <input
                  type="text"
                  className="form-control"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">State*</label>
                <select
                  className="form-select"
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
            
            <div className="row g-4 mt-2">
              <div className="col-12">
                <label className="form-label">City*</label>
                <select
                  className="form-select"
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
            
            <div className="row g-4 mt-2">
              <div className="col-12">
                <label className="form-label">Address 1*</label>
                <input
                  type="text"
                  className="form-control"
                  name="address1"
                  value={formData.address1}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            
            <div className="row g-4 mt-2">
              <div className="col-12">
                <label className="form-label">Address 2*</label>
                <input
                  type="text"
                  className="form-control"
                  name="address2"
                  value={formData.address2}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            
            <div className="form-note mt-4">
              <p className="text-muted small">Please note that fields marked with * are mandatory.</p>
            </div>
            
            <button type="submit" className="btn btn-primary w-100 mt-4 py-2">Continue</button>
            
            <div className="text-center mt-3">
              <button type="button" onClick={onBack} className="btn btn-link text-muted p-0">
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