const studentName = document.getElementById("studentName");

const setupForm = document.getElementById("setupForm");
const setupMessage = document.getElementById("setupMessage");

const projectNameInput = document.getElementById("projectNameInput");
const deviceInput = document.getElementById("deviceInput");
const protocolInput = document.getElementById("protocolInput");
const databaseInput = document.getElementById("databaseInput");
const powerInput = document.getElementById("powerInput");

const projectNameText = document.getElementById("projectNameText");
const deviceText = document.getElementById("deviceText");
const protocolText = document.getElementById("protocolText");
const databaseText = document.getElementById("databaseText");
const powerText = document.getElementById("powerText");

const flowContainer = document.getElementById("flowContainer");
const componentsContainer = document.getElementById("componentsContainer");

function showUsername() {
    const params = new URLSearchParams(window.location.search);
    const username = params.get("username");

    if (username != null) {
        studentName.textContent = username;
    }
}

function loadProjectSetup() {
    var request = new XMLHttpRequest();

    request.open("GET", "fake-data.json", false);
    request.send();

    var data = JSON.parse(request.responseText);
    var setup = data.projectSetup;

    projectNameInput.value = setup.projectName;
    deviceInput.value = setup.device;
    protocolInput.value = setup.protocol;
    databaseInput.value = setup.database;
    powerInput.value = setup.powerSource;

    projectNameText.textContent = setup.projectName;
    deviceText.textContent = setup.device;
    protocolText.textContent = setup.protocol;
    databaseText.textContent = setup.database;
    powerText.textContent = setup.powerSource;

    showFlow(setup.flow);
    showComponents(setup.components);
}

function showFlow(flowList) {
    for (var i = 0; i < flowList.length; i++) {
        var item = flowList[i];

        var card = document.createElement("div");
        card.className = "border border-slate-200 rounded-2xl p-5 text-center bg-slate-50";

        card.innerHTML =
            "<p class='text-3xl mb-3'>" + item.icon + "</p>" +
            "<h4 class='font-bold text-slate-900'>" + item.name + "</h4>" +
            "<p class='text-sm text-slate-500 mt-2'>" + item.description + "</p>";

        flowContainer.appendChild(card);
    }
}

function showComponents(componentList) {
    for (var i = 0; i < componentList.length; i++) {
        var item = componentList[i];

        var card = document.createElement("div");
        card.className = "border border-slate-200 rounded-2xl p-5 hover:bg-slate-50";

        card.innerHTML =
            "<div class='flex justify-between items-start mb-3'>" +
                "<h4 class='font-bold text-slate-900'>" + item.name + "</h4>" +
                "<span class='bg-slate-100 text-slate-500 text-xs px-3 py-1 rounded-full'>" + item.type + "</span>" +
            "</div>" +
            "<p class='text-sm text-slate-500'>" + item.description + "</p>";

        componentsContainer.appendChild(card);
    }
}

setupForm.addEventListener("submit", function(event) {
    event.preventDefault();

    projectNameText.textContent = projectNameInput.value;
    deviceText.textContent = deviceInput.value;
    protocolText.textContent = protocolInput.value;
    databaseText.textContent = databaseInput.value;
    powerText.textContent = powerInput.value;

    setupMessage.textContent = "Project setup updated for demo.";
    setupMessage.classList.remove("text-red-500");
    setupMessage.classList.add("text-green-500");
});

showUsername();
loadProjectSetup();