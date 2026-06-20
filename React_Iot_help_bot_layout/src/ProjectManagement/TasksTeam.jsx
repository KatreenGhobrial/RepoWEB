import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import Header from '../UIComponents/Header';

export default function TasksTeam() {
  const [team, setTeam] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [projectId, setProjectId] = useState(null);
  const [projectStatus, setProjectStatus] = useState('Active');
  
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDiscipline, setTaskDiscipline] = useState('hardware');
  const [taskStatus, setTaskStatus] = useState('todo');
  const [taskPriority, setTaskPriority] = useState('medium');
  const [newStudent, setNewStudent] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [feedbacks, setFeedbacks] = useState([]);
  const [requestSent, setRequestSent] = useState(false);

  const userStr = localStorage.getItem('currentUser');
  const currentUser = userStr ? JSON.parse(userStr) : null;

  if (currentUser?.role === 'mentor') {
    return <Navigate to="/mentor-dashboard" replace />;
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userStr = localStorage.getItem('currentUser');
        if (!userStr) {
          setTasks([]);
          setLoading(false);
          return;
        }
        const user = JSON.parse(userStr);

        // Get projects
        const projRes = await fetch('http://localhost:5000/api/projects', {
          headers: { 'x-user-id': user._id }
        });
        if (!projRes.ok) throw new Error('Failed to fetch projects');
        const projects = await projRes.json();

        if (projects.length > 0) {
          const proj = projects[0];
          setProjectId(proj._id);
          setProjectStatus(proj.status || 'active');
          setTeam(proj.members || proj.member || proj.team || proj.students || []);

          // Fetch tasks for this project
          const taskRes = await fetch(`http://localhost:5000/api/tasks/${proj._id}`, {
            headers: { 'x-user-id': user._id }
          });
          if (taskRes.ok) {
            const backendTasks = await taskRes.json();
            // Map backend tasks to display format
            const mapped = backendTasks.map(t => ({
              _id: t._id,
              title: t.title,
              owner: t.owner?.username || t.discipline || 'Unassigned',
              status: t.status === 'todo' ? 'To Do' : t.status === 'in-progress' ? 'In Progress' : t.status === 'done' ? 'Done' : t.status,
              discipline: t.discipline,
              priority: t.priority
            }));
            setTasks(mapped.length > 0 ? mapped : []);
          } else {
            setTasks([]);
          }

          // Fetch feedback
          const fbRes = await fetch(`http://localhost:5000/api/mentor/feedback/${proj._id}`);
          if (fbRes.ok) {
            setFeedbacks(await fbRes.json());
          }

        } else {
          setTasks([]);
          setFeedbacks([]);
        }
      } catch (err) {
        console.error('Tasks fetch error:', err);
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!taskTitle) {
      setMessage('Please enter a task title.');
      setIsError(true);
      return;
    }

    // Map display status to backend status
    const statusMap = { 'To Do': 'todo', 'In Progress': 'in-progress', 'Done': 'done' };
    const backendStatus = statusMap[taskStatus] || taskStatus;

    try {
      const userStr = localStorage.getItem('currentUser');
      if (userStr && projectId) {
        const user = JSON.parse(userStr);
        const res = await fetch('http://localhost:5000/api/tasks', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'x-user-id': user._id 
          },
          body: JSON.stringify({
            project: projectId,
            title: taskTitle,
            status: backendStatus,
            priority: taskPriority,
            discipline: taskDiscipline
          })
        });

        if (res.ok) {
          const newTask = await res.json();
          setTasks([...tasks, {
            _id: newTask._id,
            title: newTask.title,
            owner: newTask.discipline || taskDiscipline,
            status: taskStatus,
            discipline: newTask.discipline,
            priority: newTask.priority
          }]);
          setMessage('Task saved to database!');
          setIsError(false);
          setTaskTitle('');
          return;
        }
      }
      // Fallback: add locally
      setTasks([...tasks, { title: taskTitle, owner: taskDiscipline, status: taskStatus }]);
      setMessage('Task added locally (no project selected).');
      setIsError(false);
      setTaskTitle('');
    } catch (err) {
      console.error('Add task error:', err);
      setTasks([...tasks, { title: taskTitle, owner: taskDiscipline, status: taskStatus }]);
      setMessage('Task added locally (server error).');
      setIsError(false);
      setTaskTitle('');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    if (!taskId) return;
    
    const displayStatus = newStatus === 'todo' ? 'To Do' : newStatus === 'in-progress' ? 'In Progress' : 'Done';
    setTasks(tasks.map(t => t._id === taskId ? { ...t, status: displayStatus } : t));
    
    try {
      const userStr = localStorage.getItem('currentUser');
      const user = userStr ? JSON.parse(userStr) : null;
      if (user) {
        await fetch(`http://localhost:5000/api/tasks/${taskId}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'x-user-id': user._id 
          },
          body: JSON.stringify({ status: newStatus })
        });
      }
    } catch (err) {
      console.error('Failed to update task status', err);
    }
  };


  if (loading) return <div className="flex items-center justify-center p-12"><p className="text-slate-500 text-lg">Loading tasks...</p></div>;

  const handleRequestFeedback = () => {
    setRequestSent(true);
    setTimeout(() => setRequestSent(false), 3000);
  };

  const completedCount = tasks.filter(t => t.status === 'Done' || t.status === 'done').length;

  return (
    <>
      <Header title="IoT Help Bot" subtitle="Manage architecture, detect IoT risks, and support collaboration." />

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-7">
          <p className="text-slate-500 text-lg mb-3">Team Members</p>
          <h3 className="text-5xl font-bold text-slate-950">{team.length}</h3>
          <p className="text-slate-500 text-lg mt-3">Students in the project</p>
        </div>
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-7">
          <p className="text-slate-500 text-lg mb-3">Completed Tasks</p>
          <h3 className="text-5xl font-bold text-slate-950">{completedCount}</h3>
          <p className="text-slate-500 text-lg mt-3">{tasks.length} total tasks</p>
        </div>
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-7">
          <p className="text-slate-500 text-lg mb-3">Project Status</p>
          <h3 className="text-5xl font-bold text-slate-950">{projectStatus}</h3>
          <p className="text-slate-500 text-lg mt-3">{projectId ? 'Connected to backend' : 'Demo mode'}</p>
        </div>
      </section>

      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-7 mb-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-xl">👥</div>
          <h3 className="text-2xl font-bold text-slate-950">Team members</h3>
        </div>
        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
          {team.map((member, idx) => (
            <div key={idx} className="border border-slate-200 rounded-2xl p-5 hover:bg-slate-50">
              <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-xl mb-4">
                {member.icon || '👤'}
              </div>
              <h4 className="font-bold text-slate-900 text-lg">{member.username || member.name || member.email || (typeof member === 'string' ? member : 'Unknown')}</h4>
              <p className="text-sm text-slate-500 mt-1 capitalize">{member.role || 'Student'}</p>
              <p className="text-sm font-semibold text-cyan-600 mt-3">{member.expertise && member.expertise.length > 0 ? member.expertise.join(', ') : (member.responsibility || 'General')}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-7">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-xl">✅</div>
            <h3 className="text-2xl font-bold text-slate-950">Project tasks</h3>
          </div>
          <div className="space-y-4">
            {tasks.map((task, idx) => {
              let statusClass = 'bg-slate-100 text-slate-600';
              const s = (task.status || '').toLowerCase();
              if (s === 'in progress' || s === 'in-progress') statusClass = 'bg-yellow-100 text-orange-600';
              if (s === 'done') statusClass = 'bg-green-100 text-green-700';

              const backendStatus = s === 'in progress' || s === 'in-progress' ? 'in-progress' : s === 'done' ? 'done' : 'todo';

              return (
                <div key={task._id || idx} className="border border-slate-200 rounded-2xl p-5 flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-slate-900 text-lg">{task.title}</h4>
                    <p className="text-sm text-slate-500 mt-2">Owner: {task.owner}</p>
                  </div>
                  <select 
                    className={`text-sm px-4 py-2 rounded-full font-bold cursor-pointer outline-none appearance-none ${statusClass}`}
                    value={backendStatus}
                    onChange={(e) => handleStatusChange(task._id, e.target.value)}
                    disabled={!task._id}
                  >
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-7">
          <h3 className="text-2xl font-bold text-slate-950 mb-6">Add new task</h3>
          <form onSubmit={handleAddTask} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Task title</label>
              <input
                type="text"
                className="w-full border border-slate-300 rounded-2xl px-4 py-3"
                value={taskTitle}
                onChange={e => setTaskTitle(e.target.value)}
                placeholder="Enter task description"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Assign To (Partner)</label>
              <select
                className="w-full border border-slate-300 rounded-2xl px-4 py-3"
                value={taskDiscipline}
                onChange={e => setTaskDiscipline(e.target.value)}
              >
                <option value="">-- Select Partner --</option>
                {team.map((member, idx) => {
                  const mName = member.username || member.name || member.email || member;
                  return <option key={idx} value={mName}>{mName}</option>;
                })}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Status</label>
              <select
                className="w-full border border-slate-300 rounded-2xl px-4 py-3"
                value={taskStatus}
                onChange={e => setTaskStatus(e.target.value)}
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Priority</label>
              <select
                className="w-full border border-slate-300 rounded-2xl px-4 py-3"
                value={taskPriority}
                onChange={e => setTaskPriority(e.target.value)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            {message && <p className={`text-sm ${isError ? 'text-red-500' : 'text-green-500'}`}>{message}</p>}
            <button type="submit" className="w-full bg-slate-950 text-white py-3 rounded-2xl font-bold hover:bg-slate-800">
              Add task
            </button>
          </form>
        </div>
      </section>

      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-7">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-xl">💬</div>
            <h3 className="text-2xl font-bold text-slate-950">Mentor Feedback</h3>
          </div>
          <button 
            onClick={handleRequestFeedback}
            className="bg-cyan-50 text-cyan-700 border border-cyan-200 hover:bg-cyan-100 font-bold py-2 px-4 rounded-xl transition-colors"
          >
            {requestSent ? '✅ Request Sent!' : '🔔 Request Feedback'}
          </button>
        </div>
        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
          {feedbacks && feedbacks.length > 0 ? (
            feedbacks.map((fb, index) => (
              <div key={index} className="border border-slate-100 bg-slate-50 rounded-3xl p-5">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-bold text-cyan-600 capitalize">{fb.category}</span>
                  <span className="text-xs text-slate-500">{new Date(fb.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-slate-700 text-sm">{fb.content}</p>
                <div className="flex gap-1 mt-3">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <span key={n} className={`text-sm ${n <= fb.rating ? "text-amber-400" : "text-slate-300"}`}>★</span>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <p className="text-slate-500 text-center py-8 bg-slate-50 rounded-2xl">No feedback received yet.</p>
          )}
        </div>
      </section>
    </>
  );
}
