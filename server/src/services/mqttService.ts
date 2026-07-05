/**
 * MQTT Integration Service.
 * Manages connections to MQTT brokers, listens for incoming sensor data,
 * performs anomaly detection, and broadcasts live events via WebSockets.
 */
import mqtt from 'mqtt';
import { Server } from 'socket.io';
import Alert from '../models/Alert';

// Keep track of active devices: deviceId -> { status: 'online'|'offline', lastSeen: number }
const devices = new Map<string, { status: string; lastSeen: number }>();

// Keep track of all active MQTT clients
const mqttClients = new Map<string, mqtt.MqttClient>();

// Track transient brokers for UI display
const transientBrokers = new Map<string, any>();

// Debounce map for anomalies: deviceId_type -> timestamp
const lastAlertTimes = new Map<string, number>();

// Global rate limit: keep track of timestamps of alerts created in the last hour
const globalAlertTimestamps: number[] = [];

export const getActiveCustomBrokers = () => {
  return Array.from(transientBrokers.values()).map(b => {
    const client = mqttClients.get(b._id);
    return { ...b, connected: client ? client.connected : false };
  });
};

let isGlobalMqttPaused = false;
let ioInstance: Server | null = null;

const setupClientListeners = (client: mqtt.MqttClient, name: string) => {
  client.on('message', async (topic, message) => {
    if (isGlobalMqttPaused) return;

    const payloadString = message.toString();
    console.log(`[MQTT - ${name}] New message on topic ${topic}: ${payloadString}`);
    
    let deviceId = 'unknown';
    const topicParts = topic.split('/');
    if (topicParts.length >= 3) {
      // robust extraction matching MonitorPanel logic
      deviceId = topicParts[topicParts.length - 2];
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

    // --- Anomaly Detection & Live Alerts ---
    const ENABLE_MQTT_ALERTS = false; // Feature flag to disable MQTT alerts (revert to demo)
    
    if (ENABLE_MQTT_ALERTS) {
      try {
        const lowerPayload = payloadString.toLowerCase();
        let isAnomaly = false;
        let alertMessage = '';
      
      let parsedData: any = null;
      try {
        parsedData = JSON.parse(payloadString);
      } catch (e) {
        // Not JSON
      }

      if (parsedData) {
        if (parsedData.temperature !== undefined && Number(parsedData.temperature) > 40) {
          isAnomaly = true;
          alertMessage = `High temperature detected: ${parsedData.temperature}°C`;
        } else if (parsedData.humidity !== undefined && Number(parsedData.humidity) > 80) {
          isAnomaly = true;
          alertMessage = `High humidity detected: ${parsedData.humidity}%`;
        } else {
          // Recursive search for error keywords in JSON
          const findAnomaly = (obj: any): { key: string, val: any } | null => {
            if (!obj || typeof obj !== 'object') return null;
            for (const [k, v] of Object.entries(obj)) {
              const kLower = k.toLowerCase();
              if ((kLower === 'error' || kLower === 'err' || kLower === 'failure' || kLower === 'alert') && v !== 0 && v !== false && v !== null && v !== '') {
                return { key: k, val: v };
              }
              if (typeof v === 'string') {
                const vLower = v.toLowerCase();
                if (vLower.includes('fail') || vLower.includes('error') || vLower.includes('alert') || vLower.includes('critical')) {
                  return { key: k, val: v };
                }
              } else if (typeof v === 'object') {
                const found = findAnomaly(v);
                if (found) return found;
              }
            }
            return null;
          };

          const anomalyField = findAnomaly(parsedData);
          if (anomalyField) {
            isAnomaly = true;
            alertMessage = `Device reported issue in '${anomalyField.key}': ${anomalyField.val}`;
          }
        }
      }

      // Keyword search fallback for raw strings
      if (!isAnomaly && (lowerPayload.includes('error') || lowerPayload.includes('fail') || lowerPayload.includes('alert'))) {
        isAnomaly = true;
        alertMessage = `System reported an anomaly or failure. Please check device logs.`;
      }

      if (isAnomaly) {
        const now = Date.now();

        // Enforce global limit: Max 5 alerts per hour
        while (globalAlertTimestamps.length > 0 && globalAlertTimestamps[0] < now - 3600000) {
          globalAlertTimestamps.shift();
        }

        if (globalAlertTimestamps.length >= 5) {
          return; // Skip creating this alert to prevent overall spam
        }

        // Use the exact alert message as the key to ensure identical alerts are unique
        const alertKey = alertMessage;
        const lastAlertTime = lastAlertTimes.get(alertKey) || 0;
        
        // Debounce: 1 hour (3600000 ms) for IDENTICAL alerts
        if (now - lastAlertTime > 3600000) {
          lastAlertTimes.set(alertKey, now);
          globalAlertTimestamps.push(now); // Track this successful alert for the global limit
          
          const newAlert = await Alert.create({
            projectId: 'demo',
            type: 'sensor_failure',
            severity: 'HIGH',
            title: 'Live MQTT Anomaly',
            message: alertMessage,
            deviceId: deviceId !== 'unknown' ? deviceId : undefined,
            resolved: false,
          });

          console.log(`[MQTT - ${name}] Anomaly detected, alert created: ${newAlert._id}`);

          if (ioInstance) {
            ioInstance.emit('new_mqtt_alert', newAlert);
          }
        }
      }
      } catch (err) {
        console.error('[MQTT Anomaly Detection Error]:', err);
      }
    }
    // ---------------------------------------
  });
};

const broadcastBrokerStatus = () => {
  if (!ioInstance) return;
  let anyConnected = false;
  for (const client of mqttClients.values()) {
    if (client.connected) {
      anyConnected = true;
      break;
    }
  }
  
  if (anyConnected) {
    ioInstance.emit('mqtt_broker_status', { status: 'connected' });
  } else if (mqttClients.size > 0) {
    ioInstance.emit('mqtt_broker_status', { status: 'error', message: 'Brokers disconnected' });
  } else {
    ioInstance.emit('mqtt_broker_status', { status: 'disconnected' });
  }
};

export const connectToDynamicBroker = (config: { url: string, port?: string | number, username?: string, password?: string, topic: string, name: string, _id?: string }) => {
  console.log(`[MQTT] Trying to connect to dynamic broker: ${config.name} at ${config.url}`);
  
  const options: mqtt.IClientOptions = {};
  if (config.port) options.port = Number(config.port);
  if (config.username) options.username = config.username;
  if (config.password) options.password = config.password;

  const id = config._id?.toString() || config.name;
  if (mqttClients.has(id)) {
    console.log(`[MQTT] Broker ${id} is already connected.`);
    return;
  }

  const client = mqtt.connect(config.url, options);

  // Register immediately so the UI can show it (even if connecting/failed)
  mqttClients.set(id, client);
  transientBrokers.set(id, { _id: id, name: config.name, url: config.url, port: config.port, status: 'connecting' });

  client.on('connect', () => {
    console.log(`[MQTT] Successfully connected to ${config.name}!`);
    const listenTopic = config.topic || '#';
    client.subscribe(listenTopic, (err) => {
      if (!err) console.log(`[MQTT - ${config.name}] Subscribed to topic: ${listenTopic}`);
      else console.error(`[MQTT - ${config.name}] Failed to subscribe:`, err);
    });
    
    if (transientBrokers.has(id)) {
      transientBrokers.get(id).status = 'connected';
    }
    broadcastBrokerStatus();
  });

  client.on('error', (err) => {
    console.error(`[MQTT - ${config.name}] Connection error:`, err.message);
    if (transientBrokers.has(id)) {
      transientBrokers.get(id).status = 'error';
    }
    broadcastBrokerStatus();
  });
  
  client.on('close', () => {
    broadcastBrokerStatus();
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

export const disconnectAllBrokers = () => {
  for (const id of mqttClients.keys()) {
    const client = mqttClients.get(id);
    if (client) {
      client.end();
    }
  }
  mqttClients.clear();
  transientBrokers.clear();
  console.log(`[MQTT] Disconnected from all brokers.`);
  broadcastBrokerStatus();
};

export const initMqttService = async (io: Server) => {
  ioInstance = io;

  // 1. Default broker disabled — credentials rejected by mqtt.spiritech.me
  //    Connect manually via POST /api/mqtt with valid credentials if needed.
  // connectToDynamicBroker({
  //   url: 'mqtt://mqtt.spiritech.me',
  //   username: 'team8',
  //   password: 'Braude2026',
  //   topic: 'Braude/team8/#',
  //   name: 'Default Spiritech Broker'
  // });

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
    // Send initial pause state to new clients
    socket.emit('mqtt_pause_status', isGlobalMqttPaused);

    socket.on('toggle_mqtt_pause', (paused: boolean) => {
      isGlobalMqttPaused = paused;
      console.log(`[MQTT] Global feed paused status: ${paused}`);
      ioInstance?.emit('mqtt_pause_status', paused);
    });

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
