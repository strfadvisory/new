import React, { useEffect, useState } from 'react';
import './CompanySelection.css';
import { API_BASE_URL } from './config';

interface CompanyType {
  _id: string;
  name: string;
  description: string;
  icon: string;
}

interface CompanySelectionProps {
  onBack: () => void;
  onSelect: (roleId: string, roleName: string) => void;
}

const CompanySelection: React.FC<CompanySelectionProps> = ({ onBack, onSelect }) => {
  const [companyTypes, setCompanyTypes] = useState<CompanyType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanyTypes = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/roles/company-types`);
        const data = await response.json();
        setCompanyTypes(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching company types:', error);
        setCompanyTypes([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCompanyTypes();
  }, []);

  const handleCompanySelect = (roleId: string, roleName: string) => {
    onSelect(roleId, roleName);
  };

  return (
    <div className="company-selection-container">
      <div className="company-sidebar">
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
      
      <div className="company-content">
                <div  style={{ padding: '24px', paddingBottom: '50px', maxWidth: '800px', margin: '0 auto' }}> 
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
          {loading ? (
            <p>Loading...</p>
          ) : (
            companyTypes.map((company) => (
              <div 
                key={company._id} 
                className="company-card"
                onClick={() => handleCompanySelect(company._id, company.name)}
              >
                <div className="company-icon"><i className={company.icon}></i></div>
                <div className="company-info">
                  <h3>{company.name}</h3>
                  <p>{company.description}</p>
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className="company-footer">
          <a href="#" className="company-not-listed">Company type not listed ?</a>
        </div>



</div>

      </div>
    </div>
  );
};

export default CompanySelection;