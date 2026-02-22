import React, { useState } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import './Dashboard.css';
import SuperAdminDashboard from './pages/superadmin/SuperAdminDashboard';
import AllCompanies from './pages/superadmin/AllCompanies';
import AllUsers from './pages/superadmin/AllUsers';
import Analytics from './pages/superadmin/Analytics';
import SystemSettings from './pages/superadmin/SystemSettings';
import RoleManager from './pages/superadmin/RoleManager';

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
    type: 'Primary',
    description: '',
    icon: '',
    status: true
  });

  const currentPage = location.pathname.split('/').pop() || 'role-manager';

  React.useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/roles', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setRoles(data);
        if (data.length > 0 && !selectedRole) {
          setSelectedRole(data[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
      }
      
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('File size must be less than 2MB');
        return;
      }

      // Create preview
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
      type: role.type,
      description: role.description,
      icon: role.icon || '',
      status: role.status
    });
    setIconPreview(role.icon || '');
    setEditMode(true);
    setIsSlidebarOpen(true);
  };

  const handleAddNew = () => {
    setFormData({ _id: '', name: '', type: 'Primary', description: '', icon: '', status: true });
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
        const response = await fetch(`http://localhost:5000/api/roles/${roleToDelete}`, {
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
      const url = editMode 
        ? `http://localhost:5000/api/roles/${formData._id}`
        : 'http://localhost:5000/api/roles';
      
      const response = await fetch(url, {
        method: editMode ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        setIsSlidebarOpen(false);
        setEditMode(false);
        setFormData({ _id: '', name: '', type: 'Primary', description: '', icon: '', status: true });
        setIconPreview('');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        fetchRoles();
      }
    } catch (error) {
      console.error('Error saving role:', error);
    }
  };

  const headerTabs = [
    { id: 'simulators', label: 'Simulators', path: '/admin/simulators' },
    { id: 'companies', label: 'Companies', path: '/admin/companies' },
    { id: 'role-manager', label: 'Role Manager', path: '/admin/role-manager' }
  ];

  return (
    <div className="dashboard-container-no-sidebar">
      <div className="dashboard-main">
        <header className="dashboard-header">
          <div className="header-left">
            <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img src="/logo.png" alt="Reserve Fund Advisory" style={{ height: '40px' }} />
              <div className="logo-text">
                <div className="company-name" style={{ color: 'white', fontSize: '14px', fontWeight: '700' }}>Super Admin</div>
                <div className="company-subtitle" style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>Association name</div>
              </div>
            </div>
            <nav className="header-nav" style={{ marginLeft: '40px' }}>
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
              <i className="fas fa-user-circle"></i>
              <button onClick={onLogout} className="logout-btn">
                <i className="fas fa-sign-out-alt"></i>
              </button>
            </div>
          </div>
        </header>
        
        <div className="dashboard-content">
          <div className="content-header">
            <div className="results-info">
              <span className="results-count">{roles.length} Results founded</span>
              <button className="add-new-btn" onClick={handleAddNew}>
                <i className="fas fa-plus"></i> Add New
              </button>
            </div>
          </div>
          
          <div className="main-content">
            <div className="left-panel">
              <div className="search-filter">
                <input type="text" placeholder="Search by name" className="search-input" />
              </div>
              
              <div className="companies-list">
                {roles.map((role) => (
                  <div 
                    key={role._id} 
                    className={`company-item ${selectedRole?._id === role._id ? 'selected' : ''}`}
                    onClick={() => setSelectedRole(role)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="company-info">
                      <h4>{role.name}</h4>
                      <p>{role.type}</p>
                      <small>{role.description}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="right-panel">
              <Routes>
                <Route path="/" element={<Navigate to="/admin/role-manager" />} />
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
              <h3>{editMode ? 'Edit Role' : 'Basic Details'}</h3>
              <button className="close-btn" onClick={() => setIsSlidebarOpen(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="slidebar-content">
                <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '20px' }}>
                  Grants permission-based access to the Simulator
                </p>
                
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
                  <select 
                    className="form-select"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option>Primary</option>
                    <option>Secondary</option>
                    <option>Members</option>
                  </select>
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
