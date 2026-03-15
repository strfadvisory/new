import React, { useEffect, useState } from 'react';
import './CompanySelection.css';
import { API_ENDPOINTS } from './config';
import { updateSignupState } from './utils/signupState';
import { getIconUrl } from './utils/iconUtils';
import AuthSidebar from './components/AuthSidebar';
import { getUserCompanies, getPendingRequests, handleOrgRequest, switchCompany } from './services/userApi';

interface CompanyType {
  _id: string;
  name: string;
  description: string;
  icon: string;
}

interface Company {
  _id: string;
  companyProfile: {
    companyName: string;
    description?: string;
  };
  firstName: string;
  lastName: string;
  isOwn: boolean;
}

interface PendingRequest {
  _id: string;
  orgId: {
    _id: string;
    companyProfile: {
      companyName: string;
    };
    firstName: string;
    lastName: string;
  };
  role: string;
  requestedBy: {
    firstName: string;
    lastName: string;
    email: string;
  };
  status: string;
}

interface CompanySelectionProps {
  onBack: () => void;
  onSelect: (roleId: string, roleName: string) => void;
  isChangeCompany?: boolean;
}

const CompanySelection: React.FC<CompanySelectionProps> = ({ onBack, onSelect, isChangeCompany = false }) => {
  const [companyTypes, setCompanyTypes] = useState<CompanyType[]>([]);
  const [userCompanies, setUserCompanies] = useState<Company[]>([]);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'companies' | 'requests'>('companies');
  const [processingRequest, setProcessingRequest] = useState<string | null>(null);

  useEffect(() => {
    if (isChangeCompany) {
      fetchUserData();
    } else {
      fetchCompanyTypes();
    }
  }, [isChangeCompany]);

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

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const [companiesData, requestsData] = await Promise.all([
        getUserCompanies(),
        getPendingRequests()
      ]);
      setUserCompanies(companiesData);
      setPendingRequests(requestsData);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompanySelect = (roleId: string, roleName: string) => {
    updateSignupState({ 
      roleId, 
      roleName, 
      currentStep: 'company-selection'
    });
    onSelect(roleId, roleName);
  };

  const handleCompanySwitch = async (companyId: string) => {
    try {
      const response = await switchCompany(companyId);
      
      // Reload to apply company switch
      window.location.reload();
    } catch (error) {
      console.error('Error switching company:', error);
    }
  };

  const handleRequestAction = async (requestId: string, action: 'accept' | 'reject') => {
    try {
      setProcessingRequest(requestId);
      await handleOrgRequest(requestId, action);
      
      // Update local state
      setPendingRequests(prev => 
        prev.filter(req => req._id !== requestId)
      );
      
      // If accepted, refresh companies list
      if (action === 'accept') {
        const companiesData = await getUserCompanies();
        setUserCompanies(companiesData);
      }
    } catch (error) {
      console.error(`Error ${action}ing request:`, error);
    } finally {
      setProcessingRequest(null);
    }
  };

  const renderCompanyTypes = () => (
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
  );

  const renderUserCompanies = () => (
    <div className="company-list">
      {loading ? (
        <p>Loading companies...</p>
      ) : userCompanies.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#6b7280', padding: '20px' }}>
          No companies available
        </p>
      ) : (
        userCompanies.map((company) => (
          <div 
            key={company._id} 
            className="company-item"
            onClick={() => handleCompanySwitch(company._id)}
          >
            <div className="company-icon">
              <div style={{
                width: "48px",
                height: "48px",
                backgroundColor: "#f3f4f6",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px",
                fontWeight: "600",
                color: "#1f4f8f"
              }}>
                {company.companyProfile.companyName.charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="company-details">
              <h3>{company.companyProfile.companyName}</h3>
              <p>
                {company.isOwn ? 'Your Company' : `Member of ${company.firstName} ${company.lastName}'s company`}
              </p>
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
  );

  const renderPendingRequests = () => (
    <div className="pending-requests-list">
      {loading ? (
        <p>Loading requests...</p>
      ) : pendingRequests.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#6b7280', padding: '20px' }}>
          No pending requests
        </p>
      ) : (
        pendingRequests.map((request) => (
          <div key={request._id} className="request-item">
            <div className="request-icon">
              <div style={{
                width: "48px",
                height: "48px",
                backgroundColor: "#fef3c7",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px"
              }}>
                📋
              </div>
            </div>
            <div className="request-details">
              <h3>{request.orgId.companyProfile.companyName}</h3>
              <p>Role: <strong>{request.role}</strong></p>
              <p>Invited by: {request.requestedBy.firstName} {request.requestedBy.lastName}</p>
            </div>
            <div className="request-actions">
              <button
                className="accept-btn"
                onClick={() => handleRequestAction(request._id, 'accept')}
                disabled={processingRequest === request._id}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: processingRequest === request._id ? 'not-allowed' : 'pointer',
                  marginRight: '8px',
                  opacity: processingRequest === request._id ? 0.6 : 1
                }}
              >
                {processingRequest === request._id ? 'Processing...' : 'Accept'}
              </button>
              <button
                className="reject-btn"
                onClick={() => handleRequestAction(request._id, 'reject')}
                disabled={processingRequest === request._id}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: processingRequest === request._id ? 'not-allowed' : 'pointer',
                  opacity: processingRequest === request._id ? 0.6 : 1
                }}
              >
                {processingRequest === request._id ? 'Processing...' : 'Reject'}
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );

  return (
    <div className="company-selection-container">
      <AuthSidebar />
      
      <div className="company-content">
        <div style={{ background: 'white', border:'1px solid #E5E5E5', maxWidth: '800px', margin: '0 auto', borderRadius: '8px' }}> 
          <div className="company-header">
            <h2 style={{ fontSize: '20px', borderBottom: '1px solid #E3E3E3', padding: '20px' }}>
              {isChangeCompany ? 'Change Company' : 'Choose your Company Type'}
            </h2>
            <p style={{ padding: '20px' }}>
              {isChangeCompany 
                ? 'Switch between your companies or manage pending invitations.' 
                : 'Set up a new organisational entity to manage Users, modules, and operations efficiently.'}
            </p>
          </div>
          
          {isChangeCompany && (
            <div className="tabs-container" style={{ padding: '0 20px', borderBottom: '1px solid #E3E3E3' }}>
              <div className="tabs" style={{ display: 'flex', gap: '0' }}>
                <button
                  className={`tab ${activeTab === 'companies' ? 'active' : ''}`}
                  onClick={() => setActiveTab('companies')}
                  style={{
                    padding: '12px 24px',
                    border: 'none',
                    background: activeTab === 'companies' ? '#1f4f8f' : 'transparent',
                    color: activeTab === 'companies' ? 'white' : '#6b7280',
                    borderRadius: '6px 6px 0 0',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    borderBottom: activeTab === 'companies' ? '2px solid #1f4f8f' : '2px solid transparent'
                  }}
                >
                  My Companies ({userCompanies.length})
                </button>
                <button
                  className={`tab ${activeTab === 'requests' ? 'active' : ''}`}
                  onClick={() => setActiveTab('requests')}
                  style={{
                    padding: '12px 24px',
                    border: 'none',
                    background: activeTab === 'requests' ? '#1f4f8f' : 'transparent',
                    color: activeTab === 'requests' ? 'white' : '#6b7280',
                    borderRadius: '6px 6px 0 0',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    borderBottom: activeTab === 'requests' ? '2px solid #1f4f8f' : '2px solid transparent',
                    position: 'relative'
                  }}
                >
                  Pending Requests
                  {pendingRequests.length > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      borderRadius: '50%',
                      width: '18px',
                      height: '18px',
                      fontSize: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {pendingRequests.length}
                    </span>
                  )}
                </button>
              </div>
            </div>
          )}
          
          <div style={{ minHeight: '300px' }}>
            {!isChangeCompany ? renderCompanyTypes() : (
              activeTab === 'companies' ? renderUserCompanies() : renderPendingRequests()
            )}
          </div>
          
          {!isChangeCompany && (
            <div className="company-not-listed" style={{ fontSize: '20px', padding: '20px', color:'#6b7280' }}
                 onClick={() => handleCompanySelect('other', 'Company Type Not Listed')}>
              <span>Company Type not listed</span>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M9 18L15 12L9 6" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanySelection;