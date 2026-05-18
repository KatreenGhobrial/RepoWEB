const users = [
    { id: 1, username: 'jsmith', name: 'John Smith', email: 'jsmith@example.com', role: 'User', password: '1234' },
    { id: 2, username: 'ajones', name: 'Alice Jones', email: 'ajones@example.com', role: 'Admin', password: '1234' },
    { id: 3, username: 'bwilson', name: 'Bob Wilson', email: 'bwilson@example.com', role: 'User', password: '1234' },
];
let currentUser:any = null;
export function login(username:string, password:string) {
    const user = users.find(
        u => (u.username === username || u.email === username) && u.password === password
    );
    if (user) {
	currentUser = user;
    	return user;
    }
   return  null;
}
export function register(username:string, name:string, email:string, password:string) {
    if (users.find(u => u.username === username))
        return { error: 'Username already taken.' };
    if (users.find(u => u.email === email))
        return { error: 'Email already registered.' };
    const newUser = { id: users.length + 1, username, name, email, role: 'User', password };
    users.push(newUser);
    return { user: newUser };
}
export function getUsers() {
    return users;
}
export function getCurrentUser() {
    return currentUser;
}
export function logout() {
    currentUser = null;
}
export function setCurrentUser(user:any) {
    currentUser = user;
}


