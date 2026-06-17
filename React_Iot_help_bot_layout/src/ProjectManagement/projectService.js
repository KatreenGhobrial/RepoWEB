import api from '../apiClient';

export async function create(data) {
  return await api.post("/projects", data);
}

export async function list() {
  return await api.get("/projects");
}

export async function get(id) {
  return await api.get(`/projects/${id}`);
}

export async function update(id, data) {
  return await api.put(`/projects/${id}`, data);
}

export async function deleteProject(id) {
  return await api.delete(`/projects/${id}`);
}

export async function addMember(projectId, userId) {
  return await api.post(`/projects/${projectId}/members`, { userId });
}
