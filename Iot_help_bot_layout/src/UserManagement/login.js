const html = document.documentElement;
const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");

loginForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const usernameOrEmail = document.getElementById("userInput").value;
    const password = document.getElementById("passInput").value;

    loginMessage.textContent = "";

    let user = find(usernameOrEmail);

    if (user != undefined) {
        if (password === user.password) {
            loginMessage.textContent = "Login successful!";
            loginMessage.classList.remove("text-red-500");
            loginMessage.classList.add("text-green-500");

            window.open("dashboard.html?username=" + user.username, "_self");
        } else {
            loginMessage.textContent = "Invalid username/email or password.";
            loginMessage.classList.remove("text-green-500");
            loginMessage.classList.add("text-red-500");
        }
    } else {
        loginMessage.textContent = "Invalid username/email or password.";
        loginMessage.classList.remove("text-green-500");
        loginMessage.classList.add("text-red-500");
    }
});