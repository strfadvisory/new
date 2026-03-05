import React, { useState, useEffect, useRef } from 'react';

interface LibraryItem {
  _id: string;
  title: string;
  description: string;
  thumbnail: string;
  videoUrl: string;
  isActive: boolean;
  createdAt: string;
}

interface LibraryProps {
  selectedItem: LibraryItem | null;
  onEdit: (item: LibraryItem) => void;
  onDelete: (itemId: string) => void;
}

const Library: React.FC<LibraryProps> = ({ selectedItem, onEdit, onDelete }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleEdit = () => {
    onEdit(selectedItem!);
    setDropdownOpen(false);
  };

  const handleDelete = () => {
    onDelete(selectedItem!._id);
    setDropdownOpen(false);
  };
  return (
    <div className="companies-right-panel" style={{ padding: '32px', height: '100vh', overflow: 'auto', background: 'white' }}>
      {selectedItem ? (
        <div className="library-details" style={{ maxWidth: '800px', margin: '0 auto' }}>
          {/* Header Section */}
          <div className="company-detail-header" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '32px',
            paddingBottom: '24px',
            borderBottom: '1px solid #e5e7eb'
          }}>
            <div className="library-info" style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
              <div className="logobox" style={{
                width: '80px',
                height: '80px',
                borderRadius: '12px',
                overflow: 'hidden',
                background: '#f1f5f9',
                border: '1px solid #e2e8f0'
              }}>
                <img 
                  src={selectedItem.thumbnail || '/logo.png'} 
                  alt={selectedItem.title}
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover',
                    display: 'block'
                  }}
                />
              </div>
              <div className="companybox" style={{ flex: 1 }}>
                <h1 className="company-detail-title" style={{ 
                  fontSize: '24px', 
                  fontWeight: '600', 
                  color: '#1f2937',
                  margin: '0 0 8px 0',
                  lineHeight: '1.2'
                }}>
                  {selectedItem.title}
                </h1>
                <p className="company-level" style={{ 
                  fontSize: '13px',
                  color: '#0ea5e9', 
                  margin: '0 0 8px 0',
                  fontWeight: '600'
                }}>
                  Library Content
                </p>
                <p className="company-address" style={{ 
                  fontSize: '13px',
                  color: '#64748b', 
                  margin: '0 0 12px 0',
                  lineHeight: '1.3'
                }}>
                  {selectedItem.description}
                </p>
                <div className="status-badge" style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '500',
                  backgroundColor: selectedItem.isActive ? '#dcfce7' : '#fee2e2',
                  color: selectedItem.isActive ? '#166534' : '#dc2626'
                }}>
                  <div style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: selectedItem.isActive ? '#22c55e' : '#ef4444'
                  }}></div>
                  {selectedItem.isActive ? 'Active' : 'Inactive'}
                </div>
              </div>
            </div>
            
            <div className="custom-dropdown" ref={dropdownRef}>
              <button className="dropdown-btn" onClick={toggleDropdown}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13Z" fill="currentColor"/>
                  <path d="M12 6C12.5523 6 13 5.55228 13 5C13 4.44772 12.5523 4 12 4C11.4477 4 11 4.44772 11 5C11 5.55228 11.4477 6 12 6Z" fill="currentColor"/>
                  <path d="M12 20C12.5523 20 13 19.5523 13 19C13 18.4477 12.5523 18 12 18C11.4477 18 11 18.4477 11 19C11 19.5523 11.4477 20 12 20Z" fill="currentColor"/>
                </svg>
              </button>
              {dropdownOpen && (
                <div className="dropdown-content">
                  <button className="dropdown-option" onClick={handleEdit}>
                    <i className="fas fa-edit" style={{ marginRight: '8px' }}></i>
                    Edit
                  </button>
                  <button className="dropdown-option danger" onClick={handleDelete}>
                    <i className="fas fa-trash" style={{ marginRight: '8px' }}></i>
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Video Section */}
          <div className="detail-section">
            <div className="section-header">
              <h3 className="detail-label" style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#1f2937',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <i className="fas fa-play" style={{ color: '#0e519b', fontSize: '16px' }}></i>
                Video Content
              </h3>
            </div>
            
            <div className="video-container" style={{ 
              backgroundColor: '#fafbfc',
              borderRadius: '8px',
              padding: '20px',
              border: '1px solid #e2e8f0'
            }}>
              <div className="video-wrapper" style={{
                position: 'relative',
                borderRadius: '8px',
                overflow: 'hidden',
                backgroundColor: '#000000'
              }}>
                <video 
                  controls 
                  style={{ 
                    width: '100%', 
                    height: 'auto',
                    minHeight: '280px',
                    maxHeight: '400px',
                    display: 'block'
                  }}
                  poster={selectedItem.thumbnail || '/logo.png'}
                >
                  <source src={selectedItem.videoUrl} type="video/mp4" />
                  <source src={selectedItem.videoUrl} type="video/webm" />
                  <source src={selectedItem.videoUrl} type="video/ogg" />
                  Your browser does not support the video tag.
                </video>
              </div>
              
              <div className="video-info" style={{ 
                marginTop: '16px',
                padding: '12px',
                backgroundColor: '#ffffff',
                borderRadius: '6px',
                border: '1px solid #f1f5f9'
              }}>
                <div className="detail-label" style={{ 
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#1e293b',
                  marginBottom: '6px'
                }}>
                  Video URL
                </div>
                <a 
                  href={selectedItem.videoUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="detail-value"
                  style={{ 
                    color: '#0079FF',
                    textDecoration: 'none',
                    fontSize: '13px',
                    wordBreak: 'break-all',
                    display: 'block'
                  }}
                >
                  {selectedItem.videoUrl}
                </a>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="no-selection" style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '60vh',
          textAlign: 'center'
        }}>
          <div className="empty-state" style={{
            padding: '40px',
            borderRadius: '12px',
            backgroundColor: '#fafbfc',
            border: '1px dashed #e2e8f0',
            maxWidth: '360px'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px'
            }}>
              <i className="fas fa-video" style={{ fontSize: '24px', color: '#64748b' }}></i>
            </div>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1e293b',
              margin: '0 0 8px 0'
            }}>
              Select a Library Item
            </h3>
            <p style={{
              fontSize: '14px',
              color: '#64748b',
              margin: 0,
              lineHeight: '1.4'
            }}>
              Choose a library item from the left panel to view and manage video content
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Library;