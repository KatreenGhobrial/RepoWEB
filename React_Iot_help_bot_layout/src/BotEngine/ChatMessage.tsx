interface ChatMessageProps {
  role: 'user' | 'assistant' | 'system';
  content: string;
  isTyping?: boolean;
}

export default function ChatMessage({ role, content, isTyping }: ChatMessageProps) {
  if (role === 'system') {
    return (
      <div className="flex justify-center my-3">
        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm px-4 py-2 rounded-lg max-w-lg text-center">
          📢 {content}
        </div>
      </div>
    );
  }

  const isBot = role === 'assistant';

  return (
    <div className={`flex ${isBot ? 'justify-start' : 'justify-end'} mb-4`}>
      <div className={`max-w-[80%] ${isBot ? 'order-2' : 'order-1'}`}>
        {/* Sender label */}
        <p className={`text-xs mb-1 ${isBot ? 'text-cyan-400/70' : 'text-slate-500'} ${isBot ? 'text-left' : 'text-right'}`}>
          {isBot ? '🤖 BridgeBot' : '👤 You'}
        </p>

        {/* Message bubble */}
        <div
          className={`rounded-2xl px-5 py-3.5 ${
            isBot
              ? 'bg-slate-800/80 border border-white/5 text-slate-200'
              : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
          } ${isTyping ? 'animate-pulse' : ''}`}
        >
          {isTyping ? (
            <div className="flex items-center gap-1.5 py-1">
              <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          ) : (
            <div className="text-sm leading-relaxed whitespace-pre-wrap">{content}</div>
          )}
        </div>
      </div>
    </div>
  );
}
