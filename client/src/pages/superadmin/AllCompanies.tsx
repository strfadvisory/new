import React, { useState, useEffect } from 'react';
import './AllCompanies.css';
import { API_BASE_URL } from '../../config';

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
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/auth/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
        if (data.length > 0) setSelectedUser(data[0]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveLogo = async () => {
    if (!selectedUser?._id) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/auth/remove-logo/${selectedUser._id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        fetchUsers();
      }
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
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/auth/user/${selectedUser._id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const updatedUsers = users.filter(u => u._id !== selectedUser._id);
        setUsers(updatedUsers);
        setSelectedUser(updatedUsers.length > 0 ? updatedUsers[0] : null);
      }
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

  const filteredUsers = users.filter(user => 
    `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="companies-container">
      <div className="companies-left-panel">
        <div className="companies-header">
        
          <button className="add-new-btn">+ Add New</button>
            <input
            type="text"
            placeholder="Search by name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="companies-search"
          />
        </div>
        <div className="results-count">{filteredUsers.length} Results founded</div>
        <div className="companies-list">
          {loading ? (
            <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>
          ) : (
            filteredUsers.map((user) => (
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
        <div  style={{ padding: '24px', paddingBottom: '50px', maxWidth: '800px', margin: '0 auto' }}> 
  {selectedUser && (
          <>
            <div className="detail-section" style={{position: 'relative'}}>
            <div className='logobox'>
              {selectedUser.companyProfile?.logoId ? (
                <>
                  <img src={`${API_BASE_URL}/api/auth/file/${selectedUser.companyProfile.logoId}`} alt="Logo" style={{width: '100%', height: '100%', objectFit: 'contain'}} />
                  <button onClick={handleRemoveLogo} style={{position: 'absolute', top: '10px', right: '10px', background: 'red', color: 'white', border: 'none', borderRadius: '4px', padding: '5px 10px', cursor: 'pointer', fontSize: '12px'}}>Remove Logo</button>
                </>
              ) : 'No Logo'}
              </div>
               <div className='companybox'> 
                <div className="detail-value">{selectedUser.companyProfile?.companyName || 'N/A'}</div>
                <div className="detail-value">{selectedUser.roleId?.name || selectedUser.designation}</div>
                </div>
                <button onClick={handleDeleteUser} style={{position: 'absolute', top: '10px', right: '10px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', padding: '8px 16px', cursor: 'pointer', fontSize: '14px'}}>Remove User</button>
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

export default AllCompanies;
