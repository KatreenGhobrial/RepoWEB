import { Router, Response } from 'express';

const router = Router();

// ───────────────────────────────────────────────────────────────────────────
// IoT Solution Library — static curated knowledge base
// ───────────────────────────────────────────────────────────────────────────

const iotLibrary = {
  protocols: [
    {
      name: 'MQTT',
      type: 'Protocol',
      category: 'messaging',
      description: 'Lightweight publish/subscribe messaging protocol designed for constrained devices and low-bandwidth networks.',
      pros: ['Very low overhead', 'Supports QoS levels', 'Persistent sessions', 'Ideal for battery-powered devices'],
      cons: ['Requires a broker', 'Not suitable for request/response patterns', 'Limited security out-of-the-box'],
      bestFor: 'Sensor telemetry, real-time monitoring, battery-powered IoT devices',
      powerUsage: 'Low',
    },
    {
      name: 'CoAP',
      type: 'Protocol',
      category: 'messaging',
      description: 'Constrained Application Protocol — a lightweight RESTful protocol for constrained devices.',
      pros: ['Very lightweight', 'UDP-based (less overhead)', 'Built-in discovery', 'Observation support'],
      cons: ['Less mature ecosystem', 'UDP can lose packets', 'Limited browser support'],
      bestFor: 'Resource-constrained sensors, machine-to-machine communication',
      powerUsage: 'Very Low',
    },
    {
      name: 'HTTP/REST',
      type: 'Protocol',
      category: 'messaging',
      description: 'Standard web protocol — familiar and widely supported.',
      pros: ['Universal support', 'Easy to debug', 'Works through firewalls', 'Rich ecosystem'],
      cons: ['High overhead for IoT', 'Not ideal for real-time', 'Battery drain on frequent polling'],
      bestFor: 'Cloud-to-device commands, firmware updates, dashboard APIs',
      powerUsage: 'High',
    },
    {
      name: 'WebSocket',
      type: 'Protocol',
      category: 'messaging',
      description: 'Full-duplex communication channel over a single TCP connection.',
      pros: ['Real-time bidirectional', 'Low latency after connection', 'Browser support'],
      cons: ['Higher resource usage', 'Complex connection management', 'Not ideal for constrained devices'],
      bestFor: 'Real-time dashboards, live monitoring, interactive applications',
      powerUsage: 'Medium',
    },
    {
      name: 'BLE (Bluetooth Low Energy)',
      type: 'Protocol',
      category: 'wireless',
      description: 'Short-range wireless protocol optimised for very low power consumption.',
      pros: ['Extremely low power', 'No infrastructure needed', 'Good for wearables'],
      cons: ['Short range (~10m)', 'Limited data rate', 'Requires gateway for cloud'],
      bestFor: 'Wearables, proximity sensors, indoor positioning',
      powerUsage: 'Very Low',
    },
    {
      name: 'LoRaWAN',
      type: 'Protocol',
      category: 'wireless',
      description: 'Long-range, low-power wide-area network protocol.',
      pros: ['Very long range (km)', 'Extremely low power', 'Good for rural areas'],
      cons: ['Very low data rate', 'High latency', 'Requires LoRa gateways'],
      bestFor: 'Agriculture, smart cities, remote monitoring',
      powerUsage: 'Very Low',
    },
  ],
  hardware: [
    {
      name: 'ESP32',
      type: 'Microcontroller',
      description: 'Dual-core 240 MHz MCU with built-in Wi-Fi and Bluetooth.',
      specs: { cpu: 'Xtensa LX6 dual-core', ram: '520 KB', flash: '4 MB', gpio: 34, wifi: true, bluetooth: true },
      pros: ['Cheap (~$4)', 'Wi-Fi + BLE', 'Arduino compatible', 'Deep sleep mode'],
      cons: ['3.3V only', 'Power-hungry Wi-Fi', 'ADC not very accurate'],
      bestFor: 'General IoT prototyping, connected sensors, home automation',
    },
    {
      name: 'Arduino Uno',
      type: 'Microcontroller',
      description: 'Classic 8-bit MCU — simple and well-documented.',
      specs: { cpu: 'ATmega328P', ram: '2 KB', flash: '32 KB', gpio: 14, wifi: false, bluetooth: false },
      pros: ['Very simple', 'Huge community', '5V tolerant', 'Low power base'],
      cons: ['No built-in connectivity', 'Very limited memory', 'Slow'],
      bestFor: 'Learning, simple sensor reading, relay control',
    },
    {
      name: 'Raspberry Pi',
      type: 'Single Board Computer',
      description: 'Full Linux computer with GPIO — acts as gateway or edge device.',
      specs: { cpu: 'ARM Cortex-A72', ram: '1-8 GB', flash: 'SD Card', gpio: 40, wifi: true, bluetooth: true },
      pros: ['Full OS', 'Camera & display support', 'AI/ML capable', 'Multi-language'],
      cons: ['High power consumption', 'Not real-time', 'SD card reliability'],
      bestFor: 'Edge computing, gateway, image processing, ML inference',
    },
    {
      name: 'STM32',
      type: 'Microcontroller',
      description: 'ARM Cortex-M based MCU family — professional grade.',
      specs: { cpu: 'ARM Cortex-M', ram: '64-256 KB', flash: '128-1024 KB', gpio: 50, wifi: false, bluetooth: false },
      pros: ['Professional grade', 'Low power modes', 'Real-time capable', 'DMA'],
      cons: ['Steeper learning curve', 'Needs separate connectivity module'],
      bestFor: 'Industrial IoT, motor control, medical devices',
    },
  ],
  cloudPlatforms: [
    {
      name: 'AWS IoT Core',
      type: 'Cloud Platform',
      description: 'Amazon\'s managed IoT service with device shadow, rules engine, and analytics.',
      features: ['Device shadows', 'Rules engine', 'MQTT broker', 'OTA updates', 'Greengrass edge'],
      pricing: 'Pay per message (~$1/million messages)',
    },
    {
      name: 'Google Cloud IoT',
      type: 'Cloud Platform',
      description: 'Google\'s IoT platform integrated with BigQuery and Cloud ML.',
      features: ['Device registry', 'Pub/Sub integration', 'BigQuery analytics', 'ML integration'],
      pricing: 'Pay per data volume',
    },
    {
      name: 'Firebase',
      type: 'Cloud Platform',
      description: 'Google\'s app development platform — great for prototyping IoT dashboards.',
      features: ['Real-time database', 'Authentication', 'Cloud Functions', 'Free tier'],
      pricing: 'Generous free tier, pay as you grow',
    },
    {
      name: 'Azure IoT Hub',
      type: 'Cloud Platform',
      description: 'Microsoft\'s IoT platform with device twins and edge computing.',
      features: ['Device twins', 'Edge modules', 'Stream Analytics', 'Time Series Insights'],
      pricing: 'Free tier (8,000 messages/day)',
    },
  ],
  sensors: [
    { name: 'DHT22', type: 'Temperature & Humidity', range: '-40°C to 80°C, 0-100% RH', accuracy: '±0.5°C, ±2% RH', interface: 'Digital (single wire)' },
    { name: 'BMP280', type: 'Barometric Pressure', range: '300-1100 hPa', accuracy: '±1 hPa', interface: 'I2C / SPI' },
    { name: 'HC-SR04', type: 'Ultrasonic Distance', range: '2-400 cm', accuracy: '±3mm', interface: 'Digital (trigger/echo)' },
    { name: 'MQ-2', type: 'Gas/Smoke', range: '200-10000 ppm', accuracy: 'Analog', interface: 'Analog' },
    { name: 'LDR', type: 'Light', range: '0-1000 lux', accuracy: 'Analog', interface: 'Analog' },
    { name: 'PIR', type: 'Motion', range: '3-7m', accuracy: 'Digital', interface: 'Digital' },
    { name: 'MPU6050', type: 'Accelerometer + Gyroscope', range: '±16g, ±2000°/s', accuracy: '16-bit', interface: 'I2C' },
  ],
};

