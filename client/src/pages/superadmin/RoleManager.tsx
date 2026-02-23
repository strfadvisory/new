import React, { useState, useEffect } from 'react';

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
}

interface RoleManagerProps {
  selectedRole: any;
  onEdit: (role: any) => void;
  onDelete: (roleId: string) => void;
}

const RoleManager: React.FC<RoleManagerProps> = ({ selectedRole, onEdit, onDelete }) => {
  const [modules, setModules] = useState<Module[]>([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/menu/menu-master')
      .then(response => response.json())
      .then(data => {
        const modulesWithState = data.modules.map((mod: any) => ({
          ...mod,
          enabled: false,
          permissions: mod.permissions.map((perm: any) => ({ ...perm, enabled: false }))
        }));
        setModules(modulesWithState);
      })
      .catch(error => console.error('Error fetching menu data:', error));
  }, []);

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
        return {
          ...mod,
          enabled: moduleEnabled,
          permissions: modulePermissions
        };
      });
      setModules(updatedModules);
    }
  }, [selectedRole]);

  const handleEdit = () => {
    const permissionsData: any = {};
    modules.forEach(mod => {
      mod.permissions.forEach(perm => {
        permissionsData[`${mod.module}.${perm.code}`] = perm.enabled;
      });
    });
    onEdit({ ...selectedRole, permissions: permissionsData });
  };

  const toggleModule = (index: number) => {
    const updatedModules = modules.map((mod, i) => {
      if (i === index) {
        const newEnabled = !mod.enabled;
        return {
          ...mod,
          enabled: newEnabled,
          permissions: mod.permissions.map(p => ({ ...p, enabled: newEnabled }))
        };
      }
      return mod;
    });
    setModules(updatedModules);
    savePermissionsToDatabase(updatedModules);
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
    savePermissionsToDatabase(updatedModules);
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
        type: selectedRole.type,
        description: selectedRole.description,
        icon: selectedRole.icon,
        status: selectedRole.status,
        permissions: permissionsData 
      };
      
      // If this is a child role, include parent info
      if (selectedRole.parentRoleId) {
        updateData.parentRole = selectedRole.parentRoleId;
        updateData.childRoleId = selectedRole._id;
      }
      
      const response = await fetch(`http://localhost:5000/api/roles/${selectedRole.parentRoleId || selectedRole._id}`, {
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
    <div style={{ padding: '24px' }}>
      {selectedRole ? (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: '600', color: '#1f2937' }}>{selectedRole.name}</h2>
              <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>{selectedRole.type}</p>
            </div>
            <button 
              onClick={handleEdit}
              style={{ padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '6px', background: 'white', cursor: 'pointer', fontSize: '14px' }}
            >
              Edit
            </button>
          </div>
          
          <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '32px' }}>
            {selectedRole.description}
          </p>

          {modules.map((module, moduleIndex) => (
            <div key={module.module} style={{ marginBottom: '16px', padding: '16px', border: '1px solid #e5e7eb', borderRadius: '8px', background: 'white' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: module.enabled ? '16px' : '0' }}>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>{module.displayName}</span>
                <label className="toggle-switch">
                  <input type="checkbox" checked={module.enabled} onChange={() => toggleModule(moduleIndex)} />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              {module.enabled && (
                <div style={{ paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
                  {module.permissions.map((permission) => (
                    <div key={permission.code} style={{ padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>{permission.name}</h4>
                          <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>{permission.description}</p>
                        </div>
                        <label className="toggle-switch" style={{ marginLeft: '16px' }}>
                          <input type="checkbox" checked={permission.enabled} onChange={() => togglePermission(moduleIndex, permission.code)} />
                          <span className="toggle-slider"></span>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          <div style={{ marginTop: '16px', padding: '16px', border: '1px solid #e5e7eb', borderRadius: '8px', background: '#f9fafb' }}>
            <button 
              onClick={() => onDelete(selectedRole._id)}
              style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}
            >
              Remove this
            </button>
          </div>
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
          <p>Select a role from the left panel to view details</p>
        </div>
      )}
    </div>
  );
};

export default RoleManager;
