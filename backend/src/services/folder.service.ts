import mongoose from 'mongoose';
import { Folder, IFolder } from '../models/Folder';
import { File } from '../models/File';
import { ApiError } from '../utils/ApiError';

export const createFolder = async (
  name: string,
  userId: string,
  parentFolder?: string
): Promise<IFolder> => {
  const existing = await Folder.findOne({
    name,
    userId: new mongoose.Types.ObjectId(userId),
    parentFolder: parentFolder ? new mongoose.Types.ObjectId(parentFolder) : null,
  });

  if (existing) {
    throw ApiError.conflict('A folder with this name already exists in this location');
  }

  const folder = await Folder.create({
    name,
    userId: new mongoose.Types.ObjectId(userId),
    parentFolder: parentFolder ? new mongoose.Types.ObjectId(parentFolder) : null,
  });

  return folder;
};

export const getFolders = async (userId: string, parentFolder?: string): Promise<IFolder[]> => {
  const query: Record<string, unknown> = {
    userId: new mongoose.Types.ObjectId(userId),
  };

  if (parentFolder) {
    query.parentFolder = new mongoose.Types.ObjectId(parentFolder);
  } else {
    query.parentFolder = null;
  }

  const folders = await Folder.find(query).sort({ name: 1 });
  return folders;
};

export const renameFolder = async (
  folderId: string,
  userId: string,
  newName: string
): Promise<IFolder> => {
  const folder = await Folder.findOne({ _id: folderId, userId });
  if (!folder) {
    throw ApiError.notFound('Folder not found');
  }

  folder.name = newName;
  await folder.save();
  return folder;
};

export const deleteFolder = async (folderId: string, userId: string): Promise<void> => {
  const folder = await Folder.findOne({ _id: folderId, userId });
  if (!folder) {
    throw ApiError.notFound('Folder not found');
  }

  const childFolders = await Folder.find({ parentFolder: folderId });
  for (const child of childFolders) {
    await deleteFolder(child._id.toString(), userId);
  }

  await File.updateMany(
    { folder: folderId, uploadedBy: userId },
    { $unset: { folder: '' } }
  );

  await Folder.findByIdAndDelete(folderId);
};

export const moveFolder = async (
  folderId: string,
  userId: string,
  newParentId?: string
): Promise<IFolder> => {
  const folder = await Folder.findOne({ _id: folderId, userId });
  if (!folder) {
    throw ApiError.notFound('Folder not found');
  }

  if (newParentId) {
    const parent = await Folder.findOne({ _id: newParentId, userId });
    if (!parent) {
      throw ApiError.notFound('Parent folder not found');
    }

    if (newParentId === folderId) {
      throw ApiError.badRequest('A folder cannot be its own parent');
    }

    let current = parent;
    while (current.parentFolder) {
      if (current.parentFolder.toString() === folderId) {
        throw ApiError.badRequest('Cannot create circular folder structure');
      }
      const next = await Folder.findById(current.parentFolder);
      if (!next) break;
      current = next;
    }
  }

  folder.parentFolder = newParentId ? new mongoose.Types.ObjectId(newParentId) : null;
  await folder.save();
  return folder;
};
