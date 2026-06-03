import type { Project } from '../types';

interface BotSidebarProps {
  project: Project | null;
  sessionId: string | null;
  messageCount: number;
  detectedPhase: string;
}

const PHASE_LABELS: Record<string, { label: string; emoji: string; color: string }> = {
  ideation: { label: 'Ideation', emoji: '💡', color: 'text-amber-400 bg-amber-400/10' },
  design: { label: 'Design', emoji: '📐', color: 'text-blue-400 bg-blue-400/10' },
  integration: { label: 'Integration', emoji: '🔗', color: 'text-purple-400 bg-purple-400/10' },
  testing: { label: 'Testing', emoji: '🧪', color: 'text-emerald-400 bg-emerald-400/10' },
  reflection: { label: 'Reflection', emoji: '🪞', color: 'text-pink-400 bg-pink-400/10' },
};

export default function BotSidebar({ project, sessionId, messageCount, detectedPhase }: BotSidebarProps) {
  const phase = PHASE_LABELS[detectedPhase] || PHASE_LABELS.ideation;

  return (
    <div className="space-y-4">
      {/* Project Context */}
      <div className="bg-slate-800/50 border border-white/5 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
          <span>⚙️</span> Project Context
        </h3>
        {project ? (
          <div className="space-y-2.5">
            <div>
              <p className="text-xs text-slate-500">Project Name</p>
              <p className="text-sm font-medium text-white">{project.name}</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-xs text-slate-500">Device</p>
                <p className="text-sm text-slate-300">{project.device}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Protocol</p>
                <p className="text-sm text-slate-300">{project.protocol}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Database</p>
                <p className="text-sm text-slate-300">{project.database}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Power</p>
                <p className="text-sm text-slate-300">{project.powerSource}</p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-500">No project selected. Create one in Project Setup.</p>
        )}
      </div>

      {/* Current Phase */}
      <div className="bg-slate-800/50 border border-white/5 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
          <span>📍</span> Current Phase
        </h3>
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${phase.color}`}>
          <span>{phase.emoji}</span>
          {phase.label}
        </div>
        {/* Phase progression */}
        <div className="flex items-center gap-1 mt-3">
          {Object.entries(PHASE_LABELS).map(([key, val]) => (
            <div
              key={key}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                key === detectedPhase ? 'bg-cyan-400' : 'bg-slate-700'
              }`}
              title={val.label}
            />
          ))}
        </div>
      </div>

      {/* Session Info */}
      <div className="bg-slate-800/50 border border-white/5 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
          <span>💬</span> Session Info
        </h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-xs text-slate-500">Messages</span>
            <span className="text-sm text-white font-medium">{messageCount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-slate-500">Session</span>
            <span className="text-xs text-slate-400 font-mono">
              {sessionId ? sessionId.slice(-8) : 'None'}
            </span>
          </div>
        </div>
      </div>

      {/* Bot Info */}
      <div className="bg-gradient-to-br from-cyan-500/5 to-blue-500/5 border border-cyan-500/10 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-cyan-400 mb-2">🧠 Socratic Method</h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          BridgeBot will NOT give direct answers. Instead, it asks guiding questions
          to help you discover solutions yourself and develop critical thinking
          about IoT system design.
        </p>
      </div>
    </div>
  );
}
