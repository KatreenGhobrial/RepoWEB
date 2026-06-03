import { useState, FormEvent } from 'react';
import Header from '../components/Header';
import { useProject } from '../context/ProjectContext';
import { projectAPI } from '../services/api';
import type { Component, FlowStep } from '../types';

const DEVICES = ['ESP32', 'ESP8266', 'Arduino Mega', 'Arduino Uno', 'Raspberry Pi 4', 'Raspberry Pi Pico', 'STM32', 'nRF52840', 'Other'];
const PROTOCOLS = ['MQTT', 'HTTP/REST', 'CoAP', 'WebSocket', 'BLE', 'Zigbee', 'LoRa', 'Wi-Fi Direct', 'Other'];
const DATABASES = ['MongoDB', 'InfluxDB', 'Firebase Realtime DB', 'PostgreSQL', 'SQLite', 'TimescaleDB', 'Other'];
const POWER_SOURCES = ['USB 5V', 'Battery 3.7V LiPo', 'Battery AA', 'Solar Panel', 'PoE', 'Mains AC', 'Other'];
const CLOUD_PLATFORMS = ['AWS IoT Core', 'Azure IoT Hub', 'Google Cloud IoT', 'Firebase', 'ThingSpeak', 'Blynk', 'None', 'Other'];
const SENSOR_OPTIONS = ['DHT22', 'BMP280', 'PIR Motion', 'Ultrasonic HC-SR04', 'LDR', 'MQ-2 Gas', 'DS18B20', 'MPU6050', 'Soil Moisture', 'IR Sensor'];

