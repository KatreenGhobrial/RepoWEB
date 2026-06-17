import api from '../apiClient';

export async function create(data) {
  return await api.post("/tasks", data);
}

export async function listByProject(projectId) {
  return await api.get(`/tasks/${projectId}`);
}

export async function update(id, data) {
  return await api.put(`/tasks/${id}`, data);
}

export async function deleteTask(id) {
  return await api.delete(`/tasks/${id}`);
}
