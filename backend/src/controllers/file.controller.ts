import { Request, Response, NextFunction } from 'express';
import * as fileService from '../services/file.service';
import { ApiResponse } from '../utils/ApiResponse';
import asyncHandler from '../utils/asyncHandler';
import mime from 'mime-types';

export const uploadSingle = asyncHandler(async (req: Request, res: Response) => {
  const file = req.file!;
  const fileData = {
    originalName: file.originalname,
    storedName: file.filename,
    mimeType: file.mimetype,
    fileSize: file.size,
    category: req.body.category,
    tags: req.body.tags ? (Array.isArray(req.body.tags) ? req.body.tags : [req.body.tags]) : [],
    folder: req.body.folder,
    uploadPath: file.path,
    uploadedBy: req.user!.userId,
  };

  const created = await fileService.uploadFile(fileData);
  res.status(201).json(ApiResponse.created(created, 'File uploaded successfully'));
});

export const uploadMultiple = asyncHandler(async (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[];
  const uploaded = [];

  for (const file of files) {
    const fileData = {
      originalName: file.originalname,
      storedName: file.filename,
      mimeType: file.mimetype,
      fileSize: file.size,
      category: req.body.category,
      tags: req.body.tags ? (Array.isArray(req.body.tags) ? req.body.tags : [req.body.tags]) : [],
      folder: req.body.folder,
      uploadPath: file.path,
      uploadedBy: req.user!.userId,
    };
    const created = await fileService.uploadFile(fileData);
    uploaded.push(created);
  }

  res.status(201).json(ApiResponse.created(uploaded, `${uploaded.length} files uploaded successfully`));
});

export const getFiles = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;

  const filters = {
    category: req.query.category as string | undefined,
    folder: req.query.folder as string | undefined,
    search: req.query.search as string | undefined,
    isFavorite: req.query.isFavorite === 'true' ? true : req.query.isFavorite === 'false' ? false : undefined,
    tags: req.query.tags ? (req.query.tags as string).split(',') : undefined,
  };

  const result = await fileService.getFiles(req.user!.userId, filters, page, limit);
  res.status(200).json(ApiResponse.ok({ data: result.files, ...result.pagination }, 'Files fetched'));
});

export const getFile = asyncHandler(async (req: Request, res: Response) => {
  const file = await fileService.getFile(req.params.id, req.user!.userId);
  res.status(200).json(ApiResponse.ok(file));
});

export const renameFile = asyncHandler(async (req: Request, res: Response) => {
  const { name } = req.body;
  const file = await fileService.renameFile(req.params.id, req.user!.userId, name);
  res.status(200).json(ApiResponse.ok(file, 'File renamed successfully'));
});

export const deleteFile = asyncHandler(async (req: Request, res: Response) => {
  await fileService.deleteFile(req.params.id, req.user!.userId);
  res.status(200).json(ApiResponse.ok(null, 'File deleted successfully'));
});

export const toggleFavorite = asyncHandler(async (req: Request, res: Response) => {
  const file = await fileService.toggleFavorite(req.params.id, req.user!.userId);
  res.status(200).json(ApiResponse.ok(file, file.isFavorite ? 'Added to favorites' : 'Removed from favorites'));
});

export const getStorageStats = asyncHandler(async (req: Request, res: Response) => {
  const stats = await fileService.getStorageStats(req.user!.userId);
  res.status(200).json(ApiResponse.ok(stats));
});

export const downloadFile = asyncHandler(async (req: Request, res: Response) => {
  const rangeHeader = req.headers.range;
  const fileInfo = await fileService.streamFile(req.params.id, req.user!.userId, rangeHeader);

  const contentType = mime.lookup(fileInfo.originalName) || 'application/octet-stream';
  res.setHeader('Content-Type', contentType as string);
  res.setHeader('Content-Disposition', `attachment; filename="${fileInfo.originalName}"`);

  if (fileInfo.range) {
    res.status(206);
    res.setHeader('Content-Range', `bytes ${fileInfo.range.start}-${fileInfo.range.end}/${fileInfo.fileSize}`);
    res.setHeader('Content-Length', fileInfo.range.chunkSize);
  } else {
    res.setHeader('Content-Length', fileInfo.fileSize);
    res.setHeader('Accept-Ranges', 'bytes');
  }

  fileInfo.stream.pipe(res);
});

export const viewFile = asyncHandler(async (req: Request, res: Response) => {
  const fileInfo = await fileService.streamFile(req.params.id, req.user!.userId);

  res.setHeader('Content-Type', fileInfo.mimeType);
  res.setHeader('Content-Length', fileInfo.fileSize);
  res.setHeader('Cache-Control', 'private, max-age=3600');

  fileInfo.stream.pipe(res);
});
