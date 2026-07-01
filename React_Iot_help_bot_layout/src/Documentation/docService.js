import api from '../apiClient';

export async function getDocs(projectId, type) {
  const params = {};
  if (type) params.type = type;
  return await api.get(`/docs/project/${projectId}`, { params });
}


export async function createDoc(data) {
  return await api.post('/docs', data);
}

export async function updateDoc(id, data) {
  return await api.put(`/docs/${id}`, data);
}

export async function deleteDoc(id) {
  return await api.delete(`/docs/${id}`);
}
