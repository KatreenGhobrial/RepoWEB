import api from '../apiClient';

export const projectService = {
  create: (data) => api.post("/projects", data),
  list: () => api.get("/projects"),
  get: (id) => api.get(`/projects/${id}`),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
  addMember: (projectId, userId) => api.post(`/projects/${projectId}/members`, { userId })
};
