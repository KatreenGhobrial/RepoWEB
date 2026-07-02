import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import Header from '../UIComponents/Header';
import { getHealth, getBrokers } from './iotService';

export default function MonitorPanel() {
  const [monitorData, setMonitorData] = useState({ summary: { health: 'Loading...' }, services: [] });
  const [activeDevices, setActiveDevices] = useState([]);
  const [sensors, setSensors] = useState({});
  const [alerts, setAlerts] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [mqttStatus, setMqttStatus] = useState('Disconnected');

  const alertsRef = useRef(alerts);
  useEffect(() => { alertsRef.current = alerts; }, [alerts]);

  const addLog = (title, msg) => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [{ id: Date.now() + Math.random(), title, message: msg, time }, ...prev].slice(0, 5));
  };

  const checkAlerts = (deviceId, type, value) => {
    const timeStr = new Date().toLocaleTimeString();

    const triggerAlert = (alertType, title, level, description) => {
      const alertId = `${deviceId}-${alertType}`;
      const exists = alertsRef.current.some(a => a.id === alertId);
      if (!exists) {
        setAlerts(prev => [{ id: alertId, title, level, description, time: timeStr, deviceId }, ...prev]);
        addLog('New Alert', title);
      }
    };

    const clearAlert = (alertType, resolveMsg) => {
      const alertId = `${deviceId}-${alertType}`;
      const exists = alertsRef.current.some(a => a.id === alertId);
      if (exists) {
        setAlerts(prev => prev.filter(a => a.id !== alertId));
        addLog('Alert Cleared', resolveMsg);
      }
    };

    if (type === 'temperature') {
      if (parseFloat(value) > 30) triggerAlert('temp', 'High Temperature Alert', parseFloat(value) > 35 ? 'HIGH' : 'MEDIUM', `Device ${deviceId} reported ${value}°C.`);
      else clearAlert('temp', `Device ${deviceId} temp normalized.`);
    }

    if (type === 'packetLoss' || type === 'packet_loss') {
      if (parseFloat(value) > 5) triggerAlert('packet_loss', 'High Packet Loss Detected', 'HIGH', `Packet loss rate at ${value}% on ${deviceId}.`);
      else clearAlert('packet_loss', `Packet loss normalized on ${deviceId}.`);
    }

    if (type === 'battery' || type === 'battery_level') {
      if (parseFloat(value) < 15) triggerAlert('battery_drain', 'Critical Battery Level', 'HIGH', `Battery level dropped to ${value}% on ${deviceId}.`);
      else clearAlert('battery_drain', `Battery level OK on ${deviceId}.`);
    }

    if (type === 'latency') {
      if (parseFloat(value) > 200) triggerAlert('high_latency', 'Elevated Network Latency', 'MEDIUM', `Latency is ${value}ms on ${deviceId}.`);
      else clearAlert('high_latency', `Latency normalized on ${deviceId}.`);
    }

    if (type === 'sensor_fault' || type === 'sensorStatus') {
      if (value === 'fault' || value === true || value === 'error') triggerAlert('sensor_failure', 'Sensor Failure Detected', 'CRITICAL', `A sensor fault was reported on ${deviceId}.`);
      else clearAlert('sensor_failure', `Sensor status OK on ${deviceId}.`);
    }
  };

  useEffect(() => {
    getHealth()
      .then(() => {
        setMonitorData({
          summary: { health: 'OK' },
          services: [
            { name: 'Backend API', status: 'Online', description: 'Connected' },
            { name: 'MongoDB', status: 'Online', description: 'Connected' },
            { name: 'Socratic Bot', status: 'Online', description: 'Ready' }
          ]
        });
        addLog('System Start', 'Monitor initialized.');
      })
      .catch(() => setMonitorData({ summary: { health: 'Down' }, services: [{ name: 'Backend API', status: 'Down', description: 'Unreachable' }] }))
      .finally(() => setLoading(false));

    getBrokers()
      .then(brokers => {
        const anyConnected = brokers.some(b => b.connected);
        setMqttStatus(anyConnected ? 'Connected' : brokers.length > 0 ? 'Connection Error' : 'Disconnected');
      })
      .catch(() => setMqttStatus('Connection Error'));

    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', { withCredentials: true });
    socket.on('device_status_update', setActiveDevices);
    
    socket.on('mqtt_broker_status', (data) => {
      if (data.status === 'error') setMqttStatus('Connection Error');
      else if (data.status === 'connected') setMqttStatus('Connected');
      else if (data.status === 'disconnected') setMqttStatus('Disconnected');
    });
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
              next[`${deviceId}-temp`] = { id: `${deviceId}-temp`, name: `Temp`, location: deviceId, value: data.temperature, unit: '°C', status: parseFloat(data.temperature) > 30 ? 'Warning' : 'Online', lastUpdate: time };
              checkAlerts(deviceId, 'temperature', data.temperature);
            }
            if (data.humidity !== undefined) {
              next[`${deviceId}-hum`] = { id: `${deviceId}-hum`, name: `Humidity`, location: deviceId, value: data.humidity, unit: '%', status: 'Online', lastUpdate: time };
            }
            if (data.packetLoss !== undefined || data.packet_loss !== undefined) {
              const loss = data.packetLoss || data.packet_loss;
              next[`${deviceId}-pkt`] = { id: `${deviceId}-pkt`, name: `Packet Loss`, location: deviceId, value: loss, unit: '%', status: parseFloat(loss) > 5 ? 'Warning' : 'Online', lastUpdate: time };
              checkAlerts(deviceId, 'packetLoss', loss);
            }
            if (data.battery !== undefined || data.batteryLevel !== undefined) {
              const batt = data.battery || data.batteryLevel;
              next[`${deviceId}-batt`] = { id: `${deviceId}-batt`, name: `Battery`, location: deviceId, value: batt, unit: '%', status: parseFloat(batt) < 15 ? 'Warning' : 'Online', lastUpdate: time };
              checkAlerts(deviceId, 'battery', batt);
            }
            if (data.latency !== undefined) {
              next[`${deviceId}-lat`] = { id: `${deviceId}-lat`, name: `Latency`, location: deviceId, value: data.latency, unit: 'ms', status: parseFloat(data.latency) > 200 ? 'Warning' : 'Online', lastUpdate: time };
              checkAlerts(deviceId, 'latency', data.latency);
            }
            if (data.sensorStatus !== undefined || data.sensorFault !== undefined) {
              const fault = data.sensorStatus === 'error' || data.sensorStatus === 'fault' || data.sensorFault === true;
              next[`${deviceId}-sens`] = { id: `${deviceId}-sens`, name: `Sensor Health`, location: deviceId, value: fault ? 'FAULT' : 'OK', unit: '', status: fault ? 'Offline' : 'Online', lastUpdate: time };
              checkAlerts(deviceId, 'sensor_fault', fault);
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

  if (loading) return <div className="p-12 text-center text-slate-500 dark:text-slate-400">Loading monitor...</div>;

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
          <div key={i} className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm p-7">
            <p className="text-slate-500 dark:text-slate-400 mb-3">{x.l}</p>
            <h3 className={`text-5xl font-bold ${x.c || 'text-slate-950 dark:text-white'}`}>{x.v}</h3>
            <p className="text-slate-500 dark:text-slate-400 mt-3">{x.s}</p>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm p-7">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-bold flex items-center gap-4"><span className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-xl">🌡️</span> Sensor readings</h3>
            <button onClick={handleRefresh} className="bg-slate-950 text-white dark:bg-cyan-600 dark:text-white px-5 py-3 rounded-2xl font-bold hover:bg-slate-800">Ping System</button>
          </div>
          
          {!sensorArray.length ? (
            <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed"><p className="text-slate-500 dark:text-slate-400 italic">Waiting for MQTT data...</p></div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {sensorArray.map(s => (
                <div key={s.id} className="border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 hover:bg-slate-50">
                  <div className="flex justify-between items-start mb-4">
                    <div><h4 className="font-bold text-lg">{s.name}</h4><p className="text-sm text-slate-500 dark:text-slate-400">ID: {s.location}</p></div>
                    <span className={`text-xs px-3 py-1 rounded-full font-bold ${s.status === 'Warning' ? 'bg-yellow-100 text-orange-600' : s.status === 'Offline' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{s.status}</span>
                  </div>
                  <p className="text-4xl font-bold">{s.value}<span className="text-2xl text-slate-500 dark:text-slate-400">{s.unit}</span></p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 bg-slate-100 inline-block px-2 py-1 rounded">Last seen: {s.lastUpdate}</p>
                </div>
              ))}
            </div>
          )}
          {message && <p className="text-sm mt-5 text-sky-600 font-bold animate-pulse">{message}</p>}
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm p-7">
          <h3 className="text-2xl font-bold mb-8 flex items-center gap-4"><span className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-xl">🖥️</span> System services</h3>
          <div className="space-y-4">
            {monitorData.services.map((svc, i) => (
              <div key={i} className="border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 flex justify-between items-start">
                <div><h4 className="font-bold text-lg">{svc.name}</h4><p className="text-sm text-slate-500 dark:text-slate-400 mt-2">{svc.description}</p></div>
                <span className={`text-xs px-3 py-1 rounded-full font-bold ${svc.status === 'Down' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{svc.status}</span>
              </div>
            ))}
            
            <div className="border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 flex justify-between items-start bg-slate-50 dark:bg-zinc-800">
              <div>
                <h4 className="font-bold text-lg text-slate-800 dark:text-slate-200 dark:text-slate-200">MQTT Broker</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Custom connections status</p>
              </div>
              <span className={`text-xs px-3 py-1 rounded-full font-bold ${mqttStatus === 'Connected' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : mqttStatus === 'Connection Error' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                {mqttStatus}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 mb-8">
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm p-7">
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-4"><span className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center text-xl">⚠️</span> Active Alerts</h3>
          {!alerts.length ? (
            <div className="text-center py-6 bg-slate-50 rounded-2xl border border-dashed"><p className="text-slate-500 dark:text-slate-400 italic">No active alerts. All systems nominal.</p></div>
          ) : (
            <div className="space-y-3">
              {alerts.map(a => (
                <div key={a.id} className={`border rounded-2xl p-4 flex justify-between items-center ${a.level === 'CRITICAL' ? 'bg-red-50 border-red-200' : a.level === 'HIGH' ? 'bg-orange-50 border-orange-200' : 'bg-yellow-50 border-yellow-200'}`}>
                  <div>
                    <h4 className={`font-bold ${a.level === 'CRITICAL' ? 'text-red-700' : a.level === 'HIGH' ? 'text-orange-700' : 'text-yellow-700'}`}>{a.title}</h4>
                    <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">{a.description}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-3 py-1 rounded-full font-bold ${a.level === 'CRITICAL' ? 'bg-red-200 text-red-800' : a.level === 'HIGH' ? 'bg-orange-200 text-orange-800' : 'bg-yellow-200 text-yellow-800'}`}>{a.level}</span>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6">
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm p-7">
          <h3 className="text-2xl font-bold mb-8 flex items-center gap-4"><span className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-xl">📋</span> System Logs</h3>
          <div className="space-y-3">
            {!logs.length ? <p className="text-slate-500 dark:text-slate-400 italic text-center py-6">No logs yet.</p> : logs.map(l => (
              <div key={l.id} className="border border-slate-100 rounded-2xl p-4 bg-slate-50 flex justify-between items-start">
                <div><h4 className="font-bold text-sm">{l.title}</h4><p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{l.message}</p></div>
                <span className="text-xs text-slate-400 bg-white dark:bg-zinc-900 border px-2 py-1 rounded">{l.time}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
