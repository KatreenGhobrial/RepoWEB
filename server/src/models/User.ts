import mongoose, { Schema, Document } from 'mongoose';

// Represents a registered user of the platform
export interface IUser extends Document {
  username: string;
  email: string;
  password: string;             // stored as a bcrypt hash (never plain text)
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
    // unique display name (min 3 characters)
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
    },
    // unique email used for login
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    // bcrypt-hashed password (min 6 characters raw)
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    // determines what the user can see and do in the app
    role: {
      type: String,
      enum: ['student', 'mentor', 'admin'],
      default: 'student',
    },
    // areas of technical knowledge (used for team matching)
    expertise: {
      type: [String],
      default: [],
    },
    // engineering discipline (e.g. "Computer Science")
    discipline: {
      type: String,
      default: '',
    },

  },
  { timestamps: true }
);

export default mongoose.model<IUser>('User', userSchema);
