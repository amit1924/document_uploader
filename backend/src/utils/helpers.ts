import { v4 as uuidv4 } from 'uuid';
import path from 'path';

export const generateStoredName = (originalName: string): string => {
  const ext = path.extname(originalName).toLowerCase();
  return `${uuidv4()}${ext}`;
};

export const sanitizeFilename = (name: string): string => {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').substring(0, 255);
};

export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.oasis.opendocument.text',
  'text/plain',
  'text/richtext',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'image/bmp',
  'image/tiff',
  'video/mp4',
  'video/mpeg',
  'video/webm',
  'video/ogg',
  'video/quicktime',
  'video/x-msvideo',
  'audio/mpeg',
  'audio/ogg',
  'audio/wav',
  'audio/webm',
  'audio/flac',
  'audio/aac',
  'application/zip',
  'application/x-zip-compressed',
  'application/x-rar-compressed',
  'application/x-7z-compressed',
  'application/gzip',
  'application/x-tar',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.oasis.opendocument.spreadsheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.oasis.opendocument.presentation',
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
];

export const BLOCKED_EXTENSIONS = [
  '.exe', '.bat', '.cmd', '.com', '.msi', '.scr', '.pif',
  '.sh', '.bash', '.vbs', '.ps1', '.dll', '.sys',
];

export const isFileAllowed = (mimeType: string, ext: string): boolean => {
  if (BLOCKED_EXTENSIONS.includes(ext)) return false;
  return ALLOWED_MIME_TYPES.includes(mimeType);
};

export const getFileCategory = (mimeType: string): string => {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'spreadsheet';
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'presentation';
  if (mimeType.includes('wordprocessing') || mimeType === 'application/msword' || mimeType === 'text/plain' || mimeType === 'text/richtext') return 'document';
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('tar') || mimeType.includes('7z') || mimeType.includes('gzip') || mimeType.includes('compress')) return 'archive';
  if (mimeType.includes('javascript') || mimeType.includes('typescript') || mimeType.includes('json') || mimeType.includes('html') || mimeType.includes('css') || mimeType.includes('xml') || mimeType.includes('python') || mimeType.includes('java') || mimeType.includes('/x-c') || mimeType.includes('/x-c++')) return 'code';
  return 'other';
};
