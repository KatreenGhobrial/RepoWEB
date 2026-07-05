import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { LuSun, LuMoon, LuBell, LuX, LuCheck } from "react-icons/lu";
import { getAlerts, simulateAlert, resolveAlert } from '../IoTManagement/alertService';
import AlertToast from './AlertToast';
import useDarkMode from '../hooks/useDarkMode';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark, toggleTheme } = useDarkMode();

  const currentUserStr = localStorage.getItem('currentUser');
  let currentUser = null;
  try {
    currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;
  } catch (e) {
    currentUser = null;
  }

  const [alerts, setAlerts] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    if (currentUser) {
      getAlerts('demo').then(data => {
        if (Array.isArray(data)) setAlerts(data);
      }).catch(err => console.error("Error fetching alerts:", err));
    }
  }, [currentUserStr]);

  const handleSimulateAlert = async () => {
    try {
      const newAlert = await simulateAlert('demo');
      const updatedAlerts = await getAlerts('demo');
      setAlerts(updatedAlerts || []);
      if (newAlert) {
        setToasts(ts => [...ts, { id: Date.now(), ...newAlert }]);
      }
    } catch (err) {
      console.error("Error simulating alert:", err);
    }
  };

  const handleResolveAlert = async (id) => {
    try {
      await resolveAlert(id);
      const updatedAlerts = await getAlerts('demo');
      setAlerts(updatedAlerts || []);
    } catch (err) {
      console.error("Error resolving alert:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    window.location.href = '/login';
  };

  let menuItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Project Setup', path: '/project-setup' },
    { label: 'Tasks & Team', path: '/tasks-team' },
    { label: 'Community', path: '/community' },
    { label: 'Solution Library', path: '/solution-library' },
    { label: 'Socratic Bot', path: '/socratic-bot' },
    { label: 'Tech Docs', path: '/tech-docs' },
  ];

  if (currentUser?.role === 'student') {
    menuItems.push({ label: 'Device Playground', path: '/device-playground' });
    menuItems.push({ label: 'Monitor Panel', path: '/monitor-panel' });
  }

  if (currentUser?.role === 'mentor') {
    menuItems = menuItems.filter(item => item.label !== 'Tasks & Team');
    menuItems.push({ label: 'Mentor Dashboard', path: '/mentor-dashboard' });
  }

  if (currentUser?.role === 'admin') {
    menuItems.push({ label: 'Manage Users', path: '/manage-users' });
  }

  return (
    <header className="fixed w-full top-0 py-4 px-6 drop-shadow-md bg-white dark:bg-zinc-900 dark:border-b dark:border-zinc-700 z-50">
      <div className="flex items-center justify-between gap-8 w-full">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-xl">
            🤖
          </div>
          <Link to="/home"><h1 className="font-bold text-lg hidden md:block whitespace-nowrap text-black dark:text-white hover:text-sky-400 transition-colors">IoT Project Hub</h1></Link>
        </div>

        <ul className="hidden lg:flex items-center gap-4 lg:ml-12 font-semibold text-sm text-slate-700 dark:text-slate-200">
          {currentUser && menuItems.map((item) => {
            const isActive = location.pathname.includes(item.path);
            return (
              <Link key={item.path} to={item.path}>
                <li className={`px-3 py-2 rounded-xl transition-all cursor-pointer ${isActive ? 'bg-cyan-600 text-white shadow-md font-bold' : 'hover:bg-cyan-50 dark:hover:bg-zinc-800 hover:text-cyan-600 dark:hover:text-cyan-400 font-semibold'}`}>
                  {item.label}
                </li>
              </Link>
            );
          })}
          
          <div className="ml-4 flex items-center gap-4">
            {!currentUser ? (
              <div className="flex gap-2">
                <Link to="/login" className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">Log In</Link>
                <Link to="/register" className="px-4 py-2 text-sm font-semibold bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors">Register</Link>
              </div>
            ) : (
              <div className="hidden xl:flex items-center gap-4">
                <Link to="/profile" className="bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 px-4 py-2 rounded-full flex items-center gap-2 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Signed in as</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{currentUser.username}</span>
                </Link>
                <button onClick={handleLogout} className="px-3 py-1.5 text-xs font-semibold text-red-500 hover:text-white hover:bg-red-500 rounded-lg transition-colors border border-red-500">
                  Logout
                </button>
              </div>
            )}

            <div className='flex items-center gap-2'>
              {currentUser && (
                <div className="relative">
                  <div className='bg-zinc-100 dark:bg-zinc-800 p-1.5 rounded-xl flex items-center justify-center'>
                    <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className='relative bg-transparent p-2 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg text-black dark:text-white transition-all'>
                      <LuBell size={20} />
                      {alerts.filter(a => !a.resolved).length > 0 && (
                        <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
                      )}
                    </button>
                  </div>
                  
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl shadow-xl overflow-hidden z-50">
                      <div className="p-3 border-b border-slate-200 dark:border-zinc-700 font-bold text-slate-800 dark:text-white flex justify-between items-center">
                        IoT Alerts
                        <span className="bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 text-xs px-2 py-0.5 rounded-full">
                          {alerts.filter(a => !a.resolved).length} new
                        </span>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {alerts.filter(a => !a.resolved).slice(0, 5).length === 0 ? (
                          <div className="p-4 text-center text-sm text-slate-500 dark:text-slate-400">No new alerts</div>
                        ) : (
                          alerts.filter(a => !a.resolved).slice(0, 5).map(alert => (
                            <div key={alert._id || alert.id} className="p-3 border-b border-slate-100 dark:border-zinc-700/50 hover:bg-slate-50 dark:hover:bg-zinc-700/30 transition-colors">
                              <div className="flex justify-between items-start mb-1">
                                <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200">{alert.title}</h4>
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                  alert.severity === 'HIGH' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                                  alert.severity === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-500' :
                                  'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                }`}>{alert.severity}</span>
                              </div>
                              <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">{alert.message}</p>
                              <button onClick={() => handleResolveAlert(alert._id || alert.id)} className="flex items-center gap-1 text-xs text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 font-medium">
                                <LuCheck size={12} /> Mark as resolved
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                      <div className="p-2 border-t border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/80">
                        <button onClick={handleSimulateAlert} className="w-full py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded transition-colors">
                          Simulate Alert
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
              <div className='bg-zinc-100 dark:bg-zinc-800 p-1.5 rounded-xl flex items-center justify-center'>
                <button onClick={toggleTheme} className='bg-transparent p-2 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg text-black dark:text-white transition-all'>
                  {isDark ? <LuSun size={20} /> : <LuMoon size={20} />}
                </button>
              </div>
            </div>
          </div>
        </ul>
      </div>
      <AlertToast toasts={toasts} removeToast={(id) => setToasts(ts => ts.filter(t => t.id !== id))} />
    </header>
  );
}
