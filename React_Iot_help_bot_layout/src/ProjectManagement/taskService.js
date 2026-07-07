// API service for task CRUD operations (create, read, update, delete)
import api from '../apiClient';

// create a new task with the given data (project ID, title, status, etc.)
export async function create(data) {
  return await api.post("/tasks", data);
}

// fetch all tasks that belong to a specific project
export async function listByProject(projectId) {
  return await api.get(`/tasks/${projectId}`);
}

// update an existing task by ID (status, title, assignee, etc.)
export async function update(id, data) {
  return await api.put(`/tasks/${id}`, data);
}

// permanently delete a task by ID
export async function deleteTask(id) {
  return await api.delete(`/tasks/${id}`);
}
