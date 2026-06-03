import { useState, useEffect, FormEvent } from 'react';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { mentorAPI } from '../services/api';
import type { Project, Feedback, MentorDashboardData } from '../types';

export default function MentorDashboard() {
  const { user } = useAuth();
  const [dashData, setDashData] = useState<MentorDashboardData | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Feedback form
  const [fbContent, setFbContent] = useState('');
  const [fbCategory, setFbCategory] = useState('general');
  const [fbRating, setFbRating] = useState(5);
  const [fbSaving, setFbSaving] = useState(false);

  // Broadcast
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [broadcastResult, setBroadcastResult] = useState('');

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    if (selectedProject) loadFeedback(selectedProject);
  }, [selectedProject]);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [dash, projs] = await Promise.all([
        mentorAPI.getDashboard(),
        mentorAPI.getProjects(),
      ]);
      setDashData(dash);
      setProjects(projs);
    } catch (err) {
      setError((err as Error).message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const loadFeedback = async (projectId: string) => {
    try {
      const fb = await mentorAPI.getFeedback(projectId);
      setFeedback(fb);
    } catch {
      // ignore
    }
  };

  const handleFeedback = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;
    setFbSaving(true);
    try {
      await mentorAPI.giveFeedback({
        projectId: selectedProject,
        content: fbContent,
        category: fbCategory,
        rating: fbRating,
      });
      setFbContent('');
      await loadFeedback(selectedProject);
    } catch (err) {
      setError((err as Error).message || 'Failed to send feedback');
    } finally {
      setFbSaving(false);
    }
  };

  const handleBroadcast = async () => {
    if (!broadcastMsg.trim()) return;
    try {
      const res = await mentorAPI.broadcast(broadcastMsg);
      setBroadcastResult(`Sent to ${res.sentTo.length} projects`);
      setBroadcastMsg('');
    } catch (err) {
      setError((err as Error).message || 'Broadcast failed');
    }
  };

  // Access control
  if (user?.role !== 'mentor' && user?.role !== 'admin') {
    return (
      <>
        <Header title="🎓 Mentor Dashboard" subtitle="Access restricted" />
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-12 text-center">
          <span className="text-4xl">🔒</span>
          <h3 className="text-lg font-semibold text-red-400 mt-4">Access Denied</h3>
          <p className="text-sm text-slate-400 mt-2">Only mentors and admins can access this page.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="🎓 Mentor Dashboard" subtitle="Oversee student projects and provide guidance" />

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm mb-6">⚠️ {error}</div>
      )}

      {/* Stats */}
      {dashData && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Active Projects', value: dashData.activeProjects, icon: '📂', color: 'cyan' },
            { label: 'Total Students', value: dashData.totalStudents, icon: '👥', color: 'blue' },
            { label: 'Tasks Completed', value: dashData.completedTasks, icon: '✅', color: 'emerald' },
            { label: 'Avg Reflection', value: dashData.avgReflection.toFixed(1), icon: '🧠', color: 'purple' },
          ].map((stat) => (
            <div key={stat.label} className="bg-slate-800/30 border border-white/5 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <span>{stat.icon}</span>
                <span className="text-xs text-slate-400">{stat.label}</span>
              </div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Projects List */}
        <div className="lg:col-span-1 space-y-3">
          <h3 className="text-sm font-semibold text-slate-300 mb-2">📂 Student Projects</h3>
          {projects.map((proj) => (
            <button
              key={proj._id}
              onClick={() => setSelectedProject(proj._id)}
              className={`w-full text-left bg-slate-800/30 border rounded-xl p-4 transition-all hover:bg-slate-800/60 ${
                selectedProject === proj._id ? 'border-cyan-500/50 ring-1 ring-cyan-500/20' : 'border-white/5'
              }`}
            >
              <p className="text-sm font-medium text-white">{proj.name}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400">{proj.phase}</span>
                <span className="text-xs text-slate-500">{proj.device}</span>
              </div>
            </button>
          ))}
          {projects.length === 0 && !loading && (
            <p className="text-sm text-slate-500 text-center py-8">No projects found</p>
          )}
        </div>

        {/* Feedback + Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Feedback Form */}
          {selectedProject && (
            <form onSubmit={handleFeedback} className="bg-slate-800/30 border border-white/5 rounded-2xl p-6 space-y-4">
              <h3 className="text-base font-semibold text-white">💬 Give Feedback</h3>
              <textarea
                value={fbContent}
                onChange={(e) => setFbContent(e.target.value)}
                rows={3}
                placeholder="Write your feedback for this team..."
                className="w-full bg-slate-700/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 resize-none"
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Category</label>
                  <select value={fbCategory} onChange={(e) => setFbCategory(e.target.value)} className="w-full bg-slate-700/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white">
                    <option value="general">General</option>
                    <option value="architecture">Architecture</option>
                    <option value="collaboration">Collaboration</option>
                    <option value="technical">Technical</option>
                    <option value="milestone">Milestone</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Rating</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setFbRating(n)}
                        className={`text-lg ${n <= fbRating ? 'text-amber-400' : 'text-slate-600'}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <button type="submit" disabled={fbSaving} className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-xl font-semibold text-sm disabled:opacity-50 shadow-lg shadow-cyan-500/20">
                {fbSaving ? 'Sending...' : '📨 Send Feedback'}
              </button>
            </form>
          )}

          {/* Feedback History */}
          {selectedProject && feedback.length > 0 && (
            <div className="bg-slate-800/30 border border-white/5 rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-slate-300 mb-3">📋 Feedback History</h3>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {feedback.map((fb) => (
                  <div key={fb._id} className="bg-slate-700/30 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-cyan-400 capitalize">{fb.category}</span>
                      <span className="text-xs text-slate-500">{new Date(fb.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-slate-300">{fb.content}</p>
                    <div className="flex gap-0.5 mt-1">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <span key={n} className={`text-xs ${n <= fb.rating ? 'text-amber-400' : 'text-slate-700'}`}>★</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Broadcast */}
          <div className="bg-gradient-to-br from-purple-500/5 to-pink-500/5 border border-purple-500/10 rounded-2xl p-6">
            <h3 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
              <span>📢</span> Broadcast to All Teams
            </h3>
            <div className="flex gap-3">
              <input
                type="text"
                value={broadcastMsg}
                onChange={(e) => setBroadcastMsg(e.target.value)}
                placeholder="Type a message to send to all project teams..."
                className="flex-1 bg-slate-700/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-400/50"
              />
              <button onClick={handleBroadcast} className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-5 py-2.5 rounded-xl font-medium text-sm">
                Send
              </button>
            </div>
            {broadcastResult && <p className="text-xs text-emerald-400 mt-2">✅ {broadcastResult}</p>}
          </div>

          {!selectedProject && (
            <div className="bg-slate-800/30 border border-white/5 rounded-2xl p-12 text-center">
              <span className="text-4xl">👈</span>
              <h3 className="text-lg font-semibold text-slate-300 mt-4">Select a Project</h3>
              <p className="text-sm text-slate-500 mt-2">Choose a student project from the list to view details and provide feedback.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
