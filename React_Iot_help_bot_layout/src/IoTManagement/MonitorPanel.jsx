import { useState } from 'react';
import Header from '../UIcomponents/Header';

export default function MonitorPanel() {
  const [monitorData, setMonitorData] = useState({
    summary: { devices: 4, health: "Good" },
    sensors: [
      { name: "Temperature Sensor", location: "Lab 1", status: "Online", value: 24, unit: "°C", lastUpdate: "Just now" },
      { name: "Humidity Sensor", location: "Lab 1", status: "Warning", value: 60, unit: "%", lastUpdate: "1 min ago" },
      { name: "Motion Detector", location: "Entrance", status: "Online", value: 0, unit: " alerts", lastUpdate: "5 mins ago" }
    ],
    services: [
      { name: "MQTT Broker", description: "Message queue for IoT devices", status: "Online" },
      { name: "Data Storage", description: "Database for sensor logs", status: "Online" }
    ],
    alerts: [
      { title: "Humidity Warning", level: "MEDIUM", description: "Humidity levels are slightly above optimal in Lab 1." }
    ],
    logs: [
      { title: "Sensor connected", message: "Temperature sensor came online.", time: "09:00 AM" },
      { title: "Routine check", message: "All systems healthy.", time: "08:30 AM" }
    ]
  });
  const [message, setMessage] = useState('');




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
          <h3 className="text-5xl font-bold text-slate-950">{monitorData.summary.health}</h3>
          <p className="text-slate-500 text-lg mt-3">Demo status</p>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-7">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-xl">🌡️</div>
              <h3 className="text-2xl font-bold text-slate-950">Sensor readings</h3>
            </div>

          </div>
        <div className="grid md:grid-cols-2 gap-4">
  <div className="border border-slate-200 rounded-2xl p-5 hover:bg-slate-50">
    <div className="flex justify-between items-start mb-4">
      <div>
        <h4 className="font-bold text-slate-900 text-lg">Temperature Sensor</h4>
        <p className="text-sm text-slate-500">Lab Room</p>
      </div>
      <span className="text-xs px-3 py-1 rounded-full font-bold bg-green-100 text-green-700">
        Online
      </span>
    </div>
    <p className="text-4xl font-bold text-slate-950">24°C</p>
    <p className="text-sm text-slate-500 mt-2">Last update: 10:30</p>
  </div>

  <div className="border border-slate-200 rounded-2xl p-5 hover:bg-slate-50">
    <div className="flex justify-between items-start mb-4">
      <div>
        <h4 className="font-bold text-slate-900 text-lg">Humidity Sensor</h4>
        <p className="text-sm text-slate-500">Greenhouse Area</p>
      </div>
      <span className="text-xs px-3 py-1 rounded-full font-bold bg-yellow-100 text-orange-600">
        Warning
      </span>
    </div>
    <p className="text-4xl font-bold text-slate-950">78%</p>
    <p className="text-sm text-slate-500 mt-2">Last update: 10:25</p>
  </div>

  <div className="border border-slate-200 rounded-2xl p-5 hover:bg-slate-50">
    <div className="flex justify-between items-start mb-4">
      <div>
        <h4 className="font-bold text-slate-900 text-lg">Motion Sensor</h4>
        <p className="text-sm text-slate-500">Entrance</p>
      </div>
      <span className="text-xs px-3 py-1 rounded-full font-bold bg-red-100 text-red-700">
        Offline
      </span>
    </div>
    <p className="text-4xl font-bold text-slate-950">No Data</p>
    <p className="text-sm text-slate-500 mt-2">Last update: 09:50</p>
  </div>

  <div className="border border-slate-200 rounded-2xl p-5 hover:bg-slate-50">
    <div className="flex justify-between items-start mb-4">
      <div>
        <h4 className="font-bold text-slate-900 text-lg">Light Sensor</h4>
        <p className="text-sm text-slate-500">Project Board</p>
      </div>
      <span className="text-xs px-3 py-1 rounded-full font-bold bg-green-100 text-green-700">
        Online
      </span>
    </div>
    <p className="text-4xl font-bold text-slate-950">430 Lux</p>
    <p className="text-sm text-slate-500 mt-2">Last update: 10:32</p>
  </div>
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
              let statusClass = "bg-green-100 text-green-700";
              if (service.status === "Warning") statusClass = "bg-yellow-100 text-orange-600";
              if (service.status === "Down") statusClass = "bg-red-100 text-red-700";

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
              let colorClass = "bg-red-100 border-red-200 text-red-700";
              if (alert.level === "MEDIUM") colorClass = "bg-yellow-100 border-yellow-300 text-orange-600";
              if (alert.level === "LOW") colorClass = "bg-green-100 border-green-200 text-green-700";

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
