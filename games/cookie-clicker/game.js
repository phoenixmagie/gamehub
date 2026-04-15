let cookies = 0;
let totalCps = 0;

const upgrades = [
    { id: 'cursor', name: 'Cursor', baseCost: 15, power: 0.1, amount: 0 },
    { id: 'grandma', name: 'Oma', baseCost: 100, power: 1, amount: 0 },
    { id: 'farm', name: 'Farm', baseCost: 1100, power: 8, amount: 0 },
    { id: 'factory', name: 'Fabrik', baseCost: 12000, power: 47, amount: 0 }
];

function init() {
    const saved = JSON.parse(localStorage.getItem('myWebGames')) || {};
    const state = saved['cookie-clicker'];

    if (state && state.fullState) {
        cookies = state.fullState.cookies;
        state.fullState.upgrades.forEach((u, i) => {
            if(upgrades[i]) upgrades[i].amount = u.amount;
        });
    }
    renderShop();
    gameLoop();
}

function clickCookie() {
    cookies++;
    updateUI();
}

function buyUpgrade(index) {
    const item = upgrades[index];
    const cost = Math.floor(item.baseCost * Math.pow(1.15, item.amount));

    if (cookies >= cost) {
        cookies -= cost;
        item.amount++;
        renderShop();
        updateUI();
        save();
    }
}

function updateUI() {
    document.getElementById('cookie-count').innerText = Math.floor(cookies).toLocaleString() + " Cookies";
    totalCps = upgrades.reduce((sum, item) => sum + (item.amount * item.power), 0);
    document.getElementById('cps-display').innerText = totalCps.toFixed(1) + " pro Sekunde";
}

function renderShop() {
    const container = document.getElementById('shop-items');
    container.innerHTML = upgrades.map((item, index) => {
        const cost = Math.floor(item.baseCost * Math.pow(1.15, item.amount));
        return `
            <div class="upgrade-item ${cookies < cost ? 'locked' : ''}" onclick="buyUpgrade(${index})">
                <div>
                    <span class="item-name">${item.name}</span>
                    <span class="item-price">Preis: ${cost.toLocaleString()}</span>
                </div>
                <span class="item-amount">${item.amount}</span>
            </div>
        `;
    }).join('');
}

function save() {
    const allData = JSON.parse(localStorage.getItem('myWebGames')) || {};
    allData['cookie-clicker'] = {
        highscore: Math.floor(cookies),
        fullState: {
            cookies: cookies,
            upgrades: upgrades.map(u => ({ amount: u.amount }))
        }
    };
    localStorage.setItem('myWebGames', JSON.stringify(allData));
}

function gameLoop() {
    setInterval(() => {
        cookies += totalCps / 10;
        updateUI();
        
        // Shop-Status prüfen
        const items = document.querySelectorAll('.upgrade-item');
        upgrades.forEach((u, i) => {
            const cost = Math.floor(u.baseCost * Math.pow(1.15, u.amount));
            if(cookies >= cost) items[i]?.classList.remove('locked');
            else items[i]?.classList.add('locked');
        });
    }, 100);
    
    setInterval(save, 15000); // Alle 15 Sek Auto-Save
}

init();
