import mongoose, { Schema, Document } from 'mongoose';

// ---------------------------------------------------------------------------
// Interface
// ---------------------------------------------------------------------------
export interface IFeedback extends Document {
  project: mongoose.Types.ObjectId;
  mentor: mongoose.Types.ObjectId;
  content: string;
  category: 'general' | 'architecture' | 'collaboration' | 'technical' | 'milestone';
  rating: number;                // 1-5
  createdAt: Date;
}

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------
const feedbackSchema = new Schema<IFeedback>(
  {
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    mentor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['general', 'architecture', 'collaboration', 'technical', 'milestone'],
      default: 'general',
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 3,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IFeedback>('Feedback', feedbackSchema);
