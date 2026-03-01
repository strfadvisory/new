import React from 'react';

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
  return (
    <div className="companies-right-content" style={{ padding: '32px', height: '100vh', overflow: 'auto' }}>
      {selectedItem ? (
        <div className="library-details">
          {/* Header Section */}
          <div className="library-header" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '32px',
            paddingBottom: '24px',
            borderBottom: '1px solid #e5e7eb'
          }}>
            <div className="library-info" style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
              <div className="library-thumbnail" style={{
                flexShrink: 0,
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
              }}>
                <img 
                  src={selectedItem.thumbnail} 
                  alt={selectedItem.title}
                  style={{ 
                    width: '160px', 
                    height: '90px', 
                    objectFit: 'cover',
                    display: 'block'
                  }}
                />
              </div>
              <div className="library-meta" style={{ flex: 1 }}>
                <h1 style={{ 
                  fontSize: '28px', 
                  fontWeight: '700', 
                  color: '#111827',
                  margin: '0 0 12px 0',
                  lineHeight: '1.2'
                }}>
                  {selectedItem.title}
                </h1>
                <p style={{ 
                  fontSize: '16px',
                  color: '#6b7280', 
                  margin: '0 0 16px 0',
                  lineHeight: '1.5'
                }}>
                  {selectedItem.description}
                </p>
                <div className="status-badge" style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '14px',
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
            
            <div className="library-actions" style={{ display: 'flex', gap: '12px', flexShrink: 0 }}>
              <button 
                className="edit-btn"
                onClick={() => onEdit(selectedItem)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  backgroundColor: '#ffffff',
                  color: '#374151',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                  e.currentTarget.style.borderColor = '#9ca3af';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#ffffff';
                  e.currentTarget.style.borderColor = '#d1d5db';
                }}
              >
                <i className="fas fa-edit"></i>
                Edit
              </button>
              <button 
                className="delete-btn"
                onClick={() => onDelete(selectedItem._id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: '1px solid #fca5a5',
                  backgroundColor: '#fef2f2',
                  color: '#dc2626',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#fee2e2';
                  e.currentTarget.style.borderColor = '#f87171';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#fef2f2';
                  e.currentTarget.style.borderColor = '#fca5a5';
                }}
              >
                <i className="fas fa-trash"></i>
                Delete
              </button>
            </div>
          </div>

          {/* Video Section */}
          <div className="video-section">
            <div className="section-header" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '20px'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: '#3b82f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}>
                <i className="fas fa-play" style={{ fontSize: '16px' }}></i>
              </div>
              <h2 style={{ 
                fontSize: '20px', 
                fontWeight: '600',
                color: '#111827',
                margin: 0
              }}>
                Video Content
              </h2>
            </div>
            
            <div className="video-container" style={{ 
              backgroundColor: '#f8fafc',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}>
              <div className="video-wrapper" style={{
                position: 'relative',
                borderRadius: '12px',
                overflow: 'hidden',
                backgroundColor: '#000000',
                boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)'
              }}>
                <video 
                  controls 
                  style={{ 
                    width: '100%', 
                    height: 'auto',
                    minHeight: '300px',
                    maxHeight: '500px',
                    display: 'block'
                  }}
                  poster={selectedItem.thumbnail}
                >
                  <source src={selectedItem.videoUrl} type="video/mp4" />
                  <source src={selectedItem.videoUrl} type="video/webm" />
                  <source src={selectedItem.videoUrl} type="video/ogg" />
                  Your browser does not support the video tag.
                </video>
              </div>
              
              <div className="video-info" style={{ 
                marginTop: '20px',
                padding: '16px',
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '8px'
                }}>
                  <i className="fas fa-link" style={{ color: '#6b7280', fontSize: '14px' }}></i>
                  <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>Video URL:</span>
                </div>
                <a 
                  href={selectedItem.videoUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  style={{ 
                    color: '#3b82f6',
                    textDecoration: 'none',
                    fontSize: '14px',
                    wordBreak: 'break-all',
                    padding: '8px 12px',
                    backgroundColor: '#eff6ff',
                    borderRadius: '6px',
                    display: 'inline-block',
                    border: '1px solid #dbeafe',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#dbeafe';
                    e.currentTarget.style.textDecoration = 'underline';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = '#eff6ff';
                    e.currentTarget.style.textDecoration = 'none';
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
            padding: '48px',
            borderRadius: '16px',
            backgroundColor: '#f9fafb',
            border: '2px dashed #d1d5db',
            maxWidth: '400px'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: '#e5e7eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px'
            }}>
              <i className="fas fa-video" style={{ fontSize: '32px', color: '#9ca3af' }}></i>
            </div>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#374151',
              margin: '0 0 12px 0'
            }}>
              Select a Library Item
            </h3>
            <p style={{
              fontSize: '16px',
              color: '#6b7280',
              margin: 0,
              lineHeight: '1.5'
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