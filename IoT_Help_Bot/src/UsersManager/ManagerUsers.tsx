import { useState, type ChangeEvent } from 'react';

interface User {
    id: number;
    username: string;
    name: string;
    email: string;
    role: string;
}

const initialUsers: User[] = [
    { id: 1, username: 'jsmith', name: 'John Smith', email: 'jsmith@example.com', role: 'User' },
    { id: 2, username: 'ajones', name: 'Alice Jones', email: 'ajones@example.com', role: 'Admin' },
    { id: 3, username: 'bwilson', name: 'Bob Wilson', email: 'bwilson@example.com', role: 'User' },
];

export default function ManageUsers() {
    const [users, setUsers] = useState<User[]>(initialUsers);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState<Partial<User>>({});

    const handleEdit = (user: User): void => {
        setEditingId(user.id);
        setEditForm({ ...user });
    };

    const handleSave = (): void => {
        setUsers(users.map(u => u.id === editingId ? { ...(editForm as User) } : u));
        setEditingId(null);
    };

    const handleDelete = (id: number): void => {
        if (window.confirm('Delete this user?')) {
            setUsers(users.filter(u => u.id !== id));
        }
    };

    const handleChange = (field: keyof User, value: string): void => {
        setEditForm(prev => ({ ...prev, [field]: value }));
    };

    const roleBadge = (role: string) => {
        return role === 'Admin'
            ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
            : 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400';
    };

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="animate-fade-in-up">
                {/* Page header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-teal-400 flex items-center justify-center text-white text-lg">
                            👥
                        </span>
                        Manage Users
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">View, edit, and manage user accounts.</p>
                </div>

                {/* Users Table */}
                <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-xl border border-gray-100 dark:border-zinc-700 overflow-hidden">
                    <div className="h-1 bg-gradient-to-r from-sky-500 to-teal-400" />
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-zinc-700/50 text-left">
                                    <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">User</th>
                                    <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-zinc-700">
                                {users.map(user => (
                                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-zinc-700/30 transition-colors">
                                        {editingId === user.id ? (
                                            <>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-400 to-teal-400 flex items-center justify-center text-white text-sm font-bold shrink-0">
                                                            {user.username.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <input
                                                                className="font-medium border border-gray-300 dark:border-zinc-600 rounded-lg px-2 py-1 w-32 bg-white dark:bg-zinc-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-400"
                                                                value={editForm.name || ''}
                                                                onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange('name', e.target.value)}
                                                            />
                                                            <div className="text-xs text-gray-400 mt-0.5">@{user.username}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <input
                                                        className="border border-gray-300 dark:border-zinc-600 rounded-lg px-2 py-1 w-48 bg-white dark:bg-zinc-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-400"
                                                        value={editForm.email || ''}
                                                        onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange('email', e.target.value)}
                                                    />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <select
                                                        className="border border-gray-300 dark:border-zinc-600 rounded-lg px-2 py-1 bg-white dark:bg-zinc-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-400"
                                                        value={editForm.role || ''}
                                                        onChange={(e: ChangeEvent<HTMLSelectElement>) => handleChange('role', e.target.value)}
                                                    >
                                                        <option value="User">User</option>
                                                        <option value="Admin">Admin</option>
                                                    </select>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={handleSave}
                                                            className="px-4 py-1.5 bg-emerald-500 text-white rounded-lg text-xs font-medium
                                                                       hover:bg-emerald-600 transition-colors cursor-pointer"
                                                        >
                                                            Save
                                                        </button>
                                                        <button
                                                            onClick={() => setEditingId(null)}
                                                            className="px-4 py-1.5 bg-gray-200 dark:bg-zinc-600 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-medium
                                                                       hover:bg-gray-300 dark:hover:bg-zinc-500 transition-colors cursor-pointer"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-400 to-teal-400 flex items-center justify-center text-white text-sm font-bold shrink-0">
                                                            {user.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold text-gray-900 dark:text-white">{user.name}</div>
                                                            <div className="text-xs text-gray-400">@{user.username}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{user.email}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${roleBadge(user.role)}`}>
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => handleEdit(user)}
                                                            className="px-4 py-1.5 bg-sky-500 text-white rounded-lg text-xs font-medium
                                                                       hover:bg-sky-600 hover:shadow-md hover:shadow-sky-500/25 transition-all cursor-pointer"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(user.id)}
                                                            className="px-4 py-1.5 bg-red-500 text-white rounded-lg text-xs font-medium
                                                                       hover:bg-red-600 hover:shadow-md hover:shadow-red-500/25 transition-all cursor-pointer"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Table footer */}
                    <div className="px-6 py-4 bg-gray-50 dark:bg-zinc-700/30 border-t border-gray-100 dark:border-zinc-700 text-sm text-gray-500 dark:text-gray-400">
                        {users.length} user{users.length !== 1 ? 's' : ''} total
                    </div>
                </div>
            </div>
        </div>
    );
}