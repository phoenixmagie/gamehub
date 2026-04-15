// ==========================================
// einstellung: speed
// ==========================================
const speed = 200; 

// --- 1. grund-setup ---
// diese namen in den anführungszeichen müssen exakt wie in deinem html sein!
const canvas = document.getElementById("snakeCanvas"); 
const ctx = canvas.getContext("2d");
const scoredisplay = document.getElementById("currentScore");

const boxsize = 20; 
let score = 0;
let direction = "RIGHT"; // richtungen intern oft groß, damit es eindeutig ist
let snake = [{ x: 9 * boxsize, y: 10 * boxsize }];

// funktion muss definiert sein, bevor sie aufgerufen wird
function spawnapple() {
    return {
        x: Math.floor(Math.random() * 19 + 1) * boxsize,
        y: Math.floor(Math.random() * 19 + 1) * boxsize
    };
}
let apple = spawnapple();

// --- 2. steuerung ---
document.addEventListener("keydown", changedirection);

// prüfung, ob die buttons im html existieren
if(document.getElementById("btnUp")) document.getElementById("btnUp").onclick = () => setdir("UP");
if(document.getElementById("btnDown")) document.getElementById("btnDown").onclick = () => setdir("DOWN");
if(document.getElementById("btnLeft")) document.getElementById("btnLeft").onclick = () => setdir("LEFT");
if(document.getElementById("btnRight")) document.getElementById("btnRight").onclick = () => setdir("RIGHT");

function setdir(newdir) {
    if (newdir === "LEFT" && direction !== "RIGHT") direction = "LEFT";
    if (newdir === "UP" && direction !== "DOWN") direction = "UP";
    if (newdir === "RIGHT" && direction !== "LEFT") direction = "RIGHT";
    if (newdir === "DOWN" && direction !== "UP") direction = "DOWN";
}

function changedirection(e) {
    const key = e.keyCode;
    if (key == 37) setdir("LEFT");
    if (key == 38) setdir("UP");
    if (key == 39) setdir("RIGHT");
    if (key == 40) setdir("DOWN");
}

// --- 3. highscore ---
function savescore(points) {
    const data = JSON.parse(localStorage.getItem('myWebGames')) || {};
    const gameid = 'snake'; 
    if (!data[gameid] || points > data[gameid].highscore) {
        data[gameid] = { highscore: points };
        localStorage.setItem('myWebGames', JSON.stringify(data));
    }
}

// --- 4. haupt-loop ---
function update() {
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    snake.forEach((segment, index) => {
        ctx.fillStyle = (index === 0) ? "#e60000" : "#800000";
        ctx.fillRect(segment.x, segment.y, boxsize, boxsize);
        ctx.strokeStyle = "#1a1a1a";
        ctx.strokeRect(segment.x, segment.y, boxsize, boxsize);
    });

    ctx.fillStyle = "#ffcc00";
    ctx.fillRect(apple.x, apple.y, boxsize, boxsize);

    let headx = snake[0].x;
    let heady = snake[0].y;

    if (direction === "LEFT") headx -= boxsize;
    if (direction === "UP") heady -= boxsize;
    if (direction === "RIGHT") headx += boxsize;
    if (direction === "DOWN") heady += boxsize;

    if (headx === apple.x && heady === apple.y) {
        score++;
        if(scoredisplay) scoredisplay.innerText = score;
        apple = spawnapple();
    } else {
        snake.pop();
    }

    let newhead = { x: headx, y: heady };

    // wand-kollision
    if (headx < 0 || headx >= canvas.width || heady < 0 || heady >= canvas.height) {
        clearInterval(gameloop);
        savescore(score);
        alert("spiel vorbei! score: " + score);
        location.reload();
    }

    snake.unshift(newhead);
}

const gameloop = setInterval(update, speed);
