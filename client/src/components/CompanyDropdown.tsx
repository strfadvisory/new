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
        <div className="company-name" style={{color:"white"}}>{selectedCompany} </div>
        <div className="user-role" style={{color:"white"}}>{profile?.role}</div>
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
                  <div key={company._id} className="company-card" onClick={() => handleCompanySelect(company.companyName)}>
                    <div className="company-avatar">
                      {company.companyName.charAt(0).toUpperCase()}
                    </div>
                    <div className="company-details">
                      <div className="company-name">{company.companyName}</div>
                      <div className="company-type">No Contact Person</div>
                      <div className="company-address">Address</div>
                    </div>
                    <button 
                      className="select-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCompanySelect(company.companyName);
                      }}
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
          background-color: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        
        .popup-modal {
          background-color: white;
          border-radius: 8px;
          width: 100%;
          max-width: 500px;
          max-height: 80vh;
          margin: 20px;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .popup-header {
          padding: 24px 24px 20px 24px;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .popup-header h3 {
          margin: 0;
          font-size: 20px;
          font-weight: 600;
          color: #111827;
          line-height: 1.2;
        }
        
        .close-btn {
          background: none;
          border: none;
          font-size: 20px;
          color: #6b7280;
          cursor: pointer;
          padding: 0;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          transition: all 0.2s ease;
        }
        
        .close-btn:hover {
          background-color: #f3f4f6;
          color: #374151;
        }
        
        .search-container {
          padding: 0 24px 20px 24px;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .search-input {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
          outline: none;
          box-sizing: border-box;
          background-color: #f9fafb;
          color: #6b7280;
        }
        
        .search-input:focus {
          border-color: #2b6cb0;
          background-color: white;
        }
        
        .company-list {
          max-height: 400px;
          overflow-y: auto;
          padding: 0;
        }
        
        .company-card {
          display: flex;
          align-items: center;
          padding: 16px 24px;
          border-bottom: 1px solid #f3f4f6;
          gap: 16px;
          background-color: white;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }
        
        .company-card:last-child {
          border-bottom: none;
        }
        
        .company-card:hover {
          background-color: #f9fafb;
        }
        
        .company-avatar {
          width: 48px;
          height: 48px;
          background-color: #f3f4f6;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          font-weight: 600;
          color: #6b7280;
        }
        
        .company-details {
          flex: 1;
          min-width: 0;
        }
        
        .company-card .company-name {
          font-size: 16px;
          font-weight: 600;
          color: #111827;
          margin: 0 0 4px 0;
          line-height: 1.2;
        }
        
        .company-type {
          font-size: 14px;
          color: #9ca3af;
          margin: 0 0 2px 0;
          line-height: 1.2;
        }
        
        .company-address {
          font-size: 14px;
          color: #9ca3af;
          margin: 0;
          line-height: 1.2;
        }
        
        .select-btn {
          background-color: white;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          padding: 10px 20px;
          font-size: 14px;
          font-weight: 500;
          color: #374151;
          cursor: pointer;
          transition: all 0.2s ease;
          flex-shrink: 0;
          min-width: 80px;
        }
        
        .select-btn:hover {
          background-color: #f3f4f6;
          border-color: #9ca3af;
        }
        
        .popup-footer {
          padding: 16px 20px;
          border-top: 1px solid #e6e6e6;
          text-align: center;
          font-family: 'DM Sans';
          font-weight: 700;
          font-size: 16px;
          line-height: 24px;
        }
        
        .add-company-btn {
          background: none;
          border: none;
          color: #1f4f8f;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          padding: 0;
          font-family: 'DM Sans';
          text-decoration: none;
        }
        
        .add-company-btn:hover {
          color: #173f74;
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