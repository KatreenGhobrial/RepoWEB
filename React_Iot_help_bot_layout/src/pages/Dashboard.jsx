import { useState, useEffect } from 'react';
import Header from '../components/Header';
import fakeData from '../DataAccess/fake-data.json';

export default function Dashboard() {
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    setDashboard(fakeData.dashboard);
  }, []);

  if (!dashboard) return <div>Loading...</div>;

  return (
    <>
      <Header title="IoT Help Bot" subtitle="Manage architecture, detect IoT risks, and support collaboration." />

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-7">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-lg mb-3">Project Role Coverage</p>
              <h3 className="text-5xl font-bold text-slate-950">{dashboard.roleCoverage.value}</h3>
              <p className="text-slate-500 text-lg mt-3">{dashboard.roleCoverage.text}</p>
            </div>
            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-2xl">👥</div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-7">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-lg mb-3">Detected Issues</p>
              <h3 className="text-5xl font-bold text-slate-950">{dashboard.detectedIssues}</h3>
              <p className="text-slate-500 text-lg mt-3">Auto-detected from architecture</p>
            </div>
            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-2xl">⚠️</div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-7">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-lg mb-3">Tasks Completed</p>
              <h3 className="text-5xl font-bold text-slate-950">{dashboard.tasksCompleted.value}</h3>
              <p className="text-slate-500 text-lg mt-3">{dashboard.tasksCompleted.text}</p>
            </div>
            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-2xl">✅</div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-7">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-lg mb-3">Documentation Status</p>
              <h3 className="text-5xl font-bold text-slate-950">{dashboard.documentationStatus}</h3>
              <p className="text-slate-500 text-lg mt-3">Requirements and notes available</p>
            </div>
            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-2xl">📄</div>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-7 mb-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-xl">📈</div>
          <h3 className="text-2xl font-bold text-slate-950">Progress by area</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-end">
          {dashboard.progress.map((item, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className="h-56 w-full flex items-end justify-center">
                <div className="w-24 bg-black rounded-t-2xl" style={{ height: `${item.value}%` }}></div>
              </div>
              <p className="mt-4 font-bold text-slate-800">{item.name}</p>
              <p className="text-slate-500">{item.value}%</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-7">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-xl">🔔</div>
          <h3 className="text-2xl font-bold text-slate-950">Live alerts</h3>
        </div>
        <div className="space-y-4">
          {dashboard.alerts.map((alert, index) => {
            const isMedium = alert.level === 'MEDIUM';
            const alertClass = isMedium 
              ? 'bg-yellow-100 border-yellow-300 text-orange-600' 
              : 'bg-red-100 border-red-200 text-red-700';
              
            return (
              <div key={index} className={`border rounded-3xl p-5 ${alertClass}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xl font-bold mb-2">{alert.title}</h4>
                    <p>{alert.category}</p>
                  </div>
                  <span className="font-bold">{alert.level}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
