const mqtt = require('mqtt');

const client = mqtt.connect('mqtt://test.mosquitto.org');

client.on('connect', () => {
  console.log('Mock Sensor connected to test.mosquitto.org');

  // Tell the backend we are online
  client.publish('Braude/team8/test_sensors/MockDevice1/status', 'online');

  // Send a random temperature reading every 3 seconds
  setInterval(() => {
    const temp = (20 + Math.random() * 10).toFixed(2);
    const payload = JSON.stringify({ temperature: temp, humidity: 45 });
    
    console.log(`Sending: ${payload}`);
    client.publish('Braude/team8/test_sensors/MockDevice1/telemetry', payload);
  }, 3000);
});

client.on('error', (err) => {
  console.error('Connection error:', err);
});
