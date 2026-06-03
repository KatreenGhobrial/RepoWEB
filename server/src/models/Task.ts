import mongoose, { Schema, Document } from 'mongoose';

// ---------------------------------------------------------------------------
// Interface
// ---------------------------------------------------------------------------
export interface ITask extends Document {
  project: mongoose.Types.ObjectId;
  title: string;
  description: string;
  owner: mongoose.Types.ObjectId;
  assignedTo: string;           // role label like "Hardware Student"
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  discipline: string;           // "hardware" | "backend" | "frontend" | "ai"
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------
const taskSchema = new Schema<ITask>(
  {
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    assignedTo: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['todo', 'in-progress', 'done'],
      default: 'todo',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    discipline: {
      type: String,
      default: '',
    },
    dueDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model<ITask>('Task', taskSchema);
