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
  };
}

const AllCompanies: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

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
          <input
            type="text"
            placeholder="Search by name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="companies-search"
          />
          <button className="add-new-btn">+ Add New</button>
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
        {selectedUser && (
          <>
            <div className="detail-section">
              <div className="detail-label">Company name</div>
              <div className="detail-value">{selectedUser.companyProfile?.companyName || 'N/A'}</div>
            </div>
            <div className="detail-section">
              <div className="detail-label">Tag line</div>
              <div className="detail-value">{selectedUser.designation}</div>
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
                <div className="detail-label">Advisor</div>
                <div className="section-actions">
                  <input type="text" placeholder="Search by name" className="inline-search" />
                  <select className="inline-select"><option>All Members</option></select>
                  <select className="inline-select"><option>Sort by</option></select>
                </div>
              </div>
            </div>

            <div className="detail-section">
              <div className="section-header">
                <div className="detail-label">3D Associations</div>
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
  );
};

export default AllCompanies;
