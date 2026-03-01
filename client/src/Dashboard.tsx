import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import './Dashboard.css';
import { API_BASE_URL } from './config';

interface DashboardProps {
  user: any;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [nextSteps, setNextSteps] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [nextStepsExpanded, setNextStepsExpanded] = useState(true);
  const [videosExpanded, setVideosExpanded] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteTitle, setInviteTitle] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteData, setInviteData] = useState({
    selectedRole: '',
    firstName: '',
    lastName: '',
    adminEmail: '',
    designation: ''
  });
  const [childRoles, setChildRoles] = useState<any[]>([]);

  useEffect(() => {
    const fetchNextSteps = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/roles/user-nextsteps`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (response.ok) {
          setNextSteps(data.nextSteps || []);
        }
      } catch (error) {
        console.error('Error fetching next steps:', error);
      }
    };

    const fetchVideos = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/roles/user-videos`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (response.ok) {
          setVideos(data.videos || []);
        }
      } catch (error) {
        console.error('Error fetching videos:', error);
      }
    };

    const fetchChildRoles = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/roles/child-roles`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (response.ok) {
          setChildRoles(data.childRoles || []);
        }
      } catch (error) {
        console.error('Error fetching child roles:', error);
      }
    };

    fetchNextSteps();
    fetchVideos();
    fetchChildRoles();
  }, []);

  const toggleNextStep = async (index: number) => {
    const updatedSteps = nextSteps.map((step, i) => 
      i === index ? { ...step, completed: !step.completed } : step
    );
    setNextSteps(updatedSteps);
    
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE_URL}/api/roles/user-nextstep`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          stepIndex: index,
          completed: !nextSteps[index].completed
        })
      });
    } catch (error) {
      console.error('Error updating next step:', error);
      setNextSteps(nextSteps);
    }
  };

  const getCompletionPercentage = () => {
    if (nextSteps.length === 0) return 0;
    const completed = nextSteps.filter(step => step.completed).length;
    return Math.round((completed / nextSteps.length) * 100);
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/auth/invite-advisory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(inviteData)
      });
      const data = await response.json();
      if (response.ok) {
        toast.success('Invitation sent successfully!');
        setShowInviteModal(false);
        setInviteData({ selectedRole: '', firstName: '', lastName: '', adminEmail: '', designation: '' });
      } else {
        toast.error(data.message || 'Failed to send invitation');
      }
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast.error('Failed to send invitation');
    } finally {
      setInviteLoading(false);
    }
  };

  return (
    <div className="fluid-content" style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 20px' }}>
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>Welcome, {user?.firstName}</h1>
        <p style={{ fontSize: '16px', color: '#6b7280' }}>Choose your Company type you like to signup</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        {videos.length > 0 ? videos.slice(0, 3).map((video, index) => (
          <div key={index} style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ background: '#f3f4f6', borderRadius: '8px', height: '180px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundImage: `url(${video.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
              <div style={{ width: '60px', height: '60px', background: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="fas fa-play" style={{ color: 'white', fontSize: '24px' }}></i>
              </div>
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: '500', color: '#1f2937' }}>{video.title}</h3>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: '8px 0 0 0' }}>{video.description}</p>
          </div>
        )) : (
          <p style={{ color: '#6b7280', textAlign: 'center', padding: '20px' }}>No videos available</p>
        )}
      </div>

      <div>
        <div style={{ marginBottom: '16px', padding: '16px', border: '1px solid #e5e7eb', borderRadius: '8px', background: 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: nextStepsExpanded ? '16px' : '0' }}>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: '0 0 4px 0' }}>Next Steps</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ background: '#f3f4f6', borderRadius: '8px', height: '8px', width: '200px', overflow: 'hidden' }}>
                  <div style={{ background: '#3b82f6', height: '100%', width: `${getCompletionPercentage()}%`, transition: 'width 0.3s ease' }}></div>
                </div>
                <span style={{ fontSize: '14px', color: '#6b7280' }}>{getCompletionPercentage()}% Complete</span>
              </div>
            </div>
            <i 
              className={`fas fa-${nextStepsExpanded ? 'minus' : 'plus'}`} 
              style={{ fontSize: '14px', color: '#6b7280', cursor: 'pointer' }}
              onClick={() => setNextStepsExpanded(!nextStepsExpanded)}
            ></i>
          </div>
          {nextStepsExpanded && (
            <div style={{ paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
              {nextSteps.length > 0 ? nextSteps.map((step, index) => (
                <div key={index} style={{ marginBottom: '12px', padding: '16px', border: '1px solid #f3f4f6', borderRadius: '8px', background: '#fafafa', display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                  <div style={{ width: '48px', height: '48px', background: step.completed ? '#dcfce7' : '#eff6ff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <i className={`fas fa-${step.icon}`} style={{ fontSize: '20px', color: step.completed ? '#22c55e' : '#3b82f6' }}></i>
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: '600', color: '#1f2937', textDecoration: step.completed ? 'line-through' : 'none' }}>{step.title}</h4>
                    <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>{step.description}</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={step.completed} 
                    onChange={() => toggleNextStep(index)}
                    style={{ width: '20px', height: '20px', cursor: 'pointer', marginTop: '4px' }}
                  />
                </div>
              )) : (
                <div style={{ padding: '32px', border: '2px dashed #d1d5db', borderRadius: '8px', textAlign: 'center', background: '#f9fafb' }}>
                  <p style={{ fontSize: '16px', color: '#6b7280', margin: 0 }}>No next steps assigned</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div style={{ marginBottom: '16px', padding: '16px', border: '1px solid #e5e7eb', borderRadius: '8px', background: 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: videosExpanded ? '16px' : '0' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: 0 }}>Training Videos</h2>
            <i 
              className={`fas fa-${videosExpanded ? 'minus' : 'plus'}`} 
              style={{ fontSize: '14px', color: '#6b7280', cursor: 'pointer' }}
              onClick={() => setVideosExpanded(!videosExpanded)}
            ></i>
          </div>
          {videosExpanded && (
            <div style={{ paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
              {videos.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                  {videos.map((video, index) => (
                    <div key={index} style={{ background: '#fafafa', borderRadius: '8px', padding: '16px', border: '1px solid #f3f4f6' }}>
                      <div style={{ background: '#f3f4f6', borderRadius: '6px', height: '160px', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundImage: `url(${video.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                        <div style={{ width: '50px', height: '50px', background: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <i className="fas fa-play" style={{ color: 'white', fontSize: '20px' }}></i>
                        </div>
                      </div>
                      <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937', margin: '0 0 4px 0' }}>{video.title}</h3>
                      <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>{video.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '32px', border: '2px dashed #d1d5db', borderRadius: '8px', textAlign: 'center', background: '#f9fafb' }}>
                  <p style={{ fontSize: '16px', color: '#6b7280', margin: 0 }}>No videos available</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showInviteModal && (
        <>
          <div className="modal-overlay" onClick={() => setShowInviteModal(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000 }}></div>
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'white', borderRadius: '12px', padding: '24px', width: '90%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', zIndex: 1001 }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px' }}> Invite Member 
              {/* {inviteTitle} */}
              </h2>
            <form onSubmit={handleInviteSubmit}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Invite Super Admin</h3>
              <select value={inviteData.selectedRole} onChange={(e) => setInviteData({...inviteData, selectedRole: e.target.value})} required style={{ width: '100%', padding: '10px', marginBottom: '12px', border: '1px solid #e5e7eb', borderRadius: '6px' }}>
                <option value="">Select Role</option>
                {childRoles.map((role) => (
                  <option key={role._id} value={role._id}>{role.name}</option>
                ))}
              </select>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <input type="text" placeholder="First Name" value={inviteData.firstName} onChange={(e) => setInviteData({...inviteData, firstName: e.target.value})} required style={{ padding: '10px', border: '1px solid #e5e7eb', borderRadius: '6px' }} />
                <input type="text" placeholder="Last Name" value={inviteData.lastName} onChange={(e) => setInviteData({...inviteData, lastName: e.target.value})} required style={{ padding: '10px', border: '1px solid #e5e7eb', borderRadius: '6px' }} />
              </div>
              <input type="email" placeholder="Email Address" value={inviteData.adminEmail} onChange={(e) => setInviteData({...inviteData, adminEmail: e.target.value})} required style={{ width: '100%', padding: '10px', marginBottom: '12px', border: '1px solid #e5e7eb', borderRadius: '6px' }} />
              <input type="text" placeholder="Designation" value={inviteData.designation} onChange={(e) => setInviteData({...inviteData, designation: e.target.value})} required style={{ width: '100%', padding: '10px', marginBottom: '20px', border: '1px solid #e5e7eb', borderRadius: '6px' }} />
              <button type="submit" disabled={inviteLoading} style={{ width: '100%', padding: '12px', background: inviteLoading ? '#9ca3af' : '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', fontSize: '16px', fontWeight: '600', cursor: inviteLoading ? 'not-allowed' : 'pointer' }}>
                {inviteLoading ? <><i className="fas fa-spinner fa-spin"></i> Sending...</> : 'Invite'}
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;