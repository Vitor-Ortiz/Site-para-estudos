/* assets/js/main.js - Lógica da Home (Sem Áudio, pois está no Global) */

// Inicialização de Eventos Específicos da Home
document.addEventListener('DOMContentLoaded', () => {
    // Animação de digitação no título
    const heroTitle = document.querySelector('.hero h1');
    if (heroTitle && !heroTitle.classList.contains('typed')) {
        typeWriter(heroTitle, "Domine o Código.");
    }
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

// Wrapper para ganhar XP (agora chama o global direto)
function ganharXP(qtd) {
    if (typeof adicionarXP === "function") {
        adicionarXP(qtd);
    } else {
        console.warn("Sistema de XP offline");
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
    playSound('click'); // Usa o global
}

function adicionarOperador(op) {
    if(!display) return;
    if (valor1 !== '') {
        operador = op;
        display.value = valor1 + operador;
    }
    playSound('click');
}

function limparDisplay() {
    if(!display) return;
    display.value = '';
    valor1 = '';
    valor2 = '';
    operador = '';
    playSound('click');
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
                    resultado = num1 - num2;
                    playSound('error');
                    alert('⚠️ ERRO DE SOMA! A calculadora subtraiu em vez de somar.');
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
            btn.style.borderColor = "#4ade80";
            btn.style.color = "#4ade80";
        }
        alert("🐛 PATCH APLICADO! Calculadora reparada.");
    }
}

// ===== PROJETO: LISTA DE TAREFAS =====
function adicionarTarefa() {
    const inputTarefa = document.getElementById('novaTarefa');
    if(!inputTarefa) return;
    const texto = inputTarefa.value.trim();

    if (texto !== '') {
        const lista = document.getElementById('listaTarefas');
        const li = document.createElement('li');
        
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
        btnConcluir.style.color = '#4ade80';
        btnConcluir.style.borderColor = '#4ade80';
        
        btnConcluir.onclick = function () {
            if (span.style.textDecoration === 'line-through') return;
            span.style.textDecoration = 'line-through';
            span.style.color = 'var(--text-muted)';
            this.style.opacity = '0.3';
            this.style.cursor = 'not-allowed';
            ganharXP(5);
        };

        const btnRemover = document.createElement('button');
        btnRemover.textContent = 'X';
        btnRemover.className = 'interactive-btn';
        btnRemover.style.color = '#ef4444';
        btnRemover.style.borderColor = '#ef4444';
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
        ganharXP(2);
    }
}