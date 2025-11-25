/* ARQUIVO: script.js
   RESPONSABILIDADE: Lógica específica da Home (Calculadora, Tarefas, Animações).
*/

// ===== SISTEMA DE ÁUDIO (Sintetizador Web Audio API) =====
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    const now = audioCtx.currentTime;

    if (type === 'hover') {
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(400, now);
        oscillator.frequency.exponentialRampToValueAtTime(600, now + 0.05);
        gainNode.gain.setValueAtTime(0.05, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        oscillator.start(now);
        oscillator.stop(now + 0.05);
    } else if (type === 'click') {
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(200, now);
        oscillator.frequency.exponentialRampToValueAtTime(800, now + 0.1);
        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        oscillator.start(now);
        oscillator.stop(now + 0.1);
    } else if (type === 'success') {
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(400, now);
        oscillator.frequency.linearRampToValueAtTime(800, now + 0.1);
        oscillator.frequency.linearRampToValueAtTime(1200, now + 0.3);
        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.linearRampToValueAtTime(0, now + 0.5);
        oscillator.start(now);
        oscillator.stop(now + 0.5);
    } else if (type === 'error') {
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(100, now);
        oscillator.frequency.linearRampToValueAtTime(80, now + 0.3);
        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.linearRampToValueAtTime(0, now + 0.3);
        oscillator.start(now);
        oscillator.stop(now + 0.3);
    }
}

// Inicialização de Eventos Globais
document.addEventListener('DOMContentLoaded', () => {
    // Adiciona sons aos elementos interativos
    const interactives = document.querySelectorAll('button, a, .interactive-btn, .revisao-btn, .topic-card');
    interactives.forEach(el => {
        el.addEventListener('mouseenter', () => playSound('hover'));
        el.addEventListener('click', () => playSound('click'));
    });

    // Animação de digitação no título
    const heroTitle = document.querySelector('.hero h1');
    if (heroTitle && !heroTitle.classList.contains('typed')) {
        typeWriter(heroTitle, "Domine o Código.");
    }
    
    // O HUD de XP é atualizado automaticamente pelo game-data.js
});

