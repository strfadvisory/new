import React, { useState } from 'react';

const AllUsers: React.FC = () => {
  const [users] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com', company: 'Company A', role: 'Admin', status: 'Active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', company: 'Company B', role: 'User', status: 'Active' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', company: 'Company C', role: 'Manager', status: 'Inactive' },
  ]);

  return (
    <div style={{ padding: '20px' }}>
      <h2>All Users</h2>
      <table style={{ width: '100%', marginTop: '20px', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f5f5f5' }}>
            <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Name</th>
            <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Email</th>
            <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Company</th>
            <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Role</th>
            <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Status</th>
            <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td style={{ padding: '12px', border: '1px solid #ddd' }}>{user.name}</td>
              <td style={{ padding: '12px', border: '1px solid #ddd' }}>{user.email}</td>
              <td style={{ padding: '12px', border: '1px solid #ddd' }}>{user.company}</td>
              <td style={{ padding: '12px', border: '1px solid #ddd' }}>{user.role}</td>
              <td style={{ padding: '12px', border: '1px solid #ddd' }}>{user.status}</td>
              <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                <button style={{ marginRight: '10px' }}>Edit</button>
                <button>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AllUsers;
