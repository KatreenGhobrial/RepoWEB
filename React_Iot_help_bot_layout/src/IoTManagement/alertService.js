import api from '../apiClient';

// API service for IoT alert operations

// fetch all alerts for a project, with optional filters (e.g., status, level)
export async function getAlerts(projectId, filters = {}) {
  return await api.get(`/alerts/${projectId}`, { params: filters });
}


// trigger a simulated alert for testing purposes on a given project
export async function simulateAlert(projectId) {
  return await api.post('/alerts/simulate', { projectId });
}

// mark a specific alert as resolved by its ID
export async function resolveAlert(id) {
  return await api.put(`/alerts/${id}/resolve`);
}
