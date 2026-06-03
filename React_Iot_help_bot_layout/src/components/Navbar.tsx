import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const getLinkClass = (path: string) => {
    const base =
      'px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ';
    if (location.pathname === path) {
      return base + 'bg-cyan-500/20 text-cyan-400 shadow-sm shadow-cyan-500/10';
    }
    return base + 'text-slate-400 hover:text-white hover:bg-white/5';
  };

  const navLinks = [
    { path: '/home', label: 'Home', icon: '🏠' },
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/project-setup', label: 'Project', icon: '⚙️' },
    { path: '/tasks-team', label: 'Tasks', icon: '✅' },
    { path: '/socratic-bot', label: 'Bot', icon: '🤖' },
    { path: '/detect-conflict', label: 'Conflicts', icon: '⚠️' },
    { path: '/monitor-panel', label: 'Monitor', icon: '📡' },
    { path: '/library', label: 'Library', icon: '📚' },
    { path: '/forum', label: 'Forum', icon: '💬' },
  ];

  // Add mentor link for mentors/admins
  if (user?.role === 'mentor' || user?.role === 'admin') {
    navLinks.push({ path: '/mentor', label: 'Mentor Panel', icon: '🎓' });
  }

  return (
    <nav className="bg-slate-900/80 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/home" className="flex items-center gap-3 group">
            <div className="w-9 h-9 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center text-white text-lg shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-shadow">
              🤖
            </div>
            <span className="font-bold text-white hidden md:block">
              Bridge<span className="text-cyan-400">Bot</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1 overflow-x-auto">
            {navLinks.map((link) => (
              <Link key={link.path} to={link.path} className={getLinkClass(link.path)}>
                <span className="mr-1">{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </div>

          {/* User section */}
          <div className="flex items-center gap-3">
            <Link to="/profile" className="hidden sm:flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors">
              <div className="w-6 h-6 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-xs text-white font-bold">
                {user?.username?.charAt(0).toUpperCase() || '?'}
              </div>
              <span className="text-sm text-slate-300 font-medium">{user?.username || 'User'}</span>
              <span className="text-xs text-cyan-400/70 bg-cyan-400/10 px-1.5 py-0.5 rounded">{user?.role}</span>
            </Link>
            <button
              onClick={logout}
              className="text-sm text-slate-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
            >
              Sign out
            </button>
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden text-slate-400 hover:text-white p-2"
            >
              {mobileOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="lg:hidden pb-4 border-t border-white/5 pt-3">
            <div className="grid grid-cols-3 gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileOpen(false)}
                  className={getLinkClass(link.path) + ' text-center flex flex-col items-center gap-1 py-3'}
                >
                  <span className="text-lg">{link.icon}</span>
                  <span className="text-xs">{link.label}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
