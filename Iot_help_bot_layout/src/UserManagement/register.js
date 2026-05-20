const registerForm = document.getElementById("registerForm");
const registerMessage = document.getElementById("registerMessage");

registerForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const username = document.getElementById("userInput").value.trim();
    const email = document.getElementById("mailInput").value.trim();
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

    try {
        const users = JSON.parse(localStorage.getItem("users")) || [];

        const userExists = users.some(function(user) {
            return user.username === username || user.email === email;
        });

        if (userExists) {
            registerMessage.textContent = "Username or email already exists.";
            registerMessage.classList.remove("text-green-500");
            registerMessage.classList.add("text-red-500");
            return;
        }

        const isAdmin = users.length === 0;

        const newUser = {
            username: username,
            email: email,
            password: password,
            dob: dob,
            isAdmin: isAdmin
        };

        users.push(newUser);

        localStorage.setItem("users", JSON.stringify(users));
        localStorage.setItem("currentUser", JSON.stringify(newUser));
        window.location.href = "dashboard.html";

        registerMessage.textContent = "Registration successful! User saved.";
        registerMessage.classList.remove("text-red-500");
        registerMessage.classList.add("text-green-500");

        document.getElementById("userInput").value = "";
        document.getElementById("mailInput").value = "";
        document.getElementById("passInput").value = "";
        document.getElementById("confirmInput").value = "";
        document.getElementById("dateInput").value = "";

    } catch (error) {
        registerMessage.textContent = "An error occurred during registration.";
        registerMessage.classList.remove("text-green-500");
        registerMessage.classList.add("text-red-500");
    }
});