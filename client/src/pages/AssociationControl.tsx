import React, { useState } from 'react';
import { API_BASE_URL } from '../config';
import '../Dashboard.css';
import './superadmin/AllCompanies.css';
import AddAssociationPopup from '../components/AddAssociationPopup';

interface AssociationControlProps {
  user: any;
  onLogout: () => void;
}

const AssociationControl: React.FC<AssociationControlProps> = ({ user, onLogout }) => {
  const [isSlidebarOpen, setIsSlidebarOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [associationToDelete, setAssociationToDelete] = useState<string | null>(null);
  const [associations, setAssociations] = useState<any[]>([]);
  const [selectedAssociation, setSelectedAssociation] = useState<any>(null);
  const [editData, setEditData] = useState<any>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

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
    fetchAssociations();
  }, []);

  const refreshSelectedAssociation = async () => {
    if (selectedAssociation?._id) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/associations/${selectedAssociation._id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const freshAssociation = await response.json();
          setSelectedAssociation({ ...freshAssociation, hierarchy: selectedAssociation.hierarchy });
        }
      } catch (error) {
        console.error('Error refreshing selected association:', error);
      }
    }
  };

  const handleAssociationUpdate = () => {
    fetchAssociations();
    refreshSelectedAssociation();
  };

  const fetchAssociations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/associations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setAssociations(data);
        if (data.length > 0) {
          const firstAssociation = data[0];
          const isValidId = firstAssociation._id && firstAssociation._id.match(/^[0-9a-fA-F]{24}$/);
          if (isValidId) {
            const associationResponse = await fetch(`${API_BASE_URL}/associations/${firstAssociation._id}`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            const freshAssociation = associationResponse.ok ? await associationResponse.json() : firstAssociation;
            setSelectedAssociation(freshAssociation);
          } else {
            setSelectedAssociation(firstAssociation);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching associations:', error);
    }
  };

  const handleEditAssociation = (association: any) => {
    setEditData(association);
    setEditMode(true);
    setIsSlidebarOpen(true);
  };

  const handleAddNew = async () => {
    setEditData(null);
    setEditMode(false);
    setIsSlidebarOpen(true);
  };

  const handlePopupSuccess = () => {
    fetchAssociations();
    refreshSelectedAssociation();
  };

  const handleDeleteAssociation = async (associationId: string) => {
    setAssociationToDelete(associationId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (associationToDelete) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/associations/${associationToDelete}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          setSelectedAssociation(null);
          fetchAssociations();
        } else {
          const errorData = await response.json();
          alert(`Error: ${errorData.message || 'Failed to delete association'}`);
        }
      } catch (error) {
        console.error('Error deleting association:', error);
      }
    }
    setShowDeleteConfirm(false);
    setAssociationToDelete(null);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setAssociationToDelete(null);
  };

  return (
    <div className="main-content">
      <div className="companies-left-panel">
        <div className="companies-header">
          <div className="header-top">
            <h2 className="results-title">{associations.length} Results founded</h2>
            <a href="#" className="add-new-link" onClick={handleAddNew}>+ Add New</a>
          </div>
          <input type="text" placeholder="Search by name" className="companies-search" />
        </div>
        
        <div className="companies-list">
          {associations.map((association) => {
            const isValidId = association._id && association._id.match(/^[0-9a-fA-F]{24}$/);
            
            return (
              <div 
                key={association._id}
                className={`company-item ${selectedAssociation?._id === association._id ? 'active' : ''}`}
                onClick={async () => {
                  if (!isValidId) {
                    console.error('Invalid association ID:', association._id);
                    setSelectedAssociation(association);
                    return;
                  }
                  
                  try {
                    const token = localStorage.getItem('token');
                    const response = await fetch(`${API_BASE_URL}/associations/${association._id}`, {
                      headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (response.ok) {
                      const freshAssociation = await response.json();
                      setSelectedAssociation(freshAssociation);
                    } else if (response.status === 404) {
                      console.error('Association not found or access denied');
                      setSelectedAssociation(null);
                    } else {
                      setSelectedAssociation(association);
                    }
                  } catch (error) {
                    console.error('Error fetching association:', error);
                    setSelectedAssociation(association);
                  }
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
                  <div className="company-level">Association</div>
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
                          handleEditAssociation(selectedAssociation);
                          setShowDropdown(false);
                        }} 
                        className="dropdown-option"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => {
                          handleDeleteAssociation(selectedAssociation._id);
                          setShowDropdown(false);
                        }} 
                        className="dropdown-option danger"
                      >
                        Delete Association
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
            <i className="fas fa-building" style={{ fontSize: '64px', color: '#e5e7eb', marginBottom: '16px' }}></i>
            <h3>Select an Association</h3>
            <p>Choose an association from the list to view and manage its details.</p>
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