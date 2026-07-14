/**
 * Architecture Analysis Service.
 * Evaluates IoT architectures for potential conflicts (e.g., protocol vs power).
 * Utilizes a rule-based engine and AI fallback to provide Socratic feedback to students.
 */
import { getClient } from './openaiService';
import { GoogleGenerativeAI } from '@google/generative-ai';

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

export interface ArchitectureLayer {
  name: string;
  status: 'healthy' | 'warning' | 'critical';
  score: number;
  details: string;
}

export interface ArchitectureAnalysisResult {
  architecture: ArchitectureInput;
  healthScore: number;
  dataFlow: string[];
  layers: ArchitectureLayer[];
  issues: InterdisciplinaryIssue[];
  summary: any;
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

export function analyzeArchitecture(architecture: ArchitectureInput): ArchitectureAnalysisResult {
  const { device, protocol, database, powerSource, sensors, cloudPlatform } = architecture;

  // Run interdisciplinary analysis
  const issues = analyzeInterdisciplinaryIssues(architecture);
  const summary = getIssuesSummary(issues);

  // Calculate a simple health score based on issues found
  const highPenalty = summary.bySeverity.HIGH * 15;
  const mediumPenalty = summary.bySeverity.MEDIUM * 8;
  const lowPenalty = summary.bySeverity.LOW * 3;
  const healthScore = Math.max(0, 100 - highPenalty - mediumPenalty - lowPenalty);

  // Build data flow based on input
  const dataFlow = [];
  if (sensors && sensors.length > 0) dataFlow.push(sensors.join(' + '));
  if (device) dataFlow.push(`${device} (MCU/Processing)`);
  if (protocol) dataFlow.push(`${protocol} (Communication)`);
  if (cloudPlatform) dataFlow.push(`${cloudPlatform} (Cloud)`);
  if (database) dataFlow.push(`${database} (Storage)`);
  if (dataFlow.length === 0) dataFlow.push('No components defined');

  // Generate simple layer analysis
  const layers: ArchitectureLayer[] = [
    {
      name: 'Sensor Layer',
      status: (sensors.length > 4 ? 'warning' : 'healthy') as 'healthy' | 'warning' | 'critical',
      score: Math.max(50, 95 - sensors.length * 5),
      details: `${sensors.length} sensor(s) configured: ${sensors.join(', ') || 'none'}`,
    },
    {
      name: 'Firmware Layer',
      status: (summary.byCategory['memory'] ? 'warning' : 'healthy') as 'healthy' | 'warning' | 'critical',
      score: summary.byCategory['memory'] ? 55 : 85,
      details: `Running on ${device || 'unknown'}. ${summary.byCategory['memory'] ? 'Memory constraints detected.' : 'No memory issues detected.'}`,
    },
    {
      name: 'Communication Layer',
      status: (summary.byCategory['protocol'] ? 'warning' : 'healthy') as 'healthy' | 'warning' | 'critical',
      score: summary.byCategory['protocol'] ? 50 : 80,
      details: `Using ${protocol || 'unknown protocol'}. ${summary.byCategory['protocol'] ? 'Protocol issues detected.' : 'Protocol looks compatible.'}`,
    },
    {
      name: 'Power Layer',
      status: (summary.byCategory['power'] ? 'critical' : 'healthy') as 'healthy' | 'warning' | 'critical',
      score: summary.byCategory['power'] ? 35 : 90,
      details: `Power source: ${powerSource || 'unknown'}. ${summary.byCategory['power'] ? 'Power management issues detected.' : 'Power setup looks adequate.'}`,
    },
    {
      name: 'Cloud/Database Layer',
      status: (summary.byCategory['architecture'] ? 'warning' : 'healthy') as 'healthy' | 'warning' | 'critical',
      score: summary.byCategory['architecture'] ? 60 : 85,
      details: `${cloudPlatform || 'No cloud'} + ${database || 'No DB'}`,
    },
  ];

  return {
    architecture,
    healthScore,
    dataFlow,
    layers,
    issues,
    summary,
  };
}

// ---------------------------------------------------------------------------
// Context-aware conflict detection prompt
// ---------------------------------------------------------------------------
const CONFLICT_DETECTION_PROMPT = `
You are an IoT architecture analysis engine.  Given a project's architecture
(device, protocol, database, power source, sensors, cloud platform), you must
identify potential conflicts, risks, and incompatibilities.

For each issue found, return a JSON array with objects like:
{
  "title": "Short title of the conflict",
  "level": "HIGH" | "MEDIUM" | "LOW",
  "reason": "Explanation of WHY this is a problem",
  "suggestion": "A guiding QUESTION (not a solution) that helps the team think about this"
}

Focus on real IoT engineering concerns:
- Protocol vs power trade-offs
- Memory/storage constraints
- Security vulnerabilities
- Sensor accuracy vs sampling rate
- Network reliability
- Firmware update mechanisms
- Data consistency under poor connectivity

Return ONLY valid JSON.  No markdown, no explanation outside the JSON.
`;

// ---------------------------------------------------------------------------
// Architecture analysis prompt
// ---------------------------------------------------------------------------
const ARCHITECTURE_ANALYSIS_PROMPT = `
You are an IoT system architect reviewer.  Analyze the given architecture and
provide Socratic feedback — NOT direct recommendations, but probing questions
that help the team improve their design.

Structure your response as:
1. **Strengths**: What looks good about this architecture? (brief)
2. **Probing Questions**: 3-5 deep questions about potential issues
3. **Cross-discipline Considerations**: Questions that push the team to think
   beyond their primary discipline

Keep the tone supportive and curious, like a wise mentor.
Always respond in the same language the input is written in.
`;

/**
 * Detect architectural conflicts using AI.
 * Falls back to rule-based detection if OpenAI is unavailable.
 */
export async function detectConflictsAI(architecture: {
    device: string;
    protocol: string;
    database: string;
    powerSource: string;
    sensors: string[];
    cloudPlatform: string;
}): Promise<Array<{
    title: string;
    level: string;
    reason: string;
    suggestion: string;
}>> {
    try {
        const genAI = getClient();
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const userMessage = `Analyze this IoT architecture for conflicts:\n${JSON.stringify(architecture, null, 2)}`;

        const result = await model.generateContent({
            systemInstruction: CONFLICT_DETECTION_PROMPT,
            contents: [{ role: 'user', parts: [{ text: userMessage }] }],
            generationConfig: { temperature: 0.3 },
        });

        const raw = result.response.text() || '[]';

        try {
            // Strip potential markdown code fences
            const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            return JSON.parse(cleaned);
        } catch {
            return [
                {
                    title: 'Analysis completed',
                    level: 'LOW',
                    reason: 'The AI analysis returned a non-standard format.',
                    suggestion: 'Have you considered reviewing your architecture manually as well?',
                },
            ];
        }
    } catch (error: any) {
        if (error?.code !== 'invalid_api_key') {
            console.warn('⚠️  OpenAI API error in conflict detection, using rule-based fallback:', error?.code || error?.message);
        }

        // ═══════════════════════════════════════════════════════════════════════
        // Rule-based conflict detection fallback (expanded)
        // Covers 12+ common IoT architecture conflicts
        // ═══════════════════════════════════════════════════════════════════════
        const conflicts: Array<{ title: string; level: string; reason: string; suggestion: string }> = [];
        const {device, protocol, database, powerSource, sensors, cloudPlatform} = architecture;
        const deviceLower = (device || '').toLowerCase();
        const protocolLower = (protocol || '').toLowerCase();
        const powerLower = (powerSource || '').toLowerCase();
        const dbLower = (database || '').toLowerCase();
        const cloudLower = (cloudPlatform || '').toLowerCase();

        // Rule 1: HTTP + Battery = high power consumption
        if (protocolLower === 'http' && powerLower.includes('battery')) {
            conflicts.push({
                title: 'High Power Consumption: HTTP over Battery',
                level: 'HIGH',
                reason: 'HTTP has significant overhead (headers, TCP handshake, TLS) compared to lightweight IoT protocols. On battery power, this can dramatically reduce device lifetime.',
                suggestion: 'Have you calculated the energy cost per HTTP request vs. an MQTT publish? What would happen to your battery life if you switched to MQTT or CoAP?',
            });
        }

        // Rule 2: ESP32/Arduino with many sensors
        if ((deviceLower.includes('esp32') || deviceLower.includes('arduino')) && sensors && sensors.length > 3) {
            conflicts.push({
                title: 'Resource Constraints: Multiple Sensors on MCU',
                level: 'MEDIUM',
                reason: `Running ${sensors.length} sensors on a ${device} may strain GPIO pins, ADC channels, and available memory, especially when combined with WiFi operations.`,
                suggestion: `Have you mapped out which GPIO pins each sensor uses? Are there any pin conflicts or shared bus issues (I2C address collisions)?`,
            });
        }

        // Rule 3: Arduino Uno + WiFi (no built-in WiFi)
        if (deviceLower.includes('arduino') && (protocolLower === 'mqtt' || protocolLower === 'http' || protocolLower === 'coap')) {
            conflicts.push({
                title: 'Missing WiFi Module: Arduino',
                level: 'HIGH',
                reason: `${device} does not have built-in WiFi. Using ${protocol} requires an additional WiFi shield or module (ESP8266, etc.), adding hardware complexity.`,
                suggestion: 'What WiFi module are you planning to use with the Arduino? Have you considered using an ESP32 instead, which has built-in WiFi and Bluetooth?',
            });
        }

        // Rule 4: Battery + general power management
        if (powerLower.includes('battery')) {
            conflicts.push({
                title: 'Battery Management Strategy',
                level: 'MEDIUM',
                reason: 'Battery-powered IoT devices require careful power management including sleep modes, optimized transmission schedules, and efficient sensor polling.',
                suggestion: 'What is your deep sleep strategy? How often does the device wake up, sample sensors, transmit data, and go back to sleep?',
            });
        }

        // Rule 5: Raspberry Pi + Battery = impractical
        if (deviceLower.includes('raspberry') && powerLower.includes('battery')) {
            conflicts.push({
                title: 'Raspberry Pi on Battery Power',
                level: 'HIGH',
                reason: 'Raspberry Pi consumes 2.5-5W continuously. Unlike MCUs, it cannot enter deep sleep. Battery operation is impractical for most deployments.',
                suggestion: 'Have you measured the actual power draw of your Raspberry Pi with all peripherals connected? How many hours would a typical battery last?',
            });
        }

        // Rule 6: CoAP + MongoDB = mismatch
        if (protocolLower === 'coap' && dbLower.includes('mongo')) {
            conflicts.push({
                title: 'CoAP Protocol with MongoDB Storage',
                level: 'MEDIUM',
                reason: 'CoAP is designed for constrained devices and typically pairs with time-series databases (InfluxDB, TimescaleDB). MongoDB document structure adds unnecessary overhead for simple sensor readings.',
                suggestion: 'What data format are your CoAP messages using? Have you considered how many writes per second MongoDB needs to handle from your CoAP devices?',
            });
        }

        // Rule 7: WebSocket on constrained MCU
        if (protocolLower === 'websocket' && (deviceLower.includes('esp32') || deviceLower.includes('esp8266') || deviceLower.includes('arduino'))) {
            conflicts.push({
                title: 'WebSocket on Memory-Constrained MCU',
                level: 'MEDIUM',
                reason: `WebSocket requires a persistent TCP connection with receive buffers. On ${device}, this consumes significant RAM that may conflict with sensor data processing.`,
                suggestion: `How much free RAM do you have after opening the WebSocket connection on ${device}? Would a stateless protocol (HTTP/CoAP) be more memory-efficient?`,
            });
        }

        // Rule 8: Firebase + MQTT = incompatible
        if (cloudLower.includes('firebase') && protocolLower === 'mqtt') {
            conflicts.push({
                title: 'Firebase Does Not Support MQTT Natively',
                level: 'MEDIUM',
                reason: 'Firebase uses WebSocket/HTTP-based protocols. MQTT messages need a bridge service (like a Node.js server) to forward data to Firebase.',
                suggestion: 'Are you planning to build a bridge between MQTT and Firebase? Or would switching to Firebase\'s native REST API or WebSocket be simpler for your architecture?',
            });
        }

        // Rule 9: No TLS with cloud platform = security risk
        if (cloudPlatform && (protocolLower === 'mqtt' || protocolLower === 'http') && !protocolLower.includes('tls') && !protocolLower.includes('ssl')) {
            conflicts.push({
                title: 'Data Transmission Security to Cloud',
                level: 'MEDIUM',
                reason: `Sending data from ${device} to ${cloudPlatform} via ${protocol} without TLS encryption exposes sensor data to potential interception on the network.`,
                suggestion: `Is your ${protocol} connection using TLS/SSL encryption? What would be the impact if someone intercepted your sensor data?`,
            });
        }

        // Rule 10: Multiple sensors + battery + network = triple drain
        if (sensors && sensors.length >= 3 && powerLower.includes('battery') && (protocolLower === 'mqtt' || protocolLower === 'http' || protocolLower === 'websocket')) {
            conflicts.push({
                title: 'Triple Power Drain: Sensors + Network + Battery',
                level: 'HIGH',
                reason: `Running ${sensors.length} sensors and transmitting via ${protocol} on battery creates competing demands: sensors need frequent reads for accuracy, but each network transmission drains significant energy.`,
                suggestion: 'Could you batch multiple sensor readings into a single transmission? What is the minimum acceptable data freshness for your use case?',
            });
        }

        // Rule 11: I2C sensor address conflicts
        const i2cFound = (sensors || []).filter(s => I2C_SENSORS.some(ic => s.toLowerCase().includes(ic)));
        if (i2cFound.length >= 2) {
            conflicts.push({
                title: `Potential I2C Address Conflict: ${i2cFound.join(', ')}`,
                level: 'MEDIUM',
                reason: `${i2cFound.length} sensors share the I2C bus. If two sensors have the same default address, they cannot coexist without address modification or a multiplexer.`,
                suggestion: `Have you checked the default I2C addresses of ${i2cFound.join(' and ')}? Do any of them conflict? Would you need a TCA9548A multiplexer?`,
            });
        }

        // Rule 12: STM32 + high-level cloud = steep learning curve
        if (deviceLower.includes('stm32') && cloudPlatform) {
            conflicts.push({
                title: 'STM32 Cloud Integration Complexity',
                level: 'LOW',
                reason: `STM32 development typically uses lower-level C/HAL libraries. Integrating with ${cloudPlatform} requires TLS, JSON parsing, and network stack — all of which need significant flash and RAM.`,
                suggestion: `Does your STM32 variant have enough flash and RAM for a TLS stack + ${protocol} client + JSON library? Have you evaluated the available SDKs?`,
            });
        }

        // Default if no specific conflicts found
        if (conflicts.length === 0) {
            conflicts.push({
                title: 'Architecture Looks Reasonable',
                level: 'LOW',
                reason: 'No obvious conflicts detected with the current configuration, but there may be subtle issues.',
                suggestion: 'Have you stress-tested your system under realistic conditions? What happens when multiple sensors report simultaneously?',
            });
        }

        return conflicts;
    }
}

/**
 * Analyze an architecture and return Socratic feedback.
 * Falls back to a template response if OpenAI is unavailable.
 */
export async function analyzeArchitectureAI(architecture: {
    device: string;
    protocol: string;
    database: string;
    powerSource: string;
    sensors: string[];
    cloudPlatform: string;
    components: Array<{ name: string; type: string; description: string }>;
}): Promise<string> {
    try {
        const genAI = getClient();
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const userMessage = `Review this IoT project architecture:\n${JSON.stringify(architecture, null, 2)}`;

        const result = await model.generateContent({
            systemInstruction: ARCHITECTURE_ANALYSIS_PROMPT,
            contents: [{ role: 'user', parts: [{ text: userMessage }] }],
            generationConfig: { temperature: 0.5, maxOutputTokens: 1500 },
        });

        return result.response.text() || 'Could you describe your architecture in more detail?';
    } catch (error: any) {
        console.warn('⚠️  Gemini API error in architecture analysis, using fallback:', error?.code || error?.message);

        return `## Architecture Review for ${architecture.device} + ${architecture.protocol}

**Strengths**: You've selected specific components, which shows intentional design thinking.

**Probing Questions**:
1. You chose **${architecture.protocol}** as your communication protocol. What led you to this choice over alternatives? How does it handle unreliable network conditions?
2. Your device is **${architecture.device}** — have you verified it has sufficient memory and processing power for your sensor data processing needs?
3. With **${architecture.powerSource}** as your power source, what is your estimated device uptime? Have you measured actual power consumption?
4. You're using **${architecture.database}** for data storage. How will you handle data synchronization when the device is offline?
5. With ${architecture.sensors?.length || 0} sensors, how are you managing the sampling schedule to avoid bus contention?

**Cross-discipline Considerations**:
- How will a mechanical engineer on your team understand the data format your software produces?
- What happens to the physical enclosure design if you need to add another sensor later?`;
    }
}
