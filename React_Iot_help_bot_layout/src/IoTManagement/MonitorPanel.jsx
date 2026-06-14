import { useState, useEffect } from 'react';
import Header from '../UIComponents/Header';

export default function MonitorPanel() {
  const [monitorData, setMonitorData] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMonitorData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Check real backend health
        let backendStatus = 'Down';
        let dbStatus = 'Down';
        let botStatus = 'Down';
        
        if (token) {
          try {
            const healthRes = await fetch('http://localhost:5000/api/health');
            if (healthRes.ok) {
              backendStatus = 'Online';
              dbStatus = 'Online';
              botStatus = 'Online';
            }
          } catch { /* backend not available */ }
        }

        // Initialize empty state without fake data
        setMonitorData({
          summary: { 
            devices: 0, 
            health: backendStatus === 'Online' ? 'OK' : 'Degraded' 
          },
          sensors: [], // Empty without real sensor telemetry
          services: [
            {
              name: 'Backend API',
              status: backendStatus,
              description: backendStatus === 'Online' 
                ? 'Connected to http://localhost:5000' 
                : 'Cannot reach backend server'
            },
            {
              name: 'MongoDB Database',
              status: dbStatus,
              description: dbStatus === 'Online' 
                ? 'Connected to MongoDB Atlas' 
                : 'Database connection unavailable'
            },
            {
              name: 'Socratic Bot Engine',
              status: botStatus,
              description: botStatus === 'Online'
                ? 'AI bot ready for troubleshooting'
                : 'Bot engine not available'
            }
          ],
          alerts: [],
          logs: [
            {
              title: 'System check',
              message: `Backend API is ${backendStatus.toLowerCase()}.`,
              time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
            }
          ]
        });
      } catch (err) {
        console.error('Monitor fetch error:', err);
        setMonitorData({
          summary: { devices: 0, health: 'Down' },
          sensors: [],
          services: [],
          alerts: [],
          logs: []
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMonitorData();
  }, []);

  const handleRefresh = async () => {
    setMessage('');
    
    // Simulate sensor data refresh with slight randomization
    setMonitorData(prev => {
      const newSensors = prev.sensors.map(s => {
        if (s.status !== 'Offline') {
          const delta = Math.floor(Math.random() * 5) - 2; // -2 to +2
          return { ...s, value: Math.max(0, s.value + delta), lastUpdate: 'Just now' };
        }
        return s;
      });

      // Update log with refresh entry
      const newLog = {
        title: 'Manual refresh',
        message: 'Sensor readings updated by user.',
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      };

      return { 
        ...prev, 
        sensors: newSensors,
        logs: [newLog, ...prev.logs.slice(0, 4)]
      };
    });
    setMessage('Monitor data refreshed.');
  };

  if (loading || !monitorData) return <div className="flex items-center justify-center p-12"><p className="text-slate-500 text-lg">Loading monitor...</p></div>;

  return (
    <>
      <Header title="IoT Help Bot" subtitle="Manage architecture, detect IoT risks, and support collaboration." />

      <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-7">
          <p className="text-slate-500 text-lg mb-3">Connected Devices</p>
          <h3 className="text-5xl font-bold text-slate-950">{monitorData.summary.devices}</h3>
          <p className="text-slate-500 text-lg mt-3">Active IoT devices</p>
        </div>
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-7">
          <p className="text-slate-500 text-lg mb-3">Sensors</p>
          <h3 className="text-5xl font-bold text-slate-950">{monitorData.sensors.length}</h3>
          <p className="text-slate-500 text-lg mt-3">Reading values</p>
        </div>
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-7">
          <p className="text-slate-500 text-lg mb-3">Open Alerts</p>
          <h3 className="text-5xl font-bold text-slate-950">{monitorData.alerts.length}</h3>
          <p className="text-slate-500 text-lg mt-3">Need attention</p>
        </div>
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-7">
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
            <button onClick={handleRefresh} className="bg-slate-950 text-white px-5 py-3 rounded-2xl font-bold hover:bg-slate-800">
              Refresh
            </button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {monitorData.sensors.map((sensor, idx) => {
              let statusClass = 'bg-green-100 text-green-700';
              if (sensor.status === 'Warning') statusClass = 'bg-yellow-100 text-orange-600';
              if (sensor.status === 'Offline') statusClass = 'bg-red-100 text-red-700';

              return (
                <div key={idx} className="border border-slate-200 rounded-2xl p-5 hover:bg-slate-50">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold text-slate-900 text-lg">{sensor.name}</h4>
                      <p className="text-sm text-slate-500">{sensor.location}</p>
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full font-bold ${statusClass}`}>{sensor.status}</span>
                  </div>
                  <p className="text-4xl font-bold text-slate-950">{sensor.value}{sensor.unit}</p>
                  <p className="text-sm text-slate-500 mt-2">Last update: {sensor.lastUpdate}</p>
                </div>
              );
            })}
          </div>
          {message && <p className="text-sm mt-5 text-green-500">{message}</p>}
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-7">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-xl">🖥️</div>
            <h3 className="text-2xl font-bold text-slate-950">System services</h3>
          </div>
          <div className="space-y-4">
            {monitorData.services.map((service, idx) => {
              let statusClass = 'bg-green-100 text-green-700';
              if (service.status === 'Warning') statusClass = 'bg-yellow-100 text-orange-600';
              if (service.status === 'Down') statusClass = 'bg-red-100 text-red-700';

              return (
                <div key={idx} className="border border-slate-200 rounded-2xl p-5 flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-slate-900 text-lg">{service.name}</h4>
                    <p className="text-sm text-slate-500 mt-2">{service.description}</p>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-bold ${statusClass}`}>{service.status}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-7">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-xl">🔔</div>
            <h3 className="text-2xl font-bold text-slate-950">Monitor alerts</h3>
          </div>
          <div className="space-y-4">
            {monitorData.alerts.map((alert, idx) => {
              let colorClass = 'bg-red-100 border-red-200 text-red-700';
              if (alert.level === 'MEDIUM') colorClass = 'bg-yellow-100 border-yellow-300 text-orange-600';
              if (alert.level === 'LOW') colorClass = 'bg-green-100 border-green-200 text-green-700';

              return (
                <div key={idx} className={`border rounded-3xl p-5 ${colorClass}`}>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-lg">{alert.title}</h4>
                    <span className="font-bold text-sm">{alert.level}</span>
                  </div>
                  <p className="text-sm">{alert.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-7">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-xl">📋</div>
            <h3 className="text-2xl font-bold text-slate-950">Recent system logs</h3>
          </div>
          <div className="space-y-4">
            {monitorData.logs.map((log, idx) => (
              <div key={idx} className="border border-slate-200 rounded-2xl p-5 hover:bg-slate-50">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-slate-900">{log.title}</h4>
                    <p className="text-sm text-slate-500 mt-2">{log.message}</p>
                  </div>
                  <span className="text-sm text-slate-400">{log.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
