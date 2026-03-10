import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { useMaster } from '../../hooks/queries/useMaster';
import { useUpdateRole } from '../../hooks/queries/useRoles';
import './RoleManager.css';

interface Role {
  _id: string;
  name: string;
  description: string;
  icon: string;
  type: 'Master' | 'User';
  status: boolean;
  permissions: any[];
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
  canEdit: boolean;
  canView: boolean;
  limit: string;
}

interface Permission {
  id: string;
  code: string;
  name: string;
  moduleId: string;
  canEdit: boolean;
  limit: string;
}

interface NextStep {
  id: string;
  title: string;
  icon: string;
  permissionIds: string[];
}

interface Video {
  _id: string;
  title: string;
  description: string;
  thumbnail: string;
  videoUrl: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface RoleManagerProps {
  selectedRole: Role | null;
  onEdit: (role: Role) => void;
  onDelete: (roleId: string) => void;
  onRoleUpdate?: () => void;
  isUserContext?: boolean;
}

interface ModulePermission {
  moduleId: string;
  canView: boolean;
  canEdit: boolean;
  limit: string;
}

const RoleManager: React.FC<RoleManagerProps> = ({ selectedRole, onEdit, onDelete, onRoleUpdate, isUserContext = false }) => {
  const [hasChanges, setHasChanges] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [modulePermissions, setModulePermissions] = useState<ModulePermission[]>([]);
  const [selectedNextSteps, setSelectedNextSteps] = useState<string[]>([]);
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [accordionState, setAccordionState] = useState<{
    permissions: { [key: string]: boolean }
  }>({
    permissions: {}
  });
  const dropdownRef = useRef<HTMLDivElement>(null);

  // React Query hooks
  const { data: masterData } = useMaster();
  const updateRoleMutation = useUpdateRole();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);



  useEffect(() => {
    if (selectedRole && masterData) {
      setSelectedPermissions(selectedRole.permissions || []);
      setSelectedNextSteps(selectedRole.nextSteps || []);
      setSelectedVideos(selectedRole.videos || []);
      
      // Initialize module permissions from role's permissions array
      const moduleKeys = ['SIMULATOR_MANAGEMENT', 'ROLE_MANAGEMENT', 'USER_MANAGEMENT', 'ASSOCIATION_CONTROL'];
      const initialModulePermissions = moduleKeys.map(key => {
        // Find existing permission for this module
        const existingPermission = selectedRole.permissions?.find((p: any) => 
          (typeof p === 'string' ? p : p.permissionId) === key
        );
        
        if (existingPermission && typeof existingPermission === 'object') {
          return {
            moduleId: key,
            canView: true, // If permission exists, assume can view
            canEdit: existingPermission.canEdit || false,
            limit: existingPermission.limit || ''
          };
        } else if (existingPermission && typeof existingPermission === 'string') {
          return {
            moduleId: key,
            canView: true,
            canEdit: true, // Default for old string format
            limit: ''
          };
        }
        
        return {
          moduleId: key,
          canView: false,
          canEdit: false,
          limit: ''
        };
      });
      setModulePermissions(initialModulePermissions);
      setHasChanges(false);
    }
  }, [selectedRole, masterData]);

  const isPermissionSelected = (permissionId: string) => {
    return selectedPermissions.includes(permissionId);
  };

  const updateModulePermission = (moduleId: string, field: 'canView' | 'canEdit' | 'limit', value: boolean | string) => {
    setModulePermissions(prev => 
      prev.map(mp => 
        mp.moduleId === moduleId 
          ? { ...mp, [field]: value }
          : mp
      )
    );
    setHasChanges(true);
  };

  const getModulePermission = (moduleId: string) => {
    return modulePermissions.find(mp => mp.moduleId === moduleId) || {
      moduleId,
      canView: false,
      canEdit: false,
      limit: ''
    };
  };



