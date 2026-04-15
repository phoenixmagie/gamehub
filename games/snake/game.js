// ==========================================
// einstellung: speed
// ==========================================
const speed = 200; // millisekunden pro schritt (z. b. 100 = schnell, 300 = langsam)

// --- 1. grund-setup ---
const canvas = document.getelementbyid("snakecanvas");
const ctx = canvas.getcontext("2d");
const scoredisplay = document.getelementbyid("currentscore");

const boxsize = 20; // größe eines rasters
let score = 0;
let direction = "right"; 
let snake = [{ x: 9 * boxsize, y: 10 * boxsize }];
let apple = spawnapple();

// --- 2. steuerung (tastatur & buttons) ---
document.addeventlistener("keydown", changedirection);

document.getelementbyid("btnup").onclick = () => setdir("up");
document.getelementbyid("btndown").onclick = () => setdir("down");
document.getelementbyid("btnleft").onclick = () => setdir("left");
document.getelementbyid("btnright").onclick = () => setdir("right");

// setzt die richtung und verhindert, dass man direkt umkehrt
function setdir(newdir) {
    if (newdir === "left" && direction !== "right") direction = "left";
    if (newdir === "up" && direction !== "down") direction = "up";
    if (newdir === "right" && direction !== "left") direction = "right";
    if (newdir === "down" && direction !== "up") direction = "down";
}

function changedirection(e) {
    const key = e.keycode;
    if (key == 37) setdir("left");
    if (key == 38) setdir("up");
    if (key == 39) setdir("right");
    if (key == 40) setdir("down");
}

// --- 3. spielfunktionen ---
// erzeugt einen neuen apfel an einer zufälligen position
function spawnapple() {
    return {
        x: math.floor(math.random() * 19 + 1) * boxsize,
        y: math.floor(math.random() * 19 + 1) * boxsize
    };
}

// speichert den highscore lokal im browser
function savescore(points) {
    const data = json.parse(localstorage.getitem('mywebgames')) || {};
    const gameid = 'snake'; 

    if (!data[gameid] || points > data[gameid].highscore) {
        data[gameid] = { highscore: points };
        localstorage.setitem('mywebgames', json.stringify(data));
    }
}

// --- 4. haupt-update-funktion (spiellogik) ---
function update() {
    // hintergrund (spielfeld) zeichnen
    ctx.fillstyle = "#1a1a1a";
    ctx.fillrect(0, 0, canvas.width, canvas.height);

    // schlange zeichnen
    snake.foreach((segment, index) => {
        // kopf ist hellrot, der körper dunkelrot
        ctx.fillstyle = (index === 0) ? "#e60000" : "#800000";
        ctx.fillrect(segment.x, segment.y, boxsize, boxsize);
        ctx.strokestyle = "#1a1a1a";
        ctx.strokerect(segment.x, segment.y, boxsize, boxsize);
    });

    // apfel zeichnen
    ctx.fillstyle = "#ffcc00";
    ctx.fillrect(apple.x, apple.y, boxsize, boxsize);

    // aktuelle kopfposition auslesen
    let headx = snake[0].x;
    let heady = snake[0].y;

    // bewegung berechnen
    if (direction === "left") headx -= boxsize;
    if (direction === "up") heady -= boxsize;
    if (direction === "right") headx += boxsize;
    if (direction === "down") heady += boxsize;

    // kollisions-check: apfel gefressen?
    if (headx === apple.x && heady === apple.y) {
        score++;
        scoredisplay.innertext = score;
        apple = spawnapple();
    } else {
        // falls kein apfel gefressen wurde, muss das letzte glied entfernt werden
        snake.pop();
    }

    let newhead = { x: headx, y: heady };

    // kollisions-check: wand (selbst-kollision ist erlaubt/deaktiviert)
    if (headx < 0 || headx >= canvas.width || heady < 0 || heady >= canvas.height) {
        clearinterval(gameloop);
        savescore(score);
        alert("spiel vorbei! score: " + score);
        location.reload();
    }

    // den neuen kopf vorne hinzufügen
    snake.unshift(newhead);
}

// --- 5. spielstart ---
const gameloop = setinterval(update, speed);
