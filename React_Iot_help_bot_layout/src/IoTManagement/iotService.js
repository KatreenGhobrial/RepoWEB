import api from '../apiClient';

// Library Endpoints
export async function getAll() {
  return await api.get("/library");
}

export async function getBrokers() {
  return await api.get('/mqtt/brokers');
}

export async function addBroker(broker) {
  return await api.post('/mqtt/brokers', broker);
}

export async function deleteBroker(id) {
  return await api.delete(`/mqtt/brokers/${id}`);
}

export async function deleteAllBrokers() {
  return await api.delete('/mqtt/brokers');
}

export async function getHealth() {
  return await api.get('/health');
}
