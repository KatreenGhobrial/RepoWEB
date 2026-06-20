import api from '../apiClient';

export const getUsers = () => api.get('/users');
export const updateUser = (id, data) => api.put(`/users/${id}`, data);
export const deleteUser = (id) => api.delete(`/users/${id}`);

export async function login(data) {
  return await api.post("/users/login", data);
}

export async function register(data) {
  return await api.post("/users/register", data);
}