// Animação Typewriter
function typeWriter(element, text, speed = 100) {
    element.innerHTML = "";
    element.classList.add('typing-cursor');
    element.classList.add('typed');
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

// Animação floatUp (CSS injetado via JS)
const styleSheet = document.createElement("style");
styleSheet.innerText = `
@keyframes floatUp {
    0% { transform: translate(-50%, -50%); opacity: 1; }
    100% { transform: translate(-50%, -150%); opacity: 0; }
}`;
document.head.appendChild(styleSheet);

// Funções auxiliares de compatibilidade
function ganharXP(qtd) {
    // Redireciona para a função do game-data.js
    if (typeof adicionarXP === "function") {
        adicionarXP(qtd);
    } else {
        console.warn("game-data.js não carregado ainda");
    }
}

// ===== PROJETO: CALCULADORA =====
let display = document.getElementById('display');
let operador = '';
let valor1 = '';
let valor2 = '';
let calculadoraBugada = true;

function adicionarNumero(numero) {
    if(!display) return; 
    if (operador === '') {
        valor1 += numero;
        display.value = valor1;
    } else {
        valor2 += numero;
        display.value = valor1 + operador + valor2;
    }
}

function adicionarOperador(op) {
    if(!display) return;
    if (valor1 !== '') {
        operador = op;
        display.value = valor1 + operador;
    }
}

function limparDisplay() {
    if(!display) return;
    display.value = '';
    valor1 = '';
    valor2 = '';
    operador = '';
}

function calcular() {
    if(!display) return;
    if (valor1 !== '' && valor2 !== '' && operador !== '') {
        let resultado;
        let num1 = parseFloat(valor1);
        let num2 = parseFloat(valor2);

        switch (operador) {
            case '+':
                if (calculadoraBugada) {
                    resultado = num1 - num2; // BUG PROPOSITAL
                    playSound('error');
                    alert('⚠️ ALERTA DE SISTEMA: Falha na operação de soma. Depuração necessária.');
                } else {
                    resultado = num1 + num2;
                }
                break;
            case '-': resultado = num1 - num2; break;
            case '*': resultado = num1 * num2; break;
            case '/': resultado = num2 !== 0 ? num1 / num2 : 'Erro'; break;
            default: resultado = 'Inválido';
        }

        display.value = resultado;
        valor1 = resultado.toString();
        valor2 = '';
        operador = '';
        
        // Se usar corretamente, ganha um pouco de XP
        if (!calculadoraBugada) ganharXP(5);
    }
}

function debugCalculadora() {
    if (calculadoraBugada) {
        calculadoraBugada = false;
        ganharXP(50);
        
        const statusEl = document.getElementById('calcStatus');
        const btn = document.getElementById('btnDebugCalc');
        
        if(statusEl) {
            statusEl.textContent = "SISTEMA SEGURO";
            statusEl.className = "project-status status-fixed";
        }
        
        if(btn) {
            btn.innerHTML = "✅ CÓDIGO CORRIGIDO";
            btn.disabled = true;
            btn.style.borderColor = "var(--success)";
            btn.style.color = "var(--success)";
        }
        
        alert("🐛 PATCH APLICADO COM SUCESSO! Sistema operacional.");
    }
}

// ===== PROJETO: LISTA DE TAREFAS (TODO LIST) =====
function adicionarTarefa() {
    const inputTarefa = document.getElementById('novaTarefa');
    if(!inputTarefa) return;
    
    const texto = inputTarefa.value.trim();

    if (texto !== '') {
        const lista = document.getElementById('listaTarefas');
        const li = document.createElement('li');
        
        // Estilos da tarefa
        li.style.padding = '10px';
        li.style.borderBottom = '1px solid rgba(255,255,255,0.1)';
        li.style.display = 'flex';
        li.style.justifyContent = 'space-between';
        li.style.alignItems = 'center';
        li.style.color = 'var(--text-main)';
        li.style.animation = 'slideIn 0.3s ease';

        const span = document.createElement('span');
        span.textContent = texto;
        span.style.flex = '1';

        const divBotoes = document.createElement('div');
        divBotoes.style.display = 'flex';
        divBotoes.style.gap = '5px';

        const btnConcluir = document.createElement('button');
        btnConcluir.textContent = '✓';
        btnConcluir.className = 'interactive-btn';
        btnConcluir.style.color = 'var(--success)';
        btnConcluir.style.borderColor = 'var(--success)';
        
        // --- LÓGICA CORRIGIDA (SEM XP INFINITO) ---
        btnConcluir.onclick = function () {
            // Verifica se JÁ foi concluído
            if (span.style.textDecoration === 'line-through') return;

            span.style.textDecoration = 'line-through';
            span.style.color = 'var(--text-muted)';
            
            // Desativa visualmente o botão
            this.style.opacity = '0.3';
            this.style.cursor = 'not-allowed';
            
            playSound('success');
            ganharXP(5); // Chama XP global
        };

        const btnRemover = document.createElement('button');
        btnRemover.textContent = 'X';
        btnRemover.className = 'interactive-btn';
        btnRemover.style.color = 'var(--danger)';
        btnRemover.style.borderColor = 'var(--danger)';
        btnRemover.onclick = function () {
            playSound('click');
            li.style.opacity = '0';
            setTimeout(() => lista.removeChild(li), 300);
        };

        divBotoes.appendChild(btnConcluir);
        divBotoes.appendChild(btnRemover);

        li.appendChild(span);
        li.appendChild(divBotoes);

        lista.appendChild(li);
        inputTarefa.value = '';
        
        ganharXP(2); // XP por criar tarefa
    }
}