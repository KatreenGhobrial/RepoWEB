import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { find } from '../users';

export default function Login() {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usernameOrEmail, password })
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || 'Invalid username/email or password.');
        setIsError(true);
        return;
      }

      // Save token and user info
      localStorage.setItem('token', data.token);
      localStorage.setItem('currentUser', JSON.stringify(data.user));
      
      setMessage('Login successful!');
      setIsError(false);
      
      // Navigate to dashboard
      setTimeout(() => {
        navigate(`/dashboard?username=${data.user.username}`);
      }, 500);
    } catch (error) {
      console.error('Login error:', error);
      setMessage('Server error. Make sure the backend is running.');
      setIsError(true);
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
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1">Username or Email</label>
            <input 
              type="text" 
              required 
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
              placeholder="Enter username or email" 
              className="w-full border border-slate-300 rounded-xl px-4 py-3" 
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1">Password</label>
            <input 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password" 
              className="w-full border border-slate-300 rounded-xl px-4 py-3" 
            />
          </div>
          {message && (
            <p className={`text-sm ${isError ? 'text-red-500' : 'text-green-500'}`}>{message}</p>
          )}
          <button type="submit" className="w-full bg-slate-950 text-white py-3 rounded-xl font-bold hover:bg-slate-800">
            Login
          </button>
        </form>
        <p className="text-center mt-6 text-slate-500">
          Don’t have an account? <Link to="/register" className="text-blue-600 font-bold">Register</Link>
        </p>
      </div>
    </div>
  );
}
