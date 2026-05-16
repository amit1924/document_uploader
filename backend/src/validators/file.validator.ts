import { z } from 'zod';
import { DEFAULT_CATEGORIES } from '../utils/constants';

export const createFolderSchema = z.object({
  name: z
    .string()
    .min(1, 'Folder name is required')
    .max(200, 'Folder name cannot exceed 200 characters')
    .trim(),
  parentFolder: z.string().nullable().optional(),
});

export const renameFileSchema = z.object({
  name: z
    .string()
    .min(1, 'File name is required')
    .max(255, 'File name cannot exceed 255 characters')
    .trim(),
});

export const moveFileSchema = z.object({
  folderId: z.string().nullable(),
});

export const updateFileSchema = z.object({
  category: z
    .enum(DEFAULT_CATEGORIES as [string, ...string[]])
    .optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  isFavorite: z.boolean().optional(),
});

export const deleteFileSchema = z.object({
  permanent: z.boolean().optional().default(false),
});
