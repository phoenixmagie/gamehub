const plane = document.getElementById('plane');
const planeCont = document.getElementById('plane-container');
const world = document.getElementById('world');
const upgradeMenu = document.getElementById('upgrade-menu');

let gameState = 'slingshot';
let money = 0; let distance = 0;
let up_plane = 1; let up_catapult = 1; let up_money = 1;

let posX = 0, posY = 200, sideX = 0;
let velX = 0, velY = 0, angle = 0;
let isDragging = false;
let startX, startY;

function init() {
    const saved = JSON.parse(localStorage.getItem('myWebGames')) || {};
    const state = saved['plane-catapult'];
    if (state && state.fullState) {
        money = state.state_money || 0;
        up_plane = state.state_plane || 1;
        up_catapult = state.state_cat || 1;
        up_money = state.state_mon || 1;
    }
    updateUI();
    gameLoop();
}

// Touch/Maus Start-Logik
window.onpointerdown = (e) => {
    if(gameState !== 'slingshot') return;
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
};

window.onpointermove = (e) => {
    if(isDragging && gameState === 'slingshot') {
        let dx = startX - e.clientX;
        let dy = startY - e.clientY;
        // Flugzeug visuell in der Schleuder ziehen
        planeCont.style.transform = `translate(${-dx/4}px, ${dy/4}px) rotate(${-dy/3}deg)`;
    }
    // Steuerung im Flug
    if(gameState === 'flying') {
        let cx = window.innerWidth / 2;
        let cy = window.innerHeight / 2;
        if (e.clientX < cx - 50) sideX -= 5;
        if (e.clientX > cx + 50) sideX += 5;
        if (e.clientY < cy - 50) angle -= 2;
        if (e.clientY > cy + 50) angle += 2;
    }
};

window.onpointerup = (e) => {
    if(!isDragging) return;
    isDragging = false;
    velX = (startX - e.clientX) / 6 * up_catapult;
    velY = (startY - e.clientY) / 6 * up_catapult;
    if(velX > 2) gameState = 'flying';
};

function gameLoop() {
    if (gameState === 'flying') {
        velY -= 0.15; // Schwerkraft
        let rad = angle * Math.PI / 180;
        velX += Math.cos(rad) * 0.1 * up_plane;
        
        posY += velY;
        distance += velX / 10;

        // 3D-Positionierung
        planeCont.style.bottom = posY + "px";
        planeCont.style.left = `calc(50% + ${sideX}px)`;
        planeCont.style.transform = `rotateX(${angle}deg) rotateY(${sideX/20}deg)`;

        // Welt bewegt sich unter uns weg
        world.style.backgroundPositionY = (distance * 10) + "px";

        // Welt-Wechsel
        if (distance > 500) {
            world.style.background = "var(--city)";
            if (Math.random() > 0.95) spawnBuilding();
        }

        if (posY < 50) finish();
    }
    updateUI();
    requestAnimationFrame(gameLoop);
}

function spawnBuilding() {
    const b = document.createElement('div');
    b.className = 'building';
    b.style.left = Math.random() * 100 + "%";
    b.style.top = "0px";
    world.appendChild(b);
    setTimeout(() => b.remove(), 4000);
}

function finish() {
    gameState = 'landed';
    let earned = Math.floor(distance * up_money);
    money += earned;
    document.getElementById('flight-info').innerText = `${Math.floor(distance)}m geflogen!\nVerdienst: ${earned}€`;
    upgradeMenu.classList.remove('hidden');
    save();
}

function resetFlight() {
    gameState = 'slingshot';
    distance = 0; posY = 200; sideX = 0; velX = 0; velY = 0; angle = 0;
    planeCont.style.transform = "none";
    upgradeMenu.classList.add('hidden');
}

function buyUpgrade(type) {
    let cost = type==='plane' ? up_plane*200 : up_catapult*150;
    if(money >= cost) {
        money -= cost;
        if(type==='plane') up_plane++;
        if(type==='catapult') up_catapult += 0.4;
        updateUI(); save();
    }
}

function updateUI() {
    document.getElementById('money-display').innerText = money + " €";
    document.getElementById('dist-display').innerText = Math.floor(distance) + " m";
}

function save() {
    let all = JSON.parse(localStorage.getItem('myWebGames')) || {};
    all['plane-catapult'] = {
        highscore: Math.floor(distance),
        state_money: money, state_plane: up_plane, state_cat: up_catapult, state_mon: up_money
    };
    localStorage.setItem('myWebGames', JSON.stringify(all));
}

init();
