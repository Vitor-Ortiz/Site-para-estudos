/* Revisao/revisao.js - Lógica Expandida V2 */

// ===== NAVEGAÇÃO DE ABAS =====
function carregarAba(abaId) {
    document.querySelectorAll('.module-item').forEach(item => item.classList.remove('active'));
    document.querySelectorAll('.module-content').forEach(content => {
        content.classList.remove('active');
    });
    
    const target = document.getElementById(`aba-${abaId}`);
    if (target) {
        target.classList.add('active');
        playSound('click');
        if(abaId === 'trophies') verificarConquistas();
    }
}

// ===== SISTEMA DE QUIZ =====
function checkQuiz(btn, isCorrect, xpAmount = 0) {
    if (btn.disabled || btn.classList.contains('correct') || btn.classList.contains('incorrect')) return;
    
    const parent = btn.parentElement;
    parent.querySelectorAll('.quiz-opt').forEach(b => b.disabled = true);

    if (isCorrect) {
        btn.classList.add('correct');
        btn.innerHTML += ' <i class="fas fa-check"></i>';
        playSound('success');
        ganharXP(xpAmount);
    } else {
        btn.classList.add('incorrect');
        btn.innerHTML += ' <i class="fas fa-times"></i>';
        playSound('error');
    }
}

// ===== VALIDAÇÕES DE CÓDIGO (HTML) =====

// 1. Lista Ordenada
function validarHTML() {
    const code = document.getElementById('html-editor').innerText.toLowerCase();
    const feedback = document.getElementById('feedback-html');
    
    if (code.includes('<ol>') && code.includes('<li>')) {
        const count = (code.match(/<li>/g) || []).length;
        if(count >= 3) {
            mostrarSucesso(feedback, "Lista Criada com Sucesso! (+50 XP)", 50);
        } else {
            mostrarErro(feedback, ["Precisa de pelo menos 3 itens <li>."]);
        }
    } else {
        mostrarErro(feedback, ["Use as tags <ol> e <li>."]);
    }
}

// 2. [NOVO] Formulário
function validarHTMLForm() {
    const code = document.getElementById('html-form-editor').innerText.toLowerCase();
    const feedback = document.getElementById('feedback-html-form');
    
    // Aceita <button> ou <input type="submit">
    const hasButton = code.includes('<button') && code.includes('type="submit"');
    const hasInput = code.includes('<input') && code.includes('type="submit"');
    
    if (hasButton || hasInput) {
        mostrarSucesso(feedback, "Botão de Envio Criado! (+60 XP)", 60);
    } else {
        mostrarErro(feedback, ["Use <button type='submit'> ou <input type='submit'>."]);
    }
}

// ===== VALIDAÇÕES DE CÓDIGO (CSS) =====

// 1. Flexbox
function validarFlexbox() {
    const code = document.getElementById('css-flex-editor').innerText.toLowerCase();
    const feedback = document.getElementById('feedback-css-flex');
    let errors = [];

    if (!code.includes('justify-content')) errors.push("Faltou 'justify-content'.");
    if (!code.includes('align-items')) errors.push("Faltou 'align-items'.");
    if (!code.includes('center')) errors.push("Use 'center' para centralizar.");

    if (errors.length === 0) {
        mostrarSucesso(feedback, "Layout Flexbox Perfeito! (+60 XP)", 60);
    } else {
        mostrarErro(feedback, errors);
    }
}

// 2. [NOVO] Grid
function validarGrid() {
    const code = document.getElementById('css-grid-editor').innerText.toLowerCase();
    const feedback = document.getElementById('feedback-css-grid');
    
    if (code.includes('grid-template-columns')) {
        // Verifica se usou duas colunas (ex: 1fr 1fr)
        if (code.includes('1fr 1fr') || code.includes('repeat(2')) {
            mostrarSucesso(feedback, "Grid de 2 Colunas Ativado! (+70 XP)", 70);
        } else {
            mostrarErro(feedback, ["Defina 2 colunas (ex: 1fr 1fr)."]);
        }
    } else {
        mostrarErro(feedback, ["Use a propriedade 'grid-template-columns'."]);
    }
}

