/**
 * COOKIE CLICKER - GAME LOGIC
 * Dateiname: game.js
 * ID: cookie-clicker
 */

let cookies = 0;
let totalCps = 0;

// Die Liste der Upgrades
const upgrades = [
    { id: 'cursor', name: 'Cursor', baseCost: 15, power: 0.1, amount: 0 },
    { id: 'grandma', name: 'Oma', baseCost: 100, power: 1, amount: 0 },
    { id: 'farm', name: 'Farm', baseCost: 1100, power: 8, amount: 0 },
    { id: 'mine', name: 'Mine', baseCost: 12000, power: 47, amount: 0 },
    { id: 'factory', name: 'Fabrik', baseCost: 130000, power: 260, amount: 0 }
];

/**
 * Initialisierung beim Laden
 */
function init() {
    // Daten aus LocalStorage laden
    const savedData = JSON.parse(localStorage.getItem('myWebGames')) || {};
    const myState = savedData['cookie-clicker'];

    if (myState && myState.fullState) {
        cookies = myState.fullState.cookies || 0;
        // Gekaufte Mengen wiederherstellen
        myState.fullState.upgrades.forEach((savedUp, index) => {
            if (upgrades[index]) {
                upgrades[index].amount = savedUp.amount;
            }
        });
    }

    // UI aufbauen
    renderShop();
    updateUI();

    // WICHTIG: Speichert, wenn der Tab geschlossen oder die Seite verlassen wird
    window.addEventListener('beforeunload', save);
    
    // Spiel-Loop starten
    startGameLoop();
}

/**
 * Die Haupt-Klickfunktion
 */
function clickCookie() {
    cookies++;
    updateUI();
}

/**
 * Upgrade kaufen
 */
function buyUpgrade(index) {
    const item = upgrades[index];
    const currentCost = Math.floor(item.baseCost * Math.pow(1.15, item.amount));

    if (cookies >= currentCost) {
        cookies -= currentCost;
        item.amount++;
        
        save(); // Sofort speichern nach Kauf
        renderShop();
        updateUI();
    }
}

/**
 * Benutzeroberfläche aktualisieren
 */
function updateUI() {
    // Cookie Zahl anzeigen
    document.getElementById('cookie-count').innerText = Math.floor(cookies).toLocaleString() + " Cookies";
    
    // CPS berechnen (Cookies pro Sekunde)
    totalCps = upgrades.reduce((sum, item) => sum + (item.amount * item.power), 0);
    document.getElementById('cps-display').innerText = totalCps.toFixed(1) + " pro Sekunde";

    // Shop-Items prüfen (sind sie bezahlbar?)
    const items = document.querySelectorAll('.upgrade-item');
    upgrades.forEach((u, i) => {
        const cost = Math.floor(u.baseCost * Math.pow(1.15, u.amount));
        if (cookies >= cost) {
            items[i]?.classList.remove('locked');
        } else {
            items[i]?.classList.add('locked');
        }
    });
}

/**
 * Den Shop im HTML generieren
 */
function renderShop() {
    const container = document.getElementById('shop-items');
    if (!container) return;
    
    container.innerHTML = "";

    upgrades.forEach((item, index) => {
        const currentCost = Math.floor(item.baseCost * Math.pow(1.15, item.amount));
        
        const div = document.createElement('div');
        div.className = `upgrade-item ${cookies < currentCost ? 'locked' : ''}`;
        div.onclick = () => buyUpgrade(index);
        
        div.innerHTML = `
            <div>
                <span class="item-name">${item.name}</span>
                <span class="item-price">Preis: ${currentCost.toLocaleString()}</span>
            </div>
            <span class="item-amount">${item.amount}</span>
        `;
        container.appendChild(div);
    });
}

/**
 * Die Speicher-Funktion (LocalStorage)
 */
function save() {
    let allData = JSON.parse(localStorage.getItem('myWebGames')) || {};
    
    // Speicherung unter der ID für den Hub
    allData['cookie-clicker'] = {
        highscore: Math.floor(cookies), // Wird im Hub angezeigt
        fullState: {
            cookies: cookies,
            upgrades: upgrades.map(u => ({ amount: u.amount }))
        }
    };
    
    localStorage.setItem('myWebGames', JSON.stringify(allData));
    console.log("Gespeichert!");
}

/**
 * Game-Loop für CPS und automatisches Speichern
 */
function startGameLoop() {
    // 10 mal pro Sekunde Cookies hinzufügen (flüssiger)
    setInterval(() => {
        if (totalCps > 0) {
            cookies += totalCps / 10;
            updateUI();
        }
    }, 100);

    // Alle 30 Sekunden im Hintergrund speichern
    setInterval(save, 30000);
}

// Start!
init();
