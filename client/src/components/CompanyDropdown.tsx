import React, { useState, useRef, useEffect } from "react";
import { API_ENDPOINTS } from '../config';
import { useProfile } from '../hooks/queries/useAuth';

interface Company {
  _id: string;
  companyName: string;
}

const CompanyDropdown = () => {
  const [open, setOpen] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<string>('Reserve Fund Advisory');
  const { data: profile } = useProfile();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => setOpen(!open);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    const filtered = companies.filter(company => 
      company.companyName.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredCompanies(filtered);
  };

  const handleCompanySelect = (companyName: string) => {
    setSelectedCompany(companyName);
    setOpen(false);
    setSearchTerm('');
  };

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(API_ENDPOINTS.companyDropdown, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        
        if (response.ok) {
          const data = await response.json();
          const companiesData = data.companies || data || [];
          setCompanies(companiesData);
          setFilteredCompanies(companiesData);
        }
      } catch (error) {
        console.error('Error fetching companies:', error);
      }
    };

    fetchCompanies();

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (profile?.companyProfile?.companyName) {
      setSelectedCompany(profile.companyProfile.companyName);
    }
  }, [profile]);

  return (
    <div className="company-dropdown" ref={dropdownRef}>
      <div className="company-info">
        <div className="company-name">{selectedCompany}sss</div>
        <div className="user-role">{profile?.role}</div>
      </div>
      
      <button className="menu-toggle" onClick={toggleMenu}>
        <img src="/3line.png" alt="Menu" />
      </button>

      {open && (
        <div className="popup-overlay">
          <div className="popup-modal">
            <div className="popup-header">
              <h3>Change Company</h3>
              <button className="close-btn" onClick={() => setOpen(false)}>×</button>
            </div>
            
            <div className="search-container">
              <input
                type="text"
                placeholder="Search by name"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="search-input"
                autoFocus
              />
            </div>
            
            <div className="company-list">
              {filteredCompanies.length === 0 ? (
                <div className="no-results">No companies found</div>
              ) : (
                filteredCompanies.map((company) => (
                  <div key={company._id} className="company-card">
                    <div className="company-avatar"></div>
                    <div className="company-details">
                      <div className="company-name">{company.companyName}</div>
                      <div className="company-type">Admin Type</div>
                      <div className="company-address">Address</div>
                    </div>
                    <button 
                      className="select-btn"
                      onClick={() => handleCompanySelect(company.companyName)}
                    >
                      Select
                    </button>
                  </div>
                ))
              )}
            </div>
            
            <div className="popup-footer">
              <button className="add-company-btn">+Add New Company Profile</button>
            </div>
          </div>
        </div>
      )}
      
      <style>{`
        .company-dropdown {
          padding: 12px 20px;
          width: 300px;
          color: white;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: relative;
        }
        
        .company-info {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          flex: 1;
        }
        
        .company-name {
          font-size: 15px;
          font-weight: 500;
          color: white;
          line-height: 1.2;
          margin-bottom: 2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 200px;
        }
        
        .user-role {
          color: #6C9CD2;
          font-size: 12px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 400;
          line-height: 1;
        }
        
        .menu-toggle {
          background: transparent;
          border: none;
          color: white;
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .menu-toggle img {
          width: 20px;
          height: 20px;
        }
        
        .popup-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        
        .popup-modal {
          background-color: white;
          border-radius: 12px;
          width: 500px;
          max-height: 600px;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        }
        
        .popup-header {
          padding: 20px 24px;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .popup-header h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: #374151;
        }
        
        .close-btn {
          background: none;
          border: none;
          font-size: 24px;
          color: #9ca3af;
          cursor: pointer;
          padding: 0;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .search-container {
          padding: 20px 24px;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .search-input {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          box-sizing: border-box;
          background-color: #f9fafb;
        }
        
        .search-input:focus {
          border-color: #3b82f6;
          background-color: white;
        }
        
        .company-list {
          max-height: 350px;
          overflow-y: auto;
          padding: 16px 24px;
        }
        
        .company-card {
          display: flex;
          align-items: center;
          padding: 16px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          margin-bottom: 12px;
          background-color: #f9fafb;
        }
        
        .company-avatar {
          width: 48px;
          height: 48px;
          background-color: #d1d5db;
          border-radius: 8px;
          margin-right: 16px;
        }
        
        .company-details {
          flex: 1;
        }
        
        .company-card .company-name {
          font-size: 16px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 4px;
        }
        
        .company-type {
          font-size: 14px;
          color: #6b7280;
          margin-bottom: 2px;
        }
        
        .company-address {
          font-size: 14px;
          color: #6b7280;
        }
        
        .select-btn {
          background-color: white;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          padding: 8px 16px;
          font-size: 14px;
          font-weight: 500;
          color: #374151;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .select-btn:hover {
          background-color: #f3f4f6;
          border-color: #9ca3af;
        }
        
        .popup-footer {
          padding: 20px 24px;
          border-top: 1px solid #e5e7eb;
        }
        
        .add-company-btn {
          background: none;
          border: none;
          color: #3b82f6;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          padding: 0;
        }
        
        .add-company-btn:hover {
          text-decoration: underline;
        }
        
        .no-results {
          padding: 40px 20px;
          text-align: center;
          color: #6b7280;
          font-style: italic;
        }
      `}</style>
    </div>
  );
};

export default CompanyDropdown;