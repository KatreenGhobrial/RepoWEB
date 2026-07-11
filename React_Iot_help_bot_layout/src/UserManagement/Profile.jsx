import { useState, useEffect } from 'react';
import Header from '../UIComponents/Header';
import LabeledInput from '../UIComponents/LabeledInput';
import { updateUser } from './usersService';

export default function Profile() {
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({ username: '', email: '', discipline: '', role: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    try {
      const userStr = localStorage.getItem('currentUser');
      if (userStr) {
        const user = JSON.parse(userStr);
        setCurrentUser(user);
        setFormData({
          username: user.username || '',
          email: user.email || '',
          role: user.role || 'student'
        });
      }
    } catch (err) {
      console.error("Failed to parse user from local storage", err);
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    setError('');
    try {
      if (currentUser && currentUser._id) {
        const updated = await updateUser(currentUser._id, formData);
        const updatedUser = { ...currentUser, ...updated };
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        setCurrentUser(updatedUser);
        setMessage('Profile updated successfully!');
        setIsEditing(false);
        // Dispatch a storage event so other components (like Navbar) can update
        window.dispatchEvent(new Event('storage'));
      }
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (!currentUser) return <div className="p-10 text-center dark:text-white">Loading...</div>;

  return (
    <>
      <Header title="User Profile" subtitle="Manage your account settings." />
      <section className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-700 shadow-sm p-10 mb-8 max-w-3xl">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-24 h-24 bg-slate-100 dark:bg-zinc-800 rounded-full flex items-center justify-center text-4xl shadow-inner border border-slate-200 dark:border-zinc-700">
            👤
          </div>
          <div>
            <h2 className="text-3xl font-bold text-slate-950 dark:text-white">{currentUser.username}</h2>
          </div>
        </div>

        <div className="space-y-6">
          {message && <div className="bg-green-100 text-green-700 p-3 rounded-xl text-sm">{message}</div>}
          {error && <div className="bg-red-100 text-red-700 p-3 rounded-xl text-sm">{error}</div>}

          <LabeledInput 
            label="Full Name" 
            type="text" 
            name="username"
            value={formData.username} 
            onChange={handleChange}
            disabled={!isEditing}
          />
          <LabeledInput 
            label="Email Address" 
            type="email" 
            name="email"
            value={formData.email} 
            onChange={handleChange}
            disabled={!isEditing} 
          />
          <LabeledInput 
            label="Role" 
            type="text" 
            name="role"
            value={formData.role} 
            disabled 
          />

          <div className="pt-6 border-t border-slate-200 dark:border-zinc-700 flex justify-end gap-3">
            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)}
                className="px-6 py-2 bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-slate-200 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-zinc-700 transition"
              >
                Edit Profile
              </button>
            ) : (
              <>
                <button 
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      username: currentUser.username || '',
                      email: currentUser.email || '',
                      role: currentUser.role || 'student'
                    });
                    setError('');
                    setMessage('');
                  }}
                  className="px-6 py-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 font-bold transition"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  className="px-6 py-2 bg-cyan-600 text-white font-bold rounded-xl hover:bg-cyan-700 transition disabled:opacity-50"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
