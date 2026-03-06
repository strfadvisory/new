import apiClient from '../client';
import { API_ENDPOINTS } from '../config';

// Validation API functions
export const validationApi = {
  // Validate email
  validateEmail: async (email) => {
    const response = await apiClient.post(API_ENDPOINTS.VALIDATION.EMAIL, { email });
    return response.data;
  },
};