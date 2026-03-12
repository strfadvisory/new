import apiClient, { createFormDataClient } from '../client';
import { API_ENDPOINTS } from '../config';

// Reserve Studies API functions
export const reserveStudiesApi = {
  // Get all reserve studies (now requires associationId)
  getReserveStudies: async (associationId) => {
    if (!associationId) {
      throw new Error('Association ID is required');
    }
    const response = await apiClient.post(`${API_ENDPOINTS.RESERVE_STUDIES.BASE}/list`, { associationId });
    return response.data;
  },

  // Get all reserve studies for superadmin (no associationId required)
  getAllReserveStudies: async () => {
    const response = await apiClient.get(API_ENDPOINTS.RESERVE_STUDIES.ALL);
    return response.data;
  },

  // Get reserve studies by association (updated to use new method)
  getReserveStudiesByAssociation: async (associationId) => {
    if (!associationId) {
      throw new Error('Association ID is required');
    }
    const response = await apiClient.post(`${API_ENDPOINTS.RESERVE_STUDIES.BASE}/list`, { associationId });
    return response.data;
  },

  // Get reserve study by ID
  getReserveStudyById: async (studyId) => {
    const response = await apiClient.get(`${API_ENDPOINTS.RESERVE_STUDIES.BASE}/${studyId}`);
    return response.data;
  },

  // Create reserve study (with file upload)
  createReserveStudy: async (formData) => {
    const formDataClient = createFormDataClient();
    const response = await formDataClient.post(API_ENDPOINTS.RESERVE_STUDIES.BASE, formData);
    return response.data;
  },

  // Update reserve study
  updateReserveStudy: async (studyId, studyData) => {
    const response = await apiClient.put(`${API_ENDPOINTS.RESERVE_STUDIES.BASE}/${studyId}`, studyData);
    return response.data;
  },

  // Delete reserve study
  deleteReserveStudy: async (studyId) => {
    const response = await apiClient.delete(`${API_ENDPOINTS.RESERVE_STUDIES.BASE}/${studyId}`);
    return response.data;
  },

  // Get parsed reserve study data
  getParsedReserveStudy: async (studyId) => {
    const response = await apiClient.get(`${API_ENDPOINTS.RESERVE_STUDIES.BASE}/${studyId}/data`);
    return response.data;
  },
};