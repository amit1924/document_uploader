import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IFile extends Document {
  originalName: string;
  storedName: string;
  mimeType: string;
  fileSize: number;
  category: 'ids' | 'medical' | 'certificates' | 'bank' | 'legal' | 'photos' | 'documents' | 'other';
  tags: string[];
  folder: Types.ObjectId | null;
  uploadPath: string;
  uploadedBy: Types.ObjectId;
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const fileSchema = new Schema<IFile>(
  {
    originalName: {
      type: String,
      required: [true, 'Original filename is required'],
      trim: true,
    },
    storedName: {
      type: String,
      required: [true, 'Stored filename is required'],
    },
    mimeType: {
      type: String,
      required: [true, 'MIME type is required'],
    },
    fileSize: {
      type: Number,
      required: [true, 'File size is required'],
      min: [1, 'File must not be empty'],
    },
    category: {
      type: String,
      enum: ['document', 'image', 'video', 'audio', 'archive', 'spreadsheet', 'presentation', 'pdf', 'code', 'other'],
      default: 'other',
    },
    tags: {
      type: [String],
      default: [],
    },
    folder: {
      type: Schema.Types.ObjectId,
      ref: 'Folder',
      default: null,
    },
    uploadPath: {
      type: String,
      required: [true, 'Upload path is required'],
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Uploader is required'],
    },
    isFavorite: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

fileSchema.index({ uploadedBy: 1, createdAt: -1 });
fileSchema.index({ uploadedBy: 1, category: 1 });
fileSchema.index({ folder: 1 });

export const File = mongoose.model<IFile>('File', fileSchema);
