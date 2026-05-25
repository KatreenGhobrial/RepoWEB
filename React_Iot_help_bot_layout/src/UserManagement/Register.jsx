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

  const handleRegister = (e) => {
    e.preventDefault();
    setMessage('');

    if (password !== confirmPassword) {
      setMessage('Passwords do not match.');
      setIsError(true);
      return;
    }

    try {
      const users = JSON.parse(localStorage.getItem('users')) || [];

      const userExists = users.some(user => user.username === username || user.email === email);

      if (userExists) {
        setMessage('Username or email already exists.');
        setIsError(true);
        return;
      }

      const isAdmin = users.length === 0;

      const newUser = {
        username,
        email,
        password,
        dob,
        isAdmin
      };

      users.push(newUser);

      localStorage.setItem('users', JSON.stringify(users));
      localStorage.setItem('currentUser', JSON.stringify(newUser));
      
      setMessage('Registration successful! User saved.');
      setIsError(false);
      
      // Navigate to dashboard
      navigate(`/dashboard?username=${username}`);
    } catch (error) {
      setMessage('An error occurred during registration.');
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
