import React from 'react';

interface ProfileProps {
  user: any;
}

const Profile: React.FC<ProfileProps> = ({ user }) => {
  return (
    <div className="p-4">
      <h1>My Profile</h1>
      <p>Manage your personal information and account settings.</p>
      
      <div className="row mt-4">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <h3>Personal Information</h3>
            </div>
            <div className="card-body">
              <form>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">First Name</label>
                    <input type="text" className="form-control" defaultValue={user?.firstName || 'John'} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Last Name</label>
                    <input type="text" className="form-control" defaultValue={user?.lastName || 'Doe'} />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Email Address</label>
                  <input type="email" className="form-control" defaultValue={user?.email || 'john.doe@example.com'} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Phone Number</label>
                  <input type="tel" className="form-control" defaultValue="+1 (555) 123-4567" />
                </div>
                <div className="mb-3">
                  <label className="form-label">Company Role</label>
                  <input type="text" className="form-control" defaultValue={user?.role || 'Manager'} readOnly />
                </div>
                <button type="submit" className="btn btn-primary">Update Profile</button>
              </form>
            </div>
          </div>
        </div>
        
        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <h3>Account Settings</h3>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label">Change Password</label>
                <button className="btn btn-outline-secondary w-100">Update Password</button>
              </div>
              <div className="mb-3">
                <label className="form-label">Two-Factor Authentication</label>
                <div className="form-check form-switch">
                  <input className="form-check-input" type="checkbox" />
                  <label className="form-check-label">Enable 2FA</label>
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label">Email Notifications</label>
                <div className="form-check form-switch">
                  <input className="form-check-input" type="checkbox" defaultChecked />
                  <label className="form-check-label">Receive notifications</label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;