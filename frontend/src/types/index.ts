export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  storageUsed: number;
  role: 'user' | 'admin';
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export interface FileItem {
  _id: string;
  originalName: string;
  storedName: string;
  mimeType: string;
  fileSize: number;
  category: string;
  tags: string[];
  folder?: string;
  uploadedBy: string;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Folder {
  _id: string;
  name: string;
  parentFolder?: string;
  userId: string;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface StorageStats {
  totalFiles: number;
  totalSize: number;
  byCategory: Record<string, number>;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  statusCode: number;
}

export interface FileUploadProgress {
  percentage: number;
  bytesUploaded: number;
  totalBytes: number;
}
