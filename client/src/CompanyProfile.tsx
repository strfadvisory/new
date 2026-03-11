import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import './CreateProfile.css';
import { API_ENDPOINTS } from './config';
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
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file for the logo');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Logo file size must be less than 5MB');
        return;
      }
      
      console.log('Logo selected:', file.name, file.type, file.size);
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
        const response = await fetch(API_ENDPOINTS.profile, {
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
        console.log('Uploading logo:', logo.name, logo.size);
        formDataToSend.append('logo', logo);
      }
      
      console.log('Submitting company profile...');
      const response = await fetch(API_ENDPOINTS.companyProfile, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });
      
      const data = await response.json();
      console.log('Response:', data);
      
      if (response.ok) {
        localStorage.setItem('user', JSON.stringify(data));
        toast.success('Company profile created successfully');
        clearSignupState();
        onComplete();
      } else {
        console.error('Error response:', data);
        toast.error(data.message || 'Failed to create company profile');
      }
    } catch (error) {
      console.error('Submit error:', error);
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
        
        <div className="form-container" style={{maxWidth: '800px', width: '100%', margin: '0 auto'}}>
          <div className="form-card" style={{
            background: '#ffffff',
            borderRadius: '10px',
            padding: '0',
            border: '1px solid #e6e6e6',
            width: '100%',
            maxWidth: '800px'
          }}>
            <h2 className="form-title" style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#2f2f2f',
              margin: '0',
              marginBottom: '8px',
              borderBottom: '1px solid #e6e6e6',
              padding: '20px 20px 8px 20px'
            }}>Create Management Company</h2>
            <p className="form-description" style={{
              fontSize: '14px',
              color: '#6b7280',
              margin: '0',
              marginBottom: '20px',
              lineHeight: '1.5',
              padding: '0 20px'
            }}>Set up a new organizational entity to manage Users, modules, and operations efficiently.</p>
            
            <form onSubmit={handleSubmit} style={{padding: '20px'}}>
            
              <div className="form-group" style={{marginBottom: '20px'}}>
                <input
                  type="text"
                  className="form-input"
                  name="companyName"
                  placeholder="Company Name *"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    height: '44px',
                    borderRadius: '8px',
                    border: '2px solid #e2e8f0',
                    padding: '14px 16px',
                    fontSize: '14px',
                    background: '#ffffff',
                    transition: 'all 0.2s ease'
                  }}
                />
              </div>
            
              <div className="form-group" style={{marginBottom: '20px'}}>
                <textarea
                  className="form-input"
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    border: '2px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    transition: 'all 0.2s ease',
                    background: '#ffffff',
                    resize: 'vertical',
                    minHeight: '80px'
                  }}
                  name="description"
                  rows={3}
                  placeholder="Description"
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>
            
              <div className="form-group" style={{marginBottom: '20px'}}>
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
                      padding: '14px 16px',
                      border: '2px solid #e2e8f0',
                      borderRadius: '8px',
                      backgroundColor: '#ffffff',
                      cursor: 'pointer',
                      textAlign: 'center',
                      color: '#6b7280',
                      fontSize: '14px',
                      transition: 'all 0.2s ease'
                    }}
                    onClick={() => document.getElementById('logoUpload')?.click()}
                  >
                    Upload Logo
                  </div>
                </div>
              </div>
            
              <div className="section-title" style={{margin: '30px 0 15px 0'}}>
                <h3 style={{fontSize: '16px', fontWeight: '600', marginBottom: '3px', color: '#1f2937'}}>Company Contact Details</h3>
                <p style={{color: '#6b7280', fontSize: '13px', lineHeight: '1.4', margin: '0'}}>Provide contact information for your management company.</p>
              </div>
            
              <div className="form-group" style={{marginBottom: '20px'}}>
                <div className="phone-input" style={{
                  display: 'flex',
                  border: '2px solid #e2e8f0',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  background: 'white',
                  transition: 'all 0.2s ease',
                  alignItems: 'center'
                }}>
                  <span className="country-code" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '14px 16px',
                    background: '#f9fafb',
                    borderRight: '2px solid #e2e8f0',
                    fontSize: '14px',
                    minWidth: '80px',
                    cursor: 'pointer'
                  }}>
                    <img src="https://flagcdn.com/w20/us.png" alt="US" style={{width: '16px', height: 'auto'}} />
                    +1
                  </span>
                  <input
                    type="tel"
                    className="form-input"
                    name="phone"
                    placeholder="Phone *"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      border: 'none',
                      padding: '14px 16px',
                      fontSize: '14px',
                      background: 'transparent',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>
            
              <div className="form-group" style={{marginBottom: '20px'}}>
                <input
                  type="email"
                  className="form-input"
                  name="email"
                  placeholder="Company contact Email"
                  value={formData.email}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    height: '44px',
                    borderRadius: '8px',
                    border: '2px solid #e2e8f0',
                    padding: '14px 16px',
                    fontSize: '14px',
                    background: '#ffffff',
                    transition: 'all 0.2s ease'
                  }}
                />
              </div>
              
              <div className="form-group" style={{marginBottom: '20px'}}>
                <input
                  type="text"
                  className="form-input"
                  name="contactPerson"
                  placeholder="Contact Person"
                  value={formData.contactPerson}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    height: '44px',
                    borderRadius: '8px',
                    border: '2px solid #e2e8f0',
                    padding: '14px 16px',
                    fontSize: '14px',
                    background: '#ffffff',
                    transition: 'all 0.2s ease'
                  }}
                />
              </div>
              
              <div className="form-group" style={{marginBottom: '20px'}}>
                <input
                  type="url"
                  className="form-input"
                  name="linkedinUrl"
                  placeholder="LinkedIn Page url"
                  value={formData.linkedinUrl}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    height: '44px',
                    borderRadius: '8px',
                    border: '2px solid #e2e8f0',
                    padding: '14px 16px',
                    fontSize: '14px',
                    background: '#ffffff',
                    transition: 'all 0.2s ease'
                  }}
                />
              </div>
              
              <div className="form-group" style={{marginBottom: '20px'}}>
                <input
                  type="url"
                  className="form-input"
                  name="websiteLink"
                  placeholder="Website Link"
                  value={formData.websiteLink}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    height: '44px',
                    borderRadius: '8px',
                    border: '2px solid #e2e8f0',
                    padding: '14px 16px',
                    fontSize: '14px',
                    background: '#ffffff',
                    transition: 'all 0.2s ease'
                  }}
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
              
              <div className="form-note" style={{marginBottom: '25px'}}>
                <p style={{color: '#6b7280', fontSize: '12px', margin: '0'}}>Please note that fields marked with * are mandatory.</p>
              </div>
              
              <button 
                type="submit" 
                className="primary-button continue-button" 
                disabled={loading}
                style={{
                  height: '48px',
                  borderRadius: '8px',
                  background: '#1f4f8f',
                  color: 'white',
                  fontWeight: '600',
                  fontSize: '15px',
                  width: '100%',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  marginBottom: '16px',
                  opacity: loading ? '0.6' : '1'
                }}
              >
                {loading ? <><i className="fas fa-spinner fa-spin"></i> Saving...</> : 'Continue'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyProfile;
