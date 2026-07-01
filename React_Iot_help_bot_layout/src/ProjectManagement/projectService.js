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

