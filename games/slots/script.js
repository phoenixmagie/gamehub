const symbols = ['🍒', '🔔', '💎', '🍋', '🍇', '7️⃣'];
const spinButton = document.getElementById('spin-button');
const message = document.getElementById('message');

const reels = [
    document.getElementById('reel1'),
    document.getElementById('reel2'),
    document.getElementById('reel3')
];

spinButton.addEventListener('click', () => {
    // Button kurz deaktivieren
    spinButton.disabled = true;
    message.innerText = "Dreht...";

    let results = [];
    
    // Einfache Animation simulieren
    let interval = setInterval(() => {
        reels.forEach(reel => {
            const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
            reel.innerText = randomSymbol;
        });
    }, 100);

    // Nach 1 Sekunde stoppen
    setTimeout(() => {
        clearInterval(interval);
        
        // Finale Symbole setzen
        reels.forEach((reel, index) => {
            const finalSymbol = symbols[Math.floor(Math.random() * symbols.length)];
            reel.innerText = finalSymbol;
            results[index] = finalSymbol;
        });

        checkWin(results);
        spinButton.disabled = false;
    }, 1000);
});

function checkWin(results) {
    if (results[0] === results[1] && results[1] === results[2]) {
        message.innerText = "JACKPOT! 🎉";
        message.style.color = "#f1c40f";
    } else {
        message.innerText = "Versuch es nochmal!";
        message.style.color = "white";
    }
}
