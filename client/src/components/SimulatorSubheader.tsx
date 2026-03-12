import React, { useState, useEffect, useRef } from 'react';
import { API_ENDPOINTS } from '../config';
import { apiService } from '../services/ApiService';
import InviteMemberModal from './InviteMemberModal';
import AddAssociationPopup from './AddAssociationPopup';
import AddReserveStudyPopup from './AddReserveStudyPopup';
import { viewModeEmitter, studySelectionEmitter, refreshReserveStudiesDropdown } from '../utils/eventEmitter';
import './SimulatorSubheader.css';

interface ReserveStudy {
  _id: string;
  studyName: string;
  fileName: string;
  createdAt: string;
  uploadedBy: {
    firstName: string;
    lastName: string;
  };
}

interface Company {
  _id: string;
  name: string;
  description?: string;
  icon?: string;
}

interface Association {
  _id: string;
  name: string;
  type?: string;
  description?: string;
  icon?: string;
}

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role?: string;
}

interface DropdownProps {
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  style?: React.CSSProperties;
  showCompanyList?: boolean;
  showUserList?: boolean;
  showAssociationsList?: boolean;
  showReserveStudyList?: boolean;
  bottomButtonText?: string;
  onBottomButtonClick?: () => void;
  selectedValue?: string;
  onSelectionChange?: (value: string, studyId?: string, associationData?: Association) => void;
  refreshTrigger?: number;
  selectedAssociationData?: Association | null;
}

