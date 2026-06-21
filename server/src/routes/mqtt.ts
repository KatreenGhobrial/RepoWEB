import express from 'express';
import MqttConfig from '../models/MqttConfig';
import { connectToDynamicBroker } from '../services/mqttService';

const router = express.Router();

// GET all active MQTT configurations
router.get('/brokers', async (req, res) => {
  try {
    const brokers = await MqttConfig.find().sort({ createdAt: -1 });
    res.json(brokers);
  } catch (error) {
    console.error('Error fetching brokers:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST a new MQTT configuration
router.post('/brokers', async (req, res) => {
  try {
    const { url, username, password, topic, name } = req.body;

    if (!url || !name) {
      return res.status(400).json({ message: 'URL and Name are required.' });
    }

    const newBroker = new MqttConfig({
      url,
      username,
      password,
      topic: topic || '#',
      name
    });

    await newBroker.save();

    // Trigger the mqttService to dynamically connect to this new broker
    connectToDynamicBroker(newBroker);

    res.status(201).json(newBroker);
  } catch (error) {
    console.error('Error adding broker:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE a broker configuration
router.delete('/brokers/:id', async (req, res) => {
  try {
    const broker = await MqttConfig.findByIdAndDelete(req.params.id);
    if (!broker) return res.status(404).json({ message: 'Broker not found' });
    
    // Note: Disconnecting at runtime requires keeping track of active clients in mqttService.
    // For simplicity, we just delete it from DB and the UI can handle the rest. Next restart will ignore it.
    res.json({ message: 'Broker deleted' });
  } catch (error) {
    console.error('Error deleting broker:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
