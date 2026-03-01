import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { API_BASE_URL } from '../../config';

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
  canEdit?: boolean;
  canEditValue?: boolean;
}

interface RoleManagerProps {
  selectedRole: any;
  onEdit: (role: any) => void;
  onDelete: (roleId: string) => void;
}

interface Video {
  _id: string;
  title: string;
  description: string;
  thumbnail: string;
  videoUrl: string;
  isActive: boolean;
}

const RoleManager: React.FC<RoleManagerProps> = ({ selectedRole, onEdit, onDelete }) => {
  const [modules, setModules] = useState<Module[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedVideos, setSelectedVideos] = useState<Video[]>([]);
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
  }, []);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/menu/menu-master`)
      .then(response => response.json())
      .then(data => {
        // Filter out COMPANY_CONTROL module
        const filteredModules = data.modules.filter((mod: any) => mod.module !== 'COMPANY_CONTROL');
        const modulesWithState = filteredModules.map((mod: any) => ({
          ...mod,
          enabled: false,
          expanded: false,
          canEditValue: mod.canEditValue || false,
          permissions: mod.permissions.map((perm: any) => ({ ...perm, enabled: false }))
        }));
        setModules(modulesWithState);
      })
      .catch(error => console.error('Error fetching menu data:', error));
  }, []);

  useEffect(() => {
    if (selectedRole?.nextSteps && selectedRole.nextSteps.length > 0) {
      setNextSteps(selectedRole.nextSteps);
    } else {
      setNextSteps([
        { title: 'Invite Advisory', description: 'Set up a new organizational entity to manage members, modules.ional entity to manage members, modules.', icon: 'user', completed: false },
        { title: 'Invite a Association', description: 'Set up a new organizational entity to manage members, modules.ional entity to manage members, modules.', icon: 'building', completed: false },
        { title: 'Upload Reserve Study Data', description: 'Set up a new organizational entity to manage members, modules.ional entity to manage members, modules.', icon: 'file', completed: false },
        { title: 'Schedule meeting with Expert', description: 'Set up a new organizational entity to manage members, modules.ional entity to manage members, modules.', icon: 'calendar', completed: false }
      ]);
    }
    if (selectedRole?.video && selectedRole.video.length > 0) {
      setSelectedVideos(selectedRole.video);
    } else {
      setSelectedVideos([]);
    }
  }, [selectedRole]);

  useEffect(() => {
    if (selectedRole?.permissions && modules.length > 0) {
      const updatedModules = modules.map(mod => {
        const modulePermissions = mod.permissions.map(perm => {
          const permKey = `${mod.module}.${perm.code}`;
          return {
            ...perm,
            enabled: selectedRole.permissions[permKey] || false
          };
        });
        const moduleEnabled = modulePermissions.some(p => p.enabled);
        const canEditValue = selectedRole.canEditPermissions?.[mod.module] || false;
        return {
          ...mod,
          enabled: moduleEnabled,
          expanded: moduleEnabled && mod.permissions.length > 0,
          canEditValue: canEditValue,
          permissions: modulePermissions
        };
      });
      setModules(updatedModules);
      setHasChanges(false);
    }
  }, [selectedRole, selectedRole?.permissions, selectedRole?.canEditPermissions]);

  const handleSave = async () => {
    if (!selectedRole?._id) return;
    
    const permissionsData: any = {};
    const canEditData: any = {};
    modules.forEach(mod => {
      mod.permissions.forEach(perm => {
        permissionsData[`${mod.module}.${perm.code}`] = perm.enabled;
      });
      if (mod.canEdit) {
        canEditData[mod.module] = mod.canEditValue || false;
      }
    });

    try {
      const token = localStorage.getItem('token');
      const updateData: any = { 
        name: selectedRole.name,
        type: selectedRole.type,
        description: selectedRole.description,
        icon: selectedRole.icon,
        status: selectedRole.status,
        permissions: permissionsData,
        canEditPermissions: canEditData,
        nextSteps: nextSteps,
        video: selectedVideos
      };
      
      if (selectedRole.parentRoleId) {
        updateData.parentRole = selectedRole.parentRoleId;
        updateData.childRoleId = selectedRole._id;
      }
      
      const response = await fetch(`${API_BASE_URL}/api/roles/${selectedRole.parentRoleId || selectedRole._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });
      
      if (response.ok) {
        toast.success('Successfully updated!');
        setHasChanges(false);
      } else {
        const error = await response.json();
        toast.error('Failed to save: ' + error.message);
      }
    } catch (error) {
      console.error('Error saving:', error);
      toast.error('Failed to save changes');
    }
  };

  const handleEdit = () => {
    const permissionsData: any = {};
    modules.forEach(mod => {
      mod.permissions.forEach(perm => {
        permissionsData[`${mod.module}.${perm.code}`] = perm.enabled;
      });
    });
    onEdit({ ...selectedRole, permissions: permissionsData });
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
          expanded: newEnabled && mod.permissions.length > 0,
          canEditValue: newEnabled ? mod.canEditValue : false,
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
        const updatedPermissions = mod.permissions.map(p => 
          p.code === permCode ? { ...p, enabled: !p.enabled } : p
        );
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

  const toggleCanEdit = (index: number) => {
    const updatedModules = modules.map((mod, i) => 
      i === index ? { ...mod, canEditValue: !mod.canEditValue } : mod
    );
    setModules(updatedModules);
    setHasChanges(true);
  };

  const toggleNextStep = async (index: number) => {
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
        type: selectedRole.type,
        description: selectedRole.description,
        icon: selectedRole.icon,
        status: selectedRole.status,
        permissions: selectedRole.permissions,
        nextSteps: steps
      };
      if (selectedRole.parentRoleId) {
        updateData.parentRole = selectedRole.parentRoleId;
        updateData.childRoleId = selectedRole._id;
      }
      await fetch(`${API_BASE_URL}/api/roles/${selectedRole.parentRoleId || selectedRole._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(updateData)
      });
    } catch (error) {
      console.error('Error saving next steps:', error);
    }
  };

  const savePermissionsToDatabase = async (updatedModules: Module[]) => {
    if (!selectedRole?._id) {
      console.error('No role selected');
      return;
    }
    
    const permissionsData: any = {};
    const canEditData: any = {};
    updatedModules.forEach(mod => {
      mod.permissions.forEach(perm => {
        permissionsData[`${mod.module}.${perm.code}`] = perm.enabled;
      });
      if (mod.canEdit) {
        canEditData[mod.module] = mod.canEditValue || false;
      }
    });

    try {
      const token = localStorage.getItem('token');
      console.log('Saving permissions for role:', selectedRole._id);
      
      const updateData: any = { 
        name: selectedRole.name,
        type: selectedRole.type,
        description: selectedRole.description,
        icon: selectedRole.icon,
        status: selectedRole.status,
        permissions: permissionsData,
        canEditPermissions: canEditData
      };
      
      // If this is a child role, include parent info
      if (selectedRole.parentRoleId) {
        updateData.parentRole = selectedRole.parentRoleId;
        updateData.childRoleId = selectedRole._id;
      }
      
      const response = await fetch(`${API_BASE_URL}/api/roles/${selectedRole.parentRoleId || selectedRole._id}`, {
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
      } else {
        console.log('Permissions saved successfully');
      }
    } catch (error) {
      console.error('Error saving permissions:', error);
    }
  };

  return (
    <div style={{ padding: '24px', paddingBottom: '50px', maxWidth: '800px', margin: '0 auto' }}>
      {selectedRole ? (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: '600', color: '#1f2937' }}>Role Management - {selectedRole.name}</h2>
              <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>{selectedRole.type}</p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              {hasChanges ? (
                <button 
                  onClick={handleSave}
                  style={{ padding: '8px 16px', border: 'none', borderRadius: '6px', background: '#3b82f6', color: 'white', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}
                >
                  Save
                </button>
              ) : (
                <button 
                  onClick={handleEdit}
                  style={{ padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '6px', background: 'white', cursor: 'pointer', fontSize: '14px' }}
                >
                  Edit
                </button>
              )}
            </div>
          </div>
          
          <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '32px' }}>
            {selectedRole.description}
          </p>

          {modules.map((module, moduleIndex) => (
            <div key={module.module} style={{ marginBottom: '16px', padding: '16px', border: '1px solid #e5e7eb', borderRadius: '8px', background: 'white' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: module.expanded ? '16px' : '0' }}>
                <span 
                  style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937', cursor: module.permissions.length > 0 ? 'pointer' : 'default', flex: 1 }}
                  onClick={module.permissions.length > 0 ? () => toggleModuleExpand(moduleIndex) : undefined}
                >
                  {module.displayName}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {module.canEdit && module.enabled && (
                    <>
                      <span style={{ fontSize: '12px', color: '#6b7280', marginRight: '8px' }}>Can Edit</span>
                      <input 
                        type="checkbox" 
                        checked={module.canEditValue || false} 
                        onChange={() => toggleCanEdit(moduleIndex)}
                        style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                      />
                    </>
                  )}
                  <label className="toggle-switch" onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" checked={module.enabled} onChange={() => toggleModule(moduleIndex)} />
                    <span className="toggle-slider"></span>
                  </label>
                  <i 
                    className={`fas fa-${module.expanded ? 'minus' : 'plus'}`} 
                    style={{ 
                      fontSize: '14px', 
                      color: module.permissions.length > 0 ? '#6b7280' : '#d1d5db', 
                      cursor: module.permissions.length > 0 ? 'pointer' : 'not-allowed' 
                    }}
                    onClick={module.permissions.length > 0 ? () => toggleModuleExpand(moduleIndex) : undefined}
                  ></i>
                </div>
              </div>
              {module.expanded && (
                <div style={{ paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
                  {module.permissions.map((permission) => (
                    <div key={permission.code} style={{ padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>{permission.name}</h4>
                          <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>{permission.description}</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '16px' }}>
                          {module.canEdit && (
                            <input 
                              type="checkbox" 
                              checked={permission.enabled} 
                              onChange={() => togglePermission(moduleIndex, permission.code)}
                              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                            />
                          )}
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

          <div style={{ marginTop: '24px', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '16px' }}>Next Steps</h3>
            {nextSteps.map((step, index) => (
              <div key={index} style={{ marginBottom: '12px', padding: '16px', border: '1px solid #e5e7eb', borderRadius: '8px', background: 'white', display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <div style={{ width: '48px', height: '48px', background: '#eff6ff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <i className={`fas fa-${step.icon}`} style={{ fontSize: '20px', color: '#3b82f6' }}></i>
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>{step.title}</h4>
                  <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>{step.description}</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={step.completed} 
                  onChange={() => toggleNextStep(index)}
                  style={{ width: '20px', height: '20px', cursor: 'pointer', marginTop: '4px' }}
                />
              </div>
            ))}
          </div>

          <div style={{ marginTop: '24px', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '16px' }}>Videos</h3>
            {videos.filter(video => video.isActive).length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                {videos.filter(video => video.isActive).map((video) => (
                  <div key={video._id} style={{ padding: '16px', border: '1px solid #e5e7eb', borderRadius: '8px', background: 'white', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <img src={video.thumbnail} alt={video.title} style={{ width: '100%', height: '140px', borderRadius: '6px', objectFit: 'cover' }} />
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>{video.title}</h4>
                      <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#6b7280' }}>{video.description}</p>
                      <span style={{ fontSize: '12px', color: video.isActive ? '#22c55e' : '#ef4444', background: video.isActive ? '#dcfce7' : '#fee2e2', padding: '2px 8px', borderRadius: '4px' }}>{video.isActive ? 'Active' : 'Inactive'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid #e5e7eb' }}>
                      <span style={{ fontSize: '13px', color: '#6b7280' }}>Select</span>
                      <input 
                        type="checkbox" 
                        checked={selectedVideos.some(v => v._id === video._id)} 
                        onChange={() => toggleVideoSelection(video)}
                        style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '32px', border: '2px dashed #d1d5db', borderRadius: '8px', textAlign: 'center', background: '#f9fafb' }}>
                <p style={{ fontSize: '16px', color: '#6b7280', margin: 0 }}>No videos available</p>
              </div>
            )}
          </div>
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '48px' }}>
          <h3 style={{ fontSize: '18px', color: '#6b7280', marginBottom: '16px' }}>Select a role to manage permissions</h3>
          <p style={{ fontSize: '14px', color: '#9ca3af' }}>Choose a role from the sidebar to configure its permissions and settings.</p>
        </div>
      )}
    </div>
  );
};

export default RoleManager;
