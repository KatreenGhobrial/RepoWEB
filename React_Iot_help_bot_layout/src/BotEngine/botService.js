import api from '../apiClient';

export async function chat(projectId, message, sessionId) {
  return await api.post("/bot/chat", { projectId, message, sessionId });
}

export async function analyze(projectId) {
  return await api.post("/bot/analyze", { projectId });
}

export async function detectConflicts(architecture) {
  return await api.post("/bot/detect-conflicts", architecture);
}

export async function getHistory(projectId) {
  return await api.get(`/bot/history/${projectId}`);
}

export async function getSession(sessionId) {
  return await api.get(`/bot/session/${sessionId}`);
}
