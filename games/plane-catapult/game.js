// Game Stats
let money = 0;
let up_plane = 1;
let up_power = 1;
let gameState = 'slingshot';

// Physik
let distance = 0, posY = 200, sideX = 0;
let velX = 0, velY = 0;
let isDragging = false, startX, startY;

const plane = document.getElementById('plane');
const planeCont = document.getElementById('plane-container');
const world = document.getElementById('world');

function gameLoop() {
    if (gameState === 'flying') {
        // Schwerkraft & Flugphysik
        velY -= 0.15; 
        velX += 0.04 * (up_plane / 4); 
        
        posY += velY;
        distance += velX;

        // Flugzeug-Rotation basierend auf Flugkurve
        planeCont.style.bottom = posY + "px";
        planeCont.style.left = `calc(50% + ${sideX}px)`;
        planeCont.style.transform = `rotateX(${-velY * 3}deg) rotateZ(${sideX / 8}deg)`;
        
        // Welt-Bewegung (Endlos-Effekt)
        world.style.backgroundPositionY = (distance * 12) + "px";

        // Welt-Evolution: Wald -> Stadt
        if (distance > 600) {
            world.style.backgroundColor = "var(--city)";
        } else {
            world.style.backgroundColor = "var(--grass)";
        }

        // Absturz-Check
        if (posY < 40) finish();
    }
    updateUI();
    requestAnimationFrame(gameLoop);
}

// Steuerung: Slingshot & Flug
window.onpointerdown = (e) => {
    if (gameState !== 'slingshot') return;
    isDragging = true; 
    startX = e.clientX; startY = e.clientY;
};

window.onpointermove = (e) => {
    if (isDragging && gameState === 'slingshot') {
        let dx = startX - e.clientX;
        let dy = startY - e.clientY;
        planeCont.style.transform = `translate(${-dx/3}px, ${dy/3}px) rotate(${dx/6}deg)`;
    }
    if (gameState === 'flying') {
        // Seitliche Steuerung im Flug
        let targetX = (e.clientX - window.innerWidth/2) * 1.2;
        sideX += (targetX - sideX) * 0.1;
    }
};

window.onpointerup = (e) => {
    if (!isDragging) return;
    isDragging = false;
    velX = Math.abs(startX - e.clientX) / 8 * up_power;
    velY = (startY - e.clientY) / 4 * up_power;
    
    if (velX > 1.5) {
        gameState = 'flying';
    } else {
        planeCont.style.transform = "none";
    }
};

// Upgrade-System
function buyUpgrade(type) {
    let cost = type === 'plane' ? up_plane * 150 : up_power * 100;
    if (money >= cost) {
        money -= cost;
        if (type === 'plane') up_plane++;
        if (type === 'power') up_power += 0.4;
        updateEvolution();
        updateUI();
    }
}

function updateEvolution() {
    plane.className = "";
    let lvl = Math.floor(up_plane);
    if (lvl >= 20) plane.classList.add('lvl-20');
    else if (lvl >= 10) plane.classList.add('lvl-10');
    else if (lvl >= 5) plane.classList.add('lvl-5');
    else plane.classList.add('lvl-1');
    
    document.getElementById('lvl-tag').innerText = "LEVEL " + lvl;
}

function finish() {
    gameState = 'landed';
    let earned = Math.floor(distance / 1.5);
    money += earned;
    document.getElementById('flight-info').innerText = `Distanz: ${Math.floor(distance)}m \n Gewinn: ${earned} $`;
    document.getElementById('upgrade-menu').classList.remove('hidden');
}

function resetFlight() {
    gameState = 'slingshot';
    distance = 0; posY = 200; sideX = 0; velX = 0; velY = 0;
    planeCont.style.transform = "none";
    document.getElementById('upgrade-menu').classList.add('hidden');
}

function updateUI() {
    document.getElementById('money-display').innerText = money + " $";
    document.getElementById('dist-display').innerText = Math.floor(distance) + " m";
    document.getElementById('p-plane').innerText = Math.floor(up_plane * 150) + "$";
    document.getElementById('p-power').innerText = Math.floor(up_power * 100) + "$";
}

gameLoop();
