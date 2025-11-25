/* assets/js/main.js - Home Logic V3 */

// Helpers Globais
function playSound(type) { if (window.playSoundGlobal) window.playSoundGlobal(type); }
function ganharXP(qtd) { if (typeof adicionarXP === "function") adicionarXP(qtd); }

// Animação Título
document.addEventListener('DOMContentLoaded', () => {
    const heroTitle = document.querySelector('.hero h1');
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

// ===== NOVO: FOCO NEURAL (POMODORO) =====
let timerInterval;
let timeLeft = 25 * 60; // 25 minutos
let isTimerRunning = false;

function startTimer() {
    if (isTimerRunning) return;
    isTimerRunning = true;
    playSound('click');
    
    document.getElementById('timer-status').textContent = "EM FOCO";
    document.getElementById('timer-status').className = "project-status status-active";
    
    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            isTimerRunning = false;
            playSound('success');
            alert("Sessão de Foco Completa! +100 XP");
            ganharXP(100);
            resetTimer();
        }
    }, 1000);
}

function pauseTimer() {
    clearInterval(timerInterval);
    isTimerRunning = false;
    document.getElementById('timer-status').textContent = "PAUSADO";
    document.getElementById('timer-status').style.borderColor = "#facc15";
    document.getElementById('timer-status').style.color = "#facc15";
    playSound('click');
}

function resetTimer() {
    clearInterval(timerInterval);
    isTimerRunning = false;
    timeLeft = 25 * 60;
    updateTimerDisplay();
    document.getElementById('timer-status').textContent = "AGUARDANDO";
    document.getElementById('timer-status').style.borderColor = "#94a3b8";
    document.getElementById('timer-status').style.color = "#94a3b8";
    playSound('click');
}

function updateTimerDisplay() {
    const mins = Math.floor(timeLeft / 60).toString().padStart(2, '0');
    const secs = (timeLeft % 60).toString().padStart(2, '0');
    document.getElementById('timer-display').textContent = `${mins}:${secs}`;
}

// ===== MISSÕES (TASKS V2) =====
function adicionarTarefa() {
    const input = document.getElementById('novaTarefa');
    const priority = document.getElementById('taskPriority').value;
    const texto = input.value.trim();

    if (!texto) return;

    const lista = document.getElementById('listaTarefas');
    const li = document.createElement('li');
    
    // Define classe baseada na prioridade
    li.className = `task-item ${priority}`;
    
    li.innerHTML = `
        <span>${texto}</span>
        <div class="task-actions">
            <button class="btn-icon btn-check" onclick="concluirTarefa(this)" title="Concluir"><i class="fas fa-check"></i></button>
            <button class="btn-icon btn-trash" onclick="removerTarefa(this)" title="Remover"><i class="fas fa-trash"></i></button>
        </div>
    `;
    
    lista.appendChild(li);
    input.value = '';
    ganharXP(5); // XP por criar
}

window.concluirTarefa = function(btn) {
    const li = btn.closest('li');
    const span = li.querySelector('span');
    if (span.style.textDecoration === 'line-through') return;
    
    span.style.textDecoration = 'line-through';
    span.style.color = 'var(--text-muted)';
    span.style.opacity = '0.5';
    
    // Efeito visual
    btn.style.display = 'none';
    li.style.borderColor = '#4ade80';
    
    playSound('success');
    ganharXP(15); // XP por concluir
}

window.removerTarefa = function(btn) {
    const li = btn.closest('li');
    playSound('click');
    li.style.opacity = '0';
    li.style.transform = 'translateX(20px)';
    setTimeout(() => li.remove(), 300);
}