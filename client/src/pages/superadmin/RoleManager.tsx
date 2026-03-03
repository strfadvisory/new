import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { API_BASE_URL } from '../../config';
import './RoleManager.css';

interface Role {
  _id: string;
  name: string;
  description: string;
  icon: string;
  type: 'Master' | 'User';
  status: boolean;
  permissions: string[];
  nextSteps: string[];
  videos: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface Module {
  id: string;
  key: string;
  displayName: string;
  permissions: Permission[];
}

interface Permission {
  id: string;
  code: string;
  name: string;
}

interface NextStep {
  id: string;
  title: string;
  icon: string;
  permissionIds: string[];
}

interface Video {
  id: string;
  title: string;
  thumbnail: string;
  permissionIds: string[];
}

interface RoleManagerProps {
  selectedRole: Role | null;
  onEdit: (role: Role) => void;
  onDelete: (roleId: string) => void;
  onRoleUpdate?: () => void;
  isUserContext?: boolean;
}

const RoleManager: React.FC<RoleManagerProps> = ({ selectedRole, onEdit, onDelete, onRoleUpdate, isUserContext = false }) => {
  const [masterData, setMasterData] = useState<any>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [selectedNextSteps, setSelectedNextSteps] = useState<string[]>([]);
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/master.json`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to load master data');
        }
        return response.json();
      })
      .then(data => {
        console.log('Master data loaded:', data);
        setMasterData(data);
      })
      .catch(error => {
        console.error('Error loading master data:', error);
        // Fallback to empty structure
        setMasterData({
          permissions: [],
          nextSteps: [],
          videos: []
        });
      });
  }, []);

  useEffect(() => {
    if (selectedRole && masterData) {
      setSelectedPermissions(selectedRole.permissions || []);
      setSelectedNextSteps(selectedRole.nextSteps || []);
      setSelectedVideos(selectedRole.videos || []);
      setHasChanges(false);
    }
  }, [selectedRole, masterData]);



  const handleSave = async () => {
    if (!selectedRole?._id) {
      toast.error('No role selected for update');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const updateData = {
        permissions: selectedPermissions,
        nextSteps: selectedNextSteps,
        videos: selectedVideos
      };
      
      const response = await fetch(`${API_BASE_URL}/api/roles/${selectedRole._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });
      
      if (response.ok) {
        toast.success('Role updated successfully!');
        setHasChanges(false);
        if (onRoleUpdate) onRoleUpdate();
      } else {
        const error = await response.json();
        toast.error(`Failed to save: ${error.message}`);
      }
    } catch (error) {
      toast.error('Network error: Failed to save changes');
    }
  };

  const handleEdit = () => {
    if (!selectedRole?._id) return;
    onEdit({ ...selectedRole, permissions: selectedPermissions } as Role);
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
                      setSelectedPermissions(selectedRole?.permissions || []);
                      setSelectedNextSteps(selectedRole?.nextSteps || []);
                      setSelectedVideos(selectedRole?.videos || []);
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

          {masterData?.permissions.map((module: Module) => (
            <div key={module.id} className="module-card">
              <div className="module-header">
                <span className="module-title">{module.displayName}</span>
              </div>
              <div className="permissions-list">
                {module.permissions.map((permission: Permission) => (
                  <div key={permission.id} className="permission-item">
                    <div className="permission-content">
                      <div className="permission-info">
                        <h4 className="permission-name">{permission.name}</h4>
                      </div>
                      <div className="permission-controls">
                        <label className="toggle-switch">
                          <input 
                            type="checkbox" 
                            checked={selectedPermissions.includes(permission.id)} 
                            onChange={() => {
                              const newPermissions = selectedPermissions.includes(permission.id)
                                ? selectedPermissions.filter(p => p !== permission.id)
                                : [...selectedPermissions, permission.id];
                              setSelectedPermissions(newPermissions);
                              setHasChanges(true);
                            }}
                          />
                          <span className="toggle-slider"></span>
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="next-steps-section">
            <h3 className="section-title">Next Steps</h3>
            <div className="next-steps-list">
              {masterData?.nextSteps.map((step: NextStep) => (
                <div key={step.id} className="next-step-item">
                  <div className="step-icon">
                    <i className={`fas fa-${step.icon}`}></i>
                  </div>
                  <div className="step-content">
                    <h4 className="step-title">{step.title}</h4>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={selectedNextSteps.includes(step.id)}
                    onChange={() => {
                      const newSteps = selectedNextSteps.includes(step.id)
                        ? selectedNextSteps.filter(s => s !== step.id)
                        : [...selectedNextSteps, step.id];
                      setSelectedNextSteps(newSteps);
                      setHasChanges(true);
                    }}
                    className="step-checkbox"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="videos-section">
            <h3 className="section-title">Videos</h3>
            <div className="videos-grid">
              {masterData?.videos.map((video: Video) => (
                <div key={video.id} className="video-card">
                  <div className="video-info">
                    <h4 className="video-title">{video.title}</h4>
                  </div>
                  <div className="video-controls">
                    <input 
                      type="checkbox" 
                      checked={selectedVideos.includes(video.id)}
                      onChange={() => {
                        const newVideos = selectedVideos.includes(video.id)
                          ? selectedVideos.filter(v => v !== video.id)
                          : [...selectedVideos, video.id];
                        setSelectedVideos(newVideos);
                        setHasChanges(true);
                      }}
                      className="video-checkbox"
                    />
                  </div>
                </div>
              ))}
            </div>
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
