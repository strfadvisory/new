import React, { useState, useEffect, useRef } from 'react';
import { API_ENDPOINTS } from '../config';
import { apiService } from '../services/ApiService';
import InviteMemberModal from './InviteMemberModal';
import AddAssociationPopup from './AddAssociationPopup';
import AddReserveStudyPopup from './AddReserveStudyPopup';
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
  onSelectionChange?: (value: string) => void;
  refreshTrigger?: number;
  associationFilter?: string;
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
  associationFilter
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
    if (showReserveStudyList && associationFilter !== undefined) {
      setReserveStudies([]);
      if (associationFilter) {
        fetchReserveStudies();
      }
    }
  }, [associationFilter, showReserveStudyList]);

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
  }, [isOpen, showCompanyList, showUserList, showAssociationsList, showReserveStudyList, companies.length, users.length, associations.length, reserveStudies.length]);

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
      setAssociations(Array.isArray(data) ? data : [
        { _id: '1', name: 'Homeowners Association A', type: 'HOA' },
        { _id: '2', name: 'Community Board B', type: 'Community' },
        { _id: '3', name: 'Property Management Group', type: 'Management' },
        { _id: '4', name: 'Residents Council', type: 'Council' },
        { _id: '5', name: 'Building Committee', type: 'Committee' }
      ]);
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
      let url = '/reserve-studies';
      if (associationFilter) {
        url += `?association=${encodeURIComponent(associationFilter)}`;
      }
      const response = await apiService.get<{data: ReserveStudy[]}>(url);
      setReserveStudies(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching reserve studies:', error);
      setReserveStudies([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredReserveStudies = reserveStudies.filter(study =>
    (study.studyName || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          }}></div>
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
                        onSelectionChange(association.name);
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
                      {association.name.charAt(0).toUpperCase()}
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
                      gap: '12px',
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
                        onSelectionChange(study.studyName);
                      }
                      setIsOpen(false);
                    }}
                  >
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
    </div>
  );
};

interface SimulatorSubheaderProps {
  onChangeView?: () => void;
  onReset?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onSave?: () => void;
  onShowCalculator?: (association: string, reserveStudy: string) => void;
  selectedAssociation?: string;
  selectedCompany?: string;
  onAssociationChange?: (value: string) => void;
  onCompanyChange?: (value: string) => void;
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
  const viewMenuRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedAssociation && selectedCompany && onShowCalculator) {
      onShowCalculator(selectedAssociation, selectedCompany);
    }
  }, [selectedAssociation, selectedCompany, onShowCalculator]);

  useEffect(() => {
    if (selectedAssociation) {
      onCompanyChange?.('');
      setRefreshReserveStudies(prev => prev + 1);
    }
  }, [selectedAssociation, onCompanyChange]);

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
  return (
    <div className="simulator-subheader">
      <div className="left-section">
        <Dropdown 
          label="Associations" 
          icon={<div />} 
          showAssociationsList={true} 
          bottomButtonText="+ Create an Associations" 
          onBottomButtonClick={() => setShowCreateAssociationPopup(true)}
          selectedValue={selectedAssociation}
          onSelectionChange={onAssociationChange}
          refreshTrigger={refreshAssociations}
        />
        <Dropdown 
          label="Reserve Studies" 
          icon={<div />} 
          showReserveStudyList={true} 
          bottomButtonText="+ Add New Reserve Study"
          onBottomButtonClick={() => setShowAddReserveStudyPopup(true)}
          selectedValue={selectedCompany}
          onSelectionChange={onCompanyChange}
          refreshTrigger={refreshReserveStudies}
          associationFilter={selectedAssociation}
        />
      
        <div ref={viewMenuRef} className="view-menu-container">
          <button className="view-menu-button" onClick={() => setShowViewMenu(!showViewMenu)}>
            Change View <i className="fas fa-chart-bar"></i>
          </button>
          
          {showViewMenu && (
            <div className="view-menu">
              <div className="view-menu-item" onClick={() => { console.log('Graph View selected'); setShowViewMenu(false); }}>
                <i className="fas fa-chart-bar view-menu-icon"></i>
                Graph View
              </div>
              <div className="view-menu-item" onClick={() => { console.log('List View selected'); setShowViewMenu(false); }}>
                <i className="fas fa-list view-menu-icon"></i>
                List View
              </div>
              <div className="view-menu-item" onClick={() => { console.log('Monthly selected'); setShowViewMenu(false); }}>
                <i className="fas fa-calendar view-menu-icon"></i>
                Monthly
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="right-section">
        <div ref={userDropdownRef} className="users-container" style={{ position: 'relative' }}>
          {users.map((user, index) => (
            <div 
              key={user._id} 
              className="user-avatar" 
              style={{ zIndex: 30 - (index * 10), cursor: 'pointer' }}
              onClick={() => {
                setShowUserDropdown(!showUserDropdown);
                if (!showUserDropdown) fetchDropdownUsers();
              }}
            >
              {user.firstName?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          ))}
          <button className="add-user-button" onClick={() => setShowInvitePopup(true)}>
            <i className="fas fa-user"></i>
          </button>
          {showUserDropdown && (
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
        <button className="action-button" onClick={onReset}>
          <i className="fas fa-undo"></i> Reset All
        </button>
        <button className="icon-button" onClick={onUndo}>
          <i className="fas fa-undo"></i>
        </button>
        <button className="icon-button" onClick={onRedo}>
          <i className="fas fa-redo"></i>
        </button>
        <button className="save-button" onClick={onSave}>
          Save Changes <i className="fas fa-save"></i>
        </button>
      </div>
      
      <InviteMemberModal 
        isOpen={showInvitePopup} 
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
        onSuccess={() => {
          setShowAddReserveStudyPopup(false);
          setRefreshReserveStudies(prev => prev + 1);
        }}
        selectedAssociation={selectedAssociation}
      />
    </div>
  );
};

export default SimulatorSubheader;