export let users = [];

export function loadUsers() {
    var request = new XMLHttpRequest();

    // In a real app or with Vite, fetching a local JSON in public/ might look different.
    // Assuming fake-data.json is moved to public/DataAccess/fake-data.json or imported directly.
    // For now, let's keep the path or import it directly. Let's just keep the original logic but handle the async nature if possible. 
    // Wait, synchronous XMLHttpRequest on the main thread is deprecated.
    // Let's import the json directly since we are using Vite.
}

// Actually, Vite supports importing JSON directly. 
// Let's just import the JSON and initialize.
import fakeData from './DataAccess/fake-data.json';

users = fakeData.users;

export function find(usernameOrEmail) {
    for (var i = 0; i < users.length; i++) {
        if (users[i].username === usernameOrEmail || users[i].email === usernameOrEmail) {
            return users[i];
        }
    }
    return undefined;
}

export function add(username, email, password, dob, isAdmin) {
    var newUser = {
        id: users.length + 1,
        username: username,
        email: email,
        password: password,
        dob: dob,
        isAdmin: isAdmin
    };

    users.push(newUser);

    console.log("New demo user:");
    console.log(newUser);
}