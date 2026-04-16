import { levels } from './level/levels.js';

let currentLvlIndex = 0;
let unlocked = parseInt(localStorage.getItem('jumper_unlocked')) || 1;

const world = document.getElementById('world');
const player = document.getElementById('player');
const gameScreen = document.getElementById('game-screen');
const menuContainer = document.getElementById('menu-container');

// Physik-Setup
let pX = 0, pY = 0, vX = 0, vY = 0;
let isGrounded = false;
let blocks = [];
const config = { gravity: 0.8, speed: 6, jump: -16, tileSize: 40 };
const keys = {};

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
    
    // Reset
    world.innerHTML = '<div id="player"></div>';
    blocks = [];
    vX = 0; vY = 0;
    document.getElementById('level-display').innerText = `Level ${index + 1}`;

    // Map bauen
    layout.forEach((row, y) => {
        row.split('').forEach((char, x) => {
            let bX = x * config.tileSize;
            let bY = y * config.tileSize;

            if (char === 'S') { // Spawn
                pX = bX; pY = bY;
            } else if (char === '#' || char === '-' || char === 'F') {
                const el = document.createElement('div');
                el.className = 'block' + (char === '-' ? ' platform' : char === 'F' ? ' flag' : '');
                el.style.left = bX + "px";
                el.style.top = bY + "px";
                world.appendChild(el);
                blocks.push({ x: bX, y: bY, w: config.tileSize, h: config.tileSize, type: char });
            }
        });
    });

    menuContainer.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    requestAnimationFrame(update);
}

function update() {
    if (gameScreen.classList.contains('hidden')) return;

    // Input
    if (keys['ArrowRight'] || keys['btn-right'] || keys['d']) vX = config.speed;
    else if (keys['ArrowLeft'] || keys['btn-left'] || keys['a']) vX = -config.speed;
    else vX = 0;

    if ((keys['ArrowUp'] || keys['btn-jump'] || keys['w'] || keys[' ']) && isGrounded) {
        vY = config.jump;
        isGrounded = false;
    }

    vY += config.gravity;
    pX += vX;
    pY += vY;

    // Kollisions-Logik
    isGrounded = false;
    for (let b of blocks) {
        if (pX < b.x + b.w && pX + 32 > b.x && pY < b.y + b.h && pY + 38 > b.y) {
            if (b.type === 'F') { win(); return; }
            
            // Kollision von oben
            if (vY > 0 && pY + 20 < b.y) {
                pY = b.y - 38;
                vY = 0;
                isGrounded = true;
            } 
            // Kollision von unten
            else if (vY < 0 && pY > b.y + 10) {
                pY = b.y + b.h;
                vY = 0;
            }
            // Seitliche Wand
            else {
                pX -= vX;
            }
        }
    }

    // Player & Kamera positionieren
    const playerEl = document.getElementById('player');
    playerEl.style.left = pX + "px";
    playerEl.style.top = pY + "px";

    // Kamera folgt Spieler (horizontal)
    let scrollX = -(pX - window.innerWidth / 2);
    world.style.transform = `translateX(${scrollX}px)`;

    if (pY > window.innerHeight + 500) restart(); // Runtergefallen
    
    requestAnimationFrame(update);
}

function win() {
    unlocked = Math.max(unlocked, currentLvlIndex + 2);
    localStorage.setItem('jumper_unlocked', unlocked);
    if (currentLvlIndex + 1 < levels.length) startLevel(currentLvlIndex + 1);
    else exitToMenu();
}

function restart() {
    vX = 0; vY = 0;
    startLevel(currentLvlIndex);
}

window.exitToMenu = () => {
    gameScreen.classList.add('hidden');
    menuContainer.classList.remove('hidden');
    initMenu();
};

// Controls
const handler = (k, v) => keys[k] = v;
window.onkeydown = (e) => handler(e.key, true);
window.onkeyup = (e) => handler(e.key, false);

['btn-left', 'btn-right', 'btn-jump'].forEach(id => {
    const el = document.getElementById(id);
    el.onpointerdown = (e) => { e.preventDefault(); handler(id, true); };
    el.onpointerup = (e) => { e.preventDefault(); handler(id, false); };
});

initMenu();
