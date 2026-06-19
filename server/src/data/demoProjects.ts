// ═══════════════════════════════════════════════════════════════════════════
// Demo Projects — Fake Data for Architecture Analysis Demo
// ═══════════════════════════════════════════════════════════════════════════
// Contains 3 realistic IoT projects with pre-calculated analysis results.
// Used for the Architecture Analysis demo feature (no database required).
// ═══════════════════════════════════════════════════════════════════════════

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ArchitectureLayer {
  name: string;         // e.g. "Sensor Layer"
  status: 'healthy' | 'warning' | 'critical';
  score: number;        // 0-100
  details: string;
}

export interface Bottleneck {
  location: string;     // which layer/component
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  guidingQuestion: string;
}

export interface FailurePoint {
  component: string;
  impact: string;       // what happens when it fails
  probability: 'HIGH' | 'MEDIUM' | 'LOW';
  mitigation: string;   // Socratic question about how to handle it
}

export interface IntegrationRisk {
  fromLayer: string;
  toLayer: string;
  risk: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  guidingQuestion: string;
}

export interface DemoProject {
  id: string;
  name: string;
  description: string;
  // Architecture
  device: string;
  protocol: string;
  database: string;
  powerSource: string;
  sensors: string[];
  cloudPlatform: string;
  // Data flow
  dataFlow: string[];   // ordered steps: "DHT22 Sensor" → "ESP32 MCU" → "MQTT" → "Cloud"
  // Analysis results
  healthScore: number;  // 0-100 overall score
  layers: ArchitectureLayer[];
  bottlenecks: Bottleneck[];
  failurePoints: FailurePoint[];
  integrationRisks: IntegrationRisk[];
}

// ---------------------------------------------------------------------------
// Demo Project 1: Smart Greenhouse
// ---------------------------------------------------------------------------
const smartGreenhouse: DemoProject = {
  id: 'demo-greenhouse',
  name: 'Smart Greenhouse Monitor',
  description: 'Monitors temperature, humidity, and soil moisture in a greenhouse. Uses solar power and sends data to AWS IoT via MQTT.',
  device: 'ESP32',
  protocol: 'MQTT',
  database: 'InfluxDB',
  powerSource: 'Solar',
  sensors: ['DHT22', 'Soil Moisture', 'LDR'],
  cloudPlatform: 'AWS IoT',
  dataFlow: [
    'DHT22 + Soil + LDR Sensors',
    'ESP32 MCU (data processing)',
    'WiFi Module (built-in)',
    'MQTT Broker (AWS IoT Core)',
    'AWS Lambda (processing)',
    'InfluxDB (time-series storage)',
    'Grafana Dashboard',
  ],
  healthScore: 82,
  layers: [
    { name: 'Sensor Layer', status: 'healthy', score: 90, details: '3 sensors, well-matched to ESP32 GPIO capacity. DHT22 uses digital pin, soil moisture uses ADC, LDR uses ADC.' },
    { name: 'Firmware Layer', status: 'healthy', score: 85, details: 'ESP32 has 520KB RAM — enough for MQTT client + sensor libraries. Deep sleep possible between readings.' },
    { name: 'Communication Layer', status: 'warning', score: 70, details: 'MQTT is lightweight, but solar-powered WiFi may have intermittent connectivity on cloudy days.' },
    { name: 'Cloud Layer', status: 'healthy', score: 88, details: 'AWS IoT Core handles MQTT natively. Good scalability for future sensor additions.' },
    { name: 'Database Layer', status: 'healthy', score: 92, details: 'InfluxDB is ideal for time-series sensor data. Efficient compression and fast range queries.' },
  ],
  bottlenecks: [
    {
      location: 'WiFi + Solar Power',
      severity: 'MEDIUM',
      description: 'WiFi transmission draws ~200mA on ESP32. On cloudy days, solar panel output drops, potentially insufficient for consistent WiFi connectivity.',
      guidingQuestion: 'What is the minimum solar panel wattage for your WiFi transmission schedule? Have you tested on consecutive cloudy days?',
    },
    {
      location: 'Soil Moisture Sensor ADC',
      severity: 'LOW',
      description: 'Capacitive soil moisture sensors can degrade over time when exposed to moisture. The ADC reading may drift.',
      guidingQuestion: 'How will you detect if the soil moisture sensor is degrading? Do you have a calibration routine?',
    },
  ],
  failurePoints: [
    {
      component: 'WiFi Connection',
      impact: 'Sensor data cannot reach the cloud. Data must be buffered locally until reconnection.',
      probability: 'MEDIUM',
      mitigation: 'How much local storage (SPIFFS/SD) do you have for buffering data during WiFi outages? What is the maximum outage duration you can handle?',
    },
    {
      component: 'Solar Panel (no sun)',
      impact: 'Device loses power. All sensor readings stop. Cloud shows stale data.',
      probability: 'LOW',
      mitigation: 'Do you have a battery backup for cloudy periods? How many hours of operation can the battery sustain without solar charging?',
    },
    {
      component: 'MQTT Broker',
      impact: 'Messages queue up on the device. ESP32 memory may fill up. QoS 1/2 messages will retry.',
      probability: 'LOW',
      mitigation: 'What QoS level are you using? How does the firmware handle a full message queue?',
    },
  ],
  integrationRisks: [
    {
      fromLayer: 'Sensor Layer',
      toLayer: 'Firmware Layer',
      risk: 'ADC pin sharing between soil moisture and LDR may cause reading interference',
      severity: 'LOW',
      guidingQuestion: 'Are you reading ADC sensors sequentially with a delay, or simultaneously? How do you prevent crosstalk?',
    },
    {
      fromLayer: 'Communication Layer',
      toLayer: 'Cloud Layer',
      risk: 'MQTT TLS handshake uses ~40KB RAM on ESP32, leaving less for sensor data processing',
      severity: 'MEDIUM',
      guidingQuestion: 'After the TLS handshake, how much free RAM is available for your sensor data buffers?',
    },
  ],
};

