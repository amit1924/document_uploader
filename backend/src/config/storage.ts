import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import config from './index';
import { generateStoredName, isFileAllowed } from '../utils/helpers';
import { ApiError } from '../utils/ApiError';

const getStoragePath = (userId: string): string => {
  const userDir = path.join(config.uploadDir, userId);
  if (!fs.existsSync(userDir)) {
    fs.mkdirSync(userDir, { recursive: true });
  }
  return userDir;
};

const storage = multer.diskStorage({
  destination: (req: Request, _file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return cb(ApiError.unauthorized('User not authenticated'), '');
    }
    const dest = getStoragePath(userId);
    cb(null, dest);
  },
  filename: (_req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const storedName = generateStoredName(file.originalname);
    cb(null, storedName);
  },
});

const fileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!isFileAllowed(file.mimetype, ext)) {
    return cb(ApiError.badRequest(`File type not allowed: ${file.mimetype}`));
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.maxFileSize,
  },
});

export default upload;
