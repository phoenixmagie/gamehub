const grid = document.getElementById('grid');
const tools = document.querySelectorAll('.tool');
const ioModal = document.getElementById('io-modal');
const ioArea = document.getElementById('io-area');
const modalConfirm = document.getElementById('modal-confirm');
const modalTitle = document.getElementById('modal-title');

let currentBrush = 'S';
const ROWS = 15;
const COLS = 60;

// Verknüpfung der Zeichen mit deinen CSS-Klassen
const classMap = {
    '#': 'block',
    '-': 'block platform',
    'C': 'coin',
    'E': 'enemy',
    'P': 'checkpoint',
    'F': 'flag',
    'S': 'player'
};

function createGrid() {
    grid.innerHTML = '';
    grid.style.gridTemplateColumns = `repeat(${COLS}, 40px)`;
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = r;
            cell.dataset.col = c;
            cell.dataset.val = " ";
            
            cell.onmousedown = () => paint(cell);
            cell.onmouseover = (e) => { if(e.buttons === 1) paint(cell); };
            grid.appendChild(cell);
        }
    }
}

function paint(cell) {
    const val = currentBrush;
    cell.dataset.val = val;
    
    // Zelle zurücksetzen
    cell.innerHTML = "";
    cell.className = 'cell'; 
    
    // Wenn es ein grafisches Objekt ist, ein inneres Div mit der Klasse erstellen
    if (classMap[val]) {
        const sprite = document.createElement('div');
        sprite.className = classMap[val];
        cell.appendChild(sprite);
    }
    
    // Text-Anzeige für Orientierungspunkte (X, P, S)
    if (val === "X" || val === "S" || val === "P") {
        const text = document.createElement('span');
        text.innerText = val;
        text.style.position = "absolute";
        text.style.zIndex = "10";
        cell.appendChild(text);
    }
}

tools.forEach(t => {
    t.onclick = () => {
        tools.forEach(b => b.classList.remove('active'));
        t.classList.add('active');
        currentBrush = t.dataset.type;
    };
});

window.openIO = (mode) => {
    ioModal.classList.remove('hidden');
    if (mode === 'export') {
        modalTitle.innerText = "Level Code kopieren";
        modalConfirm.classList.add('hidden');
        let rows = [];
        for (let r = 0; r < ROWS; r++) {
            let line = "";
            for (let c = 0; c < COLS; c++) {
                const cell = document.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`);
                line += cell.dataset.val;
            }
            rows.push(`    "${line}"`);
        }
        ioArea.value = `export const layout = [\n${rows.join(",\n")}\n];`;
    } else {
        modalTitle.innerText = "Code einfügen";
        modalConfirm.classList.remove('hidden');
        ioArea.value = "";
        modalConfirm.onclick = performImport;
    }
};

function performImport() {
    const raw = ioArea.value;
    const lines = raw.match(/"([^"]+)"/g);
    if (lines) {
        createGrid();
        lines.forEach((line, r) => {
            if (r >= ROWS) return;
            const content = line.replace(/"/g, "");
            for (let c = 0; c < COLS; c++) {
                if (c < content.length) {
                    const cell = document.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`);
                    currentBrush = content[c];
                    paint(cell);
                }
            }
        });
        currentBrush = 'S';
        closeModal();
    }
}

window.closeModal = () => ioModal.classList.add('hidden');

createGrid();
