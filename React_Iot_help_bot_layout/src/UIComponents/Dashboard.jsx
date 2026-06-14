import { useState, useEffect } from 'react';
import Header from './Header';

export default function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          // No token = return empty dashboard
          setDashboard({
            roleCoverage: { value: '0/0', text: 'Please log in' },
            detectedIssues: 0,
            tasksCompleted: { value: 0, text: '0 total tasks' },
            documentationStatus: 'No data',
            progress: [],
            alerts: []
          });
          setLoading(false);
          return;
        }

        // Fetch projects from backend
        const projRes = await fetch('http://localhost:5000/api/projects', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!projRes.ok) {
          setDashboard({
            roleCoverage: { value: '0/0', text: 'Error loading data' },
            detectedIssues: 0,
            tasksCompleted: { value: 0, text: '0 total tasks' },
            documentationStatus: 'Error',
            progress: [],
            alerts: []
          });
          setLoading(false);
          return;
        }

        const projects = await projRes.json();
        
        // Build dashboard from real data
        const totalProjects = projects.length;
        const memberCount = projects.reduce((acc, p) => {
          const members = p.members || [];
          members.forEach(m => acc.add(m._id || m));
          return acc;
        }, new Set()).size;

        // Fetch tasks for the first project if exists
        let totalTasks = 0;
        let completedTasks = 0;
        if (projects.length > 0) {
          const taskRes = await fetch(`http://localhost:5000/api/tasks/${projects[0]._id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (taskRes.ok) {
            const tasks = await taskRes.json();
            totalTasks = tasks.length;
            completedTasks = tasks.filter(t => t.status === 'done').length;
          }
        }

        // Build live dashboard object
        setDashboard({
          roleCoverage: {
            value: `${memberCount}/${Math.max(memberCount + 1, 5)}`,
            text: totalProjects > 0 ? `${totalProjects} active project(s)` : 'No projects yet'
          },
          detectedIssues: 0, // Default to 0 without fake data
          tasksCompleted: {
            value: completedTasks,
            text: `${totalTasks} total tasks`
          },
          documentationStatus: totalProjects > 0 ? 'Active' : 'No projects',
          progress: [], // Empty progress bars without fake data
          alerts: [] // Empty alerts without fake data
        });
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        setDashboard({
          roleCoverage: { value: '0/0', text: 'Connection error' },
          detectedIssues: 0,
          tasksCompleted: { value: 0, text: '0 total tasks' },
          documentationStatus: 'Error',
          progress: [],
          alerts: []
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading || !dashboard) return <div className="flex items-center justify-center p-12"><p className="text-slate-500 text-lg">Loading dashboard...</p></div>;

  return (
    <>
      <Header title="IoT Help Bot" subtitle="Manage architecture, detect IoT risks, and support collaboration." />

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-7">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-lg mb-3">Project Role Coverage</p>
              <h3 className="text-5xl font-bold text-slate-950">{dashboard.roleCoverage.value}</h3>
              <p className="text-slate-500 text-lg mt-3">{dashboard.roleCoverage.text}</p>
            </div>
            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-2xl">👥</div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-7">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-lg mb-3">Detected Issues</p>
              <h3 className="text-5xl font-bold text-slate-950">{dashboard.detectedIssues}</h3>
              <p className="text-slate-500 text-lg mt-3">Auto-detected from architecture</p>
            </div>
            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-2xl">⚠️</div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-7">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-lg mb-3">Tasks Completed</p>
              <h3 className="text-5xl font-bold text-slate-950">{dashboard.tasksCompleted.value}</h3>
              <p className="text-slate-500 text-lg mt-3">{dashboard.tasksCompleted.text}</p>
            </div>
            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-2xl">✅</div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-7">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-lg mb-3">Documentation Status</p>
              <h3 className="text-5xl font-bold text-slate-950">{dashboard.documentationStatus}</h3>
              <p className="text-slate-500 text-lg mt-3">Requirements and notes available</p>
            </div>
            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-2xl">📄</div>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-7 mb-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-xl">📈</div>
          <h3 className="text-2xl font-bold text-slate-950">Progress by area</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-end">
          {dashboard.progress.map((item, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className="h-56 w-full flex items-end justify-center">
                <div className="w-24 bg-black rounded-t-2xl" style={{ height: `${item.value}%` }}></div>
              </div>
              <p className="mt-4 font-bold text-slate-800">{item.name}</p>
              <p className="text-slate-500">{item.value}%</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-7">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-xl">🔔</div>
          <h3 className="text-2xl font-bold text-slate-950">Live alerts</h3>
        </div>
        <div className="space-y-4">
          {dashboard.alerts.map((alert, index) => {
            const isMedium = alert.level === 'MEDIUM';
            const alertClass = isMedium 
              ? 'bg-yellow-100 border-yellow-300 text-orange-600' 
              : 'bg-red-100 border-red-200 text-red-700';
              
            return (
              <div key={index} className={`border rounded-3xl p-5 ${alertClass}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xl font-bold mb-2">{alert.title}</h4>
                    <p>{alert.category}</p>
                  </div>
                  <span className="font-bold">{alert.level}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
