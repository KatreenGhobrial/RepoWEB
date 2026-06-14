import api from '../apiClient';

export const forumService = {
  create: (data) => api.post("/forum", data),
  list: (tag, search) => api.get("/forum", { params: { tag, search } }),
  get: (id) => api.get(`/forum/${id}`),
  reply: (id, content) => api.post(`/forum/${id}/reply`, { content }),
  upvote: (id) => api.post(`/forum/${id}/upvote`)
};
