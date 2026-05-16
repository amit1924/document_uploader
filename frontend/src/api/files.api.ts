import axiosInstance from './axios';
import type { FileItem, PaginatedResponse, StorageStats } from '@/types';

interface GetFilesParams {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  folder?: string;
  favorite?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const filesApi = {
  uploadFile: async (
    file: File,
    onUploadProgress?: (percentage: number) => void,
    folder?: string,
    tags?: string[]
  ): Promise<FileItem> => {
    const formData = new FormData();
    formData.append('file', file);
    if (folder) formData.append('folder', folder);
    if (tags?.length) formData.append('tags', JSON.stringify(tags));

    const { data } = await axiosInstance.post<FileItem>('/files/upload', formData, {
      onUploadProgress: (progressEvent) => {
        if (onUploadProgress && progressEvent.total) {
          const percentage = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onUploadProgress(percentage);
        }
      },
    });
    return data;
  },

  uploadMultipleFiles: async (
    files: File[],
    onUploadProgress?: (percentage: number) => void,
    folder?: string,
    tags?: string[]
  ): Promise<FileItem[]> => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    if (folder) formData.append('folder', folder);
    if (tags?.length) formData.append('tags', JSON.stringify(tags));

    const { data } = await axiosInstance.post<FileItem[]>('/files/upload-multiple', formData, {
      onUploadProgress: (progressEvent) => {
        if (onUploadProgress && progressEvent.total) {
          const percentage = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onUploadProgress(percentage);
        }
      },
    });
    return data;
  },

  getFiles: async (params?: GetFilesParams): Promise<PaginatedResponse<FileItem>> => {
    const { data } = await axiosInstance.get<PaginatedResponse<FileItem>>('/files', {
      params,
    });
    return data;
  },

  getFile: async (fileId: string): Promise<FileItem> => {
    const { data } = await axiosInstance.get<FileItem>(`/files/${fileId}`);
    return data;
  },

  renameFile: async (fileId: string, name: string): Promise<FileItem> => {
    const { data } = await axiosInstance.put<FileItem>(`/files/${fileId}/rename`, {
      name,
    });
    return data;
  },

  deleteFile: async (fileId: string): Promise<void> => {
    await axiosInstance.delete(`/files/${fileId}`);
  },

  toggleFavorite: async (fileId: string): Promise<FileItem> => {
    const { data } = await axiosInstance.put<FileItem>(`/files/${fileId}/favorite`);
    return data;
  },

  getStorageStats: async (): Promise<StorageStats> => {
    const { data } = await axiosInstance.get<StorageStats>('/files/stats/summary');
    return data;
  },

  downloadFile: async (fileId: string): Promise<Blob> => {
    const { data } = await axiosInstance.get<Blob>(`/files/${fileId}/download`, {
      responseType: 'blob',
    });
    return data;
  },


};
