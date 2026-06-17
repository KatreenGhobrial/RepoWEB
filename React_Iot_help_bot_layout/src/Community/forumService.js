import api from '../apiClient';

export async function create(data) {
  return await api.post("/forum", data);
}

export async function list(tag, search) {
  return await api.get("/forum", { params: { tag, search } });
}

export async function get(id) {
  return await api.get(`/forum/${id}`);
}

export async function reply(id, content) {
  return await api.post(`/forum/${id}/reply`, { content });
}

export async function upvote(id) {
  return await api.post(`/forum/${id}/upvote`);
}
