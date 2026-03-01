import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import './CreateProfile.css';
import { API_BASE_URL } from './config';
import { updateSignupState, getSignupState, getCompanyFormData, updateCompanyFormData, CompanyFormData, clearSignupState } from './utils/signupState';
import Breadcrumb from './components/Breadcrumb';
import AuthSidebar from './components/AuthSidebar';
import AddressForm from './components/AddressForm';

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

  const handleUseMyAddress = async (checked: boolean) => {
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
            const addressData = {
              zipCode: userData.address.zipCode || '',
              state: userData.address.state || '',
              city: userData.address.city || '',
              address1: userData.address.address1 || '',
              address2: userData.address.address2 || ''
            };
            const newFormData = { ...formData, ...addressData };
            setFormData(newFormData);
            updateCompanyFormData(newFormData);
          }
        }
      } catch (error) {
        console.error('Error fetching user address:', error);
      }
    } else {
      const addressData = {
        zipCode: '',
        state: '',
        city: '',
        address1: '',
        address2: ''
      };
      const newFormData = { ...formData, ...addressData };
      setFormData(newFormData);
      updateCompanyFormData(newFormData);
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
        clearSignupState();
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
      <AuthSidebar />
      
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
          <div>
            <h1>Create Management Company</h1>
            <p>Set up a new organizational entity to manage Users, modules, and operations efficiently.</p>
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
            
            <div className="form-group">
              <label>Your Logo</label>
              <div style={{display: 'flex', gap: '12px', alignItems: 'center'}}>
                <div 
                  className="border rounded d-flex flex-column align-items-center justify-content-center" 
                  style={{
                    width: '60px', 
                    height: '60px', 
                    cursor: 'pointer', 
                    backgroundColor: '#f8f9fa',
                    border: '2px dashed #d1d5db',
                    borderRadius: '8px'
                  }}
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
                    <img src={logoPreview} alt="Logo" style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px'}} />
                  ) : (
                    <i className="fas fa-camera" style={{fontSize: '20px', color: '#6b7280'}}></i>
                  )}
                </div>
                <div 
                  style={{
                    flex: 1,
                    padding: '16px 20px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    backgroundColor: '#f9fafb',
                    cursor: 'pointer',
                    textAlign: 'center',
                    color: '#6b7280',
                    fontSize: '16px'
                  }}
                  onClick={() => document.getElementById('logoUpload')?.click()}
                >
                  Upload Logo
                </div>
              </div>
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
                updateCompanyFormData(newFormData);
              }}
              showUseMyAddress={true}
              useMyAddress={useMyAddress}
              onUseMyAddressChange={handleUseMyAddress}
            />
            
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
