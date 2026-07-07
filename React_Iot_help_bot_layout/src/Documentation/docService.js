import api from '../apiClient';

// API service for technical documentation CRUD operations

// fetch all docs for a given project, optionally filtered by type
export async function getDocs(projectId, type) {
  const params = {};
  if (type) params.type = type;
  return await api.get(`/docs/project/${projectId}`, { params });
}


// create a new document with the given data
export async function createDoc(data) {
  return await api.post('/docs', data);
}

// update an existing document by its ID
export async function updateDoc(id, data) {
  return await api.put(`/docs/${id}`, data);
}

// delete a document by its ID
export async function deleteDoc(id) {
  return await api.delete(`/docs/${id}`);
}
