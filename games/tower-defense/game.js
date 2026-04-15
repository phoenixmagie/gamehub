const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Stats & State
let money = 200;
let lives = 20;
let wave = 0;
let selectedTowerType = 'basic';
let isGameOver = false;

// Listen für Objekte
let enemies = [];
let towers = [];
let projectiles = [];

// Der Pfad für die Gegner
const path = [
    {x: -50, y: canvas.height/2},
    {x: canvas.width * 0.2, y: canvas.height/2},
    {x: canvas.width * 0.2, y: canvas.height * 0.2},
    {x: canvas.width * 0.6, y: canvas.height * 0.2},
    {x: canvas.width * 0.6, y: canvas.height * 0.8},
    {x: canvas.width + 50, y: canvas.height * 0.8}
];

// KLASSEN
class Enemy {
    constructor(hp) {
        this.x = path[0].x; this.y = path[0].y;
        this.hp = hp; this.maxHp = hp;
        this.speed = 1.5 + (wave * 0.1);
        this.pathIndex = 0;
        this.radius = 15;
    }
    update() {
        let target = path[this.pathIndex + 1];
        let dx = target.x - this.x;
        let dy = target.y - this.y;
        let dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 5) {
            this.pathIndex++;
            if (this.pathIndex >= path.length - 1) { lives--; this.hp = 0; return; }
        }
        this.x += (dx/dist) * this.speed;
        this.y += (dy/dist) * this.speed;
    }
    draw() {
        ctx.fillStyle = '#e74c3c';
        ctx.beginPath(); ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = 'black'; ctx.fillRect(this.x - 15, this.y - 25, 30, 5);
        ctx.fillStyle = '#2ecc71'; ctx.fillRect(this.x - 15, this.y - 25, (this.hp/this.maxHp)*30, 5);
    }
}

class Tower {
    constructor(x, y, type) {
        this.x = x; this.y = y;
        this.type = type;
        this.range = type === 'sniper' ? 350 : 180;
        this.cooldown = 0;
        this.fireRate = type === 'sniper' ? 80 : 35;
        this.color = type === 'sniper' ? '#2c3e50' : '#f1c40f';
    }
    update() {
        if (this.cooldown > 0) this.cooldown--;
        if (this.cooldown === 0) {
            let target = enemies.find(e => Math.sqrt((e.x-this.x)**2 + (e.y-this.y)**2) < this.range);
            if (target) {
                projectiles.push(new Projectile(this.x, this.y, target, this.type));
                this.cooldown = this.fireRate;
            }
        }
    }
    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - 20, this.y - 20, 40, 40);
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.beginPath(); ctx.arc(this.x, this.y, this.range, 0, Math.PI*2); ctx.stroke();
    }
}

class Projectile {
    constructor(x, y, target, type) {
        this.x = x; this.y = y; this.target = target;
        this.speed = 8;
        this.damage = type === 'sniper' ? 50 : 20;
    }
    update() {
        let dx = this.target.x - this.x;
        let dy = this.target.y - this.y;
        let dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 10) { this.target.hp -= this.damage; this.x = -5000; return; }
        this.x += (dx/dist) * this.speed;
        this.y += (dy/dist) * this.speed;
    }
    draw() {
        ctx.fillStyle = '#f39c12';
        ctx.beginPath(); ctx.arc(this.x, this.y, 5, 0, Math.PI*2); ctx.fill();
    }
}

// SPIEL LOGIK
function selectTower(t) {
    selectedTowerType = t;
    document.querySelectorAll('.tower-btn').forEach(b => b.classList.remove('selected'));
    document.getElementById('btn-' + t).classList.add('selected');
}

canvas.onclick = (e) => {
    if (isGameOver) return;
    let cost = selectedTowerType === 'sniper' ? 100 : 50;
    if (money >= cost) {
        towers.push(new Tower(e.clientX, e.clientY, selectedTowerType));
        money -= cost;
        updateUI();
    }
};

function spawnWave() {
    if (enemies.length === 0 && !isGameOver) {
        wave++;
        updateUI();
        for(let i=0; i < wave * 5; i++) {
            setTimeout(() => { if(!isGameOver) enemies.push(new Enemy(80 + wave * 30)) }, i * 700);
        }
    }
}

function updateUI() {
    document.getElementById('money').innerText = money;
    document.getElementById('lives').innerText = lives;
    document.getElementById('wave').innerText = wave;
}

function loop() {
    if (isGameOver) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Pfad zeichnen
    ctx.strokeStyle = '#3e7d37'; ctx.lineWidth = 45; ctx.beginPath();
    path.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)); ctx.stroke();
    ctx.strokeStyle = '#555'; ctx.lineWidth = 35; ctx.stroke();

    enemies.forEach((e, i) => {
        e.update(); e.draw();
        if (e.hp <= 0) { enemies.splice(i, 1); money += 15; updateUI(); }
    });

    towers.forEach(t => { t.update(); t.draw(); });
    projectiles.forEach((p, i) => { 
        p.update(); p.draw();
        if(p.x < -1000) projectiles.splice(i, 1);
    });

    if (lives <= 0) { finish(); }

    spawnWave();
    requestAnimationFrame(loop);
}

function finish() {
    isGameOver = true;
    const saved = JSON.parse(localStorage.getItem('myWebGames')) || {};
    let high = saved['tower-defense'] ? saved['tower-defense'].highscore : 0;
    if (wave - 1 > high) high = wave - 1;

    document.getElementById('final-wave').innerText = wave - 1;
    document.getElementById('high-score').innerText = high;
    document.getElementById('game-over-screen').classList.remove('hidden');

    // Speichern im Hub-Format
    saved['tower-defense'] = { highscore: high };
    localStorage.setItem('myWebGames', JSON.stringify(saved));
}

function restartGame() {
    money = 200; lives = 20; wave = 0;
    enemies = []; towers = []; projectiles = [];
    isGameOver = false;
    document.getElementById('game-over-screen').classList.add('hidden');
    updateUI();
    loop();
}

// Start
selectTower('basic');
updateUI();
loop();
