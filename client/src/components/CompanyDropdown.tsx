import React, { useState, useRef, useEffect } from "react";
import { API_ENDPOINTS } from '../config';

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
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => {
    setOpen(!open);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    const filtered = companies.filter(company => 
      company.companyName.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredCompanies(filtered);
  };

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(API_ENDPOINTS.companyDropdown, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          console.log('API Response:', data);
          const companiesData = data.companies || data || [];
          setCompanies(companiesData);
          setFilteredCompanies(companiesData);
        } else {
          console.error('API Error:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('Error fetching companies:', error);
      }
    };

    fetchCompanies();

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div style={styles.topbar} ref={dropdownRef}>
      <span style={styles.companyName}>
        {selectedCompany}
      </span>
{/* onClick={toggleMenu} */}
      <button style={styles.menuBtn}  >
        <img src="/3line.png" alt="Menu"   />
      </button>

      {open && (
        <div style={styles.popup}>
          <div style={styles.popupContent}>
            <div style={styles.searchBox}>
              <input
                type="text"
                placeholder="Search companies..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                style={styles.searchInput}
                autoFocus
              />
            </div>
            <div style={styles.companyList}>
              <div style={styles.debugInfo}>Companies: {companies.length}, Filtered: {filteredCompanies.length}</div>
              {filteredCompanies.length === 0 ? (
                <div style={styles.item}>No companies found</div>
              ) : (
                filteredCompanies.map((company) => {
                  console.log('Rendering company:', company);
                  return (
                    <div 
                      key={company._id}
                      style={styles.item}
                      onClick={() => {
                        setSelectedCompany(company.companyName);
                        setOpen(false);
                        setSearchTerm('');
                      }}
                    >
                      {company.companyName || 'No name'}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  topbar: {
   
    padding: "12px 20px",
    width:'300px',
    color: "white",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    position: "relative" as const,
  },
  companyName: {
    fontSize: "15px",
    fontWeight: "500",
  },
  menuBtn: {
    background: "transparent",
    border: "none",
    color: "white",
    fontSize: "20px",
    cursor: "pointer",
    opacity:0   ,
  },
  dropdown: {
    position: "absolute" as const,
    right: "20px",
    top: "50px",
    width: "180px",
    background: "#fff",
    color: "#333",
    borderRadius: "6px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
  },
  popup: {
    position: "fixed" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  popupContent: {
    backgroundColor: "#fff",
    borderRadius: "8px",
    width: "400px",
    maxHeight: "500px",
    overflow: "hidden",
    boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
  },
  searchBox: {
    padding: "16px",
    borderBottom: "1px solid #eee",
  },
  searchInput: {
    width: "100%",
    padding: "12px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "16px",
    outline: "none",
  },
  companyList: {
    maxHeight: "300px",
    overflowY: "auto" as const,
  },
  item: {
    padding: "12px 16px",
    borderBottom: "1px solid #eee",
    cursor: "pointer",
    color: "#333",
  },
  debugInfo: {
    padding: "8px 16px",
    fontSize: "12px",
    color: "#666",
    backgroundColor: "#f5f5f5",
  },
};

export default CompanyDropdown;