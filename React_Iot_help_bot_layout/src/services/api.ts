// ═══════════════════════════════════════════════════════════════════════════
// Centralised API service — all HTTP calls go through here.
// ═══════════════════════════════════════════════════════════════════════════
import type {
  AuthResponse,
  Project,
  Task,
  BotChatResponse,
  Conflict,
  Feedback,
  ForumPost,
  IoTLibrary,
  MentorDashboardData,
  ChatSession,
  User,
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function getToken(): string | null {
  return localStorage.getItem('token');
}

async function request<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Network error' }));
    throw new Error(err.message || `HTTP ${res.status}`);
  }

  return res.json();
}

// ═══════════════════════════════════════════════════════════════════════════
// AUTH
// ═══════════════════════════════════════════════════════════════════════════
export const authAPI = {
  register: (data: {
    username: string;
    email: string;
    password: string;
    role?: string;
    expertise?: string[];
    discipline?: string;
  }) => request<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  login: (usernameOrEmail: string, password: string) =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ usernameOrEmail, password }),
    }),

  getMe: () => request<User>('/auth/me'),

  updateProfile: (data: Partial<User>) =>
    request<User>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

// ═══════════════════════════════════════════════════════════════════════════
// PROJECTS
// ═══════════════════════════════════════════════════════════════════════════
export const projectAPI = {
  create: (data: Partial<Project>) =>
    request<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  list: () => request<Project[]>('/projects'),

  get: (id: string) => request<Project>(`/projects/${id}`),

  update: (id: string, data: Partial<Project>) =>
    request<Project>(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request<{ message: string }>(`/projects/${id}`, { method: 'DELETE' }),

  addMember: (projectId: string, userId: string) =>
    request<Project>(`/projects/${projectId}/members`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    }),
};

// ═══════════════════════════════════════════════════════════════════════════
// TASKS
// ═══════════════════════════════════════════════════════════════════════════
export const taskAPI = {
  create: (data: Partial<Task>) =>
    request<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  listByProject: (projectId: string) =>
    request<Task[]>(`/tasks/${projectId}`),

  update: (id: string, data: Partial<Task>) =>
    request<Task>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request<{ message: string }>(`/tasks/${id}`, { method: 'DELETE' }),
};

// ═══════════════════════════════════════════════════════════════════════════
// BOT (Socratic)
// ═══════════════════════════════════════════════════════════════════════════
export const botAPI = {
  chat: (projectId: string, message: string, sessionId?: string) =>
    request<BotChatResponse>('/bot/chat', {
      method: 'POST',
      body: JSON.stringify({ projectId, message, sessionId }),
    }),

  analyze: (projectId: string) =>
    request<{ analysis: string }>('/bot/analyze', {
      method: 'POST',
      body: JSON.stringify({ projectId }),
    }),

  detectConflicts: (architecture: {
    device: string;
    protocol: string;
    database: string;
    powerSource: string;
    sensors: string[];
    cloudPlatform: string;
  }) =>
    request<{ conflicts: Conflict[] }>('/bot/detect-conflicts', {
      method: 'POST',
      body: JSON.stringify(architecture),
    }),

  getHistory: (projectId: string) =>
    request<ChatSession[]>(`/bot/history/${projectId}`),

  getSession: (sessionId: string) =>
    request<ChatSession>(`/bot/session/${sessionId}`),
};

// ═══════════════════════════════════════════════════════════════════════════
// MENTOR
// ═══════════════════════════════════════════════════════════════════════════
export const mentorAPI = {
  getProjects: () => request<Project[]>('/mentor/projects'),

  getDashboard: () => request<MentorDashboardData>('/mentor/dashboard'),

  giveFeedback: (data: {
    projectId: string;
    content: string;
    category?: string;
    rating?: number;
  }) =>
    request<Feedback>('/mentor/feedback', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getFeedback: (projectId: string) =>
    request<Feedback[]>(`/mentor/feedback/${projectId}`),

  broadcast: (message: string) =>
    request<{ message: string; sentTo: Array<{ projectId: string; projectName: string }> }>(
      '/mentor/broadcast',
      { method: 'POST', body: JSON.stringify({ message }) }
    ),
};

// ═══════════════════════════════════════════════════════════════════════════
// LIBRARY
// ═══════════════════════════════════════════════════════════════════════════
export const libraryAPI = {
  getAll: () => request<IoTLibrary>('/library'),
  getProtocols: () => request<IoTLibrary['protocols']>('/library/protocols'),
  getHardware: () => request<IoTLibrary['hardware']>('/library/hardware'),
  getCloud: () => request<IoTLibrary['cloudPlatforms']>('/library/cloud'),
  getSensors: () => request<IoTLibrary['sensors']>('/library/sensors'),
  search: (q: string) => request<Record<string, unknown>[]>(`/library/search?q=${encodeURIComponent(q)}`),
};

// ═══════════════════════════════════════════════════════════════════════════
// FORUM
// ═══════════════════════════════════════════════════════════════════════════
export const forumAPI = {
  create: (data: { title: string; content: string; tags: string[] }) =>
    request<ForumPost>('/forum', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  list: (tag?: string, search?: string) => {
    const params = new URLSearchParams();
    if (tag) params.set('tag', tag);
    if (search) params.set('search', search);
    const qs = params.toString();
    return request<ForumPost[]>(`/forum${qs ? `?${qs}` : ''}`);
  },

  get: (id: string) => request<ForumPost>(`/forum/${id}`),

  reply: (id: string, content: string) =>
    request<ForumPost>(`/forum/${id}/reply`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),

  upvote: (id: string) =>
    request<{ upvotes: number; upvoted: boolean }>(`/forum/${id}/upvote`, {
      method: 'POST',
    }),
};
