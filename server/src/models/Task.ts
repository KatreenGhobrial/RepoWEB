import mongoose, { Schema, Document } from 'mongoose';

// Represents a single task assigned to a team member within a project
export interface ITask extends Document {
  project: mongoose.Types.ObjectId;  // which project this task belongs to
  title: string;
  description: string;
  owner: mongoose.Types.ObjectId;    // user who created the task
  assignedTo: string;                // role label like "Hardware Student"
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  discipline: string;                // "hardware" | "backend" | "frontend" | "ai"
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------
const taskSchema = new Schema<ITask>(
  {
    // the project this task is part of
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    // short task name shown in the board
    title: {
      type: String,
      required: true,
      trim: true,
    },
    // detailed description of what needs to be done
    description: {
      type: String,
      default: '',
    },
    // user who created the task
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    // team member (by name/username) responsible for this task
    assignedTo: {
      type: String,
      default: '',
    },
    // current progress state
    status: {
      type: String,
      enum: ['todo', 'in-progress', 'done'],
      default: 'todo',
    },
    // how urgent this task is
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    // which engineering area this task belongs to
    discipline: {
      type: String,
      default: '',
    },
    // optional deadline
    dueDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model<ITask>('Task', taskSchema);
