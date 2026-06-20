import { useState, useEffect } from 'react';
import Header from '../UIComponents/Header';
import * as projectService from './projectService';

export default function ProjectSetup() {
  const [setup, setSetup] = useState(null);
  const [projectId, setProjectId] = useState(null);
  const [formData, setFormData] = useState({
    projectName: '',
    device: '',
    protocol: '',
    database: '',
    powerSource: '',
    membersText: '',
    requirements: ''
  });
  const [summaryData, setSummaryData] = useState({ ...formData });
  const [message, setMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [allProjects, setAllProjects] = useState([]);
  const [conflicts, setConflicts] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisMsg, setAnalysisMsg] = useState('');

  const currentUserStr = localStorage.getItem('currentUser');
  const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;

  useEffect(() => {
    const fetchExistingProject = async () => {
      try {
        if (!currentUser) {
          setDefaultBlank();
          return;
        }
        
        const projectsRes = await fetch('http://localhost:5000/api/projects', {
          headers: { 'x-user-id': currentUser._id }
        });
        
        if (projectsRes.ok) {
          const projects = await projectsRes.json();
          if (projects && projects.length > 0) {
            setAllProjects(projects);
            loadProjectToForm(projects[0]);
            return;
          }
        }
        setDefaultBlank();
      } catch (err) {
        console.error("Failed to load existing project", err);
        setDefaultBlank();
      }
    };

    fetchExistingProject();
  }, []);

  const loadProjectToForm = (proj) => {
    const projData = {
      projectName: proj.name || '',
      device: proj.device || 'ESP32',
      protocol: proj.protocol || 'HTTP',
      database: proj.database || 'MongoDB',
      powerSource: proj.powerSource || 'Battery',
      membersText: (proj.members || []).map(m => m.email || m.username).join(', '),
      requirements: proj.description || ''
    };
    setProjectId(proj._id);
    setFormData(projData);
    setSummaryData(projData);
    setSetup({
      flow: [
        { name: 'Device', icon: '📱', description: projData.device },
        { name: 'Protocol', icon: '📡', description: projData.protocol },
        { name: 'Gateway', icon: '🌐', description: 'Wi-Fi' },
        { name: 'Backend', icon: '⚙️', description: 'Node.js' },
        { name: 'Database', icon: '🗄️', description: projData.database }
      ]
    });
  };

  const handleProjectSelect = (e) => {
    if (e.target.value === 'new') {
      setProjectId(null);
      const defaultData = {
        projectName: '',
        device: 'ESP32',
        protocol: 'HTTP',
        database: 'MongoDB',
        powerSource: 'Battery',
        membersText: '',
        requirements: ''
      };
      setFormData(defaultData);
      setSummaryData(defaultData);
      setSetup({
        flow: [
          { name: 'Device', icon: '📱', description: defaultData.device },
          { name: 'Protocol', icon: '📡', description: defaultData.protocol },
          { name: 'Gateway', icon: '🌐', description: 'Wi-Fi' },
          { name: 'Backend', icon: '⚙️', description: 'Node.js' },
          { name: 'Database', icon: '🗄️', description: defaultData.database }
        ]
      });
    } else {
      const selected = allProjects.find(p => p._id === e.target.value);
      if (selected) {
        loadProjectToForm(selected);
      }
    }
  };

  const setDefaultBlank = () => {
    const defaultData = {
      projectName: '',
      device: 'ESP32',
      protocol: 'HTTP',
      database: 'MongoDB',
      powerSource: 'Battery',
      membersText: '',
      requirements: ''
    };
    
    setFormData(defaultData);
    setSummaryData(defaultData);
    setSetup({
      flow: [
        { name: 'Device', icon: '📱', description: defaultData.device },
        { name: 'Protocol', icon: '📡', description: defaultData.protocol },
        { name: 'Gateway', icon: '🌐', description: 'Wi-Fi' },
        { name: 'Backend', icon: '⚙️', description: 'Node.js' },
        { name: 'Database', icon: '🗄️', description: defaultData.database }
      ]
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage('');

    try {
      const parsedMemberEmails = formData.membersText
        ? formData.membersText.split(',').map(n => n.trim()).filter(n => n)
        : [];

      if (projectId) {
        // Update existing project
        await projectService.update(projectId, {
          name: formData.projectName,
          device: formData.device,
          protocol: formData.protocol,
          database: formData.database,
          powerSource: formData.powerSource,
          memberEmails: parsedMemberEmails,
          ownerEmail: currentUser?.email,
          description: formData.requirements
        });
        setSummaryData(formData);
        setFormData(prev => ({ ...prev, membersText: '' }));
        setMessage('✅ Project updated and saved to database!');
      } else {
        // Create new project
        const newProjRes = await projectService.create({
          name: formData.projectName,
          device: formData.device,
          protocol: formData.protocol,
          database: formData.database,
          powerSource: formData.powerSource,
          sensors: ['DHT22'],
          description: formData.requirements || `IoT project using ${formData.device} with ${formData.protocol}`,
          memberEmails: parsedMemberEmails,
          ownerEmail: currentUser?.email
        });
        const newProj = newProjRes.data || newProjRes;
        setProjectId(newProj._id);
        setSummaryData(formData);
        setMessage('✅ New project created and saved to database!');
      }
    } catch (err) {
      console.error('Save project error:', err);
      setMessage(err.message || 'Error saving project.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setConflicts([]);
    setAnalysisMsg('');
    try {
      const res = await fetch('http://localhost:5000/api/bot/detect-conflicts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          device: formData.device,
          protocol: formData.protocol,
          database: formData.database,
          powerSource: formData.powerSource,
          sensors: ['DHT22']
        })
      });
      const data = await res.json();
      if (res.ok && data.conflicts) {
        setConflicts(data.conflicts);
        setAnalysisMsg(`Found ${data.conflicts.filter(c => c.level !== 'LOW').length} issue(s).`);
      } else {
        throw new Error('No response');
      }
    } catch {
      // Fallback: local rules
      const local = [];
      if (formData.powerSource === 'Battery' && formData.protocol === 'HTTP')
        local.push({ title: 'HTTP on Battery is power-hungry', level: 'HIGH', reason: 'HTTP has large overhead vs MQTT. Battery devices drain faster.', suggestion: 'Have you calculated energy per request with HTTP vs MQTT?' });
      if (formData.device === 'Arduino Uno' && formData.protocol !== 'HTTP')
        local.push({ title: 'Arduino has no built-in WiFi', level: 'HIGH', reason: 'Arduino Uno requires an external WiFi module for any network protocol.', suggestion: 'What WiFi module are you adding? Have you considered ESP32 instead?' });
      if (formData.device === 'Raspberry Pi' && formData.powerSource === 'Battery')
        local.push({ title: 'Raspberry Pi on Battery', level: 'HIGH', reason: 'RPi draws 2.5–5W continuously, making battery operation impractical.', suggestion: 'How many hours does your battery last? Is wall power an option?' });
      if (local.length === 0)
        local.push({ title: 'No major conflicts detected', level: 'LOW', reason: 'Configuration looks reasonable.', suggestion: 'Have you stress-tested the system under realistic conditions?' });
      setConflicts(local);
      setAnalysisMsg(`Found ${local.filter(c => c.level !== 'LOW').length} issue(s) (offline mode).`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!setup) return <div className="flex items-center justify-center p-12"><p className="text-slate-500 text-lg">Loading project...</p></div>;

  return (
    <>
      <Header title="IoT Help Bot" subtitle="Manage architecture, detect IoT risks, and support collaboration." />

      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-7 mb-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-xl">🔗</div>
          <h3 className="text-2xl font-bold text-slate-950">Architecture flow</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {setup.flow.map((item, index) => (
            <div key={index} className="border border-slate-200 rounded-2xl p-5 text-center bg-slate-50">
              <p className="text-3xl mb-3">{item.icon}</p>
              <h4 className="font-bold text-slate-900">{item.name}</h4>
              <p className="text-sm text-slate-500 mt-2">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-7">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-slate-950">Basic project details</h3>
            {allProjects.length > 0 && (
              <select 
                className="border border-slate-300 rounded-xl px-3 py-1.5 text-sm font-semibold bg-slate-50 focus:ring-2 focus:ring-cyan-500 outline-none"
                value={projectId || 'new'}
                onChange={handleProjectSelect}
              >
                {allProjects.map(p => (
                  <option key={p._id} value={p._id}>{p.name}</option>
                ))}
                <option value="new">+ Create New Project</option>
              </select>
            )}
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Project Name</label>
              <input
                type="text"
                className="w-full border border-slate-300 rounded-2xl px-4 py-3"
                value={formData.projectName}
                onChange={e => setFormData({ ...formData, projectName: e.target.value })}
                placeholder="IoT Help Bot"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Specific Requirements</label>
              <textarea
                className="w-full border border-slate-300 rounded-2xl px-4 py-3"
                rows="3"
                value={formData.requirements}
                onChange={e => setFormData({ ...formData, requirements: e.target.value })}
                placeholder="Enter specific project requirements (e.g., must run on solar power, requires latency <50ms)"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Main Device</label>
              <select
                className="w-full border border-slate-300 rounded-2xl px-4 py-3"
                value={formData.device}
                onChange={e => setFormData({ ...formData, device: e.target.value })}
              >
                <option>ESP32</option>
                <option>Arduino Uno</option>
                <option>Raspberry Pi</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Communication Protocol</label>
              <select
                className="w-full border border-slate-300 rounded-2xl px-4 py-3"
                value={formData.protocol}
                onChange={e => setFormData({ ...formData, protocol: e.target.value })}
              >
                <option>HTTP</option>
                <option>MQTT</option>
                <option>CoAP</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Database</label>
              <select
                className="w-full border border-slate-300 rounded-2xl px-4 py-3"
                value={formData.database}
                onChange={e => setFormData({ ...formData, database: e.target.value })}
              >
                <option>MongoDB</option>
                <option>MySQL</option>
                <option>Firebase</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Power Source</label>
              <select
                className="w-full border border-slate-300 rounded-2xl px-4 py-3"
                value={formData.powerSource}
                onChange={e => setFormData({ ...formData, powerSource: e.target.value })}
              >
                <option>Battery</option>
                <option>USB Power</option>
                <option>Wall Adapter</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Add Team Members (Emails or Usernames)</label>
              <input
                type="text"
                className="w-full border border-slate-300 rounded-2xl px-4 py-3"
                value={formData.membersText}
                onChange={e => setFormData({ ...formData, membersText: e.target.value })}
                placeholder="student1@example.com, john_doe"
              />
            </div>
            {message && <p className="text-sm text-green-500">{message}</p>}
            <button type="submit" disabled={isSaving} className="w-full bg-slate-950 text-white py-3 rounded-2xl font-bold hover:bg-slate-800 disabled:opacity-50">
              {isSaving ? '⏳ Saving...' : projectId ? 'Update project' : 'Create project'}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-7">
          <h3 className="text-2xl font-bold text-slate-950 mb-6">Current architecture summary</h3>
          <div className="space-y-4">
            <div className="border border-slate-200 rounded-2xl p-5">
              <p className="text-sm text-slate-400 mb-1">Project</p>
              <p className="text-xl font-bold text-slate-900">{summaryData.projectName}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="border border-slate-200 rounded-2xl p-5">
                <p className="text-sm text-slate-400 mb-1">Device</p>
                <p className="font-bold text-slate-900">{summaryData.device}</p>
              </div>
              <div className="border border-slate-200 rounded-2xl p-5">
                <p className="text-sm text-slate-400 mb-1">Protocol</p>
                <p className="font-bold text-slate-900">{summaryData.protocol}</p>
              </div>
              <div className="border border-slate-200 rounded-2xl p-5">
                <p className="text-sm text-slate-400 mb-1">Database</p>
                <p className="font-bold text-slate-900">{summaryData.database}</p>
              </div>
              <div className="border border-slate-200 rounded-2xl p-5">
                <p className="text-sm text-slate-400 mb-1">Power</p>
                <p className="font-bold text-slate-900">{summaryData.powerSource}</p>
              </div>
            </div>
            {summaryData.requirements && (
              <div className="border border-slate-200 rounded-2xl p-5 mt-4">
                <p className="text-sm text-slate-400 mb-1">Specific Requirements</p>
                <p className="font-bold text-slate-900 whitespace-pre-wrap">{summaryData.requirements}</p>
              </div>
            )}
            {projectId && (
              <p className="text-xs text-green-500 text-center mt-2">🔗 Connected to MongoDB</p>
            )}
          </div>
        </div>
      </section>

      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-7 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-xl">🔍</div>
            <div>
              <h3 className="text-2xl font-bold text-slate-950">Conflict Analysis</h3>
              <p className="text-sm text-slate-500">Detect architecture risks based on your current settings</p>
            </div>
          </div>
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="bg-slate-950 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-800 disabled:opacity-50 transition-colors"
          >
            {isAnalyzing ? '⏳ Analyzing...' : '🔍 Analyze Architecture'}
          </button>
        </div>

        {analysisMsg && (
          <p className="text-sm text-slate-500 mb-4">{analysisMsg}</p>
        )}

        {conflicts.length > 0 ? (
          <div className="space-y-3">
            {conflicts.map((c, i) => {
              const colors = c.level === 'HIGH'
                ? 'bg-red-50 border-red-200 text-red-700'
                : c.level === 'MEDIUM'
                ? 'bg-yellow-50 border-yellow-300 text-orange-600'
                : 'bg-green-50 border-green-200 text-green-700';
              return (
                <div key={i} className={`border rounded-2xl p-5 ${colors}`}>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold">{c.title}</h4>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/60">{c.level}</span>
                  </div>
                  <p className="text-sm mb-2">{c.reason}</p>
                  <p className="text-sm font-semibold">💡 {c.suggestion}</p>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-slate-400 text-center py-8">Press "Analyze Architecture" to detect risks in your current setup</p>
        )}
      </section>
    </>
  );
}
