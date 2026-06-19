import api from '../apiClient';

export async function login(data) {
  return await api.post("/users/login", data);
}

export async function register(data) {
  return await api.post("/users/register", data);
}
