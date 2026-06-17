import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setError('');

    if (!username || !password) {
        return setError('Username and password are required.');
    }

    try {
      const user = await login(username, password);
      if (user) {
          setError('');
          navigate(user.role === 'admin' ? '/manage-users' : '/profile');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Invalid username or password.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-lg p-8">
        <div className="text-center mb-6">
          <img src="/src/assets/IoTPic.png" className="w-56 mx-auto mb-4" alt="IoT HelpBot Logo" />
          <h1 className="text-3xl font-bold text-slate-900">Login</h1>
          <p className="text-slate-500 mt-2">Login to IoT HelpBot</p>
        </div>
        <form id="loginForm" method="post" onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1">Username or Email</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username or email" 
              className="w-full border border-slate-300 rounded-xl px-4 py-3" 
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password" 
              className="w-full border border-slate-300 rounded-xl px-4 py-3" 
            />
          </div>
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
          <button type="submit" className="w-full bg-slate-950 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors">
            Login
          </button>
        </form>
        <p className="text-center mt-6 text-slate-500">
          Don’t have an account? <Link to="/register" className="text-blue-600 font-bold hover:underline">Register</Link>
        </p>
      </div>
    </div>
  );
}
