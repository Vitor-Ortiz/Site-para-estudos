/* assets/js/main.js - Lógica da Home V5
   Inclui: Animação Hero, Pomodoro (Foco Neural) e Missões (Tasks)
*/

// --- 1. Helpers e Configuração ---

// Wrapper para usar sons globais (definidos no game-data.js)
function playSound(type) {
    if (window.playSoundGlobal) {
        window.playSoundGlobal(type);
    }
}

// Wrapper para XP (com proteção)
function ganharXP(qtd) {
    if (typeof adicionarXP === "function") {
        adicionarXP(qtd); 
    } else {
        console.warn("Sistema de XP (game-data.js) não carregado.");
    }
}

// --- 2. Animação de Digitação (Hero) ---
document.addEventListener('DOMContentLoaded', () => {
    const heroTitle = document.querySelector('.hero h1');
    
    // Só inicia se o elemento existir
    if (heroTitle && !heroTitle.classList.contains('typed')) {
        const text = "Domine o Código.";
        typeWriter(heroTitle, text);
    }
});

function typeWriter(element, text, speed = 100) {
    element.innerHTML = ""; 
    element.classList.add('typing-cursor', 'typed');
    element.style.visibility = 'visible';
    
    let i = 0;
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    type();
}

// Injeta CSS da animação de XP flutuante (caso não exista)
const styleSheet = document.createElement("style");
styleSheet.innerText = `
@keyframes floatUp {
    0% { transform: translate(-50%, -50%); opacity: 1; }
    100% { transform: translate(-50%, -150%); opacity: 0; }
}`;
document.head.appendChild(styleSheet);


// --- 3. WIDGET: FOCO NEURAL (POMODORO) ---
let timerInterval;
let timeLeft = 25 * 60; // 25 minutos em segundos
let isTimerRunning = false;

function startTimer() {
    if (isTimerRunning) return;
    
    isTimerRunning = true;
    playSound('click');
    
    // Atualiza UI
    const statusBadge = document.getElementById('timer-status');
    if(statusBadge) {
        statusBadge.textContent = "EM FOCO";
        statusBadge.className = "project-status status-active";
        statusBadge.style.borderColor = "#4ade80";
        statusBadge.style.color = "#4ade80";
    }
    
    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        
        // Fim do Tempo
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            isTimerRunning = false;
            playSound('success');
            
            alert("Sessão de Foco Completa! +100 XP");
            
            // Regista a conquista no game-data.js
            if(window.registrarPomodoro) window.registrarPomodoro();
            else ganharXP(100); // Fallback se a função não existir
            
            resetTimer();
        }
    }, 1000);
}

function pauseTimer() {
    clearInterval(timerInterval);
    isTimerRunning = false;
    
    const statusBadge = document.getElementById('timer-status');
    if(statusBadge) {
        statusBadge.textContent = "PAUSADO";
        statusBadge.className = "project-status";
        statusBadge.style.borderColor = "#facc15";
        statusBadge.style.color = "#facc15";
    }
    playSound('click');
}

function resetTimer() {
    clearInterval(timerInterval);
    isTimerRunning = false;
    timeLeft = 25 * 60;
    updateTimerDisplay();
    
    const statusBadge = document.getElementById('timer-status');
    if(statusBadge) {
        statusBadge.textContent = "AGUARDANDO";
        statusBadge.className = "project-status";
        statusBadge.style.borderColor = "#94a3b8";
        statusBadge.style.color = "#94a3b8";
    }
    playSound('click');
}

function updateTimerDisplay() {
    const mins = Math.floor(timeLeft / 60).toString().padStart(2, '0');
    const secs = (timeLeft % 60).toString().padStart(2, '0');
    const display = document.getElementById('timer-display');
    if(display) display.textContent = `${mins}:${secs}`;
}


// --- 4. WIDGET: MISSÕES (TODO LIST) ---
function adicionarTarefa() {
    const inputTarefa = document.getElementById('novaTarefa');
    const prioritySelect = document.getElementById('taskPriority');
    
    if(!inputTarefa) return;
    
    const texto = inputTarefa.value.trim();
    const prioridade = prioritySelect ? prioritySelect.value : 'medium';

    if (texto !== '') {
        const lista = document.getElementById('listaTarefas');
        const li = document.createElement('li');
        
        // Adiciona a classe da prioridade para cor da borda
        li.className = `task-item ${prioridade}`;
        
        li.innerHTML = `
            <span>${texto}</span>
            <div class="task-actions">
                <button class="btn-icon btn-check" onclick="concluirTarefa(this)" title="Concluir">
                    <i class="fas fa-check"></i>
                </button>
                <button class="btn-icon btn-trash" onclick="removerTarefa(this)" title="Remover">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        lista.appendChild(li);
        inputTarefa.value = '';
        
        // Ganha XP por criar (pequeno incentivo)
        ganharXP(2);
    }
}

// Função Global para Concluir (acessível via onclick no HTML)
window.concluirTarefa = function(btn) {
    const li = btn.closest('li');
    const span = li.querySelector('span');
    
    // Se já estiver concluída, ignora
    if (span.style.textDecoration === 'line-through') return;

    // Efeito visual de conclusão
    span.style.textDecoration = 'line-through';
    span.style.color = 'var(--text-muted)';
    span.style.opacity = '0.6';
    
    // Esconde o botão de check para não clicar de novo
    btn.style.display = 'none';
    li.style.borderColor = '#4ade80'; // Fica verde
    li.style.background = 'rgba(74, 222, 128, 0.05)';
    
    playSound('success');
    
    // Regista conquista
    if(window.registrarTarefa) window.registrarTarefa();
    else ganharXP(15);
}

// Função Global para Remover
window.removerTarefa = function(btn) {
    const li = btn.closest('li');
    playSound('click');
    
    // Animação de saída
    li.style.opacity = '0';
    li.style.transform = 'translateX(20px)';
    
    setTimeout(() => {
        if(li.parentNode) li.parentNode.removeChild(li);
    }, 300);
}