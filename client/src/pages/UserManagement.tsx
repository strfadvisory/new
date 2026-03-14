import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'react-toastify';
import './superadmin/AllCompanies.css';
import { useAuthUsers, useRemoveLogo, useDeleteUser } from '../hooks/queries/useAuth';
import { authApi } from '../api/services/authApi';
import { API_ENDPOINTS } from '../api/config';
import InviteMemberModal from '../components/InviteMemberModal';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  designation: string;
  status?: string;
  isVerified?: boolean;
  createdAt?: string;
  roleId?: { _id: string; name: string };
  address?: {
    address1?: string;
    address2?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
  companyProfile?: {
    companyName?: string;
    description?: string;
    address1?: string;
    city?: string;
    state?: string;
    logoId?: string;
  };
}

const UserManagement: React.FC = () => {
  const { data: users = [], isLoading, error } = useAuthUsers();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const removeLogoMutation = useRemoveLogo();
  const deleteUserMutation = useDeleteUser();

  const typedUsers = Array.isArray(users) ? users as User[] : [];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  useEffect(() => {
    if (typedUsers.length > 0 && !selectedUser) {
      setSelectedUser(typedUsers[0]);
    }
  }, [typedUsers, selectedUser]);

  const handleRemoveLogo = () => {
    if (!selectedUser?._id) return;
    removeLogoMutation.mutate(selectedUser._id);
  };

  const handleDeleteUser = () => {
    if (!selectedUser?._id) return;
    setConfirmOpen(true);
    setDropdownOpen(false);
  };

  const handleResendInvitation = async () => {
    if (!selectedUser?._id) return;
    setDropdownOpen(false);
    setResendLoading(true);
    try {
      const res = await authApi.resendMemberInvitation(selectedUser._id);
      console.log('\n========== INVITATION RESENT ==========');
      console.log('To:', selectedUser.email);
      console.log('Verification URL:', res.verificationLink);
      console.log('=======================================\n');
      toast.success('Invitation resent successfully!');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to resend invitation');
    } finally {
      setResendLoading(false);
    }
  };

  const confirmDelete = () => {
    if (!selectedUser?._id) return;
    deleteUserMutation.mutate(selectedUser._id, {
      onSuccess: () => {
        const updatedUsers = typedUsers.filter((u: User) => u._id !== selectedUser._id);
        setSelectedUser(updatedUsers.length > 0 ? updatedUsers[0] : null);
        setConfirmOpen(false);
      }
    });
  };

  const getFullAddress = (user: User) => {
    const addr = user.address;
    if (!addr) return 'No address provided';
    return `${addr.address1 || ''} ${addr.address2 || ''}, ${addr.city || ''}, ${addr.state || ''} ${addr.zipCode || ''}`.trim();
  };

  const filteredUsers = typedUsers.filter((user: User) =>
    `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="companies-container">
      {/* Left Panel */}
      <div className="companies-left-panel">
        <div className="companies-header">
          <div className="header-top">
            <h2 className="results-title">{filteredUsers.length} Results founded</h2>
            <a href="#" className="add-new-link" onClick={(e) => { e.preventDefault(); setInviteModalOpen(true); }}>+ Add New</a>
          </div>
          <input
            type="text"
            placeholder="Search by name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="companies-search"
          />
        </div>
        <div className="companies-list">
          {isLoading ? (
            <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>
          ) : error ? (
            <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>
              Error loading users: {error instanceof Error ? error.message : 'Unknown error'}
            </div>
          ) : typedUsers.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center' }}>No users found</div>
          ) : (
            filteredUsers.map((user: User) => (
              <div
                key={user._id}
                className={`company-item ${selectedUser?._id === user._id ? 'active' : ''}`}
                onClick={() => setSelectedUser(user)}
              >
                <div className="company-logo">
                  {user.companyProfile?.logoId ? (
                    <img
                      src={`${API_ENDPOINTS.AUTH.FILE}/${user.companyProfile.logoId}`}
                      alt={`${user.firstName} ${user.lastName}`}
                      onError={(e) => { e.currentTarget.src = '/logo.png'; e.currentTarget.onerror = null; }}
                    />
                  ) : (
                    <i className="fas fa-user" style={{ color: '#64748b', fontSize: '20px' }}></i>
                  )}
                </div>
                <div className="company-info">
                  <div className="company-name">{user.firstName} {user.lastName}</div>
                  <div className="company-address">{user.roleId?.name || user.designation}</div>
                  <div className="um-badge-row">
                    <span className={`um-badge um-status-${(user.status || 'active').toLowerCase()}`}>
                      {user.status || 'Active'}
                    </span>
                    <span className={`um-badge ${user.isVerified ? 'um-verified' : 'um-unverified'}`}>
                      {user.isVerified ? '✓ Verified' : '✗ Unverified'}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Panel */}
      <div className="companies-right-panel">
        <div style={{ padding: '24px', paddingBottom: '50px', maxWidth: '800px', margin: '0 auto', position: 'relative', overflow: 'visible' }}>
          {selectedUser ? (
            <>
              <div className="company-detail-header">
                <h2 className="company-detail-title">User Detail</h2>
                <div className="custom-dropdown" ref={dropdownRef}>
                  <button onClick={() => setDropdownOpen(!dropdownOpen)} className="dropdown-btn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/>
                    </svg>
                  </button>
                  {dropdownOpen && (
                    <div className="dropdown-content">
                      <button onClick={handleDeleteUser} className="dropdown-option danger">Remove User</button>
                      {selectedUser.status?.toLowerCase() === 'pending' && (
                        <button
                          onClick={handleResendInvitation}
                          disabled={resendLoading}
                          className="dropdown-option"
                        >
                          {resendLoading ? 'Sending...' : 'Resend Invitation'}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="detail-section" style={{ position: 'relative', display: 'flex', gap: '24px', alignItems: 'center' }}>
                <div className="logobox">
                  {selectedUser.companyProfile?.logoId ? (
                    <img
                      src={`${API_ENDPOINTS.AUTH.FILE}/${selectedUser.companyProfile.logoId}`}
                      alt="Logo"
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      onError={(e) => { e.currentTarget.src = '/logo.png'; e.currentTarget.onerror = null; }}
                    />
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#6b7280' }}>
                      <i className="fas fa-user" style={{ fontSize: '24px', color: '#d1d5db' }}></i>
                    </div>
                  )}
                </div>
                <div className="companybox">
                  <div className="detail-value">{selectedUser.firstName} {selectedUser.lastName}</div>
                  <div className="detail-value">{selectedUser.roleId?.name || selectedUser.designation}</div>
                </div>
              </div>

              <div className="detail-section">
                <div className="detail-label">Account Status</div>
                <div className="um-status-row">
                  <div className="um-status-card">
                    <span className="um-status-card-label">Status</span>
                    <span className={`um-badge um-status-${(selectedUser.status || 'active').toLowerCase()}`} style={{ fontSize: '13px', padding: '4px 12px' }}>
                      {selectedUser.status || 'Active'}
                    </span>
                  </div>
                  <div className="um-status-card">
                    <span className="um-status-card-label">Email Verification</span>
                    <span className={`um-badge ${selectedUser.isVerified ? 'um-verified' : 'um-unverified'}`} style={{ fontSize: '13px', padding: '4px 12px' }}>
                      {selectedUser.isVerified ? '✓ Verified' : '✗ Not Verified'}
                    </span>
                  </div>
                  {selectedUser.createdAt && (
                    <div className="um-status-card">
                      <span className="um-status-card-label">Member Since</span>
                      <span className="um-status-card-value">{new Date(selectedUser.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="detail-section">
                <div className="detail-label">Description</div>
                <div className="detail-value">{selectedUser.companyProfile?.description || 'No description available'}</div>
              </div>

              <div className="detail-section">
                <div className="detail-label">Address</div>
                <div className="detail-value">{getFullAddress(selectedUser)}</div>
              </div>

              <div className="detail-section">
                <div className="detail-label">Contact Information</div>
                <div className="admin-card">
                  <div className="admin-name">{selectedUser.firstName} {selectedUser.lastName}</div>
                  <div className="admin-info">{getFullAddress(selectedUser)}</div>
                  <div className="admin-contact">{selectedUser.email}{selectedUser.phone ? `, ${selectedUser.phone}` : ''}</div>
                </div>
              </div>

              <div className="detail-section">
                <div className="section-header">
                  <div className="detail-label">Members</div>
                  <div className="section-actions">
                    <input type="text" placeholder="Search by name" className="inline-search" />
                    <select className="inline-select"><option>All Members</option></select>
                    <select className="inline-select"><option>Sort by</option></select>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <div className="section-header">
                  <div className="detail-label">Association</div>
                  <div className="section-actions">
                    <input type="text" placeholder="Search by name" className="inline-search" />
                    <select className="inline-select"><option>All Property Manager</option></select>
                    <select className="inline-select"><option>Sort by</option></select>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="no-selection">
              <div className="no-selection-content">
                <div className="no-selection-icon">
                  <i className="fas fa-user"></i>
                </div>
                <h3 className="no-selection-title">Select a user to view details</h3>
                <p className="no-selection-description">Choose a user from the sidebar to view their profile and information.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirm Delete Modal */}
      {confirmOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10001 }}
          onClick={() => setConfirmOpen(false)}>
          <div style={{ background: 'white', padding: '24px', borderRadius: '8px', minWidth: '400px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
            onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#1f2937', fontWeight: '600' }}>Confirm Delete</h3>
            <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: '#6b7280' }}>Are you sure you want to delete this user?</p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={() => setConfirmOpen(false)} style={{ padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '4px', background: 'white', cursor: 'pointer' }}>Cancel</button>
              <button onClick={confirmDelete} style={{ padding: '8px 16px', border: 'none', borderRadius: '4px', background: '#dc3545', color: 'white', cursor: 'pointer' }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      <InviteMemberModal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        title="Add New Member"
      />
    </div>
  );
};

export default UserManagement;
