import mongoose, { Schema, Document } from 'mongoose';

// Represents a single message in a chat session (user or assistant)
export interface IChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

// Represents a full bot conversation session tied to a project
export interface IChatHistory extends Document {
  project: mongoose.Types.ObjectId;  // which project this session belongs to
  user: string;                       // user identifier (currently always 'anonymous_user')
  sessionId: string;                  // groups messages into one conversation session
  messages: IChatMessage[];           // ordered list of all messages in the session
  detectedPhase: string;              // last detected project phase (e.g. 'design')
  detectedIssues: string[];           // IoT issues found during the conversation
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------
// Sub-schema for a single chat message (no separate _id needed)
const chatMessageSchema = new Schema<IChatMessage>(
  {
    // who sent the message: 'user', 'assistant', or 'system'
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true,
    },
    // the text content of the message
    content: {
      type: String,
      required: true,
    },
    // when the message was sent
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false } // don't create an _id for each sub-message
);

const chatHistorySchema = new Schema<IChatHistory>(
  {
    // reference to the project this session is linked to
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: false,
    },
    // user who started the session
    user: {
      type: String,
      required: false,
    },
    // unique key that groups all messages of a session together
    sessionId: {
      type: String,
      required: true,
    },
    // all messages in the conversation, in order
    messages: {
      type: [chatMessageSchema],
      default: [],
    },
    // the detected project phase from bot analysis
    detectedPhase: {
      type: String,
      default: 'ideation',
    },
    // IoT issues the bot flagged during the session
    detectedIssues: {
      type: [String],
      default: [],
    },

  },
  { timestamps: true }
);

export default mongoose.model<IChatHistory>('ChatHistory', chatHistorySchema);
