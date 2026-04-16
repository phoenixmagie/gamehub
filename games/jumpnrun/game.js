import { levels } from './level/levels.js';

let currentLvlIndex = 0;
let world = document.getElementById('world');
let player = document.getElementById('player');
let unlocked = parseInt(localStorage.getItem('jumper_unlocked')) || 1;

// Physik Variablen
let pX = 50, pY = 0, vX = 0, vY = 0;
let isGrounded = false;
const gravity = 0.8, speed = 5, jumpPower = -15;
let blocks = [];
let keys = {};

function initMenu() {
    const grid = document.getElementById('level-grid');
    grid.innerHTML = "";
    levels.forEach((lvl, i) => {
        const card = document.createElement('div');
        card.className = `level-card ${i + 1 > unlocked ? 'locked' : ''}`;
        card.innerText = i + 1;
        card.onclick = () => { if(i + 1 <= unlocked) startLevel(i); };
        grid.appendChild(card);
    });
}

async function startLevel(index) {
    currentLvlIndex = index;
    const levelData = await import(`./level/${levels[index]}.js`);
    const layout = levelData.layout;
    
    // Spielfeld leeren
    world.innerHTML = '<div id="player"></div>';
    player = document.getElementById('player');
    blocks = [];
    pX = 50; pY = 100; vX = 0; vY = 0;

    // Level aufbauen
    layout.forEach((row, y) => {
        row.split('').forEach((char, x) => {
            if (char === '#' || char === '-' || char === 'F') {
                const b = document.createElement('div');
                b.className = char === '#' ? 'block' : char === '-' ? 'block platform' : 'block flag';
                b.style.left = x * 40 + "px";
                b.style.top = y * 40 + "px";
                world.appendChild(b);
                blocks.push({ x: x * 40, y: y * 40, type: char });
            }
        });
    });

    document.getElementById('game-screen').classList.remove('hidden');
    document.getElementById('menu-container').classList.add('hidden');
    gameLoop();
}

function gameLoop() {
    if (document.getElementById('game-screen').classList.contains('hidden')) return;

    // Steuerung
    if (keys['ArrowRight'] || keys['btn-right']) vX = speed;
    else if (keys['ArrowLeft'] || keys['btn-left']) vX = -speed;
    else vX = 0;

    if ((keys['ArrowUp'] || keys['btn-jump'] || keys[' ']) && isGrounded) {
        vY = jumpPower;
        isGrounded = false;
    }

    // Gravitation
    vY += gravity;
    pX += vX;
    pY += vY;

    // Kollision & Kamera
    checkCollision();
    
    player.style.left = pX + "px";
    player.style.top = pY + "px";

    // Kamera folgt Spieler (Zentriert)
    let camX = -(pX - window.innerWidth / 2);
    world.style.transform = `translateX(${camX}px)`;

    requestAnimationFrame(gameLoop);
}

function checkCollision() {
    isGrounded = false;
    blocks.forEach(b => {
        // Einfache Box-Kollision
        if (pX < b.x + 40 && pX + 34 > b.x && pY < b.y + 40 && pY + 38 > b.y) {
            if (b.type === 'F') { // Ziel erreicht
                win();
            } else if (vY > 0 && pY + 30 < b.y) { // Von oben gelandet
                pY = b.y - 38;
                vY = 0;
                isGrounded = true;
            } else {
                pX -= vX; // Seitlich gegen Wand
            }
        }
    });
    if (pY > 1000) restartLevel(); // In Abgrund gefallen
}

function win() {
    unlocked = Math.max(unlocked, currentLvlIndex + 2);
    localStorage.setItem('jumper_unlocked', unlocked);
    if (currentLvlIndex + 1 < levels.length) startLevel(currentLvlIndex + 1);
    else exitToMenu();
}

// Global für Buttons
window.exitToMenu = () => {
    document.getElementById('game-screen').classList.add('hidden');
    document.getElementById('menu-container').classList.remove('hidden');
    initMenu();
};

window.restartLevel = () => startLevel(currentLvlIndex);

// Input Listener
const setKey = (k, v) => keys[k] = v;
window.onkeydown = (e) => setKey(e.key, true);
window.onkeyup = (e) => setKey(e.key, false);

// Touch Buttons
['btn-left', 'btn-right', 'btn-jump'].forEach(id => {
    const btn = document.getElementById(id);
    btn.onpointerdown = () => setKey(id, true);
    btn.onpointerup = () => setKey(id, false);
});

initMenu();
