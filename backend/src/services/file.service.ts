import fs from 'fs';
import path from 'path';
import { pipeline } from 'stream';
import { promisify } from 'util';
import mongoose from 'mongoose';
import { File, IFile } from '../models/File';
import { User } from '../models/User';
import { ApiError } from '../utils/ApiError';
import { getFileCategory } from '../utils/helpers';
import config from '../config';

const streamPipeline = promisify(pipeline);

interface FileUploadInput {
  originalName: string;
  storedName: string;
  mimeType: string;
  fileSize: number;
  category?: string;
  tags?: string[];
  folder?: string;
  uploadPath: string;
  uploadedBy: string;
}

interface FileFilters {
  category?: string;
  folder?: string;
  search?: string;
  isFavorite?: boolean;
  tags?: string[];
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface StorageStats {
  totalFiles: number;
  totalSize: number;
  byCategory: Record<string, number>;
}

export const uploadFile = async (
  fileData: FileUploadInput
): Promise<IFile> => {
  const category = fileData.category || getFileCategory(fileData.mimeType);

  const file = await File.create({
    originalName: fileData.originalName,
    storedName: fileData.storedName,
    mimeType: fileData.mimeType,
    fileSize: fileData.fileSize,
    category,
    tags: fileData.tags || [],
    folder: fileData.folder ? new mongoose.Types.ObjectId(fileData.folder) : undefined,
    uploadPath: fileData.uploadPath,
    uploadedBy: new mongoose.Types.ObjectId(fileData.uploadedBy),
  });

  await User.findByIdAndUpdate(fileData.uploadedBy, {
    $inc: { storageUsed: fileData.fileSize },
  });

  return file;
};

export const getFiles = async (
  userId: string,
  filters: FileFilters,
  page: number = 1,
  limit: number = 20
): Promise<{ files: IFile[]; pagination: Pagination }> => {
  const query: Record<string, unknown> = { uploadedBy: new mongoose.Types.ObjectId(userId) };

  if (filters.category) query.category = filters.category;
  if (filters.folder) query.folder = new mongoose.Types.ObjectId(filters.folder);
  if (filters.isFavorite !== undefined) query.isFavorite = filters.isFavorite;
  if (filters.tags && filters.tags.length > 0) query.tags = { $in: filters.tags };

  if (filters.search) {
    query.originalName = { $regex: filters.search, $options: 'i' };
  }

  const skip = (page - 1) * limit;
  const total = await File.countDocuments(query);

  const files = await File.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('uploadedBy', 'name email');

  return {
    files,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getFile = async (fileId: string, userId: string): Promise<IFile> => {
  const file = await File.findById(fileId).populate('uploadedBy', 'name email');
  if (!file) {
    throw ApiError.notFound('File not found');
  }

  if (file.uploadedBy._id.toString() !== userId) {
    throw ApiError.forbidden('You do not have permission to access this file');
  }

  return file;
};

export const renameFile = async (
  fileId: string,
  userId: string,
  newName: string
): Promise<IFile> => {
  const file = await File.findOne({ _id: fileId, uploadedBy: userId });
  if (!file) {
    throw ApiError.notFound('File not found');
  }

  file.originalName = newName;
  await file.save();
  return file;
};

export const deleteFile = async (fileId: string, userId: string): Promise<void> => {
  const file = await File.findOne({ _id: fileId, uploadedBy: userId });
  if (!file) {
    throw ApiError.notFound('File not found');
  }

  const filePath = path.join(config.uploadDir, userId, file.storedName);
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch {
    console.error(`Failed to delete file from disk: ${filePath}`);
  }

  await File.findByIdAndDelete(fileId);

  await User.findByIdAndUpdate(userId, {
    $inc: { storageUsed: -file.fileSize },
  });
};

export const toggleFavorite = async (fileId: string, userId: string): Promise<IFile> => {
  const file = await File.findOne({ _id: fileId, uploadedBy: userId });
  if (!file) {
    throw ApiError.notFound('File not found');
  }

  file.isFavorite = !file.isFavorite;
  await file.save();
  return file;
};

export const getStorageStats = async (userId: string): Promise<StorageStats> => {
  const files = await File.find({ uploadedBy: userId });

  const totalFiles = files.length;
  const totalSize = files.reduce((sum: number, f: IFile) => sum + f.fileSize, 0);

  const byCategory: Record<string, number> = {};
  for (const file of files) {
    const cat = file.category || 'uncategorized';
    byCategory[cat] = (byCategory[cat] || 0) + 1;
  }

  return { totalFiles, totalSize, byCategory };
};

interface StreamResult {
  stream: fs.ReadStream;
  mimeType: string;
  fileSize: number;
  originalName: string;
  range?: { start: number; end: number; chunkSize: number };
}

export const streamFile = async (
  fileId: string,
  userId: string,
  rangeHeader?: string
): Promise<StreamResult> => {
  const file = await File.findOne({ _id: fileId, uploadedBy: userId });
  if (!file) {
    throw ApiError.notFound('File not found');
  }

  const filePath = path.join(config.uploadDir, userId, file.storedName);
  if (!fs.existsSync(filePath)) {
    throw ApiError.notFound('File not found on disk');
  }

  const result: StreamResult = {
    stream: fs.createReadStream(filePath),
    mimeType: file.mimeType,
    fileSize: file.fileSize,
    originalName: file.originalName,
  };

  if (rangeHeader) {
    const parts = rangeHeader.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : file.fileSize - 1;

    if (start >= file.fileSize) {
      throw ApiError.badRequest('Range not satisfiable');
    }

    const chunkSize = (end - start) + 1;
    result.stream = fs.createReadStream(filePath, { start, end });
    result.range = { start, end, chunkSize };
  }

  return result;
};
