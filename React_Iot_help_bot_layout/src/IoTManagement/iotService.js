import api from '../apiClient';

export const mentorService = {
  getProjects: () => api.get("/mentor/projects"),
  getDashboard: () => api.get("/mentor/dashboard"),
  giveFeedback: (data) => api.post("/mentor/feedback", data),
  getFeedback: (projectId) => api.get(`/mentor/feedback/${projectId}`),
  broadcast: (message) => api.post("/mentor/broadcast", { message })
};

export const libraryService = {
  getAll: () => api.get("/library"),
  getProtocols: () => api.get("/library/protocols"),
  getHardware: () => api.get("/library/hardware"),
  getCloud: () => api.get("/library/cloud"),
  getSensors: () => api.get("/library/sensors"),
  search: (q) => api.get(`/library/search`, { params: { q } })
};
