import { useState, useEffect } from 'react';
import Header from '../components/Header';
import fakeData from '../DataAccess/fake-data.json';

export default function DetectConflict() {
  const [existingConflicts, setExistingConflicts] = useState([]);
  const [results, setResults] = useState([]);
  const [conflictCount, setConflictCount] = useState(0);
  const [highestRisk, setHighestRisk] = useState('None');
  const [message, setMessage] = useState('');
  
  const [device, setDevice] = useState('ESP32');
  const [power, setPower] = useState('Battery');
  const [protocol, setProtocol] = useState('HTTP');
  const [database, setDatabase] = useState('No Database');
  const [requirement, setRequirement] = useState('Store sensor history');

  useEffect(() => {
    const data = fakeData.detectConflict;
    setExistingConflicts(data.conflicts);
    setConflictCount(data.conflicts.length);
    setHighestRisk(data.highestRisk);
  }, []);

  const handleCheck = (e) => {
    e.preventDefault();
    let found = 0;
    let highest = 'None';
    const newResults = [];

    const addResult = (title, level, reason, suggestion) => {
      newResults.push({ title, level, reason, suggestion });
    };

    if (power === "Battery" && protocol === "HTTP") {
      addResult(
        "Battery device using HTTP", "HIGH",
        "HTTP may create more requests and consume more power in an IoT device.",
        "Consider MQTT or reduce the sending frequency."
      );
      found++;
      highest = "HIGH";
    }

    if (requirement === "Low latency" && protocol === "HTTP") {
      addResult(
        "Low latency requirement with HTTP", "MEDIUM",
        "HTTP can be simple, but it may not be ideal for frequent real-time updates.",
        "Consider MQTT or WebSocket for more frequent updates."
      );
      found++;
      if (highest !== "HIGH") highest = "MEDIUM";
    }

    if (requirement === "Store sensor history" && database === "No Database") {
      addResult(
        "History requirement without database", "HIGH",
        "The project needs to store sensor history, but no database was selected.",
        "Add MongoDB, MySQL or Firebase."
      );
      found++;
      highest = "HIGH";
    }

    if (device === "Arduino Uno" && protocol === "MQTT") {
      addResult(
        "Arduino Uno with MQTT", "MEDIUM",
        "Arduino Uno may need an additional network module to use MQTT.",
        "Check if Wi-Fi or Ethernet module is available."
      );
      found++;
      if (highest !== "HIGH") highest = "MEDIUM";
    }

    if (found === 0) {
      addResult(
        "No major conflict detected", "LOW",
        "The selected configuration looks reasonable for a simple demo.",
        "Continue to Project Setup or ask the Socratic Bot for guidance."
      );
      highest = "LOW";
    }

    setResults(newResults);
    setConflictCount(found);
    setHighestRisk(highest);
    setMessage('Conflict detection completed.');
  };

  const renderConflictCard = (conflict, idx) => {
    let colorClass = "bg-red-100 border-red-200 text-red-700";
    if (conflict.level === "MEDIUM") colorClass = "bg-yellow-100 border-yellow-300 text-orange-600";
    if (conflict.level === "LOW") colorClass = "bg-green-100 border-green-200 text-green-700";

    return (
      <div key={idx} className={`border rounded-3xl p-5 ${colorClass}`}>
        <div className="flex justify-between items-start mb-3">
          <h4 className="text-lg font-bold">{conflict.title}</h4>
          <span className="font-bold text-sm">{conflict.level}</span>
        </div>
        <p className="text-sm mb-3">{conflict.reason}</p>
        <p className="text-sm font-bold">Suggestion: {conflict.suggestion}</p>
      </div>
    );
  };

  return (
    <>
      <Header title="Detect Conflict" subtitle="Verify architecture for risks" />

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-7">
          <p className="text-slate-500 text-lg mb-3">Current Conflicts</p>
          <h3 className="text-5xl font-bold text-slate-950">{conflictCount}</h3>
          <p className="text-slate-500 text-lg mt-3">Issues found in test</p>
        </div>
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-7">
          <p className="text-slate-500 text-lg mb-3">Highest Risk</p>
          <h3 className="text-5xl font-bold text-slate-950">{highestRisk}</h3>
          <p className="text-slate-500 text-lg mt-3">Severity level</p>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-7">
          <h3 className="text-2xl font-bold text-slate-950 mb-6">Run new check</h3>
          <form onSubmit={handleCheck} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Device</label>
              <select className="w-full border border-slate-300 rounded-2xl px-4 py-3" value={device} onChange={e => setDevice(e.target.value)}>
                <option>ESP32</option>
                <option>Arduino Uno</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Power</label>
              <select className="w-full border border-slate-300 rounded-2xl px-4 py-3" value={power} onChange={e => setPower(e.target.value)}>
                <option>Battery</option>
                <option>USB Power</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Protocol</label>
              <select className="w-full border border-slate-300 rounded-2xl px-4 py-3" value={protocol} onChange={e => setProtocol(e.target.value)}>
                <option>HTTP</option>
                <option>MQTT</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Database</label>
              <select className="w-full border border-slate-300 rounded-2xl px-4 py-3" value={database} onChange={e => setDatabase(e.target.value)}>
                <option>No Database</option>
                <option>MongoDB</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Requirement</label>
              <select className="w-full border border-slate-300 rounded-2xl px-4 py-3" value={requirement} onChange={e => setRequirement(e.target.value)}>
                <option>Store sensor history</option>
                <option>Low latency</option>
              </select>
            </div>
            {message && <p className="text-sm text-green-500">{message}</p>}
            <button type="submit" className="w-full bg-slate-950 text-white py-3 rounded-2xl font-bold hover:bg-slate-800">
              Check Conflicts
            </button>
          </form>
        </div>
        
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-7">
          <h3 className="text-2xl font-bold text-slate-950 mb-6">Check Results / Existing</h3>
          <div className="space-y-4">
            {results.length > 0 ? results.map(renderConflictCard) : existingConflicts.map(renderConflictCard)}
          </div>
        </div>
      </section>
    </>
  );
}
