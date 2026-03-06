import apiClient from '../client';
import { API_ENDPOINTS } from '../config';

interface Association {
  _id: string;
  name: string;
  description: string;
}

interface CreateAssociationData {
  name: string;
  description: string;
}

// Associations API functions
export const associationsApi = {
  // Get all associations
  getAssociations: async (): Promise<Association[]> => {
    const response = await apiClient.get(API_ENDPOINTS.ASSOCIATIONS.BASE);
    return response.data;
  },

  // Get association by ID
  getAssociationById: async (associationId: string): Promise<Association> => {
    const response = await apiClient.get(`${API_ENDPOINTS.ASSOCIATIONS.BASE}/${associationId}`);
    return response.data;
  },

  // Create association
  createAssociation: async (associationData: CreateAssociationData): Promise<Association> => {
    const response = await apiClient.post(API_ENDPOINTS.ASSOCIATIONS.BASE, associationData);
    return response.data;
  },

  // Update association
  updateAssociation: async (associationId: string, associationData: CreateAssociationData): Promise<Association> => {
    const response = await apiClient.put(`${API_ENDPOINTS.ASSOCIATIONS.BASE}/${associationId}`, associationData);
    return response.data;
  },

  // Delete association
  deleteAssociation: async (associationId: string): Promise<void> => {
    const response = await apiClient.delete(`${API_ENDPOINTS.ASSOCIATIONS.BASE}/${associationId}`);
    return response.data;
  },
};