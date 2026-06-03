import { useState, useEffect } from 'react';
import Header from '../components/Header';

export default function DetectConflict() {
  const [results, setResults] = useState([]);
  const [conflictCount, setConflictCount] = useState(0);
  const [highestRisk, setHighestRisk] = useState('None');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [device, setDevice] = useState('ESP32');
  const [power, setPower] = useState('Battery');
  const [protocol, setProtocol] = useState('HTTP');
  const [database, setDatabase] = useState('MongoDB');

  const handleCheck = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    setResults([]);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/bot/detect-conflicts', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          device,
          protocol,
          database,
          powerSource: power,
          sensors: ['DHT22'],
          cloudPlatform: ''
        })
      });

      const data = await response.json();

      if (response.ok && data.conflicts) {
        setResults(data.conflicts);
        const count = data.conflicts.filter(c => c.level !== 'LOW').length;
        setConflictCount(count);
        const levels = data.conflicts.map(c => c.level);
        if (levels.includes('HIGH')) setHighestRisk('HIGH');
        else if (levels.includes('MEDIUM')) setHighestRisk('MEDIUM');
        else setHighestRisk('LOW');
        setMessage(`Analysis complete. Found ${count} potential issue(s).`);
      } else {
        throw new Error(data.message || 'Failed to analyze');
      }
    } catch (err) {
      console.error('Conflict check error:', err);
      // Fallback to local rule-based detection
      const localResults = [];
      let found = 0;
      let highest = 'None';

      if (power === 'Battery' && protocol === 'HTTP') {
        localResults.push({
          title: 'Battery device using HTTP', level: 'HIGH',
          reason: 'HTTP may create more requests and consume more power in an IoT device.',
          suggestion: 'Consider MQTT or reduce the sending frequency.'
        });
        found++; highest = 'HIGH';
      }
      if (device === 'Arduino Uno' && protocol === 'MQTT') {
        localResults.push({
          title: 'Arduino Uno with MQTT', level: 'MEDIUM',
          reason: 'Arduino Uno may need an additional network module to use MQTT.',
          suggestion: 'Check if Wi-Fi or Ethernet module is available.'
        });
        found++; if (highest !== 'HIGH') highest = 'MEDIUM';
      }
      if (found === 0) {
        localResults.push({
          title: 'No major conflict detected', level: 'LOW',
          reason: 'The selected configuration looks reasonable.',
          suggestion: 'Continue to Project Setup or ask the Socratic Bot for guidance.'
        });
        highest = 'LOW';
      }
      setResults(localResults);
      setConflictCount(found);
      setHighestRisk(highest);
      setMessage('Used local analysis (server unavailable).');
    } finally {
      setIsLoading(false);
    }
  };

  const renderConflictCard = (conflict, idx) => {
    let colorClass = 'bg-red-100 border-red-200 text-red-700';
    if (conflict.level === 'MEDIUM') colorClass = 'bg-yellow-100 border-yellow-300 text-orange-600';
    if (conflict.level === 'LOW') colorClass = 'bg-green-100 border-green-200 text-green-700';

    return (
      <div key={idx} className={`border rounded-3xl p-5 ${colorClass}`}>
        <div className="flex justify-between items-start mb-3">
          <h4 className="text-lg font-bold">{conflict.title}</h4>
          <span className="font-bold text-sm">{conflict.level}</span>
        </div>
        <p className="text-sm mb-3">{conflict.reason}</p>
        <p className="text-sm font-bold">💡 {conflict.suggestion}</p>
      </div>
    );
  };

  return (
    <>
      <Header title="Detect Conflict" subtitle="AI-powered architecture risk analysis" />

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-7">
          <p className="text-slate-500 text-lg mb-3">Current Conflicts</p>
          <h3 className="text-5xl font-bold text-slate-950">{conflictCount}</h3>
          <p className="text-slate-500 text-lg mt-3">Issues found in analysis</p>
        </div>
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-7">
          <p className="text-slate-500 text-lg mb-3">Highest Risk</p>
          <h3 className="text-5xl font-bold text-slate-950">{highestRisk}</h3>
          <p className="text-slate-500 text-lg mt-3">Severity level</p>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-7">
          <h3 className="text-2xl font-bold text-slate-950 mb-6">Run conflict analysis</h3>
          <form onSubmit={handleCheck} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Device</label>
              <select className="w-full border border-slate-300 rounded-2xl px-4 py-3" value={device} onChange={e => setDevice(e.target.value)}>
                <option>ESP32</option>
                <option>Arduino Uno</option>
                <option>Raspberry Pi</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Power</label>
              <select className="w-full border border-slate-300 rounded-2xl px-4 py-3" value={power} onChange={e => setPower(e.target.value)}>
                <option>Battery</option>
                <option>USB Power</option>
                <option>Wall Adapter</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Protocol</label>
              <select className="w-full border border-slate-300 rounded-2xl px-4 py-3" value={protocol} onChange={e => setProtocol(e.target.value)}>
                <option>HTTP</option>
                <option>MQTT</option>
                <option>CoAP</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Database</label>
              <select className="w-full border border-slate-300 rounded-2xl px-4 py-3" value={database} onChange={e => setDatabase(e.target.value)}>
                <option>MongoDB</option>
                <option>MySQL</option>
                <option>Firebase</option>
                <option>No Database</option>
              </select>
            </div>
            {message && <p className="text-sm text-green-500">{message}</p>}
            <button type="submit" disabled={isLoading} className="w-full bg-slate-950 text-white py-3 rounded-2xl font-bold hover:bg-slate-800 disabled:opacity-50">
              {isLoading ? '⏳ Analyzing...' : 'Analyze Architecture'}
            </button>
          </form>
        </div>
        
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-7">
          <h3 className="text-2xl font-bold text-slate-950 mb-6">Analysis Results</h3>
          <div className="space-y-4">
            {results.length > 0 ? results.map(renderConflictCard) : (
              <p className="text-slate-400 text-center py-8">Run an analysis to see results</p>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
