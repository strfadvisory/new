import React, { useState } from 'react';
import { apiService } from '../services/ApiService';
import { refreshReserveStudiesDropdown } from '../utils/eventEmitter';
import { usePermissions } from '../hooks/usePermissions';

interface AddReserveStudyPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newStudyId?: string, newStudyName?: string) => void;
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
  
  // Get current user permissions
  const { canAddReserveStudy, permissionLevel, loading: permissionsLoading } = usePermissions();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!canAddReserveStudy()) {
      setError(`${permissionLevel} access - Contact admin for permissions`);
      return;
    }
    
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
    
    if (!canAddReserveStudy()) {
      setError(`${permissionLevel} access - Contact admin for permissions`);
      return;
    }
    
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

      const response = await apiService.uploadFile('/reserve-studies', formData) as any;
      
      console.log('[AddReserveStudyPopup] Study created successfully:', response);
      
      // Trigger dropdown refresh immediately after successful API call
      refreshReserveStudiesDropdown();
      
      const inputStudyName = studyName.trim();
      setStudyName('');
      setSelectedFile(null);
      
      // Verify response has required data
      const studyId = response.data?._id || response._id;
      const responseStudyName = response.data?.studyName || response.studyName || inputStudyName;
      
      console.log('[AddReserveStudyPopup] Extracted study data:', { studyId, studyName: responseStudyName });
      
      onSuccess(studyId, responseStudyName);
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

  if (permissionsLoading) {
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
          textAlign: 'center'
        }}>
          Loading permissions...
        </div>
      </div>
    );
  }

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
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
        opacity: canAddReserveStudy() ? 1 : 0.9
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
            color: canAddReserveStudy() ? '#1f2937' : '#9ca3af'
          }}>
            Add New Reserve Study
            {!canAddReserveStudy() && (
              <span style={{
                fontSize: '12px',
                color: '#dc2626',
                marginLeft: '8px',
                fontWeight: '500'
              }}>
                ({permissionLevel})
              </span>
            )}
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

        {!canAddReserveStudy() && (
          <div style={{
            padding: '12px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            <p style={{
              margin: 0,
              fontSize: '14px',
              color: '#dc2626',
              fontWeight: '500'
            }}>
              <i className="fas fa-lock" style={{ marginRight: '8px' }}></i>
              You don't have permission to add reserve studies. Contact your administrator for EDITOR or ADMIN access.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: canAddReserveStudy() ? '#374151' : '#9ca3af',
              marginBottom: '8px'
            }}>
              Study Name *
            </label>
            <input
              type="text"
              value={studyName}
              onChange={(e) => canAddReserveStudy() && setStudyName(e.target.value)}
              placeholder={canAddReserveStudy() ? "Enter study name" : "Permission required"}
              disabled={!canAddReserveStudy()}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: `2px solid ${canAddReserveStudy() ? '#e2e8f0' : '#f3f4f6'}`,
                borderRadius: '8px',
                fontSize: '16px',
                outline: 'none',
                transition: 'border-color 0.2s',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                backgroundColor: canAddReserveStudy() ? 'white' : '#f9fafb',
                color: canAddReserveStudy() ? '#1f2937' : '#9ca3af',
                cursor: canAddReserveStudy() ? 'text' : 'not-allowed'
              }}
              onFocus={(e) => canAddReserveStudy() && (e.target.style.borderColor = '#3b82f6')}
              onBlur={(e) => canAddReserveStudy() && (e.target.style.borderColor = '#e2e8f0')}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: canAddReserveStudy() ? '#374151' : '#9ca3af',
              marginBottom: '8px'
            }}>
              Excel File *
            </label>
            <div style={{
              border: `2px dashed ${canAddReserveStudy() ? '#e2e8f0' : '#f3f4f6'}`,
              borderRadius: '8px',
              padding: '24px',
              textAlign: 'center',
              backgroundColor: canAddReserveStudy() ? '#f9fafb' : '#f3f4f6',
              cursor: canAddReserveStudy() ? 'pointer' : 'not-allowed',
              transition: 'border-color 0.2s',
              opacity: canAddReserveStudy() ? 1 : 0.6
            }}
            onDragOver={(e) => {
              if (canAddReserveStudy()) {
                e.preventDefault();
                e.currentTarget.style.borderColor = '#3b82f6';
              }
            }}
            onDragLeave={(e) => {
              if (canAddReserveStudy()) {
                e.currentTarget.style.borderColor = '#e2e8f0';
              }
            }}
            onClick={() => canAddReserveStudy() && document.getElementById('file-input')?.click()}
            >
              <input
                id="file-input"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                disabled={!canAddReserveStudy()}
                style={{ display: 'none' }}
              />
              <i className="fas fa-file-excel" style={{
                fontSize: '32px',
                color: canAddReserveStudy() ? '#10b981' : '#9ca3af',
                marginBottom: '12px'
              }}></i>
              <p style={{
                margin: '0 0 8px 0',
                fontSize: '16px',
                fontWeight: '500',
                color: canAddReserveStudy() ? '#374151' : '#9ca3af'
              }}>
                {selectedFile ? selectedFile.name : (canAddReserveStudy() ? 'Click to upload or drag and drop' : 'Permission required to upload')}
              </p>
              <p style={{
                margin: 0,
                fontSize: '14px',
                color: canAddReserveStudy() ? '#6b7280' : '#9ca3af'
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
              disabled={isLoading || !canAddReserveStudy()}
              style={{
                padding: '12px 24px',
                border: 'none',
                borderRadius: '8px',
                backgroundColor: (isLoading || !canAddReserveStudy()) ? '#9ca3af' : '#0e519b',
                color: 'white',
                fontSize: '16px',
                fontWeight: '500',
                cursor: (isLoading || !canAddReserveStudy()) ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                if (!isLoading && canAddReserveStudy()) {
                  e.currentTarget.style.backgroundColor = '#1e40af';
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading && canAddReserveStudy()) {
                  e.currentTarget.style.backgroundColor = '#0e519b';
                }
              }}
            >
              {isLoading && (
                <i className="fas fa-spinner fa-spin"></i>
              )}
              {!canAddReserveStudy() ? (
                <>
                  <i className="fas fa-lock"></i>
                  {permissionLevel} Access
                </>
              ) : (
                isLoading ? 'Creating...' : 'Create Study'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddReserveStudyPopup;