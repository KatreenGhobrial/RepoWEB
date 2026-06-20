import React, { useState, useEffect } from 'react';
import ActionButton from '../UIComponents/ActionButton';
import { getUsers, updateUser, deleteUser } from './usersService';

export default function ManageUsers() {
    const [users, setUsers] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const data = await getUsers();
            setUsers(data);
            setError('');
        } catch (err) {
            setError('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (user) => {
        setEditingId(user._id);
        setEditForm({ 
            name: user.bio || '', // Using bio as name in backend
            email: user.email || '',
            role: user.role === 'student' ? 'Student' : user.role === 'mentor' ? 'Mentor' : 'Admin'
        });
    };

    const handleSave = async () => {
        try {
            const payload = {
                name: editForm.name,
                email: editForm.email,
                role: editForm.role === 'Student' ? 'student' : editForm.role === 'Mentor' ? 'mentor' : 'admin'
            };
            
            // Optimistic update locally
            const updated = users.map(u => 
                u._id === editingId ? { ...u, bio: payload.name, email: payload.email, role: payload.role } : u
            );
            setUsers(updated);
            
            // Call API
            await updateUser(editingId, payload);
            setEditingId(null);
        } catch (err) {
            setError('Failed to save user');
            // Re-fetch users on error to ensure sync
            loadUsers();
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Delete this user?')) {
            try {
                // Optimistic update locally
                const updated = users.filter(u => u._id !== id);
                setUsers(updated);
                
                // Call API
                await deleteUser(id);
            } catch (err) {
                setError('Failed to delete user');
                loadUsers();
            }
        }
    };

    const handleChange = (field, value) => {
        setEditForm(prev => ({ ...prev, [field]: value }));
    };

    if (loading) {
        return <div className="text-center my-16 text-gray-500 dark:text-gray-400">Loading users...</div>;
    }

    return (
        <div className="bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-xl mx-auto my-16 w-fit min-w-[800px] border border-gray-100 dark:border-zinc-800 dark:text-gray-100 dark:bg-zinc-900/80 transition-colors duration-300">
            <h2 className="text-2xl font-bold mb-8 text-center bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-400">Manage Users</h2>
            
            {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm text-center">{error}</div>}

            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-zinc-700">
                <table className="table-auto border-collapse w-full text-sm">
                    <thead>
                        <tr className="bg-gray-50 text-left text-gray-600 dark:bg-zinc-800/50 dark:text-gray-300">
                            <th className="px-6 py-4 font-semibold border-b dark:border-zinc-700">Username</th>
                            <th className="px-6 py-4 font-semibold border-b dark:border-zinc-700">Name (Bio)</th>
                            <th className="px-6 py-4 font-semibold border-b dark:border-zinc-700">Email</th>
                            <th className="px-6 py-4 font-semibold border-b dark:border-zinc-700">Role</th>
                            <th className="px-6 py-4 font-semibold border-b dark:border-zinc-700 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-zinc-700/50">
                        {users.map(user => (
                            <tr key={user._id} className="hover:bg-gray-50/50 transition-colors duration-200 dark:hover:bg-zinc-800/30">
                                {editingId === user._id ? (
                                    <>
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">{user.username}</td>
                                        <td className="px-6 py-4">
                                            <input 
                                                className="border rounded-md p-2 w-full focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-zinc-800 dark:border-zinc-600 dark:text-white" 
                                                value={editForm.name}
                                                onChange={e => handleChange('name', e.target.value)} 
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <input 
                                                className="border rounded-md p-2 w-full focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-zinc-800 dark:border-zinc-600 dark:text-white" 
                                                value={editForm.email}
                                                onChange={e => handleChange('email', e.target.value)} 
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <select 
                                                className="border rounded-md p-2 w-full focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-zinc-800 dark:border-zinc-600 dark:text-white" 
                                                value={editForm.role}
                                                onChange={e => handleChange('role', e.target.value)}>
                                                <option>Student</option>
                                                <option>Mentor</option>
                                                <option>Admin</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2 justify-center">
                                                <ActionButton text="Save" backgroundColor="CornflowerBlue" onClick={handleSave} />
                                                <ActionButton text="Cancel" backgroundColor="Gray" onClick={() => setEditingId(null)} />
                                            </div>
                                        </td>
                                    </>
                                ) : (
                                    <>
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">{user.username}</td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{user.bio || '—'}</td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{user.email}</td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                                user.role === 'admin' 
                                                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' 
                                                : user.role === 'mentor'
                                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                                : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                            }`}>
                                                {user.role === 'admin' ? 'Admin' : user.role === 'mentor' ? 'Mentor' : 'Student'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2 justify-center">
                                                <ActionButton text="Edit" backgroundColor="CornflowerBlue" onClick={() => handleEdit(user)} />
                                                <ActionButton text="Delete" backgroundColor="Crimson" onClick={() => handleDelete(user._id)} />
                                            </div>
                                        </td>
                                    </>
                                )}
                            </tr>
                        ))}
                        {users.length === 0 && (
                            <tr>
                                <td colSpan="5" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                                    No users found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
