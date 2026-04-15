const speed = 20;    
const gravity = 0.25; 
const jump = -4.5;   

const canvas = document.getElementById("birdCanvas");
const ctx = canvas.getContext("2d");
const scoredisplay = document.getElementById("currentScore");
const restartMenu = document.getElementById("restartMenu");
const btnRestart = document.getElementById("btnRestart");

let score, birdy, birdv, pipes, gameloop, isGameOver;
const gap = 130;

function init() {
    score = 0;
    birdy = 200;
    birdv = 0;
    pipes = [{ x: canvas.width, y: 100 }];
    isGameOver = false;
    scoredisplay.innerText = "0";
    restartMenu.style.display = "none";
    
    if (gameloop) clearInterval(gameloop);
    gameloop = setInterval(update, speed);
}

document.addEventListener("keydown", (e) => {
    if ((e.code === "Space" || e.keyCode === 32) && !isGameOver) flap();
});

document.getElementById("btnJump").onclick = () => { if(!isGameOver) flap(); };
btnRestart.onclick = init;

function flap() { birdv = jump; }

function savescore(points) {
    const data = JSON.parse(localStorage.getItem('myWebGames')) || {};
    if (!data['flappybird'] || points > data['flappybird'].highscore) {
        data['flappybird'] = { highscore: points };
        localStorage.setItem('myWebGames', JSON.stringify(data));
    }
}

function update() {
    ctx.fillStyle = "#4ec0ca";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    birdv += gravity;
    birdy += birdv;

    ctx.fillStyle = "#ffcc00";
    ctx.fillRect(50, birdy, 25, 25);

    for (let i = 0; i < pipes.length; i++) {
        ctx.fillStyle = "#2ecc71";
        ctx.fillRect(pipes[i].x, 0, 50, pipes[i].y);
        ctx.fillRect(pipes[i].x, pipes[i].y + gap, 50, canvas.height);

        pipes[i].x -= 2;

        if (pipes[i].x === 120) {
            pipes.push({
                x: canvas.width,
                y: Math.floor(Math.random() * (canvas.height - gap - 100)) + 50
            });
        }

        if (
            (50 + 25 > pipes[i].x && 50 < pipes[i].x + 50 && 
            (birdy < pipes[i].y || birdy + 25 > pipes[i].y + gap)) ||
            birdy + 25 > canvas.height || birdy < 0
        ) {
            gameOver();
            return;
        }

        if (pipes[i].x === 40) {
            score++;
            scoredisplay.innerText = score;
        }
    }
    if (pipes.length > 5) pipes.shift();
}

function gameOver() {
    isGameOver = true;
    clearInterval(gameloop);
    savescore(score);
    restartMenu.style.display = "block";
}

init();
