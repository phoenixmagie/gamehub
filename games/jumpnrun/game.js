import { levels } from './level/levels.js';

// Status-Variablen
let currentLvlIndex = 0;
let unlocked = parseInt(localStorage.getItem('jumper_unlocked')) || 1;
let coins = 0;
let playerLives = 3;
let activeCheckpoint = null;
let spawnPoint = { x: 50, y: 50 };
let animationId;

const world = document.getElementById('world');
const gameScreen = document.getElementById('game-screen');
const menuContainer = document.getElementById('menu-container');
const keys = {};
let blocks = [];
let enemies = [];
const config = { gravity: 0.8, speed: 6, jump: -15, tileSize: 40 };

// Physik
let pX, pY, vX, vY, isGrounded;

function initMenu() {
    const grid = document.getElementById('level-grid');
    grid.innerHTML = "";
    levels.forEach((_, i) => {
        const card = document.createElement('div');
        card.className = `level-card ${i + 1 > unlocked ? 'locked' : 'unlocked'}`;
        card.innerText = i + 1;
        card.onclick = () => { if(i + 1 <= unlocked) startLevel(i, true); };
        grid.appendChild(card);
    });
}

class Enemy {
    constructor(x, y, el) {
        this.x = x; this.y = y; this.el = el;
        this.dir = 1; this.speed = 2;
    }
    update() {
        this.x += this.dir * this.speed;
        for (let b of blocks) {
            // Wendet bei Block (#), Plattform (-) oder Wendepunkt (X)
            if ((b.type === 'X' || b.type === '#' || b.type === '-') && 
                this.x < b.x + 35 && this.x + 34 > b.x && this.y === b.y) {
                this.dir *= -1;
                this.x += this.dir * 5;
                break;
            }
        }
        this.el.style.left = this.x + "px";
        this.el.style.top = this.y + "px";
    }
}

async function startLevel(index, isNewLevel = false) {
    if (animationId) cancelAnimationFrame(animationId);
    currentLvlIndex = index;
    
    if (isNewLevel) {
        playerLives = 3;
        activeCheckpoint = null;
        coins = 0;
    }

    updateUI();
    document.getElementById('level-display').innerText = `Level ${index + 1}`;
    
    const levelData = await import(`./level/${levels[index]}.js`);
    world.innerHTML = '<div id="player"></div>';
    blocks = [];
    enemies = [];

    levelData.layout.forEach((row, y) => {
        row.split('').forEach((char, x) => {
            const bX = x * config.tileSize;
            const bY = y * config.tileSize;
            if (char === 'S') spawnPoint = { x: bX, y: bY };
            else if (char !== ' ') {
                const el = document.createElement('div');
                el.style.left = bX + "px"; el.style.top = bY + "px";
                if (char === '#') el.className = 'block';
                if (char === '-') el.className = 'block platform';
                if (char === 'C') el.className = 'coin';
                if (char === 'F') el.className = 'block flag';
                if (char === 'P') el.className = 'checkpoint';
                if (char === 'X') el.className = 'boundary';
                if (char === 'E') {
                    el.className = 'enemy';
                    enemies.push(new Enemy(bX, bY, el));
                }
                world.appendChild(el);
                if (char !== 'E') blocks.push({ x: bX, y: bY, w: 40, h: 40, type: char, el: el });
            }
        });
    });

    let start = activeCheckpoint || spawnPoint;
    pX = start.x; pY = start.y;
    vX = 0; vY = 0; isGrounded = false;

    menuContainer.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    loop();
}

function loop() {
    // Input Handling
    if (keys['ArrowRight'] || keys['btn-right'] || keys['d']) vX = config.speed;
    else if (keys['ArrowLeft'] || keys['btn-left'] || keys['a']) vX = -config.speed;
    else vX = 0;

    if ((keys['ArrowUp'] || keys['btn-jump'] || keys['w'] || keys[' ']) && isGrounded) { vY = config.jump; isGrounded = false; }

    vY += config.gravity; pX += vX; pY += vY;
    isGrounded = false;

    // Block-Kollision
    for (let i = blocks.length - 1; i >= 0; i--) {
        let b = blocks[i];
        if (pX < b.x + b.w && pX + 32 > b.x && pY < b.y + b.h && pY + 38 > b.y) {
            if (b.type === 'C') { coins++; updateUI(); b.el.remove(); blocks.splice(i, 1); continue; }
            if (b.type === 'F') { win(); return; }
            if (b.type === 'P') {
                if (!activeCheckpoint || activeCheckpoint.x !== b.x) {
                    activeCheckpoint = { x: b.x, y: b.y }; b.el.classList.add('active');
                }
                continue;
            }
            if (b.type === 'X') continue;
            
            // Oben landen
            if (vY > 0 && pY + 20 < b.y) { pY = b.y - 38; vY = 0; isGrounded = true; }
            // Kopf stoßen
            else if (vY < 0 && pY > b.y + 10) { pY = b.y + b.h; vY = 0; }
            // Wand
            else { pX -= vX; }
        }
    }

    // Gegner-Kollision
    for (let i = enemies.length - 1; i >= 0; i--) {
        let e = enemies[i];
        e.update();
        if (pX < e.x + 34 && pX + 32 > e.x && pY < e.y + 34 && pY + 38 > e.y) {
            if (vY > 0 && pY + 10 < e.y) { // Auf Kopf gesprungen
                e.el.remove(); enemies.splice(i, 1); vY = config.jump / 1.5; 
            } else { die(); return; }
        }
    }

    const p = document.getElementById('player');
    if (p) {
        p.style.left = pX + "px"; p.style.top = pY + "px";
    }
    world.style.transform = `translateX(${-pX + window.innerWidth/2}px)`;

    if (pY > 1500) { die(); return; }
    animationId = requestAnimationFrame(loop);
}

function die() {
    cancelAnimationFrame(animationId);
    playerLives--;
    if (playerLives <= 0) exitToMenu();
    else startLevel(currentLvlIndex, false);
}

function win() {
    cancelAnimationFrame(animationId);
    unlocked = Math.max(unlocked, currentLvlIndex + 2);
    localStorage.setItem('jumper_unlocked', unlocked);
    if (currentLvlIndex + 1 < levels.length) startLevel(currentLvlIndex + 1, true);
    else document.getElementById('win-screen').classList.remove('hidden');
}

function updateUI() {
    const container = document.getElementById('lives-container');
    container.innerHTML = "";
    for(let i=0; i<playerLives; i++) {
        const h = document.createElement('div'); h.className = 'heart'; container.appendChild(h);
    }
    document.getElementById('coin-count').innerText = coins;
}

window.exitToMenu = () => {
    cancelAnimationFrame(animationId);
    gameScreen.classList.add('hidden');
    menuContainer.classList.remove('hidden');
    initMenu();
};

// Input
const handler = (k, v) => keys[k] = v;
window.onkeydown = (e) => handler(e.key, true);
window.onkeyup = (e) => handler(e.key, false);
['btn-left', 'btn-right', 'btn-jump'].forEach(id => {
    const el = document.getElementById(id);
    el.onpointerdown = (e) => { e.preventDefault(); handler(id, true); };
    el.onpointerup = (e) => { e.preventDefault(); handler(id, false); };
});

initMenu();
