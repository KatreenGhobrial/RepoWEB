import OpenAI from 'openai';

// ---------------------------------------------------------------------------
// OpenAI client (initialised lazily so the module can be imported even when
// the env var is not yet set).
// ---------------------------------------------------------------------------
let client: OpenAI | null = null;

export const getClient = (): OpenAI => {
    if (!client) {
        client = new OpenAI({
            baseURL: process.env.OPENAI_BASE_URL,
            apiKey: "ollama",
            maxRetries: 2,
            timeout: 600000,
            defaultHeaders: {
                "ngrok-skip-browser-warning": "true",
            }
        });
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
You are BridgeBot — a highly practical troubleshooting assistant for interdisciplinary IoT projects.

## CORE RULES (NEVER BREAK THESE)
1. You NEVER give the final direct solution immediately, but you DO ask highly practical, to-the-point diagnostic questions.
2. When a student describes a problem (e.g. "the device disconnects"), respond with a direct, practical question to check the most likely physical or software cause (e.g., "Is the cable connected securely?", "Is the power supply providing enough current?").
3. Avoid overly philosophical or vague questions. Focus on actionable debugging steps across the full system (hardware, firmware, network, cloud).
4. Guide the student to narrow down the root cause layer by layer through focused inquiry.
5. Always respond in the SAME language the student writes in. If they write in Hebrew — answer in Hebrew. If in English — answer in English.

## IoT-SPECIFIC KNOWLEDGE AREAS
You are an expert in these IoT domains and should probe students about practical checks in:
- Communication protocols: MQTT, CoAP, HTTP, WebSocket, BLE, LoRa, Zigbee
- Microcontrollers: ESP32, Arduino, Raspberry Pi, STM32
- Sensors & actuators: Wiring, I2C addresses, DHT22, BMP280, pull-up resistors
- Power management: Battery life, voltage drops, stable power supplies
- Cloud platforms: AWS IoT, Google Cloud IoT, Azure IoT Hub, Firebase
- Security & Network: Latency, WiFi stability, packet loss, TLS
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
            {role: 'system', content: systemMessage},
            ...messages.map((m) => ({
                role: m.role as 'user' | 'assistant' | 'system',
                content: m.content,
            })),
        ];

        const completion = await openai.chat.completions.create({
            model: 'gpt-oss:20b',
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
