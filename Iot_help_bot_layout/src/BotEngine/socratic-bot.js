const studentName = document.getElementById("studentName");

const problemInput = document.getElementById("problemInput");
const startButton = document.getElementById("startButton");

const chatContainer = document.getElementById("chatContainer");
const chatForm = document.getElementById("chatForm");
const answerInput = document.getElementById("answerInput");
const botMessage = document.getElementById("botMessage");

const currentProblemText = document.getElementById("currentProblemText");
const areaText = document.getElementById("areaText");
const statusText = document.getElementById("statusText");

const questionsContainer = document.getElementById("questionsContainer");
const pathContainer = document.getElementById("pathContainer");

var botQuestions = [];
var investigationPath = [];
var answerCounter = 0;

function showUsername() {
    const params = new URLSearchParams(window.location.search);
    const username = params.get("username");

    if (username != null) {
        studentName.textContent = username;
    }
}

function loadSocraticBot() {
    var request = new XMLHttpRequest();

    request.open("GET", "../DataAccess/fake-data.json", false);
    request.send();

    var data = JSON.parse(request.responseText);
    var bot = data.socraticBot;

    botQuestions = bot.questions;
    investigationPath = bot.path;

    showQuestions();
    showPath();
}

function showQuestions() {
    questionsContainer.innerHTML = "";

    for (var i = 0; i < botQuestions.length; i++) {
        var question = botQuestions[i];

        var card = document.createElement("div");
        card.className = "border border-slate-200 rounded-2xl p-5 hover:bg-slate-50";

        card.innerHTML =
            "<p class='text-sm text-slate-400 mb-1'>Bot question " + (i + 1) + "</p>" +
            "<p class='font-bold text-slate-900'>" + question + "</p>";

        questionsContainer.appendChild(card);
    }
}

function showPath() {
    pathContainer.innerHTML = "";

    for (var i = 0; i < investigationPath.length; i++) {
        var step = document.createElement("li");
        step.className = "text-lg";
        step.textContent = investigationPath[i];

        pathContainer.appendChild(step);
    }
}

function addBotMessage(text) {
    var div = document.createElement("div");

    div.className = "bg-slate-100 border border-slate-200 rounded-2xl p-5 max-w-xl";

    div.innerHTML =
        "<p class='text-sm text-slate-400 mb-1'>IoT HelpBot</p>" +
        "<p class='font-bold text-slate-900'>" + text + "</p>";

    chatContainer.appendChild(div);
}

function addUserMessage(text) {
    var div = document.createElement("div");

    div.className = "bg-slate-950 text-white rounded-2xl p-5 max-w-xl ml-auto";

    div.innerHTML =
        "<p class='text-sm text-slate-400 mb-1'>Student</p>" +
        "<p class='font-bold'>" + text + "</p>";

    chatContainer.appendChild(div);
}

startButton.addEventListener("click", function() {
    chatContainer.innerHTML = "";
    answerCounter = 0;

    var problem = problemInput.value;

    currentProblemText.textContent = problem;
    areaText.textContent = "Checking hardware, communication and server";
    statusText.textContent = "Investigation started";

    addBotMessage("I will not give a direct answer yet. I will ask guiding questions to help you find the source of the problem.");
    addBotMessage(botQuestions[0]);

    botMessage.textContent = "Investigation started.";
    botMessage.classList.remove("text-red-500");
    botMessage.classList.add("text-green-500");
});

chatForm.addEventListener("submit", function(event) {
    event.preventDefault();

    var answer = answerInput.value;

    if (answer === "") {
        botMessage.textContent = "Please write an answer.";
        botMessage.classList.remove("text-green-500");
        botMessage.classList.add("text-red-500");
        return;
    }

    addUserMessage(answer);

    answerCounter++;

    if (answerCounter < botQuestions.length) {
        addBotMessage(botQuestions[answerCounter]);
        statusText.textContent = "Asking guiding questions";
    } else {
        addBotMessage("Based on your answers, start by checking power, then communication, then server and database connection.");
        areaText.textContent = "Power / Communication / Server";
        statusText.textContent = "Initial diagnosis ready";
    }

    answerInput.value = "";

    botMessage.textContent = "Answer saved in demo chat.";
    botMessage.classList.remove("text-red-500");
    botMessage.classList.add("text-green-500");
});

showUsername();
loadSocraticBot();