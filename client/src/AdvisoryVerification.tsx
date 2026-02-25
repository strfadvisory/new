import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { API_BASE_URL } from './config';

const AdvisoryVerification: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    description: '',
    phone: '',
    email: '',
    contactPerson: '',
    linkedinUrl: '',
    websiteLink: '',
    zipCode: '',
    state: '',
    city: '',
    address1: '',
    address2: '',
    password: ''
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/verify-advisory/${token}`);
        const data = await response.json();
        if (response.ok) {
          setFormData(prev => ({
            ...prev,
            email: data.email,
            companyName: data.companyName
          }));
        } else {
          toast.error(data.message || 'Invalid verification link');
          navigate('/login');
        }
      } catch (error) {
        toast.error('Failed to verify link');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [token, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/complete-advisory-profile/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        toast.success('Profile completed successfully!');
        navigate('/dashboard');
      } else {
        toast.error(data.message || 'Failed to complete profile');
      }
    } catch (error) {
      toast.error('Failed to submit profile');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '24px', background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
      <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '24px' }}>Complete Your Profile</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Company Name" value={formData.companyName} onChange={(e) => setFormData({...formData, companyName: e.target.value})} required style={{ width: '100%', padding: '12px', marginBottom: '16px', border: '1px solid #e5e7eb', borderRadius: '6px' }} disabled />
        <textarea placeholder="Description" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} style={{ width: '100%', padding: '12px', marginBottom: '16px', border: '1px solid #e5e7eb', borderRadius: '6px', minHeight: '80px' }} />
        <input type="tel" placeholder="Phone" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} required style={{ width: '100%', padding: '12px', marginBottom: '16px', border: '1px solid #e5e7eb', borderRadius: '6px' }} />
        <input type="password" placeholder="Password *" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required style={{ width: '100%', padding: '12px', marginBottom: '16px', border: '1px solid #e5e7eb', borderRadius: '6px' }} />
        <input type="email" placeholder="Company Email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required style={{ width: '100%', padding: '12px', marginBottom: '16px', border: '1px solid #e5e7eb', borderRadius: '6px' }} disabled />
        <input type="text" placeholder="Contact Person" value={formData.contactPerson} onChange={(e) => setFormData({...formData, contactPerson: e.target.value})} style={{ width: '100%', padding: '12px', marginBottom: '16px', border: '1px solid #e5e7eb', borderRadius: '6px' }} />
        <input type="text" placeholder="LinkedIn URL" value={formData.linkedinUrl} onChange={(e) => setFormData({...formData, linkedinUrl: e.target.value})} style={{ width: '100%', padding: '12px', marginBottom: '16px', border: '1px solid #e5e7eb', borderRadius: '6px' }} />
        <input type="text" placeholder="Website Link" value={formData.websiteLink} onChange={(e) => setFormData({...formData, websiteLink: e.target.value})} style={{ width: '100%', padding: '12px', marginBottom: '16px', border: '1px solid #e5e7eb', borderRadius: '6px' }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
          <input type="text" placeholder="Zip Code" value={formData.zipCode} onChange={(e) => setFormData({...formData, zipCode: e.target.value})} style={{ padding: '12px', border: '1px solid #e5e7eb', borderRadius: '6px' }} />
          <input type="text" placeholder="State" value={formData.state} onChange={(e) => setFormData({...formData, state: e.target.value})} style={{ padding: '12px', border: '1px solid #e5e7eb', borderRadius: '6px' }} />
        </div>
        <input type="text" placeholder="City" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} style={{ width: '100%', padding: '12px', marginBottom: '16px', border: '1px solid #e5e7eb', borderRadius: '6px' }} />
        <input type="text" placeholder="Address 1" value={formData.address1} onChange={(e) => setFormData({...formData, address1: e.target.value})} style={{ width: '100%', padding: '12px', marginBottom: '16px', border: '1px solid #e5e7eb', borderRadius: '6px' }} />
        <input type="text" placeholder="Address 2" value={formData.address2} onChange={(e) => setFormData({...formData, address2: e.target.value})} style={{ width: '100%', padding: '12px', marginBottom: '24px', border: '1px solid #e5e7eb', borderRadius: '6px' }} />
        <button type="submit" disabled={submitLoading} style={{ width: '100%', padding: '12px', background: submitLoading ? '#9ca3af' : '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', fontSize: '16px', fontWeight: '600', cursor: submitLoading ? 'not-allowed' : 'pointer' }}>
          {submitLoading ? <><i className="fas fa-spinner fa-spin"></i> Loading...</> : 'Complete Profile'}
        </button>
      </form>
    </div>
  );
};

export default AdvisoryVerification;
