import { useState, FormEvent } from 'react';
import Header from '../components/Header';
import { useProject } from '../context/ProjectContext';
import { botAPI } from '../services/api';
import type { Conflict } from '../types';

const LEVEL_STYLES: Record<string, { bg: string; text: string; icon: string }> = {
  HIGH: { bg: 'bg-red-500/10 border-red-500/30', text: 'text-red-400', icon: '🔴' },
  MEDIUM: { bg: 'bg-amber-500/10 border-amber-500/30', text: 'text-amber-400', icon: '🟡' },
  LOW: { bg: 'bg-blue-500/10 border-blue-500/30', text: 'text-blue-400', icon: '🔵' },
};

export default function DetectConflict() {
  const { currentProject } = useProject();
  const [device, setDevice] = useState(currentProject?.device || '');
  const [protocol, setProtocol] = useState(currentProject?.protocol || '');
  const [database, setDatabase] = useState(currentProject?.database || '');
  const [powerSource, setPowerSource] = useState(currentProject?.powerSource || '');
  const [cloudPlatform, setCloudPlatform] = useState(currentProject?.cloudPlatform || '');
  const [sensors, setSensors] = useState(currentProject?.sensors?.join(', ') || '');
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasScanned, setHasScanned] = useState(false);

  const handleDetect = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setConflicts([]);

    try {
      const res = await botAPI.detectConflicts({
        device,
        protocol,
        database,
        powerSource,
        sensors: sensors.split(',').map((s) => s.trim()).filter(Boolean),
        cloudPlatform,
      });
      setConflicts(res.conflicts);
      setHasScanned(true);
    } catch (err) {
      setError((err as Error).message || 'Failed to detect conflicts');
    } finally {
      setLoading(false);
    }
  };

  const highCount = conflicts.filter((c) => c.level === 'HIGH').length;
  const medCount = conflicts.filter((c) => c.level === 'MEDIUM').length;
  const lowCount = conflicts.filter((c) => c.level === 'LOW').length;

  return (
    <>
      <Header
        title="⚡ Conflict Detector"
        subtitle="Scan your IoT architecture for potential conflicts and incompatibilities"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Architecture Input Form */}
        <div className="lg:col-span-1">
          <form onSubmit={handleDetect} className="bg-slate-800/30 border border-white/5 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <span>🔧</span> Architecture Details
            </h3>

            {[
              { label: 'Device / MCU', value: device, setter: setDevice, placeholder: 'e.g. ESP32, Arduino Mega, Raspberry Pi' },
              { label: 'Protocol', value: protocol, setter: setProtocol, placeholder: 'e.g. MQTT, HTTP, CoAP, BLE' },
              { label: 'Database', value: database, setter: setDatabase, placeholder: 'e.g. InfluxDB, MongoDB, Firebase' },
              { label: 'Power Source', value: powerSource, setter: setPowerSource, placeholder: 'e.g. Battery 3.7V, USB, Solar' },
              { label: 'Cloud Platform', value: cloudPlatform, setter: setCloudPlatform, placeholder: 'e.g. AWS IoT, Azure, GCP' },
              { label: 'Sensors (comma-separated)', value: sensors, setter: setSensors, placeholder: 'e.g. DHT22, BMP280, PIR' },
            ].map(({ label, value, setter, placeholder }) => (
              <div key={label}>
                <label className="block text-xs text-slate-400 mb-1.5">{label}</label>
                <input
                  type="text"
                  value={value}
                  onChange={(e) => setter(e.target.value)}
                  placeholder={placeholder}
                  className="w-full bg-slate-700/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all"
                />
              </div>
            ))}

            <button
              type="submit"
              disabled={loading || !device.trim()}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-3 rounded-xl font-semibold text-sm hover:from-cyan-400 hover:to-blue-400 transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Scanning...
                </>
              ) : (
                <>⚡ Detect Conflicts</>
              )}
            </button>
          </form>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2 space-y-5">
          {/* Summary Stats */}
          {hasScanned && (
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-red-400">{highCount}</p>
                <p className="text-xs text-red-400/70 mt-1">High Risk</p>
              </div>
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-amber-400">{medCount}</p>
                <p className="text-xs text-amber-400/70 mt-1">Medium Risk</p>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-blue-400">{lowCount}</p>
                <p className="text-xs text-blue-400/70 mt-1">Low Risk</p>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">
              ⚠️ {error}
            </div>
          )}

          {/* Conflicts List */}
          {hasScanned && conflicts.length === 0 && !error && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-8 text-center">
              <span className="text-4xl">✅</span>
              <h3 className="text-lg font-semibold text-emerald-400 mt-3">No Conflicts Detected!</h3>
              <p className="text-sm text-slate-400 mt-1">Your architecture looks compatible. Keep iterating!</p>
            </div>
          )}

          {conflicts.map((conflict, idx) => {
            const style = LEVEL_STYLES[conflict.level] || LEVEL_STYLES.LOW;
            return (
              <div
                key={idx}
                className={`border rounded-2xl p-5 ${style.bg} transition-all hover:scale-[1.01]`}
              >
                <div className="flex items-start justify-between mb-3">
                  <h4 className={`font-semibold ${style.text} flex items-center gap-2`}>
                    {style.icon} {conflict.title}
                  </h4>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${style.text} ${style.bg}`}>
                    {conflict.level}
                  </span>
                </div>
                <p className="text-sm text-slate-300 mb-3">{conflict.reason}</p>
                <div className="bg-slate-900/50 rounded-xl p-3">
                  <p className="text-xs text-slate-500 mb-1 font-medium">💡 Suggestion</p>
                  <p className="text-sm text-slate-300">{conflict.suggestion}</p>
                </div>
              </div>
            );
          })}

          {/* Empty state */}
          {!hasScanned && (
            <div className="bg-slate-800/30 border border-white/5 rounded-2xl p-12 text-center">
              <span className="text-5xl">🔍</span>
              <h3 className="text-lg font-semibold text-slate-300 mt-4">Ready to Scan</h3>
              <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
                Enter your IoT architecture details on the left and click "Detect Conflicts"
                to identify potential incompatibilities between your components.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
