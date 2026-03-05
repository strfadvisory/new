import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { API_ENDPOINTS } from './config';
import './CreateProfile.css';
import AuthSidebar from './components/AuthSidebar';
import AddressForm from './components/AddressForm';

const AdvisoryVerification: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
    address2: '',
    password: '',
    rePassword: ''
  });
  const [userInfo, setUserInfo] = useState({ firstName: '', lastName: '', companyName: '' });

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
    const fetchUserData = async () => {
      try {
        const response = await fetch(`${API_ENDPOINTS.verifyAdvisory}/${token}`);
        const data = await response.json();
        if (response.ok) {
          setUserInfo({ firstName: data.firstName, lastName: data.lastName, companyName: data.companyName });
          setFormData(prev => ({
            ...prev,
            email: data.email
          }));
        } else {
          toast.error(data.message || 'Invalid verification link');
          navigate('/login');
        }
      } catch (error) {
        toast.error('Failed to verify link');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [token, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.rePassword) {
      toast.error('Passwords do not match');
      return;
    }
    setSubmitLoading(true);
    try {
      const response = await fetch(`${API_ENDPOINTS.completeAdvisoryProfile}/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        toast.success('Profile completed successfully!');
        navigate('/dashboard');
      } else {
        toast.error(data.message || 'Failed to complete profile');
      }
    } catch (error) {
      toast.error('Failed to submit profile');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="create-profile-container">
      <AuthSidebar />
      
      <div className="profile-content">
        <div className="profile-header" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 0',
          borderBottom: '1px solid #e5e7eb',
          marginBottom: '30px'
        }}>
          <div></div>
          <div style={{ display: 'flex', gap: '30px', fontSize: '14px', color: '#6b7280' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fas fa-envelope"></i>
              <span>info@reservefundadvisory.com</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fas fa-phone"></i>
              <span>727-788-4800</span>
            </div>
          </div>
        </div>
        
        <div className="profile-form" style={{maxWidth: '600px', margin: '0 auto'}}>
          <h1>{userInfo.firstName} {userInfo.lastName}</h1>
          <p>You are registered with the email {formData.email} as the Director of the Association and have Manager access in this system.</p>
          
          <form onSubmit={handleSubmit}>
            <div className="section-title mt-4">
              <h3>Add your Phone number</h3>
            </div>
            
            <div className="form-group phone-group">
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
            
            <div className="section-title mt-4">
              <h3>Create Password</h3>
              <p>Create a secure password to set up your account and access the system.</p>
            </div>
            
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
            
            <div className="form-group">
              <label>Re Password*</label>
              <div className="password-input">
                <input
                  type="password"
                  name="rePassword"
                  value={formData.rePassword}
                  onChange={handleInputChange}
                  required
                />
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
                setFormData({ ...formData, ...addressData });
              }}
            />
            
            <div className="form-note mt-4">
              <p className="text-muted small">Please note that fields marked with * are mandatory.</p>
            </div>
            
            <button type="submit" className="continue-button" disabled={submitLoading}>
              {submitLoading ? <><i className="fas fa-spinner fa-spin"></i> Loading...</> : 'Continue'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdvisoryVerification;
