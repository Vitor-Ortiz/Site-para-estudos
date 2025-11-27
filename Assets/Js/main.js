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


// Variáveis do Pomodoro
let pomoInterval;
let isPomoRunning = false;

function iniciarPomodoro() {
    if (isPomoRunning) return;

    const minInput = document.getElementById('pomo-minutes');
    const secInput = document.getElementById('pomo-seconds');
    const statusEl = document.getElementById('pomoStatus');
    
    let minutos = parseInt(minInput.value);

    // 1. Validação de Segurança (Mínimo 5 minutos)
    if (isNaN(minutos) || minutos < 5) {
        alert("⚠️ O tempo mínimo de foco é 5 minutos!");
        minInput.value = "05"; // Corrige visualmente
        return;
    }

    // 2. Bloqueia edição
    minInput.disabled = true;
    isPomoRunning = true;
    
    // Atualiza Status
    if(statusEl) {
        statusEl.innerText = "FOCADO";
        statusEl.style.color = "#facc15";
        statusEl.style.borderColor = "#facc15";
    }
    
    playSound('click');

    // 3. Lógica do Timer
    let tempoTotal = minutos * 60; // Converte para segundos

    pomoInterval = setInterval(() => {
        tempoTotal--;

        let m = Math.floor(tempoTotal / 60);
        let s = tempoTotal % 60;

        // Atualiza visual (adiciona zero à esquerda se menor que 10)
        minInput.value = m < 10 ? "0" + m : m;
        secInput.value = s < 10 ? "0" + s : s;

        // FIM DO TEMPO
        if (tempoTotal <= 0) {
            clearInterval(pomoInterval);
            finalizarPomodoro();
        }
    }, 1000);
}

function finalizarPomodoro() {
    isPomoRunning = false;
    const minInput = document.getElementById('pomo-minutes');
    const secInput = document.getElementById('pomo-seconds');
    const statusEl = document.getElementById('pomoStatus');

    // Toca som de vitória
    if(window.playSoundGlobal) window.playSoundGlobal('success');
    
    // Dá XP e Moedas (Chama função do game-data.js)
    if (window.registrarPomodoro) {
        window.registrarPomodoro(); // Isso já dá o XP e mostra o Toast
    } else {
        alert("Pomodoro Concluído! +100 XP"); // Fallback
    }

    // Reseta visual
    minInput.disabled = false;
    minInput.value = "25";
    secInput.value = "00";
    
    if(statusEl) {
        statusEl.innerText = "CONCLUÍDO";
        statusEl.style.color = "#4ade80";
        statusEl.style.borderColor = "#4ade80";
    }
}

function resetarPomodoro() {
    clearInterval(pomoInterval);
    isPomoRunning = false;
    
    const minInput = document.getElementById('pomo-minutes');
    const secInput = document.getElementById('pomo-seconds');
    const statusEl = document.getElementById('pomoStatus');

    minInput.disabled = false;
    minInput.value = "25"; // Volta ao padrão
    secInput.value = "00";
    
    if(statusEl) {
        statusEl.innerText = "READY";
        statusEl.style.color = "var(--success)";
        statusEl.style.borderColor = "var(--success)";
    }
    
    if(window.playSoundGlobal) window.playSoundGlobal('click');
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