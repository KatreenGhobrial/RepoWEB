// ═══════════════════════════════════════════════════════════════════════════
// Shared TypeScript types for the BridgeBot IoT frontend
// ═══════════════════════════════════════════════════════════════════════════

// ---------------------------------------------------------------------------
// User
// ---------------------------------------------------------------------------
export interface User {
  id: string;
  username: string;
  email: string;
  role: 'student' | 'mentor' | 'admin';
  expertise: string[];
  discipline: string;
  avatar: string;
  bio: string;
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// ---------------------------------------------------------------------------
// Project
// ---------------------------------------------------------------------------
export interface Component {
  name: string;
  type: string;
  description: string;
}

export interface FlowStep {
  name: string;
  icon: string;
  description: string;
}

export interface Project {
  _id: string;
  name: string;
  description: string;
  owner: User | string;
  members: User[] | string[];
  device: string;
  protocol: string;
  database: string;
  powerSource: string;
  cloudPlatform: string;
  sensors: string[];
  components: Component[];
  flow: FlowStep[];
  phase: 'ideation' | 'design' | 'integration' | 'testing' | 'reflection';
  status: 'active' | 'completed' | 'archived';
  progress: Record<string, number>;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Task
// ---------------------------------------------------------------------------
export interface Task {
  _id: string;
  project: string;
  title: string;
  description: string;
  owner: User | string;
  assignedTo: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  discipline: string;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Chat / Bot
// ---------------------------------------------------------------------------
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export interface ChatSession {
  _id: string;
  project: string;
  user: string;
  sessionId: string;
  messages: ChatMessage[];
  detectedPhase: string;
  detectedIssues: string[];
  reflectionScore: number;
  createdAt: string;
  updatedAt: string;
}

export interface BotChatResponse {
  reply: string;
  sessionId: string;
  phase: string;
  messageCount: number;
}

// ---------------------------------------------------------------------------
// Conflict
// ---------------------------------------------------------------------------
export interface Conflict {
  title: string;
  level: 'HIGH' | 'MEDIUM' | 'LOW';
  reason: string;
  suggestion: string;
}

// ---------------------------------------------------------------------------
// Feedback
// ---------------------------------------------------------------------------
export interface Feedback {
  _id: string;
  project: string;
  mentor: User | string;
  content: string;
  category: 'general' | 'architecture' | 'collaboration' | 'technical' | 'milestone';
  rating: number;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Forum
// ---------------------------------------------------------------------------
export interface ForumReply {
  _id: string;
  author: User;
  content: string;
  createdAt: string;
}

export interface ForumPost {
  _id: string;
  author: User;
  title: string;
  content: string;
  tags: string[];
  upvotes: string[];
  replies: ForumReply[];
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// IoT Library
// ---------------------------------------------------------------------------
export interface IoTProtocol {
  name: string;
  type: string;
  category: string;
  description: string;
  pros: string[];
  cons: string[];
  bestFor: string;
  powerUsage: string;
}

export interface IoTHardware {
  name: string;
  type: string;
  description: string;
  specs: Record<string, string | number | boolean>;
  pros: string[];
  cons: string[];
  bestFor: string;
}

export interface IoTCloudPlatform {
  name: string;
  type: string;
  description: string;
  features: string[];
  pricing: string;
}

export interface IoTSensor {
  name: string;
  type: string;
  range: string;
  accuracy: string;
  interface: string;
}

export interface IoTLibrary {
  protocols: IoTProtocol[];
  hardware: IoTHardware[];
  cloudPlatforms: IoTCloudPlatform[];
  sensors: IoTSensor[];
}

// ---------------------------------------------------------------------------
// Mentor Dashboard
// ---------------------------------------------------------------------------
export interface MentorDashboardData {
  totalProjects: number;
  activeProjects: number;
  totalTasks: number;
  completedTasks: number;
  totalSessions: number;
  totalStudents: number;
  phaseDistribution: Record<string, number>;
  disciplineCount: Record<string, number>;
  avgReflection: number;
}
