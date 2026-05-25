import { useState, useEffect } from 'react';
import Header from '../components/Header';
import fakeData from '../DataAccess/fake-data.json';

export default function ProjectSetup() {
  const [setup, setSetup] = useState(null);
  const [formData, setFormData] = useState({
    projectName: '',
    device: '',
    protocol: '',
    database: '',
    powerSource: ''
  });
  const [summaryData, setSummaryData] = useState({ ...formData });
  const [message, setMessage] = useState('');

  useEffect(() => {
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
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSummaryData(formData);
    setMessage('Project setup updated for demo.');
  };

  if (!setup) return <div>Loading...</div>;

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
            <button type="submit" className="w-full bg-slate-950 text-white py-3 rounded-2xl font-bold hover:bg-slate-800">
              Save setup
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
