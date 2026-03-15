import React, { useState } from 'react';
import '../Dashboard.css';
import './superadmin/AllCompanies.css';
import AddAssociationPopup from '../components/AddAssociationPopup';
import { useAssociations, useAssociation, useDeleteAssociation } from '../hooks/queries/useAssociations';
import apiClient from '../api/client';
import { API_ENDPOINTS } from '../api/config';
import type { Association } from '../utils/simulatorStateManager';
import { usePermissions } from '../hooks/usePermissions';

interface AssociationControlProps {
  user: any;
  onLogout: () => void;
}

const AssociationControl: React.FC<AssociationControlProps> = ({ user, onLogout }) => {
  const [isSlidebarOpen, setIsSlidebarOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [associationToDelete, setAssociationToDelete] = useState<string | null>(null);
  const [selectedAssociationId, setSelectedAssociationId] = useState<string | null>(null);
  
  // Use React Query hooks
  const { data: associations = [], refetch: refetchAssociations } = useAssociations();
  const { data: selectedAssociation } = useAssociation(selectedAssociationId || '', !!selectedAssociationId);
  const deleteAssociationMutation = useDeleteAssociation();
  const [editData, setEditData] = useState<any>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  
  // Get current user permissions
  const { canCreateAssociations, permissionLevel, loading: permissionsLoading } = usePermissions();

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  React.useEffect(() => {
    if (associations && associations.length > 0 && !selectedAssociationId) {
      const firstAssociation = associations[0];
      const isValidId = firstAssociation._id && firstAssociation._id.match(/^[0-9a-fA-F]{24}$/);
      if (isValidId) {
        setSelectedAssociationId(firstAssociation._id);
      }
    }
  }, [associations, selectedAssociationId]);

  const handleAssociationUpdate = () => {
    refetchAssociations();
  };

  const handleEditAssociation = (association: any) => {
    if (!canCreateAssociations()) {
      return; // Prevent editing for VIEWER users
    }
    setEditData(association);
    setEditMode(true);
    setIsSlidebarOpen(true);
  };

  const handleAddNew = async () => {
    if (!canCreateAssociations()) {
      return; // Prevent adding for VIEWER users
    }
    setEditData(null);
    setEditMode(false);
    setIsSlidebarOpen(true);
  };

  const handlePopupSuccess = () => {
    refetchAssociations();
  };

  const handleDeleteAssociation = async (associationId: string) => {
    if (!canCreateAssociations()) {
      return; // Prevent deleting for VIEWER users
    }
    setAssociationToDelete(associationId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (associationToDelete) {
      try {
        await deleteAssociationMutation.mutateAsync(associationToDelete);
        setSelectedAssociationId(null);
      } catch (error) {
        console.error('Error deleting association:', error);
        alert('Failed to delete association');
      }
    }
    setShowDeleteConfirm(false);
    setAssociationToDelete(null);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setAssociationToDelete(null);
  };

  if (permissionsLoading) {
    return (
      <div className="main-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <div>Loading permissions...</div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <div className="companies-left-panel">
        <div className="companies-header">
          <div className="header-top">
            <h2 className="results-title">{associations ? associations.length : 0} Results founded</h2>
            <div style={{ position: 'relative' }}>
              <a 
                href="#" 
                className={`add-new-link ${!canCreateAssociations() ? 'disabled' : ''}`}
                onClick={canCreateAssociations() ? handleAddNew : undefined}
                style={{
                  color: canCreateAssociations() ? '#1f4f8f' : '#9ca3af',
                  cursor: canCreateAssociations() ? 'pointer' : 'not-allowed',
                  textDecoration: 'none',
                  opacity: canCreateAssociations() ? 1 : 0.6
                }}
                title={!canCreateAssociations() ? `${permissionLevel} access - Contact admin for permissions` : 'Add New Association'}
              >
                + Add New
                {!canCreateAssociations() && (
                  <i className="fas fa-lock" style={{ marginLeft: '4px', fontSize: '12px' }}></i>
                )}
              </a>
            </div>
          </div>
          <input type="text" placeholder="Search by name" className="companies-search" />
        </div>
        
        <div className="companies-list">
          {associations && associations.map((association: Association) => {
            const isValidId = association._id && association._id.match(/^[0-9a-fA-F]{24}$/);
            
            return (
              <div 
                key={association._id}
                className={`company-item ${selectedAssociationId === association._id ? 'active' : ''}`}
                onClick={() => {
                  if (!isValidId) {
                    console.error('Invalid association ID:', association._id);
                    return;
                  }
                  setSelectedAssociationId(association._id);
                }}
              >
                <div className="company-logo">
                  {association.icon ? (
                    <img src={association.icon} alt={association.name} />
                  ) : (
                    <i className="fas fa-building" style={{ color: '#64748b', fontSize: '20px' }}></i>
                  )}
                </div>
                <div className="company-info">
                  <div className="company-name">{association.name}</div> 
                  <div className="company-address">{association.description || 'Association Control'}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="companies-right-panel" style={{ flex: 1 }}>
        {selectedAssociation ? (
          <div className="association-details">
            <div className="association-header">
              <div className="association-info">
                <div className="association-icon">
                  {selectedAssociation.icon ? (
                    <img src={selectedAssociation.icon} alt={selectedAssociation.name} />
                  ) : (
                    <i className="fas fa-building" style={{ color: '#64748b', fontSize: '40px' }}></i>
                  )}
                </div>
                <div>
                  <h2>{selectedAssociation.name}</h2>
                  <p className="association-type">Managed Company</p>
                  <p className="association-description">
                    Grants permission-based access to the Simulator module and its associated data.
                  </p>
                  <div className="contact-info">
                    <span>+01 38200 29902 • Sumhar Jordan • www.strf.com</span>
                  </div>
                  <p className="permission-note">
                    Grants permission-based access to the Simulator module and its associated data.
                  </p>
                </div>
              </div>
              <div className="association-actions">
                <div className="custom-dropdown" ref={dropdownRef}>
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="dropdown-btn"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="1"/>
                      <circle cx="12" cy="5" r="1"/>
                      <circle cx="12" cy="19" r="1"/>
                    </svg>
                  </button>
                  {showDropdown && (
                    <div className="dropdown-content">
                      <button 
                        onClick={() => {
                          if (canCreateAssociations()) {
                            handleEditAssociation(selectedAssociation);
                          }
                          setShowDropdown(false);
                        }} 
                        className={`dropdown-option ${!canCreateAssociations() ? 'disabled' : ''}`}
                        style={{
                          color: canCreateAssociations() ? '#374151' : '#9ca3af',
                          cursor: canCreateAssociations() ? 'pointer' : 'not-allowed',
                          opacity: canCreateAssociations() ? 1 : 0.6
                        }}
                        title={!canCreateAssociations() ? `${permissionLevel} access - Contact admin for permissions` : 'Edit Association'}
                      >
                        Edit
                        {!canCreateAssociations() && (
                          <i className="fas fa-lock" style={{ marginLeft: '4px', fontSize: '10px' }}></i>
                        )}
                      </button>
                      <button 
                        onClick={() => {
                          if (canCreateAssociations()) {
                            handleDeleteAssociation(selectedAssociation._id);
                          }
                          setShowDropdown(false);
                        }} 
                        className={`dropdown-option danger ${!canCreateAssociations() ? 'disabled' : ''}`}
                        style={{
                          color: canCreateAssociations() ? '#dc2626' : '#9ca3af',
                          cursor: canCreateAssociations() ? 'pointer' : 'not-allowed',
                          opacity: canCreateAssociations() ? 1 : 0.6
                        }}
                        title={!canCreateAssociations() ? `${permissionLevel} access - Contact admin for permissions` : 'Delete Association'}
                      >
                        Delete Association
                        {!canCreateAssociations() && (
                          <i className="fas fa-lock" style={{ marginLeft: '4px', fontSize: '10px' }}></i>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="association-content">
              <div className="section">
                <div className="section-header">
                  <h3>Property manager</h3>
                  <button className="add-new-btn">+ Add New</button>
                </div>
                <div className="item-card">
                  <div className="item-icon">
                    <i className="fas fa-desktop"></i>
                  </div>
                  <div className="item-info">
                    <h4>Access Simulator</h4>
                    <p>Grants permission-based access to the Simulator module and its associated data.</p>
                  </div>
                  <div className="item-status">
                    <span className="status-badge active">ON</span>
                  </div>
                </div>
              </div>

              <div className="section">
                <div className="section-header">
                  <h3>Members</h3>
                  <button className="add-new-btn">+ Add New</button>
                </div>
                <div className="item-card">
                  <div className="item-icon">
                    <i className="fas fa-desktop"></i>
                  </div>
                  <div className="item-info">
                    <h4>Access Simulator</h4>
                    <p>Grants permission-based access to the Simulator module and its associated data.</p>
                  </div>
                  <div className="item-status">
                    <span className="status-badge active">ON</span>
                  </div>
                </div>
                <div className="item-card">
                  <div className="item-icon">
                    <i className="fas fa-desktop"></i>
                  </div>
                  <div className="item-info">
                    <h4>Access Simulator</h4>
                    <p>Grants permission-based access to the Simulator module and its associated data.</p>
                  </div>
                  <div className="item-status">
                    <span className="status-badge inactive">OFF</span>
                  </div>
                </div>
              </div>

              <div className="section">
                <div className="section-header">
                  <h3>Module</h3>
                  <button className="add-new-btn">+ Add New</button>
                </div>
                <div className="item-card">
                  <div className="item-icon">
                    <i className="fas fa-desktop"></i>
                  </div>
                  <div className="item-info">
                    <h4>Access Simulator</h4>
                    <p>Grants permission-based access to the Simulator module and its associated data.</p>
                  </div>
                  <div className="item-status">
                    <span className="status-badge active">ON</span>
                  </div>
                </div>
                <div className="item-card">
                  <div className="item-icon">
                    <i className="fas fa-desktop"></i>
                  </div>
                  <div className="item-info">
                    <h4>Access Simulator</h4>
                    <p>Grants permission-based access to the Simulator module and its associated data.</p>
                  </div>
                  <div className="item-status">
                    <span className="status-badge inactive">OFF</span>
                  </div>
                </div>
              </div>

              <div className="section">
                <div className="section-header">
                  <h3>Versions</h3>
                  <button className="add-new-btn">+ Add New</button>
                </div>
                <div className="item-card">
                  <div className="item-icon">
                    <i className="fas fa-desktop"></i>
                  </div>
                  <div className="item-info">
                    <h4>Access Simulator</h4>
                    <p>Grants permission-based access to the Simulator module and its associated data.</p>
                  </div>
                  <div className="item-status">
                    <span className="status-badge active">ON</span>
                  </div>
                </div>
                <div className="item-card">
                  <div className="item-icon">
                    <i className="fas fa-desktop"></i>
                  </div>
                  <div className="item-info">
                    <h4>Access Simulator</h4>
                    <p>Grants permission-based access to the Simulator module and its associated data.</p>
                  </div>
                  <div className="item-status">
                    <span className="status-badge inactive">OFF</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="no-selection">
            <div className="no-selection-content">
              <div className="no-selection-icon">
                <i className="fas fa-building"></i>
              </div>
              <h3 className="no-selection-title">Select an Association</h3>
              <p className="no-selection-description">
                Choose an association from the list to view and manage its details.
              </p>
            </div>
          </div>
        )}
      </div>

      <AddAssociationPopup
        isOpen={isSlidebarOpen}
        onClose={() => setIsSlidebarOpen(false)}
        onSuccess={handlePopupSuccess}
        editData={editData}
        isEditMode={editMode}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <>
          <div className="modal-overlay" onClick={cancelDelete}></div>
          <div className="confirm-modal">
            <div className="modal-icon">
              <i className="fas fa-exclamation-triangle" style={{ fontSize: '48px', color: '#ef4444' }}></i>
            </div>
            <h3 style={{ margin: '16px 0', fontSize: '20px', fontWeight: '600', color: '#1f2937' }}>
              Delete Association
            </h3>
            <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: '#6b7280', textAlign: 'center' }}>
              Are you sure you want to delete this association? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button 
                onClick={cancelDelete}
                style={{
                  padding: '10px 24px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  background: 'white',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                style={{
                  padding: '10px 24px',
                  border: 'none',
                  borderRadius: '8px',
                  background: '#ef4444',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AssociationControl;