import { useState } from 'react';
import logo from '../assets/IoTPic.png';
import { Link, useLocation } from "react-router-dom";
import { LuSun, LuMoon, LuMenu, LuX } from "react-icons/lu";

export default function Navbar(props: any) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const location = useLocation();

    const publicItems = [
        { label: 'Home', path: '/' },
        { label: 'About', path: '/about' },
        { label: 'Services', path: '/services' },
        { label: 'Contact', path: '/contact' },
    ];

    const authItems = props.user
        ? [
            { label: 'Dashboard', path: '/dashboard' },
            { label: 'Profile', path: '/profile' },
            ...(props.user.role === 'Admin' ? [{ label: 'Manage Users', path: '/manage-users' }] : []),
        ]
        : [
            { label: 'Login', path: '/login' },
        ];

    const allItems = [...publicItems, ...authItems];

    const isActive = (path: string) => location.pathname === path;

    return (
        <header className="fixed w-full top-0 z-50 glass drop-shadow-md transition-all duration-300">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3 group">
                        <img
                            src={logo}
                            alt="IoT Help Bot Logo"
                            className="h-12 w-auto object-contain group-hover:scale-110 transition-transform duration-300"
                        />
                        <span className="font-bold text-lg bg-gradient-to-r from-sky-500 to-teal-400 bg-clip-text text-transparent hidden sm:block">
                            IoT Help Bot
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <ul className="hidden md:flex items-center gap-1 font-medium text-sm">
                        {allItems.map((item) => (
                            <li key={item.path}>
                                <Link
                                    to={item.path}
                                    className={`px-4 py-2 rounded-lg transition-all duration-200 block
                                        ${isActive(item.path)
                                            ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25'
                                            : 'text-gray-700 dark:text-gray-300 hover:bg-sky-100 dark:hover:bg-sky-900/30 hover:text-sky-600 dark:hover:text-sky-400'
                                        }`}
                                >
                                    {item.label}
                                </Link>
                            </li>
                        ))}

                        {/* Logout button when user is logged in */}
                        {props.user && (
                            <li>
                                <button
                                    onClick={props.onLogout}
                                    className="px-4 py-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 cursor-pointer"
                                >
                                    Logout
                                </button>
                            </li>
                        )}

                        {/* Theme toggle */}
                        <li>
                            <button
                                onClick={props.onToggleTheme}
                                className="ml-2 p-2.5 rounded-xl bg-gray-100 dark:bg-zinc-700 hover:bg-gray-200 dark:hover:bg-zinc-600 transition-all duration-200 cursor-pointer"
                                aria-label="Toggle theme"
                            >
                                {props.theme === 'dark'
                                    ? <LuSun size={18} className="text-amber-400" />
                                    : <LuMoon size={18} className="text-gray-600" />
                                }
                            </button>
                        </li>

                        {/* User avatar when logged in */}
                        {props.user && (
                            <li className="ml-2">
                                <Link to="/profile" className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-sky-500 to-teal-400 text-white text-xs font-bold hover:shadow-lg hover:shadow-sky-500/25 transition-all duration-200">
                                    <span className="w-6 h-6 rounded-full bg-white/25 flex items-center justify-center text-[10px]">
                                        {props.user.name?.charAt(0)?.toUpperCase() || 'U'}
                                    </span>
                                    <span className="hidden lg:block">{props.user.name?.split(' ')[0]}</span>
                                </Link>
                            </li>
                        )}
                    </ul>

                    {/* Mobile menu button */}
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
                    >
                        {mobileOpen ? <LuX size={24} /> : <LuMenu size={24} />}
                    </button>
                </div>

                {/* Mobile Nav */}
                {mobileOpen && (
                    <div className="md:hidden pb-4 animate-fade-in">
                        <ul className="flex flex-col gap-1">
                            {allItems.map((item) => (
                                <li key={item.path}>
                                    <Link
                                        to={item.path}
                                        onClick={() => setMobileOpen(false)}
                                        className={`px-4 py-3 rounded-lg transition-all duration-200 block
                                            ${isActive(item.path)
                                                ? 'bg-sky-500 text-white'
                                                : 'text-gray-700 dark:text-gray-300 hover:bg-sky-100 dark:hover:bg-sky-900/30'
                                            }`}
                                    >
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                            {props.user && (
                                <li>
                                    <button
                                        onClick={() => { props.onLogout(); setMobileOpen(false); }}
                                        className="w-full text-left px-4 py-3 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all cursor-pointer"
                                    >
                                        Logout
                                    </button>
                                </li>
                            )}
                            <li className="px-4 pt-2">
                                <button
                                    onClick={props.onToggleTheme}
                                    className="p-2.5 rounded-xl bg-gray-100 dark:bg-zinc-700 hover:bg-gray-200 dark:hover:bg-zinc-600 transition-all cursor-pointer"
                                >
                                    {props.theme === 'dark'
                                        ? <LuSun size={18} className="text-amber-400" />
                                        : <LuMoon size={18} className="text-gray-600" />
                                    }
                                </button>
                            </li>
                        </ul>
                    </div>
                )}
            </nav>
        </header>
    );
}