import mongoose, { Schema, Document } from 'mongoose';

// Represents an IoT system alert (e.g. sensor failure, high latency)
export interface IAlert extends Document {
  projectId: string;
  type: 'packet_loss' | 'high_latency' | 'battery_drain' | 'sensor_failure';
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  message: string;
  deviceId?: string;    // optional — which device triggered the alert
  resolved: boolean;
  resolvedAt?: Date;
  metadata?: any;       // extra data (e.g. raw readings that caused the alert)
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------
const alertSchema = new Schema<IAlert>(
  {
    // which project this alert belongs to
    projectId: {
      type: String,
      required: true,
    },
    // the category of alert
    type: {
      type: String,
      enum: ['packet_loss', 'high_latency', 'battery_drain', 'sensor_failure'],
      required: true,
    },
    // how urgent the alert is
    severity: {
      type: String,
      enum: ['HIGH', 'MEDIUM', 'LOW'],
      required: true,
    },
    // short display title shown in the UI
    title: {
      type: String,
      required: true,
      trim: true,
    },
    // detailed description of the alert
    message: {
      type: String,
      required: true,
    },
    // optional — the device that triggered the alert
    deviceId: {
      type: String,
      default: undefined,
    },
    // false until a user manually marks it resolved
    resolved: {
      type: Boolean,
      default: false,
    },
    // timestamp when the alert was resolved
    resolvedAt: {
      type: Date,
      default: undefined,
    },
    // any additional raw data attached to this alert
    metadata: {
      type: Schema.Types.Mixed,
      default: undefined,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IAlert>('Alert', alertSchema);
