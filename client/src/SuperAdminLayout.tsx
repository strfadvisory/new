import React, { useState } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import './Dashboard.css';
import './pages/superadmin/AllCompanies.css';
import SuperAdminDashboard from './pages/superadmin/SuperAdminDashboard';
import AllCompanies from './pages/superadmin/AllCompanies';
import AllUsers from './pages/superadmin/AllUsers';
import Analytics from './pages/superadmin/Analytics';
import SystemSettings from './pages/superadmin/SystemSettings';
import RoleManager from './pages/superadmin/RoleManager';
import { API_BASE_URL } from './config';

interface SuperAdminLayoutProps {
  user: any;
  onLogout: () => void;
}

const SuperAdminLayout: React.FC<SuperAdminLayoutProps> = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
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
    description: '',
    icon: '',
    status: true,
    parentRole: '',
    childRoleId: '',
    permissions: {} as Record<string, boolean>
  });

  const currentPage = location.pathname.split('/').pop() || 'role-manager';

  React.useEffect(() => {
    if (currentPage === 'role-manager') {
      fetchRoles();
    }
  }, [currentPage]);

  const fetchRoles = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/roles`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setRoles(data);
        if (currentPage === 'role-manager' && data.length > 0) {
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
      description: role.description,
      icon: role.icon || '',
      status: role.status,
      parentRole: role.parentRoleId || '',
      childRoleId: role.childRoleId || '',
      permissions: role.permissions || {}
    });
    setIconPreview(role.icon || '');
    setEditMode(true);
    setIsSlidebarOpen(true);
  };

  const handleAddNew = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/roles/default-permissions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const defaultPermissions = await response.json();
      setFormData({ _id: '', name: '', description: '', icon: '', status: true, parentRole: '', childRoleId: '', permissions: defaultPermissions });
    } catch (error) {
      console.error('Error fetching default permissions:', error);
      setFormData({ _id: '', name: '', description: '', icon: '', status: true, parentRole: '', childRoleId: '', permissions: {} });
    }
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
        let url = `${API_BASE_URL}/api/roles/${roleToDelete}`;
        
        if (selectedRole?.parentRoleId && selectedRole?.childRoleId) {
          url += `?parentRole=${selectedRole.parentRoleId}&childRoleId=${selectedRole.childRoleId}&grandChildRoleId=${roleToDelete}`;
        }
        else if (selectedRole?.parentRoleId) {
          url += `?parentRole=${selectedRole.parentRoleId}&childRoleId=${roleToDelete}`;
        }
        
        const response = await fetch(url, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          setSelectedRole(null);
          fetchRoles();
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
      const submitData: any = { ...formData };
      
      if (editMode && formData._id) {
        if (formData.parentRole && formData.childRoleId) {
          url = `${API_BASE_URL}/api/roles/${formData.parentRole}`;
          method = 'PUT';
          submitData.grandChildRoleId = formData._id;
        }
        else if (formData.parentRole) {
          url = `${API_BASE_URL}/api/roles/${formData.parentRole}`;
          method = 'PUT';
          submitData.childRoleId = formData._id;
        } else {
          url = `${API_BASE_URL}/api/roles/${formData._id}`;
          method = 'PUT';
        }
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
        setFormData({ _id: '', name: '', description: '', icon: '', status: true, parentRole: '', childRoleId: '', permissions: {} });
        setIconPreview('');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        fetchRoles();
      } else {
        alert(`Error: ${result.message || 'Failed to save role'}`);
      }
    } catch (error) {
      console.error('Error saving role:', error);
      alert('Failed to save role. Check console for details.');
    }
  };

  const headerTabs = [
    { id: 'simulators', label: 'Simulators', path: '/admin/simulators' },
    { id: 'companies', label: 'Companies', path: '/admin/companies' },
    { id: 'role-manager', label: 'Role Manager', path: '/admin/role-manager' }
  ];

  return (
    <div  >
      <div className="dashboard-main">
        <header className="dashboard-header">
          <div className="header-left">
            <div className="logo">
              <img src="/logo.png" alt="Reserve Fund Advisory" style={{ height: '40px' }} />
              <div className="logo-text">
                <div className="company-name">Super Admin</div>
                <div className="company-subtitle">Association name</div>
              </div>
            </div>
            <nav className="header-nav">
              {headerTabs.map((tab) => (
                <span 
                  key={tab.id} 
                  className={`nav-link ${currentPage === tab.id ? 'active' : ''}`}
                  onClick={() => navigate(tab.path)}
                >
                  {tab.label}
                </span>
              ))}
            </nav>
          </div>
          <div className="header-right">
            <div className="user-menu">
            
              <button onClick={onLogout} className="logout-btn">
                Logout 
              </button>
            </div>
          </div>
        </header>
        
        <div className="dashboard-content">
          <div className="main-content">
            {currentPage !== 'companies' && currentPage !== 'simulators' && <div className="companies-left-panel">
              <div className="companies-header">
                <button className="add-new-btn" onClick={handleAddNew}>+ Add New</button>
                <input type="text" placeholder="Search by name" className="companies-search" />
              </div>
              <div className="results-count">{roles.length} Results founded</div>
              
              <div className="companies-list">
                {roles.map((role) => {
                  const isValidId = role._id && role._id.match(/^[0-9a-fA-F]{24}$/);
                  const allRoles = [];
                  
                  // Add parent role
                  allRoles.push({ ...role, hierarchy: 'L1', level: 1 });
                  
                  // Add child roles
                  if (role.childRoles && role.childRoles.length > 0) {
                    role.childRoles.forEach((childRole: any) => {
                      allRoles.push({ 
                        ...childRole, 
                        parentRoleId: role._id, 
                        hierarchy: `${role.name}`,
                        level: 2
                      });
                      
                      // Add grandchild roles
                      if (childRole.childRoles && childRole.childRoles.length > 0) {
                        childRole.childRoles.forEach((grandChildRole: any) => {
                          allRoles.push({ 
                            ...grandChildRole, 
                            parentRoleId: role._id, 
                            childRoleId: childRole._id,
                            hierarchy: `${role.name} - ${childRole.name}`,
                            level: 3
                          });
                        });
                      }
                    });
                  }
                  
                  return allRoles.map((roleItem) => (
                    <div 
                      key={roleItem._id}
                      className={`company-item ${selectedRole?._id === roleItem._id ? 'active' : ''}`}
                      onClick={async () => {
                        if (!isValidId) {
                          console.error('Invalid role ID:', roleItem._id);
                          setSelectedRole(roleItem);
                          return;
                        }
                        try {
                          const token = localStorage.getItem('token');
                          const response = await fetch(`${API_BASE_URL}/api/roles/${roleItem._id}`, {
                            headers: { 'Authorization': `Bearer ${token}` }
                          });
                          if (response.ok) {
                            const freshRole = await response.json();
                            setSelectedRole({ ...freshRole, ...roleItem });
                          } else {
                            setSelectedRole(roleItem);
                          }
                        } catch (error) {
                          console.error('Error fetching role:', error);
                          setSelectedRole(roleItem);
                        }
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="company-name">{roleItem.name}</div>
                      <div className="company-hierarchy" style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                        {roleItem.hierarchy}
                      </div>
                      <div className="company-desc">{roleItem.description}</div>
                      <div className="company-status" style={{ 
                        fontSize: '12px', 
                        color: roleItem.status ? '#10b981' : '#ef4444',
                        marginTop: '8px',
                        fontWeight: '500'
                      }}>
                        {roleItem.status ? 'Active' : 'Inactive'}
                      </div>
                    </div>
                  ));
                }).flat()}
              </div>
            </div>}
            
            <div className="companies-right-panel" style={currentPage === 'companies' || currentPage === 'simulators' ? { marginLeft: 0, width: '100%', flex: 1 } : { flex: 1 }}>
              <Routes>
                <Route path="simulators" element={<SuperAdminDashboard />} />
                <Route path="companies" element={<AllCompanies />} />
                <Route path="users" element={<AllUsers />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="settings" element={<SystemSettings />} />
                <Route path="role-manager" element={<RoleManager selectedRole={selectedRole} onEdit={handleEditRole} onDelete={handleDeleteRole} />} />
              </Routes>
            </div>
          </div>
        </div>
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
                    <span style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>Icon</span>
                  </div>
                </div>

                <div className="form-group">
                  <label>Role Type*</label>
                  <select 
                    className="form-input"
                    value={formData.parentRole}
                    onChange={(e) => {
                      setFormData({ ...formData, parentRole: e.target.value, childRoleId: '' });
                    }}
                    required
                  >
                    <option value="primary">Primary</option>
                    {roles.map((role) => (
                      <option key={role._id} value={role._id}>{role.name}</option>
                    ))}
                  </select>
                </div>

                {formData.parentRole && roles.find(r => r._id === formData.parentRole)?.childRoles?.length > 0 && (
                  <div className="form-group">
                    <label>Sub Role*</label>
                    <select 
                      className="form-input"
                      value={formData.childRoleId}
                      onChange={(e) => setFormData({ ...formData, childRoleId: e.target.value })}
                      required
                    >
                      <option value="">Select Sub Role</option>
                      {roles.find(r => r._id === formData.parentRole)?.childRoles?.map((childRole: any) => (
                        <option key={childRole._id} value={childRole._id}>{childRole.name}</option>
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
                    Discriber Details so use can identify use of this role *
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
            <h3 style={{ margin: '16px 0', fontSize: '20px', fontWeight: '600', color: '#1f2937' }}>Delete Role</h3>
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

export default SuperAdminLayout;
