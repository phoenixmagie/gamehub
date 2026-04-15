// ==========================================
// einstellung: speed
// ==========================================
const speed = 200; // millisekunden pro schritt

// --- 1. grund-setup (methoden müssen camelcase bleiben) ---
const canvas = document.getElementById("snakeCanvas");
const ctx = canvas.getContext("2d");
const scoredisplay = document.getElementById("currentScore");

const boxsize = 20; 
let score = 0;
let direction = "right"; 
let snake = [{ x: 9 * boxsize, y: 10 * boxsize }];
let apple = spawnapple();

// --- 2. steuerung ---
document.addEventListener("keydown", changedirection);

document.getElementById("btnup").onclick = () => setdir("up");
document.getElementById("btndown").onclick = () => setdir("down");
document.getElementById("btnleft").onclick = () => setdir("left");
document.getElementById("btnright").onclick = () => setdir("right");

function setdir(newdir) {
    if (newdir === "left" && direction !== "right") direction = "left";
    if (newdir === "up" && direction !== "down") direction = "up";
    if (newdir === "right" && direction !== "left") direction = "right";
    if (newdir === "down" && direction !== "up") direction = "down";
}

function changedirection(e) {
    const key = e.keyCode; // 'keyCode' muss so bleiben
    if (key == 37) setdir("left");
    if (key == 38) setdir("up");
    if (key == 39) setdir("right");
    if (key == 40) setdir("down");
}

// --- 3. spielfunktionen ---
function spawnapple() {
    return {
        x: Math.floor(Math.random() * 19 + 1) * boxsize,
        y: Math.floor(Math.random() * 19 + 1) * boxsize
    };
}

function savescore(points) {
    const data = JSON.parse(localStorage.getItem('myWebGames')) || {};
    const gameid = 'snake'; 

    if (!data[gameid] || points > data[gameid].highscore) {
        data[gameid] = { highscore: points };
        localStorage.setItem('myWebGames', JSON.stringify(data));
    }
}

// --- 4. haupt-update ---
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

    if (direction === "left") headx -= boxsize;
    if (direction === "up") heady -= boxsize;
    if (direction === "right") headx += boxsize;
    if (direction === "down") heady += boxsize;

    if (headx === apple.x && heady === apple.y) {
        score++;
        scoredisplay.innerText = score;
        apple = spawnapple();
    } else {
        snake.pop();
    }

    let newhead = { x: headx, y: heady };

    if (headx < 0 || headx >= canvas.width || heady < 0 || heady >= canvas.height) {
        clearInterval(gameloop);
        savescore(score);
        alert("spiel vorbei! score: " + score);
        location.reload();
    }

    snake.unshift(newhead);
}

// --- 5. start ---
const gameloop = setInterval(update, speed);
