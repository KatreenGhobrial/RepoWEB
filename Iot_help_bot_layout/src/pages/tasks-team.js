var studentName = document.getElementById("studentName");

var membersCount = document.getElementById("membersCount");
var completedTasksCount = document.getElementById("completedTasksCount");
var totalTasksText = document.getElementById("totalTasksText");
var projectStatus = document.getElementById("projectStatus");

var teamContainer = document.getElementById("teamContainer");
var tasksContainer = document.getElementById("tasksContainer");

var taskForm = document.getElementById("taskForm");
var taskTitleInput = document.getElementById("taskTitleInput");
var taskOwnerInput = document.getElementById("taskOwnerInput");
var taskStatusInput = document.getElementById("taskStatusInput");
var taskMessage = document.getElementById("taskMessage");

var tasks = [];

console.log("tasks-team.js loaded");

function showMessage(text, colorClass) {
    if (taskMessage != null) {
        taskMessage.textContent = text;
        taskMessage.classList.remove("text-green-500");
        taskMessage.classList.remove("text-red-500");
        taskMessage.classList.add(colorClass);
    } else {
        console.log(text);
    }
}

function showUsername() {
    var params = new URLSearchParams(window.location.search);
    var username = params.get("username");

    if (username != null && studentName != null) {
        studentName.textContent = username;
    }
}

function loadTasksTeam() {
    if (teamContainer == null || tasksContainer == null) {
        console.log("This is not tasks-team page.");
        return;
    }

    var request = new XMLHttpRequest();

    request.open("GET", "../DataAccess/fake-data.json", false);
    request.send();

    if (request.status !== 200) {
        showMessage("fake-data.json was not loaded.", "text-red-500");
        return;
    }

    var data = JSON.parse(request.responseText);

    if (data.tasksTeam == undefined) {
        showMessage("tasksTeam was not found in fake-data.json", "text-red-500");
        return;
    }

    var tasksTeam = data.tasksTeam;

    if (projectStatus != null) {
        projectStatus.textContent = tasksTeam.status;
    }

    showTeam(tasksTeam.team);

    tasks = tasksTeam.tasks;
    showTasks();
}

function showTeam(teamList) {
    teamContainer.innerHTML = "";

    if (membersCount != null) {
        membersCount.textContent = teamList.length;
    }

    for (var i = 0; i < teamList.length; i++) {
        var member = teamList[i];

        var card = document.createElement("div");
        card.className = "border border-slate-200 rounded-2xl p-5 hover:bg-slate-50";

        card.innerHTML =
            "<div class='w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-xl mb-4'>" +
                member.icon +
            "</div>" +
            "<h4 class='font-bold text-slate-900 text-lg'>" + member.name + "</h4>" +
            "<p class='text-sm text-slate-500 mt-1'>" + member.role + "</p>" +
            "<p class='text-sm text-slate-500 mt-3'>" + member.responsibility + "</p>";

        teamContainer.appendChild(card);
    }
}

function showTasks() {
    tasksContainer.innerHTML = "";

    var completed = 0;

    for (var i = 0; i < tasks.length; i++) {
        var task = tasks[i];

        if (task.status === "Done") {
            completed++;
        }

        var statusClass = "bg-slate-100 text-slate-600";

        if (task.status === "In Progress") {
            statusClass = "bg-yellow-100 text-orange-600";
        }

        if (task.status === "Done") {
            statusClass = "bg-green-100 text-green-700";
        }

        var card = document.createElement("div");
        card.className = "border border-slate-200 rounded-2xl p-5 flex justify-between items-start";

        card.innerHTML =
            "<div>" +
                "<h4 class='font-bold text-slate-900 text-lg'>" + task.title + "</h4>" +
                "<p class='text-sm text-slate-500 mt-2'>Owner: " + task.owner + "</p>" +
            "</div>" +
            "<span class='text-sm px-4 py-2 rounded-full font-bold " + statusClass + "'>" +
                task.status +
            "</span>";

        tasksContainer.appendChild(card);
    }

    if (completedTasksCount != null) {
        completedTasksCount.textContent = completed;
    }

    if (totalTasksText != null) {
        totalTasksText.textContent = tasks.length + " total tasks";
    }
}

if (taskForm != null) {
    taskForm.addEventListener("submit", function(event) {
        event.preventDefault();

        var title = taskTitleInput.value;
        var owner = taskOwnerInput.value;
        var status = taskStatusInput.value;

        if (title === "") {
            showMessage("Please enter a task title.", "text-red-500");
            return;
        }

        var newTask = {
            "title": title,
            "owner": owner,
            "status": status
        };

        tasks.push(newTask);

        showTasks();

        showMessage("Task added to demo board.", "text-green-500");

        taskTitleInput.value = "";
    });
}

showUsername();
loadTasksTeam();