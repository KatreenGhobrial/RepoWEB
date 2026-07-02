import { useState, useEffect } from 'react';
import Header from './Header';
import { listByProject as listTasks } from '../ProjectManagement/taskService';
import { getFeedback } from '../IoTManagement/iotService';
import { useProject } from '../hooks/ProjectContext';

export default function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const { allProjects, selectedProjectId, selectedProject } = useProject();

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
            workload: [],
            evaluation: null
          });
          setLoading(false);
          return;
        }

        // Use selected project from context
        const proj = selectedProject;

        // Fetch tasks and feedback for the selected project
        let totalTasks = 0;
        let completedTasks = 0;
        let inProgressTasks = 0;
        let todoTasks = 0;
        let memberWorkload = {};
        let feedbacks = [];

        if (proj) {
          try {
            const tasks = await listTasks(proj._id);
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
            feedbacks = await getFeedback(proj._id);
          } catch (e) { console.error('Feedback fetch error:', e); }
        }

        const progressPercentage = totalTasks === 0 ? 0 : Math.round(((completedTasks + (inProgressTasks * 0.5)) / totalTasks) * 100);

        const assessment = proj ? proj.assessment : null;

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
          documentationStatus: allProjects.length > 0 ? 'Active' : 'No projects',
          progress: [],
          alerts: [],
          feedbacks: feedbacks,
          assessment: assessment,
          evaluation: proj?.evaluation || null
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
          assessment: null,
          evaluation: null
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [selectedProjectId]);

  if (loading || !dashboard) return <div className="flex items-center justify-center p-12"><p className="text-slate-500 dark:text-slate-400 text-lg">Loading dashboard...</p></div>;

  return (
    <>
      <Header title="IoT Help Bot" subtitle="Manage architecture, detect IoT risks, and support collaboration." />

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm p-7">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-lg mb-3">Detected Issues</p>
              <h3 className="text-5xl font-bold text-slate-950 dark:text-white">{dashboard.detectedIssues}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-lg mt-3">Auto-detected from architecture</p>
            </div>
            <div className="w-14 h-14 bg-slate-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center text-2xl">⚠️</div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm p-7">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-lg mb-3">Project Progress</p>
              <h3 className="text-5xl font-bold text-slate-950 dark:text-white">{dashboard.tasksStats?.progressPercentage || 0}%</h3>
              <p className="text-slate-500 dark:text-slate-400 text-lg mt-3">{dashboard.tasksStats?.done || 0}/{dashboard.tasksStats?.total || 0} tasks done</p>
            </div>
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path className="text-slate-100" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="text-cyan-500 transition-all duration-1000 ease-out" strokeDasharray={`${dashboard.tasksStats?.progressPercentage || 0}, 100`} strokeWidth="4" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm p-7">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-lg mb-3">Documentation Status</p>
              <h3 className="text-5xl font-bold text-slate-950 dark:text-white">{dashboard.documentationStatus}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-lg mt-3">Requirements and notes available</p>
            </div>
            <div className="w-14 h-14 bg-slate-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center text-2xl">📄</div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Task Status Distribution */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm p-7">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-slate-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center text-xl">📊</div>
            <h3 className="text-2xl font-bold text-slate-950 dark:text-white">Task Distribution</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between text-sm font-semibold">
              <span className="text-slate-500 dark:text-slate-400">To Do</span>
              <span>{dashboard.tasksStats?.todo || 0}</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-zinc-800 rounded-full h-3">
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
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm p-7">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-slate-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center text-xl">👥</div>
            <h3 className="text-2xl font-bold text-slate-950 dark:text-white">Team Workload</h3>
          </div>
          <div className="space-y-6">
            {dashboard.workload && dashboard.workload.length > 0 ? dashboard.workload.map((wl, idx) => (
              <div key={idx}>
                <div className="flex justify-between text-sm font-semibold mb-2">
                  <span className="text-slate-900">{wl.name}</span>
                  <span className="text-slate-500 dark:text-slate-400">{wl.total} tasks</span>
                </div>
                <div className="w-full flex h-4 rounded-full overflow-hidden bg-slate-100 dark:bg-zinc-800">
                  <div className="bg-green-500 h-full transition-all duration-1000" style={{ width: `${wl.total ? (wl.done / wl.total) * 100 : 0}%` }} title={`Done: ${wl.done}`}></div>
                  <div className="bg-yellow-400 h-full transition-all duration-1000" style={{ width: `${wl.total ? (wl.inProgress / wl.total) * 100 : 0}%` }} title={`In Progress: ${wl.inProgress}`}></div>
                  <div className="bg-slate-300 h-full transition-all duration-1000" style={{ width: `${wl.total ? (wl.todo / wl.total) * 100 : 0}%` }} title={`To Do: ${wl.todo}`}></div>
                </div>
              </div>
            )) : (
              <p className="text-slate-500 dark:text-slate-400 text-center py-8">No tasks assigned yet.</p>
            )}
          </div>
        </div>
      </section>

      {/* Evaluation and Grades Section */}
      <section className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm p-7 mb-8">
        <div className="flex items-center gap-4 mb-6 border-b pb-4">
          <div className="w-12 h-12 bg-slate-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center text-xl">🏆</div>
          <div>
            <h3 className="text-2xl font-bold text-slate-950 dark:text-white">Evaluation & Grades / הערכה וציונים</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Assessments of interdisciplinary work, cooperation, and technical progress</p>
          </div>
        </div>

        {(!dashboard.evaluation || 
          (dashboard.evaluation.interdisciplinaryScore === 0 && 
           dashboard.evaluation.cooperationScore === 0 && 
           dashboard.evaluation.technicalScore === 0)) ? (
          <div className="text-center py-10 bg-slate-50 dark:bg-zinc-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800">
            <span className="text-4xl mb-3 block">🏁</span>
            <h4 className="font-bold text-slate-800 text-sm mb-1">Evaluation Pending / הערכה בהמתנה</h4>
            <p className="text-slate-500 dark:text-slate-400 text-xs max-w-md mx-auto">
              Your project evaluation is pending. Once your mentor submits your interdisciplinary, cooperation, and technical grades, they will display here in real-time.
            </p>
          </div>
        ) : (
          (() => {
            const inter = dashboard.evaluation.interdisciplinaryScore || 0;
            const coop = dashboard.evaluation.cooperationScore || 0;
            const tech = dashboard.evaluation.technicalScore || 0;
            const avgScore = Math.round((inter + coop + tech) / 3);

            return (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Average Gauge Left */}
                <div className="md:col-span-1 flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-zinc-800/50 rounded-2xl border border-slate-100 shadow-inner">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4">Overall Score / ציון משוקלל</span>
                  <div className="relative w-28 h-28 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path className="text-slate-200" strokeWidth="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      <path className="text-cyan-500 transition-all duration-1000 ease-out" strokeDasharray={`${avgScore}, 100`} strokeWidth="3.5" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    </svg>
                    <div className="absolute text-center">
                      <span className="text-3xl font-extrabold text-slate-800">{avgScore}</span>
                      <span className="text-slate-400 text-xs block">/ 100</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-5 text-center">
                    Graded by <span className="font-bold text-slate-700">{dashboard.evaluation.gradedBy?.username || 'Mentor'}</span>
                    {dashboard.evaluation.gradedAt && ` on ${new Date(dashboard.evaluation.gradedAt).toLocaleDateString()}`}
                  </p>
                </div>

                {/* Score Breakdown Right */}
                <div className="md:col-span-2 space-y-6">
                  {/* Metric 1 */}
                  <div className="space-y-2 hover:scale-[1.01] transition-transform duration-200">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-800">💡 Quality of Interdisciplinary Work / איכות העבודה הבין-תחומית</span>
                      <span className="px-2 py-0.5 bg-cyan-100 text-cyan-800 font-bold rounded-md">{inter}/100</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-zinc-800 rounded-full h-2.5">
                      <div className="bg-gradient-to-r from-cyan-400 to-cyan-500 h-2.5 rounded-full" style={{ width: `${inter}%` }}></div>
                    </div>
                    {dashboard.evaluation.interdisciplinaryNotes && (
                      <div className="bg-slate-50 dark:bg-zinc-800/50 border-l-2 border-cyan-400 p-2 rounded-r-lg text-slate-600 text-xs italic">
                        "{dashboard.evaluation.interdisciplinaryNotes}"
                      </div>
                    )}
                  </div>

                  {/* Metric 2 */}
                  <div className="space-y-2 hover:scale-[1.01] transition-transform duration-200">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-800">🤝 Cooperation & Collaboration / שיתוף הפעולה</span>
                      <span className="px-2 py-0.5 bg-violet-100 text-violet-800 font-bold rounded-md">{coop}/100</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-zinc-800 rounded-full h-2.5">
                      <div className="bg-gradient-to-r from-violet-400 to-violet-500 h-2.5 rounded-full" style={{ width: `${coop}%` }}></div>
                    </div>
                    {dashboard.evaluation.cooperationNotes && (
                      <div className="bg-slate-50 dark:bg-zinc-800/50 border-l-2 border-violet-400 p-2 rounded-r-lg text-slate-600 text-xs italic">
                        "{dashboard.evaluation.cooperationNotes}"
                      </div>
                    )}
                  </div>

                  {/* Metric 3 */}
                  <div className="space-y-2 hover:scale-[1.01] transition-transform duration-200">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-800">⚙️ Technical Progress / ההתקדמות הטכנית</span>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-md">{tech}/100</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-zinc-800 rounded-full h-2.5">
                      <div className="bg-gradient-to-r from-emerald-400 to-emerald-500 h-2.5 rounded-full" style={{ width: `${tech}%` }}></div>
                    </div>
                    {dashboard.evaluation.technicalNotes && (
                      <div className="bg-slate-50 dark:bg-zinc-800/50 border-l-2 border-emerald-400 p-2 rounded-r-lg text-slate-600 text-xs italic">
                        "{dashboard.evaluation.technicalNotes}"
                      </div>
                    )}
                  </div>

                  {/* Summary Notes */}
                  {dashboard.evaluation.summaryNotes && (
                    <div className="mt-4 p-4 bg-gradient-to-r from-slate-50 to-slate-100/50 rounded-2xl border border-slate-200 dark:border-zinc-800/60">
                      <h4 className="text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                        <span>📝</span> Overall Summary / הערות סיכום מהמנטור
                      </h4>
                      <p className="text-slate-600 text-xs leading-relaxed whitespace-pre-line">{dashboard.evaluation.summaryNotes}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })()
        )}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm p-7">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-slate-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center text-xl">💬</div>
            <h3 className="text-2xl font-bold text-slate-950 dark:text-white">Mentor Feedback</h3>
          </div>
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            {dashboard.feedbacks && dashboard.feedbacks.length > 0 ? (
              dashboard.feedbacks.map((fb, index) => {
                const match = fb.content.match(/^\[Task:\s*(.*?)\]\s*(.*)$/);
                const relatedTaskTitle = match ? match[1] : fb.relatedTaskTitle;
                const displayContent = match ? match[2] : fb.content;

                return (
                <div key={index} className="border border-slate-100 bg-slate-50 dark:bg-zinc-800/50 rounded-3xl p-5">
                  <div className="flex items-center justify-end mb-1">
                    <span className="text-xs text-slate-500 dark:text-slate-400">{new Date(fb.createdAt).toLocaleDateString()}</span>
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
              <p className="text-slate-500 dark:text-slate-400 text-center py-8 bg-slate-50 dark:bg-zinc-800/50 rounded-2xl">No feedback received yet.</p>
            )}
          </div>
        </section>

        {dashboard.assessment && dashboard.assessment.assessedAt && (
          <section className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl border border-indigo-100 shadow-sm p-7 col-span-1 lg:col-span-2">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-white dark:bg-zinc-900 rounded-2xl flex items-center justify-center text-xl shadow-sm">🎓</div>
              <h3 className="text-2xl font-bold text-indigo-900">Official Assessment & Grades</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 shadow-sm border border-indigo-50">
                <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold mb-2">Interdisciplinary Work</p>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-bold text-indigo-600">{dashboard.assessment.interdisciplinary}</span>
                  <span className="text-lg text-slate-400 mb-1">/ 100</span>
                </div>
              </div>
              <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 shadow-sm border border-indigo-50">
                <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold mb-2">Collaboration</p>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-bold text-indigo-600">{dashboard.assessment.collaboration}</span>
                  <span className="text-lg text-slate-400 mb-1">/ 100</span>
                </div>
              </div>
              <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 shadow-sm border border-indigo-50">
                <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold mb-2">Technical Progress</p>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-bold text-indigo-600">{dashboard.assessment.technical}</span>
                  <span className="text-lg text-slate-400 mb-1">/ 100</span>
                </div>
              </div>
            </div>

            {dashboard.assessment.comments && (
              <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-sm border border-indigo-50">
                <h4 className="text-sm font-bold text-indigo-900 mb-2">Mentor Summary</h4>
                <p className="text-slate-700 leading-relaxed">{dashboard.assessment.comments}</p>
                <p className="text-xs text-slate-400 mt-4 text-right">Evaluated on: {new Date(dashboard.assessment.assessedAt).toLocaleDateString()}</p>
              </div>
            )}
          </section>
        )}

        <section className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm p-7">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-slate-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center text-xl">🔔</div>
            <h3 className="text-2xl font-bold text-slate-950 dark:text-white">Live alerts</h3>
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
              <p className="text-slate-500 dark:text-slate-400 text-center py-8 bg-slate-50 dark:bg-zinc-800/50 rounded-2xl">No active alerts.</p>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
