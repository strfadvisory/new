import apiClient from '../client';
import { API_ENDPOINTS } from '../config';

interface LibraryItem {
  _id: string;
  title: string;
  description: string;
  type: string;
}

// Library API functions
export const libraryApi = {
  // Get all library items
  getLibrary: async (): Promise<LibraryItem[]> => {
    const response = await apiClient.get(API_ENDPOINTS.LIBRARY.BASE);
    return response.data;
  },

  // Get library item by ID
  getLibraryItemById: async (itemId: string): Promise<LibraryItem> => {
    const response = await apiClient.get(`${API_ENDPOINTS.LIBRARY.BASE}/${itemId}`);
    return response.data;
  },

  // Create library item
  createLibraryItem: async (itemData: Partial<LibraryItem>): Promise<LibraryItem> => {
    const response = await apiClient.post(API_ENDPOINTS.LIBRARY.BASE, itemData);
    return response.data;
  },

  // Update library item
  updateLibraryItem: async (itemId: string, itemData: Partial<LibraryItem>): Promise<LibraryItem> => {
    const response = await apiClient.put(`${API_ENDPOINTS.LIBRARY.BASE}/${itemId}`, itemData);
    return response.data;
  },

  // Delete library item
  deleteLibraryItem: async (itemId: string): Promise<void> => {
    const response = await apiClient.delete(`${API_ENDPOINTS.LIBRARY.BASE}/${itemId}`);
    return response.data;
  },
};