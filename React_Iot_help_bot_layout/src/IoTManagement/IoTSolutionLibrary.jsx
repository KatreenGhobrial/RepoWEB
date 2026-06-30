import { useState, useEffect } from 'react';
import Header from '../UIComponents/Header';
import api from '../apiClient';

const TABS = [
  { key: 'hardware', label: 'Hardware', icon: '🔧' },
  { key: 'protocols', label: 'Protocols', icon: '📡' },
  { key: 'cloud', label: 'Cloud Platforms', icon: '☁️' },
  { key: 'software', label: 'Software Libraries', icon: '💻' }
];

const DIFFICULTY_COLOR = {
  'Beginner': 'bg-green-100 text-green-700',
  'Intermediate': 'bg-yellow-100 text-yellow-700',
  'Advanced': 'bg-red-100 text-red-700'
};

export default function IoTSolutionLibrary() {
  const [activeTab, setActiveTab] = useState('hardware');
  const [search, setSearch] = useState('');
  const [libraryData, setLibraryData] = useState({ hardware: [], protocols: [], cloud: [], software: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLibrary = async () => {
      try {
        const data = await api.get('/library');
        setLibraryData(data);
      } catch (err) {
        console.error('Error fetching library:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLibrary();
  }, []);

  const filter = (items) => {
    if (!items || !search.trim()) return items || [];
    const q = search.toLowerCase();
    return items.filter(item =>
      JSON.stringify(item).toLowerCase().includes(q)
    );
  };

  const results = filter(libraryData[activeTab]);

  if (loading) return <div className="flex items-center justify-center p-12"><p className="text-slate-500 text-lg">Loading library...</p></div>;

  return (
    <>
      <Header title="📚 IoT Solution Library" subtitle="Browse hardware, protocols, cloud platforms & software for your IoT project" />

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="🔍 Search across all categories..."
          className="w-full max-w-lg border border-slate-300 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white shadow-sm"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap border ${
              activeTab === tab.key
                ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <span>{tab.icon}</span> {tab.label}
          </button>
        ))}
      </div>

      {/* Count */}
      <p className="text-sm text-slate-500 mb-4">{results.length} item{results.length !== 1 ? 's' : ''} found</p>

      {/* Hardware Tab */}
      {activeTab === 'hardware' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {results.map(hw => (
            <div key={hw.name} className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{hw.icon}</span>
                  <div>
                    <h3 className="font-bold text-slate-900">{hw.name}</h3>
                    <span className="text-xs text-slate-500">{hw.type}</span>
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${DIFFICULTY_COLOR[hw.difficulty]}`}>{hw.difficulty}</span>
              </div>
              <p className="text-sm text-slate-600 mb-3">{hw.description}</p>
              <div className="bg-slate-50 rounded-xl p-3 mb-3">
                <p className="text-xs text-slate-500 font-semibold mb-1">Specs</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  {Object.entries(hw.specs).map(([k, v]) => (
                    <div key={k} className="flex justify-between text-xs">
                      <span className="text-slate-500">{k}</span>
                      <span className="font-medium text-slate-800">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500">💰 <span className="font-semibold text-slate-700">{hw.price}</span></p>
                <p className="text-xs text-slate-500">Best for: <span className="text-cyan-600 font-medium">{hw.bestFor}</span></p>
              </div>
              <div className="flex flex-wrap gap-1 mt-3">
                {hw.tags.map(tag => (
                  <span key={tag} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">#{tag}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Protocols Tab */}
      {activeTab === 'protocols' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {results.map(proto => (
            <div key={proto.name} className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{proto.icon}</span>
                  <div>
                    <h3 className="font-bold text-slate-900">{proto.name}</h3>
                    <span className="text-xs text-cyan-600 font-medium">{proto.category}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium block mb-1 ${DIFFICULTY_COLOR[proto.difficulty]}`}>{proto.difficulty}</span>
                  <span className="text-xs text-slate-500">{proto.latency}</span>
                </div>
              </div>
              <p className="text-sm text-slate-600 mb-3">{proto.description}</p>
              <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
                <div className="bg-slate-50 rounded-lg p-2">
                  <p className="text-slate-500 mb-0.5">Best For</p>
                  <p className="font-medium text-slate-800">{proto.bestFor}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-2">
                  <p className="text-slate-500 mb-0.5">Power Usage</p>
                  <p className="font-medium text-slate-800">{proto.powerUsage}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-green-600 font-semibold mb-1">✅ Pros</p>
                  {proto.pros.map((p, i) => <p key={i} className="text-xs text-slate-600">• {p}</p>)}
                </div>
                <div>
                  <p className="text-xs text-red-500 font-semibold mb-1">❌ Cons</p>
                  {proto.cons.map((c, i) => <p key={i} className="text-xs text-slate-600">• {c}</p>)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cloud Tab */}
      {activeTab === 'cloud' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {results.map(cp => (
            <div key={cp.name} className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{cp.icon}</span>
                  <div>
                    <h3 className="font-bold text-slate-900">{cp.name}</h3>
                    <span className="text-xs text-slate-500">{cp.provider}</span>
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${DIFFICULTY_COLOR[cp.difficulty]}`}>{cp.difficulty}</span>
              </div>
              <p className="text-sm text-slate-600 mb-3">{cp.description}</p>
              <div className="mb-3">
                <p className="text-xs text-slate-500 font-semibold mb-1">Features</p>
                <div className="flex flex-wrap gap-1">
                  {cp.features.map(f => (
                    <span key={f} className="text-xs bg-cyan-50 text-cyan-700 px-2 py-0.5 rounded-full border border-cyan-200">{f}</span>
                  ))}
                </div>
              </div>
              <div className="flex justify-between text-xs pt-3 border-t border-slate-100">
                <div>
                  <p className="text-slate-500">Pricing</p>
                  <p className="font-semibold text-slate-800">{cp.pricing}</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-500">Free Tier</p>
                  <p className="font-semibold text-green-600">{cp.freeTier}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Software Libraries Tab */}
      {activeTab === 'software' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {results.map(sw => (
            <div key={sw.name} className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{sw.icon}</span>
                  <div>
                    <h3 className="font-bold text-slate-900">{sw.name}</h3>
                    <span className="text-xs text-slate-500">{sw.language}</span>
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${DIFFICULTY_COLOR[sw.difficulty]}`}>{sw.difficulty}</span>
              </div>
              <p className="text-sm text-slate-600 mb-3">{sw.description}</p>
              <div className="bg-slate-50 rounded-lg p-2 mb-3 text-xs">
                <span className="text-slate-500">Use Case: </span>
                <span className="font-medium text-slate-800">{sw.useCase}</span>
              </div>
              <div className="flex flex-wrap gap-1 mb-3">
                {sw.tags.map(tag => (
                  <span key={tag} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">#{tag}</span>
                ))}
              </div>
              <p className="text-xs text-slate-500">📄 License: <span className="font-medium text-slate-700">{sw.license}</span></p>
            </div>
          ))}
        </div>
      )}

      {results.length === 0 && (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-slate-500 font-medium">No results found for "{search}"</p>
          <p className="text-sm text-slate-400 mt-1">Try a different keyword</p>
        </div>
      )}
    </>
  );
}
