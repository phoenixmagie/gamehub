const canvas = document.getElementById("snakeCanvas");
const ctx = canvas.getContext("2d");
const scoreDisplay = document.getElementById("currentScore");

const boxSize = 20;
let score = 0;
let direction = "RIGHT";
let snake = [{ x: 9 * boxSize, y: 10 * boxSize }];
let apple = spawnApple();

// Steuerung (Tastatur & Buttons)
document.addEventListener("keydown", changeDirection);
document.getElementById("btnUp").onclick = () => setDir("UP");
document.getElementById("btnDown").onclick = () => setDir("DOWN");
document.getElementById("btnLeft").onclick = () => setDir("LEFT");
document.getElementById("btnRight").onclick = () => setDir("RIGHT");

function setDir(newDir) {
    if (newDir === "LEFT" && direction !== "RIGHT") direction = "LEFT";
    if (newDir === "UP" && direction !== "DOWN") direction = "UP";
    if (newDir === "RIGHT" && direction !== "LEFT") direction = "RIGHT";
    if (newDir === "DOWN" && direction !== "UP") direction = "DOWN";
}

function changeDirection(e) {
    const key = e.keyCode;
    if (key == 37) setDir("LEFT");
    if (key == 38) setDir("UP");
    if (key == 39) setDir("RIGHT");
    if (key == 40) setDir("DOWN");
}

function spawnApple() {
    return {
        x: Math.floor(Math.random() * 19 + 1) * boxSize,
        y: Math.floor(Math.random() * 19 + 1) * boxSize
    };
}

function saveScore(points) {
    const data = JSON.parse(localStorage.getItem('myWebGames')) || {};
    // ID 'snake_01' muss mit der ID in deiner games.js übereinstimmen
    const gameId = 'snake_01'; 
    
    if (!data[gameId] || points > data[gameId].highscore) {
        data[gameId] = { highscore: points };
        localStorage.setItem('myWebGames', JSON.stringify(data));
    }
}

function update() {
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Schlange malen
    snake.forEach((segment, index) => {
        ctx.fillStyle = (index === 0) ? "#e60000" : "#800000";
        ctx.fillRect(segment.x, segment.y, boxSize, boxSize);
        ctx.strokeStyle = "#1a1a1a";
        ctx.strokeRect(segment.x, segment.y, boxSize, boxSize);
    });

    // Apfel malen
    ctx.fillStyle = "#ffcc00";
    ctx.fillRect(apple.x, apple.y, boxSize, boxSize);

    let headX = snake[0].x;
    let headY = snake[0].y;

    if (direction === "LEFT") headX -= boxSize;
    if (direction === "UP") headY -= boxSize;
    if (direction === "RIGHT") headX += boxSize;
    if (direction === "DOWN") headY += boxSize;

    // Apfel gefressen?
    if (headX === apple.x && headY === apple.y) {
        score++;
        scoreDisplay.innerText = score;
        apple = spawnApple();
    } else {
        snake.pop();
    }

    let newHead = { x: headX, y: headY };

    // Kollision Wand oder sich selbst
    if (headX < 0 || headX >= canvas.width || headY < 0 || headY >= canvas.height || 
        snake.some(seg => seg.x === newHead.x && seg.y === newHead.y)) {
        clearInterval(gameLoop);
        saveScore(score);
        alert("Spiel vorbei! Score: " + score);
        location.reload();
    }

    snake.unshift(newHead);
}

const gameLoop = setInterval(update, 120);
