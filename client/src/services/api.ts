import { API_ENDPOINTS } from '../config';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

// Auth Services
export const authService = {
  login: async (credentials: { email: string; password: string }) => {
    const response = await fetch(API_ENDPOINTS.login, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    return response.json();
  },

  register: async (userData: any) => {
    const response = await fetch(API_ENDPOINTS.register, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return response.json();
  },

  verifyOtp: async (data: { email: string; otp: string }) => {
    const response = await fetch(API_ENDPOINTS.verifyOtp, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  resendOtp: async (email: string) => {
    const response = await fetch(API_ENDPOINTS.resendOtp, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    return response.json();
  },

  getProfile: async () => {
    const response = await fetch(API_ENDPOINTS.profile, {
      headers: getAuthHeaders()
    });
    return response.json();
  },

  updateCompanyProfile: async (profileData: any) => {
    const response = await fetch(API_ENDPOINTS.companyProfile, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData)
    });
    return response.json();
  },

  getUsers: async () => {
    const response = await fetch(API_ENDPOINTS.users, {
      headers: getAuthHeaders()
    });
    return response.json();
  },

  getOrgUsers: async () => {
    const response = await fetch(API_ENDPOINTS.orgUsers, {
      headers: getAuthHeaders()
    });
    return response.json();
  },

  removeLogo: async (userId: string) => {
    const response = await fetch(`${API_ENDPOINTS.removeLogo}/${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return response.json();
  },

  deleteUser: async (userId: string) => {
    const response = await fetch(`${API_ENDPOINTS.deleteUser}/${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return response.json();
  },

  inviteAdvisory: async (inviteData: any) => {
    const response = await fetch(API_ENDPOINTS.inviteAdvisory, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(inviteData)
    });
    return response.json();
  },

  verifyAdvisory: async (token: string) => {
    const response = await fetch(`${API_ENDPOINTS.verifyAdvisory}/${token}`);
    return response.json();
  },

  completeAdvisoryProfile: async (token: string, profileData: any) => {
    const response = await fetch(`${API_ENDPOINTS.completeAdvisoryProfile}/${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData)
    });
    return response.json();
  }
};

// User Services
export const userService = {
  getAllUsers: async () => {
    const response = await fetch(API_ENDPOINTS.allUsers, {
      headers: getAuthHeaders()
    });
    return response.json();
  },

  getAdminUsers: async () => {
    try {
      const response = await fetch(API_ENDPOINTS.adminUsers, {
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('getAdminUsers API response:', data);
      return data;
    } catch (error) {
      console.error('getAdminUsers API error:', error);
      throw error;
    }
  },

  getCompanies: async () => {
    try {
      const response = await fetch(API_ENDPOINTS.companies, {
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('getCompanies API response:', data);
      return data;
    } catch (error) {
      console.error('getCompanies API error:', error);
      throw error;
    }
  },

  updateUserStatus: async (userId: string, status: string) => {
    const response = await fetch(API_ENDPOINTS.userStatus.replace(':id', userId), {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status })
    });
    return response.json();
  }
};

// Role Services
export const roleService = {
  getRoles: async () => {
    const response = await fetch(API_ENDPOINTS.roles, {
      headers: getAuthHeaders()
    });
    return response.json();
  },

  createRole: async (roleData: any) => {
    const response = await fetch(API_ENDPOINTS.roles, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(roleData)
    });
    return response.json();
  },

  updateRole: async (roleId: string, roleData: any) => {
    const response = await fetch(`${API_ENDPOINTS.roles}/${roleId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(roleData)
    });
    return response.json();
  },

  deleteRole: async (roleId: string) => {
    const response = await fetch(`${API_ENDPOINTS.roles}/${roleId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return response.json();
  },

  getUserPermissions: async () => {
    const response = await fetch(API_ENDPOINTS.userPermissions, {
      headers: getAuthHeaders()
    });
    return response.json();
  },

  getCompanyTypes: async () => {
    const response = await fetch(API_ENDPOINTS.companyTypes);
    return response.json();
  },

  getUserNextsteps: async () => {
    const response = await fetch(API_ENDPOINTS.userNextsteps, {
      headers: getAuthHeaders()
    });
    return response.json();
  },

  getUserVideos: async () => {
    const response = await fetch(API_ENDPOINTS.userVideos, {
      headers: getAuthHeaders()
    });
    return response.json();
  },

  getChildRoles: async () => {
    const response = await fetch(API_ENDPOINTS.childRoles, {
      headers: getAuthHeaders()
    });
    return response.json();
  },

  updateUserNextstep: async (stepData: any) => {
    const response = await fetch(API_ENDPOINTS.userNextstep, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(stepData)
    });
    return response.json();
  },

  getDefaultPermissions: async () => {
    const response = await fetch(API_ENDPOINTS.defaultPermissions, {
      headers: getAuthHeaders()
    });
    return response.json();
  }
};

// Library Services
export const libraryService = {
  getLibrary: async () => {
    const response = await fetch(API_ENDPOINTS.library, {
      headers: getAuthHeaders()
    });
    return response.json();
  },

  createLibraryItem: async (itemData: any) => {
    const response = await fetch(API_ENDPOINTS.library, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(itemData)
    });
    return response.json();
  },

  updateLibraryItem: async (itemId: string, itemData: any) => {
    const response = await fetch(`${API_ENDPOINTS.library}/${itemId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(itemData)
    });
    return response.json();
  },

  deleteLibraryItem: async (itemId: string) => {
    const response = await fetch(`${API_ENDPOINTS.library}/${itemId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return response.json();
  }
};

// Validation Services
export const validationService = {
  validateEmail: async (email: string) => {
    const response = await fetch(API_ENDPOINTS.validateEmail, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    return response.json();
  }
};

// Master Services
export const masterService = {
  getMaster: async () => {
    const response = await fetch(API_ENDPOINTS.master, {
      headers: getAuthHeaders()
    });
    return response.json();
  }
};