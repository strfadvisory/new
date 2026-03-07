import apiClient, { createFormDataClient } from '../client';
import { API_ENDPOINTS } from '../config';

// Reserve Studies API functions
export const reserveStudiesApi = {
  // Get all reserve studies
  getReserveStudies: async (params = {}) => {
    const response = await apiClient.get(API_ENDPOINTS.RESERVE_STUDIES.BASE, { params });
    return response.data;
  },

  // Get reserve studies by association
  getReserveStudiesByAssociation: async (association) => {
    const response = await apiClient.get(API_ENDPOINTS.RESERVE_STUDIES.BASE, {
      params: { association }
    });
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