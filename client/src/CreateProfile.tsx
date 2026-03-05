import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import './CreateProfile.css';
import { API_ENDPOINTS } from './config';
import { updateSignupState, getSignupState, getFormData, updateFormData, SignupFormData } from './utils/signupState';
import Breadcrumb from './components/Breadcrumb';
import AuthSidebar from './components/AuthSidebar';
import AddressForm from './components/AddressForm';

interface CreateProfileProps {
  onBack: () => void;
  onRegister: (user: any) => void;
  onNavigate?: (step: string) => void;
}

const CreateProfile: React.FC<CreateProfileProps> = ({ onBack, onRegister, onNavigate }) => {
  const navigate = useNavigate();
  
  // Load form data from signup state
  const [formData, setFormData] = useState<SignupFormData>(() => {
    return getFormData();
  });

  const [emailValidation, setEmailValidation] = useState<{ valid: boolean | null, message: string, checking: boolean }>({ valid: null, message: '', checking: false });
  const [loading, setLoading] = useState(false);
  const [cities, setCities] = useState<string[]>([]);
  const [loadingZip, setLoadingZip] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(() => {
    const state = getSignupState();
    return state.selectedCountry || 'US';
  });
  const [countries, setCountries] = useState<any[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showRePassword, setShowRePassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [useMyAddress, setUseMyAddress] = useState(false);

  const currentCountry = countries.find(c => c.code === selectedCountry) || { code: 'US', name: 'United States', dialCode: '+1', flag: 'us', prefix: '1' };

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
    // Listen for state changes and update form data
    const handleStateChange = () => {
      const savedFormData = getFormData();
      const savedState = getSignupState();
      setFormData(savedFormData);
      setSelectedCountry(savedState.selectedCountry || 'US');
      // Keep agreeToTerms as false - don't restore from saved state
    };
    
    window.addEventListener('signupStateChanged', handleStateChange);
    return () => window.removeEventListener('signupStateChanged', handleStateChange);
  }, []);

  useEffect(() => {
    // Update current step
    updateSignupState({ currentStep: 'create-profile' });
  }, []);

  // Listen for state changes and update form data
  useEffect(() => {
    const handleStateChange = () => {
      const savedFormData = getFormData();
      const savedState = getSignupState();
      setFormData(savedFormData);
      setSelectedCountry(savedState.selectedCountry || 'US');
      // Keep agreeToTerms as false - don't restore from saved state
    };
    
    window.addEventListener('signupStateChanged', handleStateChange);
    return () => window.removeEventListener('signupStateChanged', handleStateChange);
  }, []);

  useEffect(() => {
    // Update current step
    updateSignupState({ currentStep: 'create-profile' });
  }, []);

  useEffect(() => {
    const state = getSignupState();
    if (!state.roleId || !state.roleName) {
      navigate('/');
    }
    
    // Load countries from JSON
    fetch('/countrylist.json')
      .then(res => res.json())
      .then(data => {
        const formattedCountries = data.map((country: any) => ({
          code: country.iso2,
          name: country.name,
          dialCode: country.phoneCode,
          flag: country.iso2.toLowerCase(),
          prefix: country.phoneCode.replace('+', '')
        }));
        setCountries(formattedCountries);
      })
      .catch(err => console.error('Error loading countries:', err));
  }, [navigate]);

  // Update phone number format when country changes
  useEffect(() => {
    if (selectedCountry && countries.length > 0) {
      const country = countries.find(c => c.code === selectedCountry);
      if (country && formData.phone && !formData.phone.startsWith(country.dialCode)) {
        // Only update if phone doesn't already have the correct country code
        const cleanPhone = formData.phone.replace(/^\+?\d{1,4}\s?/, ''); // Remove existing country code
        if (cleanPhone) {
          const newFormData = {
            ...formData,
            phone: `${country.dialCode} ${cleanPhone}`
          };
          setFormData(newFormData);
          
        updateFormData(newFormData);
        updateSignupState({ selectedCountry });
        }
      }
    }
  }, [selectedCountry, countries]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    const newFormData = {
      ...formData,
      [name]: value
    };
    setFormData(newFormData);

    updateFormData(newFormData);
    updateSignupState({ selectedCountry, agreeToTerms });

    if (name === 'phone') {
      // Auto-detect country from phone number
      const phoneNumber = value.replace(/\D/g, '');
      if (phoneNumber.length >= 1 && countries.length > 0) {
        // Sort by prefix length (longest first) to match more specific codes first
        const sortedCountries = [...countries].sort((a, b) => b.prefix.length - a.prefix.length);
        
        for (const country of sortedCountries) {
          if (phoneNumber.startsWith(country.prefix)) {
            setSelectedCountry(country.code);
            break;
          }
        }
      }
    }

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
        const newFormData = {
          ...formData,
          state: place['state abbreviation'],
          city: place['place name']
        };
        setFormData(newFormData);
        updateFormData(newFormData);
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
      const response = await fetch(API_ENDPOINTS.validateEmail, {
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
      const state = getSignupState();
      const response = await fetch(API_ENDPOINTS.register, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          designation: formData.designation,
          phone: formData.phone,
          password: formData.password,
          selectedCountry: selectedCountry,
          agreeToTerms: agreeToTerms,
          address: {
            zipCode: formData.zipCode,
            state: formData.state,
            city: formData.city,
            address1: formData.address1,
            address2: formData.address2
          },
          roleId: state.roleId,
          roleName: state.roleName,
          level: 'l1'
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
      <AuthSidebar />
      
      <div className="profile-content">
        <Breadcrumb items={[
          { label: 'Select Company', onClick: () => {
            updateSignupState({ formData, selectedCountry, agreeToTerms });
            onNavigate?.('/signup');
          }},
          { label: 'Create Profile', active: true }
        ]} />
        
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
            
            <div className="row g-4">
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
            
            <div className="row g-4">
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
            
            <div className="row g-4">
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
                      onChange={(e) => {
                        const newCountry = e.target.value;
                        setSelectedCountry(newCountry);
                        
                        updateSignupState({ selectedCountry: newCountry });
                        
                        // Update phone number with new country code if phone exists
                        const country = countries.find(c => c.code === newCountry);
                        if (country && formData.phone) {
                          const cleanPhone = formData.phone.replace(/^\+?\d{1,4}\s?/, ''); // Remove existing country code
                          if (cleanPhone) {
                            const newFormData = {
                              ...formData,
                              phone: `${country.dialCode} ${cleanPhone}`
                            };
                            setFormData(newFormData);
                            updateFormData(newFormData);
                            updateSignupState({
                              selectedCountry: newCountry,
                              agreeToTerms
                            });
                          }
                        }
                      }}
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
            
         
            
          
            
 
            <AddressForm
              addressData={{
                zipCode: formData.zipCode,
                state: formData.state,
                city: formData.city,
                address1: formData.address1,
                address2: formData.address2
              }}
              onAddressChange={(addressData) => {
                const newFormData = { ...formData, ...addressData };
                setFormData(newFormData);
                updateFormData(newFormData);
              }}
            />
            
            <div className="section-title mt-5">
              <h3>Create Your Password</h3>
              <p>Create a new password to set up your account and access the system.</p>
            </div>
            
            <div className="row g-4">
              <div className="col-12">
                <div className="form-group">
                  <label>Password*</label>
                  <div className="password-input">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="row g-4">
              <div className="col-12">
                <div className="form-group">
                  <label>Re Password*</label>
                  <div className="password-input">
                    <input
                      type={showRePassword ? "text" : "password"}
                      name="rePassword"
                      value={formData.rePassword}
                      onChange={handleInputChange}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowRePassword(!showRePassword)}
                    >
                      <i className={`fas ${showRePassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="row g-4">
              <div className="col-12">
                <div className="form-group">
                  <div className="checkbox-group">
                    <input
                      type="checkbox"
                      id="agreeToTerms"
                      checked={agreeToTerms}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setAgreeToTerms(checked);
                        updateSignupState({ agreeToTerms: checked });
                      }}
                      required
                    />
                    <label htmlFor="agreeToTerms">I agree to the Terms and Conditions*</label>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="form-note mt-4">
              <p className="text-muted small">Please note that fields marked with * are mandatory.</p>
            </div>
            
            <button 
              type="submit" 
              className="continue-button" 
              disabled={loading || !agreeToTerms}
              style={{
                opacity: (loading || !agreeToTerms) ? 0.5 : 1,
                cursor: (loading || !agreeToTerms) ? 'not-allowed' : 'pointer',
                backgroundColor: (loading || !agreeToTerms) ? '#9ca3af' : undefined
              }}
            >
              {loading ? <><i className="fas fa-spinner fa-spin"></i> Loading...</> : 'Continue'}
            </button>
            
            <div className="change-company">
              <button 
                type="button" 
                onClick={onBack} 
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
                Choose other Profile
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateProfile;