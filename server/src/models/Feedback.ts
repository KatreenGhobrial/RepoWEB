import mongoose, { Schema, Document } from 'mongoose';

// ---------------------------------------------------------------------------
// Interface
// ---------------------------------------------------------------------------
export interface IFeedback extends Document {
  project: mongoose.Types.ObjectId;
  mentor: mongoose.Types.ObjectId;
  content: string;

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
      required: false,
    },
    content: {
      type: String,
      required: true,
    },

  },
  { timestamps: true }
);

export default mongoose.model<IFeedback>('Feedback', feedbackSchema);
