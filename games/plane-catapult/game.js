let money = 0; let distance = 0;
let up_plane = 1, up_power = 1, up_money = 1;
let gameState = 'slingshot';
let posX = 0, posY = 200, sideX = 0, velX = 0, velY = 0;
let isDragging = false, startX, startY;

const plane = document.getElementById('plane');
const planeCont = document.getElementById('plane-container');
const world = document.getElementById('world');
const distIcon = document.getElementById('dist-plane-icon');

function gameLoop() {
    if (gameState === 'flying') {
        velY -= 0.15; // Schwerkraft
        velX += 0.05 * (up_plane / 4); // Upgrade Speed
        
        posY += velY;
        distance += velX;

        // Visuals: Flugzeug neigen
        planeCont.style.bottom = posY + "px";
        planeCont.style.left = `calc(50% + ${sideX}px)`;
        planeCont.style.transform = `rotateX(${-velY * 3}deg) rotateZ(${sideX / 10}deg)`;
        
        // Welt bewegen
        world.style.backgroundPositionY = (distance * 10) + "px";
        world.style.left = `calc(-100vw - ${sideX}px)`;

        // Distanz-Meter (Flugzeug wandert nach oben)
        let progress = Math.min(200, (distance / 1000) * 200);
        distIcon.style.transform = `translateY(${-progress}px)`;

        if (posY < 50) finish();
    }
    updateUI();
    requestAnimationFrame(gameLoop);
}

// Slingshot Steuerung
window.onpointerdown = (e) => {
    if (gameState !== 'slingshot') return;
    isDragging = true; startX = e.clientX; startY = e.clientY;
};

window.onpointermove = (e) => {
    if (isDragging) {
        let dx = startX - e.clientX;
        let dy = startY - e.clientY;
        planeCont.style.transform = `translate(${-dx/4}px, ${dy/4}px) rotate(${dx/10}deg)`;
    }
    if (gameState === 'flying') {
        sideX = (e.clientX - window.innerWidth/2) * 1.5;
    }
};

window.onpointerup = (e) => {
    if (!isDragging) return;
    isDragging = false;
    velX = Math.abs(startX - e.clientX) / 7 * up_power;
    velY = (startY - e.clientY) / 4 * up_power;
    if (velX > 1) gameState = 'flying';
};

function buyUpgrade(type) {
    let cost = type === 'plane' ? up_plane * 100 : type === 'power' ? up_power * 100 : up_money * 100;
    if (money >= cost) {
        money -= cost;
        if (type === 'plane') up_plane++;
        if (type === 'power') up_power += 0.3;
        if (type === 'money') up_money += 0.5;
        updateEvolution();
    }
}

function updateEvolution() {
    plane.className = "";
    if (up_plane >= 20) plane.classList.add('lvl-20');
    else if (up_plane >= 10) plane.classList.add('lvl-10');
    else if (up_plane >= 5) plane.classList.add('lvl-5');
    
    document.getElementById('lvl-plane').innerText = Math.floor(up_plane);
    document.getElementById('lvl-power').innerText = Math.floor(up_power);
    document.getElementById('lvl-money').innerText = Math.floor(up_money);
}

function finish() {
    gameState = 'landed';
    money += Math.floor(distance * up_money);
    document.getElementById('upgrade-menu').classList.remove('hidden');
}

function resetFlight() {
    gameState = 'slingshot'; distance = 0; posY = 200; sideX = 0; velX = 0; velY = 0;
    document.getElementById('upgrade-menu').classList.add('hidden');
    distIcon.style.transform = `translateY(0)`;
}

function updateUI() {
    document.getElementById('money-display').innerText = Math.floor(money);
    document.getElementById('dist-display').innerText = Math.floor(distance) + "m";
    document.getElementById('p-plane').innerText = Math.floor(up_plane * 100);
    document.getElementById('p-power').innerText = Math.floor(up_power * 100);
    document.getElementById('p-mon').innerText = Math.floor(up_money * 100);
}

gameLoop();
