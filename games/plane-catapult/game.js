const plane = document.getElementById('plane');
const planeCont = document.getElementById('plane-container');
const world = document.getElementById('world');
const upgradeMenu = document.getElementById('upgrade-menu');

// Stats & Upgrades
let gameState = 'slingshot';
let money = 0;
let distance = 0;
let up_plane = 1; // Dies ist auch das "Level"
let up_catapult = 1;
let up_money = 1;

// Physik
let posX = 100, posY = 150, sideX = 0;
let velX = 0, velY = 0, angle = 0;
let isDragging = false;
let startX, startY;
let keys = {};

/** INITIALISIERUNG **/
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

/** STEUERUNG **/
window.onkeydown = (e) => keys[e.key] = true;
window.onkeyup = (e) => keys[e.key] = false;

// Slingshot / Touch-Steuerung
window.addEventListener('mousedown', (e) => { if(gameState==='slingshot'){ isDragging=true; startX=e.clientX; startY=e.clientY; }});
window.addEventListener('touchstart', (e) => { if(gameState==='slingshot'){ isDragging=true; startX=e.touches[0].clientX; startY=e.touches[0].clientY; }});

window.addEventListener('mousemove', (e) => {
    if(isDragging) {
        let dx = startX - e.clientX;
        let dy = startY - e.clientY;
        planeCont.style.transform = `translate(${-dx/5}px, ${-dy/5}px) rotate(${-dy/2}deg)`;
    }
});

window.addEventListener('mouseup', (e) => {
    if(!isDragging) return;
    isDragging = false;
    velX = (startX - e.clientX) / 7 * up_catapult;
    velY = (startY - e.clientY) / 7 * up_catapult;
    gameState = 'flying';
});

/** GAME LOOP **/
function gameLoop() {
    if (gameState === 'flying') {
        // Steuerung (PC & Touch Simulation)
        if (keys['ArrowUp']) angle -= 2;
        if (keys['ArrowDown']) angle += 2;
        if (keys['ArrowLeft']) sideX -= 5;
        if (keys['ArrowRight']) sideX += 5;

        // Physik
        velY -= 0.15; // Schwerkraft
        let rad = angle * Math.PI / 180;
        velX += Math.cos(rad) * 0.1 * up_plane;
        
        posY += velY;
        distance += velX / 10;

        // Grafik Update
        planeCont.style.bottom = posY + "px";
        planeCont.style.left = (15 + (sideX/20)) + "%";
        planeCont.style.transform = `rotateX(${angle}deg) rotateY(${sideX/10}deg)`;
        
        // Endlos-Welt bewegen
        world.style.backgroundPositionX = (-distance * 20) + "px";

        // Welt-Evolution (Gras -> Stadt)
        if (distance > 500) {
            world.style.background = "var(--city)";
            document.body.style.background = "#444";
        }

        if (posY < 50) checkLanding();
    }
    updateUI();
    requestAnimationFrame(gameLoop);
}

function updateEvolution() {
    plane.className = "";
    if (up_plane >= 20) plane.classList.add('lvl-20');
    else if (up_plane >= 10) plane.classList.add('lvl-10');
    else if (up_plane >= 5) plane.classList.add('lvl-5');
    else plane.classList.add('lvl-1');
    
    document.getElementById('lvl-num').innerText = Math.floor(up_plane);
    document.getElementById('lvl-progress').style.width = (up_plane * 5) + "%";
}

function checkLanding() {
    gameState = 'landed';
    let earned = Math.floor(distance * up_money);
    money += earned;
    document.getElementById('flight-info').innerText = `Distanz: ${Math.floor(distance)}m \n Verdient: ${earned}€`;
    upgradeMenu.classList.remove('hidden');
    save();
}

function buyUpgrade(type) {
    let cost = 0;
    if(type==='plane') cost = Math.floor(up_plane * 250);
    if(type==='catapult') cost = Math.floor(up_catapult * 150);
    if(type==='money') cost = Math.floor(up_money * 100);

    if(money >= cost) {
        money -= cost;
        if(type==='plane') up_plane++;
        if(type==='catapult') up_catapult += 0.5;
        if(type==='money') up_money += 0.5;
        updateEvolution();
        updateUI();
        save();
    }
}

function resetFlight() {
    gameState = 'slingshot';
    distance = 0; posY = 150; sideX = 0; velX = 0; velY = 0; angle = 0;
    upgradeMenu.classList.add('hidden');
}

function updateUI() {
    document.getElementById('money-display').innerText = money + " €";
    document.getElementById('dist-display').innerText = Math.floor(distance) + " m";
    document.getElementById('p-plane').innerText = Math.floor(up_plane * 250) + "€";
    document.getElementById('p-cat').innerText = Math.floor(up_catapult * 150) + "€";
    document.getElementById('p-mon').innerText = Math.floor(up_money * 100) + "€";
}

function save() {
    let all = JSON.parse(localStorage.getItem('myWebGames')) || {};
    all['plane-catapult'] = {
        highscore: Math.floor(distance),
        state_money: money,
        state_plane: up_plane,
        state_cat: up_catapult,
        state_mon: up_money
    };
    localStorage.setItem('myWebGames', JSON.stringify(all));
}

init();
