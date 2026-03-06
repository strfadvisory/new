import apiClient, { createFormDataClient } from '../client';
import { API_ENDPOINTS } from '../config';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  roleId: string;
}

interface OtpData {
  email: string;
  otp: string;
}

interface InviteData {
  selectedRole: string;
  firstName: string;
  lastName: string;
  adminEmail: string;
  designation: string;
}

// Auth API functions
export const authApi = {
  // Login user
  login: async (credentials: LoginCredentials) => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
    return response.data;
  },

  // Register user
  register: async (userData: RegisterData) => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, userData);
    return response.data;
  },

  // Verify OTP
  verifyOtp: async (data: OtpData) => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.VERIFY_OTP, data);
    return response.data;
  },

  // Resend OTP
  resendOtp: async (email: string) => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.RESEND_OTP, { email });
    return response.data;
  },

  // Get user profile
  getProfile: async () => {
    const response = await apiClient.get(API_ENDPOINTS.AUTH.PROFILE);
    return response.data;
  },

  // Update company profile
  updateCompanyProfile: async (profileData: any) => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.COMPANY_PROFILE, profileData);
    return response.data;
  },

  // Get users
  getUsers: async () => {
    const response = await apiClient.get(API_ENDPOINTS.AUTH.USERS);
    return response.data;
  },

  // Get organization users
  getOrgUsers: async () => {
    const response = await apiClient.get(API_ENDPOINTS.AUTH.ORG_USERS);
    return response.data;
  },

  // Remove logo
  removeLogo: async (userId: string) => {
    const response = await apiClient.delete(`${API_ENDPOINTS.AUTH.REMOVE_LOGO}/${userId}`);
    return response.data;
  },

  // Delete user
  deleteUser: async (userId: string) => {
    const response = await apiClient.delete(`${API_ENDPOINTS.AUTH.DELETE_USER}/${userId}`);
    return response.data;
  },

  // Get file
  getFile: (fileId: string) => {
    return `${apiClient.defaults.baseURL}${API_ENDPOINTS.AUTH.FILE}/${fileId}`;
  },

  // Invite advisory
  inviteAdvisory: async (inviteData: InviteData) => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.INVITE_ADVISORY, inviteData);
    return response.data;
  },

  // Verify advisory
  verifyAdvisory: async (token: string) => {
    const response = await apiClient.get(`${API_ENDPOINTS.AUTH.VERIFY_ADVISORY}/${token}`);
    return response.data;
  },

  // Complete advisory profile
  completeAdvisoryProfile: async (token: string, profileData: any) => {
    const response = await apiClient.post(`${API_ENDPOINTS.AUTH.COMPLETE_ADVISORY_PROFILE}/${token}`, profileData);
    return response.data;
  },

  // Upload file
  uploadFile: async (formData: FormData) => {
    const formDataClient = createFormDataClient();
    const response = await formDataClient.post(API_ENDPOINTS.AUTH.FILE, formData);
    return response.data;
  },
};