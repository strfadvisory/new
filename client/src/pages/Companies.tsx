import React from 'react';

const Companies: React.FC = () => {
  const companies = [
    { id: 1, name: 'Sunrise Management LLC', type: 'Management Company', members: 45, status: 'Active' },
    { id: 2, name: 'Oceanview Associates', type: 'Association', members: 120, status: 'Active' },
    { id: 3, name: 'Metro Reserve Studies', type: 'Reserve Study Company', members: 8, status: 'Active' },
    { id: 4, name: 'Capital Investment Advisors', type: 'Investor Advisor', members: 15, status: 'Inactive' }
  ];

  return (
    <div className="p-4">
      <h1>Companies</h1>
      <p>Manage company profiles and organizational entities.</p>
      
      <div className="mt-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2>Company Directory</h2>
          <button className="btn btn-primary">Add New Company</button>
        </div>
        
        <div className="row">
          {companies.map(company => (
            <div key={company.id} className="col-md-6 col-lg-4 mb-3">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">{company.name}</h5>
                  <p className="card-text text-muted">{company.type}</p>
                  <div className="d-flex justify-content-between align-items-center">
                    <small className="text-muted">{company.members} Members</small>
                    <span className={`badge ${company.status === 'Active' ? 'bg-success' : 'bg-secondary'}`}>
                      {company.status}
                    </span>
                  </div>
                  <div className="mt-3">
                    <button className="btn btn-sm btn-outline-primary me-2">View</button>
                    <button className="btn btn-sm btn-outline-secondary">Edit</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Companies;