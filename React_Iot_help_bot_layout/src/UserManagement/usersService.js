const STORAGE_KEY = 'users';
const SESSION_KEY = 'currentUser';

const defaultUsers = [
    { id: 1, username: 'ester', email: 'ester@gmail.com', role: 'User', password: '123456' },
    { id: 2, username: 'liel', email: 'liel@gmail.com', role: 'Admin', password: '1234' },
    { id: 3, username: 'bwilson',  email: 'bwilson@example.com', role: 'User', password: '1234' },
];

export function getUsers() {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : defaultUsers;
}

function saveUsers(users) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

export function updateUsers(users) {
    saveUsers(users);
}
export function updateUser(updatedUser) {
    const users = getUsers();
    const index = users.findIndex(u => u.id === updatedUser.id);
    if (index !== -1) {
        users[index] = { ...users[index], ...updatedUser };
        saveUsers(users);
    }
}

export function login(username, password) {
    const users = getUsers();
    const user = defaultUsers.find(
        u => (u.username === username || u.email === username) && u.password === password
    );
    if (user) {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
        return user;
    }
    return null;
}

export function register(username, email, password) {
    const users = getUsers();
    if (users.find(u => u.username === username))
        return { error: 'Username already taken.' };
    if (users.find(u => u.email === email))
        return { error: 'Email already registered.' };
    const newUser = { id: Math.max(...users.map(u => u.id), 0) + 1, username, email, role: 'User', password };
    users.push(newUser);
    saveUsers(users);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
    return { user: newUser };
}

export function logout() {
    sessionStorage.removeItem(SESSION_KEY);
}

export function getCurrentUser() {
    const stored = sessionStorage.getItem(SESSION_KEY);
    return stored ? JSON.parse(stored) : null;
}

export function setCurrentUser(user) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
}
