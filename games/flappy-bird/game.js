// ==========================================
// einstellung: speed & physik
// ==========================================
const speed = 20;    // millisekunden pro frame
const gravity = 0.25; // schwerkraft
const jump = -4.5;   // sprungstärke

// --- 1. setup ---
const canvas = document.getElementById("birdCanvas");
const ctx = canvas.getContext("2d");
const scoredisplay = document.getElementById("currentScore");

let score = 0;
let birdy = 200;     // vogel höhe
let birdv = 0;       // vogel geschwindigkeit
let pipes = [];      // hindernis-liste
let gap = 130;       // lücke zwischen den röhren

// erste röhre erstellen
pipes[0] = { x: canvas.width, y: 50 };

// --- 2. steuerung ---
document.addEventListener("keydown", flap);
if(document.getElementById("btnJump")) document.getElementById("btnJump").onclick = flap;

function flap() {
    birdv = jump; // vogel bekommt schwung nach oben
}

// --- 3. spiellogik ---
function update() {
    // hintergrund (himmel)
    ctx.fillStyle = "#4ec0ca";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // vogel bewegen (physik)
    birdv += gravity;
    birdy += birdv;

    // vogel zeichnen
    ctx.fillStyle = "#ffcc00";
    ctx.fillRect(50, birdy, 25, 25);

    // hindernisse verarbeiten
    for (let i = 0; i < pipes.length; i++) {
        ctx.fillStyle = "#2ecc71"; // röhrenfarbe (grün)
        
        // obere röhre
        ctx.fillRect(pipes[i].x, 0, 50, pipes[i].y);
        // untere röhre
        ctx.fillRect(pipes[i].x, pipes[i].y + gap, 50, canvas.height);

        pipes[i].x -= 2; // röhre nach links schieben

        // neue röhre generieren
        if (pipes[i].x === 120) {
            pipes.push({
                x: canvas.width,
                y: Math.floor(Math.random() * (canvas.height - gap - 100)) + 50
            });
        }

        // kollisionsprüfung (röhren, boden oder decke)
        if (50 + 25 > pipes[i].x && 50 < pipes[i].x + 50 && 
           (birdy < pipes[i].y || birdy + 25 > pipes[i].y + gap) ||
            birdy + 25 > canvas.height || birdy < 0) {
            location.reload(); 
        }

        // punkte zählen
        if (pipes[i].x === 40) {
            score++;
            if(scoredisplay) scoredisplay.innerText = score;
        }
    }

    // alte röhren entfernen (performance)
    if (pipes.length > 5) pipes.shift();
}

// spiel starten
const gameloop = setInterval(update, speed);
