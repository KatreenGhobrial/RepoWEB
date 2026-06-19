import { Link, useNavigate } from "react-router-dom";
import { LuSun, LuMoon } from "react-icons/lu";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Project Setup', path: '/project-setup' },
    { label: 'Tasks & Team', path: '/tasks-team' },
    { label: 'Community', path: '/community' },
    { label: 'Socratic Bot', path: '/socratic-bot' },
    { label: 'Device Playground', path: '/device-playground' },
    { label: 'Mentor Panel', path: '/monitor-panel' },
  ];

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
          {menuItems.map((item) => (
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
