var users = [];

function loadUsers() {
    var request = new XMLHttpRequest();

    request.open("GET", "fake-data.json", false);
    request.send();

    var data = JSON.parse(request.responseText);

    users = data.users;
}

function find(usernameOrEmail) {
    for (var i = 0; i < users.length; i++) {
        if (users[i].username === usernameOrEmail || users[i].email === usernameOrEmail) {
            return users[i];
        }
    }

    return undefined;
}

function add(username, email, password, dob, isAdmin) {
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

loadUsers();