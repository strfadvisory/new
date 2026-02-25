import React, { useState, useEffect } from 'react';
import '../pages/superadmin/AllCompanies.css';
import { API_BASE_URL } from '../config';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  designation: string;
  companyType: string;
  isVerified?: boolean;
  address?: {
    address1?: string;
    address2?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
}

const Users: React.FC = () => {
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
      const response = await fetch(`${API_BASE_URL}/api/auth/org-users`, {
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
            <div className="detail-section">
              <div className="detail-label">Full Name</div>
              <div className="detail-value">
                {selectedUser.firstName} {selectedUser.lastName}
                <i className="fas fa-check" style={{ color: selectedUser.isVerified ? '#10b981' : '#9ca3af', marginLeft: '8px', fontSize: '14px' }}></i>
              </div>
            </div>
            <div className="detail-section">
              <div className="detail-label">Email</div>
              <div className="detail-value">{selectedUser.email}</div>
            </div>
            <div className="detail-section">
              <div className="detail-label">Phone</div>
              <div className="detail-value">{selectedUser.phone || 'N/A'}</div>
            </div>
            <div className="detail-section">
              <div className="detail-label">Designation</div>
              <div className="detail-value">{selectedUser.designation}</div>
            </div>
            <div className="detail-section">
              <div className="detail-label">Company Type</div>
              <div className="detail-value">{selectedUser.companyType}</div>
            </div>
            <div className="detail-section">
              <div className="detail-label">Address</div>
              <div className="detail-value">{getFullAddress(selectedUser)}</div>
            </div>
          </>
        )}
</div>

      </div>
    </div>
  );
};

export default Users;
