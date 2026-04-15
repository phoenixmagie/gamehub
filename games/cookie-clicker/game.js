/**
 * COOKIE CLICKER - GAME LOGIC
 * ID: cookie-clicker
 */

// 1. Variablen initialisieren
let cookies = 0;
let totalCps = 0;

// Shop-Inhalt definieren
const upgrades = [
    { id: 'cursor', name: 'Cursor', baseCost: 15, power: 0.1, amount: 0 },
    { id: 'grandma', name: 'Oma', baseCost: 100, power: 1, amount: 0 },
    { id: 'farm', name: 'Farm', baseCost: 1100, power: 8, amount: 0 },
    { id: 'mine', name: 'Mine', baseCost: 12000, power: 47, amount: 0 },
    { id: 'factory', name: 'Fabrik', baseCost: 130000, power: 260, amount: 0 }
];

/**
 * START-FUNKTION
 */
function init() {
    // Daten aus LocalStorage laden
    const savedData = JSON.parse(localStorage.getItem('myWebGames')) || {};
    const myState = savedData['cookie-clicker'];

    if (myState && myState.fullState) {
        cookies = myState.fullState.cookies || 0;
        // Upgrades laden und mit dem Standard-Array abgleichen
        myState.fullState.upgrades.forEach((savedUp, index) => {
            if (upgrades[index]) {
                upgrades[index].amount = savedUp.amount;
            }
        });
    }

    // UI das erste Mal zeichnen
    renderShop();
    updateUI();

    // Event Listener für "Notfall-Speicherung" beim Schließen des Tabs
    window.addEventListener('beforeunload', save);

    // Spiel-Loop starten
    startGameLoop();
}

/**
 * KLICK-LOGIK
 */
function clickCookie() {
    cookies++;
    
    // Kleiner visueller Schutz: Alle 10 Klicks im Hintergrund speichern
    if (Math.floor(cookies) % 10 === 0) {
        save();
    }
    
    updateUI();
}

/**
 * KAUF-LOGIK
 */
function buyUpgrade(index) {
    const item = upgrades[index];
    // Preisformel: Basiskosten * 1.15 ^ Anzahl
    const currentCost = Math.floor(item.baseCost * Math.pow(1.15, item.amount));

    if (cookies >= currentCost) {
        cookies -= currentCost;
        item.amount++;
        
        renderShop(); // Shop neu zeichnen (Preise haben sich geändert)
        updateUI();
        save(); // Sofort speichern nach Kauf
    }
}

/**
 * UI AKTUALISIEREN
 */
function updateUI() {
    // Cookie-Zahl anzeigen
    document.getElementById('cookie-count').innerText = Math.floor(cookies).toLocaleString() + " Cookies";
    
    // CPS berechnen
    totalCps = upgrades.reduce((sum, item) => sum + (item.amount * item.power), 0);
    document.getElementById('cps-display').innerText = totalCps.toFixed(1) + " pro Sekunde";

    // Prüfen, ob Shop-Items jetzt bezahlbar sind (für die graue Darstellung)
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
 * SHOP GENERIEREN
 */
function renderShop() {
    const container = document.getElementById('shop-items');
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
 * SPEICHER-FUNKTION
 */
function save() {
    let allData = JSON.parse(localStorage.getItem('myWebGames')) || {};
    
    // WICHTIG: Die ID muss exakt 'cookie-clicker' sein für den Hub
    allData['cookie-clicker'] = {
        highscore: Math.floor(cookies),
        fullState: {
            cookies: cookies,
            upgrades: upgrades.map(u => ({ amount: u.amount }))
        }
    };
    
    localStorage.setItem('myWebGames', JSON.stringify(allData));
}

/**
 * GAME LOOP (Ticks)
 */
function startGameLoop() {
    // Alle 100ms (10x pro Sekunde) Cookies hinzufügen für flüssige Anzeige
    setInterval(() => {
        if (totalCps > 0) {
            cookies += totalCps / 10;
            updateUI();
        }
    }, 100);

    // Alle 30 Sekunden automatisches Backup
    setInterval(save, 30000);
}

// Initialisierung starten
init();
