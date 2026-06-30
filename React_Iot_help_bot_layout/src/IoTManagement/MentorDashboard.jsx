import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import Header from "../UIComponents/Header";
import LabeledInput from '../UIComponents/LabeledInput';
import * as mentorService from "./iotService";

export default function MentorDashboard() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
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
  const [projectProgress, setProjectProgress] = useState({});
  const [assessment, setAssessment] = useState({ interdisciplinary: 0, collaboration: 0, technical: 0, comments: '' });
  const [assessmentSaving, setAssessmentSaving] = useState(false);

  if (currentUser?.role !== 'mentor') return <Navigate to="/dashboard" replace />;

  useEffect(() => {
    setLoading(true);
    Promise.all([mentorService.getDashboard(), mentorService.getProjects()])
      .then(async ([d, p]) => { 
        setDashData(d.data || d); 
        const projs = p.data || p;
        setProjects(projs); 
        
        const progressMap = {};
        await Promise.all(projs.map(async (proj) => {
          try {
            const t = await mentorService.getTasks(proj._id);
            const tasks = t.data || t || [];
            if (tasks.length === 0) progressMap[proj._id] = { completed: 0, total: 0, percent: 0 };
            else {
              const completed = tasks.filter(tk => tk.status?.toLowerCase() === 'done').length;
              progressMap[proj._id] = { completed, total: tasks.length, percent: Math.round((completed / tasks.length) * 100) };
            }
          } catch { progressMap[proj._id] = { completed: 0, total: 0, percent: 0 }; }
        }));
        setProjectProgress(progressMap);
      })
      .catch(e => setError(e.message || "Failed to load dashboard"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedProject) return;
    const p = projects.find(x => x._id === selectedProject);
    if (p && p.assessment) {
      setAssessment({
        interdisciplinary: p.assessment.interdisciplinary || 0,
        collaboration: p.assessment.collaboration || 0,
        technical: p.assessment.technical || 0,
        comments: p.assessment.comments || ''
      });
    } else {
      setAssessment({ interdisciplinary: 0, collaboration: 0, technical: 0, comments: '' });
    }

    Promise.all([mentorService.getFeedback(selectedProject), mentorService.getTasks(selectedProject)])
      .then(([f, t]) => { setFeedback(f.data || f || []); setProjectTasks(t.data || t || []); })
      .catch(() => {});
  }, [selectedProject, projects]);

  const handleFeedback = async (e) => {
    e.preventDefault();
    if (!selectedProject) return;
    setFbSaving(true);
    try {
      const task = projectTasks.find(t => t._id === fbTaskId);
      const content = task ? `[Task: ${task.title}] ${fbContent}` : fbContent;
      await mentorService.giveFeedback({ projectId: selectedProject, content });
      setFbContent(""); setFbTaskId("");
      const f = await mentorService.getFeedback(selectedProject);
      setFeedback(f.data || f || []);
    } catch (err) { setError(err.message || "Failed to send feedback"); }
    finally { setFbSaving(false); }
  };

  const handlePhaseChange = async (e, projectId, newPhase) => {
    e.stopPropagation();
    try {
      await mentorService.updateProjectPhase(projectId, newPhase);
      setProjects(projects.map(p => p._id === projectId ? { ...p, phase: newPhase } : p));
    } catch (err) { setError("Failed to update phase: " + err.message); }
  };

  const handleAssessmentSave = async (e) => {
    e.preventDefault();
    if (!selectedProject) return;
    setAssessmentSaving(true);
    try {
      const data = { ...assessment, assessor: currentUser?._id };
      await mentorService.submitProjectAssessment(selectedProject, data);
      setProjects(prev => prev.map(p => p._id === selectedProject ? { ...p, assessment: { ...data, assessedAt: new Date().toISOString() } } : p));
    } catch (err) {
      setError(err.message || "Failed to save assessment");
    } finally {
      setAssessmentSaving(false);
    }
  };

  const generateCSV = () => {
    const rows = projects.map(p => {
      const team = [p.owner, ...(p.members || [])].filter(Boolean).map(s => s.username || s.name || s.email || s).join('; ');
      return `"${p.name}","${p.status || 'active'}","${p.phase}","${p.device || 'ESP32'}","${team}"`;
    });
    const csv = "data:text/csv;charset=utf-8,Project Name,Status,Phase,Device,Team Members\n" + rows.join("\n");
    const a = document.createElement("a");
    a.href = encodeURI(csv);
    a.download = "mentor_projects_report.csv";
    document.body.appendChild(a); a.click(); a.remove();
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
        <Header title="🎓 Mentor Dashboard" subtitle="Oversee student projects and provide guidance" />
        <button onClick={generateCSV} className="mt-4 sm:mt-0 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm">
          📥 Download Report (CSV)
        </button>
      </div>
      
      {error && <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-sm mb-6">⚠️ {error}</div>}

      {dashData && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { l: "Active Projects", v: dashData.activeProjects, i: "📂" },
            { l: "Total Students", v: dashData.totalStudents, i: "👥" },
            { l: "Tasks Completed", v: dashData.completedTasks, i: "✅" },
            { l: "Avg Reflection", v: (dashData.avgReflection || 0).toFixed(1), i: "🧠" }
          ].map(s => (
            <div key={s.l} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-2"><span>{s.i}</span><span className="text-xs text-slate-500">{s.l}</span></div>
              <p className="text-2xl font-bold">{s.v}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-3">
          <h3 className="text-sm font-semibold text-slate-700 mb-2">📂 Student Projects</h3>
          {projects.map(p => {
            const team = [p.owner, ...(p.members || [])].filter(Boolean).map(s => s.username || s.name || s.email || s);
            const progress = projectProgress[p._id] || { completed: 0, total: 0, percent: 0 };
            return (
              <button key={p._id} onClick={() => setSelectedProject(p._id)} className={`w-full text-left bg-white border rounded-xl p-4 transition-all hover:bg-slate-50 shadow-sm ${selectedProject === p._id ? "border-cyan-500 ring-1 ring-cyan-500/30" : "border-slate-200"}`}>
                <div className="flex justify-between items-start">
                  <p className="text-sm font-medium">{p.name}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${p.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>{p.status || 'Active'}</span>
                </div>
                
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>Progress</span>
                    <span>{progress.percent}% ({progress.completed}/{progress.total})</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5">
                    <div className="bg-cyan-500 h-1.5 rounded-full transition-all" style={{ width: `${progress.percent}%` }}></div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-3">
                  <select value={p.phase || 'ideation'} onChange={e => handlePhaseChange(e, p._id, e.target.value)} onClick={e => e.stopPropagation()} className="text-xs px-2 py-1 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200 outline-none cursor-pointer">
                    <option value="ideation">Ideation</option><option value="design">Design</option><option value="integration">Integration</option><option value="testing">Testing</option><option value="reflection">Reflection</option>
                  </select>
                  <span className="text-xs text-slate-500">{p.device || 'ESP32'}</span>
                </div>
                <p className="text-xs text-slate-600 mt-3"><span className="font-semibold text-slate-800">Team: </span>{[...new Set(team)].join(', ') || 'None'}</p>
              </button>
            );
          })}
          {!projects.length && !loading && <p className="text-sm text-slate-500 text-center py-8">No projects found</p>}
        </div>

        <div className="lg:col-span-2 space-y-6">
          {selectedProject ? (
            <>
              <form onSubmit={handleFeedback} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
                <h3 className="font-semibold">💬 Give Feedback</h3>
                <LabeledInput label="Feedback Content">
                    <textarea value={fbContent} onChange={e => setFbContent(e.target.value)} rows={3} placeholder="Write feedback..." className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-cyan-500 resize-none" required />
                </LabeledInput>
                <LabeledInput label="Link to Task">
                  <select value={fbTaskId} onChange={e => setFbTaskId(e.target.value)} className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none">
                    <option value="">📌 General Feedback</option>
                    {projectTasks.map(t => <option key={t._id} value={t._id}>📌 Task: {t.title}</option>)}
                  </select>
                </LabeledInput>
                <button type="submit" disabled={fbSaving} className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-xl font-semibold text-sm shadow-lg shadow-cyan-500/20 disabled:opacity-50">{fbSaving ? "Sending..." : "📤 Send Feedback"}</button>
              </form>

              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-sm font-semibold mb-3">📊 Task Progress</h3>
                {projectTasks.length ? (
                  <div>
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span>Progress</span><span>{projectTasks.filter(t => t.status?.toLowerCase() === 'done').length} / {projectTasks.length} Done</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 mb-4"><div className="bg-cyan-500 h-2.5 rounded-full" style={{ width: `${Math.round((projectTasks.filter(t => t.status?.toLowerCase() === 'done').length / projectTasks.length) * 100)}%` }}></div></div>
                    <div className="space-y-2 max-h-40 overflow-auto">
                      {projectTasks.map(t => (
                        <div key={t._id} className="flex justify-between p-2 bg-slate-50 rounded-lg text-sm">
                          <span className="font-medium">{t.title}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${t.status?.toLowerCase() === 'done' ? 'bg-green-100 text-green-700' : 'bg-slate-200'}`}>{t.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : <p className="text-sm text-slate-500">No tasks yet.</p>}
              </div>

              {feedback.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                  <h3 className="text-sm font-semibold mb-3">📋 Feedback History</h3>
                  <div className="space-y-3 max-h-60 overflow-auto">
                    {feedback.map(fb => {
                      const m = fb.content.match(/^\[Task:\s*(.*?)\]\s*(.*)$/);
                      return (
                        <div key={fb._id} className="bg-slate-50 rounded-lg p-3 text-sm">
                          <div className="text-right text-xs text-slate-500 mb-1">{new Date(fb.createdAt).toLocaleDateString()}</div>
                          <div className="text-xs font-semibold text-slate-600 mb-1">📌 {m ? `Task: ${m[1]}` : fb.relatedTaskTitle ? `Task: ${fb.relatedTaskTitle}` : 'General Feedback'}</div>
                          <p className="text-slate-700">{m ? m[2] : fb.content}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <form onSubmit={handleAssessmentSave} className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-indigo-900 mb-4 flex items-center gap-2">🎓 Official Assessment & Grading</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm text-indigo-900 font-semibold mb-1">
                      <label>Interdisciplinary Work</label><span>{assessment.interdisciplinary} / 100</span>
                    </div>
                    <input type="range" min="0" max="100" value={assessment.interdisciplinary} onChange={e => setAssessment({...assessment, interdisciplinary: Number(e.target.value)})} className="w-full accent-indigo-600" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm text-indigo-900 font-semibold mb-1">
                      <label>Collaboration</label><span>{assessment.collaboration} / 100</span>
                    </div>
                    <input type="range" min="0" max="100" value={assessment.collaboration} onChange={e => setAssessment({...assessment, collaboration: Number(e.target.value)})} className="w-full accent-indigo-600" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm text-indigo-900 font-semibold mb-1">
                      <label>Technical Progress</label><span>{assessment.technical} / 100</span>
                    </div>
                    <input type="range" min="0" max="100" value={assessment.technical} onChange={e => setAssessment({...assessment, technical: Number(e.target.value)})} className="w-full accent-indigo-600" />
                  </div>
                  <LabeledInput label="Final Evaluation Comments">
                    <textarea value={assessment.comments} onChange={e => setAssessment({...assessment, comments: e.target.value})} rows={3} placeholder="Provide an official summary of their work..." className="w-full border border-indigo-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-500 resize-none bg-white/80" />
                  </LabeledInput>
                  <button type="submit" disabled={assessmentSaving} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-md transition-colors disabled:opacity-50">
                    {assessmentSaving ? "Saving..." : "💾 Save Official Grades"}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
              <span className="text-4xl">👈</span>
              <h3 className="text-lg font-semibold mt-4">Select a Project</h3>
              <p className="text-sm text-slate-500 mt-2">Choose a student project to view details and provide feedback.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
