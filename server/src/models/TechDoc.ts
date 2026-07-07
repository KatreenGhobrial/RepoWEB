import mongoose, { Schema, Document } from 'mongoose';

// Represents a technical document (requirements, work plan, or engineering doc) for a project
export interface ITechDoc extends Document {
  projectId: mongoose.Types.ObjectId;         // which project this doc belongs to
  title: string;
  type: 'requirements' | 'work_plan' | 'engineering_doc';  // document category
  content: string;                             // full markdown/text body of the document
  author: mongoose.Types.ObjectId;             // user who created the document
  lastEditedBy?: mongoose.Types.ObjectId;      // last user who updated it
  tags: string[];                              // searchable topic tags
  version: number;                             // increments on every save
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------
const techDocSchema = new Schema<ITechDoc>(
  {
    // project this document is attached to
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    // document display title
    title: {
      type: String,
      required: true,
      trim: true,
    },
    // what kind of document this is
    type: {
      type: String,
      enum: ['requirements', 'work_plan', 'engineering_doc'],
      default: 'requirements',
    },
    // full text / markdown content
    content: {
      type: String,
      default: '',
    },
    // user who first created the document
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // user who made the most recent edit
    lastEditedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: undefined,
    },
    // topic tags for searching / filtering
    tags: {
      type: [String],
      default: [],
    },
    // version counter — incremented on every update
    version: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);

export default mongoose.model<ITechDoc>('TechDoc', techDocSchema);
