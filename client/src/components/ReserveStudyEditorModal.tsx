import React, { useState, useEffect } from 'react';
import { apiService } from '../services/ApiService';
import './ReserveStudyEditorModal.css';

interface ReserveItem {
  id: string;
  no: string;
  type: string;
  name: string;
  expectedLife: number;
  remainingLife: number;
  replacementCost: number;
  comment: string;
}

interface ReserveStudyEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  studyData?: any;
  studyName?: string;
  onSave?: (data: any) => void;
}

const ReserveStudyEditorModal: React.FC<ReserveStudyEditorModalProps> = ({
  isOpen,
  onClose,
  studyData,
  studyName = '',
  onSave
}) => {
  const [documentName, setDocumentName] = useState(studyName);
  const [items, setItems] = useState<ReserveItem[]>([]);
  const [selectedItemMenu, setSelectedItemMenu] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (isOpen && studyData) {
      // Extract items from studyData
      const actualData = studyData.data?.data || studyData.data || studyData;
      const reserveItems = actualData.items || [];
      
      // Map to our format
      const mappedItems: ReserveItem[] = reserveItems.map((item: any, index: number) => ({
        id: item.id || `item-${index}`,
        no: String(index + 1).padStart(2, '0'),
        type: item.sirsType === 0 ? 'SIRS' : item.sirsType === 1 ? 'NON-SIRS' : 'SIRS',
        name: item.itemName || '',
        expectedLife: Number(item.expectedLife) || 0,
        remainingLife: Number(item.remainingLife) || 0,
        replacementCost: Number(item.replacementCost) || 0,
        comment: item.comment || ''
      }));
      
      setItems(mappedItems);
      setDocumentName(studyName || actualData.studyName || 'Reserve Study');
    }
  }, [isOpen, studyData, studyName]);

  const handleSave = async () => {
    if (!studyData?.studyId) {
      console.error('[ReserveStudyEditor] No study ID available');
      alert('Cannot save: Study ID not found');
      return;
    }

    setIsSaving(true);
    try {
      // Extract config from studyData
      const actualData = studyData.data?.data || studyData.data || studyData;
      const config = actualData.config || {};

      // Prepare items for backend
      const itemsToSave = items.map(item => ({
        itemName: item.name,
        sirsType: item.type === 'SIRS' ? 0 : 1,
        expectedLife: item.expectedLife,
        remainingLife: item.remainingLife,
        replacementCost: item.replacementCost,
        comment: item.comment
      }));

      console.log('[ReserveStudyEditor] Saving study data:', {
        studyId: studyData.studyId,
        studyName: documentName,
        itemsCount: itemsToSave.length
      });

      // Call backend API to update study data
      await apiService.put(`/reserve-studies/${studyData.studyId}/data`, {
        studyName: documentName,
        items: itemsToSave,
        config: config
      });

      console.log('[ReserveStudyEditor] Study saved successfully');
      
      // Show success message
      alert('Reserve study saved successfully!');

      if (onSave) {
        const updatedData = {
          ...studyData,
          studyName: documentName,
          data: {
            ...actualData,
            items: itemsToSave
          }
        };
        onSave(updatedData);
      }
      
      onClose();
    } catch (error: any) {
      console.error('[ReserveStudyEditor] Save error:', error);
      alert(`Failed to save study: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUploadExisting = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx,.xls';
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (file) {
        setIsUploading(true);
        try {
          console.log('[ReserveStudyEditor] Uploading existing study:', file.name);
          
          const formData = new FormData();
          formData.append('excelFile', file);
          formData.append('studyName', documentName || 'Imported Study');
          
          // Upload new study
          const response = await apiService.post('/reserve-studies', formData);
          
          console.log('[ReserveStudyEditor] Upload successful:', response);
          alert('Study uploaded successfully!');
          
          // Refresh the page or reload data
          window.location.reload();
        } catch (error: any) {
          console.error('[ReserveStudyEditor] Upload error:', error);
          alert(`Failed to upload study: ${error.response?.data?.message || error.message}`);
        } finally {
          setIsUploading(false);
        }
      }
    };
    input.click();
  };

  const handleDownloadTemplate = async () => {
    try {
      console.log('[ReserveStudyEditor] Downloading template');
      
      const response = await apiService.get<Blob>('/reserve-studies/template/download', {
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(response);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Reserve_Study_Template.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      console.log('[ReserveStudyEditor] Template downloaded');
    } catch (error: any) {
      console.error('[ReserveStudyEditor] Download template error:', error);
      alert(`Failed to download template: ${error.message}`);
    }
  };

  const handleUploadDocument = () => {
    if (!studyData?.studyId) {
      alert('Cannot upload document: Study ID not found');
      return;
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx,.xls,.pdf,.doc,.docx';
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (file) {
        setIsUploading(true);
        try {
          console.log('[ReserveStudyEditor] Uploading document:', file.name);
          
          const formData = new FormData();
          formData.append('document', file);
          
          await apiService.post(`/reserve-studies/${studyData.studyId}/documents`, formData);
          
          console.log('[ReserveStudyEditor] Document uploaded successfully');
          alert('Document uploaded successfully!');
        } catch (error: any) {
          console.error('[ReserveStudyEditor] Upload document error:', error);
          alert(`Failed to upload document: ${error.response?.data?.message || error.message}`);
        } finally {
          setIsUploading(false);
        }
      }
    };
    input.click();
  };

  const handleItemChange = (id: string, field: keyof ReserveItem, value: any) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleDeleteItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
    setSelectedItemMenu(null);
  };

  const handleDuplicateItem = (id: string) => {
    const itemToDuplicate = items.find(item => item.id === id);
    if (itemToDuplicate) {
      const newItem = {
        ...itemToDuplicate,
        id: `item-${Date.now()}`,
        no: String(items.length + 1).padStart(2, '0')
      };
      setItems(prev => [...prev, newItem]);
    }
    setSelectedItemMenu(null);
  };

  if (!isOpen) return null;

  return (
    <div className="reserve-study-editor-overlay">
      <div className="reserve-study-editor-modal">
        {/* Header */}
        <div className="rse-header">
          <input
            type="text"
            className="rse-document-name"
            value={documentName}
            onChange={(e) => setDocumentName(e.target.value)}
            placeholder="Document Name"
          />
          
          <div className="rse-header-actions">
            <button className="rse-btn rse-btn-primary" onClick={handleUploadExisting} disabled={isUploading}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              {isUploading ? 'Uploading...' : 'Upload Existing Study'}
            </button>
            
            <span className="rse-divider">Or</span>
            
            <button className="rse-btn rse-btn-secondary" onClick={handleDownloadTemplate}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Download Template
            </button>
            
            <button className="rse-btn rse-btn-secondary" onClick={handleUploadDocument} disabled={isUploading}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              {isUploading ? 'Uploading...' : 'Upload Document'}
            </button>
            
            <button className="rse-btn rse-btn-icon" onClick={onClose}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
            </button>
            
            <button className="rse-btn rse-btn-icon" onClick={onClose}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="1 4 1 10 7 10"/>
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
              </svg>
            </button>
            
            <button className="rse-btn rse-btn-save" onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Study'}
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="rse-table-container">
          <table className="rse-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>No.</th>
                <th style={{ width: '180px' }}>Type</th>
                <th style={{ width: '400px' }}>Name</th>
                <th style={{ width: '140px' }}>Expected Life</th>
                <th style={{ width: '140px' }}>Remaining Life</th>
                <th style={{ width: '160px' }}>Replacement Cost</th>
                <th style={{ width: '200px' }}>Comment</th>
                <th style={{ width: '50px' }}></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="rse-cell-no">{item.no}</td>
                  <td className="rse-cell-type">
                    <select
                      value={item.type}
                      onChange={(e) => handleItemChange(item.id, 'type', e.target.value)}
                      className="rse-select"
                    >
                      <option value="SIRS">SIRS</option>
                      <option value="NON-SIRS">NON-SIRS</option>
                    </select>
                  </td>
                  <td className="rse-cell-name">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => handleItemChange(item.id, 'name', e.target.value)}
                      className="rse-input"
                    />
                  </td>
                  <td className="rse-cell-number">
                    <input
                      type="number"
                      value={item.expectedLife}
                      onChange={(e) => handleItemChange(item.id, 'expectedLife', Number(e.target.value))}
                      className="rse-input rse-input-center"
                    />
                  </td>
                  <td className="rse-cell-number">
                    <input
                      type="number"
                      value={item.remainingLife}
                      onChange={(e) => handleItemChange(item.id, 'remainingLife', Number(e.target.value))}
                      className="rse-input rse-input-center"
                    />
                  </td>
                  <td className="rse-cell-cost">
                    <input
                      type="text"
                      value={`$${item.replacementCost.toLocaleString()}`}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[$,]/g, '');
                        handleItemChange(item.id, 'replacementCost', Number(value) || 0);
                      }}
                      className="rse-input rse-input-center"
                    />
                  </td>
                  <td className="rse-cell-comment">
                    <input
                      type="text"
                      value={item.comment}
                      onChange={(e) => handleItemChange(item.id, 'comment', e.target.value)}
                      className="rse-input"
                      placeholder=""
                    />
                  </td>
                  <td className="rse-cell-menu">
                    <div style={{ position: 'relative' }}>
                      <button
                        className="rse-menu-btn"
                        onClick={() => setSelectedItemMenu(selectedItemMenu === item.id ? null : item.id)}
                      >
                        ⋯
                      </button>
                      {selectedItemMenu === item.id && (
                        <div className="rse-menu-dropdown">
                          <div
                            className="rse-menu-item"
                            onClick={() => handleDuplicateItem(item.id)}
                          >
                            Duplicate
                          </div>
                          <div
                            className="rse-menu-item rse-menu-item-danger"
                            onClick={() => handleDeleteItem(item.id)}
                          >
                            Delete
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Close button overlay */}
        <button className="rse-close-btn" onClick={onClose}>
          ×
        </button>
      </div>
    </div>
  );
};

export default ReserveStudyEditorModal;
