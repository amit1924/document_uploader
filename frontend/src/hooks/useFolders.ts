import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { foldersApi } from '@/api/folders.api';
import toast from 'react-hot-toast';

export function useFolders(parentFolder?: string) {
  return useQuery({
    queryKey: ['folders', parentFolder],
    queryFn: () => foldersApi.getFolders(parentFolder),
    staleTime: 30_000,
  });
}

export function useCreateFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      name,
      parentFolder,
    }: {
      name: string;
      parentFolder?: string;
    }) => foldersApi.createFolder(name, parentFolder),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folders'] });
      toast.success('Folder created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create folder');
    },
  });
}

export function useRenameFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      folderId,
      name,
    }: {
      folderId: string;
      name: string;
    }) => foldersApi.renameFolder(folderId, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folders'] });
      toast.success('Folder renamed successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to rename folder');
    },
  });
}

export function useDeleteFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (folderId: string) => foldersApi.deleteFolder(folderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folders'] });
      queryClient.invalidateQueries({ queryKey: ['files'] });
      toast.success('Folder deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete folder');
    },
  });
}