// ───────────────────────────────────────────────────────────────────────────
// GET /api/library — Get the full IoT solution library
// ───────────────────────────────────────────────────────────────────────────
router.get('/', (_req, res: Response): void => {
  res.json(iotLibrary);
});

// ───────────────────────────────────────────────────────────────────────────
// GET /api/library/protocols
// ───────────────────────────────────────────────────────────────────────────
router.get('/protocols', (_req, res: Response): void => {
  res.json(iotLibrary.protocols);
});

// ───────────────────────────────────────────────────────────────────────────
// GET /api/library/hardware
// ───────────────────────────────────────────────────────────────────────────
router.get('/hardware', (_req, res: Response): void => {
  res.json(iotLibrary.hardware);
});

// ───────────────────────────────────────────────────────────────────────────
// GET /api/library/cloud
// ───────────────────────────────────────────────────────────────────────────
router.get('/cloud', (_req, res: Response): void => {
  res.json(iotLibrary.cloudPlatforms);
});

// ───────────────────────────────────────────────────────────────────────────
// GET /api/library/sensors
// ───────────────────────────────────────────────────────────────────────────
router.get('/sensors', (_req, res: Response): void => {
  res.json(iotLibrary.sensors);
});

// ───────────────────────────────────────────────────────────────────────────
// GET /api/library/search?q=mqtt
// ───────────────────────────────────────────────────────────────────────────
router.get('/search', (req, res: Response): void => {
  const query = ((req.query.q as string) || '').toLowerCase();

  if (!query) {
    res.json([]);
    return;
  }

  const results: Array<Record<string, unknown>> = [];

  const searchIn = (items: Record<string, unknown>[], category: string) => {
    items.forEach((item) => {
      const text = JSON.stringify(item).toLowerCase();
      if (text.includes(query)) {
        results.push({ ...item, _category: category });
      }
    });
  };

  searchIn(iotLibrary.protocols as unknown as Record<string, unknown>[], 'protocol');
  searchIn(iotLibrary.hardware as unknown as Record<string, unknown>[], 'hardware');
  searchIn(iotLibrary.cloudPlatforms as unknown as Record<string, unknown>[], 'cloud');
  searchIn(iotLibrary.sensors as unknown as Record<string, unknown>[], 'sensor');

  res.json(results);
});

export default router;
