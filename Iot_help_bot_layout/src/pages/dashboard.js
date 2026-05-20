const studentName = document.getElementById("studentName");

const roleCoverageValue = document.getElementById("roleCoverageValue");
const roleCoverageText = document.getElementById("roleCoverageText");
const detectedIssuesValue = document.getElementById("detectedIssuesValue");
const tasksCompletedValue = document.getElementById("tasksCompletedValue");
const tasksCompletedText = document.getElementById("tasksCompletedText");
const docStatusValue = document.getElementById("docStatusValue");

const progressContainer = document.getElementById("progressContainer");
const alertsContainer = document.getElementById("alertsContainer");

function showUsername() {
    const params = new URLSearchParams(window.location.search);
    const username = params.get("username");

    if (username != null) {
        studentName.textContent = username;
    }
}

function loadDashboard() {
    var request = new XMLHttpRequest();

    request.open("GET", "../DataAccess/fake-data.json", false);
    request.send();

    var data = JSON.parse(request.responseText);
    var dashboard = data.dashboard;

    roleCoverageValue.textContent = dashboard.roleCoverage.value;
    roleCoverageText.textContent = dashboard.roleCoverage.text;

    detectedIssuesValue.textContent = dashboard.detectedIssues;

    tasksCompletedValue.textContent = dashboard.tasksCompleted.value;
    tasksCompletedText.textContent = dashboard.tasksCompleted.text;

    docStatusValue.textContent = dashboard.documentationStatus;

    showProgress(dashboard.progress);
    showAlerts(dashboard.alerts);
}

function showProgress(progressList) {
    for (var i = 0; i < progressList.length; i++) {
        var item = progressList[i];

        var card = document.createElement("div");
        card.className = "flex flex-col items-center";

        card.innerHTML =
            "<div class='h-56 w-full flex items-end justify-center'>" +
                "<div class='w-24 bg-black rounded-t-2xl' style='height:" + item.value + "%'></div>" +
            "</div>" +
            "<p class='mt-4 font-bold text-slate-800'>" + item.name + "</p>" +
            "<p class='text-slate-500'>" + item.value + "%</p>";

        progressContainer.appendChild(card);
    }
}

function showAlerts(alertList) {
    for (var i = 0; i < alertList.length; i++) {
        var alertItem = alertList[i];

        var alertClass = "bg-red-100 border-red-200 text-red-700";

        if (alertItem.level === "MEDIUM") {
            alertClass = "bg-yellow-100 border-yellow-300 text-orange-600";
        }

        var alertDiv = document.createElement("div");
        alertDiv.className = "border rounded-3xl p-5 " + alertClass;

        alertDiv.innerHTML =
            "<div class='flex justify-between items-start'>" +
                "<div>" +
                    "<h4 class='text-xl font-bold mb-2'>" + alertItem.title + "</h4>" +
                    "<p>" + alertItem.category + "</p>" +
                "</div>" +
                "<span class='font-bold'>" + alertItem.level + "</span>" +
            "</div>";

        alertsContainer.appendChild(alertDiv);
    }
}

showUsername();
loadDashboard();