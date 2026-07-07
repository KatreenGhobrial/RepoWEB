import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import * as usersService from './usersService';
import LabeledInput from '../UIComponents/LabeledInput';

/**
 * Register Component.
 * Allows new users to sign up by providing their credentials, selected expertise,
 * and role (e.g., student, mentor).
 */
export default function Register() {
  // controlled values for every registration form field
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // default expertise selection shown in the dropdown
  const [expertise, setExpertise] = useState('Hardware');
  // holds an error message to display if registration fails
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // send registration data to the API; store the new user session and redirect on success
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await usersService.register({ username, email, password, expertise: [expertise] });
      localStorage.setItem('currentUser', JSON.stringify(user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed');
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6 bg-slate-100 dark:bg-zinc-950">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-xl p-8 border border-slate-200 dark:border-zinc-800">
        <h2 className="text-2xl font-bold text-center text-slate-800 dark:text-white mb-6">Create an Account</h2>
        {/* Show error message if the API returns an error */}
        {error && <div className="mb-4 text-red-500 text-sm text-center">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <LabeledInput label="Username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-4 py-2 border border-slate-300 dark:border-zinc-700 rounded-lg dark:bg-zinc-800 dark:text-white" required />
          <LabeledInput label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2 border border-slate-300 dark:border-zinc-700 rounded-lg dark:bg-zinc-800 dark:text-white" required />
          <LabeledInput label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-2 border border-slate-300 dark:border-zinc-700 rounded-lg dark:bg-zinc-800 dark:text-white" required />
          {/* Expertise dropdown wrapped with LabeledInput for consistent label styling */}
          <LabeledInput label="Expertise">
            <select 
              value={expertise}
              onChange={(e) => setExpertise(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 dark:border-zinc-700 rounded-lg dark:bg-zinc-800 dark:text-white appearance-none cursor-pointer"
            >
              <option value="Hardware">Hardware</option>
              <option value="Firmware">Firmware</option>
              <option value="Backend">Backend</option>
              <option value="Frontend">Frontend</option>
              <option value="Architecture">Architecture</option>
              <option value="QA / Testing">QA / Testing</option>
            </select>
          </LabeledInput>
          <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg transition-colors mt-2">
            Register
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-600 dark:text-slate-400">
          Already have an account? <Link to="/login" className="text-cyan-600 hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}
