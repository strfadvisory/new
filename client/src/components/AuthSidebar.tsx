import React from 'react';

const AuthSidebar: React.FC = () => {
  return (
    <div className="profile-sidebar">
      <div className="logo app-logo">
        <img src="/logo1.png" alt="Reserve Fund Advisory" />
      </div>

      <div className="contact-info" style={{ color: 'white' }}>
        <div className="contact-item">
          <i className="fas fa-envelope"></i> info@reservefundadvisory.com
        </div>
        <div className="contact-item">
          <i className="fas fa-phone"></i> 727-788-4800
        </div>
      </div>
    </div>
  );
};

export default AuthSidebar;