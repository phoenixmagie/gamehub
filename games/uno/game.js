const COLORS = ['red', 'blue', 'green', 'yellow'];
const VALUES = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

let deck = [];
let discardPile = [];
let hands = [[], []]; // [Spieler 1, Spieler 2/Bot]
let currentPlayer = 0;
let isBotMode = true;
let waitingForConfirmation = false;

function createDeck() {
    deck = [];
    COLORS.forEach(color => {
        VALUES.forEach(val => {
            deck.push({ color, value: val });
            if (val !== '0') deck.push({ color, value: val }); // Jede Zahl außer 0 gibt es doppelt
        });
    });
    deck.sort(() => Math.random() - 0.5);
}

function startNewGame(bot) {
    isBotMode = bot;
    currentPlayer = 0;
    waitingForConfirmation = false;
    createDeck();
    
    hands[0] = deck.splice(0, 7);
    hands[1] = deck.splice(0, 7);
    discardPile = [deck.splice(0, 1)[0]];
    
    document.getElementById('setup-controls').classList.add('hidden');
    render();
}

function render() {
    const playerArea = document.getElementById('player-cards');
    const opponentArea = document.getElementById('opponent-cards');
    const discardArea = document.getElementById('discard-pile');
    const info = document.getElementById('game-info');

    // Aktuelle Karte in der Mitte
    const topCard = discardPile[discardPile.length - 1];
    discardArea.innerHTML = `<div class="card ${topCard.color}">${topCard.value}</div>`;

    // Spieler 1 Karten (Unten)
    playerArea.innerHTML = "";
    hands[0].forEach((card, i) => {
        const el = createCardUI(card, (currentPlayer === 0 && !waitingForConfirmation));
        el.onclick = () => playCard(0, i);
        playerArea.appendChild(el);
    });

    // Spieler 2 / Bot Karten (Oben)
    opponentArea.innerHTML = "";
    hands[1].forEach((card, i) => {
        // Im Bot-Modus immer verdeckt. Im PvP nur sichtbar, wenn Spieler 2 dran ist.
        let isVisible = (!isBotMode && currentPlayer === 1 && !waitingForConfirmation);
        const el = createCardUI(card, isVisible);
        if (!isBotMode) el.onclick = () => playCard(1, i);
        opponentArea.appendChild(el);
    });

    // Status Text
    if (waitingForConfirmation) {
        info.innerText = "BITTE WECHSELN...";
    } else {
        info.innerText = (isBotMode && currentPlayer === 1) ? "Bot denkt nach..." : `Spieler ${currentPlayer + 1} ist dran`;
    }
}

function createCardUI(card, isVisible) {
    const div = document.createElement('div');
    if (isVisible) {
        div.className = `card ${card.color}`;
        div.innerText = card.value;
    } else {
        div.className = `card back`;
        div.innerText = "UNO";
    }
    return div;
}

function playCard(playerIdx, cardIdx) {
    if (currentPlayer !== playerIdx || waitingForConfirmation) return;

    const card = hands[playerIdx][cardIdx];
    const top = discardPile[discardPile.length - 1];

    if (card.color === top.color || card.value === top.value) {
        discardPile.push(hands[playerIdx].splice(cardIdx, 1)[0]);
        
        if (hands[playerIdx].length === 0) {
            alert(`SPIELER ${playerIdx + 1} GEWINNT!`);
            location.reload();
            return;
        }

        if (isBotMode) {
            if (currentPlayer === 0) {
                currentPlayer = 1;
                render();
                setTimeout(botTurn, 1000);
            }
        } else {
            // PvP Sichtschutz aktivieren
            waitingForConfirmation = true;
            document.getElementById('next-player-btn').classList.remove('hidden');
            render();
        }
    }
}

function drawCard() {
    if (waitingForConfirmation) return;
    if (deck.length === 0) createDeck();
    
    hands[currentPlayer].push(deck.splice(0, 1)[0]);
    render();
}

function confirmNextTurn() {
    currentPlayer = currentPlayer === 0 ? 1 : 0;
    waitingForConfirmation = false;
    document.getElementById('next-player-btn').classList.add('hidden');
    render();
}

function botTurn() {
    const top = discardPile[discardPile.length - 1];
    const playableIdx = hands[1].findIndex(c => c.color === top.color || c.value === top.value);

    if (playableIdx !== -1) {
        discardPile.push(hands[1].splice(playableIdx, 1)[0]);
    } else {
        if (deck.length === 0) createDeck();
        hands[1].push(deck.splice(0, 1)[0]);
    }

    if (hands[1].length === 0) {
        alert("DER BOT GEWINNT!");
        location.reload();
    } else {
        currentPlayer = 0;
        render();
    }
}
