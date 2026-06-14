// Initialize as empty since we don't have fake data anymore
export let users = [];

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