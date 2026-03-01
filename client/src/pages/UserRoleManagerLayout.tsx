import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import RoleManager from './superadmin/RoleManager';

const UserRoleManagerLayout: React.FC = () => {
  const [userRole, setUserRole] = useState<any>(null);
  const [userPermissions, setUserPermissions] = useState<any>({});
  const [userCreatedRoles, setUserCreatedRoles] = useState<any[]>([]);
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [isSlidebarOpen, setIsSlidebarOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    _id: '',
    name: '',
    description: '',
    icon: '',
    status: true,
    permissions: {} as Record<string, boolean>,
    nextSteps: [] as any[],
    video: [] as any[],
    userType: '',
    type: '2',
    parentRoleId: '',
    secondaryRoleId: ''
  });
  const [availableRoles, setAvailableRoles] = useState<any[]>([]);
  const [level2Roles, setLevel2Roles] = useState<any[]>([]);
  const [level3Roles, setLevel3Roles] = useState<any[]>([]);
  const [iconPreview, setIconPreview] = useState<string>('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchUserRole();
    fetchUserPermissions();
    fetchUserCreatedRoles();
    fetchLevel2Roles();
  }, []);

  const fetchUserPermissions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/roles/user-permissions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUserPermissions(data.permissions || {});
      }
    } catch (error) {
      console.error('Error fetching user permissions:', error);
    }
  };

  const fetchUserCreatedRoles = async () => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await fetch(`${API_BASE_URL}/api/roles`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const allRoles = await response.json();
        const userRoles = allRoles.filter((role: any) => role.createdBy === user._id);
        setUserCreatedRoles(userRoles);
        if (userRoles.length > 0 && !selectedRole) {
          setSelectedRole(userRoles[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching user created roles:', error);
    }
  };

  const fetchUserRole = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/roles/user-own-role`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const roleData = await response.json();
        setUserRole(roleData);
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
  };

  const fetchLevel2Roles = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/roles/type-2-roles`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const roles = await response.json();
        console.log('Level 2 roles:', roles);
        setLevel2Roles(roles);
      }
    } catch (error) {
      console.error('Error fetching level 2 roles:', error);
    }
  };

  const fetchLevel3Roles = async (parentId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/roles/type-3-roles/${parentId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const roles = await response.json();
        console.log('Level 3 roles for parent', parentId, ':', roles);
        setLevel3Roles(roles);
      }
    } catch (error) {
      console.error('Error fetching level 3 roles:', error);
    }
  };

  const handleEditRole = (role: any) => {
    setFormData({
      _id: role._id,
      name: role.name,
      description: role.description,
      icon: role.icon || '',
      status: role.status,
      permissions: role.permissions || {},
      nextSteps: role.nextSteps || [
        { title: 'Invite Advisory', description: 'Set up a new organizational entity to manage members and modules.', icon: 'user', completed: false },
        { title: 'Invite a Association', description: 'Set up a new organizational entity to manage members and modules.', icon: 'building', completed: false },
        { title: 'Upload Reserve Study Data', description: 'Set up a new organizational entity to manage members and modules.', icon: 'file', completed: false },
        { title: 'Schedule meeting with Expert', description: 'Set up a new organizational entity to manage members and modules.', icon: 'calendar', completed: false }
      ],
      video: role.video || [],
      userType: role.userType?._id || role.userType || '',
      type: role.type || '2',
      parentRoleId: '',
      secondaryRoleId: ''
    });
    setIconPreview(role.icon || '');
    setEditMode(true);
    setIsSlidebarOpen(true);
  };

  const handleDeleteRole = async (roleId: string) => {
    if (userPermissions['ROLE_MANAGEMENT.DELETE_ROLE']) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/roles/${roleId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          fetchUserCreatedRoles();
          if (selectedRole?._id === roleId) {
            setSelectedRole(null);
          }
        }
      } catch (error) {
        console.error('Error deleting role:', error);
      }
    }
  };

  const handleAddNew = async () => {
    if (userPermissions['ROLE_MANAGEMENT.CREATE_ROLE']) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/roles/default-permissions`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const defaultPermissions = await response.json();
        setFormData({ 
          _id: '', 
          name: '', 
          description: '', 
          icon: '', 
          status: true, 
          permissions: defaultPermissions,
          nextSteps: [
            { title: 'Invite Advisory', description: 'Set up a new organizational entity to manage members and modules.', icon: 'user', completed: false },
            { title: 'Invite a Association', description: 'Set up a new organizational entity to manage members and modules.', icon: 'building', completed: false },
            { title: 'Upload Reserve Study Data', description: 'Set up a new organizational entity to manage members and modules.', icon: 'file', completed: false },
            { title: 'Schedule meeting with Expert', description: 'Set up a new organizational entity to manage members and modules.', icon: 'calendar', completed: false }
          ],
          video: [],
          userType: '',
          type: '2',
          parentRoleId: '',
          secondaryRoleId: ''
        });
      } catch (error) {
        console.error('Error fetching default permissions:', error);
        setFormData({ 
          _id: '', 
          name: '', 
          description: '', 
          icon: '', 
          status: true, 
          permissions: {},
          nextSteps: [
            { title: 'Invite Advisory', description: 'Set up a new organizational entity to manage members and modules.', icon: 'user', completed: false },
            { title: 'Invite a Association', description: 'Set up a new organizational entity to manage members and modules.', icon: 'building', completed: false },
            { title: 'Upload Reserve Study Data', description: 'Set up a new organizational entity to manage members and modules.', icon: 'file', completed: false },
            { title: 'Schedule meeting with Expert', description: 'Set up a new organizational entity to manage members and modules.', icon: 'calendar', completed: false }
          ],
          video: [],
          userType: '',
          type: '2',
          parentRoleId: '',
          secondaryRoleId: ''
        });
      }
      setIconPreview('');
      setEditMode(false);
      setIsSlidebarOpen(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      let url = `${API_BASE_URL}/api/roles`;
      let method = 'POST';
      
      if (editMode && formData._id) {
        url = `${API_BASE_URL}/api/roles/${formData._id}`;
        method = 'PUT';
      }

      const submitData = {
        ...formData,
        parentRoleId: formData.secondaryRoleId || formData.parentRoleId || null,
        userType: formData.userType || null
      };
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(submitData)
      });
      
      if (response.ok) {
        setIsSlidebarOpen(false);
        setEditMode(false);
        setFormData({ _id: '', name: '', description: '', icon: '', status: true, permissions: {}, nextSteps: [], video: [], userType: '', type: '2', parentRoleId: '', secondaryRoleId: '' });
        setIconPreview('');
        setLevel3Roles([]);
        fetchUserCreatedRoles();
      }
    } catch (error) {
      console.error('Error saving role:', error);
    }
  };

  const canCreateRole = userPermissions['ROLE_MANAGEMENT.CREATE_ROLE'] || false;

  return (
    <div className="main-content">
      <div className="companies-left-panel">
        <div className="companies-header">
          <button 
            className="add-new-btn" 
            onClick={handleAddNew} 
            disabled={!canCreateRole}
            style={{ 
              opacity: canCreateRole ? 1 : 0.5, 
              cursor: canCreateRole ? 'pointer' : 'not-allowed' 
            }}
          >
            + Add New
          </button>
          <input type="text" placeholder="Search by name" className="companies-search" disabled style={{ opacity: 0.5 }} />
        </div>
        <div className="results-count">
          {userCreatedRoles.length} Results founded
        </div>
        
        <div className="companies-list">
          {userCreatedRoles.map((role) => (
            <div 
              key={role._id}
              className={`company-item ${selectedRole?._id === role._id ? 'active' : ''}`}
              onClick={() => setSelectedRole(role)}
              style={{ cursor: 'pointer' }}
            >
              <div className="company-name">{role.name}</div>
              <div className="company-hierarchy" style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                Created by me
              </div>
              <div className="company-desc">{role.description}</div>
              <div className="company-status" style={{ 
                fontSize: '12px', 
                color: role.status ? '#10b981' : '#ef4444',
                marginTop: '8px',
                fontWeight: '500'
              }}>
                {role.status ? 'Active' : 'Inactive'}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="companies-right-panel" style={{ flex: 1 }}>
        <RoleManager 
          selectedRole={selectedRole} 
          onEdit={handleEditRole} 
          onDelete={handleDeleteRole} 
          onRoleUpdate={fetchUserCreatedRoles}
          isUserContext={true}
        />
      </div>

      {/* Right Slidebar */}
      {isSlidebarOpen && (
        <>
          <div className="slidebar-overlay" onClick={() => setIsSlidebarOpen(false)}></div>
          <div className="right-slidebar">
            <div className="slidebar-header">
              <h3>{editMode ? 'Edit Role' : 'Add New Role'}</h3>
              <button className="close-btn" onClick={() => setIsSlidebarOpen(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="slidebar-content">
                <div className="form-group">
                  <label style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px', display: 'block' }}>
                    Select   Role Type
                  </label>
                  <select 
                    className="form-input"
                    value={formData.parentRoleId}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData({ ...formData, parentRoleId: value, secondaryRoleId: '', type: '2' });
                      setLevel3Roles([]);
                      if (value) fetchLevel3Roles(value);
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <option value="">Select a type </option>
                    {level2Roles.map((role) => (
                      <option key={role._id} value={role._id}>{role.name}</option>
                    ))}
                  </select>
                </div>

                {formData.parentRoleId && level3Roles.length > 0 && (
                  <div className="form-group">
                    <label style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px', display: 'block' }}>
                      Select Type 3 Role (Optional)
                    </label>
                    <select 
                      className="form-input"
                      value={formData.secondaryRoleId}
                      onChange={(e) => {
                        const value = e.target.value;
                        setFormData({ ...formData, secondaryRoleId: value, type: value ? '3' : '2' });
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      <option value="">Select a type 3 role</option>
                      {level3Roles.map((role) => (
                        <option key={role._id} value={role._id}>{role.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="form-group">
                  <input 
                    type="text" 
                    placeholder="Enter Role Name*"
                    className="form-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px', display: 'block' }}>
                    Describe Details so user can identify use of this role *
                  </label>
                  <textarea 
                    className="form-textarea"
                    rows={4}
                    placeholder="Enter description..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  ></textarea>
                </div>

                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ fontSize: '14px', color: '#1f2937' }}>Status</label>
                    <label className="toggle-switch">
                      <input 
                        type="checkbox" 
                        checked={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.checked })}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>

                <button type="submit" className="submit-btn">
                  {editMode ? 'Update Role' : 'Save Role'}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default UserRoleManagerLayout;