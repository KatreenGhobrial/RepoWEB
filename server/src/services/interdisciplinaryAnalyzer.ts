// ═══════════════════════════════════════════════════════════════════════════
// Interdisciplinary Issue Analyzer — Rule-Based Engine
// ═══════════════════════════════════════════════════════════════════════════
// This service analyzes an IoT project's architecture and identifies
// difficulties that arise from the combination of different disciplines:
// hardware, software, firmware, cloud, security, and power management.
//
// Each issue includes a Socratic guiding question (not a direct answer).
// ═══════════════════════════════════════════════════════════════════════════

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Represents an issue found between two or more disciplines */
export interface InterdisciplinaryIssue {
  title: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  disciplines: string[];       // e.g. ['Hardware', 'Communication']
  description: string;         // explanation of why this is a problem
  guidingQuestion: string;     // Socratic question to help team think
  category: string;            // e.g. 'power', 'protocol', 'memory', 'security'
}

/** Input: the project's architecture details */
export interface ArchitectureInput {
  device: string;         // e.g. "ESP32", "Arduino Uno", "Raspberry Pi"
  protocol: string;       // e.g. "MQTT", "HTTP", "CoAP", "BLE", "WebSocket"
  database: string;       // e.g. "MongoDB", "InfluxDB", "Firebase"
  powerSource: string;    // e.g. "Battery", "USB Power", "Solar"
  sensors: string[];      // e.g. ["DHT22", "BMP280", "PIR"]
  cloudPlatform: string;  // e.g. "AWS IoT", "Firebase", "Azure IoT Hub"
}

// ---------------------------------------------------------------------------
// Knowledge Base — Device specs used by the rules
// ---------------------------------------------------------------------------

const DEVICE_SPECS: Record<string, { ram: number; flash: number; wifi: boolean; bluetooth: boolean; gpioCount: number }> = {
  'ESP32':         { ram: 520,    flash: 4096,   wifi: true,  bluetooth: true,  gpioCount: 34 },
  'ESP8266':       { ram: 80,     flash: 1024,   wifi: true,  bluetooth: false, gpioCount: 17 },
  'Arduino Uno':   { ram: 2,      flash: 32,     wifi: false, bluetooth: false, gpioCount: 14 },
  'Arduino Mega':  { ram: 8,      flash: 256,    wifi: false, bluetooth: false, gpioCount: 54 },
  'Raspberry Pi':  { ram: 1024,   flash: 32000,  wifi: true,  bluetooth: true,  gpioCount: 40 },
  'STM32':         { ram: 64,     flash: 512,    wifi: false, bluetooth: false, gpioCount: 32 },
};

// Protocols that need a WiFi/network connection
const NETWORK_PROTOCOLS = ['MQTT', 'HTTP', 'CoAP', 'WebSocket'];

// Sensors that use I2C bus (potential address conflicts)
const I2C_SENSORS = ['BMP280', 'BMP180', 'BME280', 'SHT30', 'SHT31', 'MPU6050', 'OLED', 'ADS1115'];

// High-power-draw sensors
const HIGH_POWER_SENSORS = ['GPS', 'Camera', 'LIDAR', 'Ultrasonic'];

// ---------------------------------------------------------------------------
// Main Analysis Function
// ---------------------------------------------------------------------------

/**
 * Analyzes an IoT architecture and returns interdisciplinary issues.
 * Uses a rule-based approach — no external API calls needed.
 */
