// API service for all project-related HTTP calls (create, update, mentor endpoints)
import api from '../apiClient';

// create a new project with the given data
export async function create(data) {
  return await api.post("/projects", data);
}

// fetch all projects the current user is part of
export async function list() {
  return await api.get("/projects");
}


// update an existing project by ID
export async function update(id, data) {
  return await api.put(`/projects/${id}`, data);
}

// Mentor Endpoints
// fetch all projects assigned to the logged-in mentor
export async function getMentorProjects() {
  return await api.get("/users/mentor/projects");
}

// update the development phase of a specific project
export async function updateProjectPhase(projectId, phase) {
  return await api.put(`/users/mentor/projects/${projectId}/phase`, { phase });
}

// fetch summary statistics for the mentor dashboard (active projects, task counts, etc.)
export async function getMentorDashboard() {
  return await api.get("/users/mentor/dashboard");
}

// post a new feedback entry from the mentor to a project
export async function giveMentorFeedback(data) {
  return await api.post("/users/mentor/feedback", data);
}

// retrieve all feedback entries for a specific project
export async function getMentorFeedback(projectId) {
  return await api.get(`/users/mentor/feedback/${projectId}`);
}

// send a broadcast message from the mentor to all students
export async function broadcastMentorMessage(message) {
  return await api.post("/users/mentor/broadcast", { message });
}

// save the detailed evaluation scores (interdisciplinary, cooperation, technical) for a project
export async function updateProjectEvaluation(projectId, evalData) {
  return await api.put(`/users/mentor/projects/${projectId}/evaluation`, evalData);
}

// submit the official graded assessment for a project
export async function submitProjectAssessment(projectId, data) {
  return await api.put(`/projects/${projectId}/assessment`, data);
}

