const grid = document.getElementById('grid');
const timerEl = document.getElementById('timer');
const movesEl = document.getElementById('moves');

// Ícones (Pares)
const icons = [
    'fa-bug', 'fa-bug',
    'fa-code', 'fa-code',
    'fa-database', 'fa-database',
    'fa-terminal', 'fa-terminal',
    'fa-robot', 'fa-robot',
    'fa-shield-alt', 'fa-shield-alt'
];

let hasFlippedCard = false;
let lockBoard = false;
let firstCard, secondCard;
let matches = 0;
let moves = 0;
let seconds = 0;
let timerInterval;

function startGame() {
    // Resetar variáveis
    hasFlippedCard = false;
    lockBoard = false;
    firstCard = null;
    secondCard = null;
    matches = 0;
    moves = 0;
    seconds = 0;
    
    movesEl.innerText = '0';
    timerEl.innerText = '00:00';
    clearInterval(timerInterval);
    timerInterval = setInterval(updateTimer, 1000);

    // Limpar Grid
    grid.innerHTML = '';
    
    // Embaralhar
    icons.sort(() => 0.5 - Math.random());

    // Criar Cartas
    icons.forEach(iconClass => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.icon = iconClass;
        
        card.innerHTML = `
            <div class="card-face front-face"><i class="fas ${iconClass}"></i></div>
            <div class="card-face back-face"><i class="fas fa-fingerprint"></i></div>
        `;
        
        card.addEventListener('click', flipCard);
        grid.appendChild(card);
    });
}

function flipCard() {
    if (lockBoard) return;
    if (this === firstCard) return;

    this.classList.add('flip');

    if (!hasFlippedCard) {
        hasFlippedCard = true;
        firstCard = this;
        return;
    }

    secondCard = this;
    moves++;
    movesEl.innerText = moves;
    
    checkForMatch();
}

function checkForMatch() {
    let isMatch = firstCard.dataset.icon === secondCard.dataset.icon;

    if (isMatch) {
        disableCards();
        matches++;
        // Toca som de sucesso
        if(window.playSoundGlobal) window.playSoundGlobal('success');
        
        if (matches === icons.length / 2) {
            endGame();
        }
    } else {
        unflipCards();
    }
}

function disableCards() {
    firstCard.removeEventListener('click', flipCard);
    secondCard.removeEventListener('click', flipCard);
    resetBoard();
}

function unflipCards() {
    lockBoard = true;
    setTimeout(() => {
        firstCard.classList.remove('flip');
        secondCard.classList.remove('flip');
        resetBoard();
    }, 1000);
}

function resetBoard() {
    [hasFlippedCard, lockBoard] = [false, false];
    [firstCard, secondCard] = [null, null];
}

function updateTimer() {
    seconds++;
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    timerEl.innerText = `${mins}:${secs}`;
}

function endGame() {
    clearInterval(timerInterval);
    alert(`SISTEMA HACKEADO!\nTempo: ${timerEl.innerText}\nJogadas: ${moves}\n\n+500 XP ADICIONADOS!`);
    
    if(typeof adicionarXP === "function") {
        adicionarXP(500);
    }
}

// Iniciar ao carregar
document.addEventListener('DOMContentLoaded', startGame);