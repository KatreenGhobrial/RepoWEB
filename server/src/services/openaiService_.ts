import OpenAI from 'openai';

// ---------------------------------------------------------------------------
// OpenAI client (initialised lazily so the module can be imported even when
// the env var is not yet set).
// ---------------------------------------------------------------------------
let client: OpenAI | null = null;

const getClient = (): OpenAI => {
  if (!client) {
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return client;
};

// ═══════════════════════════════════════════════════════════════════════════
// SOCRATIC  PROMPT  TREES
// ═══════════════════════════════════════════════════════════════════════════
// Each "tree" is a system-level instruction set that guides the LLM to ask
// Socratic questions instead of providing direct answers.  The tree is
// selected dynamically based on the detected project phase.
// ═══════════════════════════════════════════════════════════════════════════

const SOCRATIC_BASE_PROMPT = `
You are BridgeBot — a Socratic learning companion for interdisciplinary IoT projects.

## CORE RULES (NEVER BREAK THESE)
1. You NEVER give a direct solution or answer.
2. You ALWAYS respond with one or more guiding questions that lead the student
   to discover the answer themselves.
3. You encourage critical thinking about the FULL SYSTEM — hardware, firmware,
   software, cloud, security, power, cost, and user experience.
4. You adapt your language to the student's discipline but push them to
   consider other disciplines.
5. When a student describes a problem, you ask questions that help them
   narrow down the root cause layer by layer.
6. You identify imbalances between disciplines (e.g., too much focus on
   software while ignoring hardware constraints) and raise corrective
   questions.
7. Always respond in the SAME language the student writes in. If they write in
   Hebrew — answer in Hebrew.  If in English — answer in English.

## IoT-SPECIFIC KNOWLEDGE AREAS
You are an expert in these IoT domains and should probe students about them:
- Communication protocols: MQTT, CoAP, HTTP, WebSocket, BLE, LoRa, Zigbee
- Microcontrollers: ESP32, Arduino, Raspberry Pi, STM32
- Sensors & actuators: DHT22, BMP280, ultrasonic, servos, relays
- Power management: battery life, deep sleep, solar harvesting
- Cloud platforms: AWS IoT, Google Cloud IoT, Azure IoT Hub, Firebase
- Security: TLS, certificate pinning, OTA updates, edge encryption
- Data: time-series databases, MQTT brokers, data pipelines
- Latency, bandwidth, packet loss, QoS levels
`;

const PHASE_PROMPTS: Record<string, string> = {
  ideation: `
## CURRENT PHASE: Ideation
The team is in the early brainstorming phase. Your questions should:
- Help them define the problem clearly
- Challenge assumptions about what the system needs to do
- Ask about stakeholders and use cases
- Probe: "Who is the end user? What happens if this system fails?"
- Ask about environmental constraints (temperature, humidity, outdoor/indoor)
- Question scale: "How many devices? How much data per second?"
- Push them to think about feasibility: "What's the simplest version that solves the core problem?"
`,

  design: `
## CURRENT PHASE: Design
The team is designing the system architecture. Your questions should:
- Challenge architectural decisions: "Why did you choose this protocol over alternatives?"
- Probe integration points: "How will the sensor data get from the MCU to the cloud?"
- Ask about failure modes: "What happens when WiFi drops? When a sensor gives bad data?"
- Question power budget: "How long should the battery last? Did you calculate consumption?"
- Push security thinking: "Who can access this data? Is the channel encrypted?"
- Check component compatibility: "Does the MCU have enough GPIO pins/memory/flash?"
- Ask about data format and schema decisions
`,

  integration: `
## CURRENT PHASE: Integration
The team is connecting components together. Your questions should:
- Focus on interface mismatches: "Are the voltage levels compatible?"
- Probe communication issues: "What happens when the server doesn't respond?"
- Ask about timing: "How do you synchronize sensor readings with cloud updates?"
- Question error handling: "What does the firmware do when MQTT connection fails?"
- Push testing mindset: "How do you verify the sensor reading is correct?"
- Ask about data flow end-to-end: "Walk me through one data point from sensor to dashboard"
- Probe deployment: "How will you update firmware in the field?"
`,

  testing: `
## CURRENT PHASE: Testing
The team is testing and debugging. Your questions should:
- Focus on systematic debugging: "What have you already ruled out?"
- Ask about test coverage: "Have you tested edge cases? What about power failure during write?"
- Probe performance: "What's the actual latency? How does it compare to requirements?"
- Question reliability: "What happens under load? Have you stress-tested the API?"
- Ask about monitoring: "How would you know if the system fails in production?"
- Push for measurable results: "What metrics prove the system works correctly?"
- Check interoperability: "Does it work with different hardware revisions?"
`,

  reflection: `
## CURRENT PHASE: Reflection
The team is reflecting on the project. Your questions should:
- Ask about lessons learned: "What would you do differently if starting over?"
- Probe team dynamics: "Which discipline was underrepresented in decisions?"
- Question trade-offs: "What did you sacrifice for simplicity? Was it worth it?"
- Ask about scalability: "Could this system handle 100x the devices?"
- Push business thinking: "What would it cost to manufacture this at scale?"
- Encourage documentation: "Could someone else replicate your system from your docs?"
- Ask about sustainability: "How long can this system run without maintenance?"
`,
};

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

// ═══════════════════════════════════════════════════════════════════════════
// FALLBACK  SOCRATIC  ENGINE
// ═══════════════════════════════════════════════════════════════════════════
// When OpenAI is unavailable (quota exceeded, network error, etc.),
// use a rule-based Socratic engine that still asks intelligent IoT questions.
// ═══════════════════════════════════════════════════════════════════════════

const FALLBACK_QUESTIONS: Record<string, string[]> = {
  power: [
    "What is the power consumption of your device during active transmission vs. sleep mode? Have you measured the actual current draw?",
    "Have you calculated how long your battery will last given your sensor sampling frequency and transmission intervals?",
    "Could you use deep sleep mode between sensor readings to extend battery life? What would be the trade-off?",
    "Is your power supply providing a stable voltage? Have you checked for voltage drops during WiFi transmission spikes?",
  ],
  connectivity: [
    "What happens to your sensor data when the network connection is temporarily lost? Do you have a local buffer?",
    "Have you considered the overhead of your chosen protocol? For example, HTTP headers add significant bytes compared to MQTT's lightweight packets.",
    "What QoS level are you using for your MQTT messages? How does that affect reliability vs. bandwidth?",
    "How does your device handle reconnection after a network failure? Is there an exponential backoff strategy?",
  ],
  sensor: [
    "How are you validating your sensor readings? What happens if the sensor returns an obviously wrong value (like -40°C indoors)?",
    "What is the sampling rate of your sensor? Is it appropriate for the physical phenomenon you're measuring?",
    "Have you considered sensor drift over time? How would you calibrate the sensor in the field?",
    "Are you applying any filtering (moving average, Kalman filter) to smooth out noisy sensor data?",
  ],
  architecture: [
    "Walk me through the complete data flow: from sensor reading to database storage. Where are the potential bottlenecks?",
    "What happens if your cloud server goes down? Does the edge device have any local intelligence?",
    "How would your system scale if you needed to add 100 more sensor nodes? What would break first?",
    "Have you considered security at each layer? Is the data encrypted in transit AND at rest?",
  ],
  general: [
    "That's an interesting challenge. Can you break down the problem into smaller parts? Which layer do you think is most likely causing the issue — hardware, firmware, network, or cloud?",
    "What debugging steps have you already tried? What did you observe at each step?",
    "If you had to explain this problem to a teammate from a different discipline (e.g., a software engineer explaining to a hardware engineer), how would you describe it?",
    "What assumptions are you making about your system? Which of those assumptions could you test or verify?",
    "Before looking for a solution, can you clearly define what 'working correctly' looks like? What are the specific success criteria?",
  ],
};

function getFallbackReply(userMessage: string, messageCount: number = 0): string {
  const msg = userMessage.toLowerCase();
  
  let category = 'general';
  if (msg.includes('battery') || msg.includes('power') || msg.includes('voltage') || msg.includes('current') || msg.includes('sleep') || msg.includes('charging')) {
    category = 'power';
  } else if (msg.includes('wifi') || msg.includes('disconnect') || msg.includes('mqtt') || msg.includes('http') || msg.includes('network') || msg.includes('connect') || msg.includes('protocol')) {
    category = 'connectivity';
  } else if (msg.includes('architecture') || msg.includes('design') || msg.includes('cloud') || msg.includes('server') || msg.includes('database') || msg.includes('scale')) {
    // Check architecture before sensor so 'database' doesn't get caught by 'data'
    category = 'architecture';
  } else if (msg.includes('sensor') || msg.includes('reading') || msg.includes('temperature') || msg.includes('humidity') || msg.includes('data') || msg.includes('value') || msg.includes('dht') || msg.includes('bmp')) {
    category = 'sensor';
  }
  
  const questions = FALLBACK_QUESTIONS[category];
  // Use message count to deterministically cycle through questions, preventing exact repeats.
  // Since each round adds 2 messages (user + bot), divide by 2.
  const turnNumber = Math.floor(messageCount / 2);
  const index = turnNumber % questions.length;
  
  return questions[index];
}

// ═══════════════════════════════════════════════════════════════════════════
// PUBLIC API
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Send a chat message to the Socratic bot.
 * Falls back to rule-based Socratic engine if OpenAI is unavailable.
 */
export async function socraticChat(
  messages: { role: 'user' | 'assistant' | 'system'; content: string }[],
  phase: string = 'ideation',
  projectContext: string = ''
): Promise<string> {
  try {
    const openai = getClient();

    const phasePrompt = PHASE_PROMPTS[phase] || PHASE_PROMPTS.ideation;

    const systemMessage = `${SOCRATIC_BASE_PROMPT}\n${phasePrompt}\n${
      projectContext
        ? `\n## PROJECT CONTEXT\n${projectContext}\n`
        : ''
    }`;

    const fullMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemMessage },
      ...messages.map((m) => ({
        role: m.role as 'user' | 'assistant' | 'system',
        content: m.content,
      })),
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: fullMessages,
      temperature: 0.7,
      max_tokens: 1024,
    });

    return completion.choices[0]?.message?.content || 'I need a moment to think about that. Could you rephrase your question?';
  } catch (error: any) {
    console.warn('⚠️  OpenAI API error, using fallback Socratic engine:', error?.code || error?.message || 'unknown');
    
    // Use the last user message for context-aware fallback
    const lastUserMsg = messages.filter(m => m.role === 'user').pop();
    return getFallbackReply(lastUserMsg?.content || '', messages.length);
  }
}

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
    const openai = getClient();

    const userMessage = `Analyze this IoT architecture for conflicts:\n${JSON.stringify(architecture, null, 2)}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: CONFLICT_DETECTION_PROMPT },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.3,
      max_tokens: 2048,
    });

    const raw = completion.choices[0]?.message?.content || '[]';

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
    const { device, protocol, database, powerSource, sensors, cloudPlatform } = architecture;
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
    const I2C_SENSORS = ['bmp280', 'bmp180', 'bme280', 'sht30', 'sht31', 'mpu6050', 'oled', 'ads1115'];
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
export async function analyzeArchitecture(architecture: {
  device: string;
  protocol: string;
  database: string;
  powerSource: string;
  sensors: string[];
  cloudPlatform: string;
  components: Array<{ name: string; type: string; description: string }>;
}): Promise<string> {
  try {
    const openai = getClient();

    const userMessage = `Review this IoT project architecture:\n${JSON.stringify(architecture, null, 2)}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: ARCHITECTURE_ANALYSIS_PROMPT },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.5,
      max_tokens: 1500,
    });

    return completion.choices[0]?.message?.content || 'Could you describe your architecture in more detail?';
  } catch (error: any) {
    console.warn('⚠️  OpenAI API error in architecture analysis, using fallback:', error?.code || error?.message);
    
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

