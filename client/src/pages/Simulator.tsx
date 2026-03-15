import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import SuperAdminDashboard from './superadmin/SuperAdminDashboard';
import AddAssociationPopup from '../components/AddAssociationPopup';
import InviteMemberModal from '../components/InviteMemberModal';
import SimulatorStateManager from '../utils/simulatorStateManager';
import {
  useUserNextsteps,
  useUserVideos
} from '../hooks/queries';

const Simulator: React.FC = () => {
  const location = useLocation();
  const [showCreateAssociationModal, setShowCreateAssociationModal] = useState(false);
  const [showInviteMemberModal, setShowInviteMemberModal] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [currentVideo, setCurrentVideo] = useState<any>(null);

  // React Query hooks
  const { data: nextStepsData } = useUserNextsteps();
  const { data: videosData } = useUserVideos();

  // Extract data from API responses
  const nextSteps = nextStepsData?.nextSteps || [];
  const videos = videosData?.videos || [];

  React.useEffect(() => {
    // Get user from sessionStorage
    const userData = sessionStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  // Reset component state when route changes to simulator-management
  React.useEffect(() => {
    if (location.pathname === '/dashboard/simulator-management') {
      console.log('[Simulator] Route changed to simulator-management, resetting state');
      // Reset all modal states
      setShowVideoModal(false);
      setCurrentVideo(null);
    }
  }, [location.pathname]);

  const handleAssociationSuccess = () => {
    console.log('Association created successfully');
  };

  const handleCreateAssociationClick = () => {
    setShowCreateAssociationModal(true);
  };

  const handleInviteMemberClick = () => {
    setShowInviteMemberModal(true);
  };

  // Show calculator placeholder for regular users, SuperAdminDashboard for super admins
  const renderContent = () => {
    if (user?.isSuperAdmin) {
      return <SuperAdminDashboard />;
    }
    
    // For regular users, show a placeholder that explains they need to select association and reserve study
    const stateManager = SimulatorStateManager.getInstance();
    const currentState = stateManager.getState();
    
 return (
    <div style={{  minHeight: '100vh', padding: '40px 20px' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        {/* Main Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ 
            fontSize: '28px', 
            fontWeight: '400', 
            color: '#2f2f2f', 
            lineHeight: '1.4',
            margin: '0 0 20px 0'
          }}>
            Choose an Association and Model to access and view the Simulator.
          </h1>
        </div>

 <div> <img src='/simu.png' />  </div>

        {/* Or Other Action */}
        <div style={{ 
          textAlign: 'center', 
          margin: '40px 0',
          position: 'relative'
        }}>
          <div style={{
            height: '1px',
            background: '#e6e6e6',
            position: 'absolute',
            top: '50%',
            left: '0',
            right: '0'
          }} />
          <span style={{
            background: 'white',
            padding: '0 20px',
            color: '#6b7280',
            fontSize: '14px',
            position: 'relative'
          }}>Or Other Action</span>
        </div>

        {/* Action Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Invite New Associations */}
          <div 
            onClick={handleCreateAssociationClick}
            style={{
              background: 'white',
              border: '1px solid #e6e6e6',
              borderRadius: '10px',
              padding: '24px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '20px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}>
            <div style={{
              width: '48px',
              height: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.5">
                <path d="M3 21h18M5 21V7l8-4v18M13 9h4v12M17 9v12"/>
                <path d="M9 9v12M9 12h4M9 15h4"/>
              </svg>
            </div>
            <div>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#1f2937',
                margin: '0 0 8px 0'
              }}>Create an Associations</h3>
              <p style={{
                fontSize: '14px',
                color: '#6b7280',
                margin: '0',
                lineHeight: '1.5'
              }}>Add a new association and manage, control, and analyze reserve study planning.</p>
            </div>
          </div>

          {/* Add New Members */}
          <div 
            onClick={handleInviteMemberClick}
            style={{
              background: 'white',
              border: '1px solid #e6e6e6',
              borderRadius: '10px',
              padding: '24px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '20px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}>
            <div style={{
              width: '48px',
              height: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.5">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <line x1="19" y1="8" x2="19" y2="14"/>
                <line x1="22" y1="11" x2="16" y2="11"/>
              </svg>
            </div>
            <div>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#1f2937',
                margin: '0 0 8px 0'
              }}>Add New Members</h3>
              <p style={{
                fontSize: '14px',
                color: '#6b7280',
                margin: '0',
                lineHeight: '1.5'
              }}>Assign managers who can manage the association and handle reserve study data and research.</p>
            </div>
          </div>
        </div>

        {/* Add Association Popup */}
        <AddAssociationPopup
          isOpen={showCreateAssociationModal}
          onClose={() => setShowCreateAssociationModal(false)}
          onSuccess={handleAssociationSuccess}
        />

        {/* Invite Member Modal */}
        <InviteMemberModal
          isOpen={showInviteMemberModal}
          onClose={() => setShowInviteMemberModal(false)}
          title="Add New Member"
        />
      </div>
    </div>
  );
  };

  return (
    <div className="fluid-content" style={{   margin: '0 auto', padding: '40px 0' }}>
      {renderContent()}

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
