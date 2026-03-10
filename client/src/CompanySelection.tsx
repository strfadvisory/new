import React, { useEffect, useState } from 'react';
import './CompanySelection.css';
import { API_ENDPOINTS } from './config';
import { updateSignupState } from './utils/signupState';
import { getIconUrl } from './utils/iconUtils';
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
                <div  style={{ background: 'white',  border:'1px solid #E5E5E5', maxWidth: '800px', margin: '0 auto', borderRadius: '8px',  }}> 
        <div className="company-header">
          <h2 style={{ fontSize: '20px', borderBottom: '1px solid #E3E3E3',  padding: '20px' }}>Choose your Company Type</h2>
          <p  style={{   padding: '20px' }}>Set up a new organisational entity to manage Users, modules, and operations efficiently.</p>
        </div>
        
        <div className="company-list">
          {loading ? (
            <p>Loading...</p>
          ) : (
            companyTypes.map((company) => (
              <div 
                key={company._id} 
                className="company-item"
                onClick={() => handleCompanySelect(company._id, company.name)}
              >
                <div className="company-icon">
                  <img
                    src={getIconUrl(company.icon)}
                    alt="Company Icon"
                    style={{
                      width: "48px",
                      height: "48px",
                      objectFit: "contain"
                    }}
                  />
                </div>
                <div className="company-details">
                  <h3>{company.name}</h3>
                  <p>{company.description}</p>
                </div>
                <div className="company-arrow">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M9 18L15 12L9 6" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className="company-not-listed" style={{ fontSize: '20px',  padding: '20px', color:'#6b7280' }}
             onClick={() => handleCompanySelect('other', 'Company Type Not Listed')}>
          <span>Company Type not listed</span>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M9 18L15 12L9 6" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>



</div>

      </div>
    </div>
  );
};

export default CompanySelection;