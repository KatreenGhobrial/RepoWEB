const studentName = document.getElementById("studentName");

const conflictCount = document.getElementById("conflictCount");
const highestRiskText = document.getElementById("highestRiskText");

const conflictForm = document.getElementById("conflictForm");
const deviceInput = document.getElementById("deviceInput");
const powerInput = document.getElementById("powerInput");
const protocolInput = document.getElementById("protocolInput");
const databaseInput = document.getElementById("databaseInput");
const requirementInput = document.getElementById("requirementInput");

const conflictMessage = document.getElementById("conflictMessage");
const resultContainer = document.getElementById("resultContainer");
const conflictsContainer = document.getElementById("conflictsContainer");

var conflicts = [];

function showUsername() {
    const params = new URLSearchParams(window.location.search);
    const username = params.get("username");

    if (username != null) {
        studentName.textContent = username;
    }
}

function loadConflicts() {
    var request = new XMLHttpRequest();

    request.open("GET", "fake-data.json", false);
    request.send();

    var data = JSON.parse(request.responseText);

    conflicts = data.detectConflict.conflicts;

    conflictCount.textContent = conflicts.length;
    highestRiskText.textContent = data.detectConflict.highestRisk;

    showExistingConflicts();
}

function showExistingConflicts() {
    conflictsContainer.innerHTML = "";

    for (var i = 0; i < conflicts.length; i++) {
        var conflict = conflicts[i];

        var colorClass = "bg-red-100 border-red-200 text-red-700";

        if (conflict.level === "MEDIUM") {
            colorClass = "bg-yellow-100 border-yellow-300 text-orange-600";
        }

        if (conflict.level === "LOW") {
            colorClass = "bg-green-100 border-green-200 text-green-700";
        }

        var card = document.createElement("div");
        card.className = "border rounded-3xl p-5 " + colorClass;

        card.innerHTML =
            "<div class='flex justify-between items-start mb-3'>" +
                "<h4 class='text-lg font-bold'>" + conflict.title + "</h4>" +
                "<span class='font-bold text-sm'>" + conflict.level + "</span>" +
            "</div>" +
            "<p class='text-sm mb-3'>" + conflict.reason + "</p>" +
            "<p class='text-sm font-bold'>Suggestion: " + conflict.suggestion + "</p>";

        conflictsContainer.appendChild(card);
    }
}

function addResult(title, level, reason, suggestion) {
    var colorClass = "bg-red-100 border-red-200 text-red-700";

    if (level === "MEDIUM") {
        colorClass = "bg-yellow-100 border-yellow-300 text-orange-600";
    }

    if (level === "LOW") {
        colorClass = "bg-green-100 border-green-200 text-green-700";
    }

    var card = document.createElement("div");
    card.className = "border rounded-3xl p-5 " + colorClass;

    card.innerHTML =
        "<div class='flex justify-between items-start mb-3'>" +
            "<h4 class='text-lg font-bold'>" + title + "</h4>" +
            "<span class='font-bold text-sm'>" + level + "</span>" +
        "</div>" +
        "<p class='text-sm mb-3'>" + reason + "</p>" +
        "<p class='text-sm font-bold'>Suggestion: " + suggestion + "</p>";

    resultContainer.appendChild(card);
}

conflictForm.addEventListener("submit", function(event) {
    event.preventDefault();

    resultContainer.innerHTML = "";

    var device = deviceInput.value;
    var power = powerInput.value;
    var protocol = protocolInput.value;
    var database = databaseInput.value;
    var requirement = requirementInput.value;

    var found = 0;
    var highest = "None";

    if (power === "Battery" && protocol === "HTTP") {
        addResult(
            "Battery device using HTTP",
            "HIGH",
            "HTTP may create more requests and consume more power in an IoT device.",
            "Consider MQTT or reduce the sending frequency."
        );

        found++;
        highest = "HIGH";
    }

    if (requirement === "Low latency" && protocol === "HTTP") {
        addResult(
            "Low latency requirement with HTTP",
            "MEDIUM",
            "HTTP can be simple, but it may not be ideal for frequent real-time updates.",
            "Consider MQTT or WebSocket for more frequent updates."
        );

        found++;

        if (highest !== "HIGH") {
            highest = "MEDIUM";
        }
    }

    if (requirement === "Store sensor history" && database === "No Database") {
        addResult(
            "History requirement without database",
            "HIGH",
            "The project needs to store sensor history, but no database was selected.",
            "Add MongoDB, MySQL or Firebase."
        );

        found++;
        highest = "HIGH";
    }

    if (device === "Arduino Uno" && protocol === "MQTT") {
        addResult(
            "Arduino Uno with MQTT",
            "MEDIUM",
            "Arduino Uno may need an additional network module to use MQTT.",
            "Check if Wi-Fi or Ethernet module is available."
        );

        found++;

        if (highest !== "HIGH") {
            highest = "MEDIUM";
        }
    }

    if (found === 0) {
        addResult(
            "No major conflict detected",
            "LOW",
            "The selected configuration looks reasonable for a simple demo.",
            "Continue to Project Setup or ask the Socratic Bot for guidance."
        );

        highest = "LOW";
    }

    conflictCount.textContent = found;
    highestRiskText.textContent = highest;

    conflictMessage.textContent = "Conflict detection completed.";
    conflictMessage.classList.remove("text-red-500");
    conflictMessage.classList.add("text-green-500");
});

showUsername();
loadConflicts();