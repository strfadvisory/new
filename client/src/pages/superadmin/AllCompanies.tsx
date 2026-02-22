import React, { useState } from 'react';

const AllCompanies: React.FC = () => {
  const [companies] = useState([
    { id: 1, name: 'Company A', type: 'Association', users: 25, status: 'Active' },
    { id: 2, name: 'Company B', type: 'Management Company', users: 40, status: 'Active' },
    { id: 3, name: 'Company C', type: 'Reserve Study Company', users: 15, status: 'Inactive' },
  ]);

  return (
    <div style={{ padding: '20px' }}>
      <h2>All Companies</h2>
      <table style={{ width: '100%', marginTop: '20px', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f5f5f5' }}>
            <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Company Name</th>
            <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Type</th>
            <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Users</th>
            <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Status</th>
            <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {companies.map(company => (
            <tr key={company.id}>
              <td style={{ padding: '12px', border: '1px solid #ddd' }}>{company.name}</td>
              <td style={{ padding: '12px', border: '1px solid #ddd' }}>{company.type}</td>
              <td style={{ padding: '12px', border: '1px solid #ddd' }}>{company.users}</td>
              <td style={{ padding: '12px', border: '1px solid #ddd' }}>{company.status}</td>
              <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                <button style={{ marginRight: '10px' }}>Edit</button>
                <button>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AllCompanies;
