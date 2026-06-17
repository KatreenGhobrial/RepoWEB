import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();
  const params = new URLSearchParams(window.location.search);
  const username = params.get('username') || 'Student';

  const getLinkClass = (path) => {
    const baseClass = "px-4 py-2 rounded-full text-sm font-bold transition-colors whitespace-nowrap ";
    if (location.pathname === path) {
      return baseClass + "bg-white text-slate-950";
    }
    return baseClass + "text-slate-300 hover:bg-white hover:text-slate-950";
  };

  return (
    <nav className="bg-slate-950 text-white p-4 flex flex-wrap items-center justify-between shadow-md gap-4">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-xl">
          🤖
        </div>
        <h1 className="font-bold text-lg hidden md:block whitespace-nowrap">IoT Project Hub</h1>
      </div>
      
      <div className="flex items-center gap-2 overflow-x-auto flex-1 justify-center">
        <Link to="/home" className={getLinkClass('/home')}>Home</Link>
        <Link to="/about" className={getLinkClass('/about')}>About</Link>
        <Link to="/profile" className={getLinkClass('/profile')}>Profile</Link>
        <Link to="/manage-users" className={getLinkClass('/manage-users')}>Manage Users</Link>
        <Link to="/dashboard" className={getLinkClass('/dashboard')}>Dashboard</Link>
        <Link to="/project-setup" className={getLinkClass('/project-setup')}>Project Setup</Link>
        <Link to="/tasks-team" className={getLinkClass('/tasks-team')}>Tasks & Team</Link>
        <Link to="/socratic-bot" className={getLinkClass('/socratic-bot')}>Socratic Bot</Link>
        <Link to="/detect-conflict" className={getLinkClass('/detect-conflict')}>Detect Conflict</Link>
        <Link to="/monitor-panel" className={getLinkClass('/monitor-panel')}>Mentor Panel</Link>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden lg:flex bg-slate-800 border border-slate-700 px-4 py-2 rounded-full items-center gap-2">
          <span className="text-xs text-slate-400">Signed in as</span>
          <span className="text-sm font-bold text-white">{username}</span>
        </div>
        <Link to="/login" className="bg-white text-slate-950 px-5 py-2 rounded-full font-bold text-sm hover:bg-slate-200 transition-colors whitespace-nowrap">
          Sign out
        </Link>
      </div>
    </nav>
  );
}
