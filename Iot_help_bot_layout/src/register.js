const html = document.documentElement;
const registerForm = document.getElementById("registerForm");
const registerMessage = document.getElementById("registerMessage");

let isAdmin = false;

registerForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const username = document.getElementById("userInput").value;
    const email = document.getElementById("mailInput").value;
    const password = document.getElementById("passInput").value;
    const confirmPassword = document.getElementById("confirmInput").value;
    const dob = document.getElementById("dateInput").value;

    registerMessage.textContent = "";

    if (password !== confirmPassword) {
        registerMessage.textContent = "Passwords do not match.";
        registerMessage.classList.remove("text-green-500");
        registerMessage.classList.add("text-red-500");
        return;
    }

    if (find(username) != undefined || find(email) != undefined) {
        registerMessage.textContent = "Username or email already exists.";
        registerMessage.classList.remove("text-green-500");
        registerMessage.classList.add("text-red-500");
        return;
    }

    if (users.length < 1) {
        isAdmin = true;
    } else {
        isAdmin = false;
    }

    add(username, email, password, dob, isAdmin);

    registerMessage.textContent = "Registration successful! This is a demo user only.";
    registerMessage.classList.remove("text-red-500");
    registerMessage.classList.add("text-green-500");

    document.getElementById("userInput").value = "";
    document.getElementById("mailInput").value = "";
    document.getElementById("passInput").value = "";
    document.getElementById("confirmInput").value = "";
    document.getElementById("dateInput").value = "";
});