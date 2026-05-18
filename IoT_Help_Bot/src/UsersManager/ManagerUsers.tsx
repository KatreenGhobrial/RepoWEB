import React, { useState, type ChangeEvent } from 'react';
import ActionButton from '../UIComponents/ActionButton';
// import LabeledInput from '../UIComponents/LabeledInput'; 

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
    // 2. Type the state hooks
    const [users, setUsers] = useState<User[]>(initialUsers);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState<Partial<User>>({});

    // 3. Type function parameters
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

    return (
        <div className="bg-white p-8 rounded shadow-md mx-auto my-16 w-fit  dark:bg-zinc-100/10 dark:text-white">
            <h2 className="text-xl font-bold mb-6 text-center">Manage Users</h2>
            <table className="table-auto border-collapse w-full text-sm">
                <thead>
                    <tr className="bg-gray-100 text-left">
                        <th className="border px-4 py-2">Username</th>
                        <th className="border px-4 py-2">Name</th>
                        <th className="border px-4 py-2">Email</th>
                        <th className="border px-4 py-2">Role</th>
                        <th className="border px-4 py-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.id} className="hover:bg-gray-50">
                            {editingId === user.id ? (
                                <>
                                    <td className="border px-4 py-2">{user.username}</td>
                                    <td className="border px-4 py-2">
                                        <input 
                                            className="border rounded p-1 w-32" 
                                            value={editForm.name || ''}
                                            onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange('name', e.target.value)} 
                                        />
                                    </td>
                                    <td className="border px-4 py-2">
                                        <input 
                                            className="border rounded p-1 w-44" 
                                            value={editForm.email || ''}
                                            onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange('email', e.target.value)} 
                                        />
                                    </td>
                                    <td className="border px-4 py-2">
                                        <select 
                                            className="border rounded p-1" 
                                            value={editForm.role || ''}
                                            onChange={(e: ChangeEvent<HTMLSelectElement>) => handleChange('role', e.target.value)}
                                        >
                                            <option value="User">User</option>
                                            <option value="Admin">Admin</option>
                                        </select>
                                    </td>
                                    <td className="border px-4 py-2 flex gap-1">
                                        <ActionButton text="Save" backgroundColor="CornflowerBlue" onClick={handleSave} />
                                        <ActionButton text="Cancel" backgroundColor="Gray" onClick={() => setEditingId(null)} />
                                    </td>
                                </>
                            ) : (
                                <>
                                    <td className="border px-4 py-2">{user.username}</td>
                                    <td className="border px-4 py-2">{user.name}</td>
                                    <td className="border px-4 py-2">{user.email}</td>
                                    <td className="border px-4 py-2">{user.role}</td>
                                    <td className="border px-4 py-2 flex gap-1">
                                        <ActionButton text="Edit" backgroundColor="CornflowerBlue" onClick={() => handleEdit(user)} />
                                        <ActionButton text="Delete" backgroundColor="Crimson" onClick={() => handleDelete(user.id)} />
                                    </td>
                                </>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}