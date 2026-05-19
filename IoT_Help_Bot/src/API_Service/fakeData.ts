// ==========================================
// Fake Data for IoT Help Bot
// ==========================================

// --- IoT Devices (4 devices) ---
export interface IoTDevice {
    id: number;
    name: string;
    type: string;
    location: string;
    status: 'online' | 'offline';
    battery: number;
    lastSeen: string;
    icon: string;
}

export const devices: IoTDevice[] = [
    {
        id: 1,
        name: 'Living Room Thermostat',
        type: 'Thermostat',
        location: 'Living Room',
        status: 'online',
        battery: 92,
        lastSeen: '2 min ago',
        icon: '🌡️',
    },
    {
        id: 2,
        name: 'Front Door Camera',
        type: 'Security Camera',
        location: 'Entrance',
        status: 'online',
        battery: 78,
        lastSeen: 'Just now',
        icon: '📷',
    },
    {
        id: 3,
        name: 'Garden Sprinkler',
        type: 'Smart Sprinkler',
        location: 'Backyard',
        status: 'offline',
        battery: 15,
        lastSeen: '3 hours ago',
        icon: '💧',
    },
    {
        id: 4,
        name: 'Bedroom Smart Light',
        type: 'Smart Light',
        location: 'Bedroom',
        status: 'online',
        battery: 100,
        lastSeen: '1 min ago',
        icon: '💡',
    },
];

// --- Dashboard Stats ---
export interface DashboardStat {
    label: string;
    value: string;
    change: string;
    trend: 'up' | 'down';
    icon: string;
}

export const dashboardStats: DashboardStat[] = [
    { label: 'Total Devices', value: '4', change: '+1 this week', trend: 'up', icon: '📡' },
    { label: 'Active Devices', value: '3', change: '75% online', trend: 'up', icon: '✅' },
    { label: 'Active Alerts', value: '2', change: '-1 from yesterday', trend: 'down', icon: '🔔' },
    { label: 'Bot Queries Today', value: '18', change: '+5 from yesterday', trend: 'up', icon: '🤖' },
];

// --- Support Tickets ---
export interface SupportTicket {
    id: number;
    title: string;
    device: string;
    status: 'open' | 'in-progress' | 'resolved';
    priority: 'low' | 'medium' | 'high';
    date: string;
}

export const supportTickets: SupportTicket[] = [
    { id: 101, title: 'Sprinkler not responding', device: 'Garden Sprinkler', status: 'open', priority: 'high', date: '2026-05-18' },
    { id: 102, title: 'Camera feed lagging', device: 'Front Door Camera', status: 'in-progress', priority: 'medium', date: '2026-05-17' },
    { id: 103, title: 'Thermostat calibration off', device: 'Living Room Thermostat', status: 'resolved', priority: 'low', date: '2026-05-15' },
    { id: 104, title: 'Light schedule not syncing', device: 'Bedroom Smart Light', status: 'open', priority: 'medium', date: '2026-05-18' },
    { id: 105, title: 'Battery low warning', device: 'Garden Sprinkler', status: 'resolved', priority: 'high', date: '2026-05-14' },
];

// --- Bot Chat Messages ---
export interface ChatMessage {
    id: number;
    sender: 'user' | 'bot';
    text: string;
    time: string;
}

export const chatMessages: ChatMessage[] = [
    { id: 1, sender: 'bot', text: 'Hello! I\'m your IoT Help Bot. How can I assist you today?', time: '10:00 AM' },
    { id: 2, sender: 'user', text: 'My garden sprinkler isn\'t working.', time: '10:01 AM' },
    { id: 3, sender: 'bot', text: 'I can see your Garden Sprinkler is currently offline. Its battery is at 15%. Would you like me to run diagnostics?', time: '10:01 AM' },
    { id: 4, sender: 'user', text: 'Yes please, run diagnostics.', time: '10:02 AM' },
    { id: 5, sender: 'bot', text: 'Running diagnostics... The issue appears to be low battery. I recommend charging the device. Shall I create a support ticket?', time: '10:02 AM' },
];

// --- Recent Activity ---
export interface ActivityEvent {
    id: number;
    device: string;
    action: string;
    time: string;
    icon: string;
}

export const recentActivity: ActivityEvent[] = [
    { id: 1, device: 'Front Door Camera', action: 'Motion detected at entrance', time: '2 min ago', icon: '📷' },
    { id: 2, device: 'Living Room Thermostat', action: 'Temperature set to 23°C', time: '15 min ago', icon: '🌡️' },
    { id: 3, device: 'Bedroom Smart Light', action: 'Turned on automatically', time: '30 min ago', icon: '💡' },
    { id: 4, device: 'Garden Sprinkler', action: 'Went offline — low battery', time: '3 hours ago', icon: '💧' },
    { id: 5, device: 'Front Door Camera', action: 'Firmware updated to v3.2', time: '1 day ago', icon: '📷' },
];

// --- IoT Services (2 services) ---
export interface IoTService {
    id: number;
    title: string;
    description: string;
    icon: string;
    features: string[];
}