export function analyzeInterdisciplinaryIssues(arch: ArchitectureInput): InterdisciplinaryIssue[] {
  const issues: InterdisciplinaryIssue[] = [];
  const device = arch.device || '';
  const protocol = arch.protocol || '';
  const database = arch.database || '';
  const powerSource = arch.powerSource || '';
  const sensors = arch.sensors || [];
  const cloud = arch.cloudPlatform || '';
  const specs = DEVICE_SPECS[device];

  // =========================================================================
  // Rule 1: Hardware ↔ Communication — Device without WiFi using network protocol
  // =========================================================================
  if (specs && !specs.wifi && NETWORK_PROTOCOLS.includes(protocol)) {
    issues.push({
      title: `${device} does not have built-in WiFi for ${protocol}`,
      severity: 'HIGH',
      disciplines: ['Hardware', 'Communication'],
      description:
        `The ${device} does not have a built-in WiFi module, but the project ` +
        `uses ${protocol} which requires a network connection. An external WiFi ` +
        `module (like ESP8266) would be needed, adding complexity and cost.`,
      guidingQuestion:
        `How will the ${device} connect to the network for ${protocol}? ` +
        `What are the trade-offs of adding an external WiFi module vs. switching to a device with built-in WiFi?`,
      category: 'protocol',
    });
  }

  // =========================================================================
  // Rule 2: Hardware ↔ Power — Resource-heavy device on battery
  // =========================================================================
  if (device === 'Raspberry Pi' && powerSource.toLowerCase().includes('battery')) {
    issues.push({
      title: 'Raspberry Pi on Battery Power',
      severity: 'HIGH',
      disciplines: ['Hardware', 'Power Management'],
      description:
        'Raspberry Pi consumes 2.5-5W even when idle, making it impractical ' +
        'for battery-powered deployments. Unlike microcontrollers, it cannot ' +
        'use deep sleep modes effectively.',
      guidingQuestion:
        'Have you calculated how long the battery would last with the Raspberry Pi\'s ' +
        'constant power draw? Would a low-power MCU with deep sleep capabilities ' +
        '(like ESP32) meet your processing needs?',
      category: 'power',
    });
  }

  // =========================================================================
  // Rule 3: Communication ↔ Power — HTTP overhead on battery
  // =========================================================================
  if (protocol === 'HTTP' && powerSource.toLowerCase().includes('battery')) {
    issues.push({
      title: 'HTTP Protocol Overhead on Battery Device',
      severity: 'HIGH',
      disciplines: ['Communication', 'Power Management'],
      description:
        'HTTP requires a full TCP connection with headers for every request. ' +
        'Each request involves DNS lookup, TCP handshake, and potentially TLS. ' +
        'This is very power-intensive compared to lightweight protocols like MQTT or CoAP.',
      guidingQuestion:
        'How many HTTP requests does your device send per hour? ' +
        'Have you compared the energy cost of HTTP vs. MQTT QoS 0 for your data volume?',
      category: 'power',
    });
  }

  // =========================================================================
  // Rule 4: Firmware ↔ Hardware — Memory constraints with large data
  // =========================================================================
  if (specs && specs.ram <= 80 && sensors.length > 2) {
    issues.push({
      title: `Limited RAM (${specs.ram}KB) with ${sensors.length} Sensors`,
      severity: 'HIGH',
      disciplines: ['Firmware', 'Hardware'],
      description:
        `The ${device} has only ${specs.ram}KB of RAM. With ${sensors.length} sensors ` +
        `reading data simultaneously, plus the network stack buffer for ${protocol}, ` +
        `memory may run out, causing crashes or data corruption.`,
      guidingQuestion:
        `How much RAM does each sensor library consume? ` +
        `Have you profiled the peak memory usage when WiFi + sensor reads happen simultaneously?`,
      category: 'memory',
    });
  }

  // =========================================================================
  // Rule 5: Communication ↔ Security — No TLS with cloud platform
  // =========================================================================
  if (protocol === 'MQTT' && cloud && !cloud.toLowerCase().includes('local')) {
    issues.push({
      title: 'MQTT to Cloud Without Guaranteed Encryption',
      severity: 'MEDIUM',
      disciplines: ['Communication', 'Security'],
      description:
        'Standard MQTT (port 1883) transmits data in plain text. When sending ' +
        'sensor data to a cloud platform, this exposes data to interception. ' +
        'MQTTS (port 8883) adds TLS but increases memory usage and handshake time.',
      guidingQuestion:
        'Is your MQTT connection using TLS (port 8883) or plain (port 1883)? ' +
        'What sensitive data flows through this connection, and what would happen if it were intercepted?',
      category: 'security',
    });
  }

  // =========================================================================
  // Rule 6: Hardware ↔ Sensors — I2C bus address conflicts
  // =========================================================================
  const i2cSensors = sensors.filter(s => I2C_SENSORS.some(ic => s.toUpperCase().includes(ic.toUpperCase())));
  if (i2cSensors.length >= 2) {
    issues.push({
      title: `Potential I2C Bus Conflicts: ${i2cSensors.join(', ')}`,
      severity: 'MEDIUM',
      disciplines: ['Hardware', 'Firmware'],
      description:
        `You have ${i2cSensors.length} sensors that use the I2C bus. ` +
        `If two sensors share the same default I2C address, they cannot communicate ` +
        `on the same bus without address changes or a multiplexer.`,
      guidingQuestion:
        `Have you checked the I2C addresses of each sensor? ` +
        `Do any of them share the default address 0x76 or 0x77? ` +
        `Would you need an I2C multiplexer (like TCA9548A)?`,
      category: 'protocol',
    });
  }

  // =========================================================================
  // Rule 7: Sensors ↔ Power — High-power sensors on battery
  // =========================================================================
  const highPowerSensors = sensors.filter(s =>
    HIGH_POWER_SENSORS.some(hp => s.toUpperCase().includes(hp.toUpperCase()))
  );
  if (highPowerSensors.length > 0 && powerSource.toLowerCase().includes('battery')) {
    issues.push({
      title: `High-Power Sensors (${highPowerSensors.join(', ')}) on Battery`,
      severity: 'HIGH',
      disciplines: ['Hardware', 'Power Management'],
      description:
        `Sensors like ${highPowerSensors.join(', ')} consume significant power. ` +
        `Combined with battery operation, this severely limits device uptime ` +
        `unless aggressive duty cycling is implemented.`,
      guidingQuestion:
        `What is the duty cycle plan for ${highPowerSensors.join(', ')}? ` +
        `Can they be powered off between readings, or do they need continuous operation?`,
      category: 'power',
    });
  }

  // =========================================================================
  // Rule 8: Cloud ↔ Database — Protocol mismatch
  // =========================================================================
  if (cloud === 'Firebase' && protocol === 'MQTT') {
    issues.push({
      title: 'Firebase Does Not Support MQTT Natively',
      severity: 'MEDIUM',
      disciplines: ['Cloud', 'Communication'],
      description:
        'Firebase Realtime Database and Firestore use WebSocket/HTTP-based ' +
        'protocols. MQTT messages would need a bridge service (like a Node.js server) ' +
        'to translate between MQTT and Firebase.',
      guidingQuestion:
        'How will MQTT messages reach Firebase? ' +
        'Are you planning to build a bridge server, or would switching to HTTP/WebSocket for Firebase be simpler?',
      category: 'protocol',
    });
  }

  // =========================================================================
  // Rule 9: Communication ↔ Firmware — WebSocket on constrained MCU
  // =========================================================================
  if (protocol === 'WebSocket' && specs && specs.ram <= 520) {
    issues.push({
      title: `WebSocket on Memory-Constrained ${device}`,
      severity: 'MEDIUM',
      disciplines: ['Communication', 'Firmware'],
      description:
        `WebSocket connections are persistent and require keeping a TCP socket ` +
        `open with a receive buffer. On the ${device} with ${specs.ram}KB RAM, ` +
        `this leaves less memory for sensor processing and other tasks.`,
      guidingQuestion:
        `How much RAM does the WebSocket library use on ${device}? ` +
        `Would a request-response protocol (HTTP/CoAP) be more memory-efficient for your use case?`,
      category: 'memory',
    });
  }

  // =========================================================================
  // Rule 10: Software ↔ Hardware — Time-series data in wrong DB
  // =========================================================================
  if (database === 'MongoDB' && sensors.length > 0 && protocol !== 'HTTP') {
    issues.push({
      title: 'MongoDB for High-Frequency Sensor Data',
      severity: 'LOW',
      disciplines: ['Software', 'Hardware'],
      description:
        'MongoDB is a general-purpose document database. For high-frequency sensor ' +
        'data (temperature, pressure, etc.), a time-series database like InfluxDB or ' +
        'TimescaleDB is more efficient for writes and time-range queries.',
      guidingQuestion:
        'How often do your sensors send data? If it\'s more than once per second, ' +
        'have you benchmarked MongoDB\'s write performance vs. a time-series database?',
      category: 'architecture',
    });
  }

  // =========================================================================
  // Rule 11: Hardware ↔ Communication — BLE + MQTT incompatibility
  // =========================================================================
  if (protocol === 'BLE' && database && cloud) {
    issues.push({
      title: 'BLE Cannot Reach Cloud Directly',
      severity: 'HIGH',
      disciplines: ['Communication', 'Cloud'],
      description:
        'BLE (Bluetooth Low Energy) is a short-range protocol. It cannot connect ' +
        'directly to a cloud platform. You need a gateway device (phone, Raspberry Pi) ' +
        'to bridge BLE data to WiFi/Internet.',
      guidingQuestion:
        'What will serve as the BLE gateway to forward data to the cloud? ' +
        'How will the gateway handle reconnections and data buffering?',
      category: 'protocol',
    });
  }

  // =========================================================================
  // Rule 12: Firmware ↔ Cloud — OTA update strategy
  // =========================================================================
  if (specs && cloud && sensors.length > 0) {
    issues.push({
      title: 'Firmware Update Strategy for Deployed Devices',
      severity: 'LOW',
      disciplines: ['Firmware', 'Cloud'],
      description:
        'Once IoT devices are deployed in the field, updating firmware becomes a ' +
        'critical challenge. Without an OTA (Over-The-Air) update mechanism, ' +
        'bug fixes and security patches require physical access to every device.',
      guidingQuestion:
        'How will you update the firmware after deployment? ' +
        'Does your cloud platform support OTA updates? ' +
        'What happens if an OTA update fails mid-transfer?',
      category: 'architecture',
    });
  }

  // =========================================================================
  // Rule 13: Communication ↔ Power — High sampling rate + network
  // =========================================================================
  if (sensors.length >= 3 && powerSource.toLowerCase().includes('battery') && NETWORK_PROTOCOLS.includes(protocol)) {
    issues.push({
      title: 'Multiple Sensors + Frequent Network Transmissions on Battery',
      severity: 'HIGH',
      disciplines: ['Power Management', 'Communication', 'Hardware'],
      description:
        `Reading ${sensors.length} sensors and transmitting via ${protocol} on battery ` +
        `creates a conflict: sensors need frequent reads for accuracy, but each ` +
        `network transmission drains the battery. Batching data helps but adds latency.`,
      guidingQuestion:
        'What is the acceptable latency for your sensor data? ' +
        'Could you batch multiple sensor readings into a single transmission to save power?',
      category: 'power',
    });
  }

  // =========================================================================
  // Rule 14: Security ↔ Firmware — Hardcoded credentials
  // =========================================================================
  if (cloud && protocol && specs) {
    issues.push({
      title: 'Credential Management on IoT Device',
      severity: 'MEDIUM',
      disciplines: ['Security', 'Firmware'],
      description:
        'IoT devices need credentials to connect to WiFi and cloud services. ' +
        'Hardcoding these in firmware source code is a common security risk. ' +
        'If the device is physically accessible, credentials can be extracted.',
      guidingQuestion:
        'Where are your WiFi password and cloud API keys stored? ' +
        'Are they hardcoded in the firmware or stored in a secure element/encrypted flash?',
      category: 'security',
    });
  }

  return issues;
}

// ---------------------------------------------------------------------------
// Summary Statistics Helper
// ---------------------------------------------------------------------------

/** Returns a summary of issues grouped by severity and discipline */
export function getIssuesSummary(issues: InterdisciplinaryIssue[]) {
  const bySeverity = {
    HIGH: issues.filter(i => i.severity === 'HIGH').length,
    MEDIUM: issues.filter(i => i.severity === 'MEDIUM').length,
    LOW: issues.filter(i => i.severity === 'LOW').length,
  };

  // Count how often each discipline appears in issues
  const byDiscipline: Record<string, number> = {};
  issues.forEach(issue => {
    issue.disciplines.forEach(d => {
      byDiscipline[d] = (byDiscipline[d] || 0) + 1;
    });
  });

  // Count by category
  const byCategory: Record<string, number> = {};
  issues.forEach(issue => {
    byCategory[issue.category] = (byCategory[issue.category] || 0) + 1;
  });

  return {
    total: issues.length,
    bySeverity,
    byDiscipline,
    byCategory,
  };
}
