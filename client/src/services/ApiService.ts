import { API_BASE_URL } from '../config';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
  responseType?: 'json' | 'blob';
}

class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  private getAuthHeaders(): Record<string, string> {
    const token = sessionStorage.getItem('token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { method = 'GET', body, headers = {}, responseType = 'json' } = options;
    
    let requestHeaders: Record<string, string> = {
      ...this.getAuthHeaders(),
      ...headers
    };

    // Remove Content-Type for FormData (browser will set it with boundary)
    if (body instanceof FormData) {
      delete requestHeaders['Content-Type'];
    }

    const config: RequestInit = {
      method,
      headers: requestHeaders
    };

    if (body && method !== 'GET') {
      if (body instanceof FormData) {
        config.body = body;
      } else {
        config.body = JSON.stringify(body);
      }
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      if (responseType === 'blob') {
        return (await response.blob()) as unknown as T;
      }
      
      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${method} ${endpoint}`, error);
      throw error;
    }
  }

  // GET request
  async get<T>(endpoint: string, options?: { responseType?: 'json' | 'blob' }): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', responseType: options?.responseType });
  }

  // POST request
  async post<T>(endpoint: string, data?: any, options?: { headers?: Record<string, string> }): Promise<T> {
    return this.request<T>(endpoint, { method: 'POST', body: data, headers: options?.headers });
  }

  // PUT request
  async put<T>(endpoint: string, data?: any, options?: { headers?: Record<string, string> }): Promise<T> {
    return this.request<T>(endpoint, { method: 'PUT', body: data, headers: options?.headers });
  }

  // DELETE request
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // File upload (legacy method, kept for backward compatibility)
  async uploadFile<T>(endpoint: string, formData: FormData): Promise<T> {
    return this.post<T>(endpoint, formData);
  }
}

export const apiService = new ApiService();
export default ApiService;