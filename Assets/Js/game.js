/* assets/js/game.js - CORRIGIDO V2 */

// Variáveis Globais do Jogo
const wordInput = document.getElementById('word-input');
const gameArea = document.getElementById('game-area');
const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');
const startScreen = document.getElementById('start-screen');

// Palavras
const words = ['function','const','let','var','array','object','class','return','import','export','async','await','promise','console','document','window','event','style','html','css','script','flex','grid','color','width','height','font','loop','if','else'];

let score = 0;
let lives = 5;
let isPlaying = false;
let activeWords = [];
let currentGame = 'typer';

// Configurações de Dificuldade
const INITIAL_SPEED = 0.8;
const SPEED_INC = 0.1;
const SPAWN_RATE = 2000;

// --- INICIALIZAÇÃO AUTOMÁTICA ---
document.addEventListener('DOMContentLoaded', () => {
    // Força a entrada no modo Typer ao carregar a página
    mudarJogo('typer');
});

// --- SISTEMA DE TROCA DE JOGOS ---
window.mudarJogo = function(jogo) {
    currentGame = jogo;
    
    // 1. Atualiza Botões do Menu
    document.querySelectorAll('.btn-game-select').forEach(btn => btn.classList.remove('active'));
    // Seleciona o botão clicado (ou o padrão)
    const activeBtn = document.querySelector(`.btn-game-select[onclick="mudarJogo('${jogo}')"]`);
    if(activeBtn) activeBtn.classList.add('active');
    
    // 2. Mostra/Esconde Painéis
    document.querySelectorAll('.game-panel').forEach(panel => panel.classList.add('hidden'));
    const activePanel = document.getElementById(`game-${jogo}`);
    if(activePanel) activePanel.classList.remove('hidden');

    // 3. Reseta estados
    if (jogo === 'termo') initTermo();
    if (jogo === 'typer') resetTyperUI();
};

function resetTyperUI() {
    // Garante que a tela inicial aparece e o input está lá (mas desativado)
    if(startScreen) startScreen.style.display = 'flex';
    if(wordInput) {
        wordInput.value = '';
        wordInput.disabled = true;
        wordInput.placeholder = "Clique em INICIAR...";
        wordInput.style.opacity = "0.5"; // Visual de desativado
    }
    // Limpa palavras antigas se houver
    document.querySelectorAll('.falling-word').forEach(el => el.remove());
}

// --- LÓGICA DO CYBER TYPER ---
window.startGame = function() {
    score = 0;
    lives = 5;
    activeWords = [];
    
    // Limpa palavras anteriores
    document.querySelectorAll('.falling-word').forEach(el => el.remove());
    
    // Esconde tela de start
    if(startScreen) startScreen.style.display = 'none';
    
    updateUI();
    
    // Ativa Input
    if(wordInput) {
        wordInput.disabled = false;
        wordInput.value = '';
        wordInput.placeholder = "Digite aqui...";
        wordInput.style.opacity = "1";
        wordInput.focus();
    }
    
    isPlaying = true;
    
    // Inicia Loops
    requestAnimationFrame(gameLoop);
    spawnWord();
};

function spawnWord() {
    if (!isPlaying || currentGame !== 'typer') return;

    const text = words[Math.floor(Math.random() * words.length)];
    const el = document.createElement('div');
    el.className = 'falling-word';
    el.innerText = text;
    
    // Posição aleatória segura (para não sair da tela)
    const containerWidth = gameArea ? gameArea.clientWidth : 300;
    const maxX = containerWidth - 100;
    el.style.left = Math.max(10, Math.random() * maxX) + 'px';
    el.style.top = '-40px';
    
    if(gameArea) gameArea.appendChild(el);
    
    // Velocidade aumenta com o score
    const currentSpeed = INITIAL_SPEED + (Math.floor(score / 100) * SPEED_INC);

    activeWords.push({ el: el, text: text, y: -40, speed: currentSpeed });
    
    // Próxima palavra
    const nextSpawn = Math.max(800, SPAWN_RATE - (score * 5));
    setTimeout(spawnWord, nextSpawn);
}

function gameLoop() {
    if (!isPlaying || currentGame !== 'typer') return;

    const toRemove = [];

    activeWords.forEach((w, i) => {
        w.y += w.speed;
        w.el.style.top = `${w.y}px`;

        // Verifica se tocou no fundo
        const limit = gameArea ? gameArea.clientHeight : 400;
        if (w.y > limit - 30) {
            loseLife();
            w.el.remove();
            toRemove.push(i);
        }
    });

    for (let i = toRemove.length - 1; i >= 0; i--) {
        activeWords.splice(toRemove[i], 1);
    }

    if (isPlaying) requestAnimationFrame(gameLoop);
}

// Verifica Digitação
if (wordInput) {
    wordInput.addEventListener('input', (e) => {
        if (!isPlaying) return;
        
        const typed = e.target.value.trim().toLowerCase();
        const matchIndex = activeWords.findIndex(w => w.text === typed);
        
        if (matchIndex !== -1) {
            // Acertou!
            const w = activeWords[matchIndex];
            w.el.classList.add('matched');
            setTimeout(() => w.el.remove(), 200); // Animação de explosão
            
            activeWords.splice(matchIndex, 1);
            wordInput.value = '';
            
            score += 10;
            if(window.playSoundGlobal) window.playSoundGlobal('success');
            updateUI();
        }
    });
}

