import { apiClient } from './client';
import type { DocumentItem, PaginatedDocuments } from '../types/document.types';

export const documentsApi = {
    upload: async (file: File): Promise<DocumentItem> => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await apiClient.post<DocumentItem>('/documents', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    getAll: async (page = 1, limit = 20): Promise<PaginatedDocuments> => {
        const response = await apiClient.get<PaginatedDocuments>('/documents', {
            params: { page, limit },
        });
        return response.data;
    },

    getById: async (id: string): Promise<DocumentItem> => {
        const response = await apiClient.get<DocumentItem>(`/documents/${id}`);
        return response.data;
    },

    reprocess: async (id: string): Promise<DocumentItem> => {
        const response = await apiClient.post<DocumentItem>(`/documents/${id}/reprocess`);
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/documents/${id}`);
    },
};