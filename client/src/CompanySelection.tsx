import React, { useEffect, useState } from 'react';
import './CompanySelection.css';
import { API_ENDPOINTS } from './config';
import { updateSignupState } from './utils/signupState';
import AuthSidebar from './components/AuthSidebar';

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
        const response = await fetch(API_ENDPOINTS.companyTypes);
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
    updateSignupState({ 
      roleId, 
      roleName, 
      currentStep: 'company-selection'
    });
    onSelect(roleId, roleName);
  };

  return (
    <div className="company-selection-container">
      <AuthSidebar />
      
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
                <div className="company-icon">
                  
                  <img
  src={company.icon}
  alt="Company Icon"
  style={{
    width: "70px",
 
    objectFit: "contain",
    verticalAlign: "middle"
  }}
/>
                
                </div>
                <div className="company-info">
                  <h3>{company.name}</h3>
                  <p>{company.description}</p>
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className="company-footer">
          <button 
            className="company-not-listed-btn"
            style={{
              background: 'white',
              color: '#374151',
              border: '1px solid #d1d5db',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f9fafb';
              e.currentTarget.style.borderColor = '#9ca3af';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'white';
              e.currentTarget.style.borderColor = '#d1d5db';
            }}
          >
            Company type not listed ?
          </button>
        </div>



</div>

      </div>
    </div>
  );
};

export default CompanySelection;