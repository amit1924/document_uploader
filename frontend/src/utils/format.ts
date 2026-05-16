import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns';
import { CATEGORY_LABELS } from './constants';

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = parseFloat((bytes / Math.pow(k, i)).toFixed(2));
  return `${value} ${units[i]}`;
}

export function formatDate(dateStr: string): string {
  const date = parseISO(dateStr);
  if (!isValid(date)) return 'Invalid date';
  return format(date, 'MMM d, yyyy');
}

export function formatDateRelative(dateStr: string): string {
  const date = parseISO(dateStr);
  if (!isValid(date)) return 'Invalid date';
  return formatDistanceToNow(date, { addSuffix: true });
}

export function formatDateTime(dateStr: string): string {
  const date = parseISO(dateStr);
  if (!isValid(date)) return 'Invalid date';
  return format(date, 'MMM d, yyyy h:mm a');
}

export function formatFileType(mimeType: string): string {
  const category = mimeType.split('/')[0];
  return CATEGORY_LABELS[category] || mimeType;
}

export function truncateFilename(name: string, maxLength = 30): string {
  if (name.length <= maxLength) return name;
  const ext = name.split('.').pop() || '';
  const nameWithoutExt = name.slice(0, name.lastIndexOf('.'));
  const truncated = nameWithoutExt.slice(0, maxLength - ext.length - 4);
  return `${truncated}...${ext}`;
}

export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}
