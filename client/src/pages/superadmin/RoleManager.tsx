import React, { useState } from 'react';

interface Permission {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

interface PermissionSection {
  title: string;
  permissions: Permission[];
  expanded: boolean;
}

interface RoleManagerProps {
  selectedRole: any;
  onEdit: (role: any) => void;
  onDelete: (roleId: string) => void;
}

const RoleManager: React.FC<RoleManagerProps> = ({ selectedRole, onEdit, onDelete }) => {
  const [sections, setSections] = useState<PermissionSection[]>([
    {
      title: 'Simulator',
      expanded: true,
      permissions: [
        { id: '1', name: 'Access Simulator', description: 'Grants permission-based access to the Simulator module and its associated data.', enabled: true },
        { id: '2', name: 'Upload Model', description: 'Allows authorized users to upload and validate structured simulation models.', enabled: false },
        { id: '3', name: 'Create Version', description: 'Creates a new version linked to an existing simulator model', enabled: true },
        { id: '4', name: 'Edit Own Version', description: 'Allows users to modify simulator versions created by themselves.', enabled: false },
        { id: '5', name: 'Edit Other Versions', description: 'Allows authorized roles to modify versions created by other users.', enabled: true },
        { id: '6', name: 'Publish Version', description: 'Changes the version status to Published and makes it accessible to permitted users.', enabled: false },
        { id: '7', name: 'Access Simulator Playground', description: 'Provides a sandbox environment isolated from live data for scenario testing.', enabled: true },
        { id: '8', name: 'Download Report', description: 'Exports simulation results into downloadable formats (PDF, CSV, XLS).', enabled: false },
        { id: '9', name: 'View Report', description: 'Displays generated simulation results in read-only mode within the system.', enabled: false },
        { id: '10', name: 'Transfer Association to Another User', description: 'Reassigns an association from one user to another with proper authorization.', enabled: true },
      ]
    },
    {
      title: 'Invitation & Onboarding',
      expanded: false,
      permissions: []
    },
    {
      title: 'Association Control',
      expanded: false,
      permissions: []
    },
    {
      title: 'User & Role Management',
      expanded: false,
      permissions: []
    }
  ]);

  const toggleSection = (index: number) => {
    setSections(sections.map((section, i) => 
      i === index ? { ...section, expanded: !section.expanded } : section
    ));
  };

  const togglePermission = (sectionIndex: number, permissionId: string) => {
    setSections(sections.map((section, i) => {
      if (i === sectionIndex) {
        return {
          ...section,
          permissions: section.permissions.map(p => 
            p.id === permissionId ? { ...p, enabled: !p.enabled } : p
          )
        };
      }
      return section;
    }));
  };

  return (
    <div style={{ padding: '24px' }}>
      {selectedRole ? (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: '600', color: '#1f2937' }}>{selectedRole.name}</h2>
              <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>{selectedRole.type}</p>
            </div>
            <button 
              onClick={() => onEdit(selectedRole)}
              style={{ padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '6px', background: 'white', cursor: 'pointer', fontSize: '14px' }}
            >
              Edit
            </button>
          </div>
          
          <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '32px' }}>
            {selectedRole.description}
          </p>

      <div>
        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '16px' }}>Functions & Permutation</h3>
        <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px' }}>
          Grants permission-based access to the Simulator module and its associated data.
        </p>

        {sections.map((section, sectionIndex) => (
          <div key={sectionIndex} style={{ marginBottom: '16px', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
            <div 
              onClick={() => toggleSection(sectionIndex)}
              style={{ 
                padding: '16px', 
                background: '#f9fafb', 
                cursor: 'pointer', 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                fontWeight: '600',
                fontSize: '14px'
              }}
            >
              <span>{section.title}</span>
              <i className={`fas fa-${section.expanded ? 'minus' : 'plus'}`}></i>
            </div>
            
            {section.expanded && (
              <div style={{ padding: '16px' }}>
                {section.permissions.map((permission) => (
                  <div key={permission.id} style={{ padding: '16px 0', borderBottom: '1px solid #e5e7eb' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
                          {permission.name}
                        </h4>
                        <p style={{ margin: 0, fontSize: '13px', color: '#6b7280', lineHeight: '1.5' }}>
                          {permission.description}
                        </p>
                      </div>
                      <label className="toggle-switch" style={{ marginLeft: '16px' }}>
                        <input 
                          type="checkbox" 
                          checked={permission.enabled}
                          onChange={() => togglePermission(sectionIndex, permission.id)}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        <div style={{ marginTop: '16px', padding: '16px', border: '1px solid #e5e7eb', borderRadius: '8px', background: '#f9fafb' }}>
          <button 
            onClick={() => onDelete(selectedRole._id)}
            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}
          >
            Remove this
          </button>
        </div>
      </div>
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
          <p>Select a role from the left panel to view details</p>
        </div>
      )}
    </div>
  );
};

export default RoleManager;
