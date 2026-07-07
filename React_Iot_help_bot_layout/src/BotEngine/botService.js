import api from '../apiClient';

// sends a chat message to the bot for a given project and session
export async function chat(projectId, message, sessionId) {
  return await api.post("/bot/chat", { projectId, message, sessionId });
}

// asks the bot to analyze a project's architecture and return insights
export async function analyze(projectId) {
  return await api.post("/bot/analyze", { projectId });
}

// sends the project's architecture to detect potential configuration conflicts
export async function detectConflicts(architecture) {
  return await api.post("/bot/detect-conflicts", architecture);
}

// retrieves the full chat history for a given project
export async function getHistory(projectId) {
  return await api.get(`/bot/history/${projectId}`);
}

// retrieves a specific chat session by its session ID
export async function getSession(sessionId) {
  return await api.get(`/bot/session/${sessionId}`);
}
