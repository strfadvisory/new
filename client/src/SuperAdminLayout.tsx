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
import Library from './pages/superadmin/Library';
import { API_BASE_URL } from './config';
import DashboardHeader from './components/DashboardHeader';

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
  const [libraryItems, setLibraryItems] = useState<any[]>([]);
  const [selectedLibraryItem, setSelectedLibraryItem] = useState<any>(null);
  const [iconPreview, setIconPreview] = useState<string>('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    _id: '',
    name: '',
    icon: '',
    status: true,
    permissions: {} as Record<string, boolean>,
    videoUrl: '',
    description: '' // Only used for library items
  });

  const currentPage = location.pathname.split('/').pop() || 'role-manager';

  React.useEffect(() => {
    if (currentPage === 'role-manager') {
      fetchRoles();
    } else if (currentPage === 'library') {
      fetchLibraryItems();
    }
  }, [currentPage]);

  const fetchLibraryItems = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/library`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setLibraryItems(data);
        if (currentPage === 'library' && data.length > 0) {
          setSelectedLibraryItem(data[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching library items:', error);
    }
  };

  const refreshSelectedRole = async () => {
    if (selectedRole?._id) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/roles/${selectedRole._id}`, {
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
      const response = await fetch(`${API_BASE_URL}/roles`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setRoles(data);
        if (currentPage === 'role-manager' && data.length > 0) {
          const firstRole = data[0];
          const isValidId = firstRole._id && firstRole._id.match(/^[0-9a-fA-F]{24}$/);
          if (isValidId) {
            const roleResponse = await fetch(`${API_BASE_URL}/roles/${firstRole._id}`, {
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

  const handleEditLibraryItem = (item: any) => {
    setFormData({
      _id: item._id,
      name: item.title,
      icon: item.thumbnail,
      status: item.isActive,
      permissions: {},
      videoUrl: item.videoUrl,
      description: item.description
    });
    setIconPreview(item.thumbnail || '');
    setEditMode(true);
    setIsSlidebarOpen(true);
  };

  const handleDeleteLibraryItem = async (itemId: string) => {
    setRoleToDelete(itemId);
    setShowDeleteConfirm(true);
  };

  const handleEditRole = (role: any) => {
    setFormData({
      _id: role._id,
      name: role.name,
      description: role.description || '',
      icon: role.icon || '',
      status: role.status,
      permissions: role.permissions || {},
      videoUrl: ''
    });
    setIconPreview(role.icon || '');
    setEditMode(true);
    setIsSlidebarOpen(true);
  };

  const handleAddNew = async () => {
    if (currentPage === 'library') {
      setFormData({ _id: '', name: '', icon: '', status: true, permissions: {}, videoUrl: '', description: '' });
      setIconPreview('');
      setEditMode(false);
      setIsSlidebarOpen(true);
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/roles/default-permissions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const defaultPermissions = await response.json();
      setFormData({ _id: '', name: '', icon: '', status: true, permissions: defaultPermissions, videoUrl: '', description: '' });
    } catch (error) {
      console.error('Error fetching default permissions:', error);
      setFormData({ _id: '', name: '', icon: '', status: true, permissions: {}, videoUrl: '', description: '' });
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
        let url;
        
        if (currentPage === 'library') {
          url = `${API_BASE_URL}/library/${roleToDelete}`;
        } else {
          url = `${API_BASE_URL}/roles/${roleToDelete}`;
        }
        
        const response = await fetch(url, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          if (currentPage === 'library') {
            setSelectedLibraryItem(null);
            fetchLibraryItems();
          } else {
            setSelectedRole(null);
            fetchRoles();
          }
        }
      } catch (error) {
        console.error('Error deleting item:', error);
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
      
      if (currentPage === 'library') {
        const submitData = {
          title: formData.name,
          description: formData.description || '',
          thumbnail: formData.icon,
          videoUrl: formData.videoUrl || '',
          isActive: formData.status
        };
        
        let url = `${API_BASE_URL}/library`;
        let method = 'POST';
        
        if (editMode && formData._id) {
          url = `${API_BASE_URL}/library/${formData._id}`;
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
          setFormData({ _id: '', name: '', icon: '', status: true, permissions: {}, videoUrl: '', description: '' });
          setIconPreview('');
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          fetchLibraryItems();
        } else {
          alert(`Error: ${result.message || 'Failed to save library item'}`);
        }
        return;
      }
      
      let url = `${API_BASE_URL}/roles`;
      let method = 'POST';
      const submitData: any = { 
        name: formData.name,
        description: formData.description,
        icon: formData.icon,
        status: formData.status,
        permissions: formData.permissions
      };
      
      if (editMode && formData._id) {
        url = `${API_BASE_URL}/roles/${formData._id}`;
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
        setFormData({ _id: '', name: '', icon: '', status: true, permissions: {}, videoUrl: '', description: '' });
        setIconPreview('');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        await fetchRoles();
      } else {
        alert(`Error: ${result.message || 'Failed to save role'}`);
      }
    } catch (error) {
      console.error('Error saving:', error);
      alert('Failed to save. Check console for details.');
    }
  };

  const headerTabs = [
    { id: 'simulators', label: 'Simulators', path: '/admin/simulators' },
    { id: 'companies', label: 'Companies', path: '/admin/companies' },
    { id: 'role-manager', label: 'Role Manager', path: '/admin/role-manager' },
    { id: 'library', label: 'Library', path: '/admin/library' }
  ];

  return (
    <div  >
      <div className="dashboard-main">
        <DashboardHeader 
          user={user} 
          onLogout={onLogout} 
          isSuperAdmin={true}
          headerTabs={headerTabs}
        />
        
        <div className="dashboard-content">
          <div className="main-content">
            {currentPage !== 'companies' && currentPage !== 'simulators' && <div className="companies-left-panel">
              {/* <div className="companies-header">
                <button className="add-new-btn" onClick={handleAddNew}>+ Add New</button>
                <input type="text" placeholder="Search by name" className="companies-search" />
              </div>
              <div className="results-count">
                {currentPage === 'library' ? libraryItems.length : roles.length} Results founded
              </div> */}

               <div className="companies-header">
          <div className="header-top">
            <h2 className="results-title">    {currentPage === 'library' ? libraryItems.length : roles.length} Results founded </h2>
            <a href="#" className="add-new-link" onClick={handleAddNew}>+ Add New</a>
          </div>
               <input type="text" placeholder="Search by name" className="companies-search" />
        </div>
              
              <div className="companies-list">
                {currentPage === 'library' ? (
                  libraryItems.map((item) => (
                    <div 
                      key={item._id}
                      className={`company-item ${selectedLibraryItem?._id === item._id ? 'active' : ''}`}
                      onClick={() => setSelectedLibraryItem(item)}
                    >
                      <div className="company-logo">
                        <img 
                          src={item.thumbnail || '/logo.png'} 
                          alt={item.title}
                        />
                      </div>
                      <div className="company-info">
                        <div className="company-name">{item.title}</div>
                        <div className="company-level associations">Associations</div>
                        <div className="company-address">{item.description}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  roles.map((role) => {
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
                            const response = await fetch(`${API_BASE_URL}/roles/${role._id}`, {
                              headers: { 'Authorization': `Bearer ${token}` }
                            });
                            if (response.ok) {
                              const freshRole = await response.json();
                              setSelectedRole(freshRole);
                            } else {
                              setSelectedRole(role);
                            }
                          } catch (error) {
                            console.error('Error fetching role:', error);
                            setSelectedRole(role);
                          }
                        }}
                      >
                        <div className="company-logo">
                          {role.icon ? (
                            <img src={role.icon} alt={role.name} />
                          ) : (
                            <i className="fas fa-user-shield" style={{ color: '#64748b', fontSize: '20px' }}></i>
                          )}
                        </div>
                        <div className="company-info">
                          <div className="company-name">{role.name}</div>
                          <div className="company-level">{role.name.toLowerCase().includes('association') ? 'Associations' : 'Level 1'}</div>
                          <div className="company-address">{role.description || 'Master Role'}</div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>}
            
            <div className="companies-right-panel" style={currentPage === 'companies' || currentPage === 'simulators' ? { marginLeft: 0, width: '100%', flex: 1 } : { flex: 1 }}>
              <Routes>
                <Route path="" element={<Navigate to="simulators" replace />} />
                <Route path="simulators" element={<SuperAdminDashboard />} />
                <Route path="companies" element={<AllCompanies />} />
                <Route path="users" element={<AllUsers />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="settings" element={<SystemSettings />} />
                <Route path="role-manager" element={<RoleManager selectedRole={selectedRole} onEdit={handleEditRole} onDelete={handleDeleteRole} onRoleUpdate={handleRoleUpdate} isUserContext={false} />} />
                <Route path="library" element={<Library selectedItem={selectedLibraryItem} onEdit={handleEditLibraryItem} onDelete={handleDeleteLibraryItem} />} />
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
              <h3>{editMode ? (currentPage === 'library' ? 'Edit Library Item' : 'Edit Role') : (currentPage === 'library' ? 'Add New Library Item' : 'Add New Role')}</h3>
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
                      {currentPage === 'library' ? 'Thumbnail' : 'Icon'}
                    </span>
                  </div>
                </div>

                <div className="form-group">
                  <input 
                    type="text" 
                    placeholder={currentPage === 'library' ? 'Enter Title*' : 'Enter Role Name*'}
                    className="form-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                {currentPage !== 'library' && (
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
                )}

                {currentPage === 'library' && (
                  <>
                    <div className="form-group">
                      <input 
                        type="url" 
                        placeholder="Enter Video URL*" 
                        className="form-input"
                        value={formData.videoUrl || ''}
                        onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px', display: 'block' }}>
                        Describe the video content*
                      </label>
                      <textarea 
                        className="form-textarea"
                        rows={4}
                        placeholder="Enter description..."
                        value={formData.description || ''}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        required
                      ></textarea>
                    </div>
                  </>
                )}

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
                              const url = currentPage === 'library' 
                                ? `${API_BASE_URL}/library/${formData._id}`
                                : `${API_BASE_URL}/roles/${formData._id}`;
                              await fetch(url, {
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
                  {editMode ? (currentPage === 'library' ? 'Update Library Item' : 'Update Role') : (currentPage === 'library' ? 'Save Library Item' : 'Save Role')}
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
              {currentPage === 'library' ? 'Delete Library Item' : 'Delete Role'}
            </h3>
            <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: '#6b7280', textAlign: 'center' }}>
              Are you sure you want to delete this {currentPage === 'library' ? 'library item' : 'role'}? This action cannot be undone.
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