// ===== VALIDAÇÕES DE CÓDIGO (JS) =====

// 1. Condicional If/Else
function validarJSIf() {
    const code = document.getElementById('js-if-editor').innerText.toLowerCase();
    const feedback = document.getElementById('feedback-js-if');
    let errors = [];

    if (!code.includes('if') || !code.includes('else')) errors.push("Estrutura if/else incompleta.");
    if (!code.includes('return')) errors.push("Faltou retornar o valor.");
    if (!code.includes('>=')) errors.push("Verifique a condição >= 18.");

    if (errors.length === 0) {
        mostrarSucesso(feedback, "Lógica Aprovada! (+70 XP)", 70);
    } else {
        mostrarErro(feedback, errors);
    }
}

// 2. [NOVO] Loop For
function validarJSLoop() {
    const code = document.getElementById('js-loop-editor').innerText.toLowerCase();
    const feedback = document.getElementById('feedback-js-loop');
    
    if (code.includes('for') && code.includes('let')) {
        if (code.includes('++') || code.includes('i = i + 1')) {
            mostrarSucesso(feedback, "Loop Configurado Corretamente! (+80 XP)", 80);
        } else {
            mostrarErro(feedback, ["Faltou o incremento (i++)."]);
        }
    } else {
        mostrarErro(feedback, ["Use a estrutura: for (let i=0; i<N; i++)"]);
    }
}

// ===== SISTEMA DE FEEDBACK =====
function mostrarSucesso(el, msg, xp) {
    el.innerHTML = `<div class="msg-success"><i class="fas fa-check-circle"></i> ${msg}</div>`;
    el.style.display = 'block';
    playSound('success');
    
    if(!el.dataset.completed) {
        ganharXP(xp);
        el.dataset.completed = "true";
    }
}

function mostrarErro(el, erros) {
    el.innerHTML = `<div class="msg-error"><i class="fas fa-times-circle"></i> ${erros.join(" ")}</div>`;
    el.style.display = 'block';
    playSound('error');
}

// ===== CONQUISTAS =====
function verificarConquistas() {
    const currentLevel = window.globalLevel || parseInt(localStorage.getItem('devstudy_level')) || 1;
    desbloquearTrofeu('trophy-lvl1', currentLevel >= 1);
    desbloquearTrofeu('trophy-lvl5', currentLevel >= 5);
    desbloquearTrofeu('trophy-lvl10', currentLevel >= 10);
    if(currentLevel >= 3) desbloquearTrofeu('trophy-debug', true);
}

function desbloquearTrofeu(id, condition) {
    const el = document.getElementById(id);
    if(condition) {
        el.classList.remove('locked');
        el.classList.add('unlocked');
    }
}

// ===== UTILITÁRIOS =====
function resetEditor(id) {
    // Restaura o placeholder original baseado no ID (simulado aqui resetando para vazio ou texto padrão)
    const defaults = {
        'html-editor': '\n<ol>\n  \n  \n</ol>',
        'html-form-editor': '<form>\n  \n  \n</form>',
        'css-flex-editor': '.box {\n  display: flex;\n  /* Dica: Use justify-content e align-items */\n  \n  \n}',
        'css-grid-editor': '.container {\n  display: grid;\n  /* Defina grid-template-columns abaixo */\n  \n}',
        'js-if-editor': 'function verificar(idade) {\n  // Dica: if (idade >= 18) { ... }\n  \n}',
        'js-loop-editor': 'function contar() {\n  for (let i = 0; i < 5; i++) {\n    // console.log(i);\n  }\n}'
    };
    
    document.getElementById(id).innerText = defaults[id] || "";
    document.getElementById(id).focus();
    playSound('click');
}

function ganharXP(qtd) {
    if (typeof adicionarXP === "function") adicionarXP(qtd);
}

function playSound(type) {
    if (window.playSoundGlobal) window.playSoundGlobal(type);
}