import React, { useEffect, useState } from 'react';
import { getUserCompanies, getPendingRequests, handleOrgRequest, switchCompany } from '../services/userApi';
import { API_BASE_URL } from '../config';

interface Company {
  _id: string;
  companyProfile: {
    companyName: string;
    description?: string;
    logoId?: string;
    contactPerson?: string;
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
      logoId?: string;
      contactPerson?: string;
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
  isInitialSelection?: boolean;
}

const ChangeCompanyModal: React.FC<ChangeCompanyModalProps> = ({ 
  isOpen, 
  onClose, 
  onCompanyChanged,
  isInitialSelection = false
}) => {
  const [userCompanies, setUserCompanies] = useState<Company[]>([]);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingRequest, setProcessingRequest] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Helper function to get logo URL
  const getLogoUrl = (logoId?: string) => {
    if (!logoId) return null;
    return `${API_BASE_URL}/auth/file/${logoId}`;
  };

  // Helper function to get company initials for fallback
  const getCompanyInitials = (companyName: string) => {
    return companyName
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  };

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
      
      // Mark company as selected for initial selection
      if (isInitialSelection) {
        localStorage.setItem('selectedCompany', companyId);
      }
      
      onCompanyChanged?.();
      if (!isInitialSelection) {
        onClose();
        window.location.reload();
      }
    } catch (error) {
      console.error('Error switching company:', error);
    }
  };

  const handleRequestAction = async (requestId: string, action: 'accept' | 'reject') => {
    try {
      setProcessingRequest(requestId);
      await handleOrgRequest(requestId, action);
      
      setPendingRequests(prev => 
        prev.filter(req => req._id !== requestId)
      );
      
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

  // Combine companies and requests for unified display
  const allItems = [
    ...userCompanies.map(company => ({
      id: company._id,
      type: 'company' as const,
      name: company.companyProfile.companyName,
      subtitle: company.companyProfile.contactPerson || 'No Contact Person',
      address: 'Address',
      status: company.isOwn ? 'current' : 'available',
      logoId: company.companyProfile.logoId,
      data: company
    })),
    ...pendingRequests.map(request => ({
      id: request._id,
      type: 'request' as const,
      name: request.orgId.companyProfile.companyName,
      subtitle: request.orgId.companyProfile.contactPerson || 'No Contact Person',
      address: 'Address',
      status: request.status,
      logoId: request.orgId.companyProfile.logoId,
      data: request
    }))
  ];

  const filteredItems = allItems.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="modal-overlay" 
        onClick={isInitialSelection ? undefined : onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          zIndex: 1000
        }}
      />
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: 'white',
        borderRadius: '8px',
        width: '100%',
        maxWidth: '500px',
        maxHeight: '80vh',
        margin: '20px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        zIndex: 1001,
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        overflow: 'hidden'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '24px 24px 20px 24px',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#111827',
            margin: '0 0 20px 0',
            lineHeight: '1.2'
          }}>{isInitialSelection ? 'Select Company' : 'Change Company'}</h2>
          
          {/* Search Input */}
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search by name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                background: '#f9fafb',
                outline: 'none',
                color: '#6b7280',
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>

        {/* Content */}
        <div style={{ 
          maxHeight: '400px', 
          overflowY: 'auto',
          padding: '0'
        }}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
              Loading...
            </div>
          ) : filteredItems.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
              {isInitialSelection ? 'No companies available. Please contact your administrator.' : 'No companies found'}
            </div>
          ) : (
            filteredItems.map((item, index) => (
              <div 
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '16px 24px',
                  borderBottom: index === filteredItems.length - 1 ? 'none' : '1px solid #f3f4f6',
                  gap: '16px'
                }}
              >
                {/* Company Avatar */}
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '6px',
                  flexShrink: 0,
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#f3f4f6',
                  border: '1px solid #e5e7eb'
                }}>
                  {item.logoId && getLogoUrl(item.logoId) ? (
                    <img 
                      src={getLogoUrl(item.logoId)!} 
                      alt={`${item.name} logo`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                      onError={(e) => {
                        // Fallback to initials if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = `<span style="font-size: 16px; font-weight: 600; color: #6b7280;">${getCompanyInitials(item.name)}</span>`;
                        }
                      }}
                    />
                  ) : (
                    <span style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#6b7280'
                    }}>
                      {getCompanyInitials(item.name)}
                    </span>
                  )}
                </div>
                
                {/* Company Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#111827',
                    margin: '0 0 4px 0',
                    lineHeight: '1.2'
                  }}>
                    {item.name}
                  </h3>
                  <p style={{
                    fontSize: '14px',
                    color: '#9ca3af',
                    margin: '0 0 2px 0',
                    lineHeight: '1.2'
                  }}>
                    {item.subtitle}
                  </p>
                  <p style={{
                    fontSize: '14px',
                    color: '#9ca3af',
                    margin: '0',
                    lineHeight: '1.2'
                  }}>
        
                  </p>
                </div>
                
                {/* Action Button */}
                <div style={{ flexShrink: 0 }}>
                  {item.type === 'request' && item.status === 'pending' ? (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleRequestAction(item.id, 'accept')}
                        disabled={processingRequest === item.id}
                        style={{
                          padding: '8px 16px',
                          border: 'none',
                          borderRadius: '6px',
                          background: '#10b981',
                          color: 'white',
                          fontSize: '14px',
                          fontWeight: '500',
                          cursor: processingRequest === item.id ? 'not-allowed' : 'pointer',
                          opacity: processingRequest === item.id ? 0.6 : 1,
                          transition: 'all 0.2s ease',
                          minWidth: '70px'
                        }}
                      >
                        {processingRequest === item.id ? 'Processing...' : 'Accept'}
                      </button>
                      <button
                        onClick={() => handleRequestAction(item.id, 'reject')}
                        disabled={processingRequest === item.id}
                        style={{
                          padding: '8px 16px',
                          border: '1px solid #ef4444',
                          borderRadius: '6px',
                          background: 'white',
                          color: '#ef4444',
                          fontSize: '14px',
                          fontWeight: '500',
                          cursor: processingRequest === item.id ? 'not-allowed' : 'pointer',
                          opacity: processingRequest === item.id ? 0.6 : 1,
                          transition: 'all 0.2s ease',
                          minWidth: '70px'
                        }}
                        onMouseEnter={(e) => {
                          if (processingRequest !== item.id) {
                            e.currentTarget.style.backgroundColor = '#ef4444';
                            e.currentTarget.style.color = 'white';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (processingRequest !== item.id) {
                            e.currentTarget.style.backgroundColor = 'white';
                            e.currentTarget.style.color = '#ef4444';
                          }
                        }}
                      >
                        Reject
                      </button>
                    </div>
                  ) : item.status === 'accepted' || item.status === 'current' ? (
                    <div style={{
                      padding: '10px 20px',
                      borderRadius: '6px',
                      background: isInitialSelection ? '#10b981' : '#2563eb',
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: '80px',
                      cursor: isInitialSelection ? 'pointer' : 'default'
                    }}
                    onClick={isInitialSelection ? () => handleCompanySwitch(item.id) : undefined}
                    >
                      {isInitialSelection ? 'Select' : (
                        <>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ marginRight: '4px' }}>
                            <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => item.type === 'company' && handleCompanySwitch(item.id)}
                      style={{
                        padding: '10px 20px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        background: 'white',
                        color: '#374151',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        minWidth: '80px'
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
                      {isInitialSelection ? 'Select' : 'Change'}
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Close Button - Only show for non-initial selection */}
        {!isInitialSelection && (
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'none',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              color: '#6b7280',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '4px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f3f4f6';
              e.currentTarget.style.color = '#374151';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#6b7280';
            }}
          >
            ×
          </button>
        )}
      </div>
    </>
  );
};

export default ChangeCompanyModal;