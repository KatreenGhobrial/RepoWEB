import mongoose, { Schema, Document } from 'mongoose';

// ---------------------------------------------------------------------------
// Sub-document interfaces
// ---------------------------------------------------------------------------
export interface IComponent {
  name: string;
  type: string;        // "Hardware" | "Communication" | "Backend" | "Database" | "AI Support"
  description: string;
}

export interface IFlowStep {
  name: string;
  icon: string;
  description: string;
}

// ---------------------------------------------------------------------------
// Main interface
// ---------------------------------------------------------------------------
export interface IProject extends Document {
  name: string;
  description: string;
  owner: mongoose.Types.ObjectId;          // user who created it
  members: mongoose.Types.ObjectId[];      // team member user IDs
  // IoT Architecture
  device: string;        // e.g. "ESP32"
  protocol: string;      // e.g. "MQTT"
  database: string;      // e.g. "MongoDB"
  powerSource: string;   // e.g. "Battery"
  cloudPlatform: string; // e.g. "AWS IoT"
  sensors: string[];     // e.g. ["DHT22", "BMP280"]
  components: IComponent[];
  flow: IFlowStep[];
  // Project management
  phase: 'ideation' | 'design' | 'integration' | 'testing' | 'reflection';
  status: 'active' | 'completed' | 'archived';
  progress: Record<string, number>;  // { hardware: 80, backend: 65, ... }
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------
const componentSchema = new Schema<IComponent>(
  {
    name: { type: String, required: true },
    type: { type: String, required: true },
    description: { type: String, default: '' },
  },
  { _id: false }
);

const flowStepSchema = new Schema<IFlowStep>(
  {
    name: { type: String, required: true },
    icon: { type: String, default: '⚙️' },
    description: { type: String, default: '' },
  },
  { _id: false }
);

const projectSchema = new Schema<IProject>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    device: { type: String, default: 'ESP32' },
    protocol: { type: String, default: 'MQTT' },
    database: { type: String, default: 'MongoDB' },
    powerSource: { type: String, default: 'USB Power' },
    cloudPlatform: { type: String, default: '' },
    sensors: { type: [String], default: [] },
    components: { type: [componentSchema], default: [] },
    flow: { type: [flowStepSchema], default: [] },
    phase: {
      type: String,
      enum: ['ideation', 'design', 'integration', 'testing', 'reflection'],
      default: 'ideation',
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'archived'],
      default: 'active',
    },
    progress: {
      type: Schema.Types.Mixed,
      default: { hardware: 0, backend: 0, frontend: 0, ai: 0 },
    },
  },
  { timestamps: true }
);

export default mongoose.model<IProject>('Project', projectSchema);
