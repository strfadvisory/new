import React, { useState } from 'react';
import { toast } from 'react-toastify';
import './ChangePasswordModal.css';
import './Modal.css';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose }) => {
  const [newPassword, setNewPassword] = useState('');
  const [rePassword, setRePassword] = useState('');

  const handleSubmit = async () => {
    if (newPassword !== rePassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL || '/api'}/user/change-password`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ newPassword })
      });

      if (response.ok) {
        toast.success('Password changed successfully');
        onClose();
        setNewPassword('');
        setRePassword('');
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to change password');
      }
    } catch (error) {
      toast.error('Failed to change password. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1002 }}></div>
      <div className="change-password-modal">
        <div className="change-password-header">
          <h2>Change Password</h2>
        </div>

        <div className="change-password-content">
          <p className="change-password-description">
            Set up a new organisational entity to manage Users, modules, and operations efficiently.
          </p>

          <div className="password-input-group">
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <div className="password-input-group">
            <input
              type="password"
              placeholder="Re Password"
              value={rePassword}
              onChange={(e) => setRePassword(e.target.value)}
            />
          </div>
        </div>

        <div className="change-password-footer">
          <button className="btn-cancel-password" onClick={onClose}>
            Cancel
          </button>
          <button 
            className="btn-continue" 
            onClick={handleSubmit}
            disabled={!newPassword || !rePassword}
          >
            Continue
          </button>
        </div>
      </div>
    </>
  );
};

export default ChangePasswordModal;
