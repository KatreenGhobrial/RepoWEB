import { useState, useEffect } from 'react';
import Header from '../UIComponents/Header';
import api from '../apiClient';
import { LuWifi, LuShield, LuZap, LuClock, LuCpu, LuTriangleAlert } from 'react-icons/lu';
const DEFAULT_FORM = { projectName: '', device: 'ESP32', protocol: 'HTTP', database: 'MongoDB', powerSource: 'Battery', membersText: '', requirements: '' };

export default function ProjectSetup() {
  const [projectId, setProjectId] = useState(null);
  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [summaryData, setSummaryData] = useState(DEFAULT_FORM);
  const [msg, setMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [allProjects, setAllProjects] = useState([]);
  const [conflicts, setConflicts] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisMsg, setAnalysisMsg] = useState('');

  const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');

  useEffect(() => {
    if (!currentUser) return;
    api.get('/projects').then(projs => {
      if (projs?.length) {
        setAllProjects(projs);
        loadProj(projs[0]);
      }
    }).catch(console.error);
  }, []);

  const loadProj = (p) => {
    const data = {
      projectName: p.name || '', device: p.device || 'ESP32', protocol: p.protocol || 'HTTP',
      database: p.database || 'MongoDB', powerSource: p.powerSource || 'Battery',
      membersText: (p.members || []).map(m => m.email || m.username).join(', '),
      requirements: p.description || ''
    };
    setProjectId(p._id);
    setFormData(data);
    setSummaryData(data);
    // Also trigger conflict detection immediately when loading a project
    handleAnalyze(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMsg('');
    try {
      const emails = formData.membersText.split(',').map(n => n.trim()).filter(Boolean);
      const ident = currentUser?.email || currentUser?.username;
      if (ident && !emails.includes(ident)) emails.push(ident);

      const payload = {
        name: formData.projectName, device: formData.device, protocol: formData.protocol,
        database: formData.database, powerSource: formData.powerSource,
        memberEmails: emails, ownerEmail: currentUser?.email, description: formData.requirements
      };

      if (projectId) {
        await api.put(`/projects/${projectId}`, payload);
        setMsg('✅ Project updated!');
        setAllProjects(prev => prev.map(p => p._id === projectId ? { ...p, ...payload } : p));
      } else {
        const res = await api.post('/projects', { ...payload, sensors: ['DHT22'], description: payload.description || `IoT project using ${payload.device}` });
        const newProjId = res.data?._id || res._id;
        setProjectId(newProjId);
        setMsg('✅ New project created!');
        setAllProjects(prev => [...prev, { _id: newProjId, ...payload }]);
      }
      setSummaryData(formData);
      setFormData(prev => ({ ...prev, membersText: '' }));
      
      // Automatically detect conflicts after successful save
      handleAnalyze(payload);
    } catch (err) {
      setMsg(err.message || 'Error saving project.');
    } finally { setIsSaving(false); }
  };

  const handleAnalyze = async (dataToAnalyze = formData) => {
    setIsAnalyzing(true);
    setConflicts([]);
    setAnalysisMsg('');
    try {
      const data = await api.post('/bot/detect-conflicts', { ...dataToAnalyze, sensors: ['DHT22'] });
      if (data?.conflicts) {
        setConflicts(data.conflicts);
        setAnalysisMsg(`Found ${data.conflicts.filter(c => c.level !== 'LOW').length} issue(s).`);
      } else throw new Error();
    } catch {
      // Fallback
      const local = [];
      if (dataToAnalyze.powerSource === 'Battery' && dataToAnalyze.protocol === 'HTTP')
        local.push({ title: 'HTTP on Battery is power-hungry', level: 'HIGH', reason: 'HTTP has large overhead vs MQTT.', suggestion: 'Consider MQTT.', category: 'Power' });
      if (dataToAnalyze.device === 'Arduino Uno' && dataToAnalyze.protocol !== 'HTTP')
        local.push({ title: 'Arduino has no built-in WiFi', level: 'HIGH', reason: 'Requires external module.', suggestion: 'Consider ESP32.', category: 'Hardware' });
      setConflicts(local);
      setAnalysisMsg(local.length ? `Found ${local.length} issue(s) (offline).` : 'No conflicts found.');
    } finally { setIsAnalyzing(false); }
  };

  const handleChange = (f, v) => setFormData(p => ({ ...p, [f]: v }));

  return (
    <>
      <Header title="IoT Help Bot" subtitle="Manage architecture, detect IoT risks, and support collaboration." />

      <section className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm p-7 mb-8 transition-colors">
        <h3 className="text-2xl font-bold mb-8 flex items-center gap-4 text-slate-900 dark:text-white">
          <span className="w-12 h-12 bg-slate-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center text-xl">🔗</span> Architecture flow
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[
            { n: 'Device', i: '📱', d: summaryData.device }, { n: 'Protocol', i: '📡', d: summaryData.protocol },
            { n: 'Gateway', i: '🌐', d: 'Wi-Fi' }, { n: 'Backend', i: '⚙️', d: 'Node.js' }, { n: 'Database', i: '🗄️', d: summaryData.database }
          ].map((item, idx) => (
            <div key={idx} className="border border-slate-200 dark:border-zinc-700 rounded-2xl p-5 text-center bg-slate-50 dark:bg-zinc-800/50 transition-colors">
              <p className="text-3xl mb-3">{item.i}</p>
              <h4 className="font-bold text-slate-900 dark:text-white">{item.n}</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">{item.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm p-7 transition-colors">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Project details</h3>
            {allProjects.length > 0 && (
              <select className="border border-slate-300 dark:border-zinc-700 rounded-xl px-3 py-1.5 text-sm font-semibold bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white outline-none" value={projectId || 'new'} onChange={e => {
                if (e.target.value === 'new') { setProjectId(null); setFormData(DEFAULT_FORM); setSummaryData(DEFAULT_FORM); }
                else loadProj(allProjects.find(p => p._id === e.target.value));
              }}>
                {allProjects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                <option value="new">+ New Project</option>
              </select>
            )}
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Project Name" val={formData.projectName} onChange={v => handleChange('projectName', v)} />
            <Input label="Specific Requirements" val={formData.requirements} onChange={v => handleChange('requirements', v)} isArea />
            <Select label="Main Device" val={formData.device} opts={['ESP32','Arduino Uno','Raspberry Pi']} onChange={v => handleChange('device', v)} />
            <Select label="Protocol" val={formData.protocol} opts={['HTTP','MQTT','CoAP']} onChange={v => handleChange('protocol', v)} />
            <Select label="Database" val={formData.database} opts={['MongoDB','MySQL','Firebase']} onChange={v => handleChange('database', v)} />
            <Select label="Power Source" val={formData.powerSource} opts={['Battery','USB Power','Wall Adapter']} onChange={v => handleChange('powerSource', v)} />
            <Input label="Add Members (Emails)" val={formData.membersText} onChange={v => handleChange('membersText', v)} placeholder="student1@example.com" />
            {msg && <p className={`text-sm ${msg.includes('✅')?'text-emerald-500':'text-red-500'}`}>{msg}</p>}
            <button disabled={isSaving} className="w-full bg-slate-900 dark:bg-sky-600 text-white py-3 rounded-2xl font-bold hover:bg-slate-800 dark:hover:bg-sky-500 disabled:opacity-50 transition-colors">
              {isSaving ? '⏳ Saving...' : projectId ? 'Update project' : 'Create project'}
            </button>
          </form>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm p-7 transition-colors">
          <h3 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">Current summary</h3>
          <div className="space-y-4">
            <SummaryBox title="Project" val={summaryData.projectName} />
            <div className="grid grid-cols-2 gap-4">
              <SummaryBox title="Device" val={summaryData.device} />
              <SummaryBox title="Protocol" val={summaryData.protocol} />
              <SummaryBox title="Database" val={summaryData.database} />
              <SummaryBox title="Power" val={summaryData.powerSource} />
            </div>
            {summaryData.requirements && <SummaryBox title="Requirements" val={summaryData.requirements} pre />}
            {projectId && <p className="text-xs text-emerald-500 dark:text-emerald-400 text-center mt-2 font-bold">🔗 Connected to DB</p>}
          </div>
        </div>
      </section>

      <section className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm p-7 mb-8 transition-colors">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold flex items-center gap-3 text-slate-900 dark:text-white">
            <span className="w-12 h-12 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center text-xl">🔍</span> Interdisciplinary Difficulties
          </h3>
        </div>
        {isAnalyzing ? (
          <p className="text-slate-500 dark:text-slate-400 font-medium py-4">Analyzing architecture...</p>
        ) : analysisMsg ? (
          conflicts.length === 0 ? (
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl p-5 text-emerald-700 dark:text-emerald-400">
              <h4 className="font-bold flex items-center gap-2"><LuCpu size={20} /> No major conflicts detected!</h4>
              <p className="text-sm mt-1 opacity-90">Your architecture looks solid. Proceed with confidence.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {conflicts.map((c, i) => {
                const isHigh = c.level === 'HIGH';
                const Icon = isHigh ? LuShield : LuTriangleAlert;
                const col = isHigh 
                  ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400' 
                  : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-900/50 text-orange-700 dark:text-orange-400';
                
                return (
                  <div key={i} className={`border rounded-2xl p-5 ${col}`}>
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold flex items-center gap-2"><Icon size={20} /> {c.title}</h4>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/60 dark:bg-black/30">{c.level}</span>
                    </div>
                    <p className="text-sm mb-2 opacity-90">{c.reason}</p>
                    <p className="text-sm font-semibold mt-2">💡 {c.suggestion}</p>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          <p className="text-slate-400 dark:text-slate-500 text-center py-8 font-medium">Save project to detect risks automatically</p>
        )}
      </section>
    </>
  );
}

const Input = ({label, val, onChange, placeholder, isArea}) => (
  <div>
    <label className="block text-sm font-bold text-slate-900 dark:text-slate-200 mb-1">{label}</label>
    {isArea ? <textarea className="w-full border border-slate-300 dark:border-zinc-700 rounded-xl px-4 py-2 outline-none focus:border-sky-500 dark:focus:border-sky-500 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 font-medium transition-colors" rows="3" value={val} onChange={e=>onChange(e.target.value)} placeholder={placeholder} />
            : <input className="w-full border border-slate-300 dark:border-zinc-700 rounded-xl px-4 py-2 outline-none focus:border-sky-500 dark:focus:border-sky-500 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 font-medium transition-colors" value={val} onChange={e=>onChange(e.target.value)} placeholder={placeholder} />}
  </div>
);

const Select = ({label, val, opts, onChange}) => (
  <div>
    <label className="block text-sm font-bold text-slate-900 dark:text-slate-200 mb-1">{label}</label>
    <select className="w-full border border-slate-300 dark:border-zinc-700 rounded-xl px-4 py-2 outline-none focus:border-sky-500 dark:focus:border-sky-500 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white font-medium transition-colors" value={val} onChange={e=>onChange(e.target.value)}>
      {opts.map(o => <option key={o}>{o}</option>)}
    </select>
  </div>
);

const SummaryBox = ({title, val, pre}) => (
  <div className="border border-slate-200 dark:border-zinc-700 rounded-2xl p-5 bg-slate-50 dark:bg-zinc-800/50 transition-colors">
    <p className="text-sm text-slate-500 dark:text-slate-400 mb-1 font-semibold uppercase tracking-wider">{title}</p>
    <p className={`font-bold text-slate-900 dark:text-white text-lg ${pre?'whitespace-pre-wrap':''}`}>{val}</p>
  </div>
);
