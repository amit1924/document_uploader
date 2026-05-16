import { FiFile, FiImage, FiVideo, FiMusic, FiArchive, FiGrid, FiMonitor, FiCode, FiFileText } from 'react-icons/fi'
import type { IconType } from 'react-icons'

export const FILE_CATEGORIES = [
  'document',
  'image',
  'video',
  'audio',
  'archive',
  'spreadsheet',
  'presentation',
  'pdf',
  'code',
  'other',
] as const;

export type FileCategory = (typeof FILE_CATEGORIES)[number];

export const ALLOWED_FILE_TYPES = [
  // Documents
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.oasis.opendocument.text',
  'text/plain',
  'text/richtext',
  // Images
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'image/bmp',
  'image/tiff',
  // Video
  'video/mp4',
  'video/mpeg',
  'video/webm',
  'video/ogg',
  'video/quicktime',
  'video/x-msvideo',
  // Audio
  'audio/mpeg',
  'audio/ogg',
  'audio/wav',
  'audio/webm',
  'audio/flac',
  'audio/aac',
  // Archives
  'application/zip',
  'application/x-zip-compressed',
  'application/x-rar-compressed',
  'application/x-7z-compressed',
  'application/gzip',
  'application/x-tar',
  // Spreadsheets
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.oasis.opendocument.spreadsheet',
  // Presentations
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.oasis.opendocument.presentation',
  // Code
  'text/javascript',
  'text/typescript',
  'text/css',
  'text/html',
  'application/json',
  'application/xml',
  'text/x-python',
  'text/x-java',
  'text/x-c',
  'text/x-c++',
] as const;

export const ACCEPTED_MIME_TYPES = ALLOWED_FILE_TYPES.join(',');

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export const CATEGORY_COLORS: Record<string, string> = {
  document: '#3b82f6',
  image: '#8b5cf6',
  video: '#ec4899',
  audio: '#f59e0b',
  archive: '#10b981',
  spreadsheet: '#06b6d4',
  presentation: '#f97316',
  pdf: '#ef4444',
  code: '#6366f1',
  other: '#64748b',
};

export const CATEGORY_LABELS: Record<string, string> = {
  document: 'Document',
  image: 'Image',
  video: 'Video',
  audio: 'Audio',
  archive: 'Archive',
  spreadsheet: 'Spreadsheet',
  presentation: 'Presentation',
  pdf: 'PDF',
  code: 'Code',
  other: 'Other',
};

export function getFileIcon(mimeType: string): IconType {
  if (!mimeType) return FiFile
  if (mimeType.startsWith('image/')) return FiImage
  if (mimeType.startsWith('video/')) return FiVideo
  if (mimeType.startsWith('audio/')) return FiMusic
  if (mimeType.includes('pdf')) return FiFileText
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('tar') || mimeType.includes('7z') || mimeType.includes('gzip') || mimeType.includes('compress')) return FiArchive
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel') || mimeType.includes('sheet')) return FiGrid
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint') || mimeType.includes('slides')) return FiMonitor
  if (mimeType.includes('javascript') || mimeType.includes('typescript') || mimeType.includes('json') || mimeType.includes('html') || mimeType.includes('css') || mimeType.includes('xml')) return FiCode
  if (mimeType.startsWith('text/')) return FiFileText
  return FiFile
}
