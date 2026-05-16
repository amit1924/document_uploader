import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IFolder extends Document {
  name: string;
  parentFolder: Types.ObjectId | null;
  userId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const folderSchema = new Schema<IFolder>(
  {
    name: {
      type: String,
      required: [true, 'Folder name is required'],
      trim: true,
      maxlength: [200, 'Folder name cannot exceed 200 characters'],
    },
    parentFolder: {
      type: Schema.Types.ObjectId,
      ref: 'Folder',
      default: null,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
  },
  {
    timestamps: true,
  },
);

folderSchema.index({ userId: 1, name: 1, parentFolder: 1 }, { unique: true });

export const Folder = mongoose.model<IFolder>('Folder', folderSchema);
