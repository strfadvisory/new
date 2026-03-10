import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './DeleteAccountModal.css';
import './Modal.css';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({ isOpen, onClose }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();

  const handleContinue = () => {
    setShowConfirm(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/user/delete-account`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to delete account');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Failed to delete account');
    }
  };

  const handleCancelConfirm = () => {
    setShowConfirm(false);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1002 }}></div>
      
      <div className="delete-account-banner">
        <div className="delete-account-content">
          <h3>Delete My Account</h3>
          <p>Set up a new organisational entity to manage Users, modules, and operations efficiently.</p>
        </div>
        <div className="delete-account-actions">
          <button className="btn-cancel-delete" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-continue-delete" onClick={handleContinue}>
            Continue
          </button>
        </div>
      </div>

      {showConfirm && (
        <>
          <div className="modal-overlay" style={{ zIndex: 1003 }}></div>
          <div className="delete-confirm-modal">
            <div className="delete-confirm-icon">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <h3>Delete Account</h3>
            <p>Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.</p>
            <div className="delete-confirm-actions">
              <button className="btn-cancel-confirm" onClick={handleCancelConfirm}>
                Cancel
              </button>
              <button className="btn-delete-confirm" onClick={handleConfirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default DeleteAccountModal;
