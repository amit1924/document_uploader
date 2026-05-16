import { Router } from 'express';
import { authMiddleware } from '../middleware';
import { validate } from '../middleware';
import { z } from 'zod';
import {
  createFolder,
  getFolders,
  renameFolder,
  deleteFolder,
  moveFolder,
} from '../controllers/folder.controller';

const router = Router();

router.use(authMiddleware);

const createFolderSchema = z.object({
  name: z.string().min(1, 'Folder name is required').max(100),
  parentFolder: z.string().optional(),
});

const renameFolderSchema = z.object({
  name: z.string().min(1, 'Folder name is required').max(100),
});

const moveFolderSchema = z.object({
  newParentFolder: z.string().nullable().optional(),
});

router.post('/', validate({ body: createFolderSchema }), createFolder);
router.get('/', getFolders);
router.put('/:id', validate({ body: renameFolderSchema }), renameFolder);
router.put('/:id/move', validate({ body: moveFolderSchema }), moveFolder);
router.delete('/:id', deleteFolder);

export default router;
