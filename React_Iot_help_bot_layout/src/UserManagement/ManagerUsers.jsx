import { useState } from 'react';
import Header from '../UIcomponents/Header';
import { getUsers, updateUsers } from './usersService';

export default function ManageUsers() {
  const [users, setUsers] = useState(getUsers());
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const getUserKey = (user) => user.id ?? user.username;

  const handleEdit = (user) => {
    setEditingId(getUserKey(user));
    setEditForm({ ...user });
  };

  const handleSave = () => {
    const updated = users.map((user) =>
      getUserKey(user) === editingId ? { ...editForm } : user
    );

    setUsers(updated);
    updateUsers(updated);
    setEditingId(null);
    setEditForm({});
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleDelete = (id) => {
    if (confirm('Delete this user?')) {
      const updated = users.filter((user) => getUserKey(user) !== id);

      setUsers(updated);
      updateUsers(updated);
    }
  };

  const handleChange = (field, value) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <>
      <Header
        title="Manage Users"
        subtitle="View, edit and manage registered users in the system."
      />

      <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 mb-8 w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-950">
              Users List
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Manage user details and permissions.
            </p>
          </div>

          <div className="bg-slate-100 text-slate-700 px-4 py-2 rounded-2xl text-sm font-bold">
            {users.length} users
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="px-5 py-4 font-bold">Username</th>
                <th className="px-5 py-4 font-bold">Name</th>
                <th className="px-5 py-4 font-bold">Email</th>
                <th className="px-5 py-4 font-bold">Role</th>
                <th className="px-5 py-4 font-bold text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {users.map((user) => {
                const userKey = getUserKey(user);
                const isEditing = editingId === userKey;

                return (
                  <tr key={userKey} className="hover:bg-slate-50">
                    <td className="px-5 py-4 font-semibold text-slate-900">
                      {user.username}
                    </td>

                    <td className="px-5 py-4">
                      {isEditing ? (
                        <input
                          type="text"
                          className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={editForm.name || ""}
                          onChange={(e) => handleChange('name', e.target.value)}
                        />
                      ) : (
                        <span className="text-slate-700">{user.name}</span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      {isEditing ? (
                        <input
                          type="email"
                          className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={editForm.email || ""}
                          onChange={(e) => handleChange('email', e.target.value)}
                        />
                      ) : (
                        <span className="text-slate-700">{user.email}</span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      {isEditing ? (
                        <select
                          className="w-full border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={editForm.role || "Student"}
                          onChange={(e) => handleChange('role', e.target.value)}
                        >
                          <option>Student</option>
                          <option>Admin</option>
                        </select>
                      ) : (
                        <span className="inline-flex px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                          {user.role}
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-center gap-2">
                        {isEditing ? (
                          <>
                            <button
                              type="button"
                              onClick={handleSave}
                              className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-blue-700"
                            >
                              Save
                            </button>

                            <button
                              type="button"
                              onClick={handleCancel}
                              className="bg-slate-500 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-slate-600"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => handleEdit(user)}
                              className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-blue-700"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(userKey)}
                              className="bg-red-600 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-red-700"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}