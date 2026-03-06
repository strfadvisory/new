import apiClient from '../client';
import { API_ENDPOINTS } from '../config';

// Master API functions
export const masterApi = {
  // Get master data
  getMaster: async () => {
    const response = await apiClient.get(API_ENDPOINTS.MASTER.BASE);
    return response.data;
  },
};