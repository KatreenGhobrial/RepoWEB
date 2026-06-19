import mqtt from 'mqtt';
import { Server } from 'socket.io';

// Keep track of active devices: deviceId -> { status: 'online'|'offline', lastSeen: number }
const devices = new Map<string, { status: string; lastSeen: number }>();

// We store the MQTT client instance here so we can use it to publish messages later
let mqttClient: mqtt.MqttClient | null = null;

/**
 * Initializes the MQTT connection and sets up the bridge to Socket.IO.
 * We keep this code very simple and readable!
 */
export const initMqttService = (io: Server) => {
  // 1. Connection settings (Provided by the student)
  const brokerUrl = 'mqtt://mqtt.spiritech.me';
  const options: mqtt.IClientOptions = {
    username: 'team8',
    password: 'Braude2026',
  };

  console.log(`[MQTT] Trying to connect to ${brokerUrl}...`);

  // 2. Connect to the broker
  mqttClient = mqtt.connect(brokerUrl, options);

  // 3. When connected successfully
  mqttClient.on('connect', () => {
    console.log('[MQTT] Successfully connected to broker!');
    
    // Subscribe to the student's topic to listen for data
    const listenTopic = 'Braude/team8/#';
    mqttClient?.subscribe(listenTopic, (err) => {
      if (!err) {
        console.log(`[MQTT] Subscribed to topic: ${listenTopic}`);
      } else {
        console.error('[MQTT] Failed to subscribe:', err);
      }
    });
  });

  // 4. When a message arrives from the M5Stack controller
  mqttClient.on('message', (topic, message) => {
    const payloadString = message.toString();
    console.log(`[MQTT] New message on topic ${topic}: ${payloadString}`);
    
    // Attempt to extract device ID from topic. Assuming topic structure: Braude/team8/DEVICE_ID/...
    const topicParts = topic.split('/');
    if (topicParts.length >= 3 && topicParts[0] === 'Braude' && topicParts[1] === 'team8') {
      const deviceId = topicParts[2];
      
      // If it's a specific 'status' topic (e.g. Braude/team8/Device1/status)
      if (topicParts[3] === 'status') {
        const status = payloadString.toLowerCase() === 'offline' ? 'offline' : 'online';
        devices.set(deviceId, { status, lastSeen: Date.now() });
      } else {
        // Any other message means the device is alive
        devices.set(deviceId, { status: 'online', lastSeen: Date.now() });
      }
    }

    // Bridge: Send this message straight to the React frontend using Socket.IO!
    io.emit('mqtt_message', {
      topic,
      payload: payloadString,
      time: new Date().toISOString()
    });
  });

  // Periodically check for inactive devices and broadcast status to frontend
  setInterval(() => {
    const now = Date.now();
    let changed = false;

    devices.forEach((deviceInfo, deviceId) => {
      // If we haven't seen a message in 60 seconds, mark as offline
      if (deviceInfo.status === 'online' && now - deviceInfo.lastSeen > 60000) {
        deviceInfo.status = 'offline';
        changed = true;
      }
    });

    // Broadcast the devices list to all connected React clients
    const devicesArray = Array.from(devices.entries()).map(([id, info]) => ({
      id,
      ...info
    }));
    io.emit('device_status_update', devicesArray);
    
  }, 5000); // Check every 5 seconds

  // 5. Allow React (Socket.IO) to send commands BACK to the M5Stack controller
  io.on('connection', (socket) => {
    // Listen for a "send_mqtt_command" event from the React app
    socket.on('send_mqtt_command', (data: { topic: string, message: string }) => {
      console.log(`[Socket] React wants to send MQTT message to ${data.topic}`);
      if (mqttClient && mqttClient.connected) {
        mqttClient.publish(data.topic, data.message);
        console.log(`[MQTT] Published: ${data.message} to ${data.topic}`);
      } else {
        console.error('[MQTT] Cannot publish, client not connected.');
      }
    });
  });
};
