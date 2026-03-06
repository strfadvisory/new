import React, { useState } from 'react';
import './superadmin/AllCompanies.css';
import { useAuthUsers, useRemoveLogo, useDeleteUser } from '../hooks/queries/useAuth';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  designation: string;
  roleId?: {
    _id: string;
    name: string;
  };
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
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // React Query hooks
  const { data: users = [], isLoading: loading } = useAuthUsers();
  const removeLogoMutation = useRemoveLogo();
  const deleteUserMutation = useDeleteUser();

  // Set first user as selected when data loads
  React.useEffect(() => {
    if (users.length > 0 && !selectedUser) {
      setSelectedUser(users[0]);
    }
  }, [users, selectedUser]);

  const handleRemoveLogo = async () => {
    if (!selectedUser?._id) return;
    try {
      await removeLogoMutation.mutateAsync(selectedUser._id);
    } catch (error) {
      console.error('Error removing logo:', error);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser?._id) return;
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedUser?._id) return;
    try {
      await deleteUserMutation.mutateAsync(selectedUser._id);
      const updatedUsers = users.filter((u: User) => u._id !== selectedUser._id);
      setSelectedUser(updatedUsers.length > 0 ? updatedUsers[0] : null);
    } catch (error) {
      console.error('Error deleting user:', error);
    } finally {
      setConfirmOpen(false);
    }
  };

  const getFullAddress = (user: User) => {
    const addr = user.address;
    if (!addr) return 'No address provided';
    return `${addr.address1 || ''} ${addr.address2 || ''}, ${addr.city || ''}, ${addr.state || ''} ${addr.zipCode || ''}`.trim();
  };

  const filteredUsers = users.filter((user: User) => 
    `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="companies-container">
      <div className="companies-left-panel">
        <div className="companies-header">
          <div className="header-top">
            <h2 className="results-title">{filteredUsers.length} Results founded</h2>
            <a href="#" className="add-new-link">+ Add New</a>
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
          {loading ? (
            <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>
          ) : (
            filteredUsers.map((user: User) => (
              <div
                key={user._id}
                className={`company-item ${selectedUser?._id === user._id ? 'active' : ''}`}
                onClick={() => setSelectedUser(user)}
              >
                <div className="company-logo">
                  {user.companyProfile?.logoId ? (
                    <img src={`/api/auth/file/${user.companyProfile.logoId}`} alt="User Logo" />
                  ) : (
                    <i className="fas fa-user" style={{ color: '#64748b', fontSize: '20px' }}></i>
                  )}
                </div>
                <div className="company-info">
                  <div className="company-name">{user.firstName} {user.lastName}</div>
                  <div className="company-level">{user.designation}</div>
                  <div className="company-address">{user.email}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="companies-right-panel">
        <div className="fluid-content" style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 0' }}>
          {selectedUser ? (
            <>
              <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div className="role-info">
                  <h1 style={{ fontSize: '32px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>User Management - {selectedUser.firstName} {selectedUser.lastName}</h1>
                  <div className="role-type-badge">
                    <span className="badge badge-user">
                      {selectedUser.designation}
                    </span>
                  </div>
                </div>
                <div className="role-actions">
                  <div className="custom-dropdown">
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="dropdown-btn"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="1"/>
                        <circle cx="12" cy="5" r="1"/>
                        <circle cx="12" cy="19" r="1"/>
                      </svg>
                    </button>
                    {dropdownOpen && (
                      <div className="dropdown-content">
                        <button onClick={() => { handleDeleteUser(); setDropdownOpen(false); }} className="dropdown-option danger">
                          Remove User
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '32px' }}>
                {selectedUser.companyProfile?.description || 'User profile and company information'}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', padding: '24px', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
                  <div style={{ width: '80px', height: '80px', background: '#f3f4f6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                    {selectedUser.companyProfile?.logoId ? (
                      <>
                        <img src={`/api/auth/file/${selectedUser.companyProfile.logoId}`} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '8px' }} />
                        <button onClick={handleRemoveLogo} style={{ position: 'absolute', top: '-8px', right: '-8px', width: '24px', height: '24px', borderRadius: '50%', background: '#ef4444', color: 'white', border: 'none', cursor: 'pointer', fontSize: '12px' }}>×</button>
                      </>
                    ) : (
                      <i className="fas fa-building" style={{ fontSize: '32px', color: '#64748b' }}></i>
                    )}
                  </div>
                  <div style={{ flex: 1, marginLeft: '20px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>{selectedUser.companyProfile?.companyName || 'Company Name'}</h3>
                    <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>{selectedUser.roleId?.name || selectedUser.designation}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', padding: '24px', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
                  <div style={{ width: '48px', height: '48px', background: '#f3f4f6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className="fas fa-map-marker-alt" style={{ fontSize: '20px', color: '#1f2937' }}></i>
                  </div>
                  <div style={{ flex: 1, marginLeft: '20px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>Address</h3>
                    <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>{getFullAddress(selectedUser)}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', padding: '24px', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
                  <div style={{ width: '48px', height: '48px', background: '#f3f4f6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className="fas fa-user" style={{ fontSize: '20px', color: '#1f2937' }}></i>
                  </div>
                  <div style={{ flex: 1, marginLeft: '20px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>Contact Information</h3>
                    <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>{selectedUser.email} • {selectedUser.phone}</p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="no-selection">
              <h3>Select a user to view details</h3>
              <p>Choose a user from the sidebar to view their profile and company information.</p>
            </div>
          )}
        </div>
      </div>
      {confirmOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }} onClick={() => setConfirmOpen(false)}>
          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '8px',
            minWidth: '400px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#1f2937', fontWeight: '600' }}>Confirm Delete</h3>
            <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: '#6b7280' }}>Are you sure you want to delete this user?</p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={() => setConfirmOpen(false)} style={{
                padding: '8px 16px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                background: 'white',
                cursor: 'pointer',
                fontSize: '14px'
              }}>Cancel</button>
              <button onClick={confirmDelete} style={{
                padding: '8px 16px',
                border: '1px solid #ef4444',
                borderRadius: '6px',
                background: 'white',
                color: '#ef4444',
                cursor: 'pointer',
                fontSize: '14px'
              }}>Remove this</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;