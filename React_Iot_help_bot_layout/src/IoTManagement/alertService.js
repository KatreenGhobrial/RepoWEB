import api from '../apiClient';

export async function getAlerts(projectId, filters = {}) {
  return await api.get(`/alerts/${projectId}`, { params: filters });
}


export async function simulateAlert(projectId) {
  return await api.post('/alerts/simulate', { projectId });
}

export async function resolveAlert(id) {
  return await api.put(`/alerts/${id}/resolve`);
}

