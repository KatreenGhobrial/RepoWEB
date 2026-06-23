import mqtt from 'mqtt';
import { Server } from 'socket.io';

// Keep track of active devices: deviceId -> { status: 'online'|'offline', lastSeen: number }
const devices = new Map<string, { status: string; lastSeen: number }>();

// Keep track of all active MQTT clients
const mqttClients = new Map<string, mqtt.MqttClient>();

// Track transient brokers for UI display
const transientBrokers = new Map<string, any>();

export const getActiveCustomBrokers = () => {
  return Array.from(transientBrokers.values());
};

let ioInstance: Server | null = null;

const setupClientListeners = (client: mqtt.MqttClient, name: string) => {
  client.on('message', (topic, message) => {
    const payloadString = message.toString();
    console.log(`[MQTT - ${name}] New message on topic ${topic}: ${payloadString}`);
    
    const topicParts = topic.split('/');
    if (topicParts.length >= 3) {
      // robust extraction matching MonitorPanel logic
      const deviceId = topicParts[topicParts.length - 2];
      const messageType = topicParts[topicParts.length - 1];
      
      if (messageType === 'status') {
        const status = payloadString.toLowerCase() === 'offline' ? 'offline' : 'online';
        devices.set(deviceId, { status, lastSeen: Date.now() });
      } else {
        devices.set(deviceId, { status: 'online', lastSeen: Date.now() });
      }
    }

    if (ioInstance) {
      ioInstance.emit('mqtt_message', {
        topic,
        payload: payloadString,
        time: new Date().toISOString()
      });
    }
  });
};

export const connectToDynamicBroker = (config: { url: string, username?: string, password?: string, topic: string, name: string, _id?: string }) => {
  console.log(`[MQTT] Trying to connect to dynamic broker: ${config.name} at ${config.url}`);
  
  const options: mqtt.IClientOptions = {};
  if (config.username) options.username = config.username;
  if (config.password) options.password = config.password;

  const id = config._id?.toString() || config.name;
  if (mqttClients.has(id)) {
    console.log(`[MQTT] Broker ${id} is already connected.`);
    return;
  }

  const client = mqtt.connect(config.url, options);

  client.on('connect', () => {
    console.log(`[MQTT] Successfully connected to ${config.name}!`);
    const listenTopic = config.topic || '#';
    client.subscribe(listenTopic, (err) => {
      if (!err) console.log(`[MQTT - ${config.name}] Subscribed to topic: ${listenTopic}`);
      else console.error(`[MQTT - ${config.name}] Failed to subscribe:`, err);
    });
    mqttClients.set(id, client);
    if (!config._id) {
      transientBrokers.set(id, { _id: id, name: config.name, url: config.url });
    }
  });

  client.on('error', (err) => {
    console.error(`[MQTT - ${config.name}] Connection error:`, err.message);
  });

  setupClientListeners(client, config.name);
};

export const disconnectFromDynamicBroker = (id: string) => {
  const client = mqttClients.get(id);
  if (client) {
    client.end();
    mqttClients.delete(id);
    transientBrokers.delete(id);
    console.log(`[MQTT] Disconnected from broker: ${id}`);
  }
};

export const initMqttService = async (io: Server) => {
  ioInstance = io;

  // 1. Connect to the default spiritech broker (as requested)
  connectToDynamicBroker({
    url: 'mqtt://mqtt.spiritech.me',
    username: 'team8',
    password: 'Braude2026',
    topic: 'Braude/team8/#',
    name: 'Default Spiritech Broker'
  });

  // (Dynamic DB brokers fetch has been removed since we moved to transient brokers)

  // 3. Periodically check for inactive devices and broadcast status
  setInterval(() => {
    const now = Date.now();
    devices.forEach((deviceInfo, deviceId) => {
      if (deviceInfo.status === 'online' && now - deviceInfo.lastSeen > 60000) {
        deviceInfo.status = 'offline';
      }
    });

    const devicesArray = Array.from(devices.entries()).map(([id, info]) => ({ id, ...info }));
    if (ioInstance) {
      ioInstance.emit('device_status_update', devicesArray);
    }
  }, 5000);

  // 4. Handle outgoing commands from React
  io.on('connection', (socket) => {
    socket.on('send_mqtt_command', (data: { topic: string, message: string }) => {
      console.log(`[Socket] React wants to send MQTT message to ${data.topic}`);
      // Publish to all connected clients (since we don't know which broker the device belongs to)
      let published = false;
      mqttClients.forEach(client => {
        if (client.connected) {
          client.publish(data.topic, data.message);
          published = true;
        }
      });
      if (published) {
        console.log(`[MQTT] Published: ${data.message} to ${data.topic}`);
      } else {
        console.error('[MQTT] Cannot publish, no clients connected.');
      }
    });
  });
};