function loseLife() {
    lives--;
    if(window.playSoundGlobal) window.playSoundGlobal('error');
    updateUI();
    
    // Flash vermelho
    if(gameArea) {
        gameArea.style.boxShadow = "0 0 50px #ef4444";
        setTimeout(() => gameArea.style.boxShadow = "0 0 30px rgba(56, 189, 248, 0.1)", 200);
    }

    if (lives <= 0) gameOver();
}

function updateUI() {
    if(scoreEl) scoreEl.innerText = score;
    if(livesEl) livesEl.innerText = '❤️'.repeat(Math.max(0, lives));
}

function gameOver() {
    isPlaying = false;
    if(wordInput) {
        wordInput.disabled = true;
        wordInput.value = '';
        wordInput.placeholder = "Fim de jogo!";
    }
    
    if(startScreen) {
        startScreen.innerHTML = `
            <h2 style="color:#ef4444; margin-bottom:10px;">SISTEMA FALHOU</h2>
            <p style="color:white; margin-bottom:20px;">Score Final: <strong style="color:#facc15">${score}</strong></p>
            <button class="btn btn-primary" onclick="location.reload()">REINICIAR</button>
        `;
        startScreen.style.display = 'flex';
    }
    
    // XP
    if (score > 0 && window.adicionarXP) {
        const xpGain = Math.floor(score / 2);
        window.adicionarXP(xpGain);
    }
}

// ==================================================
// JOGO 2: CYBER TERMO (Lógica Mantida)
// ==================================================
const TERMO_WORDS = ['ARRAY', 'CLASS', 'CONST', 'EVENT', 'INPUT', 'STYLE', 'WIDTH', 'VALUE', 'FETCH', 'ASYNC', 'AWAIT', 'COLOR', 'BLOCK', 'LOGIC', 'MODEL', 'QUERY', 'STACK', 'THEME', 'TITLE', 'WHILE'];
let termoSecret="", termoGrid=[], currentRow=0, currentTile=0, isTermoOver=false;

window.initTermo = function() {
    termoSecret = TERMO_WORDS[Math.floor(Math.random() * TERMO_WORDS.length)];
    // console.log("Segredo:", termoSecret);
    currentRow = 0; currentTile = 0; isTermoOver = false;
    termoGrid = Array(6).fill().map(() => Array(5).fill(""));
    renderGrid(); renderKeyboard();
};

function renderGrid() {
    const gridEl = document.getElementById('termo-grid');
    if(!gridEl) return;
    gridEl.innerHTML = '';
    termoGrid.forEach((row, rIndex) => {
        const rowEl = document.createElement('div'); rowEl.className = 'termo-row';
        row.forEach((letter, cIndex) => {
            const tile = document.createElement('div'); tile.className = 'termo-tile';
            tile.id = `tile-${rIndex}-${cIndex}`; tile.textContent = letter;
            if(letter) tile.classList.add('filled');
            rowEl.appendChild(tile);
        });
        gridEl.appendChild(rowEl);
    });
}

function renderKeyboard() {
    const kb = document.getElementById('termo-keyboard');
    if(!kb) return;
    kb.innerHTML = '';
    const keys = [['Q','W','E','R','T','Y','U','I','O','P'],['A','S','D','F','G','H','J','K','L'],['ENTER','Z','X','C','V','B','N','M','⌫']];
    keys.forEach(row => {
        const rowEl = document.createElement('div'); rowEl.className = 'key-row';
        row.forEach(k => {
            const keyEl = document.createElement('div'); keyEl.className = 'key'; keyEl.textContent = k; keyEl.id = `key-${k}`;
            keyEl.onclick = () => handleTermoInput(k);
            rowEl.appendChild(keyEl);
        });
        kb.appendChild(rowEl);
    });
}

function handleTermoInput(key) {
    if (isTermoOver) return;
    if (key === '⌫' || key === 'BACKSPACE') {
        if (currentTile > 0) { currentTile--; termoGrid[currentRow][currentTile] = ""; updateTile(currentRow, currentTile, ""); }
    } else if (key === 'ENTER') {
        if (currentTile === 5) checkGuess(); else alert("Digite 5 letras!");
    } else {
        if (currentTile < 5 && /^[A-Z]$/.test(key)) { termoGrid[currentRow][currentTile] = key; updateTile(currentRow, currentTile, key); currentTile++; }
    }
}

function updateTile(r, c, val) {
    const el = document.getElementById(`tile-${r}-${c}`);
    if(el) { el.textContent = val; el.classList.toggle('filled', val !== ""); }
}

function checkGuess() {
    const guess = termoGrid[currentRow].join("");
    for (let i = 0; i < 5; i++) {
        const letter = guess[i];
        const tile = document.getElementById(`tile-${currentRow}-${i}`);
        const key = document.getElementById(`key-${letter}`);
        setTimeout(() => {
            if(tile) {
                tile.classList.add('flip');
                let status = 'absent';
                if (letter === termoSecret[i]) status = 'correct';
                else if (termoSecret.includes(letter)) status = 'present';
                tile.classList.add(status);
                if(key) key.classList.add(status);
            }
        }, i * 200);
    }
    setTimeout(() => {
        if (guess === termoSecret) {
            isTermoOver = true; alert("PARABÉNS! +100 XP");
            if(window.playSoundGlobal) window.playSoundGlobal('success');
            if(window.adicionarXP) window.adicionarXP(100);
        } else {
            if (currentRow >= 5) { isTermoOver = true; alert(`GAME OVER! Era: ${termoSecret}`); }
            else { currentRow++; currentTile = 0; }
        }
    }, 1500);
}