import apiClient from '../client';
import { API_ENDPOINTS } from '../config';

interface Role {
  _id: string;
  name: string;
  type: string;
  permissions: string[];
}

interface UserNextstepsResponse {
  nextSteps: Array<{
    title: string;
    description: string;
    icon: string;
  }>;
}

interface UserVideosResponse {
  videos: Array<{
    title: string;
    description: string;
    image: string;
    url: string;
  }>;
}

// Roles API functions
export const rolesApi = {
  // Get all roles
  getRoles: async (): Promise<Role[]> => {
    const response = await apiClient.get(API_ENDPOINTS.ROLES.BASE);
    return response.data;
  },

  // Get role by ID
  getRoleById: async (roleId: string): Promise<Role> => {
    const response = await apiClient.get(`${API_ENDPOINTS.ROLES.BASE}/${roleId}`);
    return response.data;
  },

  // Create role
  createRole: async (roleData: Partial<Role>): Promise<Role> => {
    const response = await apiClient.post(API_ENDPOINTS.ROLES.BASE, roleData);
    return response.data;
  },

  // Update role
  updateRole: async (roleId: string, roleData: Partial<Role>): Promise<Role> => {
    const response = await apiClient.put(`${API_ENDPOINTS.ROLES.BASE}/${roleId}`, roleData);
    return response.data;
  },

  // Delete role
  deleteRole: async (roleId: string): Promise<void> => {
    const response = await apiClient.delete(`${API_ENDPOINTS.ROLES.BASE}/${roleId}`);
    return response.data;
  },

  // Get user permissions
  getUserPermissions: async () => {
    const response = await apiClient.get(API_ENDPOINTS.ROLES.USER_PERMISSIONS);
    return response.data;
  },

  // Get company types
  getCompanyTypes: async () => {
    const response = await apiClient.get(API_ENDPOINTS.ROLES.COMPANY_TYPES);
    return response.data;
  },

  // Get user next steps
  getUserNextsteps: async (): Promise<UserNextstepsResponse> => {
    const response = await apiClient.get(API_ENDPOINTS.ROLES.USER_NEXTSTEPS);
    return response.data;
  },

  // Get user videos
  getUserVideos: async (): Promise<UserVideosResponse> => {
    const response = await apiClient.get(API_ENDPOINTS.ROLES.USER_VIDEOS);
    return response.data;
  },

  // Get child roles
  getChildRoles: async (): Promise<Role[]> => {
    const response = await apiClient.get(API_ENDPOINTS.ROLES.CHILD_ROLES);
    return response.data;
  },

  // Update user next step
  updateUserNextstep: async (stepData: any) => {
    const response = await apiClient.post(API_ENDPOINTS.ROLES.USER_NEXTSTEP, stepData);
    return response.data;
  },

  // Get default permissions
  getDefaultPermissions: async () => {
    const response = await apiClient.get(API_ENDPOINTS.ROLES.DEFAULT_PERMISSIONS);
    return response.data;
  },
};