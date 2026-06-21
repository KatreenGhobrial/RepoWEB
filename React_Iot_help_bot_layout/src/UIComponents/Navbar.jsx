import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { LuSun, LuMoon } from "react-icons/lu";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  
  const currentUserStr = localStorage.getItem('currentUser');
  const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-xl">
            🤖
          </div>
          <Link to="/home"><h1 className="font-bold text-lg hidden md:block whitespace-nowrap text-black dark:text-white hover:text-sky-400 transition-colors">IoT Project Hub</h1></Link>
        </div>

        <ul className="hidden lg:flex items-center gap-4 font-semibold text-sm text-slate-700 dark:text-slate-200">
          {currentUser && menuItems.map((item) => (
            <Link key={item.path} to={item.path}>
              <li className="p-2 hover:bg-sky-400 hover:text-white rounded-md transition-all cursor-pointer">
                {item.label}
              </li>
            </Link>
          ))}
          
          <div className="ml-4 flex items-center gap-4">
            {!currentUser ? (
              <div className="flex gap-2">
                <Link to="/login" className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">Log In</Link>
                <Link to="/register" className="px-4 py-2 text-sm font-semibold bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors">Register</Link>
              </div>
            ) : (
              <div className="hidden xl:flex items-center gap-4">
                <div className="bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 px-4 py-2 rounded-full flex items-center gap-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Signed in as</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{currentUser.username}</span>
                </div>
                <button onClick={handleLogout} className="px-3 py-1.5 text-xs font-semibold text-red-500 hover:text-white hover:bg-red-500 rounded-lg transition-colors border border-red-500">
                  Logout
                </button>
              </div>
            )}

            <div className='bg-zinc-100 dark:bg-zinc-800 p-1.5 rounded-xl flex items-center justify-center'>
              <button onClick={toggleTheme} className='bg-transparent p-2 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg text-black dark:text-white transition-all'>
                {theme === 'dark' ? <LuSun size={20} /> : <LuMoon size={20} />}
              </button>
            </div>
          </div>
        </ul>
      </div>
    </header>
  );
}
