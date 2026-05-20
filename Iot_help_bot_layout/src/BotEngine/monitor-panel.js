const studentName = document.getElementById("studentName");

const devicesCount = document.getElementById("devicesCount");
const sensorsCount = document.getElementById("sensorsCount");
const alertsCount = document.getElementById("alertsCount");
const healthText = document.getElementById("healthText");

const sensorsContainer = document.getElementById("sensorsContainer");
const servicesContainer = document.getElementById("servicesContainer");
const alertsContainer = document.getElementById("alertsContainer");
const logsContainer = document.getElementById("logsContainer");

const refreshButton = document.getElementById("refreshButton");
const monitorMessage = document.getElementById("monitorMessage");

var monitorData = {};

function showUsername() {
    const params = new URLSearchParams(window.location.search);
    const username = params.get("username");

    if (username != null) {
        studentName.textContent = username;
    }
}

function loadMonitorPanel() {
    var request = new XMLHttpRequest();

    request.open("GET", "../DataAccess/fake-data.json", false);
    request.send();

    var data = JSON.parse(request.responseText);

    monitorData = data.monitorPanel;

    devicesCount.textContent = monitorData.summary.devices;
    sensorsCount.textContent = monitorData.sensors.length;
    alertsCount.textContent = monitorData.alerts.length;
    healthText.textContent = monitorData.summary.health;

    showSensors();
    showServices();
    showAlerts();
    showLogs();
}

function showSensors() {
    sensorsContainer.innerHTML = "";

    for (var i = 0; i < monitorData.sensors.length; i++) {
        var sensor = monitorData.sensors[i];

        var statusClass = "bg-green-100 text-green-700";

        if (sensor.status === "Warning") {
            statusClass = "bg-yellow-100 text-orange-600";
        }

        if (sensor.status === "Offline") {
            statusClass = "bg-red-100 text-red-700";
        }

        var card = document.createElement("div");
        card.className = "border border-slate-200 rounded-2xl p-5 hover:bg-slate-50";

        card.innerHTML =
            "<div class='flex justify-between items-start mb-4'>" +
                "<div>" +
                    "<h4 class='font-bold text-slate-900 text-lg'>" + sensor.name + "</h4>" +
                    "<p class='text-sm text-slate-500'>" + sensor.location + "</p>" +
                "</div>" +
                "<span class='text-xs px-3 py-1 rounded-full font-bold " + statusClass + "'>" +
                    sensor.status +
                "</span>" +
            "</div>" +
            "<p class='text-4xl font-bold text-slate-950'>" + sensor.value + sensor.unit + "</p>" +
            "<p class='text-sm text-slate-500 mt-2'>Last update: " + sensor.lastUpdate + "</p>";

        sensorsContainer.appendChild(card);
    }
}

function showServices() {
    servicesContainer.innerHTML = "";

    for (var i = 0; i < monitorData.services.length; i++) {
        var service = monitorData.services[i];

        var statusClass = "bg-green-100 text-green-700";

        if (service.status === "Warning") {
            statusClass = "bg-yellow-100 text-orange-600";
        }

        if (service.status === "Down") {
            statusClass = "bg-red-100 text-red-700";
        }

        var card = document.createElement("div");
        card.className = "border border-slate-200 rounded-2xl p-5 flex justify-between items-start";

        card.innerHTML =
            "<div>" +
                "<h4 class='font-bold text-slate-900 text-lg'>" + service.name + "</h4>" +
                "<p class='text-sm text-slate-500 mt-2'>" + service.description + "</p>" +
            "</div>" +
            "<span class='text-xs px-3 py-1 rounded-full font-bold " + statusClass + "'>" +
                service.status +
            "</span>";

        servicesContainer.appendChild(card);
    }
}

function showAlerts() {
    alertsContainer.innerHTML = "";

    for (var i = 0; i < monitorData.alerts.length; i++) {
        var alert = monitorData.alerts[i];

        var colorClass = "bg-red-100 border-red-200 text-red-700";

        if (alert.level === "MEDIUM") {
            colorClass = "bg-yellow-100 border-yellow-300 text-orange-600";
        }

        if (alert.level === "LOW") {
            colorClass = "bg-green-100 border-green-200 text-green-700";
        }

        var card = document.createElement("div");
        card.className = "border rounded-3xl p-5 " + colorClass;

        card.innerHTML =
            "<div class='flex justify-between items-start mb-2'>" +
                "<h4 class='font-bold text-lg'>" + alert.title + "</h4>" +
                "<span class='font-bold text-sm'>" + alert.level + "</span>" +
            "</div>" +
            "<p class='text-sm'>" + alert.description + "</p>";

        alertsContainer.appendChild(card);
    }
}

function showLogs() {
    logsContainer.innerHTML = "";

    for (var i = 0; i < monitorData.logs.length; i++) {
        var log = monitorData.logs[i];

        var card = document.createElement("div");
        card.className = "border border-slate-200 rounded-2xl p-5 hover:bg-slate-50";

        card.innerHTML =
            "<div class='flex justify-between items-start'>" +
                "<div>" +
                    "<h4 class='font-bold text-slate-900'>" + log.title + "</h4>" +
                    "<p class='text-sm text-slate-500 mt-2'>" + log.message + "</p>" +
                "</div>" +
                "<span class='text-sm text-slate-400'>" + log.time + "</span>" +
            "</div>";

        logsContainer.appendChild(card);
    }
}

refreshButton.addEventListener("click", function() {
    for (var i = 0; i < monitorData.sensors.length; i++) {
        if (monitorData.sensors[i].status !== "Offline") {
            monitorData.sensors[i].value = monitorData.sensors[i].value + 1;
            monitorData.sensors[i].lastUpdate = "Now";
        }
    }

    showSensors();

    monitorMessage.textContent = "Demo monitor data refreshed.";
    monitorMessage.classList.remove("text-red-500");
    monitorMessage.classList.add("text-green-500");
});

showUsername();
loadMonitorPanel();