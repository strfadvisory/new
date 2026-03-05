import React, { useState, useEffect, useRef } from 'react';
import { API_ENDPOINTS } from '../config';

interface Company {
  _id: string;
  name: string;
  description?: string;
  icon?: string;
}

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface DropdownProps {
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  style?: React.CSSProperties;
  showCompanyList?: boolean;
  bottomButtonText?: string;
}

const Dropdown: React.FC<DropdownProps> = ({ 
  label, 
  icon, 
  onClick, 
  style,
  showCompanyList = false,
  bottomButtonText = '+ Add New Associations'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showCompanyList && isOpen && companies.length === 0) {
      fetchCompanies();
    }
  }, [isOpen, showCompanyList]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.companyTypes);
      const data = await response.json();
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
    company.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDropdownClick = () => {
    if (showCompanyList) {
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
        {label}
        <i className="fas fa-chevron-down" style={{ fontSize: '16px' }}></i>
      </div>

      {showCompanyList && isOpen && (
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
            maxHeight: '300px',
            overflowY: 'auto'
          }}>
            {loading ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>
                Loading...
              </div>
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
            <button style={{
              background: 'none',
              border: 'none',
              color: '#374151',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              padding: '0'
            }}>
              {bottomButtonText}
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
}

const SimulatorSubheader: React.FC<SimulatorSubheaderProps> = ({
  onChangeView,
  onReset,
  onUndo,
  onRedo,
  onSave
}) => {
  const [showViewMenu, setShowViewMenu] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const viewMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (viewMenuRef.current && !viewMenuRef.current.contains(event.target as Node)) {
        setShowViewMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/users');
      const data = await response.json();
      setUsers(Array.isArray(data) ? data.slice(0, 3) : []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    }
  };
  return (
    <div style={{
      height: '56px',
      width: '100%',
      background: '#f3f4f6',
      borderBottom: '1px solid #e5e7eb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px'
    }}>
      {/* Left Section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Dropdown label="Stepssevers-M3235" icon={<div />} showCompanyList={true} />
        <Dropdown label="Stepssevers-M3235" icon={<div />} showCompanyList={true} bottomButtonText="+ Add New Reserver Study" />
        <div ref={viewMenuRef} style={{ position: 'relative' }}>
          <button 
            style={{
              height: '36px',
              padding: '0 16px',
              borderRadius: '10px',
              border: '1px solid #e5e7eb',
              background: 'white',
              fontSize: '14px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer'
            }}
            onClick={() => setShowViewMenu(!showViewMenu)}
          >
            Change View <i className="fas fa-chart-bar"></i>
          </button>
          
          {showViewMenu && (
            <div style={{
              position: 'absolute',
              top: '40px',
              left: '0',
              width: '150px',
              background: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              zIndex: 1000,
              overflow: 'hidden'
            }}>
              <div
                style={{
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  borderBottom: '1px solid #f3f4f6'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                }}
                onClick={() => {
                  console.log('Graph View selected');
                  setShowViewMenu(false);
                }}
              >
                <i className="fas fa-chart-bar" style={{ width: '16px' }}></i>
                Graph View
              </div>
              <div
                style={{
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  borderBottom: '1px solid #f3f4f6'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                }}
                onClick={() => {
                  console.log('List View selected');
                  setShowViewMenu(false);
                }}
              >
                <i className="fas fa-list" style={{ width: '16px' }}></i>
                List View
              </div>
              <div
                style={{
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                }}
                onClick={() => {
                  console.log('Monthly selected');
                  setShowViewMenu(false);
                }}
              >
                <i className="fas fa-calendar" style={{ width: '16px' }}></i>
                Monthly
              </div>
            </div>
          )}
        </div>
 
      </div>
      
      {/* Right Section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '20px',
          padding: '4px 8px 4px 4px',
          gap: '4px'
        }}>
          {users.map((user, index) => (
            <div key={user._id} style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: '#e9d5ff',
              color: '#4c1d95',
              fontSize: '12px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid white',
              boxShadow: '0 0 0 1px rgba(0,0,0,0.05)',
              marginLeft: index === 0 ? '0' : '-8px',
              position: 'relative',
              zIndex: 30 - (index * 10)
            }}>
              {user.firstName?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          ))}
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: '#f3f4f6',
            color: '#6b7280',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: '4px'
          }}>
            <i className="fas fa-user"></i>
          </div>
        </div>
        <button 
          style={{
            height: '36px',
            padding: '0 14px',
            borderRadius: '10px',
            border: '1px solid #e5e7eb',
            background: 'white',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer'
          }}
          onClick={onReset}
        >
          <i className="fas fa-undo"></i> Reset All
        </button>
        <button 
          style={{
            width: '36px',
            height: '36px',
            border: '1px solid #e5e7eb',
            borderRadius: '10px',
            background: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
          onClick={onUndo}
        >
          <i className="fas fa-undo"></i>
        </button>
        <button 
          style={{
            width: '36px',
            height: '36px',
            border: '1px solid #e5e7eb',
            borderRadius: '10px',
            background: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
          onClick={onRedo}
        >
          <i className="fas fa-redo"></i>
        </button>
        <button 
          style={{
            height: '36px',
            padding: '0 18px',
            borderRadius: '10px',
            background: '#facc15',
            color: '#111827',
            fontWeight: '600',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
          }}
          onClick={onSave}
        >
          Save Changes <i className="fas fa-save"></i>
        </button>
      </div>
    </div>
  );
};

export default SimulatorSubheader;