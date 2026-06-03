import { useState, useEffect } from 'react';
import Header from '../components/Header';
import fakeData from '../DataAccess/fake-data.json';

export default function ProjectSetup() {
  const [setup, setSetup] = useState(null);
  const [projectId, setProjectId] = useState(null);
  const [formData, setFormData] = useState({
    projectName: '',
    device: '',
    protocol: '',
    database: '',
    powerSource: ''
  });
  const [summaryData, setSummaryData] = useState({ ...formData });
  const [message, setMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const res = await fetch('http://localhost:5000/api/projects', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const projects = await res.json();
            if (projects.length > 0) {
              const proj = projects[0];
              setProjectId(proj._id);
              const data = {
                projectName: proj.name || fakeData.projectSetup.projectName,
                device: proj.device || fakeData.projectSetup.device,
                protocol: proj.protocol || fakeData.projectSetup.protocol,
                database: proj.database || fakeData.projectSetup.database,
                powerSource: proj.powerSource || fakeData.projectSetup.powerSource
              };
              setFormData(data);
              setSummaryData(data);
              setSetup({ ...fakeData.projectSetup, ...data });
              return;
            }
          }
        }
      } catch (err) {
        console.error('Error fetching project:', err);
      }
      // Fallback to fake data
      const data = fakeData.projectSetup;
      setSetup(data);
      setFormData({
        projectName: data.projectName,
        device: data.device,
        protocol: data.protocol,
        database: data.database,
        powerSource: data.powerSource
      });
      setSummaryData({
        projectName: data.projectName,
        device: data.device,
        protocol: data.protocol,
        database: data.database,
        powerSource: data.powerSource
      });
    };
    fetchProject();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      if (token) {
        if (projectId) {
          // Update existing project
          const res = await fetch(`http://localhost:5000/api/projects/${projectId}`, {
            method: 'PUT',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({
              name: formData.projectName,
              device: formData.device,
              protocol: formData.protocol,
              database: formData.database,
              powerSource: formData.powerSource
            })
          });
          if (res.ok) {
            setSummaryData(formData);
            setMessage('✅ Project updated and saved to database!');
            setIsSaving(false);
            return;
          }
        } else {
          // Create new project
          const res = await fetch('http://localhost:5000/api/projects', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({
              name: formData.projectName,
              device: formData.device,
              protocol: formData.protocol,
              database: formData.database,
              powerSource: formData.powerSource,
              sensors: ['DHT22'],
              description: `IoT project using ${formData.device} with ${formData.protocol}`
            })
          });
          if (res.ok) {
            const newProj = await res.json();
            setProjectId(newProj._id);
            setSummaryData(formData);
            setMessage('✅ New project created and saved to database!');
            setIsSaving(false);
            return;
          }
        }
      }
      // Fallback: local only
      setSummaryData(formData);
      setMessage('Project setup saved locally (not connected to server).');
    } catch (err) {
      console.error('Save project error:', err);
      setSummaryData(formData);
      setMessage('Project updated locally (server error).');
    } finally {
      setIsSaving(false);
    }
  };

  if (!setup) return <div className="flex items-center justify-center p-12"><p className="text-slate-500 text-lg">Loading project...</p></div>;

  return (
    <>
      <Header title="IoT Help Bot" subtitle="Manage architecture, detect IoT risks, and support collaboration." />

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-7">
          <h3 className="text-2xl font-bold text-slate-950 mb-6">Basic project details</h3>
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
            {projectId && (
              <p className="text-xs text-green-500 text-center mt-2">🔗 Connected to MongoDB</p>
            )}
          </div>
        </div>
      </section>

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
    </>
  );
}
