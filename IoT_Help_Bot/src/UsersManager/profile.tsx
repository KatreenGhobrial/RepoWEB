import { useState } from 'react';
import LabeledInput from '../UIComponents/LabeledInput';
import { getCurrentUser } from './UsersService';

export default function Profile() {
    const [isEditing, setIsEditing] = useState(false);
    const [user, setUser] = useState(() => {
        const current = getCurrentUser();
        return current || { id: 1, username: 'jsmith', name: 'John Smith', email: 'jsmith@example.com', role: 'User' };
    });

    const handleSave = () => {
        alert('Profile saved successfully!');
        setIsEditing(false);
    };

    return (
        <div className="min-h-[calc(100vh-12rem)] flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-lg animate-fade-in-up">
                <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-xl border border-gray-100 dark:border-zinc-700 overflow-hidden">
                    <div className="h-1.5 bg-gradient-to-r from-sky-500 to-teal-400" />

                    {/* Profile Header */}
                    <div className="bg-gradient-to-br from-sky-500/10 to-teal-400/10 dark:from-sky-500/5 dark:to-teal-400/5 px-8 pt-8 pb-6 text-center">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-sky-400 to-teal-400 mx-auto mb-4
                                        flex items-center justify-center text-white text-3xl font-bold
                                        shadow-lg shadow-sky-500/20 ring-4 ring-white dark:ring-zinc-800">
                            {user.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user.name}</h2>
                        <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium
                            ${user.role === 'Admin'
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                : 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400'
                            }`}>
                            {user.role}
                        </span>
                    </div>

                    {/* Profile Form */}
                    <div className="p-8">
                        <form id="profileForm" onSubmit={(e) => e.preventDefault()}>
                            <LabeledInput label="Username" type="text" disabled={true} value={user.username} />
                            <LabeledInput label="Name" type="text" disabled={!isEditing} value={user.name}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUser((prev: any) => ({ ...prev, name: e.target.value }))} />
                            <LabeledInput label="Email" type="email" disabled={!isEditing} value={user.email}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUser((prev: any) => ({ ...prev, email: e.target.value }))} />

                            {isEditing && (
                                <>
                                    <LabeledInput label="New Password" type="password" placeholder="Leave blank to keep current" />
                                    <LabeledInput label="Confirm Password" type="password" placeholder="Re-enter new password" />
                                </>
                            )}

                            <div className="flex gap-3 mt-6">
                                {!isEditing ? (
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(true)}
                                        className="flex-1 py-3 bg-gradient-to-r from-sky-500 to-teal-400 text-white font-bold rounded-xl
                                                   hover:shadow-lg hover:shadow-sky-500/25 hover:-translate-y-0.5
                                                   transition-all duration-200 cursor-pointer"
                                    >
                                        Edit Profile
                                    </button>
                                ) : (
                                    <>
                                        <button
                                            type="button"
                                            onClick={handleSave}
                                            className="flex-1 py-3 bg-gradient-to-r from-sky-500 to-teal-400 text-white font-bold rounded-xl
                                                       hover:shadow-lg hover:shadow-sky-500/25 hover:-translate-y-0.5
                                                       transition-all duration-200 cursor-pointer"
                                        >
                                            Save Changes
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setIsEditing(false)}
                                            className="px-6 py-3 bg-gray-200 dark:bg-zinc-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl
                                                       hover:bg-gray-300 dark:hover:bg-zinc-600 transition-all duration-200 cursor-pointer"
                                        >
                                            Cancel
                                        </button>
                                    </>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
