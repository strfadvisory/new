import React from 'react';
import './CompanySelection.css';

interface CompanySelectionProps {
  onBack: () => void;
  onSelect: (companyType: string) => void;
}

const CompanySelection: React.FC<CompanySelectionProps> = ({ onBack, onSelect }) => {
  const companyTypes = [
    {
      id: 1,
      icon: 'fas fa-users',
      title: 'Association',
      description: 'Set up a new organizational entity to manage members, modules.',
      selected: true
    },
    {
      id: 2,
      icon: 'fas fa-building',
      title: 'Management Company',
      description: 'Set up a new organizational entity to manage members, modules.'
    },
    {
      id: 3,
      icon: 'fas fa-chart-line',
      title: 'Reserve Study Company',
      description: 'Set up a new organizational entity to manage members, modules.'
    },
    {
      id: 4,
      icon: 'fas fa-user-tie',
      title: 'Investor Advisor',
      description: 'Set up a new organizational entity to manage members, modules.'
    },
    {
      id: 5,
      icon: 'fas fa-university',
      title: 'Banker',
      description: 'Set up a new organizational entity to manage members, modules.'
    }
  ];

  const handleCompanySelect = (companyType: string) => {
    onSelect(companyType);
  };

  return (
    <div className="company-selection-container">
      <div className="company-sidebar">
        <div className="logo">
          <img src="/logo.png" alt="Reserve Fund Advisory" className="logo-image" />
          <div className="logo-text">
            <div className="company-name">RESERVE FUND</div>
            <div className="company-subtitle">ADVISORY LLC</div>
          </div>
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
      
      <div className="company-content">
        <div className="company-header">
          <div className="header-top">
            <span className="select-company">Select Company</span>
            <button className="already-account" onClick={onBack}>
              Already I have an account?
            </button>
          </div>
          <h1>Welcome Back</h1>
          <p>Choose your Company type you like to signup</p>
        </div>
        
        <div className="company-grid">
          {companyTypes.map((company) => (
            <div 
              key={company.id} 
              className={`company-card ${company.selected ? 'selected' : ''}`}
              onClick={() => handleCompanySelect(company.title)}
            >
              <div className="company-icon"><i className={company.icon}></i></div>
              <div className="company-info">
                <h3>{company.title}</h3>
                <p>{company.description}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="company-footer">
          <a href="#" className="company-not-listed">Company type not listed ?</a>
        </div>
      </div>
    </div>
  );
};

export default CompanySelection;