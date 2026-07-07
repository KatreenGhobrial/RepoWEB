import mongoose, { Schema, Document } from 'mongoose';

// Represents a single reply (or nested reply) on a community post
export interface IReply {
  _id: mongoose.Types.ObjectId;
  author: mongoose.Types.ObjectId;  // user who wrote the reply
  content: string;
  createdAt: Date;
  ratings: {
    user: mongoose.Types.ObjectId;  // who rated
    value: number;                  // raw vote value (1)
    score: number;                  // weighted score (e.g. mentor = +3, student = +1)
  }[];
  score: number;          // total accumulated rating score
  replies: IReply[];      // nested replies (threaded comments)
}

// Represents a top-level forum post
export interface ICommunityPost extends Document {
  author: mongoose.Types.ObjectId;
  title: string;
  content: string;
  tags: string[];                           // discipline / topic tags (e.g. "hardware", "mqtt")
  upvotes: mongoose.Types.ObjectId[];       // list of users who upvoted
  score: number;                            // total reply score (used for sorting)
  replies: IReply[];
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------
// Self-referencing schema for threaded replies
const replySchema = new Schema();
replySchema.add({
  // user who wrote the reply
  author: { type: Schema.Types.ObjectId, ref: 'User', required: false },
  // the reply text
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  // list of ratings given by other users
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
  // aggregated rating score for this reply
  score: { type: Number, default: 0 },
  // nested replies (recursive structure)
  replies: { type: [replySchema], default: [] }
});

const communityPostSchema = new Schema<ICommunityPost>(
  {
    // user who created the post
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    // post headline
    title: {
      type: String,
      required: true,
      trim: true,
    },
    // full post body
    content: {
      type: String,
      required: true,
    },
    // topic/discipline tags for filtering
    tags: {
      type: [String],
      default: [],
    },
    // users who clicked the upvote button
    upvotes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    // cumulative score from all replies
    score: {
      type: Number,
      default: 0,
    },
    // all top-level replies on this post
    replies: {
      type: [replySchema],
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.model<ICommunityPost>('CommunityPost', communityPostSchema);
