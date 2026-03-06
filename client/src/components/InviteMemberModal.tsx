import React, { useState, useEffect } from 'react';
import { apiService } from '../services/ApiService';

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

const InviteMemberModal: React.FC<InviteMemberModalProps> = ({ 
  isOpen, 
  onClose, 
  title = 'Invite Member' 
}) => {
  const [inviteData, setInviteData] = useState<InviteData>({
    selectedRole: '',
    firstName: '',
    lastName: '',
    adminEmail: '',
    designation: ''
  });
  const [childRoles, setChildRoles] = useState<any[]>([]);
  const [inviteLoading, setInviteLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchChildRoles();
    }
  }, [isOpen]);

  const fetchChildRoles = async () => {
    try {
      const roles = await apiService.get('/roles/child-roles');
      setChildRoles(Array.isArray(roles) ? roles : []);
    } catch (error) {
      console.error('Error fetching roles:', error);
      setChildRoles([]);
    }
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteLoading(true);
    try {
      await apiService.post('/auth/invite-advisory', inviteData);
      console.log('Invitation sent successfully');
      setInviteData({
        selectedRole: '',
        firstName: '',
        lastName: '',
        adminEmail: '',
        designation: ''
      });
      onClose();
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
          background: 'rgba(0,0,0,0.5)', 
          zIndex: 1000 
        }}
      ></div>
      <div style={{ 
        position: 'fixed', 
        top: '50%', 
        left: '50%', 
        transform: 'translate(-50%, -50%)', 
        background: 'white', 
        borderRadius: '12px', 
        padding: '24px', 
        width: '90%', 
        maxWidth: '500px', 
        maxHeight: '90vh', 
        overflowY: 'auto', 
        zIndex: 1001 
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', margin: 0 }}>{title}</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#6b7280'
            }}
          >
            X
          </button>
        </div>
        
        <form onSubmit={handleInviteSubmit}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Invite Super Admin</h3>
          <select 
            value={inviteData.selectedRole} 
            onChange={(e) => setInviteData({...inviteData, selectedRole: e.target.value})} 
            required 
            style={{ 
              width: '100%', 
              padding: '10px', 
              marginBottom: '12px', 
              border: '1px solid #e5e7eb', 
              borderRadius: '6px' 
            }}
          >
            <option value="">Select Role</option>
            {childRoles.map((role) => (
              <option key={role._id} value={role._id}>{role.name}</option>
            ))}
          </select>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '12px', 
            marginBottom: '12px' 
          }}>
            <input 
              type="text" 
              placeholder="First Name" 
              value={inviteData.firstName} 
              onChange={(e) => setInviteData({...inviteData, firstName: e.target.value})} 
              required 
              style={{ 
                padding: '10px', 
                border: '1px solid #e5e7eb', 
                borderRadius: '6px' 
              }} 
            />
            <input 
              type="text" 
              placeholder="Last Name" 
              value={inviteData.lastName} 
              onChange={(e) => setInviteData({...inviteData, lastName: e.target.value})} 
              required 
              style={{ 
                padding: '10px', 
                border: '1px solid #e5e7eb', 
                borderRadius: '6px' 
              }} 
            />
          </div>
          
          <input 
            type="email" 
            placeholder="Email Address" 
            value={inviteData.adminEmail} 
            onChange={(e) => setInviteData({...inviteData, adminEmail: e.target.value})} 
            required 
            style={{ 
              width: '100%', 
              padding: '10px', 
              marginBottom: '12px', 
              border: '1px solid #e5e7eb', 
              borderRadius: '6px' 
            }} 
          />
          
          <input 
            type="text" 
            placeholder="Designation" 
            value={inviteData.designation} 
            onChange={(e) => setInviteData({...inviteData, designation: e.target.value})} 
            required 
            style={{ 
              width: '100%', 
              padding: '10px', 
              marginBottom: '20px', 
              border: '1px solid #e5e7eb', 
              borderRadius: '6px' 
            }} 
          />
          
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '12px 20px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                background: 'white',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={inviteLoading} 
              style={{ 
                padding: '12px 20px', 
                background: inviteLoading ? '#9ca3af' : '#3b82f6', 
                color: 'white', 
                border: 'none', 
                borderRadius: '6px', 
                fontSize: '14px', 
                fontWeight: '600', 
                cursor: inviteLoading ? 'not-allowed' : 'pointer' 
              }}
            >
              {inviteLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Sending...
                </>
              ) : (
                'Send Invite'
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default InviteMemberModal;