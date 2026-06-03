import { useState, useEffect, FormEvent } from 'react';
import Header from '../components/Header';
import { useProject } from '../context/ProjectContext';
import { taskAPI } from '../services/api';
import type { Task } from '../types';

const PRIORITY_STYLES: Record<string, string> = {
  high: 'bg-red-500/10 text-red-400 border-red-500/20',
  medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  low: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
};

export default function TasksTeam() {
  const { currentProject } = useProject();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  // Form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [discipline, setDiscipline] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [saving, setSaving] = useState(false);

  // Filter
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  useEffect(() => {
    if (currentProject?._id) loadTasks();
  }, [currentProject?._id]);

  const loadTasks = async () => {
    if (!currentProject?._id) return;
    setLoading(true);
    try {
      const data = await taskAPI.listByProject(currentProject._id);
      setTasks(data);
    } catch (err) {
      setError((err as Error).message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentProject?._id) return;
    setSaving(true);
    setError('');
    try {
      const newTask = await taskAPI.create({
        project: currentProject._id,
        title,
        description,
        assignedTo,
        priority,
        discipline,
        dueDate: dueDate || null,
      });
      setTasks((prev) => [...prev, newTask]);
      setShowForm(false);
      setTitle('');
      setDescription('');
      setAssignedTo('');
      setPriority('medium');
      setDiscipline('');
      setDueDate('');
    } catch (err) {
      setError((err as Error).message || 'Failed to create task');
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (taskId: string, status: Task['status']) => {
    try {
      const updated = await taskAPI.update(taskId, { status });
      setTasks((prev) => prev.map((t) => (t._id === taskId ? updated : t)));
    } catch (err) {
      setError((err as Error).message || 'Failed to update task');
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      await taskAPI.delete(taskId);
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
    } catch (err) {
      setError((err as Error).message || 'Failed to delete task');
    }
  };

  const filtered = tasks.filter((t) => {
    if (filterStatus !== 'all' && t.status !== filterStatus) return false;
    if (filterPriority !== 'all' && t.priority !== filterPriority) return false;
    return true;
  });

  const todoTasks = filtered.filter((t) => t.status === 'todo');
  const inProgressTasks = filtered.filter((t) => t.status === 'in-progress');
  const doneTasks = filtered.filter((t) => t.status === 'done');

  const inputClass = 'w-full bg-slate-700/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/50';

  if (!currentProject) {
    return (
      <>
        <Header title="📋 Tasks & Team" subtitle="Manage interdisciplinary project tasks" />
        <div className="bg-slate-800/30 border border-white/5 rounded-2xl p-12 text-center">
          <span className="text-4xl">📂</span>
          <h3 className="text-lg font-semibold text-slate-300 mt-4">No Project Selected</h3>
          <p className="text-sm text-slate-500 mt-2">Please select or create a project in Project Setup first.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header
        title="📋 Tasks & Team"
        subtitle={`Managing tasks for: ${currentProject.name}`}
      />

      {/* Actions Bar */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-5 py-2.5 rounded-xl font-medium text-sm hover:from-cyan-400 hover:to-blue-400 transition-all shadow-lg shadow-cyan-500/20"
        >
          {showForm ? '✕ Cancel' : '+ New Task'}
        </button>

        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="bg-slate-700/50 border border-white/10 rounded-lg px-3 py-2 text-xs text-white">
          <option value="all">All Status</option>
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="done">Done</option>
        </select>

        <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className="bg-slate-700/50 border border-white/10 rounded-lg px-3 py-2 text-xs text-white">
          <option value="all">All Priority</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <span className="text-xs text-slate-500 ml-auto">{filtered.length} tasks</span>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm mb-4">⚠️ {error}</div>
      )}

      {/* Create Form */}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-slate-800/30 border border-white/5 rounded-2xl p-6 mb-6 space-y-4">
          <h3 className="text-base font-semibold text-white">Create New Task</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Title *</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Task title" className={inputClass} required />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Assigned To</label>
              <input type="text" value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} placeholder="Username or email" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Priority</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value as Task['priority'])} className={inputClass}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Discipline</label>
              <select value={discipline} onChange={(e) => setDiscipline(e.target.value)} className={inputClass}>
                <option value="">Select...</option>
                <option value="Software">Software</option>
                <option value="Hardware">Hardware</option>
                <option value="Electrical">Electrical</option>
                <option value="Network">Network</option>
                <option value="Data">Data</option>
                <option value="Security">Security</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Due Date</label>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={inputClass} />
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="Task details..." className={`${inputClass} resize-none`} />
          </div>
          <button type="submit" disabled={saving || !title.trim()} className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-3 rounded-xl font-semibold text-sm disabled:opacity-50 shadow-lg shadow-emerald-500/20">
            {saving ? 'Creating...' : '✅ Create Task'}
          </button>
        </form>
      )}

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { title: '📝 To Do', items: todoTasks, status: 'todo' as const, nextStatus: 'in-progress' as const, nextLabel: 'Start →' },
          { title: '🔄 In Progress', items: inProgressTasks, status: 'in-progress' as const, nextStatus: 'done' as const, nextLabel: 'Complete ✓' },
          { title: '✅ Done', items: doneTasks, status: 'done' as const, nextStatus: null, nextLabel: '' },
        ].map((col) => (
          <div key={col.status}>
            <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center justify-between">
              <span>{col.title}</span>
              <span className="text-xs text-slate-500 bg-slate-700/50 px-2 py-0.5 rounded-full">{col.items.length}</span>
            </h3>
            <div className="space-y-3">
              {col.items.map((task) => (
                <div key={task._id} className="bg-slate-800/50 border border-white/5 rounded-xl p-4 hover:border-white/10 transition-all">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-sm font-medium text-white">{task.title}</h4>
                    <button onClick={() => deleteTask(task._id)} className="text-xs text-slate-600 hover:text-red-400 transition-colors">✕</button>
                  </div>
                  {task.description && <p className="text-xs text-slate-400 mb-3 line-clamp-2">{task.description}</p>}
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${PRIORITY_STYLES[task.priority]}`}>
                      {task.priority}
                    </span>
                    {task.discipline && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400">{task.discipline}</span>
                    )}
                    {task.dueDate && (
                      <span className="text-xs text-slate-500">📅 {new Date(task.dueDate).toLocaleDateString()}</span>
                    )}
                  </div>
                  {col.nextStatus && (
                    <button
                      onClick={() => updateStatus(task._id, col.nextStatus!)}
                      className="w-full text-xs text-center py-2 rounded-lg bg-white/5 text-slate-300 hover:bg-cyan-500/10 hover:text-cyan-400 transition-all"
                    >
                      {col.nextLabel}
                    </button>
                  )}
                </div>
              ))}
              {col.items.length === 0 && (
                <div className="border border-dashed border-white/10 rounded-xl p-6 text-center">
                  <p className="text-xs text-slate-600">No tasks</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
