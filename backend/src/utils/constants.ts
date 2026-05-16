import path from 'path';

export const ALLOWED_MIME_TYPES: Record<string, string> = {
  pdf: 'application/pdf',
  jpg: 'image/jpeg',
  png: 'image/png',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  txt: 'text/plain',
  zip: 'application/zip',
};

export const MAX_FILE_SIZE: number = parseInt(process.env.MAX_FILE_SIZE || '52428800', 10);

export const DEFAULT_CATEGORIES: string[] = [
  'ids',
  'medical',
  'certificates',
  'bank',
  'legal',
  'photos',
  'documents',
  'other',
] as const;

export const UPLOAD_DIR: string = path.resolve(process.env.UPLOAD_DIR || './uploads');
