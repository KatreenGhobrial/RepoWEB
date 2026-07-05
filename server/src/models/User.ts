import mongoose, { Schema, Document } from 'mongoose';

// ---------------------------------------------------------------------------
// Interface
// ---------------------------------------------------------------------------
export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  role: 'student' | 'mentor' | 'admin';
  expertise: string[];          // e.g. ["hardware", "firmware", "backend"]
  discipline: string;           // e.g. "Electrical Engineering"
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------
const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ['student', 'mentor', 'admin'],
      default: 'student',
    },
    expertise: {
      type: [String],
      default: [],
    },
    discipline: {
      type: String,
      default: '',
    },

  },
  { timestamps: true }
);

export default mongoose.model<IUser>('User', userSchema);
