import React, { useState, useEffect } from 'react';
import './Dashboard.css';

interface DashboardProps {
  user: any;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [nextSteps, setNextSteps] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteTitle, setInviteTitle] = useState('');
  const [inviteData, setInviteData] = useState({
    firstName: '',
    lastName: '',
    adminEmail: '',
    designation: ''
  });

  useEffect(() => {
    const fetchNextSteps = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/roles/user-nextsteps', {
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
        const response = await fetch('http://localhost:5000/api/roles/user-videos', {
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

    fetchNextSteps();
    fetchVideos();
  }, []);

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/auth/invite-association', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(inviteData)
      });
      if (response.ok) {
        alert('Invitation sent successfully!');
        setShowInviteModal(false);
        setInviteData({ firstName: '', lastName: '', adminEmail: '', designation: '' });
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to send invitation');
      }
    } catch (error) {
      console.error('Error sending invitation:', error);
      alert('Failed to send invitation');
    }
  };

  return (
    <div className="fluid-content" style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 20px' }}>
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>Welcome, {user?.firstName}</h1>
        <p style={{ fontSize: '16px', color: '#6b7280' }}>Choose your Company type you like to signup</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '60px' }}>
        {videos.length > 0 ? videos.map((video, index) => (
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
        <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1f2937', marginBottom: '24px' }}>Choose Next Step</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {nextSteps.length > 0 ? nextSteps.map((step, index) => (
            <div 
              key={index} 
              className="step-card"
              onClick={() => {
                if (step.title === 'Invite Advisory') {
                  setInviteTitle(step.title);
                  setShowInviteModal(true);
                }
              }}
              style={{ cursor: 'pointer' }}
            >
              <div style={{ width: '48px', height: '48px', background: '#f3f4f6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className={`fas fa-${step.icon}`} style={{ fontSize: '24px', color: '#1f2937' }}></i>
              </div>
              <div style={{ flex: 1 }}>
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
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px' }}>{inviteTitle}</h2>
            <form onSubmit={handleInviteSubmit}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Invite Super Admin</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <input type="text" placeholder="First Name" value={inviteData.firstName} onChange={(e) => setInviteData({...inviteData, firstName: e.target.value})} required style={{ padding: '10px', border: '1px solid #e5e7eb', borderRadius: '6px' }} />
                <input type="text" placeholder="Last Name" value={inviteData.lastName} onChange={(e) => setInviteData({...inviteData, lastName: e.target.value})} required style={{ padding: '10px', border: '1px solid #e5e7eb', borderRadius: '6px' }} />
              </div>
              <input type="email" placeholder="Email Address" value={inviteData.adminEmail} onChange={(e) => setInviteData({...inviteData, adminEmail: e.target.value})} required style={{ width: '100%', padding: '10px', marginBottom: '12px', border: '1px solid #e5e7eb', borderRadius: '6px' }} />
              <input type="text" placeholder="Designation" value={inviteData.designation} onChange={(e) => setInviteData({...inviteData, designation: e.target.value})} required style={{ width: '100%', padding: '10px', marginBottom: '20px', border: '1px solid #e5e7eb', borderRadius: '6px' }} />
              <button type="submit" style={{ width: '100%', padding: '12px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}>Invite</button>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;