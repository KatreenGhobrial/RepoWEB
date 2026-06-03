import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [dob, setDob] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage('');

    if (password !== confirmPassword) {
      setMessage('Passwords do not match.');
      setIsError(true);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, role: 'student' })
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || 'Registration failed.');
        setIsError(true);
        return;
      }

      // Save token and user info
      localStorage.setItem('token', data.token);
      localStorage.setItem('currentUser', JSON.stringify(data.user));
      
      setMessage('Registration successful! Redirecting...');
      setIsError(false);
      
      // Navigate to dashboard
      setTimeout(() => {
        navigate(`/dashboard?username=${data.user.username}`);
      }, 1000);
    } catch (error) {
      console.error('Registration error:', error);
      setMessage('Server error. Make sure the backend is running.');
      setIsError(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-lg p-8">
        <div className="text-center mb-6">
          <img src="/src/assets/IoTPic.png" className="w-56 mx-auto mb-4" alt="IoT HelpBot Logo" />
          <h1 className="text-3xl font-bold text-slate-900">Register</h1>
          <p className="text-slate-500 mt-2">Create a demo account</p>
        </div>
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1">Username</label>
            <input type="text" required value={username} onChange={e => setUsername(e.target.value)} placeholder="Enter username" className="w-full border border-slate-300 rounded-xl px-4 py-3" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1">Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter email" className="w-full border border-slate-300 rounded-xl px-4 py-3" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1">Password</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password" className="w-full border border-slate-300 rounded-xl px-4 py-3" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1">Confirm Password</label>
            <input type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm password" className="w-full border border-slate-300 rounded-xl px-4 py-3" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1">Date of Birth</label>
            <input type="date" required value={dob} onChange={e => setDob(e.target.value)} className="w-full border border-slate-300 rounded-xl px-4 py-3" />
          </div>
          {message && <p className={`text-sm ${isError ? 'text-red-500' : 'text-green-500'}`}>{message}</p>}
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
