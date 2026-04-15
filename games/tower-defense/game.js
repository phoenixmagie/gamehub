const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Spiel-Variablen
let money = 200;
let lives = 20;
let wave = 1;
let selectedTowerType = 'basic';

// Der Pfad (X, Y Punkte)
const path = [
    {x: -50, y: canvas.height/2},
    {x: canvas.width * 0.2, y: canvas.height/2},
    {x: canvas.width * 0.2, y: canvas.height * 0.2},
    {x: canvas.width * 0.6, y: canvas.height * 0.2},
    {x: canvas.width * 0.6, y: canvas.height * 0.8},
    {x: canvas.width + 50, y: canvas.height * 0.8}
];

let enemies = [];
let towers = [];
let projectiles = [];

class Enemy {
    constructor(hp) {
        this.x = path[0].x;
        this.y = path[0].y;
        this.hp = hp;
        this.maxHp = hp;
        this.speed = 2;
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
            if (this.pathIndex >= path.length - 1) {
                lives--;
                this.hp = 0; // Entfernen
                return;
            }
        }

        this.x += (dx/dist) * this.speed;
        this.y += (dy/dist) * this.speed;
    }

    draw() {
        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2);
        ctx.fill();
        // HP Bar
        ctx.fillStyle = 'black';
        ctx.fillRect(this.x - 15, this.y - 25, 30, 5);
        ctx.fillStyle = 'lime';
        ctx.fillRect(this.x - 15, this.y - 25, (this.hp/this.maxHp)*30, 5);
    }
}

class Tower {
    constructor(x, y, type) {
        this.x = x; this.y = y;
        this.range = type === 'sniper' ? 300 : 150;
        this.cooldown = 0;
        this.fireRate = type === 'sniper' ? 100 : 30;
        this.color = type === 'sniper' ? '#34495e' : '#f1c40f';
        this.cost = type === 'sniper' ? 100 : 50;
    }

    update() {
        if (this.cooldown > 0) this.cooldown--;
        if (this.cooldown === 0) {
            let target = enemies.find(e => {
                let d = Math.sqrt((e.x-this.x)**2 + (e.y-this.y)**2);
                return d < this.range;
            });
            if (target) {
                projectiles.push(new Projectile(this.x, this.y, target));
                this.cooldown = this.fireRate;
            }
        }
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - 20, this.y - 20, 40, 40);
        // Reichweite im Bau-Modus zeigen? (Optional)
    }
}

class Projectile {
    constructor(x, y, target) {
        this.x = x; this.y = y;
        this.target = target;
        this.speed = 7;
    }
    update() {
        let dx = this.target.x - this.x;
        let dy = this.target.y - this.y;
        let dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 10) {
            this.target.hp -= 20;
            this.x = -1000; // Zerstören
            return;
        }
        this.x += (dx/dist) * this.speed;
        this.y += (dy/dist) * this.speed;
    }
    draw() {
        ctx.fillStyle = 'yellow';
        ctx.beginPath(); ctx.arc(this.x, this.y, 5, 0, Math.PI*2); ctx.fill();
    }
}

// Interaktion
canvas.onclick = (e) => {
    let cost = selectedTowerType === 'sniper' ? 100 : 50;
    if (money >= cost) {
        towers.push(new Tower(e.clientX, e.clientY, selectedTowerType));
        money -= cost;
        updateUI();
    }
};

function selectTower(t) {
    selectedTowerType = t;
}

function updateUI() {
    document.getElementById('money').innerText = money;
    document.getElementById('lives').innerText = lives;
    document.getElementById('wave').innerText = wave;
}

function spawnWave() {
    if (enemies.length === 0) {
        wave++;
        for(let i=0; i < wave * 5; i++) {
            setTimeout(() => enemies.push(new Enemy(100 + wave*20)), i * 600);
        }
    }
}

function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Pfad zeichnen
    ctx.strokeStyle = '#555'; ctx.lineWidth = 40; ctx.beginPath();
    path.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
    ctx.stroke();

    enemies.forEach((e, i) => {
        e.update(); e.draw();
        if (e.hp <= 0) { enemies.splice(i, 1); money += 10; updateUI(); }
    });

    towers.forEach(t => { t.update(); t.draw(); });
    projectiles.forEach((p, i) => { 
        p.update(); p.draw();
        if(p.x < 0) projectiles.splice(i, 1);
    });

    if (lives <= 0) {
        alert("Game Over!");
        location.reload();
    }

    spawnWave();
    requestAnimationFrame(loop);
}

updateUI();
loop();
