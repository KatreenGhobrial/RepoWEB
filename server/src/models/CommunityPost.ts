import mongoose, { Schema, Document } from 'mongoose';

// ---------------------------------------------------------------------------
// Interface
// ---------------------------------------------------------------------------
export interface ICommunityPost extends Document {
  author: mongoose.Types.ObjectId;
  title: string;
  content: string;
  tags: string[];                // discipline / topic tags
  upvotes: mongoose.Types.ObjectId[];
  replies: {
    author: mongoose.Types.ObjectId;
    content: string;
    createdAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------
const replySchema = new Schema(
  {
    author: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const communityPostSchema = new Schema<ICommunityPost>(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    upvotes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    replies: {
      type: [replySchema],
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.model<ICommunityPost>('CommunityPost', communityPostSchema);
