/* assets/js/game.js - CYBER TYPER */

const wordInput = document.getElementById('word-input');
const gameArea = document.getElementById('game-area');
const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');
const startScreen = document.getElementById('start-screen');

// Banco de Palavras
const words = [
    'function', 'const', 'let', 'var', 'array', 'object', 'class', 'return',
    'import', 'export', 'async', 'await', 'promise', 'console', 'document',
    'window', 'event', 'listener', 'style', 'html', 'css', 'script', 'div',
    'span', 'header', 'footer', 'section', 'nav', 'button', 'input', 'form',
    'flex', 'grid', 'block', 'inline', 'none', 'color', 'background', 'border',
    'margin', 'padding', 'width', 'height', 'font', 'text', 'align', 'justify'
];

let score = 0;
let lives = 5;
let isPlaying = false;
let activeWords = []; 

// Configurações de Dificuldade (Ajustado para ser jogável)
const INITIAL_SPEED = 0.8;    // Velocidade inicial (px/frame)
const SPEED_INC = 0.1;        // Aumento de velocidade a cada 100 pts
const SPAWN_RATE = 2000;      // Tempo entre palavras (ms)

// Inicia o Jogo
function startGame() {
    score = 0;
    lives = 5;
    activeWords = [];
    
    // Limpeza
    document.querySelectorAll('.falling-word').forEach(el => el.remove());
    startScreen.style.display = 'none';
    
    updateUI();
    
    wordInput.disabled = false;
    wordInput.value = '';
    wordInput.focus();
    
    isPlaying = true;
    
    // Inicia loops
    requestAnimationFrame(gameLoop);
    spawnWord();
}

// Cria uma palavra
function spawnWord() {
    if (!isPlaying) return;

    const text = words[Math.floor(Math.random() * words.length)];
    const el = document.createElement('div');
    el.classList.add('falling-word');
    el.innerText = text;
    
    // Posição X aleatória (dentro dos limites)
    const maxX = gameArea.clientWidth - 120;
    const x = Math.max(10, Math.random() * maxX);
    
    el.style.left = `${x}px`;
    el.style.top = '-40px';
    
    gameArea.appendChild(el);
    
    // Velocidade baseada no score
    const difficultyMultiplier = Math.floor(score / 100);
    const currentSpeed = INITIAL_SPEED + (difficultyMultiplier * SPEED_INC);

    activeWords.push({
        el: el,
        text: text,
        y: -40,
        speed: currentSpeed
    });

    // Próxima palavra (fica mais rápido conforme avança)
    const nextSpawn = Math.max(800, SPAWN_RATE - (score * 5));
    setTimeout(spawnWord, nextSpawn);
}

// Loop de Animação (60 FPS)
function gameLoop() {
    if (!isPlaying) return;

    const toRemove = [];

    activeWords.forEach((wordObj, index) => {
        // Move para baixo
        wordObj.y += wordObj.speed;
        wordObj.el.style.top = `${wordObj.y}px`;

        // Verifica colisão com o fundo
        if (wordObj.y > gameArea.clientHeight - 30) {
            loseLife();
            wordObj.el.remove();
            toRemove.push(index);
        }
    });

    // Limpa array
    for (let i = toRemove.length - 1; i >= 0; i--) {
        activeWords.splice(toRemove[i], 1);
    }

    if (isPlaying) requestAnimationFrame(gameLoop);
}

// Verifica Digitação
wordInput.addEventListener('input', (e) => {
    const typed = e.target.value.trim().toLowerCase();
    
    const matchIndex = activeWords.findIndex(w => w.text === typed);
    
    if (matchIndex !== -1) {
        // ACERTOU!
        const wordObj = activeWords[matchIndex];
        
        // Animação de explosão
        wordObj.el.classList.add('matched');
        setTimeout(() => wordObj.el.remove(), 200);
        
        activeWords.splice(matchIndex, 1);
        wordInput.value = '';
        
        score += 10;
        if(window.playSoundGlobal) window.playSoundGlobal('success');
        updateUI();
    }
});

function loseLife() {
    lives--;
    if(window.playSoundGlobal) window.playSoundGlobal('error');
    updateUI();
    
    // Flash vermelho
    gameArea.style.boxShadow = "0 0 50px #ef4444";
    setTimeout(() => gameArea.style.boxShadow = "0 0 30px rgba(56, 189, 248, 0.1)", 200);

    if (lives <= 0) {
        gameOver();
    }
}

function updateUI() {
    scoreEl.innerText = score;
    livesEl.innerText = '❤️'.repeat(Math.max(0, lives));
}

function gameOver() {
    isPlaying = false;
    wordInput.disabled = true;
    
    startScreen.innerHTML = `
        <h2 style="color:#ef4444">SISTEMA FALHOU</h2>
        <p style="color:white; margin-bottom:10px">Pontuação Final: <strong style="color:#facc15">${score}</strong></p>
        <button class="btn btn-primary" onclick="startGame()">TENTAR NOVAMENTE</button>
    `;
    startScreen.style.display = 'flex';
    
    // Dá XP (Metade do score)
    if (score > 0 && typeof adicionarXP === "function") {
        const xpGain = Math.floor(score / 2);
        adicionarXP(xpGain);
    }
}