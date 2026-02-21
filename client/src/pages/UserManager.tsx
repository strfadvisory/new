import React from 'react';

const UserManager: React.FC = () => {
  const users = [
    { id: 1, name: 'John Smith', email: 'john@example.com', role: 'Admin', status: 'Active', lastLogin: '2024-01-15' },
    { id: 2, name: 'Sarah Johnson', email: 'sarah@example.com', role: 'Manager', status: 'Active', lastLogin: '2024-01-14' },
    { id: 3, name: 'Mike Davis', email: 'mike@example.com', role: 'User', status: 'Inactive', lastLogin: '2024-01-10' },
    { id: 4, name: 'Lisa Wilson', email: 'lisa@example.com', role: 'User', status: 'Active', lastLogin: '2024-01-13' }
  ];

  return (
    <div className="p-4">
      <h1>User Manager</h1>
      <p>Manage user accounts, roles, and permissions.</p>
      
      <div className="mt-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2>User Directory</h2>
          <button className="btn btn-primary">Add New User</button>
        </div>
        
        <div className="row mb-3">
          <div className="col-md-6">
            <input type="text" className="form-control" placeholder="Search users..." />
          </div>
          <div className="col-md-3">
            <select className="form-select">
              <option>All Roles</option>
              <option>Admin</option>
              <option>Manager</option>
              <option>User</option>
            </select>
          </div>
          <div className="col-md-3">
            <select className="form-select">
              <option>All Status</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>
        </div>
        
        <div className="table-responsive">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Last Login</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td><span className="badge bg-info">{user.role}</span></td>
                  <td><span className={`badge ${user.status === 'Active' ? 'bg-success' : 'bg-secondary'}`}>{user.status}</span></td>
                  <td>{user.lastLogin}</td>
                  <td>
                    <button className="btn btn-sm btn-outline-primary me-2">Edit</button>
                    <button className="btn btn-sm btn-outline-danger">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManager;