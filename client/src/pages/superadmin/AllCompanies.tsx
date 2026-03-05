import React, { useState, useRef, useEffect } from 'react';
import './AllCompanies.css';
import { useCompanies, useRemoveLogo, useDeleteUser } from '../../services/hooks';
import { API_ENDPOINTS } from '../../config';

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

const AllCompanies: React.FC = () => {
  const { data: users = [], isLoading, error } = useCompanies();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  const removeLogoMutation = useRemoveLogo();
  const deleteUserMutation = useDeleteUser();

  // Ensure users is always an array
  const typedUsers = Array.isArray(users) ? users as User[] : [];

  // Debug logging
  React.useEffect(() => {
    console.log('useCompanies data:', users);
    console.log('typedUsers:', typedUsers);
    console.log('isLoading:', isLoading);
    console.log('error:', error);
  }, [users, typedUsers, isLoading, error]);

  React.useEffect(() => {
    if (typedUsers.length > 0 && !selectedUser) {
      setSelectedUser(typedUsers[0]);
    }
  }, [typedUsers, selectedUser]);



  const handleRemoveLogo = async () => {
    if (!selectedUser?._id) return;
    removeLogoMutation.mutate(selectedUser._id);
  };

  const handleDeleteCompany = () => {
    if (!selectedUser?._id) return;
    setConfirmOpen(true);
    setDropdownOpen(false);
  };

  const handleEditCompany = () => {
    if (!selectedUser?._id) return;
    alert(`Edit company functionality will be implemented. Company: ${selectedUser.companyProfile?.companyName || selectedUser.firstName + ' ' + selectedUser.lastName}`);
    setDropdownOpen(false);
  };

  const handleLoginAsCompany = () => {
    if (!selectedUser?._id) return;
    alert(`Login as company functionality will be implemented. Company: ${selectedUser.companyProfile?.companyName || selectedUser.firstName + ' ' + selectedUser.lastName}`);
    setDropdownOpen(false);
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
          {isLoading ? (
            <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>
          ) : error ? (
            <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>
              Error loading users: {error instanceof Error ? error.message : 'Unknown error'}
            </div>
          ) : typedUsers.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center' }}>No companies found</div>
          ) : (
            filteredUsers.map((user: User) => (
              <div
                key={user._id}
                className={`company-item ${selectedUser?._id === user._id ? 'active' : ''}`}
                onClick={() => setSelectedUser(user)}
              >
                <div className="company-name">{user.firstName} {user.lastName}</div>
                <div className="company-type">{user.designation}</div>
                <div className="company-desc">{user.email}</div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="companies-right-panel">
        <div style={{ padding: '24px', paddingBottom: '50px', maxWidth: '800px', margin: '0 auto', position: 'relative', overflow: 'visible' }}> 
          {selectedUser && (
            <>
              {/* Company Detail Header */}
              <div className="company-detail-header">
                <h2 className="company-detail-title">
                  Company Detail
                </h2>
                
                <div className="custom-dropdown" ref={dropdownRef}>
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
                      <button onClick={handleEditCompany} className="dropdown-option">
                        Edit Company
                      </button>
                      <button onClick={handleDeleteCompany} className="dropdown-option danger">
                        Delete Company
                      </button>
                      <button onClick={handleLoginAsCompany} className="dropdown-option">
                        Login as Company
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="detail-section" style={{position: 'relative'}}>
                <div className='logobox'>
                  {selectedUser.companyProfile?.logoId ? (
                    <>
                      <img src={`${API_ENDPOINTS.file}/${selectedUser.companyProfile.logoId}`} alt="Logo" style={{width: '100%', height: '100%', objectFit: 'contain'}} />
                      <button onClick={handleRemoveLogo} style={{position: 'absolute', top: '10px', right: '10px', background: 'red', color: 'white', border: 'none', borderRadius: '4px', padding: '5px 10px', cursor: 'pointer', fontSize: '12px'}}>Remove Logo</button>
                    </>
                  ) : 'No Logo'}
                </div>
                <div className='companybox'> 
                  <div className="detail-value">{selectedUser.companyProfile?.companyName || 'N/A'}</div>
                  <div className="detail-value">{selectedUser.roleId?.name || selectedUser.designation}</div>
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
                <div className="detail-label">Super Admin</div>
                <div className="admin-card">
                  <div className="admin-name">{selectedUser.firstName} {selectedUser.lastName}</div>
                  <div className="admin-info">{getFullAddress(selectedUser)}</div>
                  <div className="admin-contact">{selectedUser.email}, {selectedUser.phone}</div>
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
          zIndex: 10001
        }} onClick={() => setConfirmOpen(false)}>
          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '8px',
            minWidth: '400px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#1f2937', fontWeight: '600' }}>Confirm Delete</h3>
            <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: '#6b7280' }}>Are you sure you want to delete this company?</p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={() => setConfirmOpen(false)} style={{ padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '4px', background: 'white', cursor: 'pointer' }}>Cancel</button>
              <button onClick={confirmDelete} style={{ padding: '8px 16px', border: 'none', borderRadius: '4px', background: '#dc3545', color: 'white', cursor: 'pointer' }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllCompanies;
