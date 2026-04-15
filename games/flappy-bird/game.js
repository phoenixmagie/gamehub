// ==========================================
// Einstellung: Speed & Physik
// ==========================================
const speed = 20;    
const gravity = 0.25; 
const jump = -4.5;   

// --- 1. Setup ---
const canvas = document.getElementById("birdCanvas");
const ctx = canvas.getContext("2d");
const scoredisplay = document.getElementById("currentScore");

let score = 0;
let birdy = 200;     
let birdv = 0;       
let pipes = [];      
let gap = 130;       

pipes[0] = { x: canvas.width, y: 100 };

// --- 2. Steuerung ---
document.addEventListener("keydown", (e) => {
    if (e.code === "Space" || e.keyCode === 32 || e.keyCode === 38) flap();
});

if (document.getElementById("btnJump")) {
    document.getElementById("btnJump").onclick = flap;
}

function flap() {
    birdv = jump; 
}

// --- 3. Highscore speichern ---
function savescore(points) {
    const data = JSON.parse(localStorage.getItem('myWebGames')) || {};
    const gameid = 'flappybird'; 

    if (!data[gameid] || points > data[gameid].highscore) {
        data[gameid] = { highscore: points };
        localStorage.setItem('myWebGames', JSON.stringify(data));
    }
}

// --- 4. Haupt-Loop ---
function update() {
    // Hintergrund
    ctx.fillStyle = "#4ec0ca";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Vogel-Physik
    birdv += gravity;
    birdy += birdv;

    // Vogel zeichnen
    ctx.fillStyle = "#ffcc00";
    ctx.fillRect(50, birdy, 25, 25);

    for (let i = 0; i < pipes.length; i++) {
        ctx.fillStyle = "#2ecc71";
        
        // Röhren zeichnen
        ctx.fillRect(pipes[i].x, 0, 50, pipes[i].y);
        ctx.fillRect(pipes[i].x, pipes[i].y + gap, 50, canvas.height);

        pipes[i].x -= 2;

        if (pipes[i].x === 120) {
            pipes.push({
                x: canvas.width,
                y: Math.floor(Math.random() * (canvas.height - gap - 100)) + 50
            });
        }

        // --- STRENGE KOLLISIONSPRÜFUNG ---
        let birdRight = 50 + 25;
        let birdLeft = 50;
        let birdBottom = birdy + 25;
        let birdTop = birdy;
        
        let pipeRight = pipes[i].x + 50;
        let pipeLeft = pipes[i].x;
        let upperPipeBottom = pipes[i].y;
        let lowerPipeTop = pipes[i].y + gap;

        // Prüfung: Ist der Vogel horizontal auf Höhe der Röhre?
        if (birdRight > pipeLeft && birdLeft < pipeRight) {
            // Berührt er die obere oder die untere Röhre?
            if (birdTop < upperPipeBottom || birdBottom > lowerPipeTop) {
                endGame();
                return;
            }
        }

        // Prüfung: Boden oder Decke berührt?
        if (birdBottom >= canvas.height || birdTop <= 0) {
            endGame();
            return;
        }

        // Punkte zählen
        if (pipes[i].x === 40) {
            score++;
            if (scoredisplay) scoredisplay.innerText = score;
        }
    }

    if (pipes.length > 5) pipes.shift();
}

function endGame() {
    clearInterval(gameloop);
    savescore(score);
    alert("Spiel vorbei! Dein Score: " + score);
    location.reload();
}

const gameloop = setInterval(update, speed);
