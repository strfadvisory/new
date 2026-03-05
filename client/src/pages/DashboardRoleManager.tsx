import React, { useState } from 'react';
import { API_BASE_URL } from '../config';
import RoleManager from './superadmin/RoleManager';
import '../Dashboard.css';
import './superadmin/AllCompanies.css';

interface DashboardRoleManagerProps {
  user: any;
  onLogout: () => void;
}

const DashboardRoleManager: React.FC<DashboardRoleManagerProps> = ({ user, onLogout }) => {
  const [isSlidebarOpen, setIsSlidebarOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<string | null>(null);
  const [roles, setRoles] = useState<any[]>([]);
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [iconPreview, setIconPreview] = useState<string>('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    _id: '',
    name: '',
    icon: '',
    status: true,
    permissions: [] as string[],
    description: ''
  });

  React.useEffect(() => {
    fetchRoles();
  }, []);

  const refreshSelectedRole = async () => {
    if (selectedRole?._id) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/roles/${selectedRole._id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const freshRole = await response.json();
          setSelectedRole({ ...freshRole, hierarchy: selectedRole.hierarchy });
        }
      } catch (error) {
        console.error('Error refreshing selected role:', error);
      }
    }
  };

  const handleRoleUpdate = () => {
    fetchRoles();
    refreshSelectedRole();
  };

  const fetchRoles = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/roles`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setRoles(data);
        if (data.length > 0) {
          const firstRole = data[0];
          const isValidId = firstRole._id && firstRole._id.match(/^[0-9a-fA-F]{24}$/);
          if (isValidId) {
            const roleResponse = await fetch(`${API_BASE_URL}/api/roles/${firstRole._id}`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            const freshRole = roleResponse.ok ? await roleResponse.json() : firstRole;
            setSelectedRole(freshRole);
          } else {
            setSelectedRole(firstRole);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
      }
      
      if (file.size > 2 * 1024 * 1024) {
        alert('File size must be less than 2MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setIconPreview(base64String);
        setFormData({ ...formData, icon: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removeIcon = () => {
    setIconPreview('');
    setFormData({ ...formData, icon: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleEditRole = (role: any) => {
    setFormData({
      _id: role._id,
      name: role.name,
      description: role.description || '',
      icon: role.icon || '',
      status: role.status,
      permissions: role.permissions || []
    });
    setIconPreview(role.icon || '');
    setEditMode(true);
    setIsSlidebarOpen(true);
  };

  const handleAddNew = async () => {
    setFormData({ _id: '', name: '', icon: '', status: true, permissions: [], description: '' });
    setIconPreview('');
    setEditMode(false);
    setIsSlidebarOpen(true);
  };

  const handleDeleteRole = async (roleId: string) => {
    setRoleToDelete(roleId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (roleToDelete) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/roles/${roleToDelete}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          setSelectedRole(null);
          fetchRoles();
        } else {
          const errorData = await response.json();
          alert(`Error: ${errorData.message || 'Failed to delete role'}`);
        }
      } catch (error) {
        console.error('Error deleting role:', error);
      }
    }
    setShowDeleteConfirm(false);
    setRoleToDelete(null);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setRoleToDelete(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      let url = `${API_BASE_URL}/api/roles`;
      let method = 'POST';
      const submitData: any = { 
        name: formData.name,
        description: formData.description,
        icon: formData.icon,
        status: formData.status,
        permissions: formData.permissions
      };
      
      if (editMode && formData._id) {
        url = `${API_BASE_URL}/api/roles/${formData._id}`;
        method = 'PUT';
      }
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(submitData)
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setIsSlidebarOpen(false);
        setEditMode(false);
        setFormData({ _id: '', name: '', icon: '', status: true, permissions: [], description: '' });
        setIconPreview('');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        await fetchRoles();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message || 'Failed to save role'}`);
      }
    } catch (error) {
      console.error('Error saving:', error);
      alert('Failed to save. Check console for details.');
    }
  };

  return (
    <div className="main-content">
      <div className="companies-left-panel">
        <div className="companies-header">
          <div className="results-count">
            {roles.length} Results
          </div>
          <button className="add-new-btn" onClick={handleAddNew}>+ Add New</button>
          <input type="text" placeholder="Search by name" className="companies-search" />
        </div>
        
        <div className="companies-list">
          {roles.map((role) => {
            const isValidId = role._id && role._id.match(/^[0-9a-fA-F]{24}$/);
            
            return (
              <div 
                key={role._id}
                className={`company-item ${selectedRole?._id === role._id ? 'active' : ''}`}
                onClick={async () => {
                  if (!isValidId) {
                    console.error('Invalid role ID:', role._id);
                    setSelectedRole(role);
                    return;
                  }
                  
                  try {
                    const token = localStorage.getItem('token');
                    const response = await fetch(`${API_BASE_URL}/api/roles/${role._id}`, {
                      headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (response.ok) {
                      const freshRole = await response.json();
                      setSelectedRole(freshRole);
                    } else if (response.status === 404) {
                      console.error('Role not found or access denied');
                      setSelectedRole(null);
                    } else {
                      setSelectedRole(role);
                    }
                  } catch (error) {
                    console.error('Error fetching role:', error);
                    setSelectedRole(role);
                  }
                }}
                style={{ 
                  cursor: 'pointer', 
                  padding: '12px 16px',
                  marginBottom: '1px',
                  background: selectedRole?._id === role._id ? '#f0f9ff' : 'white',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ fontWeight: '600', fontSize: '14px', color: '#111827', marginBottom: '4px' }}>
                  {role.name}
                </div>
                <div style={{ fontSize: '12px', color: '#9ca3af', lineHeight: '1.4' }}>
                  {role.description || 'User Role'}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="companies-right-panel" style={{ flex: 1 }}>
        <RoleManager 
          selectedRole={selectedRole} 
          onEdit={handleEditRole} 
          onDelete={handleDeleteRole} 
          onRoleUpdate={handleRoleUpdate}
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
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    accept="image/*"
                    onChange={handleIconUpload}
                    style={{ display: 'none' }}
                  />
                  <div className="icon-upload">
                    {iconPreview ? (
                      <div style={{ position: 'relative' }}>
                        <img 
                          src={iconPreview} 
                          alt="Icon preview" 
                          style={{ 
                            width: '60px', 
                            height: '60px', 
                            objectFit: 'cover', 
                            borderRadius: '8px',
                            border: '2px solid #d1d5db'
                          }} 
                        />
                        <button 
                          type="button"
                          onClick={removeIcon}
                          style={{
                            position: 'absolute',
                            top: '-8px',
                            right: '-8px',
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px'
                          }}
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    ) : (
                      <button type="button" className="icon-upload-btn" onClick={triggerFileInput}>
                        <i className="fas fa-plus"></i>
                      </button>
                    )}
                    <span style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>
                      Icon
                    </span>
                  </div>
                </div>

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
                  <textarea 
                    className="form-textarea"
                    rows={3}
                    placeholder="Enter role description*"
                    value={formData.description || ''}
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
                        onChange={async (e) => {
                          const newStatus = e.target.checked;
                          setFormData({ ...formData, status: newStatus });
                          
                          if (editMode && formData._id) {
                            try {
                              const token = localStorage.getItem('token');
                              await fetch(`${API_BASE_URL}/api/roles/${formData._id}`, {
                                method: 'PUT',
                                headers: {
                                  'Content-Type': 'application/json',
                                  'Authorization': `Bearer ${token}`
                                },
                                body: JSON.stringify({ ...formData, status: newStatus })
                              });
                            } catch (error) {
                              console.error('Error updating status:', error);
                            }
                          }
                        }}
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

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <>
          <div className="modal-overlay" onClick={cancelDelete}></div>
          <div className="confirm-modal">
            <div className="modal-icon">
              <i className="fas fa-exclamation-triangle" style={{ fontSize: '48px', color: '#ef4444' }}></i>
            </div>
            <h3 style={{ margin: '16px 0', fontSize: '20px', fontWeight: '600', color: '#1f2937' }}>
              Delete Role
            </h3>
            <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: '#6b7280', textAlign: 'center' }}>
              Are you sure you want to delete this role? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button 
                onClick={cancelDelete}
                style={{
                  padding: '10px 24px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  background: 'white',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                style={{
                  padding: '10px 24px',
                  border: 'none',
                  borderRadius: '8px',
                  background: '#ef4444',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardRoleManager;