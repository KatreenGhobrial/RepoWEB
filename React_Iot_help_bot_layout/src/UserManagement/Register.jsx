import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '', dob: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const navigate = useNavigate();
  const { register } = useAuth();

  const set = field => e => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleRegister = async () => {
    setError('');
    setSuccess('');

    const { username, email, password, confirmPassword, dob } = form;

    if (!username || !email || !password || !dob) {
      return setError('All fields are required.');
    }
    if (password !== confirmPassword) {
      return setError('Passwords do not match.');
    }

    try {
      await register({ username, email, password, dob, role: 'student' });
      setSuccess('Registration successful! Redirecting...');
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Server error. Make sure the backend is running.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-lg p-8">
        <div className="text-center mb-6">
          <img src="/src/assets/IoTPic.png" className="w-56 mx-auto mb-4" alt="IoT HelpBot Logo" />
          <h1 className="text-3xl font-bold text-slate-900">Register</h1>
          <p className="text-slate-500 mt-2">Create an account</p>
        </div>
        <form id="registerForm" onSubmit={e => { e.preventDefault(); handleRegister(); }} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1">Username</label>
            <input 
                type="text" 
                value={form.username} 
                onChange={set('username')} 
                placeholder="Enter username" 
                className="w-full border border-slate-300 rounded-xl px-4 py-3" 
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1">Email</label>
            <input 
                type="email" 
                value={form.email} 
                onChange={set('email')} 
                placeholder="Enter email" 
                className="w-full border border-slate-300 rounded-xl px-4 py-3" 
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1">Password</label>
            <input 
                type="password" 
                value={form.password} 
                onChange={set('password')} 
                placeholder="Enter password" 
                className="w-full border border-slate-300 rounded-xl px-4 py-3" 
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1">Confirm Password</label>
            <input 
                type="password" 
                value={form.confirmPassword} 
                onChange={set('confirmPassword')} 
                placeholder="Confirm password" 
                className="w-full border border-slate-300 rounded-xl px-4 py-3" 
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1">Date of Birth</label>
            <input 
                type="date" 
                value={form.dob} 
                onChange={set('dob')} 
                className="w-full border border-slate-300 rounded-xl px-4 py-3" 
            />
          </div>
          
          {error && <p className="text-sm text-red-500">{error}</p>}
          {success && <p className="text-sm text-green-500">{success}</p>}
          
          <button type="submit" className="w-full bg-slate-950 text-white py-3 rounded-xl font-bold hover:bg-slate-800">
            Register
          </button>
        </form>
        <p className="text-center mt-6 text-slate-500">
          Already have an account? <Link to="/login" className="text-blue-600 font-bold">Login</Link>
        </p>
      </div>
    </div>
  );
}
