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
  const [cities, setCities] = useState<string[]>([]);
  const [loadingZip, setLoadingZip] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('US');

  const countries = [
    { code: 'US', name: 'United States', dialCode: '+1', flag: 'us' },
    { code: 'CA', name: 'Canada', dialCode: '+1', flag: 'ca' },
    { code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: 'gb' },
    { code: 'AU', name: 'Australia', dialCode: '+61', flag: 'au' },
    { code: 'IN', name: 'India', dialCode: '+91', flag: 'in' },
    { code: 'MX', name: 'Mexico', dialCode: '+52', flag: 'mx' },
    { code: 'DE', name: 'Germany', dialCode: '+49', flag: 'de' },
    { code: 'FR', name: 'France', dialCode: '+33', flag: 'fr' },
    { code: 'IT', name: 'Italy', dialCode: '+39', flag: 'it' },
    { code: 'ES', name: 'Spain', dialCode: '+34', flag: 'es' },
    { code: 'BR', name: 'Brazil', dialCode: '+55', flag: 'br' },
    { code: 'JP', name: 'Japan', dialCode: '+81', flag: 'jp' },
    { code: 'CN', name: 'China', dialCode: '+86', flag: 'cn' },
    { code: 'KR', name: 'South Korea', dialCode: '+82', flag: 'kr' },
  ];

  const currentCountry = countries.find(c => c.code === selectedCountry) || countries[0];

  const usStates = [
    { code: 'AL', name: 'Alabama' }, { code: 'AK', name: 'Alaska' }, { code: 'AZ', name: 'Arizona' },
    { code: 'AR', name: 'Arkansas' }, { code: 'CA', name: 'California' }, { code: 'CO', name: 'Colorado' },
    { code: 'CT', name: 'Connecticut' }, { code: 'DE', name: 'Delaware' }, { code: 'FL', name: 'Florida' },
    { code: 'GA', name: 'Georgia' }, { code: 'HI', name: 'Hawaii' }, { code: 'ID', name: 'Idaho' },
    { code: 'IL', name: 'Illinois' }, { code: 'IN', name: 'Indiana' }, { code: 'IA', name: 'Iowa' },
    { code: 'KS', name: 'Kansas' }, { code: 'KY', name: 'Kentucky' }, { code: 'LA', name: 'Louisiana' },
    { code: 'ME', name: 'Maine' }, { code: 'MD', name: 'Maryland' }, { code: 'MA', name: 'Massachusetts' },
    { code: 'MI', name: 'Michigan' }, { code: 'MN', name: 'Minnesota' }, { code: 'MS', name: 'Mississippi' },
    { code: 'MO', name: 'Missouri' }, { code: 'MT', name: 'Montana' }, { code: 'NE', name: 'Nebraska' },
    { code: 'NV', name: 'Nevada' }, { code: 'NH', name: 'New Hampshire' }, { code: 'NJ', name: 'New Jersey' },
    { code: 'NM', name: 'New Mexico' }, { code: 'NY', name: 'New York' }, { code: 'NC', name: 'North Carolina' },
    { code: 'ND', name: 'North Dakota' }, { code: 'OH', name: 'Ohio' }, { code: 'OK', name: 'Oklahoma' },
    { code: 'OR', name: 'Oregon' }, { code: 'PA', name: 'Pennsylvania' }, { code: 'RI', name: 'Rhode Island' },
    { code: 'SC', name: 'South Carolina' }, { code: 'SD', name: 'South Dakota' }, { code: 'TN', name: 'Tennessee' },
    { code: 'TX', name: 'Texas' }, { code: 'UT', name: 'Utah' }, { code: 'VT', name: 'Vermont' },
    { code: 'VA', name: 'Virginia' }, { code: 'WA', name: 'Washington' }, { code: 'WV', name: 'West Virginia' },
    { code: 'WI', name: 'Wisconsin' }, { code: 'WY', name: 'Wyoming' }
  ];

  useEffect(() => {
    if (!companyType && !roleName) {
      navigate('/');
    }
  }, [companyType, roleName, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'phone') {
      // Detect country code from phone number
      if (value.startsWith('+')) {
        const dialCode = value.match(/^\+\d{1,3}/);
        if (dialCode) {
          const matchedCountry = countries.find(c => c.dialCode === dialCode[0]);
          if (matchedCountry) {
            setSelectedCountry(matchedCountry.code);
          }
        }
      }
    }
    
    setFormData({
      ...formData,
      [name]: value
    });

    if (name === 'zipCode' && value.length === 5) {
      fetchLocationByZip(value);
    }
  };

  const fetchLocationByZip = async (zipCode: string) => {
    setLoadingZip(true);
    try {
      const response = await fetch(`https://api.zippopotam.us/us/${zipCode}`);
      if (response.ok) {
        const data = await response.json();
        const place = data.places[0];
        setFormData(prev => ({
          ...prev,
          state: place['state abbreviation'],
          city: place['place name']
        }));
      }
    } catch (error) {
      console.error('Error fetching location:', error);
    } finally {
      setLoadingZip(false);
    }
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
            
            <div className="row g-4  ">
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
            
            <div className="row g-4  ">
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
            
            <div className="row g-4  ">
              <div className="col-12">
                <div className="form-group phone-group">
                  <label>Phone*</label>
                  <div className="phone-input">
                    <span className="country-code" onClick={() => document.getElementById('country-select')?.click()}>
                      <img src={`https://flagcdn.com/w20/${currentCountry.flag}.png`} alt={currentCountry.name} />
                      {currentCountry.dialCode}
                    </span>
                    <select 
                      id="country-select"
                      value={selectedCountry}
                      onChange={(e) => setSelectedCountry(e.target.value)}
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        width: '100px',
                        height: '100%',
                        opacity: 0,
                        cursor: 'pointer'
                      }}
                    >
                      {countries.map(country => (
                        <option key={country.code} value={country.code}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="Enter phone number"
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
            
            <div className="row g-4  ">
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
                    maxLength={5}
                    pattern="[0-9]{5}"
                    placeholder="Enter 5-digit ZIP code"
                    required
                  />
                  {loadingZip && <div className="text-muted small mt-1"><i className="fas fa-spinner fa-spin"></i> Loading...</div>}
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
                    {usStates.map(state => (
                      <option key={state.code} value={state.code}>{state.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            
            <div className="row g-4  ">
              <div className="col-12">
                <div className="form-group">
                  <label>City*</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="City will auto-fill from ZIP code"
                    required
                  />
                </div>
              </div>
            </div>
            
            <div className="row g-4  ">
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
            
            <div className="row g-4  ">
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