// ---------------------------------------------------------------------------
// Demo Project 2: Smart Parking
// ---------------------------------------------------------------------------
const smartParking: DemoProject = {
  id: 'demo-parking',
  name: 'Smart Parking System',
  description: 'Detects occupied/free parking spots using ultrasonic sensors. Battery-powered nodes report via HTTP to a central server.',
  device: 'Arduino Uno',
  protocol: 'HTTP',
  database: 'MongoDB',
  powerSource: 'Battery',
  sensors: ['Ultrasonic HC-SR04', 'PIR', 'LED Indicator'],
  cloudPlatform: 'Firebase',
  dataFlow: [
    'HC-SR04 Ultrasonic Sensor',
    'Arduino Uno MCU',
    'ESP8266 WiFi Module (external)',
    'HTTP POST Request',
    'Firebase Cloud Functions',
    'MongoDB Atlas (storage)',
    'React Web Dashboard',
  ],
  healthScore: 45,
  layers: [
    { name: 'Sensor Layer', status: 'healthy', score: 80, details: 'HC-SR04 is reliable for distance measurement. PIR for motion detection. LED for visual feedback.' },
    { name: 'Firmware Layer', status: 'critical', score: 30, details: 'Arduino Uno has only 2KB RAM. Running ultrasonic + PIR + WiFi module communication is very tight.' },
    { name: 'Communication Layer', status: 'critical', score: 25, details: 'HTTP over battery is extremely power-inefficient. Arduino Uno needs external WiFi module, adding complexity.' },
    { name: 'Cloud Layer', status: 'warning', score: 55, details: 'Firebase does not support HTTP from Arduino natively. Cloud Functions add latency. Cold starts may cause timeouts.' },
    { name: 'Database Layer', status: 'warning', score: 60, details: 'MongoDB is OK for parking status, but Firebase + MongoDB is redundant. Choose one data store.' },
  ],
  bottlenecks: [
    {
      location: 'Arduino Uno RAM (2KB)',
      severity: 'HIGH',
      description: 'With the ESP8266 library consuming ~1KB, only 1KB remains for sensor data processing, HTTP request building, and the program stack.',
      guidingQuestion: 'Have you measured free RAM during a full sensor read + HTTP send cycle? What happens when memory runs out?',
    },
    {
      location: 'HTTP Request Overhead',
      severity: 'HIGH',
      description: 'Each HTTP request includes headers (~300-500 bytes), DNS lookup, TCP handshake, and response parsing. On battery, each request costs significant energy.',
      guidingQuestion: 'How many HTTP requests per hour does each parking sensor make? Have you calculated the battery drain per request?',
    },
    {
      location: 'Firebase Cold Start',
      severity: 'MEDIUM',
      description: 'Firebase Cloud Functions have cold start times of 1-10 seconds. The Arduino HTTP client may timeout waiting.',
      guidingQuestion: 'What is your HTTP timeout setting on the Arduino? What happens to the parking status update if the Cloud Function has a cold start?',
    },
  ],
  failurePoints: [
    {
      component: 'Battery',
      impact: 'All parking sensors go offline. Dashboard shows stale "occupied/free" data. Users get incorrect information.',
      probability: 'HIGH',
      mitigation: 'How often do batteries need replacement? Is there a low-battery alert mechanism before the device dies?',
    },
    {
      component: 'ESP8266 WiFi Module',
      impact: 'Arduino cannot communicate with the server. Parking status is unknown remotely.',
      probability: 'MEDIUM',
      mitigation: 'Does the LED indicator still work locally when WiFi is down? How does the system degrade gracefully?',
    },
    {
      component: 'Ultrasonic Sensor',
      impact: 'False readings: spot shown as free when occupied (dangerous), or occupied when free (annoying).',
      probability: 'MEDIUM',
      mitigation: 'How do you validate ultrasonic readings? Do you take multiple readings and average them to reduce noise?',
    },
  ],
  integrationRisks: [
    {
      fromLayer: 'Firmware Layer',
      toLayer: 'Communication Layer',
      risk: 'Serial communication between Arduino Uno and ESP8266 at 115200 baud can cause data corruption under heavy load',
      severity: 'HIGH',
      guidingQuestion: 'Are you using hardware serial or software serial for the ESP8266? At what baud rate? Have you tested for dropped bytes?',
    },
    {
      fromLayer: 'Communication Layer',
      toLayer: 'Cloud Layer',
      risk: 'Firebase REST API requires HTTPS, but ESP8266 TLS support is limited and uses significant memory',
      severity: 'HIGH',
      guidingQuestion: 'Does the ESP8266 have enough memory for the Firebase HTTPS certificate? Have you tested SSL on the ESP8266?',
    },
    {
      fromLayer: 'Cloud Layer',
      toLayer: 'Database Layer',
      risk: 'Using both Firebase AND MongoDB is redundant — data synchronization between them adds complexity',
      severity: 'MEDIUM',
      guidingQuestion: 'Why are you using both Firebase and MongoDB? Could you simplify by using only one data store?',
    },
  ],
};

