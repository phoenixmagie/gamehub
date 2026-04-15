let cookies = 0;
let cps = 0;
let upgrades = {
    cursor: { amount: 0, cost: 15, power: 0.1 },
    grandma: { amount: 0, cost: 100, power: 1 },
    farm: { amount: 0, cost: 1100, power: 8 }
};

// Spiel laden
function loadGame() {
    const saved = JSON.parse(localStorage.getItem('myWebGames')) || {};
    const data = saved['cookie_clicker_01']; // ID aus deiner games.js

    if (data && data.fullState) {
        cookies = data.fullState.cookies;
        upgrades = data.fullState.upgrades;
        updateCPS();
    }
    updateUI();
}

function saveGame() {
    let allData = JSON.parse(localStorage.getItem('myWebGames')) || {};
    allData['cookie_clicker_01'] = {
        highscore: Math.floor(cookies), // Für den Hub
        fullState: { cookies, upgrades } // Für das Spiel selbst
    };
    localStorage.setItem('myWebGames', JSON.stringify(allData));
}

function clickCookie() {
    cookies++;
    updateUI();
}

function buyUpgrade(id, baseCost, power) {
    let upgrade = upgrades[id];
    if (cookies >= upgrade.cost) {
        cookies -= upgrade.cost;
        upgrade.amount++;
        upgrade.cost = Math.floor(upgrade.cost * 1.15); // Preis steigt um 15%
        updateCPS();
        updateUI();
        saveGame();
    }
}

function updateCPS() {
    cps = 0;
    for (let id in upgrades) {
        cps += upgrades[id].amount * upgrades[id].power;
    }
}

function updateUI() {
    document.getElementById('cookie-count').innerText = Math.floor(cookies) + " Cookies";
    document.getElementById('cps-display').innerText = cps.toFixed(1) + " per second";
    
    for (let id in upgrades) {
        document.getElementById(id + '-price').innerText = upgrades[id].cost + " Cookies";
        document.getElementById(id + '-amount').innerText = upgrades[id].amount;
    }
}

// Alle 1 Sekunde Cookies hinzufügen und speichern
setInterval(() => {
    cookies += cps / 10;
    updateUI();
    if (Math.random() < 0.1) saveGame(); // Alle 1s mit 10% Chance speichern (schont Performance)
}, 100);

loadGame();