const Dropdown: React.FC<DropdownProps> = ({ 
  label, 
  icon, 
  onClick, 
  style,
  showCompanyList = false,
  showUserList = false,
  showAssociationsList = false,
  showReserveStudyList = false,
  bottomButtonText = '+ Add New Associations',
  onBottomButtonClick,
  selectedValue,
  onSelectionChange,
  refreshTrigger,
  selectedAssociationData
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [associations, setAssociations] = useState<Association[]>([]);
  const [reserveStudies, setReserveStudies] = useState<ReserveStudy[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showUserPopup, setShowUserPopup] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{show: boolean; studyId: string; studyName: string}>({show: false, studyId: '', studyName: ''});
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0) {
      if (showAssociationsList) {
        setAssociations([]);
        fetchAssociations();
      }
      if (showReserveStudyList) {
        setReserveStudies([]);
        fetchReserveStudies();
      }
    }
  }, [refreshTrigger]);

  useEffect(() => {
    if (showReserveStudyList && selectedAssociationData) {
      setReserveStudies([]);
      fetchReserveStudies();
    }
  }, [selectedAssociationData, showReserveStudyList]);

  useEffect(() => {
    if ((showCompanyList || showUserList || showAssociationsList || showReserveStudyList) && isOpen) {
      if (showCompanyList && companies.length === 0) {
        fetchCompanies();
      }
      if (showUserList && users.length === 0) {
        fetchUsers();
      }
      if (showAssociationsList && associations.length === 0) {
        fetchAssociations();
      }
      if (showReserveStudyList && reserveStudies.length === 0) {
        fetchReserveStudies();
      }
    }
  }, [isOpen, showCompanyList, showUserList, showAssociationsList, showReserveStudyList]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await apiService.get<User[]>('/auth/users');
      const usersWithRoles = Array.isArray(data) ? data.map(user => ({
        ...user,
        role: user.role || (Math.random() > 0.5 ? 'Manager' : 'Member')
      })) : [
        { _id: '1', firstName: 'James', lastName: 'Anderson', email: 'james@example.com', role: 'Member' },
        { _id: '2', firstName: 'Michael', lastName: '', email: 'michael@example.com', role: 'Members' },
        { _id: '3', firstName: 'Johnson', lastName: '', email: 'johnson@example.com', role: 'Manager' }
      ];
      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([
        { _id: '1', firstName: 'James', lastName: 'Anderson', email: 'james@example.com', role: 'Member' },
        { _id: '2', firstName: 'Michael', lastName: '', email: 'michael@example.com', role: 'Members' },
        { _id: '3', firstName: 'Johnson', lastName: '', email: 'johnson@example.com', role: 'Manager' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const data = await apiService.get<Company[]>('/roles/company-types');
      setCompanies(Array.isArray(data) ? data : [
        { _id: '1', name: 'DemoTech Solutions' },
        { _id: '2', name: 'SampleCorp Ltd.' },
        { _id: '3', name: 'Testify Systems' },
        { _id: '4', name: 'Alpha Demo Pvt. Ltd.' },
        { _id: '5', name: 'Mockup Technologies' },
        { _id: '6', name: 'BetaWorks Inc.' },
        { _id: '7', name: 'Placeholder Enterprises' },
        { _id: '8', name: 'TrialRun Solutions' },
        { _id: '9', name: 'Prototype Labs' },
        { _id: '10', name: 'ExampleSoft Technologies' }
      ]);
    } catch (error) {
      console.error('Error fetching companies:', error);
      setCompanies([
        { _id: '1', name: 'DemoTech Solutions' },
        { _id: '2', name: 'SampleCorp Ltd.' },
        { _id: '3', name: 'Testify Systems' },
        { _id: '4', name: 'Alpha Demo Pvt. Ltd.' },
        { _id: '5', name: 'Mockup Technologies' },
        { _id: '6', name: 'BetaWorks Inc.' },
        { _id: '7', name: 'Placeholder Enterprises' },
        { _id: '8', name: 'TrialRun Solutions' },
        { _id: '9', name: 'Prototype Labs' },
        { _id: '10', name: 'ExampleSoft Technologies' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredCompanies = companies.filter(company =>
    (company.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fetchAssociations = async () => {
    setLoading(true);
    try {
      const data = await apiService.get<Association[]>('/associations');
      const associationsData = Array.isArray(data) ? data : [
        { _id: '1', name: 'Homeowners Association A', type: 'HOA' },
        { _id: '2', name: 'Community Board B', type: 'Community' },
        { _id: '3', name: 'Property Management Group', type: 'Management' },
        { _id: '4', name: 'Residents Council', type: 'Council' },
        { _id: '5', name: 'Building Committee', type: 'Committee' }
      ];
      setAssociations(associationsData);
      
      // Update selected association data if there's a match
      if (selectedValue && selectedAssociationData) {
        const selected = associationsData.find(assoc => assoc.name === selectedValue);
        if (selected && selectedAssociationData) {
          // This will be handled by the parent component
        }
      }
    } catch (error) {
      console.error('Error fetching associations:', error);
      setAssociations([
        { _id: '1', name: 'Homeowners Association A', type: 'HOA' },
        { _id: '2', name: 'Community Board B', type: 'Community' },
        { _id: '3', name: 'Property Management Group', type: 'Management' },
        { _id: '4', name: 'Residents Council', type: 'Council' },
        { _id: '5', name: 'Building Committee', type: 'Committee' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredAssociations = associations.filter(association =>
    (association.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fetchReserveStudies = async () => {
    setLoading(true);
    try {
      // Get association ID from selectedAssociationData
      if (!selectedAssociationData?._id) {
        console.warn('No association ID available for fetching reserve studies');
        setReserveStudies([]);
        return;
      }
      
      const response = await apiService.post<{data: ReserveStudy[]}>('/reserve-studies/list', {
        associationId: selectedAssociationData._id
      });
      const studies = Array.isArray(response.data) ? response.data : [];
      
      // Sort by creation date to ensure latest is first
      const sortedStudies = studies.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      setReserveStudies(sortedStudies);
      console.log('[Dropdown] Reserve studies fetched and sorted:', sortedStudies.length);
    } catch (error) {
      console.error('Error fetching reserve studies:', error);
      setReserveStudies([]);
    } finally {
      setLoading(false);
    }
  };

  // Listen for reserve studies updates
  useEffect(() => {
    const handleReserveStudiesUpdate = () => {
      if (showReserveStudyList && selectedAssociationData) {
        fetchReserveStudies();
      }
    };

    // Listen for global reserve studies update events
    window.addEventListener('reserveStudiesUpdated', handleReserveStudiesUpdate);
    
    return () => {
      window.removeEventListener('reserveStudiesUpdated', handleReserveStudiesUpdate);
    };
  }, [showReserveStudyList, selectedAssociationData]);

  const filteredReserveStudies = reserveStudies.filter(study =>
    (study.studyName || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteReserveStudy = async (studyId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await apiService.delete(`/reserve-studies/${studyId}`);
      setReserveStudies(prev => prev.filter(s => s._id !== studyId));
      setDeleteConfirm({show: false, studyId: '', studyName: ''});
      // Trigger dropdown refresh after delete
      refreshReserveStudiesDropdown();
    } catch (error) {
      console.error('Error deleting reserve study:', error);
      alert('Failed to delete reserve study');
    }
  };

  const handleDropdownClick = () => {
    if (showCompanyList || showUserList || showAssociationsList || showReserveStudyList) {
      setIsOpen(!isOpen);
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      <div 
        style={{
          height: '36px',
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '10px',
          padding: '0 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '14px',
          fontWeight: '500',
          color: '#111827',
          cursor: 'pointer',
          ...style
        }}
        onClick={handleDropdownClick}
      >
        {icon && (
          <div style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            background: '#e5e7eb'
          }}>
            {icon}
          </div>
        )}
        {selectedValue || label}
        <i className="fas fa-chevron-down" style={{ fontSize: '16px' }}></i>
      </div>

      {(showCompanyList || showUserList || showAssociationsList || showReserveStudyList) && isOpen && (
        <div style={{
          position: 'absolute',
          top: '40px',
          left: '0',
          width: '400px',
          maxHeight: '400px',
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '10px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          zIndex: 1000,
          overflow: 'hidden'
        }}>
          <div style={{ padding: '12px' }}>
            <input
              type="text"
              placeholder="Search by name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>
          
          <div style={{
            maxHeight: '280px',
            overflowY: 'auto'
          }}>
            {loading ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>
                Loading...
              </div>
            ) : showUserList ? (
              filteredUsers.length > 0 ? (
                filteredUsers.map((user, index) => (
                  <div
                    key={user._id}
                    style={{
                      padding: '12px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      borderBottom: index < filteredUsers.length - 1 ? '1px solid #f3f4f6' : 'none'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f9fafb';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'white';
                    }}
                    onClick={() => {
                      setSelectedUser(user);
                      setShowUserPopup(true);
                      setIsOpen(false);
                    }}
                  >
                    <span style={{
                      fontSize: '14px',
                      color: '#111827',
                      fontWeight: '500'
                    }}>
                      {user.firstName} {user.lastName}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        fontSize: '12px',
                        color: user.role === 'Manager' ? '#10b981' : '#6b7280',
                        fontWeight: '500'
                      }}>
                        {user.role}
                      </span>
                      <span style={{ color: '#9ca3af' }}>...</span>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>
                  No users found
                </div>
              )
            ) : showAssociationsList ? (
              filteredAssociations.length > 0 ? (
                filteredAssociations.map((association, index) => (
                  <div
                    key={association._id}
                    style={{
                      padding: '12px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      cursor: 'pointer',
                      borderBottom: index < filteredAssociations.length - 1 ? '1px solid #f3f4f6' : 'none'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f9fafb';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'white';
                    }}
                    onClick={() => {
                      console.log('Selected association:', association.name);
                      if (onSelectionChange) {
                        onSelectionChange(association.name, undefined, association);
                      }
                      setIsOpen(false);
                    }}
                  >
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: '#e5e7eb',
                      color: '#374151',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: '600',
                      overflow: 'hidden'
                    }}>
                      {association.icon ? (
                        <img 
                          src={association.icon} 
                          alt={association.name}
                          style={{
                            width: '24px',
                            height: '24px',
                            objectFit: 'cover'
                          }}
                          onError={(e) => {
                            // Fallback to first letter if image fails to load
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML = association.name.charAt(0).toUpperCase();
                            }
                          }}
                        />
                      ) : (
                        association.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <span style={{
                      fontSize: '14px',
                      color: '#111827',
                      fontWeight: '500'
                    }}>
                      {association.name}
                    </span>
                  </div>
                ))
              ) : (
                <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>
                  No associations found
                </div>
              )
            ) : showReserveStudyList ? (
              filteredReserveStudies.length > 0 ? (
                filteredReserveStudies.map((study, index) => (
                  <div
                    key={study._id}
                    style={{
                      padding: '12px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      borderBottom: index < filteredReserveStudies.length - 1 ? '1px solid #f3f4f6' : 'none'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f9fafb';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'white';
                    }}
                    onClick={() => {
                      console.log('Selected reserve study:', study.studyName);
                      if (onSelectionChange) {
                        onSelectionChange(study.studyName, study._id);
                      }
                      setIsOpen(false);
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: '#0e519b',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        <i className="fas fa-file-excel"></i>
                      </div>
                      <div>
                        <div style={{
                          fontSize: '14px',
                          color: '#111827',
                          fontWeight: '500'
                        }}>
                          {study.studyName}
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: '#6b7280'
                        }}>
                          {study.fileName}
                        </div>
                      </div>
                    </div>
                    <i 
                      className="fas fa-trash" 
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirm({show: true, studyId: study._id, studyName: study.studyName});
                      }}
                      style={{
                        color: '#ef4444',
                        fontSize: '14px',
                        cursor: 'pointer',
                        padding: '8px'
                      }}
                      onMouseEnter={(e) => {
                        (e.target as HTMLElement).style.color = '#dc2626';
                      }}
                      onMouseLeave={(e) => {
                        (e.target as HTMLElement).style.color = '#ef4444';
                      }}
                    />
                  </div>
                ))
              ) : (
                <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>
                  No reserve studies found
                </div>
              )
            ) : filteredCompanies.length > 0 ? (
              filteredCompanies.map((company, index) => (
                <div
                  key={company._id}
                  style={{
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: 'pointer',
                    borderBottom: index < filteredCompanies.length - 1 ? '1px solid #f3f4f6' : 'none'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f9fafb';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'white';
                  }}
                  onClick={() => {
                    console.log('Selected company:', company.name);
                    if (onSelectionChange) {
                      onSelectionChange(company.name);
                    }
                    setIsOpen(false);
                  }}
                >
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: '#374151',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    {company.name.charAt(0).toUpperCase()}
                  </div>
                  <span style={{
                    fontSize: '14px',
                    color: '#111827',
                    fontWeight: '500'
                  }}>
                    {company.name}
                  </span>
                </div>
              ))
            ) : (
              <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>
                No companies found
              </div>
            )}
          </div>
          
          <div style={{
            padding: '12px 16px',
            borderTop: '1px solid #f3f4f6',
            background: '#f9fafb'
          }}>
            <button 
              onClick={() => {
                if (onBottomButtonClick) {
                  onBottomButtonClick();
                }
                setIsOpen(false);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#0e519b',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                padding: '0'
              }}
            >
              {showUserList ? '+ Send Invite' : bottomButtonText}
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirm.show && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            width: '100%',
            maxWidth: '400px',
            margin: '20px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '16px'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: '#fef2f2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <i className="fas fa-exclamation-triangle" style={{ color: '#ef4444', fontSize: '20px' }}></i>
              </div>
              <h3 style={{
                margin: 0,
                fontSize: '18px',
                fontWeight: '600',
                color: '#1f2937'
              }}>
                Delete Reserve Study
              </h3>
            </div>
            <p style={{
              margin: '0 0 20px 0',
              fontSize: '14px',
              color: '#6b7280',
              lineHeight: '1.5'
            }}>
              Are you sure you want to delete <strong style={{color: '#374151'}}>{deleteConfirm.studyName}</strong>? This action cannot be undone.
            </p>
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => setDeleteConfirm({show: false, studyId: '', studyName: ''})}
                style={{
                  padding: '10px 20px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '8px',
                  backgroundColor: 'white',
                  color: '#374151',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                }}
              >
                Cancel
              </button>
              <button
                onClick={(e) => handleDeleteReserveStudy(deleteConfirm.studyId, e)}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '8px',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#dc2626';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#ef4444';
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface SimulatorSubheaderProps {
  onChangeView?: (viewMode: 'graph' | 'list') => void;
  onReset?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onSave?: () => void;
  onShowCalculator?: (association: string, reserveStudy: string, excelData?: any) => void;
  selectedAssociation?: string;
  selectedCompany?: string;
  onAssociationChange?: (value: string, associationData?: Association) => void;
  onCompanyChange?: (value: string, studyId?: string) => void;
}

const SimulatorSubheader: React.FC<SimulatorSubheaderProps> = ({
  onChangeView,
  onReset,
  onUndo,
  onRedo,
  onSave,
  onShowCalculator,
  selectedAssociation = '',
  selectedCompany = '',
  onAssociationChange,
  onCompanyChange
}) => {
  console.log('[SimulatorSubheader] Received props:', { onChangeView: !!onChangeView, onReset: !!onReset, selectedAssociation, selectedCompany });
  const [selectedView, setSelectedView] = useState('Graph View');
  const [showViewMenu, setShowViewMenu] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [showInvitePopup, setShowInvitePopup] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [dropdownUsers, setDropdownUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserMenu, setSelectedUserMenu] = useState<string | null>(null);
  const [showCreateAssociationPopup, setShowCreateAssociationPopup] = useState(false);
  const [showAddReserveStudyPopup, setShowAddReserveStudyPopup] = useState(false);
  const [refreshAssociations, setRefreshAssociations] = useState(0);
  const [refreshReserveStudies, setRefreshReserveStudies] = useState(0);
  const [selectedStudyId, setSelectedStudyId] = useState<string>('');
  const [dataFetched, setDataFetched] = useState<Set<string>>(new Set()); // Track which study data was fetched
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false); // Track loading state
  const [fetchingStudyId, setFetchingStudyId] = useState<string>(''); // Track currently fetching study
  const [lastFetchedStudy, setLastFetchedStudy] = useState<string>(''); // Additional safety check
  const [selectedAssociationData, setSelectedAssociationData] = useState<Association | null>(null);
  const [associations, setAssociations] = useState<Association[]>([]);
  const viewMenuRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchExcelData = async () => {
      // Multiple layers of protection against duplicate calls
      if (!selectedAssociation || !selectedCompany || !selectedStudyId || !onShowCalculator) {
        return;
      }
      
      // Check if already fetched
      if (dataFetched.has(selectedStudyId)) {
        console.log('[SimulatorSubheader] Data already fetched for study:', selectedStudyId);
        return;
      }
      
      // Check if currently loading
      if (isLoadingData) {
        console.log('[SimulatorSubheader] Already loading data, skipping...');
        return;
      }
      
      // Check if this specific study is being fetched
      if (fetchingStudyId === selectedStudyId) {
        console.log('[SimulatorSubheader] Already fetching this study:', selectedStudyId);
        return;
      }
      
      // Check if this was the last fetched study
      if (lastFetchedStudy === selectedStudyId) {
        console.log('[SimulatorSubheader] This study was just fetched:', selectedStudyId);
        return;
      }
      
      console.log('[SimulatorSubheader] Starting fetch for study:', selectedStudyId);
      setFetchingStudyId(selectedStudyId);
      setIsLoadingData(true);
      setLastFetchedStudy(selectedStudyId);
      
      try {
        const response = await apiService.get<any>(`/reserve-studies/${selectedStudyId}/data`);
        console.log('[SimulatorSubheader] Excel data fetched successfully for:', selectedStudyId);
        
        // Mark as fetched
        setDataFetched(prev => {
          const newSet = new Set(prev);
          newSet.add(selectedStudyId);
          return newSet;
        });
        
        // Send complete JSON to calculator page
        const completeData = {
          studyId: selectedStudyId,
          association: selectedAssociation,
          reserveStudy: selectedCompany,
          data: response.data || response,
          timestamp: new Date().toISOString()
        };
        
        console.log('[SimulatorSubheader] Triggering calculator with data');
        onShowCalculator(selectedAssociation, selectedCompany, completeData);
      } catch (error) {
        console.error('[SimulatorSubheader] Error fetching Excel data:', error);
        // Reset last fetched on error to allow retry
        setLastFetchedStudy('');
        // Still show calculator even if data fetch fails
        onShowCalculator(selectedAssociation, selectedCompany);
      } finally {
        setIsLoadingData(false);
        setFetchingStudyId('');
      }
    };
    
    // Debounce the fetch call
    const timeoutId = setTimeout(() => {
      fetchExcelData();
    }, 200);
    
    return () => clearTimeout(timeoutId);
  }, [selectedAssociation, selectedCompany, selectedStudyId]);

  useEffect(() => {
    if (selectedAssociation && onCompanyChange) {
      onCompanyChange('');
      setRefreshReserveStudies(prev => prev + 1);
    }
  }, [selectedAssociation]);

  // Fetch associations on mount to get association data
  useEffect(() => {
    const fetchAssociationsData = async () => {
      try {
        const data = await apiService.get<Association[]>('/associations');
        const associationsData = Array.isArray(data) ? data : [];
        setAssociations(associationsData);
        
        // Update selected association data if there's a match
        if (selectedAssociation) {
          const selected = associationsData.find(assoc => assoc.name === selectedAssociation);
          if (selected) {
            setSelectedAssociationData(selected);
          }
        }
      } catch (error) {
        console.error('Error fetching associations:', error);
      }
    };
    
    fetchAssociationsData();
  }, [selectedAssociation]);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (viewMenuRef.current && !viewMenuRef.current.contains(event.target as Node)) {
        setShowViewMenu(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
        setSelectedUserMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await apiService.get<User[]>('/auth/users');
      setUsers(Array.isArray(data) ? data.slice(0, 3) : []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    }
  };

  const fetchDropdownUsers = async () => {
    try {
      const data = await apiService.get<User[]>('/auth/users');
      const usersWithRoles = Array.isArray(data) ? data.map(user => ({
        ...user,
        role: user.role || (Math.random() > 0.5 ? 'Manager' : 'Member')
      })) : [];
      setDropdownUsers(usersWithRoles);
    } catch (error) {
      console.error('Error fetching dropdown users:', error);
      setDropdownUsers([]);
    }
  };

  const filteredDropdownUsers = dropdownUsers.filter(user =>
    `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCompanyChange = (value: string, studyId?: string) => {
    if (onCompanyChange) {
      onCompanyChange(value, studyId);
    }
    if (studyId) {
      // Only update if it's actually a different study
      if (selectedStudyId !== studyId) {
        console.log('[SimulatorSubheader] Changing to new study:', studyId);
        setSelectedStudyId(studyId);
        setIsLoadingData(false);
        setFetchingStudyId('');
        // Don't reset lastFetchedStudy here - let the effect handle it
      }
    }
  };

  return (
    <div className="simulator-subheader">
      <div className="left-section">
        <Dropdown 
          label="Associations" 
          icon={selectedAssociationData?.icon ? (
            <img 
              src={selectedAssociationData.icon} 
              alt={selectedAssociationData.name}
              style={{
                width: '16px',
                height: '16px',
                objectFit: 'cover',
                borderRadius: '50%'
              }}
              onError={(e) => {
                // Fallback to first letter if image fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = selectedAssociationData?.name?.charAt(0)?.toUpperCase() || 'A';
                  parent.style.fontSize = '10px';
                  parent.style.fontWeight = '600';
                  parent.style.color = '#374151';
                  parent.style.display = 'flex';
                  parent.style.alignItems = 'center';
                  parent.style.justifyContent = 'center';
                }
              }}
            />
          ) : selectedAssociation ? (
            <div style={{
              fontSize: '10px',
              fontWeight: '600',
              color: '#374151',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%'
            }}>
              {selectedAssociation.charAt(0).toUpperCase()}
            </div>
          ) : null} 
          showAssociationsList={true} 
          bottomButtonText="+ Create an Associations" 
          onBottomButtonClick={() => setShowCreateAssociationPopup(true)}
          selectedValue={selectedAssociation}
          onSelectionChange={(value, studyId, associationData) => {
            if (onAssociationChange) {
              onAssociationChange(value, associationData);
            }
            if (associationData) {
              setSelectedAssociationData(associationData);
            }
          }}
          refreshTrigger={refreshAssociations}
          selectedAssociationData={selectedAssociationData}
        />
        <Dropdown 
          label="Reserve Studies" 
          icon={<div />} 
          showReserveStudyList={true} 
          bottomButtonText="+ Add New Reserve Study"
          onBottomButtonClick={() => setShowAddReserveStudyPopup(true)}
          selectedValue={selectedCompany}
          onSelectionChange={handleCompanyChange}
          refreshTrigger={refreshReserveStudies}
          selectedAssociationData={selectedAssociationData}
        />
      
        <div ref={viewMenuRef} className="view-menu-container">
          <button 
            className={`view-menu-button ${!selectedCompany ? 'disabled' : ''}`} 
            onClick={() => selectedCompany && setShowViewMenu(!showViewMenu)}
            disabled={!selectedCompany}
          >
            {selectedView} <i className={selectedView === 'Graph View' ? 'fas fa-chart-bar' : 'fas fa-list'}></i>
          </button>
          
          {showViewMenu && selectedCompany && (
            <div className="view-menu">
              <div className="view-menu-item" onClick={() => { 
                console.log('[SimulatorSubheader] Graph View clicked');
                setSelectedView('Graph View');
                setShowViewMenu(false);
                viewModeEmitter.emit('viewModeChange', 'graph');
              }}>
                <i className="fas fa-chart-bar view-menu-icon"></i>
                Graph View
              </div>
              <div className="view-menu-item" onClick={() => { 
                console.log('[SimulatorSubheader] List View clicked');
                setSelectedView('List View');
                setShowViewMenu(false);
                viewModeEmitter.emit('viewModeChange', 'list');
              }}>
                <i className="fas fa-list view-menu-icon"></i>
                List View
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="right-section">
        <div ref={userDropdownRef} className={`users-container ${!selectedCompany ? 'disabled' : ''}`} style={{ position: 'relative' }}>
          {users.map((user, index) => (
            <div 
              key={user._id} 
              className={`user-avatar ${!selectedCompany ? 'disabled' : ''}`}
              style={{ zIndex: 30 - (index * 10), cursor: selectedCompany ? 'pointer' : 'not-allowed' }}
              onClick={() => {
                if (!selectedCompany) return;
                setShowUserDropdown(!showUserDropdown);
                if (!showUserDropdown) fetchDropdownUsers();
              }}
            >
              {user.firstName?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          ))}
          <button 
            className={`add-user-button ${!selectedCompany ? 'disabled' : ''}`}
            onClick={() => selectedCompany && setShowInvitePopup(true)}
            disabled={!selectedCompany}
          >
            <i className="fas fa-user"></i>
          </button>
          {showUserDropdown && selectedCompany && (
            <div style={{
              position: 'absolute',
              top: '45px',
              right: '0',
              width: '400px',
              minHeight: '400px',
              background: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '10px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              zIndex: 1000
            }}>
              <div style={{ padding: '12px' }}>
                <input
                  type="text"
                  placeholder="Search by name"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>
              <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                {filteredDropdownUsers.length > 0 ? (
                  filteredDropdownUsers.map((user, index) => (
                    <div
                      key={user._id}
                      style={{
                        padding: '12px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        borderBottom: index < filteredDropdownUsers.length - 1 ? '1px solid #f3f4f6' : 'none'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                    >
                      <span style={{ fontSize: '14px', color: '#111827', fontWeight: '500' }}>
                        {user.firstName} {user.lastName}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          fontSize: '12px',
                          color: user.role === 'Manager' ? '#10b981' : '#6b7280',
                          fontWeight: '500'
                        }}>
                          {user.role}
                        </span>
                        <div style={{ position: 'relative' }}>
                          <span 
                            style={{ color: '#9ca3af', cursor: 'pointer' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedUserMenu(selectedUserMenu === user._id ? null : user._id);
                            }}
                          >
                            ...
                          </span>
                          {selectedUserMenu === user._id && (
                            <div style={{
                              position: 'absolute',
                              top: '20px',
                              right: '-10px',
                              background: 'white',
                              border: '1px solid #e5e7eb',
                              borderRadius: '6px',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                              zIndex: 1001,
                              minWidth: '120px' 
                          
                            }}>
                              <div 
                                style={{ padding: '4px 12px', cursor: 'pointer', fontSize: '12px', minHeight: '20px', display: 'flex', alignItems: 'center' }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                                onClick={() => setSelectedUserMenu(null)}
                              >
                                Change Name
                              </div>
                              <div 
                                style={{ padding: '4px 12px', cursor: 'pointer', fontSize: '12px', minHeight: '20px', display: 'flex', alignItems: 'center' }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                                onClick={() => setSelectedUserMenu(null)}
                              >
                                Inactive
                              </div>
                              <div 
                                style={{ padding: '4px 12px', cursor: 'pointer', fontSize: '12px', color: '#ef4444', minHeight: '20px', display: 'flex', alignItems: 'center' }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                                onClick={() => setSelectedUserMenu(null)}
                              >
                                Remove
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>
                    No users found
                  </div>
                )}
              </div>
              <div style={{
                padding: '12px 16px',
                borderTop: '1px solid #f3f4f6',
                background: '#f9fafb',
                marginTop: 'auto',
                   position: 'absolute',
                    bottom:'0px',
                    width:'100%'
              }}>
                <button 
                  onClick={() => {
                    setShowInvitePopup(true);
                    setShowUserDropdown(false);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#374151',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    padding: '0',
                 
                  }}
                >
                  + Send Invite
                </button>
              </div>
            </div>
          )}
        </div>
        <button 
          className={`action-button ${!selectedCompany ? 'disabled' : ''}`}
          onClick={() => selectedCompany && onReset && onReset()}
          disabled={!selectedCompany}
        >
          <i className="fas fa-undo"></i> Reset All
        </button>
        <button 
          className={`icon-button ${!selectedCompany ? 'disabled' : ''}`}
          onClick={() => selectedCompany && onUndo && onUndo()}
          disabled={!selectedCompany}
        >
          <i className="fas fa-undo"></i>
        </button>
        <button 
          className={`icon-button ${!selectedCompany ? 'disabled' : ''}`}
          onClick={() => selectedCompany && onRedo && onRedo()}
          disabled={!selectedCompany}
        >
          <i className="fas fa-redo"></i>
        </button>
        <button 
          className={`save-button ${!selectedCompany ? 'disabled' : ''}`}
          onClick={() => selectedCompany && onSave && onSave()}
          disabled={!selectedCompany}
        >
          Save Changes <i className="fas fa-save"></i>
        </button>
      </div>
      
      <InviteMemberModal 
        isOpen={showInvitePopup && !!selectedCompany} 
        onClose={() => setShowInvitePopup(false)} 
        title="Invite Member"
      />
      
      <AddAssociationPopup
        isOpen={showCreateAssociationPopup}
        onClose={() => setShowCreateAssociationPopup(false)}
        onSuccess={() => {
          setShowCreateAssociationPopup(false);
          setRefreshAssociations(prev => prev + 1);
        }}
      />
      
      <AddReserveStudyPopup
        isOpen={showAddReserveStudyPopup}
        onClose={() => setShowAddReserveStudyPopup(false)}
        onSuccess={(newStudyId, newStudyName) => {
          console.log('[SimulatorSubheader] New study created:', { newStudyId, newStudyName });
          setShowAddReserveStudyPopup(false);
          
          if (newStudyId && newStudyName && onCompanyChange) {
            console.log('[SimulatorSubheader] Auto-selecting new study...');
            
            // Step 1: Update local state immediately
            console.log('[SimulatorSubheader] Setting up new study:', newStudyId);
            setSelectedStudyId(newStudyId);
            setIsLoadingData(false);
            setFetchingStudyId('');
            setLastFetchedStudy(''); // Clear to allow new study fetch
            setSelectedView('Graph View');
            
            // Step 2: Notify parent components
            onCompanyChange(newStudyName, newStudyId);
            
            // Step 3: Switch to graph view
            viewModeEmitter.emit('viewModeChange', 'graph');
            
            // Step 4: Trigger calculator load
            studySelectionEmitter.emit('newStudyAdded', {
              studyId: newStudyId,
              studyName: newStudyName,
              association: selectedAssociation
            });
            
            // Step 5: Refresh dropdown to show new study at top
            setRefreshReserveStudies(prev => prev + 1);
            
            // Step 6: Force calculator load after state updates
            setTimeout(() => {
              if (onShowCalculator && selectedAssociation) {
                console.log('[SimulatorSubheader] Force triggering calculator...');
                onShowCalculator(selectedAssociation, newStudyName);
              }
            }, 500);
          }
        }}
        selectedAssociation={selectedAssociation}
      />
    </div>
  );
};

export default SimulatorSubheader;