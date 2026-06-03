import mongoose, { Schema, Document } from 'mongoose';

// ---------------------------------------------------------------------------
// Sub-document
// ---------------------------------------------------------------------------
export interface IChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

// ---------------------------------------------------------------------------
// Main interface
// ---------------------------------------------------------------------------
export interface IChatHistory extends Document {
  project: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  sessionId: string;             // groups messages into a conversation session
  messages: IChatMessage[];
  detectedPhase: string;         // auto-detected project phase
  detectedIssues: string[];      // IoT issues found during conversation
  reflectionScore: number;       // NLP quality score 0-100
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------
const chatMessageSchema = new Schema<IChatMessage>(
  {
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const chatHistorySchema = new Schema<IChatHistory>(
  {
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: false,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sessionId: {
      type: String,
      required: true,
    },
    messages: {
      type: [chatMessageSchema],
      default: [],
    },
    detectedPhase: {
      type: String,
      default: 'ideation',
    },
    detectedIssues: {
      type: [String],
      default: [],
    },
    reflectionScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IChatHistory>('ChatHistory', chatHistorySchema);
