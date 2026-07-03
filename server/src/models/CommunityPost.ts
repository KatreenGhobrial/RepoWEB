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
    _id: mongoose.Types.ObjectId;
    author: mongoose.Types.ObjectId;
    content: string;
    createdAt: Date;
    replies: {
      _id: mongoose.Types.ObjectId;
      author: mongoose.Types.ObjectId;
      content: string;
      createdAt: Date;
    }[];
    ratings: {
      user: mongoose.Types.ObjectId;
      value: number; // 1 (upvote) or -1 (downvote)
      score: number; // weighted value (e.g. +3 or +1)
    }[];
    score: number;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------
const nestedReplySchema = new Schema(
  {
    author: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const replySchema = new Schema(
  {
    author: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    replies: { type: [nestedReplySchema], default: [] },
    ratings: {
      type: [
        {
          user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
          value: { type: Number, required: true },
          score: { type: Number, required: true }
        }
      ],
      default: []
    },
    score: { type: Number, default: 0 }
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
