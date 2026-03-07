import React from 'react';
import ParsedReserveStudyViewer from '../components/ParsedReserveStudyViewer';

const Simulators: React.FC = () => {
  const simulators = [
    { id: 1, name: 'Reserve Fund Simulator', status: 'Active', lastRun: '2024-01-15' },
    { id: 2, name: 'Budget Planning Simulator', status: 'Active', lastRun: '2024-01-14' },
    { id: 3, name: 'Investment Analysis Simulator', status: 'Inactive', lastRun: '2024-01-10' }
  ];

  const [selectedStudyId, setSelectedStudyId] = React.useState<string | null>('69ac7619ae2658e3392e8fcf');

  return (
    <div>
      <div className="p-4">
      <h1>Simulators</h1>
      <p>Manage and run financial simulators for reserve fund analysis.</p>
      
      {selectedStudyId && <ParsedReserveStudyViewer studyId={selectedStudyId} />}
      
      <div className="mt-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2>Available Simulators</h2>
          <button className="btn btn-primary">Add New Simulator</button>
        </div>
        
        <div className="table-responsive">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Name</th>
                <th>Status</th>
                <th>Last Run</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {simulators.map(sim => (
                <tr key={sim.id}>
                  <td>{sim.name}</td>
                  <td><span className={`badge ${sim.status === 'Active' ? 'bg-success' : 'bg-secondary'}`}>{sim.status}</span></td>
                  <td>{sim.lastRun}</td>
                  <td>
                    <button className="btn btn-sm btn-outline-primary me-2">Run</button>
                    <button className="btn btn-sm btn-outline-secondary">Edit</button>
                  </td>
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

export default Simulators;