import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import './CreateProfile.css';
import { API_BASE_URL } from './config';
import { updateSignupState, getSignupState, getCompanyFormData, updateCompanyFormData, CompanyFormData } from './utils/signupState';
import Breadcrumb from './components/Breadcrumb';

interface CompanyProfileProps {
  onComplete: () => void;
  onNavigate?: (step: string) => void;
}

const CompanyProfile: React.FC<CompanyProfileProps> = ({ onComplete, onNavigate }) => {
  const [formData, setFormData] = useState<CompanyFormData>(() => {
    return getCompanyFormData();
  });
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [useMyAddress, setUseMyAddress] = useState(() => {
    const state = getSignupState();
    return state.useMyAddress || false;
  });

  // Listen for state changes
  useEffect(() => {
    const handleStateChange = () => {
      const savedFormData = getCompanyFormData();
      const savedState = getSignupState();
      setFormData(savedFormData);
      setUseMyAddress(savedState.useMyAddress || false);
    };
    
    window.addEventListener('signupStateChanged', handleStateChange);
    return () => window.removeEventListener('signupStateChanged', handleStateChange);
  }, []);

  useEffect(() => {
    updateSignupState({ currentStep: 'company-profile' });
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const newFormData = {
      ...formData,
      [e.target.name]: e.target.value
    };
    setFormData(newFormData);
    
    updateCompanyFormData(newFormData);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogo(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleUseMyAddress = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setUseMyAddress(checked);
    
    updateSignupState({ useMyAddress: checked });
    
    if (checked) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          const userData = await response.json();
          if (userData.address) {
            const newFormData = {
              ...formData,
              zipCode: userData.address.zipCode || '',
              state: userData.address.state || '',
              city: userData.address.city || '',
              address1: userData.address.address1 || '',
              address2: userData.address.address2 || ''
            };
            setFormData(newFormData);
            updateCompanyFormData(newFormData);
            updateSignupState({ useMyAddress: checked });
          }
        }
      } catch (error) {
        console.error('Error fetching user address:', error);
      }
    } else {
      const newFormData = {
        ...formData,
        zipCode: '',
        state: '',
        city: '',
        address1: '',
        address2: ''
      };
      setFormData(newFormData);
      updateCompanyFormData(newFormData);
      updateSignupState({ useMyAddress: checked });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const state = getSignupState();
      const formDataToSend = new FormData();
      
      // Add all form fields to FormData
      formDataToSend.append('companyName', formData.companyName);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('contactPerson', formData.contactPerson);
      formDataToSend.append('linkedinUrl', formData.linkedinUrl);
      formDataToSend.append('websiteLink', formData.websiteLink);
      formDataToSend.append('zipCode', formData.zipCode);
      formDataToSend.append('state', formData.state);
      formDataToSend.append('city', formData.city);
      formDataToSend.append('address1', formData.address1);
      formDataToSend.append('address2', formData.address2);
      formDataToSend.append('useMyAddress', useMyAddress.toString());
      
      if (logo) {
        formDataToSend.append('logo', logo);
      }
      
      const response = await fetch(`${API_BASE_URL}/api/auth/company-profile`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });
      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('user', JSON.stringify(data));
        toast.success('Company profile created successfully');
        onComplete();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Failed to create company profile');
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
          { label: 'Select Company', onClick: () => {
            updateCompanyFormData(formData);
            updateSignupState({ useMyAddress });
            onNavigate?.('/signup');
          }},
          { label: 'Create Profile', onClick: () => {
            updateCompanyFormData(formData);
            updateSignupState({ useMyAddress });
            onNavigate?.('/create-profile');
          }},
          { label: 'OTP Verification', onClick: () => {
            updateCompanyFormData(formData);
            updateSignupState({ useMyAddress });
            onNavigate?.('/verify-otp');
          }},
          { label: 'Company Profile', active: true }
        ]} />
        
        <div className="profile-form" style={{maxWidth: '600px', margin: '0 auto'}}>
          <div className="d-flex justify-content-between align-items-start mb-3">
            <div>
              <h1>Create Management Company</h1>
              <p>Set up a new organizational entity to manage Users, modules, and operations efficiently.</p>
            </div>
            <div 
              className="border rounded d-flex flex-column align-items-center justify-content-center" 
              style={{width: '150px', height: '150px', cursor: 'pointer', backgroundColor: '#f8f9fa', flexShrink: 0, marginLeft: '20px'}}
              onClick={() => document.getElementById('logoUpload')?.click()}
            >
              <input
                type="file"
                id="logoUpload"
                accept="image/*"
                onChange={handleLogoChange}
                style={{display: 'none'}}
              />
              {logoPreview ? (
                <img src={logoPreview} alt="Logo" style={{maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', padding: '10px'}} />
              ) : (
                <>
                  <i className="fas fa-plus fa-2x text-primary mb-2"></i>
                  <span className="text-muted">Your Logo</span>
                </>
              )}
            </div>
          </div>
          
          <form onSubmit={handleSubmit}>
            
            <div className="form-group">
              <label>Company Name*</label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Description</label>
              <textarea
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  transition: 'all 0.2s ease',
                  background: '#ffffff',
                  resize: 'vertical'
                }}
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="section-title mt-4">
              <h3>Company contact Details</h3>
              <p>Create a secure password to set up your account and access the system.</p>
            </div>
            
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
            
            <div className="form-group">
              <label>Company contact Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="form-group">
              <label>Contact Person</label>
              <input
                type="text"
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="form-group">
              <label>
                <i className="fab fa-linkedin" style={{marginRight: '8px'}}></i>LinkedIn Page url
              </label>
              <input
                type="url"
                name="linkedinUrl"
                value={formData.linkedinUrl}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="form-group">
              <label>
                <i className="fas fa-globe" style={{marginRight: '8px'}}></i>Website Link
              </label>
              <input
                type="url"
                name="websiteLink"
                value={formData.websiteLink}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="section-title mt-4">
              <h3>Add your Address</h3>
              <p>Provide the official location details of , including street, city, state, country, and ZIP code.</p>
            </div>
            
            <div className="form-group">
              <div className="checkbox-group">
                <input 
                  type="checkbox" 
                  id="useMyAddress" 
                  checked={useMyAddress}
                  onChange={handleUseMyAddress}
                />
                <label htmlFor="useMyAddress">
                  Use My Address
                </label>
              </div>
            </div>
            
            <div className="form-row">
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
              <div className="form-group">
                <label>State*</label>
                <select
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select State</option>
                  <option value="AL">Alabama</option>
                  <option value="AK">Alaska</option>
                  <option value="AZ">Arizona</option>
                  <option value="AR">Arkansas</option>
                  <option value="CA">California</option>
                  <option value="CO">Colorado</option>
                  <option value="CT">Connecticut</option>
                  <option value="DE">Delaware</option>
                  <option value="FL">Florida</option>
                  <option value="GA">Georgia</option>
                  <option value="HI">Hawaii</option>
                  <option value="ID">Idaho</option>
                  <option value="IL">Illinois</option>
                  <option value="IN">Indiana</option>
                  <option value="IA">Iowa</option>
                  <option value="KS">Kansas</option>
                  <option value="KY">Kentucky</option>
                  <option value="LA">Louisiana</option>
                  <option value="ME">Maine</option>
                  <option value="MD">Maryland</option>
                  <option value="MA">Massachusetts</option>
                  <option value="MI">Michigan</option>
                  <option value="MN">Minnesota</option>
                  <option value="MS">Mississippi</option>
                  <option value="MO">Missouri</option>
                  <option value="MT">Montana</option>
                  <option value="NE">Nebraska</option>
                  <option value="NV">Nevada</option>
                  <option value="NH">New Hampshire</option>
                  <option value="NJ">New Jersey</option>
                  <option value="NM">New Mexico</option>
                  <option value="NY">New York</option>
                  <option value="NC">North Carolina</option>
                  <option value="ND">North Dakota</option>
                  <option value="OH">Ohio</option>
                  <option value="OK">Oklahoma</option>
                  <option value="OR">Oregon</option>
                  <option value="PA">Pennsylvania</option>
                  <option value="RI">Rhode Island</option>
                  <option value="SC">South Carolina</option>
                  <option value="SD">South Dakota</option>
                  <option value="TN">Tennessee</option>
                  <option value="TX">Texas</option>
                  <option value="UT">Utah</option>
                  <option value="VT">Vermont</option>
                  <option value="VA">Virginia</option>
                  <option value="WA">Washington</option>
                  <option value="WV">West Virginia</option>
                  <option value="WI">Wisconsin</option>
                  <option value="WY">Wyoming</option>
                </select>
              </div>
            </div>
            
            <div className="form-group">
              <label>City*</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                placeholder="Enter city name"
                required
              />
            </div>
            
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
            
            <div className="form-note">
              <p>Please note that fields marked with * are mandatory.</p>
            </div>
            
            <button type="submit" className="continue-button" disabled={loading}>
              {loading ? <><i className="fas fa-spinner fa-spin"></i> Saving...</> : 'Continue'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CompanyProfile;