// ---------------------------------------------------------------------------
// Demo Project 3: Industrial Monitor
// ---------------------------------------------------------------------------
const industrialMonitor: DemoProject = {
  id: 'demo-industrial',
  name: 'Industrial Equipment Monitor',
  description: 'Monitors vibration, temperature, and power consumption of factory machinery. Uses Raspberry Pi with WebSocket for real-time dashboard.',
  device: 'Raspberry Pi',
  protocol: 'WebSocket',
  database: 'MongoDB',
  powerSource: 'AC Power',
  sensors: ['MPU6050', 'DS18B20', 'ACS712', 'BMP280'],
  cloudPlatform: 'Azure IoT Hub',
  dataFlow: [
    'MPU6050 + DS18B20 + ACS712 + BMP280',
    'Raspberry Pi 4 (Python data processing)',
    'WebSocket Connection (persistent)',
    'Azure IoT Hub (ingestion)',
    'Azure Stream Analytics',
    'MongoDB Atlas (storage)',
    'React Real-time Dashboard',
  ],
  healthScore: 75,
  layers: [
    { name: 'Sensor Layer', status: 'warning', score: 65, details: '4 sensors with mixed interfaces: MPU6050+BMP280 on I2C, DS18B20 on 1-Wire, ACS712 on ADC. Need careful bus management.' },
    { name: 'Firmware Layer', status: 'healthy', score: 88, details: 'Raspberry Pi has 1GB+ RAM and runs Python. No memory constraints. Can process data locally with ML models.' },
    { name: 'Communication Layer', status: 'warning', score: 68, details: 'WebSocket is persistent — great for real-time, but consumes bandwidth constantly. Connection drops need reconnection logic.' },
    { name: 'Cloud Layer', status: 'healthy', score: 85, details: 'Azure IoT Hub is enterprise-grade. Stream Analytics handles real-time processing. Good for industrial use cases.' },
    { name: 'Database Layer', status: 'warning', score: 60, details: 'MongoDB for industrial time-series data is suboptimal. High write frequency may cause performance issues over time.' },
  ],
  bottlenecks: [
    {
      location: 'I2C Bus with MPU6050 + BMP280',
      severity: 'MEDIUM',
      description: 'Both MPU6050 and BMP280 share the I2C bus. MPU6050 vibration data needs high sampling rate (>100Hz), which blocks the bus from BMP280 reads.',
      guidingQuestion: 'What sampling rate do you need for vibration analysis? Can you schedule I2C reads to avoid bus contention?',
    },
    {
      location: 'WebSocket Bandwidth',
      severity: 'MEDIUM',
      description: 'Streaming 4 sensor channels at high frequency over WebSocket generates constant network traffic. In a factory with many machines, this can saturate the network.',
      guidingQuestion: 'How many machines will report simultaneously? Have you calculated the total bandwidth requirement?',
    },
  ],
  failurePoints: [
    {
      component: 'Raspberry Pi SD Card',
      impact: 'SD card corruption causes total device failure. All sensor data collection stops. Local buffered data is lost.',
      probability: 'MEDIUM',
      mitigation: 'How will you handle SD card wear? Are you using a read-only filesystem with RAM-based logging?',
    },
    {
      component: 'WebSocket Connection',
      impact: 'Real-time dashboard shows stale data. Alerts are delayed. Operators may miss critical machinery issues.',
      probability: 'MEDIUM',
      mitigation: 'What is your WebSocket reconnection strategy? Do you buffer data locally during disconnections?',
    },
    {
      component: 'ACS712 Current Sensor',
      impact: 'Cannot measure power consumption. No alerts for overcurrent conditions. Safety risk.',
      probability: 'LOW',
      mitigation: 'Do you have a secondary safety mechanism (hardware fuse/breaker) independent of the IoT system?',
    },
  ],
  integrationRisks: [
    {
      fromLayer: 'Sensor Layer',
      toLayer: 'Firmware Layer',
      risk: 'ACS712 is analog but Raspberry Pi has no built-in ADC — requires external ADC (ADS1115) adding I2C bus load',
      severity: 'HIGH',
      guidingQuestion: 'Which ADC are you using for the ACS712? Does it share the I2C bus with MPU6050 and BMP280?',
    },
    {
      fromLayer: 'Communication Layer',
      toLayer: 'Cloud Layer',
      risk: 'WebSocket data format must match Azure IoT Hub expected schema — any mismatch causes silent data drops',
      severity: 'MEDIUM',
      guidingQuestion: 'Have you validated your WebSocket message schema against Azure IoT Hub documentation? How do you detect dropped messages?',
    },
  ],
};

// ---------------------------------------------------------------------------
// Export all demo projects
// ---------------------------------------------------------------------------
export const DEMO_PROJECTS: DemoProject[] = [
  smartGreenhouse,
  smartParking,
  industrialMonitor,
];

/**
 * Get a demo project by its ID.
 * Returns undefined if not found.
 */
export function getDemoProject(id: string): DemoProject | undefined {
  return DEMO_PROJECTS.find(p => p.id === id);
}
