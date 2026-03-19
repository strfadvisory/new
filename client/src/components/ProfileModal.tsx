import React, { useState, useEffect, useRef } from 'react';
import './ProfileModal.css';
import './Modal.css';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onChangePassword: () => void;
  onDeleteAccount: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, user, onChangePassword, onDeleteAccount }) => {
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      fetchUserProfile();
    }
  }, [isOpen]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profileImage', file);

    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5001/api'}/user/upload-profile-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        fetchUserProfile(); // Refresh profile data
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5001/api'}/user/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setProfileData(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfileData(user);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-overlay" onClick={onClose}></div>
      <div className="profile-modal">
        <div className="profile-modal-header">
          <h2>My Profile</h2>
          <button className="close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        {loading ? (
          <div className="profile-loading">
            <i className="fas fa-spinner fa-spin"></i>
          </div>
        ) : (
          <div className="profile-modal-content">
            <div className="profile-section">
              <div className="profile-avatar-section">
                <div className="profile-avatar-large">
                  {profileData?.profileImageId ? (
                    <img 
                      src={`${process.env.REACT_APP_API_URL || 'http://localhost:5001/api'}/user/profile-image/${profileData.profileImageId}`}
                      alt="Profile"
                      style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                    />
                  ) : (
                    <i className="fas fa-user-circle"></i>
                  )}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImageUpload} 
                    accept="image/*" 
                    style={{ display: 'none' }} 
                  />
                  <button className="upload-avatar-btn" onClick={() => fileInputRef.current?.click()}>
                    <i className="fas fa-camera"></i>
                  </button>
                </div>
                <div className="profile-basic-info">
                  <h3>{profileData?.name}</h3>
                  <p>{profileData?.email}</p>
                  <p>{profileData?.phone || 'Phone number'}</p>
                  <div className="join-date">
                    Join Date: {profileData?.createdAt ? new Date(profileData.createdAt).toLocaleDateString('en-GB', { 
                      day: '2-digit', 
                      month: 'short', 
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : 'N/A'}
                  </div>
                </div>
              </div>
            </div>

            <div className="profile-section">
              <h4>Address</h4>
              <div className="address-content">
                {profileData?.address?.address1 ? (
                  <>
                    <p>{profileData.address.address1}</p>
                    {profileData.address.address2 && <p>{profileData.address.address2}</p>}
                    <p>
                      {[profileData.address.city, profileData.address.state, profileData.address.zipCode]
                        .filter(Boolean)
                        .join(', ')}
                    </p>
                  </>
                ) : (
                  <p className="no-data">Address</p>
                )}
              </div>
            </div>

            <div className="profile-section">
              <h4>Member Details</h4>
              <div className="member-item">
                <div>
                  <p className="company-name">{profileData?.companyProfile?.companyName || 'Company name'}</p>
                  <p className="role-name">{profileData?.role}</p>
                </div>
                <button className="menu-btn">
                  <i className="fas fa-ellipsis-h"></i>
                </button>
              </div>
            </div>

            <div className="profile-section">
              <button className="profile-action-btn" onClick={onChangePassword}>
                <i className="fas fa-lock"></i>
                Change Password
              </button>
            </div>

            <div className="profile-section">
              <button className="profile-action-btn delete-btn" onClick={onDeleteAccount}>
                <i className="fas fa-trash"></i>
                Delete My Account
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ProfileModal;
