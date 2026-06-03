import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { useProject } from '../context/ProjectContext';
import { taskAPI } from '../services/api';
import type { Task } from '../types';

export default function Dashboard() {
  const { user } = useAuth();
  const { projects, currentProject, setCurrentProject } = useProject();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentProject?._id) {
      loadTasks();
    }
  }, [currentProject?._id]);

  const loadTasks = async () => {
    if (!currentProject?._id) return;
    setLoading(true);
    try {
      const data = await taskAPI.listByProject(currentProject._id);
      setTasks(data);
    } catch {
      // silent fail — dashboard still shows other info
    } finally {
      setLoading(false);
    }
  };

  const todoTasks = tasks.filter((t) => t.status === 'todo');
  const inProgressTasks = tasks.filter((t) => t.status === 'in-progress');
  const doneTasks = tasks.filter((t) => t.status === 'done');
  const taskProgress = tasks.length ? Math.round((doneTasks.length / tasks.length) * 100) : 0;

  const quickActions = [
    { label: 'Chat with Bot', icon: '🤖', path: '/socratic-bot', color: 'from-cyan-500 to-blue-500' },
    { label: 'Detect Conflicts', icon: '⚡', path: '/detect-conflict', color: 'from-purple-500 to-pink-500' },
    { label: 'Manage Tasks', icon: '📋', path: '/tasks-team', color: 'from-amber-500 to-orange-500' },
    { label: 'IoT Library', icon: '📚', path: '/library', color: 'from-emerald-500 to-teal-500' },
  ];

  return (
    <>
      <Header
        title="📊 Dashboard"
        subtitle={currentProject ? `Project: ${currentProject.name}` : 'Select a project to get started'}
      />

      {/* Project Selector */}
      <div className="mb-6">
        <label className="block text-xs text-slate-400 mb-2">Active Project</label>
        <select
          value={currentProject?._id || ''}
          onChange={(e) => {
            const proj = projects.find((p) => p._id === e.target.value) || null;
            setCurrentProject(proj);
          }}
          className="bg-slate-700/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/50 max-w-sm"
        >
          <option value="">Select a project...</option>
          {projects.map((p) => (
            <option key={p._id} value={p._id}>{p.name}</option>
          ))}
        </select>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-800/30 border border-white/5 rounded-xl p-5">
          <p className="text-xs text-slate-500 mb-1">Projects</p>
          <p className="text-2xl font-bold text-white">{projects.length}</p>
        </div>
        <div className="bg-slate-800/30 border border-white/5 rounded-xl p-5">
          <p className="text-xs text-slate-500 mb-1">Total Tasks</p>
          <p className="text-2xl font-bold text-white">{tasks.length}</p>
        </div>
        <div className="bg-slate-800/30 border border-white/5 rounded-xl p-5">
          <p className="text-xs text-slate-500 mb-1">Completed</p>
          <p className="text-2xl font-bold text-emerald-400">{doneTasks.length}</p>
        </div>
        <div className="bg-slate-800/30 border border-white/5 rounded-xl p-5">
          <p className="text-xs text-slate-500 mb-1">Progress</p>
          <p className="text-2xl font-bold text-cyan-400">{taskProgress}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Task Progress Bar */}
          {currentProject && (
            <div className="bg-slate-800/30 border border-white/5 rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-slate-300 mb-3">📈 Task Progress</h3>
              <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${taskProgress}%` }}
                />
              </div>
              <div className="flex justify-between mt-2 text-xs text-slate-500">
                <span>{doneTasks.length} done</span>
                <span>{inProgressTasks.length} in progress</span>
                <span>{todoTasks.length} todo</span>
              </div>
            </div>
          )}

          {/* Task Columns */}
          {currentProject && (
            <div className="grid grid-cols-3 gap-3">
              {[
                { title: 'To Do', items: todoTasks, color: 'text-slate-400', icon: '📝' },
                { title: 'In Progress', items: inProgressTasks, color: 'text-amber-400', icon: '🔄' },
                { title: 'Done', items: doneTasks, color: 'text-emerald-400', icon: '✅' },
              ].map((col) => (
                <div key={col.title}>
                  <h4 className={`text-xs font-semibold ${col.color} mb-2 flex items-center gap-1`}>
                    <span>{col.icon}</span> {col.title} ({col.items.length})
                  </h4>
                  <div className="space-y-2">
                    {col.items.slice(0, 5).map((task) => (
                      <div
                        key={task._id}
                        className="bg-slate-800/50 border border-white/5 rounded-lg p-3 text-xs"
                      >
                        <p className="text-white font-medium truncate">{task.title}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                            task.priority === 'high' ? 'bg-red-500/10 text-red-400' :
                            task.priority === 'medium' ? 'bg-amber-500/10 text-amber-400' :
                            'bg-blue-500/10 text-blue-400'
                          }`}>
                            {task.priority}
                          </span>
                          <span className="text-slate-500">{task.discipline}</span>
                        </div>
                      </div>
                    ))}
                    {col.items.length === 0 && (
                      <p className="text-xs text-slate-600 text-center py-4">No tasks</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {!currentProject && (
            <div className="bg-slate-800/30 border border-white/5 rounded-2xl p-12 text-center">
              <span className="text-4xl">📂</span>
              <h3 className="text-lg font-semibold text-slate-300 mt-4">No Project Selected</h3>
              <p className="text-sm text-slate-500 mt-2 mb-4">
                Select a project above or create a new one to see your dashboard.
              </p>
              <Link
                to="/project-setup"
                className="inline-block bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-2.5 rounded-xl font-medium text-sm"
              >
                Create Project
              </Link>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Quick Actions */}
          <div className="bg-slate-800/30 border border-white/5 rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-slate-300 mb-3">⚡ Quick Actions</h3>
            <div className="space-y-2">
              {quickActions.map((action) => (
                <Link
                  key={action.label}
                  to={action.path}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group"
                >
                  <div className={`w-8 h-8 bg-gradient-to-br ${action.color} rounded-lg flex items-center justify-center text-sm group-hover:scale-110 transition-transform`}>
                    {action.icon}
                  </div>
                  <span className="text-sm text-slate-300 group-hover:text-white transition-colors">
                    {action.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Project Info */}
          {currentProject && (
            <div className="bg-slate-800/30 border border-white/5 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-slate-300 mb-3">📋 Project Info</h3>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Phase</span>
                  <span className="text-cyan-400 capitalize">{currentProject.phase}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Device</span>
                  <span className="text-white">{currentProject.device}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Protocol</span>
                  <span className="text-white">{currentProject.protocol}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status</span>
                  <span className={`capitalize ${
                    currentProject.status === 'active' ? 'text-emerald-400' :
                    currentProject.status === 'completed' ? 'text-blue-400' : 'text-slate-400'
                  }`}>
                    {currentProject.status}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* User Role */}
          <div className="bg-gradient-to-br from-cyan-500/5 to-blue-500/5 border border-cyan-500/10 rounded-2xl p-5">
            <p className="text-xs text-slate-400 mb-1">Logged in as</p>
            <p className="text-sm font-semibold text-white">{user?.username}</p>
            <p className="text-xs text-cyan-400 capitalize mt-0.5">{user?.role}</p>
          </div>
        </div>
      </div>
    </>
  );
}
