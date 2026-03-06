import axios, { AxiosInstance } from 'axios';
import { API_BASE_URL } from './config';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    if (error.response?.status === 403) {
      // Forbidden - show error message
      console.error('Access forbidden');
    }
    
    if (error.response?.status >= 500) {
      // Server error
      console.error('Server error occurred');
    }
    
    return Promise.reject(error);
  }
);

// Helper function for file uploads
export const createFormDataClient = (): AxiosInstance => {
  const formDataClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000, // Longer timeout for file uploads
  });

  // Add auth token for file uploads
  formDataClient.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      // Don't set Content-Type for FormData, let browser set it with boundary
      delete config.headers['Content-Type'];
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  return formDataClient;
};

export default apiClient;