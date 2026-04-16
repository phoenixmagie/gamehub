const COLORS = ['red', 'blue', 'green', 'yellow'];
const VALUES = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
const SPECIALS = ['S', 'R', '+1', '+2']; 
const WILD = 'W';

let deck = [];
let discardPile = [];
let hands = [[], []]; 
let currentPlayer = 0;
let isBotMode = true;
let waitingForConfirmation = false;

function createDeck() {
    deck = [];
    COLORS.forEach(color => {
        VALUES.forEach(val => {
            deck.push({ color, value: val });
            if (val !== '0') deck.push({ color, value: val });
        });
        SPECIALS.forEach(spec => {
            deck.push({ color, value: spec });
            deck.push({ color, value: spec });
        });
    });
    for(let i=0; i<4; i++) deck.push({ color: 'black', value: WILD });
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
    if (discardPile[0].color === 'black') discardPile[0].color = 'red';
    document.getElementById('setup-controls').classList.add('hidden');
    render();
}

function render() {
    const playerArea = document.getElementById('player-cards');
    const opponentArea = document.getElementById('opponent-cards');
    const discardArea = document.getElementById('discard-pile');
    const info = document.getElementById('game-info');

    const topCard = discardPile[discardPile.length - 1];
    discardArea.innerHTML = `<div class="card ${topCard.color}">${topCard.value}</div>`;

    playerArea.innerHTML = "";
    hands[0].forEach((card, i) => {
        const el = createCardUI(card, (currentPlayer === 0 && !waitingForConfirmation));
        el.onclick = () => playCard(0, i);
        playerArea.appendChild(el);
    });

    opponentArea.innerHTML = "";
    hands[1].forEach((card, i) => {
        let isVisible = (!isBotMode && currentPlayer === 1 && !waitingForConfirmation);
        const el = createCardUI(card, isVisible);
        if (!isBotMode) el.onclick = () => playCard(1, i);
        opponentArea.appendChild(el);
    });

    if (waitingForConfirmation) {
        info.innerText = "NÄCHSTER SPIELER...";
    } else {
        info.innerText = (isBotMode && currentPlayer === 1) ? "Bot zieht..." : `Spieler ${currentPlayer + 1} ist dran`;
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

function handleSpecialEffect(card) {
    let nextPlayer = currentPlayer === 0 ? 1 : 0;

    if (card.value === '+1') {
        for(let i=0; i<1; i++) hands[nextPlayer].push(deck.splice(0, 1)[0]);
        return true; 
    }
    if (card.value === '+2') {
        for(let i=0; i<2; i++) hands[nextPlayer].push(deck.splice(0, 1)[0]);
        return true; 
    }
    if (card.value === 'S' || card.value === 'R') {
        return true; 
    }
    if (card.value === WILD) {
        const newColor = hands[currentPlayer][0]?.color || COLORS[Math.floor(Math.random()*4)];
        card.color = (newColor === 'black') ? 'red' : newColor;
    }
    return false;
}

function playCard(playerIdx, cardIdx) {
    if (currentPlayer !== playerIdx || waitingForConfirmation) return;

    const card = hands[playerIdx][cardIdx];
    const top = discardPile[discardPile.length - 1];

    if (card.color === top.color || card.value === top.value || card.color === 'black') {
        const playedCard = hands[playerIdx].splice(cardIdx, 1)[0];
        discardPile.push(playedCard);
        
        if (hands[playerIdx].length === 0) {
            alert(`SPIELER ${playerIdx + 1} GEWINNT!`);
            location.reload();
            return;
        }

        const skipNext = handleSpecialEffect(playedCard);

        if (isBotMode) {
            if (currentPlayer === 0) {
                if (!skipNext) {
                    currentPlayer = 1;
                    render();
                    setTimeout(botTurn, 1000);
                } else {
                    render(); 
                }
            }
        } else {
            if (!skipNext) {
                waitingForConfirmation = true;
                document.getElementById('next-player-btn').classList.remove('hidden');
            }
            render();
        }
    }
}

function drawCard() {
    if (waitingForConfirmation) return;
    if (deck.length === 0) createDeck();
    hands[currentPlayer].push(deck.splice(0, 1)[0]);
    
    if (isBotMode) {
        if (currentPlayer === 0) {
            currentPlayer = 1;
            render();
            setTimeout(botTurn, 1000);
        }
    } else {
        waitingForConfirmation = true;
        document.getElementById('next-player-btn').classList.remove('hidden');
        render();
    }
}

function confirmNextTurn() {
    currentPlayer = currentPlayer === 0 ? 1 : 0;
    waitingForConfirmation = false;
    document.getElementById('next-player-btn').classList.add('hidden');
    render();
}

function botTurn() {
    const top = discardPile[discardPile.length - 1];
    const playableIdx = hands[1].findIndex(c => c.color === top.color || c.value === top.value || c.color === 'black');

    if (playableIdx !== -1) {
        const card = hands[1][playableIdx];
        discardPile.push(hands[1].splice(playableIdx, 1)[0]);
        const skipNext = handleSpecialEffect(card);
        
        if (hands[1].length === 0) {
            alert("DER BOT GEWINNT!");
            location.reload();
            return;
        }

        if (skipNext) {
            setTimeout(botTurn, 1000);
        } else {
            currentPlayer = 0;
            render();
        }
    } else {
        if (deck.length === 0) createDeck();
        hands[1].push(deck.splice(0, 1)[0]);
        currentPlayer = 0;
        render();
    }
}
