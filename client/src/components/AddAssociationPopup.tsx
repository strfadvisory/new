import React, { useState, useRef } from 'react';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      let url = `${API_BASE_URL}/api/associations`;
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
        url = `${API_BASE_URL}/api/associations/${formData._id}`;
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
      <div className="association-modal">
        <div className="modal-header">
          <div className="modal-header-row" style={{display:'block'}} >
            <h2>{isEditMode ? 'Edit Association' : 'Create an Associations'}</h2>
            <p>Set up a new organizational entity to manage Users, modules, and operations efficiently.</p>
          </div>
          <button className="close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-section">
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
                className="form-textarea"
                rows={3}
                placeholder="Description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              ></textarea>
            </div>

            <div className="form-group logo-upload">
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
                    backgroundColor: '#f8f9fa',
                    border: '2px dashed #d1d5db',
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
                  onClick={triggerFileInput}
                >
                  Upload Logo
                </div>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Add your Address</h3>
            <p>Provide the official location details of , including street, city, state, country, and ZIP code.</p>
            
            <div className="form-row">
              <div className="form-group">
                <input 
                  type="text" 
                  placeholder="Zip Code*"
                  value={formData.address.zipCode}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    address: { ...formData.address, zipCode: e.target.value }
                  })}
                />
              </div>
              <div className="form-group">
                <select 
                  value={formData.address.state}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    address: { ...formData.address, state: e.target.value }
                  })}
                >
                  <option value="">State*</option>
                  <option value="CA">California</option>
                  <option value="NY">New York</option>
                  <option value="TX">Texas</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <input 
                type="text" 
                placeholder="City*"
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
                value={formData.address.address2}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  address: { ...formData.address, address2: e.target.value }
                })}
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Contact Person</h3>
            <p>Provide the official location details of , including street, city, state, country, and ZIP code.</p>
            
            <div className="form-group">
              <input 
                type="text" 
                placeholder="Contact Person"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
              />
            </div>

            <div className="form-group phone-group">
              <div className="phone-input">
                <span className="country-code">
                  <img src="https://flagcdn.com/w20/us.png" alt="US" />
                  +1
                </span>
                <input 
                  type="tel" 
                  placeholder="99999 99999*"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <input 
                type="email" 
                placeholder="Contact Email Address"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Social Media</h3>
            <p>Provide the official location details of , including street, city, state, country, and ZIP code.</p>
            
            <div className="form-group social-input">
              <i className="fab fa-linkedin"></i>
              <input 
                type="url" 
                placeholder="LinkedIn Page"
                value={formData.linkedinUrl}
                onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
              />
            </div>

            <div className="form-group social-input">
              <i className="fas fa-link"></i>
              <input 
                type="url" 
                placeholder="Website URL"
                value={formData.websiteUrl}
                onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="submit" className="continue-btn">
              {isEditMode ? 'Update Association' : 'Continue'}
            </button>
            <p className="mandatory-note">Please note that fields marked with * are mandatory.</p>
          </div>
        </form>
      </div>
    </>
  );
};

export default AddAssociationPopup;