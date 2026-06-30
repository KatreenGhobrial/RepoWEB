import { useState, useEffect } from 'react';
import Header from './Header';
import api from '../apiClient';

export default function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const userStr = localStorage.getItem('currentUser');
        if (!userStr) {
          // No user = return empty dashboard
          setDashboard({
            detectedIssues: 0,
            documentationStatus: 'No data',
            progress: [],
            alerts: [],
            feedbacks: [],
            tasksStats: { total: 0, done: 0, inProgress: 0, todo: 0, progressPercentage: 0 },
            workload: []
          });
          setLoading(false);
          return;
        }

        const user = JSON.parse(userStr);
        const userId = user._id;

        // Fetch projects from backend
        const projects = await api.get('/projects');
        
        // Build dashboard from real data
        const totalProjects = projects.length;
        const memberCount = projects.reduce((acc, p) => {
          const members = p.members || [];
          members.forEach(m => acc.add(m._id || m));
          return acc;
        }, new Set()).size;

        // Fetch tasks and feedback for the first project if exists
        let totalTasks = 0;
        let completedTasks = 0;
        let inProgressTasks = 0;
        let todoTasks = 0;
        let memberWorkload = {};
        let feedbacks = [];

        if (projects.length > 0) {
          try {
            const tasks = await api.get(`/tasks/${projects[0]._id}`);
            totalTasks = tasks.length;
            
            tasks.forEach(t => {
               const st = (t.status || 'todo').toLowerCase();
               if (st === 'done') completedTasks++;
               else if (st === 'in-progress' || st === 'in progress') inProgressTasks++;
               else todoTasks++;

               const owner = t.owner?.username || t.discipline || 'Unassigned';
               if (!memberWorkload[owner]) {
                 memberWorkload[owner] = { total: 0, done: 0, inProgress: 0, todo: 0 };
               }
               memberWorkload[owner].total++;
               if (st === 'done') memberWorkload[owner].done++;
               else if (st === 'in-progress' || st === 'in progress') memberWorkload[owner].inProgress++;
               else memberWorkload[owner].todo++;
            });
          } catch (e) { console.error('Tasks fetch error:', e); }

          try {
            feedbacks = await api.get(`/mentor/feedback/${projects[0]._id}`);
          } catch (e) { console.error('Feedback fetch error:', e); }
        }

        const progressPercentage = totalTasks === 0 ? 0 : Math.round(((completedTasks + (inProgressTasks * 0.5)) / totalTasks) * 100);

        const assessment = projects.length > 0 ? projects[0].assessment : null;

        // Build live dashboard object
        setDashboard({
          detectedIssues: 0,
          tasksStats: {
            total: totalTasks,
            done: completedTasks,
            inProgress: inProgressTasks,
            todo: todoTasks,
            progressPercentage
          },
          workload: Object.entries(memberWorkload).map(([name, stats]) => ({ name, ...stats })),
          documentationStatus: totalProjects > 0 ? 'Active' : 'No projects',
          progress: [],
          alerts: [],
          feedbacks: feedbacks,
          assessment: assessment
        });
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        setDashboard({
          detectedIssues: 0,
          tasksStats: { total: 0, done: 0, inProgress: 0, todo: 0, progressPercentage: 0 },
          workload: [],
          documentationStatus: 'Error',
          progress: [],
          alerts: [],
          feedbacks: [],
          assessment: null
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

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
              <p className="text-slate-500 text-lg mb-3">Project Progress</p>
              <h3 className="text-5xl font-bold text-slate-950">{dashboard.tasksStats?.progressPercentage || 0}%</h3>
              <p className="text-slate-500 text-lg mt-3">{dashboard.tasksStats?.done || 0}/{dashboard.tasksStats?.total || 0} tasks done</p>
            </div>
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path className="text-slate-100" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="text-cyan-500 transition-all duration-1000 ease-out" strokeDasharray={`${dashboard.tasksStats?.progressPercentage || 0}, 100`} strokeWidth="4" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
            </div>
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

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Task Status Distribution */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-7">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-xl">📊</div>
            <h3 className="text-2xl font-bold text-slate-950">Task Distribution</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between text-sm font-semibold">
              <span className="text-slate-500">To Do</span>
              <span>{dashboard.tasksStats?.todo || 0}</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3">
              <div className="bg-slate-300 h-3 rounded-full transition-all duration-1000" style={{ width: `${dashboard.tasksStats?.total ? (dashboard.tasksStats.todo / dashboard.tasksStats.total) * 100 : 0}%` }}></div>
            </div>
            
            <div className="flex justify-between text-sm font-semibold">
              <span className="text-yellow-600">In Progress</span>
              <span>{dashboard.tasksStats?.inProgress || 0}</span>
            </div>
            <div className="w-full bg-yellow-50 rounded-full h-3">
              <div className="bg-yellow-400 h-3 rounded-full transition-all duration-1000" style={{ width: `${dashboard.tasksStats?.total ? (dashboard.tasksStats.inProgress / dashboard.tasksStats.total) * 100 : 0}%` }}></div>
            </div>

            <div className="flex justify-between text-sm font-semibold">
              <span className="text-green-600">Done</span>
              <span>{dashboard.tasksStats?.done || 0}</span>
            </div>
            <div className="w-full bg-green-50 rounded-full h-3">
              <div className="bg-green-500 h-3 rounded-full transition-all duration-1000" style={{ width: `${dashboard.tasksStats?.total ? (dashboard.tasksStats.done / dashboard.tasksStats.total) * 100 : 0}%` }}></div>
            </div>
          </div>
        </div>

        {/* Workload by Member */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-7">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-xl">👥</div>
            <h3 className="text-2xl font-bold text-slate-950">Team Workload</h3>
          </div>
          <div className="space-y-6">
            {dashboard.workload && dashboard.workload.length > 0 ? dashboard.workload.map((wl, idx) => (
              <div key={idx}>
                <div className="flex justify-between text-sm font-semibold mb-2">
                  <span className="text-slate-900">{wl.name}</span>
                  <span className="text-slate-500">{wl.total} tasks</span>
                </div>
                <div className="w-full flex h-4 rounded-full overflow-hidden bg-slate-100">
                  <div className="bg-green-500 h-full transition-all duration-1000" style={{ width: `${wl.total ? (wl.done / wl.total) * 100 : 0}%` }} title={`Done: ${wl.done}`}></div>
                  <div className="bg-yellow-400 h-full transition-all duration-1000" style={{ width: `${wl.total ? (wl.inProgress / wl.total) * 100 : 0}%` }} title={`In Progress: ${wl.inProgress}`}></div>
                  <div className="bg-slate-300 h-full transition-all duration-1000" style={{ width: `${wl.total ? (wl.todo / wl.total) * 100 : 0}%` }} title={`To Do: ${wl.todo}`}></div>
                </div>
              </div>
            )) : (
              <p className="text-slate-500 text-center py-8">No tasks assigned yet.</p>
            )}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-7">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-xl">💬</div>
            <h3 className="text-2xl font-bold text-slate-950">Mentor Feedback</h3>
          </div>
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            {dashboard.feedbacks && dashboard.feedbacks.length > 0 ? (
              dashboard.feedbacks.map((fb, index) => {
                const match = fb.content.match(/^\[Task:\s*(.*?)\]\s*(.*)$/);
                const relatedTaskTitle = match ? match[1] : fb.relatedTaskTitle;
                const displayContent = match ? match[2] : fb.content;

                return (
                <div key={index} className="border border-slate-100 bg-slate-50 rounded-3xl p-5">
                  <div className="flex items-center justify-end mb-1">
                    <span className="text-xs text-slate-500">{new Date(fb.createdAt).toLocaleDateString()}</span>
                  </div>
                  {relatedTaskTitle ? (
                    <div className="text-xs font-semibold text-slate-600 mb-1">
                      📌 Task: {relatedTaskTitle}
                    </div>
                  ) : (
                    <div className="text-xs font-semibold text-slate-600 mb-1">
                      📌 General Feedback
                    </div>
                  )}
                  <p className="text-slate-700 text-sm">{displayContent}</p>
                </div>
                );
              })
            ) : (
              <p className="text-slate-500 text-center py-8 bg-slate-50 rounded-2xl">No feedback received yet.</p>
            )}
          </div>
        </section>

        {dashboard.assessment && dashboard.assessment.assessedAt && (
          <section className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl border border-indigo-100 shadow-sm p-7 col-span-1 lg:col-span-2">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-xl shadow-sm">🎓</div>
              <h3 className="text-2xl font-bold text-indigo-900">Official Assessment & Grades</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-indigo-50">
                <p className="text-sm text-slate-500 font-semibold mb-2">Interdisciplinary Work</p>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-bold text-indigo-600">{dashboard.assessment.interdisciplinary}</span>
                  <span className="text-lg text-slate-400 mb-1">/ 100</span>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-indigo-50">
                <p className="text-sm text-slate-500 font-semibold mb-2">Collaboration</p>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-bold text-indigo-600">{dashboard.assessment.collaboration}</span>
                  <span className="text-lg text-slate-400 mb-1">/ 100</span>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-indigo-50">
                <p className="text-sm text-slate-500 font-semibold mb-2">Technical Progress</p>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-bold text-indigo-600">{dashboard.assessment.technical}</span>
                  <span className="text-lg text-slate-400 mb-1">/ 100</span>
                </div>
              </div>
            </div>

            {dashboard.assessment.comments && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-indigo-50">
                <h4 className="text-sm font-bold text-indigo-900 mb-2">Mentor Summary</h4>
                <p className="text-slate-700 leading-relaxed">{dashboard.assessment.comments}</p>
                <p className="text-xs text-slate-400 mt-4 text-right">Evaluated on: {new Date(dashboard.assessment.assessedAt).toLocaleDateString()}</p>
              </div>
            )}
          </section>
        )}

        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-7">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-xl">🔔</div>
            <h3 className="text-2xl font-bold text-slate-950">Live alerts</h3>
          </div>
          <div className="space-y-4">
            {dashboard.alerts && dashboard.alerts.length > 0 ? dashboard.alerts.map((alert, index) => {
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
            }) : (
              <p className="text-slate-500 text-center py-8 bg-slate-50 rounded-2xl">No active alerts.</p>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
