import React, { useState } from 'react';
import { apiService } from '../services/ApiService';

interface AddReserveStudyPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  selectedAssociation?: string;
}

const AddReserveStudyPopup: React.FC<AddReserveStudyPopupProps> = ({
  isOpen,
  onClose,
  onSuccess,
  selectedAssociation
}) => {
  const [studyName, setStudyName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
          file.type === 'application/vnd.ms-excel') {
        setSelectedFile(file);
        setError('');
      } else {
        setError('Please select a valid Excel file (.xlsx or .xls)');
        setSelectedFile(null);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!studyName.trim()) {
      setError('Study name is required');
      return;
    }
    
    if (!selectedFile) {
      setError('Excel file is required');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('studyName', studyName.trim());
      formData.append('excelFile', selectedFile);
      if (selectedAssociation) {
        formData.append('associationName', selectedAssociation);
      }

      await apiService.uploadFile('/reserve-studies', formData);

      setStudyName('');
      setSelectedFile(null);
      onSuccess();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to create reserve study');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setStudyName('');
    setSelectedFile(null);
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
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
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        width: '100%',
        maxWidth: '500px',
        margin: '20px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '24px',
            fontWeight: '600',
            color: '#1f2937'
          }}>
            Add New Reserve Study
          </h2>
          <button
            onClick={handleClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              color: '#6b7280',
              cursor: 'pointer',
              padding: '0',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Study Name *
            </label>
            <input
              type="text"
              value={studyName}
              onChange={(e) => setStudyName(e.target.value)}
              placeholder="Enter study name"
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '16px',
                outline: 'none',
                transition: 'border-color 0.2s',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              }}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Excel File *
            </label>
            <div style={{
              border: '2px dashed #e2e8f0',
              borderRadius: '8px',
              padding: '24px',
              textAlign: 'center',
              backgroundColor: '#f9fafb',
              cursor: 'pointer',
              transition: 'border-color 0.2s'
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.currentTarget.style.borderColor = '#3b82f6';
            }}
            onDragLeave={(e) => {
              e.currentTarget.style.borderColor = '#e2e8f0';
            }}
            onClick={() => document.getElementById('file-input')?.click()}
            >
              <input
                id="file-input"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <i className="fas fa-file-excel" style={{
                fontSize: '32px',
                color: '#10b981',
                marginBottom: '12px'
              }}></i>
              <p style={{
                margin: '0 0 8px 0',
                fontSize: '16px',
                fontWeight: '500',
                color: '#374151'
              }}>
                {selectedFile ? selectedFile.name : 'Click to upload or drag and drop'}
              </p>
              <p style={{
                margin: 0,
                fontSize: '14px',
                color: '#6b7280'
              }}>
                Excel files only (.xlsx, .xls)
              </p>
            </div>
          </div>

          {error && (
            <div style={{
              padding: '12px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              <p style={{
                margin: 0,
                fontSize: '14px',
                color: '#dc2626'
              }}>
                {error}
              </p>
            </div>
          )}

          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end'
          }}>
            <button
              type="button"
              onClick={handleClose}
              style={{
                padding: '12px 24px',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                backgroundColor: 'white',
                color: '#374151',
                fontSize: '16px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f9fafb';
                e.currentTarget.style.borderColor = '#cbd5e1';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
                e.currentTarget.style.borderColor = '#e2e8f0';
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              style={{
                padding: '12px 24px',
                border: 'none',
                borderRadius: '8px',
                backgroundColor: isLoading ? '#9ca3af' : '#0e519b',
                color: 'white',
                fontSize: '16px',
                fontWeight: '500',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.backgroundColor = '#1e40af';
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.backgroundColor = '#0e519b';
                }
              }}
            >
              {isLoading && (
                <i className="fas fa-spinner fa-spin"></i>
              )}
              {isLoading ? 'Creating...' : 'Create Study'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddReserveStudyPopup;