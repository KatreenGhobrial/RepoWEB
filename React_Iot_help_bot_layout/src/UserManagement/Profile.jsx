import { useState, useEffect } from 'react';
import Header from '../UIcomponents/Header';
import { updateUser } from './usersService';

export default function Profile({ user: initialUser, setCurrentUser }) {
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState(initialUser);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    setUser(initialUser);
  }, [initialUser]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setUser(initialUser);
    setPassword("");
    setConfirmPassword("");
    setIsEditing(false);
  };

  const handleSave = () => {
    if (password !== "" && password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    const updatedUser = {
      ...user,
      password: password !== "" ? password : user.password,
    };

    updateUser(updatedUser);
    setCurrentUser(updatedUser);
    setUser(updatedUser);

    setPassword("");
    setConfirmPassword("");
    setIsEditing(false);

    alert("Profile saved!");
  };

  return (
    <>
      <Header
        title="User Profile"
        subtitle="Manage your account settings and preferences."
      />

      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-10 mb-8 max-w-3xl">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center text-4xl shadow-inner border border-slate-200">
            👤
          </div>

          <div>
            <h2 className="text-3xl font-bold text-slate-950">
              {user?.name || user?.username || "Student"}
            </h2>

            <p className="text-slate-500 text-lg">
              {user?.role || "Engineering Faculty"}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Username
            </label>
            <input
              type="text"
              className="w-full border border-slate-300 rounded-2xl px-4 py-3 bg-slate-50"
              value={user?.username || ""}
              disabled
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              className="w-full border border-slate-300 rounded-2xl px-4 py-3 bg-slate-50 disabled:text-slate-500"
              value={user?.name || ""}
              disabled={!isEditing}
              onChange={(e) =>
                setUser((prev) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              className="w-full border border-slate-300 rounded-2xl px-4 py-3 bg-slate-50 disabled:text-slate-500"
              value={user?.email || ""}
              disabled={!isEditing}
              onChange={(e) =>
                setUser((prev) => ({
                  ...prev,
                  email: e.target.value,
                }))
              }
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Role
            </label>
            <input
              type="text"
              className="w-full border border-slate-300 rounded-2xl px-4 py-3 bg-slate-50"
              value={user?.role || "Student"}
              disabled
            />
          </div>

          {isEditing && (
            <>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  className="w-full border border-slate-300 rounded-2xl px-4 py-3 bg-slate-50"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  className="w-full border border-slate-300 rounded-2xl px-4 py-3 bg-slate-50"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                />
              </div>
            </>
          )}

          <div className="flex gap-4 pt-4">
            {!isEditing ? (
              <button
                type="button"
                onClick={handleEdit}
                className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700"
              >
                Edit
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleSave}
                  className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700"
                >
                  Save
                </button>

                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-slate-500 text-white px-6 py-3 rounded-2xl font-bold hover:bg-slate-600"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
}