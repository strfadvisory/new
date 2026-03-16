import React, { useState, useEffect } from 'react';
import { useUserSubRoles } from '../hooks/queries/useRoles';
import { useInviteMemberWithValidation } from '../hooks/queries/useAuth';
import { useApiCallTracker } from '../hooks/useApiCallTracker';
import { toast } from 'react-toastify';

interface Association {
  _id: string;
  name: string;
}

interface ReserveStudy {
  _id: string;
  studyName: string;
}

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  selectedAssociations?: Association[];
  selectedReserveStudies?: ReserveStudy[];
}

interface InviteData {
  selectedRole: string;
  firstName: string;
  lastName: string;
  email: string;
  designation: string;
  associationIds?: string[];
  reserveStudyIds?: string[];
}

interface SubRole {
  _id: string;
  name: string;
  permissionLevel: string;
}

const InviteMemberModal: React.FC<InviteMemberModalProps> = React.memo(({ 
  isOpen, 
  onClose, 
  title = 'Add New Member',
  selectedAssociations = [],
  selectedReserveStudies = []
}) => {
  const [inviteData, setInviteData] = useState<InviteData>({
    selectedRole: '',
    firstName: '',
    lastName: '',
    email: '',
    designation: '',
    associationIds: selectedAssociations.map(a => a._id),
    reserveStudyIds: selectedReserveStudies.map(r => r._id)
  });
  
  const addMemberMutation = useInviteMemberWithValidation();
  
  // API call tracker to monitor and prevent infinite loops
  const { callCount, getGlobalStats } = useApiCallTracker('user-subroles', isOpen);
  
  // Use React Query hook for fetching sub roles - only when modal is open
  const { data: subRolesData, isLoading: loadingSubRoles, error } = useUserSubRoles(isOpen);
  const subRoles = subRolesData?.subRoles || [];
  
  // Debug logging with API call tracking
  useEffect(() => {
    if (error) {
      console.error('SubRoles API Error:', error);
    }
    if (callCount > 3) {
      console.warn(`🚨 INFINITE LOOP DETECTED: user-subroles called ${callCount} times`);
      console.log('Global API Stats:', getGlobalStats());
    }
  }, [error, callCount, getGlobalStats]);

  useEffect(() => {
    if (isOpen) {
      // Update invite data with selected items when modal opens
      setInviteData(prev => ({
        ...prev,
        associationIds: selectedAssociations.map(a => a._id),
        reserveStudyIds: selectedReserveStudies.map(r => r._id)
      }));
    }
  }, [isOpen, selectedAssociations, selectedReserveStudies]);

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await addMemberMutation.mutateAsync(inviteData);
      
      // Show appropriate message based on response
      if (response.userExists) {
        toast.info(`User already exists! Organization request has been sent to ${inviteData.email}`);
      } else {
        toast.success(`Invitation sent successfully to ${inviteData.email}`);
      }
      
      // Show role information if available
      if (response.roleInfo) {
        console.log('Assigned role:', response.roleInfo);
      }
      
      setInviteData({ 
        selectedRole: '', 
        firstName: '', 
        lastName: '', 
        email: '', 
        designation: '',
        associationIds: [],
        reserveStudyIds: []
      });
      onClose();
    } catch (error: any) {
      console.error('Error sending invitation:', error);
      const errorMessage = error.response?.data?.message || 'Failed to send invitation';
      toast.error(errorMessage);
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
      ></div>
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: 'white',
        borderRadius: '10px',
        width: '100%',
        maxWidth: '500px',
        margin: '20px',
        border: '1px solid #e6e6e6',
        zIndex: 1001,
        fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      }}>
        {/* Form Header */}
        <div style={{
          padding: '20px 20px 8px 20px',
          borderBottom: '1px solid #e6e6e6'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#2f2f2f',
            margin: '0 0 8px 0'
          }}>{title}</h2>
          <p style={{
            fontSize: '14px',
            color: '#6b7280',
            margin: '0',
            lineHeight: '1.5'
          }}>Invite a new member to join your organization with specific role permissions.</p>
        </div>
        
        {/* Form Body */}
        <form onSubmit={handleInviteSubmit} style={{ padding: '20px' }}>
          
          {/* Access Summary */}
          {(selectedAssociations.length > 0 || selectedReserveStudies.length > 0) && (
            <div style={{
              marginBottom: '20px',
              padding: '16px',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }}>
              <h4 style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                margin: '0 0 12px 0'
              }}>Member will get access to:</h4>
              
              {selectedAssociations.length > 0 && (
                <div style={{ marginBottom: '8px' }}>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: '500',
                    color: '#6b7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>Associations ({selectedAssociations.length}):</span>
                  <div style={{ marginTop: '4px' }}>
                    {selectedAssociations.map((assoc, index) => (
                      <span key={assoc._id} style={{
                        display: 'inline-block',
                        backgroundColor: '#dbeafe',
                        color: '#1e40af',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        marginRight: '6px',
                        marginBottom: '4px'
                      }}>
                        {assoc.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedReserveStudies.length > 0 && (
                <div>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: '500',
                    color: '#6b7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>Reserve Studies ({selectedReserveStudies.length}):</span>
                  <div style={{ marginTop: '4px' }}>
                    {selectedReserveStudies.map((study, index) => (
                      <span key={study._id} style={{
                        display: 'inline-block',
                        backgroundColor: '#dcfce7',
                        color: '#166534',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        marginRight: '6px',
                        marginBottom: '4px'
                      }}>
                        {study.studyName}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Role Selection */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              marginBottom: '5px',
              fontSize: '16px',
              fontWeight: '500',
              color: '#374151'
            }}>Select Role *</label>
            <select 
              value={inviteData.selectedRole} 
              onChange={(e) => setInviteData({...inviteData, selectedRole: e.target.value})} 
              required
              disabled={loadingSubRoles}
              style={{
                width: '100%',
                height: '44px',
                borderRadius: '8px',
                border: '1px solid #dcdcdc',
                padding: '0 14px',
                fontSize: '14px',
                background: loadingSubRoles ? '#f5f5f5' : '#fafafa',
                transition: 'all 0.2s ease',
                cursor: loadingSubRoles ? 'not-allowed' : 'pointer'
              }}
            >
              <option value="">
                {loadingSubRoles ? 'Loading roles...' : 
                 subRoles.length === 0 ? 'No sub-roles available' : 'Choose a role'}
              </option>
              {subRoles.map((role) => (
                <option key={role._id} value={role._id}>
                  {role.name} - {role.permissionLevel}
                </option>
              ))}
            </select>
            {subRoles.length === 0 && !loadingSubRoles && (
              <p style={{
                fontSize: '12px',
                color: '#ef4444',
                margin: '4px 0 0 0',
                fontStyle: 'italic'
              }}>
                No sub-roles found. Please contact your administrator to set up role permissions.
              </p>
            )}
            {inviteData.selectedRole && subRoles.length > 0 && (
              <p style={{
                fontSize: '12px',
                color: '#10b981',
                margin: '4px 0 0 0',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Role validated for your organization
              </p>
            )}
          </div>
          
          {/* Name Fields */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '15px',
            marginBottom: '16px'
          }}>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '5px',
                fontSize: '16px',
                fontWeight: '500',
                color: '#374151'
              }}>First Name *</label>
              <input 
                type="text" 
                placeholder="Enter first name"
                value={inviteData.firstName} 
                onChange={(e) => setInviteData({...inviteData, firstName: e.target.value})} 
                required
                style={{
                  width: '100%',
                  height: '44px',
                  borderRadius: '8px',
                  border: '1px solid #dcdcdc',
                  padding: '0 14px',
                  fontSize: '14px',
                  background: '#fafafa',
                  transition: 'all 0.2s ease'
                }}
              />
            </div>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '5px',
                fontSize: '16px',
                fontWeight: '500',
                color: '#374151'
              }}>Last Name *</label>
              <input 
                type="text" 
                placeholder="Enter last name"
                value={inviteData.lastName} 
                onChange={(e) => setInviteData({...inviteData, lastName: e.target.value})} 
                required
                style={{
                  width: '100%',
                  height: '44px',
                  borderRadius: '8px',
                  border: '1px solid #dcdcdc',
                  padding: '0 14px',
                  fontSize: '14px',
                  background: '#fafafa',
                  transition: 'all 0.2s ease'
                }}
              />
            </div>
          </div>
          
          {/* Email Field */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              marginBottom: '5px',
              fontSize: '16px',
              fontWeight: '500',
              color: '#374151'
            }}>Email Address *</label>
            <input 
              type="email" 
              placeholder="Enter email address"
              value={inviteData.email} 
              onChange={(e) => setInviteData({...inviteData, email: e.target.value})} 
              required
              style={{
                width: '100%',
                height: '44px',
                borderRadius: '8px',
                border: '1px solid #dcdcdc',
                padding: '0 14px',
                fontSize: '14px',
                background: '#fafafa',
                transition: 'all 0.2s ease'
              }}
            />
          </div>
          
          {/* Designation Field */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '5px',
              fontSize: '16px',
              fontWeight: '500',
              color: '#374151'
            }}>Designation *</label>
            <input 
              type="text" 
              placeholder="Enter designation"
              value={inviteData.designation} 
              onChange={(e) => setInviteData({...inviteData, designation: e.target.value})} 
              required
              style={{
                width: '100%',
                height: '44px',
                borderRadius: '8px',
                border: '1px solid #dcdcdc',
                padding: '0 14px',
                fontSize: '14px',
                background: '#fafafa',
                transition: 'all 0.2s ease'
              }}
            />
          </div>
          
          {/* Form Actions */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '12px 24px',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                background: 'white',
                color: '#374151',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={addMemberMutation.isPending}
              style={{
                padding: '12px 24px',
                borderRadius: '8px',
                border: 'none',
                background: addMemberMutation.isPending ? '#9ca3af' : '#1f4f8f',
                color: 'white',
                fontSize: '14px',
                fontWeight: '600',
                cursor: addMemberMutation.isPending ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {addMemberMutation.isPending ? (
                <>
                  <i className="fas fa-spinner fa-spin" style={{ marginRight: '8px' }}></i>
                  Sending Invite...
                </>
              ) : (
                'Send Invite'
              )}
            </button>
          </div>
        </form>
        
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
});

export default InviteMemberModal;