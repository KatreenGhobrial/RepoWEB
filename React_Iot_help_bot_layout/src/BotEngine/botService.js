import api from '../apiClient';

export const botService = {
  chat: (projectId, message, sessionId) => api.post("/bot/chat", { projectId, message, sessionId }),
  analyze: (projectId) => api.post("/bot/analyze", { projectId }),
  detectConflicts: (architecture) => api.post("/bot/detect-conflicts", architecture),
  getHistory: (projectId) => api.get(`/bot/history/${projectId}`),
  getSession: (sessionId) => api.get(`/bot/session/${sessionId}`)
};
