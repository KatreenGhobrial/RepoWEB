import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import Header from '../UIComponents/Header';

export default function MonitorPanel() {
  const [monitorData, setMonitorData] = useState({ summary: { health: 'Loading...' }, services: [] });
  const [activeDevices, setActiveDevices] = useState([]);
  const [sensors, setSensors] = useState({});
  const [alerts, setAlerts] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const alertsRef = useRef(alerts);
  useEffect(() => { alertsRef.current = alerts; }, [alerts]);

  const addLog = (title, msg) => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [{ id: Date.now() + Math.random(), title, message: msg, time }, ...prev].slice(0, 5));
  };

  const checkAlerts = (deviceId, type, value) => {
    const alertId = `${deviceId}-${type}-high`;
    const exists = alertsRef.current.some(a => a.id === alertId);

    if (type === 'temperature' && parseFloat(value) > 30) {
      if (!exists) {
        setAlerts(prev => [{
          id: alertId, title: 'High Temperature Alert', level: parseFloat(value) > 35 ? 'HIGH' : 'MEDIUM',
          description: `Device ${deviceId} reported ${value}°C.`, time: new Date().toLocaleTimeString()
        }, ...prev]);
        addLog('Threshold Exceeded', `Device ${deviceId} at ${value}°C`);
      }
    } else if (type === 'temperature' && parseFloat(value) <= 30 && exists) {
      setAlerts(prev => prev.filter(a => a.id !== alertId));
      addLog('Alert Cleared', `Device ${deviceId} normalized to ${value}°C`);
    }
  };

  useEffect(() => {
    fetch('http://localhost:5000/api/health')
      .then(res => {
        if (res.ok) {
          setMonitorData({
            summary: { health: 'OK' },
            services: [
              { name: 'Backend API', status: 'Online', description: 'Connected' },
              { name: 'MongoDB', status: 'Online', description: 'Connected' },
              { name: 'Socratic Bot', status: 'Online', description: 'Ready' }
            ]
          });
          addLog('System Start', 'Monitor initialized.');
        } else throw new Error();
      })
      .catch(() => setMonitorData({ summary: { health: 'Down' }, services: [{ name: 'Backend API', status: 'Down', description: 'Unreachable' }] }))
      .finally(() => setLoading(false));

    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', { withCredentials: true });
    socket.on('device_status_update', setActiveDevices);
    socket.on('mqtt_message', ({ topic, payload }) => {
      try {
        const parts = topic.split('/');
        if (parts.length >= 3 && parts[parts.length - 1] === 'telemetry') {
          const deviceId = parts[parts.length - 2];
          const data = JSON.parse(payload);
          const time = new Date().toLocaleTimeString();

          setSensors(prev => {
            const next = { ...prev };
            if (data.temperature !== undefined) {
              next[`${deviceId}-temp`] = { id: `${deviceId}-temp`, name: `Temp (${deviceId})`, location: deviceId, value: data.temperature, unit: '°C', status: parseFloat(data.temperature) > 30 ? 'Warning' : 'Online', lastUpdate: time };
              checkAlerts(deviceId, 'temperature', data.temperature);
            }
            if (data.humidity !== undefined) {
              next[`${deviceId}-hum`] = { id: `${deviceId}-hum`, name: `Humidity (${deviceId})`, location: deviceId, value: data.humidity, unit: '%', status: 'Online', lastUpdate: time };
            }
            return next;
          });
        }
      } catch (err) { console.error('MQTT Error:', err); }
    });

    return () => socket.disconnect();
  }, []);

  const handleRefresh = () => {
    addLog('Manual Action', 'User requested refresh.');
    setMessage('Listening to real-time stream...');
    setTimeout(() => setMessage(''), 3000);
  };

  if (loading) return <div className="p-12 text-center text-slate-500">Loading monitor...</div>;

  const sensorArray = Object.values(sensors);
  const onlineCount = activeDevices.filter(d => d.status === 'online').length;

  return (
    <>
      <Header title="IoT Monitor Panel" subtitle="Manage architecture, detect risks, and view real-time data." />

      <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 text-center">
        {[
          { l: 'Connected Devices', v: onlineCount, s: 'Active MQTT devices' },
          { l: 'Sensors', v: sensorArray.length, s: 'Active readings' },
          { l: 'Open Alerts', v: alerts.length, s: 'Need attention' },
          { l: 'System Health', v: monitorData.summary.health, s: 'Live status', c: monitorData.summary.health === 'OK' ? 'text-green-600' : 'text-orange-500' }
        ].map((x, i) => (
          <div key={i} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-7">
            <p className="text-slate-500 mb-3">{x.l}</p>
            <h3 className={`text-5xl font-bold ${x.c || 'text-slate-950'}`}>{x.v}</h3>
            <p className="text-slate-500 mt-3">{x.s}</p>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-7">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-bold flex items-center gap-4"><span className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-xl">🌡️</span> Sensor readings</h3>
            <button onClick={handleRefresh} className="bg-slate-950 text-white px-5 py-3 rounded-2xl font-bold hover:bg-slate-800">Ping System</button>
          </div>
          
          {!sensorArray.length ? (
            <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed"><p className="text-slate-500 italic">Waiting for MQTT data...</p></div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {sensorArray.map(s => (
                <div key={s.id} className="border border-slate-200 rounded-2xl p-5 hover:bg-slate-50">
                  <div className="flex justify-between items-start mb-4">
                    <div><h4 className="font-bold text-lg">{s.name}</h4><p className="text-sm text-slate-500">ID: {s.location}</p></div>
                    <span className={`text-xs px-3 py-1 rounded-full font-bold ${s.status === 'Warning' ? 'bg-yellow-100 text-orange-600' : s.status === 'Offline' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{s.status}</span>
                  </div>
                  <p className="text-4xl font-bold">{s.value}<span className="text-2xl text-slate-500">{s.unit}</span></p>
                  <p className="text-xs text-slate-500 mt-2 bg-slate-100 inline-block px-2 py-1 rounded">Last seen: {s.lastUpdate}</p>
                </div>
              ))}
            </div>
          )}
          {message && <p className="text-sm mt-5 text-sky-600 font-bold animate-pulse">{message}</p>}
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-7">
          <h3 className="text-2xl font-bold mb-8 flex items-center gap-4"><span className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-xl">🖥️</span> System services</h3>
          <div className="space-y-4">
            {monitorData.services.map((svc, i) => (
              <div key={i} className="border border-slate-200 rounded-2xl p-5 flex justify-between items-start">
                <div><h4 className="font-bold text-lg">{svc.name}</h4><p className="text-sm text-slate-500 mt-2">{svc.description}</p></div>
                <span className={`text-xs px-3 py-1 rounded-full font-bold ${svc.status === 'Down' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{svc.status}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-7">
          <h3 className="text-2xl font-bold mb-8 flex items-center gap-4"><span className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-xl">📋</span> System Logs</h3>
          <div className="space-y-3">
            {!logs.length ? <p className="text-slate-500 italic text-center py-6">No logs yet.</p> : logs.map(l => (
              <div key={l.id} className="border border-slate-100 rounded-2xl p-4 bg-slate-50 flex justify-between items-start">
                <div><h4 className="font-bold text-sm">{l.title}</h4><p className="text-sm text-slate-600 mt-1">{l.message}</p></div>
                <span className="text-xs text-slate-400 bg-white border px-2 py-1 rounded">{l.time}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
