import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserProfile } from '../services/userApi';
import './Profile.css';

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await getUserProfile();
      setProfile(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load profile');
      if (err.message === 'Not authorized') {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-container">
        <div className="error-message">
          <i className="fas fa-exclamation-circle"></i>
          <p>{error}</p>
          <button onClick={fetchProfile} className="retry-btn">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-avatar">
          <i className="fas fa-user-circle"></i>
        </div>
        
        <div className="profile-info">
          <h2>{profile?.name}</h2>
          
          <div className="profile-details">
            <div className="detail-item">
              <i className="fas fa-envelope"></i>
              <div>
                <label>Email</label>
                <span>{profile?.email}</span>
              </div>
            </div>
            
            <div className="detail-item">
              <i className="fas fa-user-tag"></i>
              <div>
                <label>Role</label>
                <span>{profile?.role}</span>
              </div>
            </div>
            
            <div className="detail-item">
              <i className="fas fa-calendar-alt"></i>
              <div>
                <label>Joined</label>
                <span>{new Date(profile?.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="profile-actions">
          <button className="edit-profile-btn" onClick={() => alert('Edit profile feature coming soon!')}>
            <i className="fas fa-edit"></i>
            Edit Profile
          </button>
          <button className="logout-btn-profile" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
