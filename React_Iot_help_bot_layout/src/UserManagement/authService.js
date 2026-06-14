import api from '../apiClient';

export const authService = {
  register: (data) => api.post("/auth/register", data),
  login: (usernameOrEmail, password) => api.post("/auth/login", { usernameOrEmail, password }),
  getMe: () => api.get("/auth/me"),
  updateProfile: (data) => api.put("/auth/profile", data)
};
