import express from 'express';
// Removed MqttConfig import
import { connectToDynamicBroker, disconnectFromDynamicBroker, disconnectAllBrokers, getActiveCustomBrokers } from '../services/mqttService';

const router = express.Router();

// GET all active MQTT configurations
router.get('/brokers', async (req, res) => {
  try {
    const brokers = getActiveCustomBrokers();
    res.json(brokers);
  } catch (error) {
    console.error('Error fetching brokers:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST a new MQTT configuration (transient)
router.post('/brokers', async (req, res) => {
  try {
    const { url, port, username, password, topic, name } = req.body;

    if (!url || !name) {
      return res.status(400).json({ message: 'URL and Name are required.' });
    }

    const newBroker = {
      _id: Date.now().toString(),
      url,
      port,
      username,
      password,
      topic: topic || '#',
      name
    };

    // Trigger the mqttService to dynamically connect to this new broker in-memory
    connectToDynamicBroker(newBroker);

    res.status(201).json(newBroker);
  } catch (error) {
    console.error('Error adding broker:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE a broker configuration (transient)
router.delete('/brokers/:id', async (req, res) => {
  try {
    disconnectFromDynamicBroker(req.params.id);
    res.json({ message: 'Broker deleted' });
  } catch (error) {
    console.error('Error deleting broker:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE all brokers (transient)
router.delete('/brokers', async (req, res) => {
  try {
    disconnectAllBrokers();
    res.json({ message: 'All brokers deleted' });
  } catch (error) {
    console.error('Error deleting all brokers:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

