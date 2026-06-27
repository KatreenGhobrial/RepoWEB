import api from '../apiClient';

// Mentor Endpoints
export async function getProjects() {
  return await api.get("/mentor/projects");
}

export async function updateProjectPhase(projectId, phase) {
  return await api.put(`/mentor/projects/${projectId}/phase`, { phase });
}

export async function getDashboard() {
  return await api.get("/mentor/dashboard");
}

export async function getTasks(projectId) {
  return await api.get(`/tasks/${projectId}`);
}

export async function giveFeedback(data) {
  return await api.post("/mentor/feedback", data);
}

export async function getFeedback(projectId) {
  return await api.get(`/mentor/feedback/${projectId}`);
}

export async function broadcast(message) {
  return await api.post("/mentor/broadcast", { message });
}

// Library Endpoints
export async function getAll() {
  return await api.get("/library");
}

export async function getProtocols() {
  return await api.get("/library/protocols");
}

export async function getHardware() {
  return await api.get("/library/hardware");
}

export async function getCloud() {
  return await api.get("/library/cloud");
}

export async function getSensors() {
  return await api.get("/library/sensors");
}

export async function search(q) {
  return await api.get(`/library/search`, { params: { q } });
}

export async function submitProjectAssessment(projectId, data) {
  return await api.put(`/projects/${projectId}/assessment`, data);
}
