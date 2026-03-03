import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { API_BASE_URL } from '../../config';
import { RoleValidator, RoleData } from '../../utils/roleValidator';
import './RoleManager.css';

interface Role {
  _id: string;
  name: string;
  description: string;
  icon: string;
  type: 'Master' | 'User';
  status: boolean;
  permissions: any;
  nextSteps: any[];
  video: any[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface Permission {
  code: string;
  name: string;
  description: string;
  enabled: boolean;
}

interface Module {
  module: string;
  displayName: string;
  permissions: Permission[];
  enabled: boolean;
  expanded?: boolean;
}

interface RoleManagerProps {
  selectedRole: Role | null;
  onEdit: (role: Role) => void;
  onDelete: (roleId: string) => void;
  onRoleUpdate?: () => void;
  isUserContext?: boolean;
}

interface Video {
  _id: string;
  title: string;
  description: string;
  thumbnail: string;
  videoUrl: string;
  isActive: boolean;
}

const RoleManager: React.FC<RoleManagerProps> = ({ selectedRole, onEdit, onDelete, onRoleUpdate, isUserContext = false }) => {
  const [modules, setModules] = useState<Module[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedVideos, setSelectedVideos] = useState<Video[]>([]);
  const [userPermissions, setUserPermissions] = useState<any>({});
  const [nextSteps, setNextSteps] = useState<any[]>([
    { title: 'Invite Advisory', description: 'Set up a new organizational entity to manage members, modules.ional entity to manage members, modules.', icon: 'user', completed: false },
    { title: 'Invite a Association', description: 'Set up a new organizational entity to manage members, modules.ional entity to manage members, modules.', icon: 'building', completed: false },
    { title: 'Upload Reserve Study Data', description: 'Set up a new organizational entity to manage members, modules.ional entity to manage members, modules.', icon: 'file', completed: false },
    { title: 'Schedule meeting with Expert', description: 'Set up a new organizational entity to manage members, modules.ional entity to manage members, modules.', icon: 'calendar', completed: false }
  ]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(`${API_BASE_URL}/api/library`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(response => response.json())
      .then(data => setVideos(data))
      .catch(error => console.error('Error fetching library items:', error));

    // Fetch user permissions
    fetch(`${API_BASE_URL}/api/roles/user-permissions`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(response => response.json())
      .then(data => setUserPermissions(data.permissions || {}))
      .catch(error => console.error('Error fetching user permissions:', error));
  }, []);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/menu/menu-master`)
      .then(response => response.json())
      .then(data => {
        // Filter out COMPANY_CONTROL module
        let filteredModules = data.modules.filter((mod: any) => mod.module !== 'COMPANY_CONTROL');
        
        // If not super admin, filter modules based on user permissions
        if (isUserContext && Object.keys(userPermissions).length > 0) {
          filteredModules = filteredModules.filter((mod: any) => {
            // Check if user has any permission in this module
            return mod.permissions.some((perm: any) => 
              userPermissions[`${mod.module}.${perm.code}`] === true
            );
          });
        }
        
        const modulesWithState = filteredModules.map((mod: any) => {
          let modulePermissions = mod.permissions;
          
          // If not super admin, filter permissions based on user permissions
          if (isUserContext && Object.keys(userPermissions).length > 0) {
            modulePermissions = mod.permissions.filter((perm: any) => 
              userPermissions[`${mod.module}.${perm.code}`] === true
            );
          }
          
          return {
            ...mod,
            enabled: false,
            expanded: false,
            permissions: modulePermissions.map((perm: any) => ({ ...perm, enabled: false }))
          };
        });
        setModules(modulesWithState);
      })
      .catch(error => console.error('Error fetching menu data:', error));
  }, [isUserContext, userPermissions]);

  useEffect(() => {
    console.log('Selected role changed:', selectedRole);
    console.log('Role nextSteps:', selectedRole?.nextSteps);
    
    if (selectedRole?.nextSteps && selectedRole.nextSteps.length > 0) {
      console.log('Setting role nextSteps:', selectedRole.nextSteps);
      setNextSteps(selectedRole.nextSteps);
    } else {
      // For admin context, set default steps. For user context, also set default steps if none exist
      const defaultSteps = [
        { title: 'Invite Advisory', description: 'Set up a new organizational entity to manage members and modules.', icon: 'user', completed: false },
        { title: 'Invite a Association', description: 'Set up a new organizational entity to manage members and modules.', icon: 'building', completed: false },
        { title: 'Upload Reserve Study Data', description: 'Set up a new organizational entity to manage members and modules.', icon: 'file', completed: false },
        { title: 'Schedule meeting with Expert', description: 'Set up a new organizational entity to manage members and modules.', icon: 'calendar', completed: false }
      ];
      
      if (!isUserContext) {
        console.log('Setting default nextSteps for admin context');
        setNextSteps(defaultSteps);
      } else {
        console.log('Setting default nextSteps for user context since none found');
        setNextSteps(defaultSteps);
      }
    }
    
    if (selectedRole?.video && Array.isArray(selectedRole.video) && selectedRole.video.length > 0) {
      setSelectedVideos(selectedRole.video);
    } else {
      setSelectedVideos([]);
    }
  }, [selectedRole?._id, isUserContext]);

  useEffect(() => {
    if (selectedRole?.permissions && modules.length > 0) {
      const updatedModules = modules.map(mod => {
        const modulePermissions = mod.permissions.map(perm => {
          const permKey = `${mod.module}.${perm.code}`;
          return {
            ...perm,
            enabled: Boolean(selectedRole.permissions[permKey])
          };
        });
        const moduleEnabled = modulePermissions.some(p => p.enabled);
        return {
          ...mod,
          enabled: moduleEnabled,
          expanded: false,
          permissions: modulePermissions
        };
      });
      setModules(updatedModules);
      setHasChanges(false);
    }
  }, [selectedRole?._id, selectedRole?.permissions]);

  const handleSave = async () => {
    if (!selectedRole?._id) {
      toast.error('No role selected for update');
      return;
    }
    
    const permissionsData: any = {};
    
    modules.forEach(mod => {
      mod.permissions.forEach(perm => {
        permissionsData[`${mod.module}.${perm.code}`] = perm.enabled;
      });
    });

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      // Validate role data before sending
      const roleData: RoleData = {
        _id: selectedRole._id,
        name: selectedRole.name,
        description: selectedRole.description || '',
        icon: selectedRole.icon || '',
        status: selectedRole.status !== undefined ? selectedRole.status : true,
        permissions: permissionsData,
        nextSteps: nextSteps || [],
        video: selectedVideos || []
      };

      const validation = RoleValidator.validateRoleData(roleData);
      if (!validation.isValid) {
        toast.error(`Validation failed: ${validation.errors.join(', ')}`);
        return;
      }

      if (validation.warnings.length > 0) {
        console.warn('Role validation warnings:', validation.warnings);
      }

      const updateData: any = {
        _id: selectedRole._id,
        ...RoleValidator.sanitizeRoleData(roleData)
      };
      
      let url = `${API_BASE_URL}/api/roles/`;
      
      if (isUserContext) {
        url += 'user-own-role';
      } else {
        url += selectedRole._id;
      }
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });
      
      if (response.ok) {
        const updatedRole = await response.json();
        toast.success('Role updated successfully!');
        setHasChanges(false);
        
        // Parent component will handle role updates via onRoleUpdate callback
        
        // Refresh parent component data
        if (onRoleUpdate) {
          onRoleUpdate();
        }
      } else {
        const error = await response.json();
        console.error('Update error:', error);
        toast.error(`Failed to save: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error saving:', error);
      toast.error('Network error: Failed to save changes');
    }
  };

  const handleEdit = () => {
    if (!selectedRole?._id) return;
    const permissionsData: any = {};
    modules.forEach(mod => {
      mod.permissions.forEach(perm => {
        permissionsData[`${mod.module}.${perm.code}`] = perm.enabled;
      });
    });
    onEdit({ ...selectedRole, permissions: permissionsData } as Role);
  };

  const toggleModuleExpand = (index: number) => {
    const updatedModules = modules.map((mod, i) => 
      i === index ? { ...mod, expanded: !mod.expanded } : mod
    );
    setModules(updatedModules);
  };

  const toggleModule = (index: number) => {
    const updatedModules = modules.map((mod, i) => {
      if (i === index) {
        const newEnabled = !mod.enabled;
        return {
          ...mod,
          enabled: newEnabled,
          expanded: mod.expanded,
          permissions: mod.permissions.map(p => ({ ...p, enabled: newEnabled }))
        };
      }
      return mod;
    });
    setModules(updatedModules);
    setHasChanges(true);
  };

  const togglePermission = (moduleIndex: number, permCode: string) => {
    const updatedModules = modules.map((mod, i) => {
      if (i === moduleIndex) {
        const updatedPermissions = mod.permissions.map(p => {
          if (p.code === permCode) {
            return { ...p, enabled: !p.enabled };
          }
          return p;
        });
        
        const anyEnabled = updatedPermissions.some(p => p.enabled);
        return {
          ...mod,
          enabled: anyEnabled,
          permissions: updatedPermissions
        };
      }
      return mod;
    });
    
    setModules(updatedModules);
    setHasChanges(true);
  };



  const toggleNextStep = async (index: number) => {
    if (index < 0 || index >= nextSteps.length) {
      console.error('Invalid step index:', index);
      return;
    }
    
    const updatedSteps = nextSteps.map((step, i) => 
      i === index ? { ...step, completed: !step.completed } : step
    );
    
    setNextSteps(updatedSteps);
    setHasChanges(true);
  };

  const toggleVideoSelection = (video: Video) => {
    const isSelected = selectedVideos.some(v => v._id === video._id);
    if (isSelected) {
      setSelectedVideos(selectedVideos.filter(v => v._id !== video._id));
    } else {
      setSelectedVideos([...selectedVideos, video]);
    }
    setHasChanges(true);
  };

  const saveNextStepsToDatabase = async (steps: any[]) => {
    if (!selectedRole?._id) return;
    try {
      const token = localStorage.getItem('token');
      const updateData: any = { 
        name: selectedRole.name,
        icon: selectedRole.icon,
        status: selectedRole.status,
        permissions: selectedRole.permissions,
        nextSteps: steps
      };
      
      const roleId = selectedRole._id;
      
      const response = await fetch(`${API_BASE_URL}/api/roles/${roleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(updateData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        console.error('Failed to save next steps:', error);
        toast.error('Failed to save next steps');
      }
    } catch (error) {
      console.error('Error saving next steps:', error);
      toast.error('Error saving next steps');
    }
  };

  const savePermissionsToDatabase = async (updatedModules: Module[]) => {
    if (!selectedRole?._id) {
      console.error('No role selected');
      return;
    }
    
    const permissionsData: any = {};
    
    updatedModules.forEach(mod => {
      mod.permissions.forEach(perm => {
        permissionsData[`${mod.module}.${perm.code}`] = perm.enabled;
      });
    });

    try {
      const token = localStorage.getItem('token');
      console.log('Saving permissions for role:', selectedRole._id);
      
      const updateData: any = { 
        name: selectedRole.name,
        icon: selectedRole.icon,
        status: selectedRole.status,
        permissions: permissionsData
      };
      
      const roleId = selectedRole._id;
      
      const response = await fetch(`${API_BASE_URL}/api/roles/${roleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        console.error('Failed to save permissions:', error);
        toast.error('Failed to save permissions: ' + (error.message || 'Unknown error'));
      } else {
        console.log('Permissions saved successfully');
        toast.success('Permissions saved successfully!');
      }
    } catch (error) {
      console.error('Error saving permissions:', error);
      toast.error('Error saving permissions');
    }
  };

  return (
    <div className="role-manager-container">
      {selectedRole ? (
        <>
          <div className="role-header">
            <div className="role-info">
              <h2>Role Management - {selectedRole.name}</h2>
              <div className="role-type-badge">
                <span className={`badge ${selectedRole.type === 'Master' ? 'badge-master' : 'badge-user'}`}>
                  {selectedRole.type} Role
                </span>
              </div>
            </div>
            <div className="role-actions">
              {hasChanges ? (
                <>
                  <button 
                    onClick={() => {
                      setHasChanges(false);
                      // Reset to original state
                      if (selectedRole?.permissions && modules.length > 0) {
                        const resetModules = modules.map(mod => {
                          const modulePermissions = mod.permissions.map(perm => {
                            const permKey = `${mod.module}.${perm.code}`;
                            return {
                              ...perm,
                              enabled: Boolean(selectedRole.permissions[permKey])
                            };
                          });
                          const moduleEnabled = modulePermissions.some(p => p.enabled);
                          return {
                            ...mod,
                            enabled: moduleEnabled,
                            expanded: false,
                            permissions: modulePermissions
                          };
                        });
                        setModules(resetModules);
                      }
                    }}
                    className="btn btn-cancel"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSave}
                    className="btn btn-primary"
                  >
                    Save Changes
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => onDelete(selectedRole._id)}
                    className="btn btn-danger"
                    style={{ marginRight: '8px' }}
                  >
                    Delete Role
                  </button>
                  <button 
                    onClick={handleEdit}
                    className="btn btn-secondary"
                  >
                    Edit Role
                  </button>
                </>
              )}
            </div>
          </div>
          
          <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '32px' }}>
            {selectedRole.description || 'User Role'}
          </p>

          {modules.map((module, moduleIndex) => (
            <div key={module.module} className="module-card">
              <div className={`module-header ${module.expanded ? 'expanded' : ''}`}>
                <span 
                  className={`module-title ${module.permissions.length === 0 ? 'disabled' : ''}`}
                  onClick={module.permissions.length > 0 ? () => toggleModuleExpand(moduleIndex) : undefined}
                >
                  {module.displayName}
                </span>
                <div className="module-controls">
                  <label className="toggle-switch" onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" checked={module.enabled} onChange={() => toggleModule(moduleIndex)} />
                    <span className="toggle-slider"></span>
                  </label>
                  <i 
                    className={`fas fa-${module.expanded ? 'minus' : 'plus'} expand-icon ${module.permissions.length === 0 ? 'disabled' : ''}`}
                    onClick={module.permissions.length > 0 ? () => toggleModuleExpand(moduleIndex) : undefined}
                  ></i>
                </div>
              </div>
              {module.expanded && (
                <div className="permissions-list">
                  {module.permissions.map((permission) => (
                    <div key={permission.code} className="permission-item">
                      <div className="permission-content">
                        <div className="permission-info">
                          <h4 className="permission-name">{permission.name}</h4>
                          <p className="permission-description">{permission.description}</p>
                        </div>
                        <div className="permission-controls">
                          <label className="toggle-switch">
                            <input type="checkbox" checked={permission.enabled} onChange={() => togglePermission(moduleIndex, permission.code)} />
                            <span className="toggle-slider"></span>
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          <div className="next-steps-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 className="section-title" style={{ margin: 0 }}>Next Steps</h3>
              {nextSteps.length === 0 && (
                <button 
                  onClick={() => {
                    const defaultSteps = [
                      { title: 'Invite Advisory', description: 'Set up a new organizational entity to manage members and modules.', icon: 'user', completed: false },
                      { title: 'Invite a Association', description: 'Set up a new organizational entity to manage members and modules.', icon: 'building', completed: false },
                      { title: 'Upload Reserve Study Data', description: 'Set up a new organizational entity to manage members and modules.', icon: 'file', completed: false },
                      { title: 'Schedule meeting with Expert', description: 'Set up a new organizational entity to manage members and modules.', icon: 'calendar', completed: false }
                    ];
                    setNextSteps(defaultSteps);
                    setHasChanges(true);
                  }}
                  className="btn btn-secondary"
                  style={{ fontSize: '12px', padding: '6px 12px' }}
                >
                  Add Default Steps
                </button>
              )}
            </div>
            {nextSteps && nextSteps.length > 0 ? (
              <div className="next-steps-list">
                {nextSteps.map((step: any, index: number) => (
                  <div key={index} className="next-step-item">
                    <div className="step-icon">
                      <i className={`fas fa-${step.icon || 'circle'}`}></i>
                    </div>
                    <div className="step-content">
                      <h4 className="step-title">{step.title || 'Untitled Step'}</h4>
                      <p className="step-description">{step.description || 'No description available'}</p>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={step.completed || false} 
                      onChange={() => toggleNextStep(index)}
                      className="step-checkbox"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No next steps configured for this role</p>
              </div>
            )}
          </div>

          <div className="videos-section">
            <h3 className="section-title">Videos</h3>
            {Array.isArray(videos) && videos.filter(video => video.isActive).length > 0 ? (
              <div className="videos-grid">
                {Array.isArray(videos) ? videos.filter(video => video.isActive).map((video) => (
                  <div key={video._id} className="video-card">
                    <img src={video.thumbnail} alt={video.title} className="video-thumbnail" />
                    <div className="video-info">
                      <h4 className="video-title">{video.title}</h4>
                      <p className="video-description">{video.description}</p>
                      <span className={`video-status ${video.isActive ? 'active' : 'inactive'}`}>
                        {video.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="video-controls">
                      <span className="video-select-label">Select</span>
                      <input 
                        type="checkbox" 
                        checked={selectedVideos.some(v => v._id === video._id)} 
                        onChange={() => toggleVideoSelection(video)}
                        className="video-checkbox"
                      />
                    </div>
                  </div>
                )) : null}
              </div>
            ) : (
              <div className="empty-state">
                <p>No videos available</p>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="no-selection">
          <h3>Select a role to manage permissions</h3>
          <p>Choose a role from the sidebar to configure its permissions and settings.</p>
        </div>
      )}
    </div>
  );
};

export default RoleManager;
