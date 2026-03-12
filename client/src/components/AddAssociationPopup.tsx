import React, { useState, useRef, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import '../pages/AssociationControl.css';

interface AddAssociationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editData?: any;
  isEditMode?: boolean;
}

const AddAssociationPopup: React.FC<AddAssociationPopupProps> = ({
  isOpen,
  onClose,
  onSuccess,
  editData,
  isEditMode = false
}) => {
  const [formData, setFormData] = useState({
    _id: editData?._id || '',
    name: editData?.name || '',
    icon: editData?.icon || '',
    status: editData?.status !== undefined ? editData.status : true,
    permissions: editData?.permissions || [],
    description: editData?.description || '',
    address: editData?.address || {
      zipCode: '',
      state: '',
      city: '',
      address1: '',
      address2: ''
    },
    contactPerson: editData?.contactPerson || '',
    phone: editData?.phone || '',
    email: editData?.email || '',
    linkedinUrl: editData?.linkedinUrl || '',
    websiteUrl: editData?.websiteUrl || ''
  });

  const [iconPreview, setIconPreview] = useState<string>(editData?.icon || '');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedCountry, setSelectedCountry] = useState('US');
  const [countries, setCountries] = useState<any[]>([]);
  const [loadingZip, setLoadingZip] = useState(false);

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

  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
      }
      
      if (file.size > 2 * 1024 * 1024) {
        alert('File size must be less than 2MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setIconPreview(base64String);
        setFormData({ ...formData, icon: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  useEffect(() => {
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
  }, []);

  const fetchLocationByZip = async (zipCode: string) => {
    if (zipCode.length !== 5) return;
    
    setLoadingZip(true);
    try {
      const response = await fetch(`https://api.zippopotam.us/us/${zipCode}`);
      if (response.ok) {
        const data = await response.json();
        const place = data.places[0];
        setFormData(prev => ({
          ...prev,
          address: {
            ...prev.address,
            zipCode: zipCode,
            state: place['state abbreviation'],
            city: place['place name']
          }
        }));
      } else {
        // If zip code not found, clear city and state
        setFormData(prev => ({
          ...prev,
          address: {
            ...prev.address,
            zipCode: zipCode,
            state: '',
            city: ''
          }
        }));
      }
    } catch (error) {
      console.error('Error fetching location:', error);
      // On error, keep the zip code but clear city and state
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          zipCode: zipCode,
          state: '',
          city: ''
        }
      }));
    } finally {
      setLoadingZip(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      let url = `${API_BASE_URL}/associations`;
      let method = 'POST';
      const submitData: any = { 
        name: formData.name,
        description: formData.description,
        icon: formData.icon,
        status: formData.status,
        permissions: formData.permissions,
        address: formData.address,
        contactPerson: formData.contactPerson,
        phone: formData.phone,
        email: formData.email,
        linkedinUrl: formData.linkedinUrl,
        websiteUrl: formData.websiteUrl
      };
      
      if (isEditMode && formData._id) {
        url = `${API_BASE_URL}/associations/${formData._id}`;
        method = 'PUT';
      }
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(submitData)
      });
      
      if (response.ok) {
        onSuccess();
        onClose();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message || 'Failed to save association'}`);
      }
    } catch (error) {
      console.error('Error saving:', error);
      alert('Failed to save. Check console for details.');
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-overlay" onClick={onClose}></div>
      <div className="form-card">
        <h2 className="form-title">{isEditMode ? 'Edit Association' : 'Create an Association'}</h2>
        <p className="form-description">Set up a new organizational entity to manage Users, modules, and operations efficiently.</p>
        
        <button className="close-btn" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>
        
        <form onSubmit={handleSubmit}>
          <div style={{ padding: '20px' }}>
            <div className="form-group">
              <input 
                type="text" 
                placeholder="Company name"
                className="form-input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <textarea 
                className="form-input"
                rows={3}
                placeholder="Description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                style={{ resize: 'vertical', minHeight: '80px' }}
              ></textarea>
            </div>

            <div className="form-group">
              <label>Upload Logo</label>
              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*"
                onChange={handleIconUpload}
                style={{ display: 'none' }}
              />
              <div style={{display: 'flex', gap: '12px', alignItems: 'center'}}>
                <div 
                  className="upload-preview" 
                  style={{
                    width: '60px', 
                    height: '60px', 
                    cursor: 'pointer', 
                    backgroundColor: '#fafafa',
                    border: '2px dashed #dcdcdc',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onClick={triggerFileInput}
                >
                  {iconPreview ? (
                    <img src={iconPreview} alt="Logo preview" style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px'}} />
                  ) : (
                    <i className="fas fa-camera" style={{fontSize: '20px', color: '#6b7280'}}></i>
                  )}
                </div>
                <div 
                  className="form-input"
                  style={{
                    cursor: 'pointer',
                    textAlign: 'center',
                    color: '#6b7280',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onClick={triggerFileInput}
                >
                  Upload Logo
                </div>
              </div>
            </div>

            <div className="section-title" style={{ margin: '30px 0 15px 0' }}>
              <h3>Add your Address</h3>
              <p>Provide the official location details including street, city, state, country, and ZIP code.</p>
            </div>
            
            <div className="row g-4">
              <div className="  col-12">
                <div className="form-group">
                  <input 
                    type="text" 
                    placeholder="Zip Code*"
                    className="form-input"
                    value={formData.address.zipCode}
                    maxLength={5}
                    pattern="[0-9]{5}"
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      setFormData({ 
                        ...formData, 
                        address: { ...formData.address, zipCode: value }
                      });
                      if (value.length === 5) {
                        fetchLocationByZip(value);
                      }
                    }}
                  />
                  {loadingZip && <div className="text-muted small"><i className="fas fa-spinner fa-spin"></i> Loading...</div>}
                </div>
              </div>
              <div className="  col-12">
                <div className="form-group">
                  <select 
                    className="form-input"
                    value={formData.address.state}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      address: { ...formData.address, state: e.target.value }
                    })}
                  >
                    <option value="">State*</option>
                    {usStates.map(state => (
                      <option key={state.code} value={state.code}>{state.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="form-group">
              <input 
                type="text" 
                placeholder="City*"
                className="form-input"
                value={formData.address.city}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  address: { ...formData.address, city: e.target.value }
                })}
              />
            </div>

            <div className="form-group">
              <input 
                type="text" 
                placeholder="Address 1*"
                className="form-input"
                value={formData.address.address1}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  address: { ...formData.address, address1: e.target.value }
                })}
              />
            </div>

            <div className="form-group">
              <input 
                type="text" 
                placeholder="Address II"
                className="form-input"
                value={formData.address.address2}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  address: { ...formData.address, address2: e.target.value }
                })}
              />
            </div>

            <div className="section-title" style={{ margin: '30px 0 15px 0' }}>
              <h3>Contact Person</h3>
              <p>Provide contact information for the primary representative.</p>
            </div>
            
            <div className="form-group">
              <input 
                type="text" 
                placeholder="Contact Person"
                className="form-input"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
              />
            </div>

            <div className="form-group">
              <div className="phone-input">
                <div className="country-code" onClick={() => document.getElementById('country-select-association')?.click()}>
                  <img src={`https://flagcdn.com/w20/${currentCountry.flag}.png`} alt={currentCountry.name} />
                  {currentCountry.dialCode}
                </div>
                <select 
                  id="country-select-association"
                  value={selectedCountry}
                  onChange={(e) => {
                    const newCountry = e.target.value;
                    setSelectedCountry(newCountry);
                    
                    // Update phone number with new country code if phone exists
                    const country = countries.find(c => c.code === newCountry);
                    if (country && formData.phone) {
                      const cleanPhone = formData.phone.replace(/^\+?\d{1,4}\s?/, ''); // Remove existing country code
                      if (cleanPhone) {
                        setFormData({
                          ...formData,
                          phone: `${country.dialCode} ${cleanPhone}`
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
                  placeholder="Enter phone number*"
                  value={formData.phone}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData({ ...formData, phone: value });
                    
                    // Auto-detect country from phone number
                    const phoneNumber = value.replace(/\D/g, '');
                    if (phoneNumber.length >= 1 && countries.length > 0) {
                      const sortedCountries = [...countries].sort((a, b) => b.prefix.length - a.prefix.length);
                      
                      for (const country of sortedCountries) {
                        if (phoneNumber.startsWith(country.prefix)) {
                          setSelectedCountry(country.code);
                          break;
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>

            <div className="form-group">
              <input 
                type="email" 
                placeholder="Contact Email Address"
                className="form-input"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="section-title" style={{ margin: '30px 0 15px 0' }}>
              <h3>Social Media</h3>
              <p>Add social media links for the organization.</p>
            </div>
            
            <div className="form-group">
              <div className="social-input">
                <i className="fab fa-linkedin"></i>
                <input 
                  type="url" 
                  placeholder="LinkedIn Page"
                  value={formData.linkedinUrl}
                  onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <div className="social-input">
                <i className="fas fa-link"></i>
                <input 
                  type="url" 
                  placeholder="Website URL"
                  value={formData.websiteUrl}
                  onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                />
              </div>
            </div>

            <button type="submit" className="primary-button">
              {isEditMode ? 'Update Association' : 'Continue'}
            </button>
          </div>
        </form>
        
        <div className="secondary-action">
          <p>Please note that fields marked with * are mandatory.</p>
        </div>
      </div>
    </>
  );
};

export default AddAssociationPopup;