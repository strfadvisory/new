import React, { useState } from 'react';
import {
  useAssociations,
  useCreateAssociation,
  useUpdateAssociation,
  useDeleteAssociation,
} from '../hooks/queries';

interface Association {
  _id: string;
  name: string;
  description: string;
}

interface FormData {
  name: string;
  description: string;
}

// Example component showing how to use the new React Query hooks
const AssociationsExample: React.FC = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
  });

  // Query hooks - automatically handle loading, error, and data states
  const {
    data: associations = [],
    isLoading,
    error,
    refetch,
  } = useAssociations();

  // Mutation hooks - handle create, update, delete operations
  const createMutation = useCreateAssociation();
  const updateMutation = useUpdateAssociation();
  const deleteMutation = useDeleteAssociation();

  // Handle form submission for create/update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingId) {
        // Update existing association
        await updateMutation.mutateAsync({
          associationId: editingId,
          associationData: formData,
        });
      } else {
        // Create new association
        await createMutation.mutateAsync(formData);
      }
      
      // Reset form
      setFormData({ name: '', description: '' });
      setIsCreating(false);
      setEditingId(null);
    } catch (error) {
      console.error('Error saving association:', error);
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this association?')) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting association:', error);
      }
    }
  };

  // Handle edit
  const handleEdit = (association: Association) => {
    setFormData({
      name: association.name,
      description: association.description,
    });
    setEditingId(association._id);
    setIsCreating(true);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="d-flex justify-content-center p-4">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        Error loading associations: {(error as Error).message}
        <button 
          className="btn btn-outline-danger btn-sm ms-2" 
          onClick={() => refetch()}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Associations Management</h2>
        <button
          className="btn btn-primary"
          onClick={() => setIsCreating(true)}
          disabled={createMutation.isLoading}
        >
          {createMutation.isLoading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" />
              Creating...
            </>
          ) : (
            '+ Add Association'
          )}
        </button>
      </div>

      {/* Create/Edit Form */}
      {isCreating && (
        <div className="card mb-4">
          <div className="card-header">
            <h5>{editingId ? 'Edit Association' : 'Create New Association'}</h5>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Name *</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="d-flex gap-2">
                <button
                  type="submit"
                  className="btn btn-success"
                  disabled={createMutation.isLoading || updateMutation.isLoading}
                >
                  {(createMutation.isLoading || updateMutation.isLoading) ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      {editingId ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    editingId ? 'Update Association' : 'Create Association'
                  )}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setIsCreating(false);
                    setEditingId(null);
                    setFormData({ name: '', description: '' });
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Associations List */}
      <div className="row">
        {associations.length === 0 ? (
          <div className="col-12">
            <div className="text-center p-4">
              <p className="text-muted">No associations found.</p>
            </div>
          </div>
        ) : (
          associations.map((association: Association) => (
            <div key={association._id} className="col-md-6 col-lg-4 mb-3">
              <div className="card h-100">
                <div className="card-body">
                  <h5 className="card-title">{association.name}</h5>
                  <p className="card-text">{association.description}</p>
                </div>
                <div className="card-footer d-flex gap-2">
                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => handleEdit(association)}
                    disabled={updateMutation.isLoading}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => handleDelete(association._id)}
                    disabled={deleteMutation.isLoading}
                  >
                    {deleteMutation.isLoading ? (
                      <span className="spinner-border spinner-border-sm" />
                    ) : (
                      'Delete'
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AssociationsExample;