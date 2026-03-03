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

const RoleManager: React.FC<RoleManagerProps> = ({ selectedRole, onEdit, onDelete, onRoleUpdate, isUserContext = false }) => {
  const [masterData, setMasterData] = useState<any>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [selectedNextSteps, setSelectedNextSteps] = useState<string[]>([]);
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(`${API_BASE_URL}/api/master`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
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
          
          <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '32px' }}>
            {selectedRole.description || 'Configure permissions and settings for this role'}
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
            <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1f2937', marginBottom: '24px' }}>Next Steps</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {masterData?.nextSteps.length > 0 ? masterData.nextSteps.map((step: NextStep) => (
                <div 
                  key={step.id} 
                  style={{ display: 'flex', alignItems: 'center', padding: '24px', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}
                >
                  <div style={{ width: '48px', height: '48px', background: '#f3f4f6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className={`fas fa-${step.icon}`} style={{ fontSize: '24px', color: '#1f2937' }}></i>
                  </div>
                  <div style={{ flex: 1, marginLeft: '20px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>{step.title}</h3>
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
                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                  />
                </div>
              )) : (
                <p style={{ color: '#6b7280', textAlign: 'center', padding: '20px' }}>No next steps available</p>
              )}
            </div>
          </div>

          <div className="videos-section">
            <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1f2937', marginBottom: '24px' }}>Videos</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '60px' }}>
              {masterData?.videos.length > 0 ? masterData.videos.map((video: Video) => (
                <div key={video._id} style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' }}>
                  <div 
                    style={{ background: '#f3f4f6', borderRadius: '8px', height: '180px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundImage: video.thumbnail ? `url(${video.thumbnail})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center', cursor: 'pointer' }}
                    onClick={() => {
                      setCurrentVideo(video);
                      setShowVideoModal(true);
                    }}
                  >
                    <div style={{ width: '60px', height: '60px', background: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <i className="fas fa-play" style={{ color: 'white', fontSize: '24px' }}></i>
                    </div>
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: '500', color: '#1f2937', marginBottom: '8px' }}>{video.title}</h3>
                  <p style={{ fontSize: '14px', color: '#6b7280', margin: '8px 0 16px 0' }}>{video.description}</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid #e5e7eb' }}>
                    <span style={{ fontSize: '13px', color: '#6b7280' }}>Include in role</span>
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
                      style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                    />
                  </div>
                </div>
              )) : (
                <p style={{ color: '#6b7280', textAlign: 'center', padding: '20px', gridColumn: '1 / -1' }}>No videos available</p>
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