  const handleSave = async () => {
    if (!selectedRole?._id) {
      toast.error('No role selected for update');
      return;
    }

    try {
      // Convert modulePermissions to the format expected by backend
      const formattedPermissions = modulePermissions
        .filter(mp => mp.canView || mp.canEdit) // Only include modules with at least one permission
        .map(mp => ({
          permissionId: mp.moduleId,
          canEdit: mp.canEdit,
          limit: mp.limit
        }));
      
      const updateData = {
        permissions: formattedPermissions,
        nextSteps: selectedNextSteps,
        videos: selectedVideos
      };
      
      await updateRoleMutation.mutateAsync({
        roleId: selectedRole._id,
        roleData: updateData as any
      });
      
      toast.success('Role updated successfully!');
      setHasChanges(false);
      if (onRoleUpdate) onRoleUpdate();
    } catch (error: any) {
      toast.error(`Failed to save: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleEdit = () => {
    if (!selectedRole?._id) return;
    onEdit({ ...selectedRole, permissions: selectedPermissions } as Role);
    setDropdownOpen(false);
  };

  const handleDelete = () => {
    if (!selectedRole?._id) return;
    onDelete(selectedRole._id);
    setDropdownOpen(false);
  };

  return (
    <div className="fluid-content" style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 0' }}>
      {selectedRole ? (
        <>
          <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div className="role-info">
              <h1 style={{ fontSize: '32px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>Role Management - {selectedRole.name}</h1>
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
                      // Reset module permissions from role data
                      const moduleKeys = ['SIMULATOR_MANAGEMENT', 'ROLE_MANAGEMENT', 'USER_MANAGEMENT', 'ASSOCIATION_CONTROL'];
                      const resetModulePermissions = moduleKeys.map(key => {
                        const existingPermission = selectedRole?.permissions?.find((p: any) => 
                          (typeof p === 'string' ? p : p.permissionId) === key
                        );
                        
                        if (existingPermission && typeof existingPermission === 'object') {
                          return {
                            moduleId: key,
                            canView: true,
                            canEdit: existingPermission.canEdit || false,
                            limit: existingPermission.limit || ''
                          };
                        } else if (existingPermission && typeof existingPermission === 'string') {
                          return {
                            moduleId: key,
                            canView: true,
                            canEdit: true,
                            limit: ''
                          };
                        }
                        
                        return {
                          moduleId: key,
                          canView: false,
                          canEdit: false,
                          limit: ''
                        };
                      });
                      setModulePermissions(resetModulePermissions);
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
                <div className="custom-dropdown" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="dropdown-btn"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="1"/>
                      <circle cx="12" cy="5" r="1"/>
                      <circle cx="12" cy="19" r="1"/>
                    </svg>
                  </button>
                  {dropdownOpen && (
                    <div className="dropdown-content">
                      <button onClick={handleEdit} className="dropdown-option">
                        Edit Role
                      </button>
                      <button onClick={handleDelete} className="dropdown-option danger">
                        Delete Role
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '32px' }}>
            {selectedRole.description || 'Configure permissions and settings for this role'}
          </p>

          <div className="accordion-container">
            {/* Show only the 4 modules */}
            {masterData?.modules.filter((module: Module) => 
              ['SIMULATOR_MANAGEMENT', 'ROLE_MANAGEMENT', 'USER_MANAGEMENT', 'ASSOCIATION_CONTROL'].includes(module.key)
            ).map((module: Module) => (
              <div key={module.id} className="accordion-panel">
                <div 
                  className={`accordion-header ${(accordionState.permissions as any)[module.id] ? 'active' : ''}`}
                  onClick={() => setAccordionState(prev => ({ 
                    ...prev, 
                    permissions: { 
                      ...prev.permissions, 
                      [module.id]: !(prev.permissions as any)[module.id] 
                    } 
                  }))}
                >
                  <div className="accordion-title">
                    <span>{module.displayName}</span>
                  </div>
                  <i className={`fas fa-chevron-down accordion-icon`}></i>
                </div>
                {(accordionState.permissions as any)[module.id] && (
                  <div className="accordion-content">
                    <div className="permissions-list">
                      <div className="permission-item">
                        <div className="permission-settings">
                          <div>
                            <label>
                              <input 
                                type="checkbox" 
                                checked={getModulePermission(module.key).canView}
                                onChange={(e) => updateModulePermission(module.key, 'canView', e.target.checked)}
                              />
                              <span>Can View</span>
                            </label>
                            <label>
                              <input 
                                type="checkbox" 
                                checked={getModulePermission(module.key).canEdit}
                                onChange={(e) => updateModulePermission(module.key, 'canEdit', e.target.checked)}
                              />
                              <span>Can Edit</span>
                            </label>
                            <div className="limit-input">
                              <label>Access Limit</label>
                              <input 
                                type="text"
                                placeholder="Enter limit (optional)"
                                value={getModulePermission(module.key).limit}
                                onChange={(e) => updateModulePermission(module.key, 'limit', e.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="next-steps-section" style={{ marginTop: '40px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1f2937', marginBottom: '24px' }}>Next Steps</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {masterData?.nextSteps.length > 0 ? masterData.nextSteps.map((step: NextStep) => (
                <div 
                  key={step.id} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    padding: '24px', 
                    backgroundColor: 'white', 
                    borderRadius: '12px', 
                    border: '1px solid #e2e8f0', 
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
                    e.currentTarget.style.borderColor = '#cbd5e1';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)';
                    e.currentTarget.style.borderColor = '#e2e8f0';
                  }}
                >
                  <div style={{ 
                    width: '48px', 
                    height: '48px', 
                    background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', 
                    borderRadius: '12px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    border: '1px solid #bfdbfe'
                  }}>
                    <i className={`fas fa-${step.icon}`} style={{ fontSize: '20px', color: '#0e519b' }}></i>
                  </div>
                  <div style={{ flex: 1, marginLeft: '20px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>{step.title}</h3>
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
                    style={{ 
                      width: '20px', 
                      height: '20px', 
                      cursor: 'pointer',
                      accentColor: '#0e519b'
                    }}
                  />
                </div>
              )) : (
                <div style={{ 
                  padding: '40px', 
                  textAlign: 'center', 
                  border: '2px dashed #d1d5db', 
                  borderRadius: '12px', 
                  background: '#f9fafb' 
                }}>
                  <p style={{ color: '#6b7280', margin: 0, fontSize: '16px' }}>No next steps available</p>
                </div>
              )}
            </div>
          </div>

          <div className="videos-section" style={{ marginTop: '40px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1f2937', marginBottom: '24px' }}>Videos</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {masterData?.videos.length > 0 ? masterData.videos.map((video: Video) => (
                <div 
                  key={video._id} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    padding: '24px', 
                    backgroundColor: 'white', 
                    borderRadius: '12px', 
                    border: '1px solid #e2e8f0', 
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
                    e.currentTarget.style.borderColor = '#cbd5e1';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)';
                    e.currentTarget.style.borderColor = '#e2e8f0';
                  }}
                >
                  <div 
                    style={{ 
                      width: '48px', 
                      height: '48px', 
                      background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', 
                      borderRadius: '12px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      cursor: 'pointer',
                      border: '1px solid #bfdbfe',
                      transition: 'all 0.2s ease'
                    }}
                    onClick={() => {
                      setCurrentVideo(video);
                      setShowVideoModal(true);
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)';
                      e.currentTarget.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    <i className="fas fa-play" style={{ fontSize: '20px', color: '#0e519b' }}></i>
                  </div>
                  <div style={{ flex: 1, marginLeft: '20px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>{video.title}</h3>
                    <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>{video.description}</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={selectedVideos.includes(video._id)}
                    onChange={() => {
                      const newVideos = selectedVideos.includes(video._id)
                        ? selectedVideos.filter(v => v !== video._id)
                        : [...selectedVideos, video._id];
                      setSelectedVideos(newVideos);
                      setHasChanges(true);
                    }}
                    style={{ 
                      width: '20px', 
                      height: '20px', 
                      cursor: 'pointer',
                      accentColor: '#0e519b'
                    }}
                  />
                </div>
              )) : (
                <div style={{ 
                  padding: '40px', 
                  textAlign: 'center', 
                  border: '2px dashed #d1d5db', 
                  borderRadius: '12px', 
                  background: '#f9fafb' 
                }}>
                  <p style={{ color: '#6b7280', margin: 0, fontSize: '16px' }}>No videos available</p>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="no-selection">
          <h3>Select a role to manage permissions</h3>
          <p>Choose a role from the sidebar to configure its permissions and settings.</p>
        </div>
      )}

      {showVideoModal && currentVideo && (
        <>
          <div 
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000 }}
            onClick={() => setShowVideoModal(false)}
          ></div>
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'white', borderRadius: '12px', padding: '20px', width: '80vw', height: '80vh', maxWidth: '900px', maxHeight: '600px', zIndex: 1001, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>{currentVideo.title}</h3>
              <button 
                onClick={() => setShowVideoModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#6b7280' }}
              >
                ×
              </button>
            </div>
            <video 
              controls 
              autoPlay
              style={{ width: '100%', height: 'calc(100% - 60px)', borderRadius: '8px', objectFit: 'contain' }}
              src={currentVideo.videoUrl}
            >
              Your browser does not support the video tag.
            </video>
            {currentVideo.description && (
              <p style={{ marginTop: '12px', fontSize: '14px', color: '#6b7280' }}>{currentVideo.description}</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default RoleManager;
