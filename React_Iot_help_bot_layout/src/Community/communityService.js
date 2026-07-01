import api from '../apiClient';

const BASE_URL = '/community';

export async function create(data) {
  return await api.post(BASE_URL, data);
}

export async function list(tag, search) {
  return await api.get(BASE_URL, { params: { tag, search } });
}


export async function reply(id, content) {
  return await api.post(`${BASE_URL}/${id}/reply`, { content });
}

export async function upvote(id) {
  return await api.post(`${BASE_URL}/${id}/upvote`);
}
