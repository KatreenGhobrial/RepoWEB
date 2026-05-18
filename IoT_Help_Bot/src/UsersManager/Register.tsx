import { useState } from 'react';
import LabeledInput from '../UIComponents/LabeledInput';
import { register } from './UsersService';
import { useNavigate } from 'react-router-dom';

export default function Register() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!username.trim() || !email.trim() || !name.trim() || !password.trim()) {
            setError('All fields are required.');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (password.length < 4) {
            setError('Password must be at least 4 characters.');
            return;
        }

        const res = register(username, name, email, password);
        if ('error' in res) {
            setError(res.error || 'An error occurred.');
        } else {
            setSuccess(true);
            setTimeout(() => navigate('/login'), 2000);
        }
    };

    return (
        <div className="min-h-[calc(100vh-12rem)] flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md animate-fade-in-up">
                <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-xl border border-gray-100 dark:border-zinc-700 overflow-hidden">
                    <div className="h-1.5 bg-gradient-to-r from-teal-400 to-sky-500" />

                    <div className="p-8">
                        <div className="text-center mb-8">
                            <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-400 to-sky-400 items-center justify-center text-white text-2xl mb-4 shadow-lg shadow-teal-500/20">
                                ✨
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create Account</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Join IoT Help Bot today</p>
                        </div>

                        {success ? (
                            <div className="text-center py-6">
                                <div className="text-5xl mb-4">🎉</div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Registration Successful!</h3>
                                <p className="text-gray-500 dark:text-gray-400 text-sm">Redirecting to login...</p>
                            </div>
                        ) : (
                            <form id="registerForm" onSubmit={handleRegister}>
                                <LabeledInput label="Username" type="text" value={username}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                                    placeholder="Choose a username" />
                                <LabeledInput label="Full Name" type="text" value={name}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                                    placeholder="Your full name" />
                                <LabeledInput label="Email" type="email" value={email}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                                    placeholder="you@example.com" />
                                <LabeledInput label="Password" type="password" value={password}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                                    placeholder="Min 4 characters" />
                                <LabeledInput label="Confirm Password" type="password" value={confirmPassword}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                                    placeholder="Re-enter password" />

                                {error && (
                                    <div className="mb-4 px-4 py-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                        <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    className="w-full py-3 bg-gradient-to-r from-teal-400 to-sky-500 text-white font-bold rounded-xl
                                               hover:shadow-lg hover:shadow-teal-500/25 hover:-translate-y-0.5
                                               transition-all duration-200 cursor-pointer mt-2"
                                >
                                    Create Account
                                </button>
                            </form>
                        )}

                        {!success && (
                            <div className="mt-6 text-center">
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Already have an account?{' '}
                                    <button
                                        onClick={() => navigate('/login')}
                                        className="text-sky-500 font-medium hover:text-sky-600 transition-colors cursor-pointer"
                                    >
                                        Sign in
                                    </button>
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}