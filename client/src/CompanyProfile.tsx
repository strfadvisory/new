import React, { useState } from 'react';
import { toast } from 'react-toastify';
import './CreateProfile.css';
import { API_BASE_URL } from './config';

interface CompanyProfileProps {
  onComplete: () => void;
}

const CompanyProfile: React.FC<CompanyProfileProps> = ({ onComplete }) => {
  const [formData, setFormData] = useState({
    companyName: '',
    description: '',
    phone: '',
    email: '',
    contactPerson: '',
    linkedinUrl: '',
    websiteLink: '',
    zipCode: '',
    state: '',
    city: '',
    address1: '',
    address2: ''
  });
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogo(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();
      
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });
      
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
        <div className="breadcrumb">
          <span>Select Company</span>
          <i className="fas fa-chevron-right"></i>
          <span>Create Profile</span>
          <i className="fas fa-chevron-right"></i>
          <span>Company Profile</span>
        </div>
        
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
            
            <div className="row g-4">
              <div className="col-12">
                <label className="form-label">Company Name*</label>
                <input
                  type="text"
                  className="form-control"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            
            <div className="row g-4 mt-2">
              <div className="col-12">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <div className="section-title mt-4">
              <h3>Company contact Details</h3>
              <p>Create a secure password to set up your account and access the system.</p>
            </div>
            
            <div className="row g-4">
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
            
            <div className="row g-4 mt-2">
              <div className="col-12">
                <label className="form-label">Company contact Email</label>
                <input
                  type="email"
                  className="form-control"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <div className="row g-4 mt-2">
              <div className="col-12">
                <label className="form-label">Contact Person</label>
                <input
                  type="text"
                  className="form-control"
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <div className="row g-4 mt-2">
              <div className="col-12">
                <label className="form-label">
                  <i className="fab fa-linkedin me-2"></i>LinkedIn Page url
                </label>
                <input
                  type="url"
                  className="form-control"
                  name="linkedinUrl"
                  value={formData.linkedinUrl}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <div className="row g-4 mt-2">
              <div className="col-12">
                <label className="form-label">
                  <i className="fas fa-globe me-2"></i>Website Link
                </label>
                <input
                  type="url"
                  className="form-control"
                  name="websiteLink"
                  value={formData.websiteLink}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <div className="section-title mt-4">
              <h3>Add your Address</h3>
              <p>Provide the official location details of , including street, city, state, country, and ZIP code.</p>
            </div>
            
            <div className="form-check mb-3">
              <input className="form-check-input" type="checkbox" id="useMyAddress" />
              <label className="form-check-label" htmlFor="useMyAddress">
                Use My Address
              </label>
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
            
            <button type="submit" className="btn btn-primary w-100 mt-4 py-2" disabled={loading}>
              {loading ? <><i className="fas fa-spinner fa-spin"></i> Saving...</> : 'Continue'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CompanyProfile;
