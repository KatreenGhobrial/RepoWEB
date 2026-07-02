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

export async function updateProjectEvaluation(projectId, evalData) {
  return await api.put(`/mentor/projects/${projectId}/evaluation`, evalData);
}

// Library Endpoints
export async function getAll() {
  return await api.get("/library");
}

export async function submitProjectAssessment(projectId, data) {
  return await api.put(`/projects/${projectId}/assessment`, data);
}

export async function getBrokers() {
  return await api.get('/mqtt/brokers');
}

export async function addBroker(broker) {
  return await api.post('/mqtt/brokers', broker);
}

export async function deleteBroker(id) {
  return await api.delete(`/mqtt/brokers/${id}`);
}

export async function deleteAllBrokers() {
  return await api.delete('/mqtt/brokers');
}

export async function getHealth() {
  return await api.get('/health');
}