export default function ProjectSetup() {
  const { loadProjects, setCurrentProject } = useProject();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [device, setDevice] = useState('');
  const [protocol, setProtocol] = useState('');
  const [database, setDatabase] = useState('');
  const [powerSource, setPowerSource] = useState('');
  const [cloudPlatform, setCloudPlatform] = useState('');
  const [sensors, setSensors] = useState<string[]>([]);
  const [components, setComponents] = useState<Component[]>([]);
  const [flow, setFlow] = useState<FlowStep[]>([]);

  // Component form
  const [compName, setCompName] = useState('');
  const [compType, setCompType] = useState('');
  const [compDesc, setCompDesc] = useState('');

  // Flow form
  const [flowName, setFlowName] = useState('');
  const [flowIcon, setFlowIcon] = useState('📡');
  const [flowDesc, setFlowDesc] = useState('');

  const toggleSensor = (sensor: string) => {
    setSensors((prev) =>
      prev.includes(sensor) ? prev.filter((s) => s !== sensor) : [...prev, sensor]
    );
  };

  const addComponent = () => {
    if (!compName.trim()) return;
    setComponents((prev) => [...prev, { name: compName, type: compType, description: compDesc }]);
    setCompName('');
    setCompType('');
    setCompDesc('');
  };

  const addFlowStep = () => {
    if (!flowName.trim()) return;
    setFlow((prev) => [...prev, { name: flowName, icon: flowIcon, description: flowDesc }]);
    setFlowName('');
    setFlowIcon('📡');
    setFlowDesc('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const project = await projectAPI.create({
        name,
        description,
        device,
        protocol,
        database,
        powerSource,
        cloudPlatform,
        sensors,
        components,
        flow,
      });
      setCurrentProject(project);
      await loadProjects();
      setSuccess(`Project "${project.name}" created successfully!`);
      // Reset form
      setStep(1);
      setName('');
      setDescription('');
    } catch (err) {
      setError((err as Error).message || 'Failed to create project');
    } finally {
      setSaving(false);
    }
  };

  const inputClass = 'w-full bg-slate-700/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all';

  return (
    <>
      <Header
        title="⚙️ Project Setup"
        subtitle="Define your IoT project architecture step by step"
      />

      {/* Progress Steps */}
      <div className="flex items-center gap-2 mb-8 max-w-2xl mx-auto">
        {['Basics', 'Hardware', 'Network', 'Components', 'Review'].map((label, idx) => {
          const num = idx + 1;
          const isActive = step === num;
          const isDone = step > num;
          return (
            <div key={label} className="flex-1 flex items-center gap-2">
              <button
                onClick={() => setStep(num)}
                className={`w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center transition-all ${
                  isActive
                    ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30'
                    : isDone
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-700 text-slate-400'
                }`}
              >
                {isDone ? '✓' : num}
              </button>
              <span className={`text-xs hidden md:block ${isActive ? 'text-cyan-400' : 'text-slate-500'}`}>
                {label}
              </span>
              {idx < 4 && <div className={`flex-1 h-0.5 ${isDone ? 'bg-emerald-500' : 'bg-slate-700'}`} />}
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
        {/* Step 1: Basics */}
        {step === 1 && (
          <div className="bg-slate-800/30 border border-white/5 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-semibold text-white">📝 Project Basics</h3>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Project Name *</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Smart Greenhouse Monitor" className={inputClass} required />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Describe your IoT project goals..." className={`${inputClass} resize-none`} />
            </div>
            <button type="button" onClick={() => setStep(2)} disabled={!name.trim()} className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-3 rounded-xl font-semibold text-sm disabled:opacity-50">
              Next →
            </button>
          </div>
        )}

        {/* Step 2: Hardware */}
        {step === 2 && (
          <div className="bg-slate-800/30 border border-white/5 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-semibold text-white">🔧 Hardware Selection</h3>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Device / MCU</label>
              <select value={device} onChange={(e) => setDevice(e.target.value)} className={inputClass}>
                <option value="">Select device...</option>
                {DEVICES.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Power Source</label>
              <select value={powerSource} onChange={(e) => setPowerSource(e.target.value)} className={inputClass}>
                <option value="">Select power source...</option>
                {POWER_SOURCES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-2">Sensors</label>
              <div className="flex flex-wrap gap-2">
                {SENSOR_OPTIONS.map((sensor) => (
                  <button key={sensor} type="button" onClick={() => toggleSensor(sensor)}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                      sensors.includes(sensor)
                        ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'
                        : 'bg-slate-700/30 border-white/10 text-slate-400 hover:border-white/20'
                    }`}>
                    {sensor}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(1)} className="flex-1 bg-white/5 border border-white/10 text-white py-3 rounded-xl text-sm">← Back</button>
              <button type="button" onClick={() => setStep(3)} className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-3 rounded-xl font-semibold text-sm">Next →</button>
            </div>
          </div>
        )}

        {/* Step 3: Network */}
        {step === 3 && (
          <div className="bg-slate-800/30 border border-white/5 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-semibold text-white">🌐 Network & Cloud</h3>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Communication Protocol</label>
              <select value={protocol} onChange={(e) => setProtocol(e.target.value)} className={inputClass}>
                <option value="">Select protocol...</option>
                {PROTOCOLS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Database</label>
              <select value={database} onChange={(e) => setDatabase(e.target.value)} className={inputClass}>
                <option value="">Select database...</option>
                {DATABASES.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Cloud Platform</label>
              <select value={cloudPlatform} onChange={(e) => setCloudPlatform(e.target.value)} className={inputClass}>
                <option value="">Select platform...</option>
                {CLOUD_PLATFORMS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(2)} className="flex-1 bg-white/5 border border-white/10 text-white py-3 rounded-xl text-sm">← Back</button>
              <button type="button" onClick={() => setStep(4)} className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-3 rounded-xl font-semibold text-sm">Next →</button>
            </div>
          </div>
        )}

        {/* Step 4: Components & Flow */}
        {step === 4 && (
          <div className="bg-slate-800/30 border border-white/5 rounded-2xl p-6 space-y-6">
            <h3 className="text-base font-semibold text-white">🧩 Components & Data Flow</h3>

            {/* Add Component */}
            <div className="space-y-3">
              <p className="text-xs text-slate-400">Add Components</p>
              <div className="grid grid-cols-3 gap-2">
                <input type="text" value={compName} onChange={(e) => setCompName(e.target.value)} placeholder="Name" className={inputClass} />
                <input type="text" value={compType} onChange={(e) => setCompType(e.target.value)} placeholder="Type" className={inputClass} />
                <button type="button" onClick={addComponent} className="bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-xl text-sm hover:bg-cyan-500/30">+ Add</button>
              </div>
              <input type="text" value={compDesc} onChange={(e) => setCompDesc(e.target.value)} placeholder="Description (optional)" className={inputClass} />
              {components.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {components.map((c, i) => (
                    <span key={i} className="text-xs px-3 py-1.5 rounded-lg bg-slate-700/50 text-slate-300 flex items-center gap-2">
                      {c.name} <button type="button" onClick={() => setComponents((prev) => prev.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-300">×</button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Add Flow Step */}
            <div className="space-y-3">
              <p className="text-xs text-slate-400">Data Flow Steps</p>
              <div className="grid grid-cols-3 gap-2">
                <input type="text" value={flowName} onChange={(e) => setFlowName(e.target.value)} placeholder="Step name" className={inputClass} />
                <input type="text" value={flowIcon} onChange={(e) => setFlowIcon(e.target.value)} placeholder="Icon emoji" className={inputClass} />
                <button type="button" onClick={addFlowStep} className="bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-xl text-sm hover:bg-cyan-500/30">+ Add</button>
              </div>
              <input type="text" value={flowDesc} onChange={(e) => setFlowDesc(e.target.value)} placeholder="Step description" className={inputClass} />
              {flow.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap mt-2">
                  {flow.map((f, i) => (
                    <div key={i} className="flex items-center gap-1">
                      <span className="text-xs px-3 py-1.5 rounded-lg bg-slate-700/50 text-slate-300 flex items-center gap-1">
                        {f.icon} {f.name}
                        <button type="button" onClick={() => setFlow((prev) => prev.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-300 ml-1">×</button>
                      </span>
                      {i < flow.length - 1 && <span className="text-cyan-500">→</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(3)} className="flex-1 bg-white/5 border border-white/10 text-white py-3 rounded-xl text-sm">← Back</button>
              <button type="button" onClick={() => setStep(5)} className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-3 rounded-xl font-semibold text-sm">Review →</button>
            </div>
          </div>
        )}

        {/* Step 5: Review */}
        {step === 5 && (
          <div className="bg-slate-800/30 border border-white/5 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-semibold text-white">✅ Review & Create</h3>

            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                { label: 'Name', value: name },
                { label: 'Device', value: device },
                { label: 'Protocol', value: protocol },
                { label: 'Database', value: database },
                { label: 'Power', value: powerSource },
                { label: 'Cloud', value: cloudPlatform },
              ].map(({ label, value }) => (
                <div key={label} className="bg-slate-700/30 rounded-lg p-3">
                  <p className="text-xs text-slate-500">{label}</p>
                  <p className="text-white">{value || 'Not set'}</p>
                </div>
              ))}
            </div>

            {sensors.length > 0 && (
              <div>
                <p className="text-xs text-slate-400 mb-2">Sensors</p>
                <div className="flex flex-wrap gap-1.5">
                  {sensors.map((s) => (
                    <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400">{s}</span>
                  ))}
                </div>
              </div>
            )}

            {description && (
              <div>
                <p className="text-xs text-slate-400 mb-1">Description</p>
                <p className="text-sm text-slate-300">{description}</p>
              </div>
            )}

            {error && <p className="text-sm text-red-400">⚠️ {error}</p>}
            {success && <p className="text-sm text-emerald-400">✅ {success}</p>}

            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(4)} className="flex-1 bg-white/5 border border-white/10 text-white py-3 rounded-xl text-sm">← Back</button>
              <button type="submit" disabled={saving || !name.trim()} className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-3 rounded-xl font-semibold text-sm disabled:opacity-50 shadow-lg shadow-emerald-500/20">
                {saving ? 'Creating...' : '🚀 Create Project'}
              </button>
            </div>
          </div>
        )}
      </form>
    </>
  );
}
