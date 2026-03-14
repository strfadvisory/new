import React, { useState, useEffect } from 'react';
import { rolesApi } from '../api/services/rolesApi';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

interface InviteData {
  selectedRole: string;
  firstName: string;
  lastName: string;
  adminEmail: string;
  designation: string;
}

interface SubRole {
  _id: string;
  name: string;
  permissionLevel: string;
}

const InviteMemberModal: React.FC<InviteMemberModalProps> = ({ 
  isOpen, 
  onClose, 
  title = 'Add New Member' 
}) => {
  const [inviteData, setInviteData] = useState<InviteData>({
    selectedRole: '',
    firstName: '',
    lastName: '',
    adminEmail: '',
    designation: ''
  });
  const [subRoles, setSubRoles] = useState<SubRole[]>([]);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [loadingSubRoles, setLoadingSubRoles] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchUserSubRoles();
    }
  }, [isOpen]);

  const fetchUserSubRoles = async () => {
    try {
      setLoadingSubRoles(true);
      const response = await rolesApi.getUserSubRoles();
      console.log('SubRoles API Response:', response);
      setSubRoles(response.subRoles || []);
      
      // Show debug info if available
      if (response.debug) {
        console.log('Debug Info:', response.debug);
      }
    } catch (error) {
      console.error('Error fetching user sub roles:', error);
      setSubRoles([]);
    } finally {
      setLoadingSubRoles(false);
    }
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteLoading(true);
    try {
      // Use the rolesApi or create a proper API service for invitations
      const response = await fetch('/api/auth/invite-advisory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(inviteData)
      });
      
      if (response.ok) {
        console.log('Invitation sent successfully');
        setInviteData({
          selectedRole: '',
          firstName: '',
          lastName: '',
          adminEmail: '',
          designation: ''
        });
        onClose();
      } else {
        throw new Error('Failed to send invitation');
      }
    } catch (error) {
      console.error('Error sending invitation:', error);
    } finally {
      setInviteLoading(false);
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
                  {role.name} ({role.permissionLevel})
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
              value={inviteData.adminEmail} 
              onChange={(e) => setInviteData({...inviteData, adminEmail: e.target.value})} 
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
              disabled={inviteLoading}
              style={{
                padding: '12px 24px',
                borderRadius: '8px',
                border: 'none',
                background: inviteLoading ? '#9ca3af' : '#1f4f8f',
                color: 'white',
                fontSize: '14px',
                fontWeight: '600',
                cursor: inviteLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {inviteLoading ? (
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
};

export default InviteMemberModal;