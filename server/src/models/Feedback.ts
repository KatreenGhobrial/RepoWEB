import mongoose, { Schema, Document } from 'mongoose';

// Represents written feedback from a mentor on a student project
export interface IFeedback extends Document {
  project: mongoose.Types.ObjectId;  // which project this feedback is for
  mentor: mongoose.Types.ObjectId;   // who gave the feedback (mentor user)
  content: string;                   // the feedback text
  createdAt: Date;
}

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------
const feedbackSchema = new Schema<IFeedback>(
  {
    // the project being reviewed
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    // the mentor who wrote the feedback (optional — can be anonymous)
    mentor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    // the actual feedback text
    content: {
      type: String,
      required: true,
    },

  },
  { timestamps: true }
);

export default mongoose.model<IFeedback>('Feedback', feedbackSchema);
