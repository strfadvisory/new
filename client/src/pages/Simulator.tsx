import React, { useState } from 'react';
import { toast } from 'react-toastify';
import {
  useUserNextsteps,
  useUserVideos,
  useRoles,
  useInviteAdvisory
} from '../hooks/queries';

const Simulator: React.FC = () => {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteData, setInviteData] = useState({
    selectedRole: '',
    firstName: '',
    lastName: '',
    adminEmail: '',
    designation: ''
  });
  const [user, setUser] = useState<any>(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [currentVideo, setCurrentVideo] = useState<any>(null);

  // React Query hooks
  const { data: nextStepsData } = useUserNextsteps();
  const { data: videosData } = useUserVideos();
  const { data: rolesData } = useRoles();
  const inviteMutation = useInviteAdvisory();

  // Extract data from API responses
  const nextSteps = nextStepsData?.nextSteps || [];
  const videos = videosData?.videos || [];
  const childRoles = rolesData?.filter((role: any) => role.type === 'User') || [];

  React.useEffect(() => {
    // Get user from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteLoading(true);
    try {
      await inviteMutation.mutateAsync(inviteData);
      toast.success('Invitation sent successfully!');
      setShowInviteModal(false);
      setInviteData({ selectedRole: '', firstName: '', lastName: '', adminEmail: '', designation: '' });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send invitation');
    } finally {
      setInviteLoading(false);
    }
  };

  return (
    <div className="fluid-content" style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 0' }}>
 
      <div style={{ marginBottom: '40px' }}> 
        <h1 style={{ fontSize: '32px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>Welcome, {user?.firstName}</h1>
        <p style={{ fontSize: '16px', color: '#6b7280' }}>Choose your Company type you like to signup aw</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '60px' }}>
        {videos.length > 0 ? videos.map((video, index) => (
          <div key={index} style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div 
              style={{ background: '#f3f4f6', borderRadius: '8px', height: '180px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundImage: `url(${video.image})`, backgroundSize: 'cover', backgroundPosition: 'center', cursor: 'pointer' }}
              onClick={() => {
                setCurrentVideo(video);
                setShowVideoModal(true);
              }}
            >
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
        <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1f2937', marginBottom: '24px' }}>Choose Next Step</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {nextSteps.length > 0 ? nextSteps.map((step, index) => (
            <div 
              key={index} 
              className="step-card"
              onClick={() => {
                if (step.title === 'Invite Advisory') {
                  setShowInviteModal(true);
                }
              }}
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '24px', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}
            >
              <div style={{ width: '48px', height: '48px', background: '#f3f4f6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className={`fas fa-${step.icon}`} style={{ fontSize: '24px', color: '#1f2937' }}></i>
              </div>
              <div style={{ flex: 1, marginLeft: '20px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>{step.title}</h3>
                <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>{step.description}</p>
              </div>
              <i className="fas fa-chevron-right" style={{ fontSize: '20px', color: '#9ca3af' }}></i>
            </div>
          )) : (
            <p style={{ color: '#6b7280', textAlign: 'center', padding: '20px' }}>No next steps available</p>
          )}
        </div>
      </div>

      {showInviteModal && (
        <>
          <div className="modal-overlay" onClick={() => setShowInviteModal(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000 }}></div>
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'white', borderRadius: '12px', padding: '24px', width: '90%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', zIndex: 1001 }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px' }}> Invite Member </h2>
            <form onSubmit={handleInviteSubmit}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Select Role</h3>
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

export default Simulator;
