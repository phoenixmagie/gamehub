const planeCont = document.getElementById('plane-container');
const planeDesign = document.getElementById('plane');
const world = document.getElementById('world');
const upgradeMenu = document.getElementById('upgrade-menu');

// Spiel-Daten
let gameState = 'slingshot'; // slingshot, flying, landed
let money = 0;
let distance = 0;
let isBroken = false;

// Upgrades
let up_money = 1;
let up_plane = 1;
let up_catapult = 1;

// Physik & Position
let posX = 100, posY = 150, sidePos = 0;
let velX = 0, velY = 0;
let angle = 0;
let gravity = 0.18;

// Steuerung
let keys = {};
let isDragging = false;
let startX, startY;
let touchStartX = 0, touchStartY = 0;

window.onkeydown = (e) => keys[e.key] = true;
window.onkeyup = (e) => keys[e.key] = false;

/** START **/
function init() {
    const saved = JSON.parse(localStorage.getItem('myWebGames')) || {};
    const state = saved['plane-catapult'];
    if (state && state.fullState) {
        money = state.fullState.money || 0;
        up_money = state.fullState.up_money || 1;
        up_plane = state.fullState.up_plane || 1;
        up_catapult = state.fullState.up_catapult || 1;
    }
    if(up_plane > 2) document.getElementById('propeller').style.display = 'block';
    updateUI();
    gameLoop();
}

/** TOUCH & MOUSE SLINGSHOT **/
window.addEventListener('mousedown', sDrag);
window.addEventListener('touchstart', sDrag);
window.addEventListener('mousemove', dDrag);
window.addEventListener('touchmove', dDrag);
window.addEventListener('mouseup', eDrag);
window.addEventListener('touchend', eDrag);

function sDrag(e) {
    if (gameState !== 'slingshot') return;
    isDragging = true;
    startX = e.clientX || e.touches[0].clientX;
    startY = e.clientY || e.touches[0].clientY;
}

function dDrag(e) {
    if (gameState === 'slingshot' && isDragging) {
        let cX = e.clientX || e.touches[0].clientX;
        let cY = e.clientY || e.touches[0].clientY;
        let dX = startX - cX;
        let dY = startY - cY;
        planeCont.style.transform = `translate(${-dX/5}px, ${-dY/5}px) rotate(${-dY/2}deg)`;
    }
    // Touch-Steuerung im Flug
    if (gameState === 'flying' && e.touches) {
        let tX = e.touches[0].clientX;
        let tY = e.touches[0].clientY;
        keys['ArrowUp'] = tY < window.innerHeight/2 - 20;
        keys['ArrowDown'] = tY > window.innerHeight/2 + 20;
        keys['ArrowLeft'] = tX < window.innerWidth/2 - 20;
        keys['ArrowRight'] = tX > window.innerWidth/2 + 20;
    }
}

function eDrag(e) {
    if (!isDragging) return;
    isDragging = false;
    let cX = (e.changedTouches) ? e.changedTouches[0].clientX : e.clientX;
    let cY = (e.changedTouches) ? e.changedTouches[0].clientY : e.clientY;
    
    velX = (startX - cX) / 8 * up_catapult;
    velY = (startY - cY) / 8 * up_catapult;
    gameState = 'flying';
}

/** PHYSIK & LOOP **/
function gameLoop() {
    if (gameState === 'flying') {
        // Steuerung
        if (keys['ArrowUp']) angle -= 2.2;
        if (keys['ArrowDown']) angle += 2.2;
        if (keys['ArrowLeft']) sidePos -= 4;
        if (keys['ArrowRight']) sidePos += 4;

        // Flugphysik
        velY -= gravity;
        let rad = angle * Math.PI / 180;
        velX += Math.cos(rad) * 0.15 * up_plane;
        velX *= 0.99; // Luftwiderstand

        posX += velX;
        posY += velY;
        distance += velX / 10;

        // Visuals
        planeCont.style.bottom = posY + "px";
        planeCont.style.left = (100 + sidePos) + "px";
        planeCont.style.transform = `rotate(${angle}deg) rotateZ(${sidePos/10}deg)`;
        world.style.transform = `translateX(${-distance * 10 % 1000}px)`;
        
        document.getElementById('speed-bar').style.height = Math.min(100, velX * 10) + "%";

        if (posY <= 100) checkLanding();
    }
    updateUI();
    requestAnimationFrame(gameLoop);
}

function checkLanding() {
    gameState = 'landed';
    let report = "";
    if (angle > -20 && angle < 15 && velY > -4) {
        let bonus = Math.floor(distance * 0.5);
        money += Math.floor(distance * up_money) + bonus;
        report = `Perfekte Landung! Distanz: ${Math.floor(distance)}m + Bonus: ${bonus}€`;
        document.getElementById('end-status').innerText = "Sicher gelandet!";
    } else {
        isBroken = true;
        money += Math.floor(distance * up_money);
        planeDesign.style.filter = "contrast(0.2) sepia(1) rotate(20deg)";
        report = `Crash! Flugzeug beschädigt. Distanz-Geld: ${Math.floor(distance * up_money)}€`;
        document.getElementById('end-status').innerText = "ABSTURZ!";
    }
    document.getElementById('flight-report').innerText = report;
    upgradeMenu.classList.remove('hidden');
    save();
}

function resetFlight() {
    gameState = 'slingshot';
    isBroken = false;
    distance = 0; sidePos = 0; posY = 150; velX = 0; velY = 0; angle = 0;
    planeCont.style.bottom = "150px";
    planeCont.style.left = "100px";
    planeCont.style.transform = "rotate(0deg)";
    planeDesign.style.filter = "none";
    upgradeMenu.classList.add('hidden');
    keys = {};
}

function buyUpgrade(type) {
    let cost = (type==='money')? up_money*100 : (type==='plane')? Math.floor(up_plane*200) : Math.floor(up_catapult*150);
    if (money >= cost) {
        money -= cost;
        if(type==='money') up_money++;
        if(type==='plane') { 
            up_plane += 0.4;
            if(up_plane > 2) document.getElementById('propeller').style.display = 'block';
        }
        if(type==='catapult') up_catapult += 0.3;
        save();
        updateUI();
    }
}

function updateUI() {
    document.getElementById('dist-display').innerText = Math.floor(distance) + "m";
    document.getElementById('money-display').innerText = money + "€";
    document.getElementById('price-money').innerText = (up_money * 100) + "€";
    document.getElementById('price-plane').innerText = Math.floor(up_plane * 200) + "€";
    document.getElementById('price-catapult').innerText = Math.floor(up_catapult * 150) + "€";
}

function save() {
    let all = JSON.parse(localStorage.getItem('myWebGames')) || {};
    all['plane-catapult'] = {
        highscore: Math.floor(distance),
        fullState: { money, up_money, up_plane, up_catapult }
    };
    localStorage.setItem('myWebGames', JSON.stringify(all));
}

init();
