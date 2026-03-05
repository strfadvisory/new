import React, { useState } from 'react';
import { useAdminUsers } from '../services/hooks';

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  company: string;
  role: string;
  status: string;
  createdAt: string;
}

const Companies: React.FC = () => {
  const { data: adminUsers = [], isLoading } = useAdminUsers();

  if (isLoading) {
    return <div className="text-center p-4">Loading...</div>;
  }

  return (
    <div className="container-fluid p-4">
      <h2 className="mb-4">Company Administrators</h2>
      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Company</th>
              <th>Role</th>
              <th>Status</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {adminUsers.map((user: AdminUser) => (
              <tr key={user._id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.company}</td>
                <td>{user.role}</td>
                <td>
                  <span className={`badge ${user.status === 'Active' ? 'bg-success' : 'bg-danger'}`}>
                    {user.status}
                  </span>
                </td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {adminUsers.length === 0 && (
        <div className="text-center p-4">
          <p>No admin users found.</p>
        </div>
      )}
    </div>
  );
};

export default Companies;
