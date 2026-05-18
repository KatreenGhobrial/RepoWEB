import { useState } from 'react';
import { dashboardStats, devices, supportTickets, recentActivity, chatMessages } from '../data/fakeData';
import type { ChatMessage } from '../data/fakeData';

export default function Dashboard({ user }: { user: any }) {
    const [messages, setMessages] = useState<ChatMessage[]>(chatMessages);
    const [input, setInput] = useState('');

    const handleSendMessage = () => {
        if (!input.trim()) return;

        const userMsg: ChatMessage = {
            id: messages.length + 1,
            sender: 'user',
            text: input,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        const botMsg: ChatMessage = {
            id: messages.length + 2,
            sender: 'bot',
            text: getBotReply(input),
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages(prev => [...prev, userMsg, botMsg]);
        setInput('');
    };

    const getBotReply = (msg: string): string => {
        const lower = msg.toLowerCase();
        if (lower.includes('hello') || lower.includes('hi')) return 'Hello! How can I help you with your IoT devices today?';
        if (lower.includes('device') || lower.includes('status')) return `You have ${devices.length} devices registered. ${devices.filter(d => d.status === 'online').length} are currently online.`;
        if (lower.includes('help') || lower.includes('issue')) return 'I can help diagnose device issues. Which device are you having trouble with?';
        if (lower.includes('sprinkler')) return 'Your Garden Sprinkler is currently offline with 15% battery. I recommend charging it soon.';
        if (lower.includes('camera')) return 'Your Front Door Camera is online and functioning normally.';
        return 'I understand. Let me look into that for you. Is there anything specific about your devices you need help with?';
    };

    const statusColor = (status: string) => {
        switch (status) {
            case 'online': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
            case 'offline': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            case 'open': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
            case 'in-progress': return 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400';
            case 'resolved': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const priorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'text-red-500';
            case 'medium': return 'text-amber-500';
            case 'low': return 'text-emerald-500';
            default: return 'text-gray-500';
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Welcome Header */}
            <div className="mb-8 animate-fade-in-up">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Welcome back, <span className="bg-gradient-to-r from-sky-500 to-teal-400 bg-clip-text text-transparent">{user?.name?.split(' ')[0] || 'User'}</span>
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Here's your smart home overview.</p>
            </div>

            {/* ==========================================
                Stats Cards
               ========================================== */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {dashboardStats.map((stat, i) => (
                    <div
                        key={i}
                        className="bg-white dark:bg-zinc-800 rounded-2xl p-5 border border-gray-100 dark:border-zinc-700
                                   hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 animate-fade-in-up"
                        style={{ animationDelay: `${i * 0.1}s` }}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-2xl">{stat.icon}</span>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${stat.trend === 'up' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>
                                {stat.change}
                            </span>
                        </div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* ==========================================
                    Device List
                   ========================================== */}
                <div className="lg:col-span-2 bg-white dark:bg-zinc-800 rounded-2xl p-6 border border-gray-100 dark:border-zinc-700 animate-fade-in-up stagger-2">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <span>📡</span> My Devices
                    </h2>
                    <div className="space-y-3">
                        {devices.map((device) => (
                            <div
                                key={device.id}
                                className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-zinc-700/50
                                           hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors duration-200"
                            >
                                <div className="flex items-center gap-4">
                                    <span className="text-2xl">{device.icon}</span>
                                    <div>
                                        <div className="font-semibold text-gray-900 dark:text-white text-sm">{device.name}</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">{device.location} • {device.lastSeen}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {/* Battery indicator */}
                                    <div className="hidden sm:flex items-center gap-1.5">
                                        <div className="w-16 h-2 rounded-full bg-gray-200 dark:bg-zinc-600 overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 ${device.battery > 50 ? 'bg-emerald-400' : device.battery > 20 ? 'bg-amber-400' : 'bg-red-400'}`}
                                                style={{ width: `${device.battery}%` }}
                                            />
                                        </div>
                                        <span className="text-xs text-gray-500 dark:text-gray-400 w-8">{device.battery}%</span>
                                    </div>
                                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColor(device.status)}`}>
                                        {device.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ==========================================
                    Recent Activity
                   ========================================== */}
                <div className="bg-white dark:bg-zinc-800 rounded-2xl p-6 border border-gray-100 dark:border-zinc-700 animate-fade-in-up stagger-3">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <span>⏱️</span> Recent Activity
                    </h2>
                    <div className="space-y-4">
                        {recentActivity.map((event) => (
                            <div key={event.id} className="flex gap-3">
                                <div className="shrink-0 w-8 h-8 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center text-sm">
                                    {event.icon}
                                </div>
                                <div className="min-w-0">
                                    <div className="text-sm text-gray-900 dark:text-white font-medium truncate">{event.action}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">{event.device} • {event.time}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* ==========================================
                    Bot Chat Widget
                   ========================================== */}
                <div className="bg-white dark:bg-zinc-800 rounded-2xl border border-gray-100 dark:border-zinc-700 flex flex-col h-[420px] animate-fade-in-up stagger-4">
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-zinc-700 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-teal-400 flex items-center justify-center text-white text-sm font-bold">
                            🤖
                        </div>
                        <div>
                            <div className="font-bold text-gray-900 dark:text-white text-sm">IoT Help Bot</div>
                            <div className="text-xs text-emerald-500">Online</div>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed
                                    ${msg.sender === 'user'
                                        ? 'bg-sky-500 text-white rounded-br-md'
                                        : 'bg-gray-100 dark:bg-zinc-700 text-gray-900 dark:text-white rounded-bl-md'
                                    }`}>
                                    <p>{msg.text}</p>
                                    <p className={`text-[10px] mt-1 ${msg.sender === 'user' ? 'text-sky-200' : 'text-gray-400 dark:text-zinc-400'}`}>
                                        {msg.time}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Input */}
                    <div className="px-4 py-3 border-t border-gray-100 dark:border-zinc-700">
                        <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                placeholder="Ask the bot anything..."
                                className="flex-1 px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-zinc-700 text-gray-900 dark:text-white text-sm
                                           focus:outline-none focus:ring-2 focus:ring-sky-400 transition-all"
                            />
                            <button
                                type="submit"
                                className="px-5 py-2.5 bg-gradient-to-r from-sky-500 to-teal-400 text-white rounded-xl font-medium text-sm
                                           hover:shadow-lg hover:shadow-sky-500/25 transition-all duration-200 cursor-pointer"
                            >
                                Send
                            </button>
                        </form>
                    </div>
                </div>

                {/* ==========================================
                    Support Tickets
                   ========================================== */}
                <div className="bg-white dark:bg-zinc-800 rounded-2xl p-6 border border-gray-100 dark:border-zinc-700 animate-fade-in-up stagger-5">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <span>🎫</span> Support Tickets
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
                                    <th className="pb-3 font-medium">ID</th>
                                    <th className="pb-3 font-medium">Issue</th>
                                    <th className="pb-3 font-medium">Priority</th>
                                    <th className="pb-3 font-medium">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-zinc-700">
                                {supportTickets.map(ticket => (
                                    <tr key={ticket.id} className="hover:bg-gray-50 dark:hover:bg-zinc-700/50 transition-colors">
                                        <td className="py-3 text-gray-500 dark:text-gray-400 font-mono">#{ticket.id}</td>
                                        <td className="py-3">
                                            <div className="font-medium text-gray-900 dark:text-white">{ticket.title}</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">{ticket.device}</div>
                                        </td>
                                        <td className="py-3">
                                            <span className={`font-medium text-xs ${priorityColor(ticket.priority)}`}>
                                                {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                                            </span>
                                        </td>
                                        <td className="py-3">
                                            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColor(ticket.status)}`}>
                                                {ticket.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
