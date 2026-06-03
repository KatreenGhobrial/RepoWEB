import { useState, useEffect } from 'react';
import Header from '../components/Header';
import { useProject } from '../context/ProjectContext';
import { botAPI } from '../services/api';
import type { ChatSession } from '../types';

export default function MonitorPanel() {
  const { currentProject } = useProject();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentProject?._id) {
      loadHistory();
    }
  }, [currentProject?._id]);

  const loadHistory = async () => {
    if (!currentProject?._id) return;
    setLoading(true);
    setError('');
    try {
      const history = await botAPI.getHistory(currentProject._id);
      setSessions(history);
    } catch (err) {
      setError((err as Error).message || 'Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const viewSession = async (sessionId: string) => {
    try {
      const session = await botAPI.getSession(sessionId);
      setSelectedSession(session);
    } catch (err) {
      setError((err as Error).message || 'Failed to load session');
    }
  };

  // Compute stats
  const totalMessages = sessions.reduce((sum, s) => sum + s.messages.length, 0);
  const avgReflection = sessions.length
    ? (sessions.reduce((sum, s) => sum + (s.reflectionScore || 0), 0) / sessions.length).toFixed(1)
    : '0';
  const phaseMap: Record<string, number> = {};
  sessions.forEach((s) => {
    phaseMap[s.detectedPhase] = (phaseMap[s.detectedPhase] || 0) + 1;
  });
  const issuesSet = new Set<string>();
  sessions.forEach((s) => s.detectedIssues?.forEach((i) => issuesSet.add(i)));

  return (
    <>
      <Header
        title="📊 Monitor Panel"
        subtitle="Review past bot sessions, detected issues, and learning analytics"
      />

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Sessions', value: sessions.length, icon: '💬', color: 'cyan' },
          { label: 'Total Messages', value: totalMessages, icon: '📝', color: 'blue' },
          { label: 'Avg Reflection', value: avgReflection, icon: '🧠', color: 'purple' },
          { label: 'Unique Issues', value: issuesSet.size, icon: '⚠️', color: 'amber' },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`bg-${stat.color}-500/5 border border-${stat.color}-500/20 rounded-xl p-4`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span>{stat.icon}</span>
              <span className="text-xs text-slate-400">{stat.label}</span>
            </div>
            <p className={`text-2xl font-bold text-${stat.color}-400`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm mb-6">
          ⚠️ {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sessions List */}
        <div className="lg:col-span-1 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-slate-300">Sessions</h3>
            <button
              onClick={loadHistory}
              disabled={loading || !currentProject?._id}
              className="text-xs text-cyan-400 hover:text-cyan-300 disabled:text-slate-600"
            >
              {loading ? 'Loading...' : '↻ Refresh'}
            </button>
          </div>

          {!currentProject && (
            <div className="bg-slate-800/30 border border-white/5 rounded-xl p-6 text-center">
              <p className="text-sm text-slate-500">Select a project to view sessions</p>
            </div>
          )}

          {currentProject && sessions.length === 0 && !loading && (
            <div className="bg-slate-800/30 border border-white/5 rounded-xl p-6 text-center">
              <span className="text-3xl">📭</span>
              <p className="text-sm text-slate-500 mt-2">No sessions yet</p>
            </div>
          )}

          {sessions.map((session) => (
            <button
              key={session._id}
              onClick={() => viewSession(session.sessionId)}
              className={`w-full text-left bg-slate-800/30 border rounded-xl p-4 transition-all hover:bg-slate-800/60 ${
                selectedSession?.sessionId === session.sessionId
                  ? 'border-cyan-500/50 ring-1 ring-cyan-500/20'
                  : 'border-white/5'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-slate-500">
                  #{session.sessionId.slice(-6)}
                </span>
                <span className="text-xs text-slate-500">
                  {new Date(session.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400">
                  {session.detectedPhase}
                </span>
                <span className="text-xs text-slate-500">
                  {session.messages.length} msgs
                </span>
              </div>
              {session.detectedIssues?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {session.detectedIssues.slice(0, 2).map((issue, i) => (
                    <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400">
                      {issue}
                    </span>
                  ))}
                  {session.detectedIssues.length > 2 && (
                    <span className="text-xs text-slate-500">+{session.detectedIssues.length - 2}</span>
                  )}
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Session Detail */}
        <div className="lg:col-span-2">
          {selectedSession ? (
            <div className="bg-slate-800/30 border border-white/5 rounded-2xl overflow-hidden">
              {/* Session Header */}
              <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    Session #{selectedSession.sessionId.slice(-6)}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {new Date(selectedSession.createdAt).toLocaleString()} • Phase: {selectedSession.detectedPhase}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Reflection Score</span>
                  <span className="text-sm font-bold text-cyan-400">
                    {selectedSession.reflectionScore || 0}/10
                  </span>
                </div>
              </div>

              {/* Detected Issues */}
              {selectedSession.detectedIssues?.length > 0 && (
                <div className="px-5 py-3 border-b border-white/5 bg-amber-500/5">
                  <p className="text-xs text-amber-400 font-medium mb-1.5">Detected Issues:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedSession.detectedIssues.map((issue, i) => (
                      <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {issue}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Messages */}
              <div className="p-5 max-h-[50vh] overflow-y-auto space-y-3">
                {selectedSession.messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                          : 'bg-slate-700/50 border border-white/5 text-slate-200'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                      <p className={`text-xs mt-1.5 ${msg.role === 'user' ? 'text-white/50' : 'text-slate-500'}`}>
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-slate-800/30 border border-white/5 rounded-2xl p-12 text-center">
              <span className="text-5xl">📋</span>
              <h3 className="text-lg font-semibold text-slate-300 mt-4">Select a Session</h3>
              <p className="text-sm text-slate-500 mt-2">
                Click on a session from the list to view its full conversation log and analytics.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Phase Distribution */}
      {Object.keys(phaseMap).length > 0 && (
        <div className="mt-6 bg-slate-800/30 border border-white/5 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Phase Distribution</h3>
          <div className="flex items-end gap-3 h-32">
            {Object.entries(phaseMap).map(([phase, count]) => {
              const maxCount = Math.max(...Object.values(phaseMap));
              const height = maxCount > 0 ? (count / maxCount) * 100 : 0;
              return (
                <div key={phase} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-xs text-white font-bold">{count}</span>
                  <div
                    className="w-full bg-gradient-to-t from-cyan-500 to-blue-500 rounded-t-lg transition-all"
                    style={{ height: `${height}%`, minHeight: '8px' }}
                  />
                  <span className="text-xs text-slate-500 capitalize">{phase}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
