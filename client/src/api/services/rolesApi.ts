import apiClient from '../client';
import { API_ENDPOINTS } from '../config';
import { circuitBreaker } from '../../utils/circuitBreaker';

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
    thumbnail: string;
    videoUrl: string;
  }>;
}

interface UserSubRolesResponse {
  subRoles: Array<{
    _id: string;
    name: string;
    permissionLevel: string;
  }>;
  debug?: {
    message: string;
    roleName?: string;
    roleType?: string;
    subRolesCount?: number;
    suggestion?: string;
  };
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

  // Get user sub roles
  getUserSubRoles: async (): Promise<UserSubRolesResponse> => {
    const apiKey = 'user-subroles';
    
    // Circuit breaker check
    if (!circuitBreaker.canExecute(apiKey)) {
      console.warn('🚫 Circuit breaker preventing user-subroles API call');
      return {
        subRoles: [],
        debug: {
          message: 'Circuit breaker active - too many recent calls',
          suggestion: 'Please wait before trying again'
        }
      };
    }

    try {
      const response = await apiClient.get(API_ENDPOINTS.ROLES.USER_SUBROLES);
      circuitBreaker.onSuccess(apiKey);
      return response.data;
    } catch (error) {
      circuitBreaker.onFailure(apiKey);
      throw error;
    }
  },

  // Get child roles
  getChildRoles: async (): Promise<Role[]> => {
    const response = await apiClient.get(API_ENDPOINTS.ROLES.CHILD_ROLES);
    return response.data.subRoles || [];
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