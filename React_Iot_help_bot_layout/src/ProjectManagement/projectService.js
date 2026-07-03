import api from '../apiClient';

export async function create(data) {
  return await api.post("/projects", data);
}

export async function list() {
  return await api.get("/projects");
}


export async function update(id, data) {
  return await api.put(`/projects/${id}`, data);
}

// Mentor Endpoints
export async function getMentorProjects() {
  return await api.get("/users/mentor/projects");
}

export async function updateProjectPhase(projectId, phase) {
  return await api.put(`/users/mentor/projects/${projectId}/phase`, { phase });
}

export async function getMentorDashboard() {
  return await api.get("/users/mentor/dashboard");
}

export async function giveMentorFeedback(data) {
  return await api.post("/users/mentor/feedback", data);
}

export async function getMentorFeedback(projectId) {
  return await api.get(`/users/mentor/feedback/${projectId}`);
}

export async function broadcastMentorMessage(message) {
  return await api.post("/users/mentor/broadcast", { message });
}

export async function updateProjectEvaluation(projectId, evalData) {
  return await api.put(`/users/mentor/projects/${projectId}/evaluation`, evalData);
}

export async function submitProjectAssessment(projectId, data) {
  return await api.put(`/projects/${projectId}/assessment`, data);
}

