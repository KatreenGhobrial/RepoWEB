import { useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Navbar from './UIComponents/Navbar';
import Footer from './UIComponents/Footer';
import Login from './UsersManager/Login';
import Register from './UsersManager/Register';
import Profile from './UsersManager/profile';
import ManageUsers from './UsersManager/ManagerUsers';
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Contact from './pages/Contact';
import Dashboard from './pages/Dashboard';
import { logout } from './UsersManager/UsersService';
import './App.css';

export default function App() {
    const [user, setUser] = useState<any>(null);
    const [theme, setTheme] = useState<string>('');
    const navigate = useNavigate();

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? '' : 'dark');
    };

    const handleLogout = () => {
        logout();
        setUser(null);
        navigate('/login');
    };

    return (
        <div className={`min-h-screen flex flex-col transition-colors duration-300 ${theme}`}>
            <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-zinc-900 text-gray-900 dark:text-gray-100">
                <Navbar
                    theme={theme}
                    onToggleTheme={toggleTheme}
                    user={user}
                    onLogout={handleLogout}
                />

                <main className="flex-grow pt-16">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/services" element={<Services />} />
                        <Route path="/contact" element={<Contact />} />
                        <Route path="/login" element={<Login setUser={setUser} />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" replace />} />
                        <Route path="/dashboard" element={user ? <Dashboard user={user} /> : <Navigate to="/login" replace />} />
                        <Route path="/manage-users" element={user?.role === 'Admin' ? <ManageUsers /> : <Navigate to="/login" replace />} />
                    </Routes>
                </main>

                <Footer />
            </div>
        </div>
    );
}