import { useState, useEffect } from 'react';
import Header from '../UIComponents/Header';
import LabeledInput from '../UIComponents/LabeledInput';
import { detectConflicts } from './iotService';

/**
 * DetectConflict Component.
 * Evaluates the current IoT architecture for interdisciplinary conflicts 
 * (e.g., protocol overhead on battery power) and provides Socratic guidance.
 */
export default function DetectConflict() {
  // list of conflict objects returned from the analysis
  const [results, setResults] = useState([]);
  // number of non-LOW conflicts found
  const [conflictCount, setConflictCount] = useState(0);
  // highest severity level found ('HIGH', 'MEDIUM', 'LOW', or 'None')
  const [highestRisk, setHighestRisk] = useState('None');
  // status/feedback message shown to the user
  const [message, setMessage] = useState('');
  // true while waiting for the API or local analysis to finish
  const [isLoading, setIsLoading] = useState(false);
  
  // selected device type from the form dropdown
  const [device, setDevice] = useState('ESP32');
  // selected power source from the form dropdown
  const [power, setPower] = useState('Battery');
  // selected communication protocol from the form dropdown
  const [protocol, setProtocol] = useState('HTTP');
  // selected database type from the form dropdown
  const [database, setDatabase] = useState('MongoDB');

  // submit the architecture config to the conflict-detection API
  const handleCheck = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    setResults([]);

    try {
      const data = await detectConflicts({
        device,
        protocol,
        database,
        powerSource: power,
        sensors: ['DHT22'],
        cloudPlatform: ''
      });

      if (data.conflicts) {
        setResults(data.conflicts);
        // count only conflicts above LOW severity
        const count = data.conflicts.filter(c => c.level !== 'LOW').length;
        setConflictCount(count);
        // determine the highest risk level from the returned conflicts
        const levels = data.conflicts.map(c => c.level);
        if (levels.includes('HIGH')) setHighestRisk('HIGH');
        else if (levels.includes('MEDIUM')) setHighestRisk('MEDIUM');
        else setHighestRisk('LOW');
        setMessage(`Analysis complete. Found ${count} potential issue(s).`);
      } else {
        throw new Error('Failed to analyze');
      }
    } catch (err) {
      console.error('Conflict check error:', err);
      // Fallback to local rule-based detection
      const localResults = [];
      let found = 0;
      let highest = 'None';

      // rule: battery + HTTP is a bad combination due to high power use
      if (power === 'Battery' && protocol === 'HTTP') {
        localResults.push({
          title: 'Battery device using HTTP', level: 'HIGH',
          reason: 'HTTP may create more requests and consume more power in an IoT device.',
          suggestion: 'Consider MQTT or reduce the sending frequency.'
        });
        found++; highest = 'HIGH';
      }
      // rule: Arduino Uno lacks built-in WiFi needed for MQTT
      if (device === 'Arduino Uno' && protocol === 'MQTT') {
        localResults.push({
          title: 'Arduino Uno with MQTT', level: 'MEDIUM',
          reason: 'Arduino Uno may need an additional network module to use MQTT.',
          suggestion: 'Check if Wi-Fi or Ethernet module is available.'
        });
        found++; if (highest !== 'HIGH') highest = 'MEDIUM';
      }
      // no issues found — show a safe result
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

  // render a single conflict result card with color based on severity level
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

      {/* summary stat cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm p-7">
          <p className="text-slate-500 dark:text-slate-400 text-lg mb-3">Current Conflicts</p>
          <h3 className="text-5xl font-bold text-slate-950 dark:text-white">{conflictCount}</h3>
          <p className="text-slate-500 dark:text-slate-400 text-lg mt-3">Issues found in analysis</p>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm p-7">
          <p className="text-slate-500 dark:text-slate-400 text-lg mb-3">Highest Risk</p>
          <h3 className="text-5xl font-bold text-slate-950 dark:text-white">{highestRisk}</h3>
          <p className="text-slate-500 dark:text-slate-400 text-lg mt-3">Severity level</p>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* configuration form */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm p-7">
          <h3 className="text-2xl font-bold text-slate-950 dark:text-white mb-6">Run conflict analysis</h3>
          <form onSubmit={handleCheck} className="space-y-5">
            <LabeledInput label="Device">
              <select className="w-full border border-slate-300 rounded-2xl px-4 py-3" value={device} onChange={e => setDevice(e.target.value)}>
                <option>ESP32</option>
                <option>Arduino Uno</option>
                <option>Raspberry Pi</option>
              </select>
            </LabeledInput>
            <LabeledInput label="Power">
              <select className="w-full border border-slate-300 rounded-2xl px-4 py-3" value={power} onChange={e => setPower(e.target.value)}>
                <option>Battery</option>
                <option>USB Power</option>
                <option>Wall Adapter</option>
              </select>
            </LabeledInput>
            <LabeledInput label="Protocol">
              <select className="w-full border border-slate-300 rounded-2xl px-4 py-3" value={protocol} onChange={e => setProtocol(e.target.value)}>
                <option>HTTP</option>
                <option>MQTT</option>
                <option>CoAP</option>
              </select>
            </LabeledInput>
            <LabeledInput label="Database">
              <select className="w-full border border-slate-300 rounded-2xl px-4 py-3" value={database} onChange={e => setDatabase(e.target.value)}>
                <option>MongoDB</option>
                <option>MySQL</option>
                <option>Firebase</option>
                <option>No Database</option>
              </select>
            </LabeledInput>
            {message && <p className="text-sm text-green-500">{message}</p>}
            <button type="submit" disabled={isLoading} className="w-full bg-slate-50 dark:bg-zinc-800/50 text-white dark:bg-cyan-600 dark:text-white py-3 rounded-2xl font-bold hover:bg-slate-50 dark:hover:bg-zinc-800/50 disabled:opacity-50">
              {isLoading ? '⏳ Analyzing...' : 'Analyze Architecture'}
            </button>
          </form>
        </div>
        
        {/* results panel */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm p-7">
          <h3 className="text-2xl font-bold text-slate-950 dark:text-white mb-6">Analysis Results</h3>
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
