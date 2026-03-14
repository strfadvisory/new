import React, { useEffect, useState } from 'react';
import { getUserCompanies, getPendingRequests, handleOrgRequest, switchCompany } from '../services/userApi';

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

interface ChangeCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCompanyChanged?: () => void;
}

const ChangeCompanyModal: React.FC<ChangeCompanyModalProps> = ({ 
  isOpen, 
  onClose, 
  onCompanyChanged 
}) => {
  const [userCompanies, setUserCompanies] = useState<Company[]>([]);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'companies' | 'requests'>('companies');
  const [processingRequest, setProcessingRequest] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchUserData();
    }
  }, [isOpen]);

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

  const handleCompanySwitch = async (companyId: string) => {
    try {
      await switchCompany(companyId);
      onCompanyChanged?.();
      onClose();
      // Optionally reload the page or update context
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

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="modal-overlay" 
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1000
        }}
      />
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: 'white',
        borderRadius: '10px',
        width: '100%',
        maxWidth: '600px',
        maxHeight: '80vh',
        margin: '20px',
        border: '1px solid #e6e6e6',
        zIndex: 1001,
        fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        overflow: 'hidden'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '20px 20px 8px 20px',
          borderBottom: '1px solid #e6e6e6'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#2f2f2f',
            margin: '0 0 8px 0'
          }}>Change Company</h2>
          <p style={{
            fontSize: '14px',
            color: '#6b7280',
            margin: '0',
            lineHeight: '1.5'
          }}>Switch between your companies or manage pending invitations.</p>
        </div>

        {/* Tabs */}
        <div style={{ padding: '0 20px', borderBottom: '1px solid #e6e6e6', background: '#f9fafb' }}>
          <div style={{ display: 'flex', gap: '0' }}>
            <button
              onClick={() => setActiveTab('companies')}
              style={{
                padding: '12px 24px',
                border: 'none',
                background: activeTab === 'companies' ? 'white' : 'transparent',
                color: activeTab === 'companies' ? '#1f4f8f' : '#6b7280',
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
              onClick={() => setActiveTab('requests')}
              style={{
                padding: '12px 24px',
                border: 'none',
                background: activeTab === 'requests' ? 'white' : 'transparent',
                color: activeTab === 'requests' ? '#1f4f8f' : '#6b7280',
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

        {/* Content */}
        <div style={{ 
          maxHeight: '400px', 
          overflowY: 'auto',
          padding: activeTab === 'companies' ? '0' : '0'
        }}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
              Loading...
            </div>
          ) : activeTab === 'companies' ? (
            // Companies List
            <div>
              {userCompanies.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
                  No companies available
                </div>
              ) : (
                userCompanies.map((company) => (
                  <div 
                    key={company._id}
                    onClick={() => handleCompanySwitch(company._id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '16px 20px',
                      borderBottom: '1px solid #f3f4f6',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f9fafb';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'white';
                    }}
                  >
                    <div style={{
                      width: '48px',
                      height: '48px',
                      backgroundColor: '#f3f4f6',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#1f4f8f',
                      marginRight: '16px'
                    }}>
                      {company.companyProfile.companyName.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#1f2937',
                        margin: '0 0 4px 0'
                      }}>
                        {company.companyProfile.companyName}
                      </h3>
                      <p style={{
                        fontSize: '14px',
                        color: '#6b7280',
                        margin: '0'
                      }}>
                        {company.isOwn ? 'Your Company' : `Member of ${company.firstName} ${company.lastName}'s company`}
                      </p>
                    </div>
                    <div style={{ marginLeft: '16px' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M9 18L15 12L9 6" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            // Pending Requests List
            <div>
              {pendingRequests.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
                  No pending requests
                </div>
              ) : (
                pendingRequests.map((request) => (
                  <div 
                    key={request._id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '16px 20px',
                      borderBottom: '1px solid #f3f4f6'
                    }}
                  >
                    <div style={{
                      width: '48px',
                      height: '48px',
                      backgroundColor: '#fef3c7',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '18px',
                      marginRight: '16px'
                    }}>
                      📋
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#1f2937',
                        margin: '0 0 4px 0'
                      }}>
                        {request.orgId.companyProfile.companyName}
                      </h3>
                      <p style={{
                        fontSize: '14px',
                        color: '#6b7280',
                        margin: '2px 0'
                      }}>
                        Role: <strong>{request.role}</strong>
                      </p>
                      <p style={{
                        fontSize: '14px',
                        color: '#6b7280',
                        margin: '2px 0'
                      }}>
                        Invited by: {request.requestedBy.firstName} {request.requestedBy.lastName}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginLeft: '16px' }}>
                      <button
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
                          opacity: processingRequest === request._id ? 0.6 : 1
                        }}
                      >
                        {processingRequest === request._id ? 'Processing...' : 'Accept'}
                      </button>
                      <button
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
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'none',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
            color: '#6b7280',
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          ×
        </button>
      </div>
    </>
  );
};

export default ChangeCompanyModal;