export const iotServices: IoTService[] = [
    {
        id: 1,
        title: 'Smart Home Monitoring',
        description: 'Real-time monitoring and control of all your IoT devices from a single dashboard. Get instant alerts, track device health, and automate routines effortlessly.',
        icon: '🏠',
        features: [
            'Real-time device status tracking',
            'Automated alerts & notifications',
            'Device health analytics',
            'Custom automation rules',
        ],
    },
    {
        id: 2,
        title: 'AI-Powered Help Bot',
        description: 'Our intelligent chatbot diagnoses device issues, suggests fixes, and manages support tickets automatically — available 24/7 to keep your smart home running smoothly.',
        icon: '🤖',
        features: [
            '24/7 instant device diagnostics',
            'Automated troubleshooting guides',
            'Smart ticket creation & tracking',
            'Natural language support',
        ],
    },
];

// --- Team Members ---
export interface TeamMember {
    id: number;
    name: string;
    role: string;
    bio: string;
    initials: string;
}

export const teamMembers: TeamMember[] = [
    { id: 1, name: 'Katreen Ghobrial', role: 'Full-Stack Developer', bio: 'Passionate about building smart IoT solutions and modern web applications.', initials: 'KG' },
    { id: 2, name: 'Ester Peretz', role: 'IoT Engineer', bio: 'Specializes in embedded systems and device connectivity protocols.', initials: 'EP' },
    { id: 3, name: 'Yohad Ben Baruch', role: 'AI / ML Engineer', bio: 'Develops the intelligent chatbot and predictive analytics models.', initials: 'YB' },
    { id: 4, name: 'Liel Etinger', role: 'UX Designer', bio: 'Creates intuitive interfaces that make complex IoT data accessible.', initials: 'LE' },
];

// --- Testimonials ---
export interface Testimonial {
    id: number;
    name: string;
    text: string;
    rating: number;
}

export const testimonials: Testimonial[] = [
    { id: 1, name: 'Michael B.', text: 'The IoT Help Bot diagnosed my thermostat issue in seconds. Incredible!', rating: 5 },
    { id: 2, name: 'Jessica L.', text: 'Managing all my smart home devices from one dashboard is a game changer.', rating: 5 },
    { id: 3, name: 'Robert K.', text: 'The 24/7 bot support means I never have to wait for help. Highly recommend!', rating: 4 },
];

// --- Home Stats ---
export const homeStats = [
    { label: 'Devices Managed', value: '10K+' },
    { label: 'Happy Users', value: '2.5K+' },
    { label: 'Uptime', value: '99.9%' },
    { label: 'Avg Response', value: '<2s' },
];

// --- Features for Home Page ---
export interface Feature {
    icon: string;
    title: string;
    description: string;
}

export const homeFeatures: Feature[] = [
    { icon: '📡', title: 'Real-Time Monitoring', description: 'Track all your IoT devices in real-time with instant status updates and alerts.' },
    { icon: '🤖', title: 'AI Help Bot', description: 'Get instant diagnostics and troubleshooting from our intelligent chatbot.' },
    { icon: '🔒', title: 'Secure & Private', description: 'Enterprise-grade encryption keeps your smart home data safe and private.' },
    { icon: '📊', title: 'Smart Analytics', description: 'Gain insights from device usage patterns and optimize your smart home.' },
];

// --- FAQ for Contact Page ---
export interface FAQ {
    question: string;
    answer: string;
}

export const faqs: FAQ[] = [
    { question: 'How do I connect a new device?', answer: 'Go to your Dashboard and click "Add Device". Follow the on-screen pairing instructions. Most devices connect within 30 seconds.' },
    { question: 'What devices are supported?', answer: 'We support thermostats, security cameras, smart lights, sprinkler systems, locks, and most Zigbee/Z-Wave compatible devices.' },
    { question: 'Is my data secure?', answer: 'Yes! All data is encrypted end-to-end using AES-256 encryption. We never share your data with third parties.' },
    { question: 'How does the Help Bot work?', answer: 'Our AI-powered bot analyzes your device data in real-time. Simply describe your issue and it will diagnose problems, suggest fixes, and create support tickets if needed.' },
];

// --- Pricing Tiers ---
export interface PricingTier {
    name: string;
    price: string;
    period: string;
    features: string[];
    highlighted: boolean;
}

export const pricingTiers: PricingTier[] = [
    {
        name: 'Free',
        price: '$0',
        period: '/month',
        features: ['Up to 3 devices', 'Basic monitoring', 'Community support', 'Email alerts'],
        highlighted: false,
    },
    {
        name: 'Pro',
        price: '$12',
        period: '/month',
        features: ['Unlimited devices', 'AI Help Bot access', 'Priority support', 'Advanced analytics', 'Custom automations'],
        highlighted: true,
    },
    {
        name: 'Enterprise',
        price: '$49',
        period: '/month',
        features: ['Everything in Pro', 'Dedicated account manager', 'Custom integrations', 'SLA guarantee', 'API access'],
        highlighted: false,
    },
];
