// ==========================================
// einstellung: speed & schwerkraft
// ==========================================
const speed = 20;    // millisekunden pro frame (je niedriger, desto flüssiger)
const gravity = 0.25; // wie schnell der vogel fällt
const jump = -4.5;   // wie hoch der vogel springt

// --- 1. setup ---
const canvas = document.getElementById("birdCanvas");
const ctx = canvas.getContext("2d");
const scoredisplay = document.getElementById("currentScore");

let score = 0;
let birdy = 200;     // y-position des vogels
let birdv = 0;       // geschwindigkeit (velocity) des vogels
let pipes = [];      // array für die hindernisse
let gap = 120;       // lücke zwischen den röhren

// das erste hindernis erstellen
pipes[0] = { x: canvas.width, y: 0 };

// --- 2. steuerung ---
document.addEventListener("keydown", flap);
if(document.getElementById("btnJump")) document.getElementById("btnJump").onclick = flap;

function flap() {
    birdv = jump; // setzt die geschwindigkeit auf einen negativen wert -> vogel steigt
}

// --- 3. haupt-loop ---
function update() {
    // hintergrund zeichnen
    ctx.fillStyle = "#4ec0ca";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // vogel bewegen & zeichnen
    birdv += gravity;
    birdy += birdv;
    ctx.fillStyle = "#ffcc00"; // gelber vogel
    ctx.fillRect(50, birdy, 25, 25);

    // röhren (hindernisse) verarbeiten
    for (let i = 0; i < pipes.length; i++) {
        ctx.fillStyle = "#2ecc71"; // grüne röhren
        
        // obere röhre
        ctx.fillRect(pipes[i].x, 0, 50, pipes[i].y);
        // untere röhre
        ctx.fillRect(pipes[i].x, pipes[i].y + gap, 50, canvas.height);

        pipes[i].x -= 2; // röhren nach links bewegen

        // neue röhre erstellen, wenn die alte weit genug weg ist
        if (pipes[i].x === 120) {
            pipes.push({
                x: canvas.width,
                y: Math.floor(Math.random() * (canvas.height - gap - 100)) + 50
            });
        }

        // kollision prüfen
        if (50 + 25 > pipes[i].x && 50 < pipes[i].x + 50 && 
           (birdy < pipes[i].y || birdy + 25 > pipes[i].y + gap) ||
            birdy + 25 > canvas.height || birdy < 0) {
            location.reload(); // neustart bei fehler
        }

        // punkte zählen
        if (pipes[i].x === 40) {
            score++;
            if(scoredisplay) scoredisplay.innerText = score;
        }
    }

    // alte röhren aus dem speicher löschen
    if (pipes.length > 5) pipes.shift();
}

const gameloop = setInterval(update, speed);
