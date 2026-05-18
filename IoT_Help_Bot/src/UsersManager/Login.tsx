import { useState } from 'react';
import LabeledInput from '../UIComponents/LabeledInput';
import { login, setCurrentUser } from './UsersService';
import { useNavigate } from 'react-router-dom';

export default function Login({ setUser }: { setUser?: any }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        const user = login(username, password);
        if (user) {
            setError('');
            setCurrentUser(user);
            if (setUser) setUser(user);
            navigate(user.role === 'Admin' ? '/manage-users' : '/dashboard');
        } else {
            setError('Invalid username or password.');
        }
    };

    return (
        <div className="min-h-[calc(100vh-12rem)] flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md animate-fade-in-up">
                <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-xl border border-gray-100 dark:border-zinc-700 overflow-hidden">
                    {/* Top gradient accent */}
                    <div className="h-1.5 bg-gradient-to-r from-sky-500 to-teal-400" />

                    <div className="p-8">
                        <div className="text-center mb-8">
                            <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-400 to-teal-400 items-center justify-center text-white text-2xl mb-4 shadow-lg shadow-sky-500/20">
                                🔐
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome Back</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Sign in to your IoT Help Bot account</p>
                        </div>

                        <form id="loginForm" onSubmit={handleLogin}>
                            <LabeledInput
                                label="Username or Email"
                                type="text"
                                value={username}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                                placeholder="e.g. jsmith or jsmith@example.com"
                            />
                            <LabeledInput
                                label="Password"
                                type="password"
                                value={password}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                            />

                            {error && (
                                <div className="mb-4 px-4 py-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                    <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                                </div>
                            )}

                            <button
                                type="submit"
                                className="w-full py-3 bg-gradient-to-r from-sky-500 to-teal-400 text-white font-bold rounded-xl
                                           hover:shadow-lg hover:shadow-sky-500/25 hover:-translate-y-0.5
                                           transition-all duration-200 cursor-pointer mt-2"
                            >
                                Sign In
                            </button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Don't have an account?{' '}
                                <button
                                    onClick={() => navigate('/register')}
                                    className="text-sky-500 font-medium hover:text-sky-600 transition-colors cursor-pointer"
                                >
                                    Register here
                                </button>
                            </p>
                        </div>

                        {/* Demo credentials hint */}
                        <div className="mt-6 p-3 bg-sky-50 dark:bg-sky-900/10 rounded-xl border border-sky-100 dark:border-sky-800">
                            <p className="text-xs text-sky-600 dark:text-sky-400 font-medium mb-1">Demo Credentials</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                User: <span className="font-mono">jsmith</span> / <span className="font-mono">1234</span> &nbsp;|&nbsp;
                                Admin: <span className="font-mono">ajones</span> / <span className="font-mono">1234</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
