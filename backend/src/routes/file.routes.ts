import { Router } from 'express';
import { authMiddleware, uploadSingle, uploadArray } from '../middleware';
import { validate } from '../middleware';
import { z } from 'zod';
import {
  uploadSingle as uploadSingleHandler,
  uploadMultiple,
  getFiles,
  getFile,
  renameFile,
  deleteFile,
  toggleFavorite,
  getStorageStats,
  downloadFile,
  viewFile,
} from '../controllers/file.controller';

const router = Router();

router.use(authMiddleware);

const renameSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
});

router.post('/upload', uploadSingle, uploadSingleHandler);
router.post('/upload/multiple', uploadArray, uploadMultiple);
router.get('/', getFiles);
router.get('/stats/summary', getStorageStats);
router.get('/:id', getFile);
router.get('/:id/download', downloadFile);
router.get('/:id/view', viewFile);
router.put('/:id/rename', validate({ body: renameSchema }), renameFile);
router.delete('/:id', deleteFile);
router.put('/:id/favorite', toggleFavorite);

export default router;
