import { useState, useEffect } from 'react';
import Header from '../components/Header';
import { libraryAPI } from '../services/api';
import type { IoTLibrary } from '../types';

type Tab = 'protocols' | 'hardware' | 'cloudPlatforms' | 'sensors';

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'protocols', label: 'Protocols', icon: '📡' },
  { key: 'hardware', label: 'Hardware', icon: '🔧' },
  { key: 'cloudPlatforms', label: 'Cloud', icon: '☁️' },
  { key: 'sensors', label: 'Sensors', icon: '📏' },
];

export default function IoTSolutionLibrary() {
  const [activeTab, setActiveTab] = useState<Tab>('protocols');
  const [data, setData] = useState<IoTLibrary | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadLibrary();
  }, []);

  const loadLibrary = async () => {
    setLoading(true);
    try {
      const lib = await libraryAPI.getAll();
      setData(lib);
    } catch (err) {
      setError((err as Error).message || 'Failed to load library');
    } finally {
      setLoading(false);
    }
  };

  const filterBySearch = <T extends Record<string, unknown>>(items: T[]): T[] => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter((item) =>
      Object.values(item).some((val) =>
        typeof val === 'string' && val.toLowerCase().includes(q)
      )
    );
  };

  return (
    <>
      <Header
        title="📚 IoT Solution Library"
        subtitle="Browse and compare protocols, hardware, sensors, and cloud platforms"
      />

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 Search across all categories..."
          className="w-full max-w-md bg-slate-700/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === tab.key
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : 'bg-slate-800/30 text-slate-400 border border-white/5 hover:bg-slate-800/60'
            }`}
          >
            <span>{tab.icon}</span> {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm mb-6">⚠️ {error}</div>
      )}

      {loading && (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-500 mt-3">Loading library...</p>
        </div>
      )}

      {data && !loading && (
        <>
          {/* Protocols */}
          {activeTab === 'protocols' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filterBySearch(data.protocols).map((proto) => (
                <div key={proto.name} className="bg-slate-800/30 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-base font-semibold text-white">{proto.name}</h3>
                      <span className="text-xs text-cyan-400">{proto.category}</span>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400">{proto.type}</span>
                  </div>
                  <p className="text-sm text-slate-400 mb-3">{proto.description}</p>
                  <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                    <div>
                      <p className="text-slate-500">Best For</p>
                      <p className="text-slate-300">{proto.bestFor}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Power Usage</p>
                      <p className="text-slate-300">{proto.powerUsage}</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div>
                      <p className="text-xs text-emerald-400 mb-1">✅ Pros</p>
                      {proto.pros.map((p, i) => (
                        <p key={i} className="text-xs text-slate-400">• {p}</p>
                      ))}
                    </div>
                    <div>
                      <p className="text-xs text-red-400 mb-1">❌ Cons</p>
                      {proto.cons.map((c, i) => (
                        <p key={i} className="text-xs text-slate-400">• {c}</p>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              {filterBySearch(data.protocols).length === 0 && (
                <p className="text-sm text-slate-500 col-span-2 text-center py-8">No protocols match your search.</p>
              )}
            </div>
          )}

          {/* Hardware */}
          {activeTab === 'hardware' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filterBySearch(data.hardware).map((hw) => (
                <div key={hw.name} className="bg-slate-800/30 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-base font-semibold text-white">{hw.name}</h3>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-400">{hw.type}</span>
                  </div>
                  <p className="text-sm text-slate-400 mb-3">{hw.description}</p>
                  <div className="bg-slate-700/30 rounded-lg p-3 mb-3">
                    <p className="text-xs text-slate-500 mb-1">Specs</p>
                    <div className="grid grid-cols-2 gap-1">
                      {Object.entries(hw.specs).map(([key, val]) => (
                        <div key={key} className="text-xs">
                          <span className="text-slate-500">{key}: </span>
                          <span className="text-slate-300">{String(val)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">Best for: <span className="text-slate-300">{hw.bestFor}</span></p>
                </div>
              ))}
              {filterBySearch(data.hardware).length === 0 && (
                <p className="text-sm text-slate-500 col-span-2 text-center py-8">No hardware matches your search.</p>
              )}
            </div>
          )}

          {/* Cloud */}
          {activeTab === 'cloudPlatforms' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filterBySearch(data.cloudPlatforms).map((cp) => (
                <div key={cp.name} className="bg-slate-800/30 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-base font-semibold text-white">{cp.name}</h3>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400">{cp.type}</span>
                  </div>
                  <p className="text-sm text-slate-400 mb-3">{cp.description}</p>
                  <div className="mb-3">
                    <p className="text-xs text-slate-500 mb-1">Features</p>
                    <div className="flex flex-wrap gap-1.5">
                      {cp.features.map((f, i) => (
                        <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400">{f}</span>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">Pricing: <span className="text-emerald-400">{cp.pricing}</span></p>
                </div>
              ))}
              {filterBySearch(data.cloudPlatforms).length === 0 && (
                <p className="text-sm text-slate-500 col-span-2 text-center py-8">No cloud platforms match your search.</p>
              )}
            </div>
          )}

          {/* Sensors */}
          {activeTab === 'sensors' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {filterBySearch(data.sensors).map((sensor) => (
                <div key={sensor.name} className="bg-slate-800/30 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all">
                  <h3 className="text-sm font-semibold text-white mb-2">{sensor.name}</h3>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Type</span>
                      <span className="text-cyan-400">{sensor.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Range</span>
                      <span className="text-slate-300">{sensor.range}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Accuracy</span>
                      <span className="text-slate-300">{sensor.accuracy}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Interface</span>
                      <span className="text-slate-300">{sensor.interface}</span>
                    </div>
                  </div>
                </div>
              ))}
              {filterBySearch(data.sensors).length === 0 && (
                <p className="text-sm text-slate-500 col-span-3 text-center py-8">No sensors match your search.</p>
              )}
            </div>
          )}
        </>
      )}
    </>
  );
}
