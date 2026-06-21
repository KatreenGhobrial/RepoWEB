import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import Header from '../UIComponents/Header';

export default function MonitorPanel() {
  const [monitorData, setMonitorData] = useState({
    summary: { health: 'Loading...' },
    services: []
  });
  
  const [activeDevices, setActiveDevices] = useState([]);
  const [sensors, setSensors] = useState({});
  const [alerts, setAlerts] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // Use refs to prevent stale state in socket callbacks
  const alertsRef = useRef(alerts);
  const logsRef = useRef(logs);
  const sensorsRef = useRef(sensors);

  useEffect(() => {
    alertsRef.current = alerts;
    logsRef.current = logs;
    sensorsRef.current = sensors;
  }, [alerts, logs, sensors]);

  const addLog = (title, msg) => {
    const newLog = {
      id: Date.now() + Math.random(),
      title,
      message: msg,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
    setLogs(prev => [newLog, ...prev].slice(0, 5)); // Keep last 5 logs
  };

  const checkAlerts = (deviceId, type, value) => {
    let alertCreated = false;
    const alertId = `${deviceId}-${type}-high`;
    
    // Check if alert already exists to prevent spam
    const alertExists = alertsRef.current.some(a => a.id === alertId);

    if (type === 'temperature' && parseFloat(value) > 30) {
      if (!alertExists) {
        const newAlert = {
          id: alertId,
          title: `High Temperature Alert`,
          level: parseFloat(value) > 35 ? 'HIGH' : 'MEDIUM',
          description: `Device ${deviceId} reported a high temperature of ${value}°C.`,
          time: new Date().toLocaleTimeString()
        };
        setAlerts(prev => [newAlert, ...prev]);
        addLog('Threshold Exceeded', `Device ${deviceId} temperature at ${value}°C`);
      }
    } else if (type === 'temperature' && parseFloat(value) <= 30 && alertExists) {
      // Clear alert
      setAlerts(prev => prev.filter(a => a.id !== alertId));
      addLog('Alert Cleared', `Device ${deviceId} temperature normalized to ${value}°C`);
    }
  };

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const healthRes = await fetch('http://localhost:5000/api/health');
        if (healthRes.ok) {
          setMonitorData(prev => ({
            ...prev,
            summary: { health: 'OK' },
            services: [
              { name: 'Backend API', status: 'Online', description: 'Connected to backend server' },
              { name: 'MongoDB Database', status: 'Online', description: 'Connected to database' },
              { name: 'Socratic Bot Engine', status: 'Online', description: 'AI bot ready' }
            ]
          }));
          addLog('System Start', 'Monitor Panel initialized and connected to services.');
        }
      } catch {
        setMonitorData(prev => ({
          ...prev,
          summary: { health: 'Down' },
          services: [
            { name: 'Backend API', status: 'Down', description: 'Cannot reach backend server' }
          ]
        }));
      } finally {
        setLoading(false);
      }
    };
    fetchHealth();

    // Connect to WebSocket for real-time MQTT data
    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      withCredentials: true,
    });

    socket.on('device_status_update', (devicesArray) => {
      setActiveDevices(devicesArray);
    });

    socket.on('mqtt_message', (data) => {
      try {
        const { topic, payload } = data;
        const topicParts = topic.split('/');
        
        // Robust extraction: get the last two parts
        // e.g. Braude/team8/MockDevice1/telemetry -> deviceId = MockDevice1, type = telemetry
        // e.g. Braude/team8/test_sensors/MockDevice1/telemetry -> deviceId = MockDevice1, type = telemetry
        if (topicParts.length >= 3) {
          const messageType = topicParts[topicParts.length - 1]; // e.g. telemetry
          const deviceId = topicParts[topicParts.length - 2];

          if (messageType === 'telemetry') {
            const parsedPayload = JSON.parse(payload);
            
            setSensors(prev => {
              const updatedSensors = { ...prev };
              
              // Map temperature
              if (parsedPayload.temperature !== undefined) {
                const key = `${deviceId}-temperature`;
                updatedSensors[key] = {
                  id: key,
                  name: `Temperature (${deviceId})`,
                  location: deviceId,
                  value: parsedPayload.temperature,
                  unit: '°C',
                  status: parseFloat(parsedPayload.temperature) > 30 ? 'Warning' : 'Online',
                  lastUpdate: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                };
                checkAlerts(deviceId, 'temperature', parsedPayload.temperature);
              }
              
              // Map humidity
              if (parsedPayload.humidity !== undefined) {
                const key = `${deviceId}-humidity`;
                updatedSensors[key] = {
                  id: key,
                  name: `Humidity (${deviceId})`,
                  location: deviceId,
                  value: parsedPayload.humidity,
                  unit: '%',
                  status: 'Online',
                  lastUpdate: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                };
              }
              
              return updatedSensors;
            });
          }
        }
      } catch (err) {
        console.error('Error parsing MQTT message:', err);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleRefresh = () => {
    setMessage('');
    addLog('Manual Action', 'User requested manual refresh. Real-time data will continue to flow.');
    setMessage('Listening to real-time stream...');
    setTimeout(() => setMessage(''), 3000);
  };

  if (loading) return <div className="flex items-center justify-center p-12"><p className="text-slate-500 text-lg">Loading monitor...</p></div>;

  const sensorArray = Object.values(sensors);
  const onlineDevicesCount = activeDevices.filter(d => d.status === 'online').length;

  return (
    <>
      <Header title="IoT Monitor Panel" subtitle="Manage architecture, detect IoT risks, and support collaboration in real-time." />

      <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-7 transition-all duration-300">
          <p className="text-slate-500 text-lg mb-3">Connected Devices</p>
          <h3 className="text-5xl font-bold text-slate-950">{onlineDevicesCount}</h3>
          <p className="text-slate-500 text-lg mt-3">Active MQTT devices</p>
        </div>
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-7 transition-all duration-300">
          <p className="text-slate-500 text-lg mb-3">Sensors</p>
          <h3 className="text-5xl font-bold text-slate-950">{sensorArray.length}</h3>
          <p className="text-slate-500 text-lg mt-3">Active readings</p>
        </div>
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-7 transition-all duration-300">
          <p className="text-slate-500 text-lg mb-3">Open Alerts</p>
          <h3 className="text-5xl font-bold text-slate-950">{alerts.length}</h3>
          <p className="text-slate-500 text-lg mt-3">Need attention</p>
        </div>
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-7 transition-all duration-300">
          <p className="text-slate-500 text-lg mb-3">System Health</p>
          <h3 className={`text-5xl font-bold ${monitorData.summary.health === 'OK' ? 'text-green-600' : 'text-orange-500'}`}>{monitorData.summary.health}</h3>
          <p className="text-slate-500 text-lg mt-3">Live status</p>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-7">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-xl">🌡️</div>
              <h3 className="text-2xl font-bold text-slate-950">Sensor readings</h3>
            </div>
            <button onClick={handleRefresh} className="bg-slate-950 text-white px-5 py-3 rounded-2xl font-bold hover:bg-slate-800 transition-colors">
              Ping System
            </button>
          </div>
          
          {sensorArray.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
              <p className="text-slate-500 italic">Waiting for sensor data via MQTT...</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {sensorArray.map((sensor) => {
                let statusClass = 'bg-green-100 text-green-700 border border-green-200';
                if (sensor.status === 'Warning') statusClass = 'bg-yellow-100 text-orange-600 border border-yellow-300';
                if (sensor.status === 'Offline') statusClass = 'bg-red-100 text-red-700 border border-red-200';

                return (
                  <div key={sensor.id} className="border border-slate-200 rounded-2xl p-5 hover:bg-slate-50 transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-bold text-slate-900 text-lg">{sensor.name}</h4>
                        <p className="text-sm text-slate-500">Device ID: {sensor.location}</p>
                      </div>
                      <span className={`text-xs px-3 py-1 rounded-full font-bold ${statusClass}`}>
                        {sensor.status === 'Warning' ? '⚠️ ' : ''}{sensor.status}
                      </span>
                    </div>
                    <p className="text-4xl font-bold text-slate-950">{sensor.value}<span className="text-2xl text-slate-500">{sensor.unit}</span></p>
                    <p className="text-sm text-slate-500 mt-2 font-mono bg-slate-100 inline-block px-2 py-1 rounded">Last seen: {sensor.lastUpdate}</p>
                  </div>
                );
              })}
            </div>
          )}
          {message && <p className="text-sm mt-5 text-sky-600 font-bold animate-pulse">{message}</p>}
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-7">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-xl">🖥️</div>
            <h3 className="text-2xl font-bold text-slate-950">System services</h3>
          </div>
          <div className="space-y-4">
            {monitorData.services.map((service, idx) => {
              let statusClass = 'bg-green-100 text-green-700 border-green-200';
              if (service.status === 'Down') statusClass = 'bg-red-100 text-red-700 border-red-200';

              return (
                <div key={idx} className="border border-slate-200 rounded-2xl p-5 flex justify-between items-start hover:shadow-sm transition-all">
                  <div>
                    <h4 className="font-bold text-slate-900 text-lg">{service.name}</h4>
                    <p className="text-sm text-slate-500 mt-2">{service.description}</p>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-bold border ${statusClass}`}>{service.status}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-7">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-xl">🔔</div>
            <h3 className="text-2xl font-bold text-slate-950">Active Alerts</h3>
          </div>
          <div className="space-y-4">
            {alerts.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-slate-500 italic">✅ No active alerts. Everything looks good!</p>
              </div>
            ) : (
              alerts.map((alert) => {
                let colorClass = 'bg-red-50 border-red-200 text-red-700';
                if (alert.level === 'MEDIUM') colorClass = 'bg-yellow-50 border-yellow-300 text-orange-600';

                return (
                  <div key={alert.id} className={`border rounded-2xl p-5 transition-all animate-pulse shadow-sm ${colorClass}`}>
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-lg flex items-center gap-2">⚠️ {alert.title}</h4>
                      <span className="font-bold text-xs bg-white bg-opacity-50 px-2 py-1 rounded border">{alert.level}</span>
                    </div>
                    <p className="text-sm font-medium">{alert.description}</p>
                    <p className="text-xs mt-2 opacity-75">{alert.time}</p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-7">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-xl">📋</div>
            <h3 className="text-2xl font-bold text-slate-950">System Logs</h3>
          </div>
          <div className="space-y-3">
            {logs.length === 0 ? (
              <p className="text-slate-500 italic text-center py-6">No logs generated yet.</p>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="border border-slate-100 rounded-2xl p-4 bg-slate-50 hover:bg-slate-100 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{log.title}</h4>
                      <p className="text-sm text-slate-600 mt-1">{log.message}</p>
                    </div>
                    <span className="text-xs font-mono text-slate-400 bg-white border border-slate-200 px-2 py-1 rounded">{log.time}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </>
  );
}
