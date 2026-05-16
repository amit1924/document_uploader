import { RequestHandler } from 'express';
import upload from '../config/storage';
import { ApiError } from '../utils/ApiError';

export const uploadSingle: RequestHandler = (req, res, next) => {
  const handler = upload.single('file');
  handler(req, res, (err) => {
    if (err) {
      next(err);
    } else if (!req.file) {
      next(ApiError.badRequest('No file provided'));
    } else {
      next();
    }
  });
};

export const uploadArray: RequestHandler = (req, res, next) => {
  const handler = upload.array('files', 10);
  handler(req, res, (err) => {
    if (err) {
      next(err);
    } else if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
      next(ApiError.badRequest('No files provided'));
    } else {
      next();
    }
  });
};
