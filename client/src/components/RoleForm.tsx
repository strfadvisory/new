import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { API_BASE_URL } from '../config';
import './RoleForm.css';

interface RoleFormProps {
  onClose: () => void;
  onRoleCreated: () => void;
}

const RoleForm: React.FC<RoleFormProps> = ({ onClose, onRoleCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: 'user'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.description.trim()) {
      toast.error('Name and description are required');
      return;
    }

    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/roles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const newRole = await response.json();
        toast.success('Role created successfully!');
        onRoleCreated();
        onClose();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to create role');
      }
    } catch (error) {
      console.error('Error creating role:', error);
      toast.error('Network error: Failed to create role');
    } finally {
      setLoading(false);
    }
  };

  const iconOptions = [
    { value: 'user', label: '👤 User' },
    { value: 'users', label: '👥 Users' },
    { value: 'shield', label: '🛡️ Shield' },
    { value: 'crown', label: '👑 Crown' },
    { value: 'star', label: '⭐ Star' },
    { value: 'cog', label: '⚙️ Settings' },
    { value: 'briefcase', label: '💼 Business' },
    { value: 'building', label: '🏢 Building' }
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create New Role</h2>
          <button className="close-button" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="role-form">
          <div className="form-group">
            <label htmlFor="name">Role Name *</label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter role name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter role description"
              rows={3}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="icon">Icon</label>
            <select
              id="icon"
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
            >
              {iconOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn btn-cancel">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Creating...' : 'Create Role'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoleForm;