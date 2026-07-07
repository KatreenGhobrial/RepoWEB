import api from '../apiClient';

// API service for IoT management — library, MQTT brokers, health, and conflict detection

// Library Endpoints
// fetch the full IoT solution library (hardware, protocols, cloud, software)
export async function getAll() {
  return await api.get("/library");
}

// fetch all saved custom MQTT broker configs
export async function getBrokers() {
  return await api.get('/mqtt/brokers');
}

// add and connect a new custom MQTT broker
export async function addBroker(broker) {
  return await api.post('/mqtt/brokers', broker);
}

// disconnect and remove a specific broker by its ID
export async function deleteBroker(id) {
  return await api.delete(`/mqtt/brokers/${id}`);
}

// disconnect and remove all saved brokers at once
export async function deleteAllBrokers() {
  return await api.delete('/mqtt/brokers');
}

// check the backend server health status
export async function getHealth() {
  return await api.get('/health');
}

// send an IoT architecture configuration to the AI for conflict analysis
export async function detectConflicts(payload) {
  return await api.post('/bot/detect-conflicts', payload);
}
