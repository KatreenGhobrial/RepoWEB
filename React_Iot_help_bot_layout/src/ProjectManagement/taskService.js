import api from '../apiClient';

export const taskService = {
  create: (data) => api.post("/tasks", data),
  listByProject: (projectId) => api.get(`/tasks/${projectId}`),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  delete: (id) => api.delete(`/tasks/${id}`)
};
