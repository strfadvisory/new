import apiClient from '../client';
import { API_ENDPOINTS } from '../config';

// Users API functions
export const usersApi = {
  // Get all users
  getAllUsers: async () => {
    const response = await apiClient.get(API_ENDPOINTS.USERS.ALL);
    return response.data;
  },

  // Get admin users
  getAdminUsers: async () => {
    const response = await apiClient.get(API_ENDPOINTS.USERS.ADMINS);
    return response.data;
  },

  // Get companies
  getCompanies: async () => {
    const response = await apiClient.get(API_ENDPOINTS.USERS.COMPANIES);
    return response.data;
  },

  // Update user status
  updateUserStatus: async (userId, status) => {
    const endpoint = API_ENDPOINTS.USERS.STATUS.replace(':id', userId);
    const response = await apiClient.put(endpoint, { status });
    return response.data;
  },

  // Create company profile
  createCompanyProfile: async (profileData) => {
    const response = await apiClient.post(API_ENDPOINTS.USERS.CREATE_COMPANY_PROFILE, profileData);
    return response.data;
  },

  // Get user by ID
  getUserById: async (userId) => {
    const response = await apiClient.get(`${API_ENDPOINTS.USERS.ALL}/${userId}`);
    return response.data;
  },

  // Update user
  updateUser: async (userId, userData) => {
    const response = await apiClient.put(`${API_ENDPOINTS.USERS.ALL}/${userId}`, userData);
    return response.data;
  },

  // Delete user
  deleteUser: async (userId) => {
    const response = await apiClient.delete(`${API_ENDPOINTS.USERS.ALL}/${userId}`);
    return response.data;
  },
};