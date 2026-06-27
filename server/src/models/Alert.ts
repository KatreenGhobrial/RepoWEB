import mongoose, { Schema, Document } from 'mongoose';

// ---------------------------------------------------------------------------
// Interface
// ---------------------------------------------------------------------------
export interface IAlert extends Document {
  projectId: string;
  type: 'packet_loss' | 'high_latency' | 'battery_drain' | 'sensor_failure';
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  message: string;
  deviceId?: string;
  resolved: boolean;
  resolvedAt?: Date;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------
const alertSchema = new Schema<IAlert>(
  {
    projectId: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['packet_loss', 'high_latency', 'battery_drain', 'sensor_failure'],
      required: true,
    },
    severity: {
      type: String,
      enum: ['HIGH', 'MEDIUM', 'LOW'],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },
    deviceId: {
      type: String,
      default: undefined,
    },
    resolved: {
      type: Boolean,
      default: false,
    },
    resolvedAt: {
      type: Date,
      default: undefined,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: undefined,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IAlert>('Alert', alertSchema);
