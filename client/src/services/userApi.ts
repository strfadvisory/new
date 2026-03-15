import axios from 'axios';
import { API_BASE_URL } from '../config';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const getUserProfile = async () => {
  try {
    const response = await axiosInstance.get('/user/profile');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch profile');
  }
};

export const getUserCompanies = async () => {
  try {
    const response = await axiosInstance.get('/users/user-companies');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch companies');
  }
};

export const getPendingRequests = async () => {
  try {
    const response = await axiosInstance.get('/users/pending-requests');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch pending requests');
  }
};

export const handleOrgRequest = async (requestId: string, action: 'accept' | 'reject') => {
  try {
    const response = await axiosInstance.put(`/users/org-request/${requestId}`, { action });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to handle request');
  }
};

export const switchCompany = async (companyId: string) => {
  try {
    const response = await axiosInstance.post('/users/switch-company', { companyId });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to switch company');
  }
};

export const getUserPermissionLevel = async (companyId: string) => {
  try {
    const response = await axiosInstance.get(`/users/permission-level/${companyId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch permission level');
  }
};
