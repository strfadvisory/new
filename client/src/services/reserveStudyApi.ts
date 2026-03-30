import { apiService } from './ApiService';

export interface ReserveStudyItem {
  itemName: string;
  expectedLife: number;
  remainingLife: number;
  replacementCost: number;
  sirsType: number;
  comment?: string;
}

export interface ReserveStudyConfig {
  [key: string]: any;
}

export interface ReserveStudyData {
  studyName: string;
  items: ReserveStudyItem[];
  config: ReserveStudyConfig;
}

export const reserveStudyApi = {
  /**
   * Download reserve study template
   */
  downloadTemplate: async (): Promise<Blob> => {
    const response = await apiService.get<Blob>('/reserve-studies/template/download', {
      responseType: 'blob'
    });
    return response;
  },

  /**
   * Upload a new reserve study
   */
  uploadStudy: async (file: File, studyName: string, associationName?: string): Promise<any> => {
    const formData = new FormData();
    formData.append('excelFile', file);
    formData.append('studyName', studyName);
    if (associationName) {
      formData.append('associationName', associationName);
    }

    return await apiService.post('/reserve-studies', formData);
  },

  /**
   * Get reserve study data
   */
  getStudyData: async (studyId: string): Promise<any> => {
    return await apiService.get(`/reserve-studies/${studyId}/data`);
  },

  /**
   * Update reserve study data
   */
  updateStudyData: async (
    studyId: string,
    data: {
      studyName?: string;
      items: ReserveStudyItem[];
      config: ReserveStudyConfig;
    }
  ): Promise<any> => {
    return await apiService.put(`/reserve-studies/${studyId}/data`, data);
  },

  /**
   * Upload additional document to reserve study
   */
  uploadDocument: async (studyId: string, file: File): Promise<any> => {
    const formData = new FormData();
    formData.append('document', file);

    return await apiService.post(`/reserve-studies/${studyId}/documents`, formData);
  },

  /**
   * Get all documents for a reserve study
   */
  getStudyDocuments: async (studyId: string): Promise<any> => {
    return await apiService.get(`/reserve-studies/${studyId}/documents`);
  },

  /**
   * Download a specific document
   */
  downloadDocument: async (studyId: string, documentId: string): Promise<Blob> => {
    const response = await apiService.get<Blob>(
      `/reserve-studies/${studyId}/documents/${documentId}/download`,
      {
        responseType: 'blob'
      }
    );
    return response;
  },

  /**
   * Download reserve study Excel file
   */
  downloadStudy: async (studyId: string): Promise<Blob> => {
    const response = await apiService.get<Blob>(`/reserve-studies/${studyId}/download`, {
      responseType: 'blob'
    });
    return response;
  },

  /**
   * Delete reserve study
   */
  deleteStudy: async (studyId: string): Promise<any> => {
    return await apiService.delete(`/reserve-studies/${studyId}`);
  },

  /**
   * Update reserve study metadata
   */
  updateStudyMetadata: async (
    studyId: string,
    data: {
      studyName?: string;
      associationName?: string;
      allowUser?: string[];
    }
  ): Promise<any> => {
    return await apiService.put(`/reserve-studies/${studyId}`, data);
  },

  /**
   * Duplicate an item in reserve study
   */
  duplicateItem: async (studyId: string, itemIndex: number): Promise<any> => {
    return await apiService.post(`/reserve-studies/${studyId}/items/duplicate`, {
      itemIndex
    });
  }
};

export default reserveStudyApi;
