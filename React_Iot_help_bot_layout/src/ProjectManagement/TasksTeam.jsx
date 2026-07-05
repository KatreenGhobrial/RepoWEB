import { useState, useEffect } from 'react';
import LabeledInput from '../UIComponents/LabeledInput';
import { Navigate } from 'react-router-dom';
import Header from '../UIComponents/Header';
import { getUsers } from '../UserManagement/usersService';
import { update as updateProject } from './projectService';
import { listByProject as listTasks, create as createTask, update as updateTask, deleteTask } from './taskService';
import { getMentorFeedback as getFeedback } from './projectService';
import { useProject } from '../hooks/ProjectContext';

/**
 * TasksTeam Component.
 * Kanban-style board for managing project tasks across different disciplines
 * (Hardware, Software, Design, etc.). Supports dragging, editing, and deleting tasks.
 */
export default function TasksTeam() {
  const { selectedProjectId, selectedProject, updateProjectInCache } = useProject();

  const [team, setTeam] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [projectId, setProjectId] = useState(null);
  const [projectStatus, setProjectStatus] = useState('Active');
  
  const [taskForm, setTaskForm] = useState({ title: '', discipline: '', status: 'todo', priority: 'medium' });
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [msg, setMsg] = useState({ text: '', isError: false });
  const [loading, setLoading] = useState(true);
  const [feedbacks, setFeedbacks] = useState([]);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editTaskForm, setEditTaskForm] = useState({});

  let currentUser = null;
  try {
    currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
  } catch(e) {}

  if (currentUser?.role === 'mentor') return <Navigate to="/mentor-dashboard" replace />;

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!currentUser) return;
        const proj = selectedProject;
        if (proj) {
          setProjectId(proj._id);
          setProjectStatus(proj.status || 'Active');
          setTeam(proj.members || proj.students || []);

          const backendTasks = await listTasks(proj._id) || [];
          setTasks(backendTasks.map(t => ({
            ...t, owner: t.owner?.username || t.discipline || 'Unassigned',
            status: t.status === 'todo' ? 'To Do' : t.status === 'in-progress' ? 'In Progress' : 'Done'
          })));

          setFeedbacks(await getFeedback(proj._id) || []);
        } else {
          setProjectId(null);
          setProjectStatus('Active');
          setTeam([]);
          setTasks([]);
          setFeedbacks([]);
        }
      } catch (err) { console.error(err); } 
      finally { setLoading(false); }
    };
    fetchData();
  }, [selectedProjectId]);

  const showMsg = (text, isError = false) => {
    setMsg({ text, isError });
    setTimeout(() => setMsg({ text: '', isError: false }), 3000);
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!taskForm.title) return showMsg('Please enter a task title.', true);

    try {
      if (projectId) {
        const newTask = await createTask({ project: projectId, ...taskForm });
        setTasks([...tasks, { ...newTask, owner: newTask.discipline, status: taskForm.status === 'todo' ? 'To Do' : taskForm.status === 'in-progress' ? 'In Progress' : 'Done' }]);
        showMsg('Task saved!');
      } else {
        setTasks([...tasks, { ...taskForm, owner: taskForm.discipline }]);
        showMsg('Task added locally.');
      }
      setTaskForm({ title: '', discipline: '', status: 'todo', priority: 'medium' });
    } catch (err) { showMsg('Add task error', true); }
  };

  const handleTaskAction = async (taskId, action, data = {}) => {
    if (action === 'delete' && !confirm('Delete task?')) return;
    try {
      if (action === 'status') {
        const dStat = data.status === 'todo' ? 'To Do' : data.status === 'in-progress' ? 'In Progress' : 'Done';
        setTasks(tasks.map(t => t._id === taskId ? { ...t, status: dStat } : t));
        if (taskId) await updateTask(taskId, { status: data.status });
      } else if (action === 'delete') {
        setTasks(tasks.filter(t => t._id !== taskId));
        if (taskId) await deleteTask(taskId);
      } else if (action === 'edit') {
        const dStat = data.status === 'todo' ? 'To Do' : data.status === 'in-progress' ? 'In Progress' : 'Done';
        setTasks(tasks.map(t => t._id === taskId ? { ...t, title: data.title, owner: data.owner, status: dStat, priority: data.priority } : t));
        setEditingTaskId(null);
        if (taskId) await updateTask(taskId, { title: data.title, discipline: data.owner, status: data.status, priority: data.priority });
      }
    } catch (err) { console.error('Task action failed', err); }
  };

  const updateTeamDB = async (updatedTeam) => {
    if (!projectId) return;
    const emails = updatedTeam.map(m => m.email || m.username || m).filter(Boolean);
    await updateProject(projectId, { memberEmails: emails });
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!newMemberEmail) return;
    try {
      const allUsers = await getUsers();
      const user = allUsers.find(u => u.username === newMemberEmail || u.email === newMemberEmail);
      if (!user) return showMsg('User not found.', true);
      
      const isExist = team.some(m => (m.email || m.username) === newMemberEmail);
      if (isExist) return showMsg('Member already in team.', true);

      const newMember = { username: user.username, name: user.name || user.username, email: user.email, role: user.role, expertise: user.expertise };
      const newTeam = [...team, newMember];
      setTeam(newTeam);
      await updateTeamDB(newTeam);
      showMsg('Member added!');
      setNewMemberEmail('');
    } catch (err) { showMsg('Failed to add member.', true); }
  };

  const handleRemoveMember = async (email) => {
    if (!confirm('Remove this member?')) return;
    const newTeam = team.filter(m => (m.email || m.username || m) !== email);
    setTeam(newTeam);
    try { await updateTeamDB(newTeam); } catch (err) { console.error(err); }
  };

  if (loading) return <div className="p-12 text-center text-slate-500 dark:text-slate-400">Loading tasks...</div>;

  return (
    <>
      <Header title="IoT Help Bot" subtitle="Manage architecture, detect IoT risks, and support collaboration." />

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 text-center">
        {[
          { label: 'Team Members', val: team.length, sub: 'Students in project' },
          { label: 'Completed Tasks', val: tasks.filter(t => t.status === 'Done').length, sub: `${tasks.length} total tasks` },
          { label: 'Project Status', val: projectStatus, sub: projectId ? 'Connected to backend' : 'Demo mode' }
        ].map((s, i) => (
          <div key={i} className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 p-7 shadow-sm" style={{borderColor: '#E2E8F0'}}>
            <p className="text-slate-500 dark:text-slate-400 mb-3">{s.label}</p>
            <h3 className="text-5xl font-bold text-slate-950 dark:text-white">{s.val}</h3>
            <p className="text-slate-500 dark:text-slate-400 mt-3">{s.sub}</p>
          </div>
        ))}
      </section>

      <section className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 p-7 mb-8 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center text-xl">👥</div>
            <h3 className="text-2xl font-bold">Team members</h3>
          </div>
          <form onSubmit={handleAddMember} className="flex gap-2 w-full md:w-auto">
            <input className="border rounded-xl px-4 py-2 flex-grow md:w-64 outline-none focus:ring-2 focus:ring-slate-950" placeholder="Student email or username" value={newMemberEmail} onChange={e => setNewMemberEmail(e.target.value)} />
            <button className="bg-slate-950 text-white dark:bg-cyan-600 dark:text-white px-4 py-2 rounded-xl font-bold hover:bg-slate-800 transition-colors">Add</button>
          </form>
        </div>
        {msg.text && <p className={`mb-4 text-sm font-medium ${msg.isError ? 'text-red-500' : 'text-green-600'}`}>{msg.text}</p>}
        
        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
          {team.filter(m => m).map((m, i) => (
            <div key={i} className="border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 relative hover:bg-slate-50 dark:bg-zinc-800/50 transition-colors">
              <button onClick={() => handleRemoveMember(m.email || m.username || m)} className="absolute top-3 right-3 text-slate-400 hover:text-red-500 transition-colors" title="Remove Member">✕</button>
              <div className="w-12 h-12 bg-slate-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center text-xl mb-3">{m.icon || '👤'}</div>
              <h4 className="font-bold text-lg text-slate-900 dark:text-white">{m.username || m.name || m.email || m}</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 capitalize mt-1">{m.role || 'Student'}</p>
              <p className="text-sm font-semibold text-cyan-600 mt-3">{m.expertise?.join(', ') || m.responsibility || 'General'}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 p-7 shadow-sm">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-slate-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center text-xl">✅</div>
            <h3 className="text-2xl font-bold">Project tasks</h3>
          </div>
          <div className="space-y-4">
            {tasks.map((task, idx) => (
              <div key={task._id || idx} className="border border-slate-200 dark:border-zinc-800 rounded-2xl p-5">
                {editingTaskId === task._id ? (
                  <div className="flex flex-col gap-3">
                    <input className="border border-slate-300 rounded-lg px-3 py-2 font-bold w-full" value={editTaskForm.title} onChange={e => setEditTaskForm({...editTaskForm, title: e.target.value})} />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <select className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm" value={editTaskForm.owner} onChange={e => setEditTaskForm({...editTaskForm, owner: e.target.value})}>
                        <option value="">-- Owner --</option>
                        {team.filter(m => m && m.role !== 'mentor').map((m, i) => { const nm = m.username||m.email||m; return <option key={i} value={nm}>{nm}</option>; })}
                      </select>
                      <select className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm" value={editTaskForm.status} onChange={e => setEditTaskForm({...editTaskForm, status: e.target.value})}>
                        <option value="todo">To Do</option><option value="in-progress">In Progress</option><option value="done">Done</option>
                      </select>
                      <select className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm" value={editTaskForm.priority} onChange={e => setEditTaskForm({...editTaskForm, priority: e.target.value})}>
                        <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
                      </select>
                    </div>
                    <div className="flex gap-2 justify-end mt-1">
                      <button onClick={() => setEditingTaskId(null)} className="px-4 py-1.5 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300 font-bold rounded-lg text-sm hover:bg-slate-200 transition-colors">Cancel</button>
                      <button onClick={() => handleTaskAction(task._id, 'edit', editTaskForm)} className="px-4 py-1.5 bg-slate-900 text-white dark:bg-cyan-600 dark:text-white font-bold rounded-lg text-sm hover:bg-slate-800 transition-colors">Save</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-lg">{task.title}</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Owner: {task.owner}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <select 
                        className={`text-sm px-4 py-2 rounded-full font-bold cursor-pointer outline-none appearance-none ${task.status==='Done'?'bg-green-100 text-green-700':task.status==='In Progress'?'bg-yellow-100 text-orange-600':'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-400'}`}
                        value={task.status === 'Done' ? 'done' : task.status === 'In Progress' ? 'in-progress' : 'todo'}
                        onChange={(e) => handleTaskAction(task._id, 'status', { status: e.target.value })}
                        disabled={!task._id}
                      >
                        <option value="todo">To Do</option><option value="in-progress">In Progress</option><option value="done">Done</option>
                      </select>
                      {task._id && (
                        <div className="flex gap-3 mt-1 text-xs font-semibold">
                          <button onClick={() => { setEditingTaskId(task._id); setEditTaskForm({title: task.title, owner: task.owner, status: task.status==='Done'?'done':task.status==='In Progress'?'in-progress':'todo', priority: task.priority||'medium'}); }} className="text-blue-600 hover:text-blue-800">Edit</button>
                          <button onClick={() => handleTaskAction(task._id, 'delete')} className="text-red-500 hover:text-red-700">Delete</button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 p-7 shadow-sm">
          <h3 className="text-2xl font-bold mb-6 text-slate-950 dark:text-white">Add new task</h3>
          <form onSubmit={handleAddTask} className="space-y-5">
            <LabeledInput label="Task title" type="text" placeholder="Enter task description" value={taskForm.title} onChange={e => setTaskForm({...taskForm, title: e.target.value})} className="w-full border border-slate-300 rounded-2xl px-4 py-3 outline-none focus:border-slate-400" />
            <LabeledInput label="Assign To (Partner)">
              <select className="w-full border border-slate-300 rounded-2xl px-4 py-3 outline-none focus:border-slate-400" value={taskForm.discipline} onChange={e => setTaskForm({...taskForm, discipline: e.target.value})}>
                <option value="">-- Select Partner --</option>
                {team.filter(m => m && m.role !== 'mentor').map((m, i) => { const nm = m.username||m.name||m.email||m; return <option key={i} value={nm}>{nm}</option>; })}
              </select>
            </LabeledInput>
            <LabeledInput label="Status">
              <select className="w-full border border-slate-300 rounded-2xl px-4 py-3 outline-none focus:border-slate-400" value={taskForm.status} onChange={e => setTaskForm({...taskForm, status: e.target.value})}>
                <option value="todo">To Do</option><option value="in-progress">In Progress</option><option value="done">Done</option>
              </select>
            </LabeledInput>
            <LabeledInput label="Priority">
              <select className="w-full border border-slate-300 rounded-2xl px-4 py-3 outline-none focus:border-slate-400" value={taskForm.priority} onChange={e => setTaskForm({...taskForm, priority: e.target.value})}>
                <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
              </select>
            </LabeledInput>
            <button className="w-full bg-slate-950 text-white dark:bg-cyan-600 dark:text-white py-3 rounded-2xl font-bold hover:bg-slate-800 transition-colors">Add task</button>
          </form>
        </div>
      </section>

      <section className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 p-7 shadow-sm">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-slate-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center text-xl">💬</div>
          <h3 className="text-2xl font-bold text-slate-950 dark:text-white">Mentor Feedback</h3>
        </div>
        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
          {feedbacks.length ? feedbacks.map((fb, i) => {
            const m = fb.content.match(/^\[Task:\s*(.*?)\]\s*(.*)$/);
            return (
              <div key={i} className="border border-slate-100 bg-slate-50 dark:bg-zinc-800/50 rounded-3xl p-5">
                <div className="flex items-center justify-end mb-1">
                  <span className="text-xs text-slate-500 dark:text-slate-400">{new Date(fb.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">📌 {m ? `Task: ${m[1]}` : fb.relatedTaskTitle ? `Task: ${fb.relatedTaskTitle}` : 'General Feedback'}</div>
                <p className="text-slate-700 dark:text-slate-300 text-sm">{m ? m[2] : fb.content}</p>
              </div>
            );
          }) : <p className="text-slate-500 dark:text-slate-400 text-center py-8 bg-slate-50 dark:bg-zinc-800/50 rounded-2xl">No feedback received yet.</p>}
        </div>
      </section>
    </>
  );
}

