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

// Scores and notes given by a mentor for a specific dimension
export interface IEvaluation {
  interdisciplinaryScore: number;    // how well the team combined different disciplines
  interdisciplinaryNotes: string;
  cooperationScore: number;          // teamwork and collaboration rating
  cooperationNotes: string;
  technicalScore: number;            // technical implementation quality rating
  technicalNotes: string;
  summaryNotes: string;              // overall written comments from the mentor
  gradedBy: mongoose.Types.ObjectId | null;  // which mentor graded it
  gradedAt: Date | null;
}

// ---------------------------------------------------------------------------
// Main interface
// ---------------------------------------------------------------------------
// Represents a full IoT student project
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
  assessment?: {
    interdisciplinary: number | null;
    collaboration: number | null;
    technical: number | null;
    comments: string;
    assessedAt: Date | null;
    assessor: mongoose.Types.ObjectId | null;
  };
  evaluation?: IEvaluation;  // detailed mentor grading
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------
// Sub-schema: one architectural component (e.g. ESP32 as hardware)
const componentSchema = new Schema<IComponent>(
  {
    name: { type: String, required: true },
    type: { type: String, required: true },
    description: { type: String, default: '' },
  },
  { _id: false }
);

// Sub-schema: one step in the system data-flow diagram
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
    // project display name
    name: {
      type: String,
      required: true,
      trim: true,
    },
    // project description / goal
    description: {
      type: String,
      default: '',
    },
    // user who created the project
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    // all team members (including owner)
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    // IoT hardware device (microcontroller)
    device: { type: String, default: 'ESP32' },
    // communication protocol used
    protocol: { type: String, default: 'MQTT' },
    // backend database
    database: { type: String, default: 'MongoDB' },
    // how the device is powered
    powerSource: { type: String, default: 'USB Power' },
    // cloud platform for data (optional)
    cloudPlatform: { type: String, default: '' },
    // list of connected sensors
    sensors: { type: [String], default: [] },
    // system components (hardware, backend, etc.)
    components: { type: [componentSchema], default: [] },
    // data-flow steps from sensor to cloud
    flow: { type: [flowStepSchema], default: [] },
    // current development phase
    phase: {
      type: String,
      enum: ['ideation', 'design', 'integration', 'testing', 'reflection'],
      default: 'ideation',
    },
    // overall project status
    status: {
      type: String,
      enum: ['active', 'completed', 'archived'],
      default: 'active',
    },
    // discipline-specific progress percentages
    progress: {
      type: Schema.Types.Mixed,
      default: { hardware: 0, backend: 0, frontend: 0, ai: 0 },
    },
    // student self-assessment scores
    assessment: {
      interdisciplinary: { type: Number, min: 0, max: 100, default: null },
      collaboration: { type: Number, min: 0, max: 100, default: null },
      technical: { type: Number, min: 0, max: 100, default: null },
      comments: { type: String, default: '' },
      assessedAt: { type: Date, default: null },
      assessor: { type: Schema.Types.ObjectId, ref: 'User', default: null }
    },
    // mentor evaluation with per-dimension scores and notes
    evaluation: {
      interdisciplinaryScore: { type: Number, default: 0 },
      interdisciplinaryNotes: { type: String, default: '' },
      cooperationScore: { type: Number, default: 0 },
      cooperationNotes: { type: String, default: '' },
      technicalScore: { type: Number, default: 0 },
      technicalNotes: { type: String, default: '' },
      summaryNotes: { type: String, default: '' },
      gradedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
      gradedAt: { type: Date, default: null }
    },
  },
  { timestamps: true }
);

export default mongoose.model<IProject>('Project', projectSchema);
