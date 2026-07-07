import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import * as usersService from './usersService';
import LabeledInput from '../UIComponents/LabeledInput';
import { useProject } from '../hooks/ProjectContext';

/**
 * Login Component.
 * Handles user authentication, capturing email/password and storing the
 * received token/user object in local storage upon success.
 */
export default function Login() {
  // controlled input values for the login form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // holds an error message to display if login fails
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { fetchProjects } = useProject();

  // submit credentials to the API; save user data and redirect on success
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await usersService.login({ email, password });
      localStorage.setItem('currentUser', JSON.stringify(user));
      await fetchProjects(); // Immediately load projects without page refresh
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed');
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6 bg-slate-100 dark:bg-zinc-950">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-xl p-8 border border-slate-200 dark:border-zinc-800">
        <h2 className="text-2xl font-bold text-center text-slate-800 dark:text-white mb-6">Welcome Back</h2>
        {/* Show error message below the heading if login fails */}
        {error && <div className="mb-4 text-red-500 text-sm text-center">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <LabeledInput 
            label="Email" 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 dark:border-zinc-700 rounded-lg dark:bg-zinc-800 dark:text-white"
            required 
          />
          <LabeledInput 
            label="Password" 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 dark:border-zinc-700 rounded-lg dark:bg-zinc-800 dark:text-white"
            required 
          />
          <button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
            Log In
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-600 dark:text-slate-400">
          Don't have an account? <Link to="/register" className="text-cyan-600 hover:underline">Register here</Link>
        </p>
      </div>
    </div>
  );
}
