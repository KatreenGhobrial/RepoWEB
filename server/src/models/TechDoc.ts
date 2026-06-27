import mongoose, { Schema, Document } from 'mongoose';

// ---------------------------------------------------------------------------
// Interface
// ---------------------------------------------------------------------------
export interface ITechDoc extends Document {
  projectId: mongoose.Types.ObjectId;
  title: string;
  type: 'requirements' | 'work_plan' | 'engineering_doc';
  content: string;
  author: mongoose.Types.ObjectId;
  lastEditedBy?: mongoose.Types.ObjectId;
  tags: string[];
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------
const techDocSchema = new Schema<ITechDoc>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['requirements', 'work_plan', 'engineering_doc'],
      default: 'requirements',
    },
    content: {
      type: String,
      default: '',
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    lastEditedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: undefined,
    },
    tags: {
      type: [String],
      default: [],
    },
    version: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);

export default mongoose.model<ITechDoc>('TechDoc', techDocSchema);
