import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const EXPERTISE_OPTIONS = [
  'Hardware', 'Firmware', 'Backend', 'Frontend',
  'AI / ML', 'Cloud', 'Security', 'Networking',
  'Sensors', 'Embedded Systems', 'UI/UX Design',
];

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'student' | 'mentor' | 'admin'>('student');
  const [discipline, setDiscipline] = useState('');
  const [selectedExpertise, setSelectedExpertise] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const toggleExpertise = (item: string) => {
    setSelectedExpertise((prev) =>
      prev.includes(item) ? prev.filter((e) => e !== item) : [...prev, item]
    );
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setMessage('');

    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      setIsError(true);
      return;
    }

    if (password.length < 6) {
      setMessage('Password must be at least 6 characters');
      setIsError(true);
      return;
    }

    setLoading(true);
    try {
      await register({
        username,
        email,
        password,
        role,
        expertise: selectedExpertise,
        discipline,
      });
      setMessage('Registration successful!');
      setIsError(false);
      navigate('/dashboard');
    } catch (err) {
      setMessage((err as Error).message || 'Registration failed');
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-6">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative bg-slate-800/50 backdrop-blur-xl border border-white/10 w-full max-w-lg rounded-2xl shadow-2xl shadow-black/20 p-8 max-h-[90vh] overflow-y-auto">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg shadow-cyan-500/20">
            🤖
          </div>
          <h1 className="text-3xl font-bold text-white">
            Join <span className="text-cyan-400">BridgeBot</span>
          </h1>
          <p className="text-slate-400 mt-2">Create your account</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Username</label>
              <input
                type="text" required value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="johndoe"
                className="w-full bg-slate-700/50 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
              <input
                type="email" required value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@braude.ac.il"
                className="w-full bg-slate-700/50 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
              <input
                type="password" required value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 chars"
                className="w-full bg-slate-700/50 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Confirm Password</label>
              <input
                type="password" required value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
                className="w-full bg-slate-700/50 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as 'student' | 'mentor' | 'admin')}
                className="w-full bg-slate-700/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all text-sm"
              >
                <option value="student">Student</option>
                <option value="mentor">Mentor / Instructor</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Discipline</label>
              <input
                type="text" value={discipline}
                onChange={(e) => setDiscipline(e.target.value)}
                placeholder="e.g. Electrical Eng."
                className="w-full bg-slate-700/50 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all text-sm"
              />
            </div>
          </div>

          {/* Expertise chips */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Expertise Areas <span className="text-slate-500">(select all that apply)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {EXPERTISE_OPTIONS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggleExpertise(item)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                    selectedExpertise.includes(item)
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-400/30'
                      : 'bg-slate-700/50 text-slate-400 border border-white/10 hover:border-white/20'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {message && (
            <div className={`text-sm px-4 py-2.5 rounded-lg ${isError ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-3 rounded-xl font-bold hover:from-cyan-400 hover:to-blue-400 transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating account...
              </span>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <p className="text-center mt-6 text-slate-400 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-cyan-400 font-semibold hover:text-cyan-300 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
