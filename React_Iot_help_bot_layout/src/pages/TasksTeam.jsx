import { useState, useEffect } from 'react';
import Header from '../components/Header';
import fakeData from '../DataAccess/fake-data.json';

export default function TasksTeam() {
  const [tasksTeam, setTasksTeam] = useState(null);
  const [tasks, setTasks] = useState([]);
  
  const [taskTitle, setTaskTitle] = useState('');
  const [taskOwner, setTaskOwner] = useState('Hardware Student');
  const [taskStatus, setTaskStatus] = useState('To Do');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const data = fakeData.tasksTeam;
    setTasksTeam(data);
    setTasks(data.tasks);
  }, []);

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!taskTitle) {
      setMessage('Please enter a task title.');
      setIsError(true);
      return;
    }

    const newTask = {
      title: taskTitle,
      owner: taskOwner,
      status: taskStatus
    };

    setTasks([...tasks, newTask]);
    setMessage('Task added to demo board.');
    setIsError(false);
    setTaskTitle('');
  };

  if (!tasksTeam) return <div>Loading...</div>;

  const completedCount = tasks.filter(t => t.status === 'Done').length;

  return (
    <>
      <Header title="IoT Help Bot" subtitle="Manage architecture, detect IoT risks, and support collaboration." />

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-7">
          <p className="text-slate-500 text-lg mb-3">Team Members</p>
          <h3 className="text-5xl font-bold text-slate-950">{tasksTeam.team.length}</h3>
          <p className="text-slate-500 text-lg mt-3">Students in the project</p>
        </div>
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-7">
          <p className="text-slate-500 text-lg mb-3">Completed Tasks</p>
          <h3 className="text-5xl font-bold text-slate-950">{completedCount}</h3>
          <p className="text-slate-500 text-lg mt-3">{tasks.length} total tasks</p>
        </div>
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-7">
          <p className="text-slate-500 text-lg mb-3">Project Status</p>
          <h3 className="text-5xl font-bold text-slate-950">{tasksTeam.status}</h3>
          <p className="text-slate-500 text-lg mt-3">Demo collaboration board</p>
        </div>
      </section>

      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-7 mb-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-xl">👥</div>
          <h3 className="text-2xl font-bold text-slate-950">Team members</h3>
        </div>
        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
          {tasksTeam.team.map((member, idx) => (
            <div key={idx} className="border border-slate-200 rounded-2xl p-5 hover:bg-slate-50">
              <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-xl mb-4">
                {member.icon}
              </div>
              <h4 className="font-bold text-slate-900 text-lg">{member.name}</h4>
              <p className="text-sm text-slate-500 mt-1">{member.role}</p>
              <p className="text-sm text-slate-500 mt-3">{member.responsibility}</p>
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
              let statusClass = "bg-slate-100 text-slate-600";
              if (task.status === "In Progress") statusClass = "bg-yellow-100 text-orange-600";
              if (task.status === "Done") statusClass = "bg-green-100 text-green-700";

              return (
                <div key={idx} className="border border-slate-200 rounded-2xl p-5 flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-slate-900 text-lg">{task.title}</h4>
                    <p className="text-sm text-slate-500 mt-2">Owner: {task.owner}</p>
                  </div>
                  <span className={`text-sm px-4 py-2 rounded-full font-bold ${statusClass}`}>
                    {task.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-7">
          <h3 className="text-2xl font-bold text-slate-950 mb-6">Add demo task</h3>
          <form onSubmit={handleAddTask} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Task title</label>
              <input
                type="text"
                className="w-full border border-slate-300 rounded-2xl px-4 py-3"
                value={taskTitle}
                onChange={e => setTaskTitle(e.target.value)}
                placeholder="Check database connection"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Owner</label>
              <select
                className="w-full border border-slate-300 rounded-2xl px-4 py-3"
                value={taskOwner}
                onChange={e => setTaskOwner(e.target.value)}
              >
                <option>Hardware Student</option>
                <option>Backend Student</option>
                <option>Frontend Student</option>
                <option>AI Student</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Status</label>
              <select
                className="w-full border border-slate-300 rounded-2xl px-4 py-3"
                value={taskStatus}
                onChange={e => setTaskStatus(e.target.value)}
              >
                <option>To Do</option>
                <option>In Progress</option>
                <option>Done</option>
              </select>
            </div>
            {message && <p className={`text-sm ${isError ? 'text-red-500' : 'text-green-500'}`}>{message}</p>}
            <button type="submit" className="w-full bg-slate-950 text-white py-3 rounded-2xl font-bold hover:bg-slate-800">
              Add task
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
