import api from '../apiClient';

const SESSION_KEY = 'currentUser';

// ---------------------------------------------------------------------------
// User Management
// ---------------------------------------------------------------------------

export async function getUsers() {
    try {
        return await api.get('/users');
    } catch (error) {
        console.error('Error fetching users:', error);
        return [];
    }
}

export async function updateUsers(users) {
    console.warn("updateUsers called - ideally use updateUser for individual records");
}

export async function updateUser(updatedUser) {
    const id = updatedUser._id || updatedUser.id;
    return await api.put(`/users/${id}`, updatedUser);
}

export async function deleteUser(id) {
    return await api.delete(`/users/${id}`);
}

// ---------------------------------------------------------------------------
// Authentication
// ---------------------------------------------------------------------------

export async function login(usernameOrEmail, password) {
    return await api.post('/auth/login', { usernameOrEmail, password });
}

export async function register(data) {
    return await api.post('/auth/register', data);
}

export async function getMe() {
    return await api.get('/auth/me');
}

export async function updateProfile(data) {
    return await api.put('/auth/profile', data);
}

// ---------------------------------------------------------------------------
// Local Session Utilities
// ---------------------------------------------------------------------------

export function logout() {
    localStorage.removeItem("token");
    sessionStorage.removeItem(SESSION_KEY);
}

export function getCurrentUser() {
    const stored = sessionStorage.getItem(SESSION_KEY);
    return stored ? JSON.parse(stored) : null;
}

export function setCurrentUser(user) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
}
