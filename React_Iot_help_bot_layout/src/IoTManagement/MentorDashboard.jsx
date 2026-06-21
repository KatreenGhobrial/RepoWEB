import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import Header from "../UIComponents/Header";
import * as mentorService from "./iotService";

export default function MentorDashboard() {
  const currentUserStr = localStorage.getItem('currentUser');
  const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;
  const [dashData, setDashData] = useState(null);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [feedback, setFeedback] = useState([]);
  const [projectTasks, setProjectTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fbContent, setFbContent] = useState("");
  const [fbSaving, setFbSaving] = useState(false);
  const [fbTaskId, setFbTaskId] = useState("");

  if (!currentUser || currentUser.role !== 'mentor') {
    return <Navigate to="/dashboard" replace />;
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    if (selectedProject) loadProjectDetails(selectedProject);
  }, [selectedProject]);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [dash, projs] = await Promise.all([
        mentorService.getDashboard(),
        mentorService.getProjects()
      ]);
      setDashData(dash.data || dash);
      setProjects(projs.data || projs);
    } catch (err) {
      setError(err.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const loadProjectDetails = async (projectId) => {
    try {
      const [fbReq, tasksReq] = await Promise.all([
        mentorService.getFeedback(projectId).catch(() => ({ data: [] })),
        mentorService.getTasks(projectId).catch(() => ({ data: [] }))
      ]);
      setFeedback(fbReq.data || fbReq || []);
      setProjectTasks(tasksReq.data || tasksReq || []);
    } catch {
      // ignore
    }
  };

  const handleFeedback = async (e) => {
    e.preventDefault();
    if (!selectedProject) return;
    setFbSaving(true);
    try {
      const selectedTask = projectTasks.find(t => t._id === fbTaskId);
      
      let payloadContent = fbContent;
      if (selectedTask) {
        payloadContent = `[Task: ${selectedTask.title}] ` + fbContent;
      }

      await mentorService.giveFeedback({
        projectId: selectedProject,
        content: payloadContent
      });
      setFbContent("");
      setFbTaskId("");
      await loadProjectDetails(selectedProject);
    } catch (err) {
      setError(err.message || "Failed to send feedback");
    } finally {
      setFbSaving(false);
    }
  };

  const handlePhaseChange = async (e, projectId, newPhase) => {
    e.stopPropagation();
    try {
      await mentorService.updateProjectPhase(projectId, newPhase);
      setProjects(projects.map(p => p._id === projectId ? { ...p, phase: newPhase } : p));
    } catch (err) {
      setError("Failed to update phase: " + err.message);
    }
  };

  const generateCSV = () => {
    const headers = ["Project Name", "Status", "Phase", "Device", "Team Members"];
    const rows = projects.map(proj => {
      const team = [];
      if (proj.owner) team.push(proj.owner);
      if (proj.members) team.push(...proj.members);
      const teamNames = team.map(s => s.username || s.name || s.email || s).join('; ');
      return [
        `"${proj.name}"`, 
        `"${proj.status || 'active'}"`, 
        `"${proj.phase}"`, 
        `"${proj.device || 'ESP32'}"`, 
        `"${teamNames}"`
      ].join(",");
    });
    
    const csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "mentor_projects_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
        <Header title="🎓 Mentor Dashboard" subtitle="Oversee student projects and provide guidance" />
        <button onClick={generateCSV} className="mt-4 sm:mt-0 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm self-start sm:self-center">
          📥 Download Report (CSV)
        </button>
      </div>
      
      {error && (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl p-4 text-red-600 dark:text-red-400 text-sm mb-6">
          ⚠️ {error}
        </div>
      )}

      {dashData && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Active Projects", value: dashData.activeProjects, icon: "📂" },
            { label: "Total Students", value: dashData.totalStudents, icon: "👥" },
            { label: "Tasks Completed", value: dashData.completedTasks, icon: "✅" },
            { label: "Avg Reflection", value: (dashData.avgReflection || 0).toFixed(1), icon: "🧠" }
          ].map((stat) => (
            <div key={stat.label} className="bg-white dark:bg-slate-800/30 border border-slate-200 dark:border-white/5 rounded-xl p-5 shadow-sm dark:shadow-none">
              <div className="flex items-center gap-2 mb-2">
                <span>{stat.icon}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">{stat.label}</span>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-3">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">📂 Student Projects</h3>
          {projects.map((proj) => {
            const team = [];
            if (proj.owner) team.push(proj.owner);
            if (proj.members) team.push(...proj.members);
            const teamNamesList = team.map(s => s.username || s.name || s.email || s).filter(Boolean);
            const teamNames = [...new Set(teamNamesList)].join(', ') || 'No students assigned';
            const statusColor = proj.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-500/10 dark:text-slate-400';

            return (
              <button
                key={proj._id}
                onClick={() => setSelectedProject(proj._id)}
                className={`w-full text-left bg-white dark:bg-slate-800/30 border rounded-xl p-4 transition-all hover:bg-slate-50 dark:hover:bg-slate-800/60 shadow-sm dark:shadow-none ${selectedProject === proj._id ? "border-cyan-500 ring-1 ring-cyan-500/30 dark:border-cyan-500/50 dark:ring-cyan-500/20" : "border-slate-200 dark:border-white/5"}`}
              >
                <div className="flex justify-between items-start">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{proj.name}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor} capitalize`}>
                    {proj.status || 'Active'}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <select
                    value={proj.phase || 'ideation'}
                    onChange={(e) => handlePhaseChange(e, proj._id, e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs px-2 py-1 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200 dark:bg-cyan-500/10 dark:text-cyan-400 dark:border-cyan-500/20 focus:outline-none cursor-pointer"
                  >
                    <option value="ideation">Ideation</option>
                    <option value="design">Design</option>
                    <option value="integration">Integration</option>
                    <option value="testing">Testing</option>
                    <option value="reflection">Reflection</option>
                  </select>
                  <span className="text-xs text-slate-500">{proj.device || 'ESP32'}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-3">
                  <span className="font-semibold text-slate-800 dark:text-slate-300">Team: </span>
                  {teamNames}
                </p>
              </button>
            );
          })}
          {projects.length === 0 && !loading && (
            <p className="text-sm text-slate-500 text-center py-8">No projects found</p>
          )}
        </div>

        <div className="lg:col-span-2 space-y-6">
          {selectedProject && (
            <form onSubmit={handleFeedback} className="bg-white dark:bg-slate-800/30 border border-slate-200 dark:border-white/5 rounded-2xl p-6 space-y-4 shadow-sm dark:shadow-none">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">💬 Give Feedback</h3>
              <textarea
                value={fbContent}
                onChange={(e) => setFbContent(e.target.value)}
                rows={3}
                placeholder="Write your feedback for this team..."
                className="w-full bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 resize-none"
                required
              />
              
              <div>
                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1.5">Feedback Type / Link to Task</label>
                <select 
                  value={fbTaskId} 
                  onChange={(e) => setFbTaskId(e.target.value)} 
                  className="w-full bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                >
                  <option value="">📌 General Feedback</option>
                  {projectTasks.map(task => (
                    <option key={task._id} value={task._id}>📌 Task: {task.title}</option>
                  ))}
                </select>
              </div>

              <button 
                type="submit" 
                disabled={fbSaving} 
                className="mt-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-xl font-semibold text-sm disabled:opacity-50 shadow-lg shadow-cyan-500/20"
              >
                {fbSaving ? "Sending..." : "📤 Send Feedback"}
              </button>
            </form>
          )}

          {selectedProject && (
            <div className="bg-white dark:bg-slate-800/30 border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm dark:shadow-none">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-300 mb-3">📊 Task Progress</h3>
              {projectTasks.length > 0 ? (
                <div>
                  <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                    <span>Progress</span>
                    <span>{projectTasks.filter(t => t.status === 'done' || t.status === 'Done').length} / {projectTasks.length} Tasks Completed</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2.5 mb-4">
                    <div 
                      className="bg-cyan-500 h-2.5 rounded-full" 
                      style={{ width: `${Math.round((projectTasks.filter(t => t.status === 'done' || t.status === 'Done').length / projectTasks.length) * 100)}%` }}
                    ></div>
                  </div>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                    {projectTasks.map(task => (
                      <div key={task._id} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-700/30 rounded-lg text-sm">
                        <span className="font-medium text-slate-800 dark:text-slate-200">{task.title}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${task.status === 'done' || task.status === 'Done' ? 'bg-green-100 text-green-700' : task.status === 'in-progress' || task.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-600'}`}>
                          {task.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-500">No tasks created for this project yet.</p>
              )}
            </div>
          )}

          {selectedProject && feedback.length > 0 && (
            <div className="bg-white dark:bg-slate-800/30 border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-sm dark:shadow-none">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-300 mb-3">📋 Feedback History</h3>
              <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                {feedback.map((fb) => {
                  const match = fb.content.match(/^\[Task:\s*(.*?)\]\s*(.*)$/);
                  const relatedTaskTitle = match ? match[1] : fb.relatedTaskTitle;
                  const displayContent = match ? match[2] : fb.content;

                  return (
                  <div key={fb._id} className="bg-slate-50 dark:bg-slate-700/30 rounded-lg p-3">
                    <div className="flex items-center justify-end mb-1">
                      <span className="text-xs text-slate-500">{new Date(fb.createdAt).toLocaleDateString()}</span>
                    </div>
                    {relatedTaskTitle ? (
                      <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        📌 Task: {relatedTaskTitle}
                      </div>
                    ) : (
                      <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        📌 General Feedback
                      </div>
                    )}
                    <p className="text-sm text-slate-700 dark:text-slate-300">{displayContent}</p>
                  </div>
                  );
                })}
              </div>
            </div>
          )}

          {!selectedProject && (
            <div className="bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-white/5 rounded-2xl p-12 text-center shadow-sm dark:shadow-none">
              <span className="text-4xl">👈</span>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-300 mt-4">Select a Project</h3>
              <p className="text-sm text-slate-500 mt-2">Choose a student project from the list to view details and provide feedback.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

