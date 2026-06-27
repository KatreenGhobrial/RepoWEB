const mqtt = require('mqtt');

// Update this to match the broker you connect to in the UI
const BROKER_URL = 'mqtt://test.mosquitto.org'; 
const DEVICE_ID = 'TEST-NODE-01';
const BASE_TOPIC = `Braude/team8/${DEVICE_ID}/telemetry`;

console.log(`Connecting to ${BROKER_URL}...`);
const client = mqtt.connect(BROKER_URL);

client.on('connect', () => {
  console.log('Connected to broker! Sending test scenarios...\n');

  // Scenario 1: Packet Loss (Critical > 5)
  setTimeout(() => {
    console.log('--- Sending: High Packet Loss ---');
    client.publish(BASE_TOPIC, JSON.stringify({
      temperature: 24,
      packet_loss: 15 // High
    }));
  }, 2000);

  // Scenario 2: Battery Drain (Critical < 15)
  setTimeout(() => {
    console.log('--- Sending: Critical Battery Drain ---');
    client.publish(BASE_TOPIC, JSON.stringify({
      temperature: 24,
      battery: 10 // High Alert
    }));
  }, 4000);

  // Scenario 3: High Latency (Medium > 200)
  setTimeout(() => {
    console.log('--- Sending: High Latency ---');
    client.publish(BASE_TOPIC, JSON.stringify({
      temperature: 24,
      latency: 450 // Medium Alert
    }));
  }, 6000);

  // Scenario 4: Sensor Fault
  setTimeout(() => {
    console.log('--- Sending: Sensor Fault ---');
    client.publish(BASE_TOPIC, JSON.stringify({
      temperature: 24,
      sensorStatus: 'error' // Critical Alert
    }));
  }, 8000);

  // Scenario 5: Resolve all issues
  setTimeout(() => {
    console.log('--- Sending: Systems Normal (Resolving alerts) ---');
    client.publish(BASE_TOPIC, JSON.stringify({
      temperature: 24,
      packet_loss: 0,
      battery: 80,
      latency: 45,
      sensorStatus: 'OK'
    }));
    console.log('\nFinished testing. You can press Ctrl+C to exit.');
  }, 12000);
});

client.on('error', (err) => {
  console.error('Connection error:', err);
});
