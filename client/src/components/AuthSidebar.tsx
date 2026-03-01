import React from 'react';

const AuthSidebar: React.FC = () => {
  return (
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
  );
};

export default AuthSidebar;