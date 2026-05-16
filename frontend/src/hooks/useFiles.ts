import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { filesApi } from '@/api/files.api';
import type { FileItem } from '@/types';
import toast from 'react-hot-toast';
import { useAppStore } from '@/store/appStore';

interface UseFilesParams {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  folder?: string;
  favorite?: boolean;
}

export function useFiles(params?: UseFilesParams) {
  const selectedCategory = useAppStore((state) => state.selectedCategory);

  return useQuery({
    queryKey: ['files', { ...params, category: params?.category || selectedCategory }],
    queryFn: () =>
      filesApi.getFiles({
        ...params,
        category: params?.category || selectedCategory || undefined,
      }),
    staleTime: 30_000,
  });
}

export function useFile(fileId: string | undefined) {
  return useQuery({
    queryKey: ['file', fileId],
    queryFn: () => filesApi.getFile(fileId!),
    enabled: !!fileId,
    staleTime: 30_000,
  });
}

export function useUploadFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      file,
      folder,
      tags,
      onProgress,
    }: {
      file: File;
      folder?: string;
      tags?: string[];
      onProgress?: (percentage: number) => void;
    }) => filesApi.uploadFile(file, onProgress, folder, tags),
    onSuccess: (uploadedFile) => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
      queryClient.invalidateQueries({ queryKey: ['storage-stats'] });
      toast.success(`${uploadedFile.originalName} uploaded successfully`);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to upload file');
    },
  });
}

export function useUploadMultipleFiles() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      files,
      folder,
      tags,
      onProgress,
    }: {
      files: File[];
      folder?: string;
      tags?: string[];
      onProgress?: (percentage: number) => void;
    }) => filesApi.uploadMultipleFiles(files, onProgress, folder, tags),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
      queryClient.invalidateQueries({ queryKey: ['storage-stats'] });
      toast.success('Files uploaded successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to upload files');
    },
  });
}

export function useRenameFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      fileId,
      originalName,
    }: {
      fileId: string;
      originalName: string;
    }) => filesApi.renameFile(fileId, originalName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
      toast.success('File renamed successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to rename file');
    },
  });
}

export function useDeleteFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (fileId: string) => filesApi.deleteFile(fileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
      queryClient.invalidateQueries({ queryKey: ['storage-stats'] });
      toast.success('File deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete file');
    },
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (fileId: string) => filesApi.toggleFavorite(fileId),
    onMutate: async (fileId: string) => {
      await queryClient.cancelQueries({ queryKey: ['files'] });
      const previousQueries = queryClient.getQueriesData<{
        pages: Array<{ data: FileItem[] }>;
      }>({ queryKey: ['files'] });

      queryClient.setQueriesData<{
        pages: Array<{ data: FileItem[] }>;
      }>({ queryKey: ['files'] }, (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            data: page.data.map((file) =>
              file._id === fileId
                ? { ...file, isFavorite: !file.isFavorite }
                : file
            ),
          })),
        };
      });

      return { previousQueries };
    },
    onError: (_err, _fileId, context) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast.error('Failed to toggle favorite');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
    },
  });
}

export function useStorageStats() {
  return useQuery({
    queryKey: ['storage-stats'],
    queryFn: filesApi.getStorageStats,
    staleTime: 60_000,
  });
}

export function useDownloadFile() {
  return useMutation({
    mutationFn: async (file: FileItem) => {
      const blob = await filesApi.downloadFile(file._id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.originalName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    },
    onSuccess: () => {
      toast.success('File downloaded successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to download file');
    },
  });
}
