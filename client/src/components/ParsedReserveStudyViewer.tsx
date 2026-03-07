import React from 'react';
import { useParsedReserveStudy } from '../hooks/queries/useReserveStudies';

interface ParsedReserveStudyViewerProps {
  studyId: string;
}

interface ReserveItem {
  itemName: string;
  expectedLife: number | null;
  remainingLife: number | null;
  replacementCost: number;
  sirsType: string | null;
}

const ParsedReserveStudyViewer: React.FC<ParsedReserveStudyViewerProps> = ({ studyId }) => {
  const { data, isLoading, error } = useParsedReserveStudy(studyId);

  const handleDownload = async () => {
    try {
      const response = await fetch(`http://localhost:5001/api/reserve-studies/${studyId}/data`);
      const jsonData = await response.json();
      
      const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${jsonData.studyName?.replace(/\s+/g, '_')}_${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  if (isLoading) return <div className="text-center p-4">Loading...</div>;
  if (error) return <div className="alert alert-danger">Error: {(error as Error).message}</div>;
  if (!data?.data) return null;

  const { config, items } = data.data;

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="mb-0">{data.studyName}</h3>
        <button className="btn btn-danger" onClick={handleDownload} style={{ border: '2px solid red' }}>
          Download JSON
        </button>
      </div>

      {/* Configuration Section */}
      <div className="card mb-4">
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">Model Configuration</h5>
        </div>
        <div className="card-body">
          <div className="row">
            {Object.entries(config).map(([key, value]) => (
              <div key={key} className="col-md-6 mb-2">
                <strong>{key}:</strong> {String(value || 'N/A')}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="card">
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">Reserve Items ({items.length})</h5>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-striped table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>Item Name</th>
                  <th>Expected Life</th>
                  <th>Remaining Life</th>
                  <th>Replacement Cost</th>
                  <th>SIRS Type</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item: ReserveItem, index: number) => (
                  <tr key={index}>
                    <td>{item.itemName}</td>
                    <td>{item.expectedLife ?? 'N/A'}</td>
                    <td>{item.remainingLife ?? 'N/A'}</td>
                    <td>${item.replacementCost.toLocaleString()}</td>
                    <td>{item.sirsType || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParsedReserveStudyViewer;
