import { useState, FormEvent } from 'react';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState(user?.bio || '');
  const [discipline, setDiscipline] = useState(user?.discipline || '');
  const [expertiseStr, setExpertiseStr] = useState(user?.expertise?.join(', ') || '');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await updateUser({
        bio,
        discipline,
        expertise: expertiseStr.split(',').map((s) => s.trim()).filter(Boolean),
      });
      setSuccess('Profile updated successfully!');
      setEditing(false);
    } catch (err) {
      setError((err as Error).message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <>
      <Header title="👤 Profile" subtitle="Manage your account and preferences" />

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Profile Card */}
        <div className="bg-slate-800/30 border border-white/5 rounded-2xl overflow-hidden">
          {/* Banner */}
          <div className="h-24 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 relative">
            <div className="absolute -bottom-8 left-6">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center text-2xl shadow-lg ring-4 ring-slate-900">
                {user.avatar || '👤'}
              </div>
            </div>
          </div>

          <div className="pt-12 px-6 pb-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">{user.username}</h2>
                <p className="text-sm text-slate-400">{user.email}</p>
              </div>
              <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                user.role === 'mentor'
                  ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                  : user.role === 'admin'
                  ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                  : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
              }`}>
                {user.role}
              </span>
            </div>

            {/* Info Fields */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div>
                <p className="text-xs text-slate-500">Discipline</p>
                <p className="text-sm text-white mt-1">{user.discipline || 'Not set'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Member Since</p>
                <p className="text-sm text-white mt-1">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>

            {/* Expertise */}
            <div className="mt-4">
              <p className="text-xs text-slate-500 mb-2">Expertise</p>
              <div className="flex flex-wrap gap-1.5">
                {user.expertise?.length ? (
                  user.expertise.map((skill) => (
                    <span key={skill} className="text-xs px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500">No expertise listed</span>
                )}
              </div>
            </div>

            {/* Bio */}
            <div className="mt-4">
              <p className="text-xs text-slate-500 mb-1">Bio</p>
              <p className="text-sm text-slate-300">{user.bio || 'No bio yet.'}</p>
            </div>
          </div>
        </div>

        {/* Edit Button */}
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="w-full bg-white/5 border border-white/10 text-white py-3 rounded-xl font-medium text-sm hover:bg-white/10 transition-all"
          >
            ✏️ Edit Profile
          </button>
        )}

        {/* Edit Form */}
        {editing && (
          <form onSubmit={handleSave} className="bg-slate-800/30 border border-white/5 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-semibold text-white">Edit Profile</h3>

            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Discipline</label>
              <select
                value={discipline}
                onChange={(e) => setDiscipline(e.target.value)}
                className="w-full bg-slate-700/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
              >
                <option value="">Select...</option>
                <option value="Software">Software Engineering</option>
                <option value="Hardware">Hardware Engineering</option>
                <option value="Electrical">Electrical Engineering</option>
                <option value="Network">Network Engineering</option>
                <option value="Data">Data Science</option>
                <option value="Security">Cybersecurity</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Expertise (comma-separated)</label>
              <input
                type="text"
                value={expertiseStr}
                onChange={(e) => setExpertiseStr(e.target.value)}
                placeholder="e.g. MQTT, ESP32, React, Firebase"
                className="w-full bg-slate-700/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                placeholder="Tell us about yourself..."
                className="w-full bg-slate-700/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 resize-none"
              />
            </div>

            {error && <p className="text-sm text-red-400">⚠️ {error}</p>}
            {success && <p className="text-sm text-emerald-400">✅ {success}</p>}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-3 rounded-xl font-semibold text-sm disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="px-6 bg-white/5 border border-white/10 text-slate-300 py-3 rounded-xl text-sm hover:bg-white/10"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  );
}
