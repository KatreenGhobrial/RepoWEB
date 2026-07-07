import api from '../apiClient';

// Thin service layer that wraps all user-related API calls in one place

// fetch the full list of users (admin only)
export const getUsers = () => api.get('/users');
// update a user's details by ID
export const updateUser = (id, data) => api.put(`/users/${id}`, data);
// delete a user account by ID
export const deleteUser = (id) => api.delete(`/users/${id}`);

// authenticate an existing user and return the user object with token
export async function login(data) {
  return await api.post("/users/login", data);
}

// create a new user account and return the created user object
export async function register(data) {
  return await api.post("/users/register", data);
}
