import { Request, Response } from 'express';
import * as folderService from '../services/folder.service';
import { ApiResponse } from '../utils/ApiResponse';
import asyncHandler from '../utils/asyncHandler';

export const createFolder = asyncHandler(async (req: Request, res: Response) => {
  const { name, parentFolder } = req.body;
  const folder = await folderService.createFolder(name, req.user!.userId, parentFolder);
  res.status(201).json(ApiResponse.created(folder, 'Folder created successfully'));
});

export const getFolders = asyncHandler(async (req: Request, res: Response) => {
  const parentFolder = req.query.parentFolder as string | undefined;
  const folders = await folderService.getFolders(req.user!.userId, parentFolder);
  res.status(200).json(ApiResponse.ok(folders));
});

export const renameFolder = asyncHandler(async (req: Request, res: Response) => {
  const { name } = req.body;
  const folder = await folderService.renameFolder(req.params.id, req.user!.userId, name);
  res.status(200).json(ApiResponse.ok(folder, 'Folder renamed successfully'));
});

export const deleteFolder = asyncHandler(async (req: Request, res: Response) => {
  await folderService.deleteFolder(req.params.id, req.user!.userId);
  res.status(200).json(ApiResponse.ok(null, 'Folder deleted successfully'));
});

export const moveFolder = asyncHandler(async (req: Request, res: Response) => {
  const { newParentFolder } = req.body;
  const folder = await folderService.moveFolder(req.params.id, req.user!.userId, newParentFolder);
  res.status(200).json(ApiResponse.ok(folder, 'Folder moved successfully'));
});
