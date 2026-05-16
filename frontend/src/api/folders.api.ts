import axiosInstance from './axios';
import type { Folder } from '@/types';

export const foldersApi = {
  createFolder: async (name: string, parentFolder?: string): Promise<Folder> => {
    const { data } = await axiosInstance.post<Folder>('/folders', {
      name,
      parentFolder,
    });
    return data;
  },

  getFolders: async (parentFolder?: string): Promise<Folder[]> => {
    const { data } = await axiosInstance.get<Folder[]>('/folders', {
      params: parentFolder ? { parentFolder } : undefined,
    });
    return data;
  },

  renameFolder: async (folderId: string, name: string): Promise<Folder> => {
    const { data } = await axiosInstance.put<Folder>(`/folders/${folderId}`, {
      name,
    });
    return data;
  },

  deleteFolder: async (folderId: string): Promise<void> => {
    await axiosInstance.delete(`/folders/${folderId}`);
  },
};
