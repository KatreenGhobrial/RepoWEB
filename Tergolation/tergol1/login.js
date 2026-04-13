const html = document.documentElement;
const loginForm = document.getElementById('loginForm');
const loginMessage = document.getElementById('loginMessage');

loginForm.addEventListener('submit', function(event) {
  event.preventDefault();
  const usernameOrEmail = document.getElementById('userInput').value;
  const password = document.getElementById('passInput').value;
  let users = JSON.parse(localStorage.getItem('users')) || [];
  let user =  users.find(u=>u.username === usernameOrEmail || u.email === usernameOrEmail);
  let nameOrEmail = 'test';
  let pass = 'password';
  if(user != undefined){
   nameOrEmail = user.username;
   userEmail = user.email;
   pass = user.password;
  }
  if ((usernameOrEmail === nameOrEmail || usernameOrEmail === userEmail) && password === pass) {
        loginMessage.textContent = 'Login successful!';
        loginMessage.classList.remove('text-red-500');
        loginMessage.classList.add('text-green-500');
  } else {
        loginMessage.textContent = 'Invalid username/email or password.';
        loginMessage.classList.remove('text-green-500');
        loginMessage.classList.add('text-red-500');
  }





})
