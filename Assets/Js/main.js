/* assets/js/main.js - Lógica da Home Limpa (V7) */

// =================================================
// 1. HELPERS E ANIMAÇÕES GERAIS
// =================================================
function playSound(type) {
    if (window.playSoundGlobal) window.playSoundGlobal(type);
}

function ganharXP(qtd) {
    if (typeof adicionarXP === "function") {
        window.adicionarXP(qtd);
    }
}

// Animação de Digitação
document.addEventListener('DOMContentLoaded', () => {
    const heroTitle = document.querySelector('.typing-cursor');
    if (heroTitle) {
        const text = "Código.";
        let index = 0;
        function type() {
            if (index < text.length) {
                heroTitle.textContent += text.charAt(index);
                index++;
                setTimeout(type, 150);
            }
        }
        heroTitle.textContent = "";
        type();
    }

    const interactives = document.querySelectorAll('.btn, .interactive-btn, .menu-card');
    interactives.forEach(el => {
        el.addEventListener('mouseenter', () => playSound('hover'));
    });
});

// CSS Injetado para animações
if (!document.getElementById('dynamic-styles')) {
    const style = document.createElement('style');
    style.id = 'dynamic-styles';
    style.textContent = `@keyframes floatUp { 0% { transform: translate(-50%, -50%); opacity: 1; } 100% { transform: translate(-50%, -150%); opacity: 0; } }`;
    document.head.appendChild(style);
}

// =================================================
// 2. POMODORO (FOCUS TIMER)
// =================================================
let pomoInterval;
let isPomoRunning = false;

window.iniciarPomodoro = function() {
    if (isPomoRunning) return;

    const minInput = document.getElementById('pomo-minutes');
    const secInput = document.getElementById('pomo-seconds');
    const statusEl = document.getElementById('pomoStatus');
    
    if (!minInput || !secInput) return;

    let minutos = parseInt(minInput.value);

    if (isNaN(minutos) || minutos < 5) {
        alert("⚠️ O tempo mínimo de foco é 5 minutos!");
        minInput.value = 25;
        return;
    }

    isPomoRunning = true;
    minInput.disabled = true;
    
    if(statusEl) {
        statusEl.innerText = "FOCADO";
        statusEl.style.color = "#facc15";
        statusEl.style.borderColor = "#facc15";
        statusEl.className = "project-status";
    }
    
    playSound('click');

    let tempoTotal = minutos * 60; 

    pomoInterval = setInterval(() => {
        tempoTotal--;
        let m = Math.floor(tempoTotal / 60);
        let s = tempoTotal % 60;
        minInput.value = m < 10 ? "0" + m : m;
        secInput.value = s < 10 ? "0" + s : s;

        if (tempoTotal <= 0) {
            clearInterval(pomoInterval);
            finalizarPomodoro();
        }
    }, 1000);
};

function finalizarPomodoro() {
    isPomoRunning = false;
    const minInput = document.getElementById('pomo-minutes');
    const secInput = document.getElementById('pomo-seconds');
    const statusEl = document.getElementById('pomoStatus');

    if(window.playSoundGlobal) window.playSoundGlobal('success');
    
    if (window.registrarPomodoro) {
        window.registrarPomodoro(); 
    } else {
        alert("Pomodoro Concluído! (XP não salvo)");
    }

    if(minInput) { minInput.disabled = false; minInput.value = "25"; }
    if(secInput) secInput.value = "00";
    if(statusEl) { statusEl.innerText = "CONCLUÍDO"; statusEl.style.color = "#4ade80"; statusEl.style.borderColor = "#4ade80"; }
}

window.resetarPomodoro = function() {
    clearInterval(pomoInterval);
    isPomoRunning = false;
    
    const minInput = document.getElementById('pomo-minutes');
    const secInput = document.getElementById('pomo-seconds');
    const statusEl = document.getElementById('pomoStatus');

    if(minInput) { minInput.disabled = false; minInput.value = "25"; }
    if(secInput) secInput.value = "00";
    if(statusEl) { statusEl.innerText = "READY"; statusEl.style.color = ""; statusEl.style.borderColor = ""; statusEl.className = "project-status status-active"; }
    
    playSound('click');
};

// --- NOVA FUNÇÃO: ALTERNAR TEMPO ---
window.alternarTempo = function() {
    if (isPomoRunning) return; // Não muda se estiver a rodar
    
    const minInput = document.getElementById('pomo-minutes');
    let current = parseInt(minInput.value);
    
    // Ciclo de tempos: 25 -> 45 -> 60 -> 15 -> 25
    if (current === 25) minInput.value = 45;
    else if (current === 45) minInput.value = 60;
    else if (current === 60) minInput.value = 15;
    else minInput.value = 25;
    
    playSound('click');
};

// =================================================
// 3. LISTA DE TAREFAS (TODO LIST)
// =================================================
window.adicionarTarefa = function() {
    const inputTarefa = document.getElementById('novaTarefa');
    const prioritySelect = document.getElementById('taskPriority');
    const lista = document.getElementById('listaTarefas');
    
    if(!inputTarefa || !lista) return;
    
    const texto = inputTarefa.value.trim();
    const prioridade = prioritySelect ? prioritySelect.value : 'medium';

    if (texto !== '') {
        const li = document.createElement('li');
        let borderClass = '';
        if(prioridade === 'high') li.style.borderLeft = '3px solid #facc15';
        else if(prioridade === 'medium') li.style.borderLeft = '3px solid #38bdf8';
        else li.style.borderLeft = '3px solid #94a3b8';
        
        li.innerHTML = `
            <span>${texto}</span>
            <div class="task-actions">
                <button class="btn-icon btn-check" onclick="concluirTarefa(this)" title="Concluir"><i class="fas fa-check"></i></button>
                <button class="btn-icon btn-trash" onclick="removerTarefa(this)" title="Remover"><i class="fas fa-trash"></i></button>
            </div>
        `;
        
        lista.appendChild(li);
        inputTarefa.value = '';
        ganharXP(2);
        playSound('click');
    }
};

window.concluirTarefa = function(btn) {
    const li = btn.closest('li');
    const span = li.querySelector('span');
    if (span.style.textDecoration === 'line-through') return;

    span.style.textDecoration = 'line-through';
    span.style.color = '#64748b';
    li.style.background = 'rgba(74, 222, 128, 0.1)';
    li.style.borderLeft = '3px solid #4ade80';
    btn.style.display = 'none';
    
    playSound('success');
    if(window.registrarTarefa) window.registrarTarefa();
    else ganharXP(15);
};

window.removerTarefa = function(btn) {
    const li = btn.closest('li');
    playSound('click');
    li.style.transition = "opacity 0.3s, transform 0.3s";
    li.style.opacity = '0';
    li.style.transform = 'translateX(20px)';
    setTimeout(() => { li.remove(); }, 300);
};