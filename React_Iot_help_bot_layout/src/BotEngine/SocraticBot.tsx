import { useState, useRef, useEffect, FormEvent } from 'react';
import Header from '../components/Header';
import ChatMessage from './ChatMessage';
import BotSidebar from './BotSidebar';
import { useProject } from '../context/ProjectContext';
import { botAPI } from '../services/api';
import type { ChatMessage as ChatMessageType } from '../types';

export default function SocraticBot() {
  const { currentProject } = useProject();
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [phase, setPhase] = useState('ideation');
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Welcome message on mount
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          role: 'assistant',
          content: currentProject
            ? `Welcome! I'm BridgeBot, your Socratic learning companion for IoT projects. I see you're working on "${currentProject.name}" with ${currentProject.device} and ${currentProject.protocol}.\n\nI won't give you direct answers — instead, I'll ask guiding questions to help you discover solutions and think critically about your system design.\n\nWhat challenge or question would you like to explore?`
            : `Welcome! I'm BridgeBot, your Socratic learning companion for interdisciplinary IoT projects.\n\nI won't give you direct answers — instead, I'll ask guiding questions to help you discover solutions yourself.\n\nTo get the best experience, set up a project first in "Project Setup". Or feel free to ask me about any IoT challenge!`,
          timestamp: new Date().toISOString(),
        },
      ]);
    }
  }, []);

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage: ChatMessageType = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    setError('');

    try {
      const response = await botAPI.chat(
        currentProject?._id || '',
        userMessage.content,
        sessionId || undefined
      );

      setSessionId(response.sessionId);
      setPhase(response.phase);

      const botMessage: ChatMessageType = {
        role: 'assistant',
        content: response.reply,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      setError((err as Error).message || 'Failed to get response from bot');
      // Add error message to chat
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: '⚠️ I encountered an error connecting to my thinking engine. Please check that the server is running and try again.',
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleNewSession = () => {
    setMessages([]);
    setSessionId(null);
    setPhase('ideation');
    setError('');
    // Re-trigger welcome message
    setMessages([
      {
        role: 'assistant',
        content: 'Starting a new conversation. What IoT challenge would you like to explore?',
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  return (
    <>
      <Header
        title="🤖 Socratic Bot"
        subtitle="AI-powered learning companion for IoT project guidance"
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Chat Panel (3/4 width on desktop) */}
        <div className="lg:col-span-3 bg-slate-800/30 border border-white/5 rounded-2xl flex flex-col" style={{ height: '70vh' }}>
          {/* Chat header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center text-sm">
                🤖
              </div>
              <div>
                <p className="text-sm font-semibold text-white">BridgeBot</p>
                <p className="text-xs text-slate-500">
                  {isTyping ? 'Thinking...' : 'Online • Socratic Mode'}
                </p>
              </div>
            </div>
            <button
              onClick={handleNewSession}
              className="text-xs text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg transition-colors"
            >
              + New Session
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-1">
            {messages.map((msg, idx) => (
              <ChatMessage key={idx} role={msg.role} content={msg.content} />
            ))}
            {isTyping && <ChatMessage role="assistant" content="" isTyping />}
            <div ref={messagesEndRef} />
          </div>

          {/* Error */}
          {error && (
            <div className="mx-5 mb-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg">
              {error}
            </div>
          )}

          {/* Input */}
          <form onSubmit={handleSend} className="p-4 border-t border-white/5">
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Describe your IoT challenge or answer the bot's question..."
                disabled={isTyping}
                className="flex-1 bg-slate-700/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isTyping || !input.trim()}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-xl font-medium text-sm hover:from-cyan-400 hover:to-blue-400 transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isTyping ? '...' : 'Send'}
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar (1/4 width on desktop) */}
        <div className="lg:col-span-1">
          <BotSidebar
            project={currentProject}
            sessionId={sessionId}
            messageCount={messages.length}
            detectedPhase={phase}
          />
        </div>
      </div>
    </>
  );
}
