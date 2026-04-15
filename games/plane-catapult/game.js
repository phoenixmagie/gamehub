const plane = document.getElementById('plane');
const planeCont = document.getElementById('plane-container');
const world = document.getElementById('world');
const upgradeMenu = document.getElementById('upgrade-menu');

// Stats
let gameState = 'slingshot';
let money = 0; let distance = 0;
let up_plane = 1; let up_catapult = 1; let up_money = 1;

// Physik
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
    updateEvolution();
    updateUI();
    gameLoop();
}

/** TOUCH & MAUS FIX **/
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
        planeCont.style.transform = `translate(${-dx/4}px, ${dy/4}px) rotate(${-dy/3}deg)`;
    }
    // Steuerung im Flug (nach links/rechts neigen)
    if(gameState === 'flying') {
        let screenMid = window.innerWidth / 2;
        if (e.clientX < screenMid - 30) sideX -= 6;
        if (e.clientX > screenMid + 30) sideX += 6;
        if (e.clientY < window.innerHeight/2) angle -= 1.5;
        if (e.clientY > window.innerHeight/2) angle += 1.5;
    }
};

window.onpointerup = (e) => {
    if(!isDragging) return;
    isDragging = false;
    velX = (startX - e.clientX) / 6 * up_catapult;
    velY = (startY - e.clientY) / 6 * up_catapult;
    if(velX > 2) gameState = 'flying'; // Nur starten wenn Kraft da ist
};

/** GAME LOOP **/
function gameLoop() {
    if (gameState === 'flying') {
        velY -= 0.15; // Schwerkraft
        let rad = angle * Math.PI / 180;
        velX += Math.cos(rad) * 0.15 * up_plane;
        
        posY += velY;
        distance += velX / 10;

        // 3D-Update
        planeCont.style.bottom = posY + "px";
        planeCont.style.left = `calc(50% + ${sideX}px)`;
        planeCont.style.transform = `rotateX(${angle}deg) rotateY(${sideX/15}deg)`;

        // Welt bewegt sich (Endlos-Effekt)
        world.style.backgroundPositionY = (distance * 15) + "px";

        // Welt-Wechsel & Gebäude
        if (distance > 500) {
            world.style.background = "var(--city)";
            if(Math.random() > 0.97) spawnBuilding();
        }

        if (posY < 50) finish();
    }
    updateUI();
    requestAnimationFrame(gameLoop);
}

function spawnBuilding() {
    const b = document.createElement('div');
    b.className = 'building';
    b.style.left = Math.random() * 90 + "%";
    b.style.top = "0px";
    world.appendChild(b);
    setTimeout(() => b.remove(), 4000);
}

function updateEvolution() {
    plane.className = "";
    if (up_plane >= 20) plane.classList.add('lvl-20');
    else if (up_plane >= 10) plane.classList.add('lvl-10');
    else if (up_plane >= 5) plane.classList.add('lvl-5');
    else plane.classList.add('lvl-1');
    
    document.getElementById('lvl-num').innerText = Math.floor(up_plane);
    document.getElementById('lvl-progress').style.width = Math.min(100, up_plane * 5) + "%";
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
    let cost = type==='plane' ? up_plane*200 : type==='catapult' ? up_catapult*150 : up_money*100;
    if(money >= cost) {
        money -= cost;
        if(type==='plane') up_plane++;
        if(type==='catapult') up_catapult += 0.4;
        if(type==='money') up_money += 0.5;
        updateEvolution(); updateUI(); save();
    }
}

function updateUI() {
    document.getElementById('money-display').innerText = money + " €";
    document.getElementById('dist-display').innerText = Math.floor(distance) + " m";
    document.getElementById('p-plane').innerText = Math.floor(up_plane * 200) + "€";
    document.getElementById('p-cat').innerText = Math.floor(up_catapult * 150) + "€";
    document.getElementById('p-mon').innerText = Math.floor(up_money * 100) + "€";
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
