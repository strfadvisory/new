import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useLocation } from 'react-router-dom';
import SuperAdminDashboard from './superadmin/SuperAdminDashboard';
import {
  useUserNextsteps,
  useUserVideos,
  useRoles,
  useInviteAdvisory
} from '../hooks/queries';

const Simulator: React.FC = () => {
  const location = useLocation();
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

  // Reset component state when route changes to simulator-management
  React.useEffect(() => {
    if (location.pathname === '/dashboard/simulator-management') {
      console.log('[Simulator] Route changed to simulator-management, resetting state');
      // Reset all modal states
      setShowInviteModal(false);
      setShowVideoModal(false);
      setCurrentVideo(null);
      setInviteData({
        selectedRole: '',
        firstName: '',
        lastName: '',
        adminEmail: '',
        designation: ''
      });
      setInviteLoading(false);
    }
  }, [location.pathname]);

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
      <SuperAdminDashboard />
 
 

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
