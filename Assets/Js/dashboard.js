/* assets/js/dashboard.js - Lógica Matrix */

// ===== NAVEGAÇÃO =====
function carregarAba(abaId) {
    document.querySelectorAll('.module-item').forEach(item => item.classList.remove('active'));
    document.querySelectorAll('.module-content').forEach(content => content.classList.remove('active'));
    
    const target = document.getElementById(`aba-${abaId}`);
    if (target) {
        target.classList.add('active');
        playSound('click'); // Global
        if(abaId === 'trophies') verificarConquistas();
    }
}

// ===== QUIZ =====
function checkQuiz(btn, isCorrect, xpAmount = 0) {
    if (btn.disabled || btn.classList.contains('correct') || btn.classList.contains('incorrect')) return;
    
    const parent = btn.parentElement;
    parent.querySelectorAll('.quiz-opt').forEach(b => b.disabled = true);

    if (isCorrect) {
        btn.classList.add('correct');
        btn.innerHTML += ' <i class="fas fa-check"></i>';
        // playSound('success') já é chamado dentro de ganharXP no game-data.js
        ganharXP(xpAmount);
    } else {
        btn.classList.add('incorrect');
        btn.innerHTML += ' <i class="fas fa-times"></i>';
        playSound('error');
    }
}

// ===== VALIDAÇÕES (HTML, CSS, JS) =====
function validarHTML() {
    const code = document.getElementById('html-editor').innerText.toLowerCase();
    const feedback = document.getElementById('feedback-html');
    if (code.includes('<ol>') && code.includes('<li>')) {
        const count = (code.match(/<li>/g) || []).length;
        if(count >= 3) mostrarSucesso(feedback, "Lista Válida! (+50 XP)", 50);
        else mostrarErro(feedback, ["Precisa de pelo menos 3 itens <li>."]);
    } else mostrarErro(feedback, ["Use as tags <ol> e <li>."]);
}

function validarHTMLForm() {
    const code = document.getElementById('html-form-editor').innerText.toLowerCase();
    const feedback = document.getElementById('feedback-html-form');
    const hasButton = code.includes('<button') && code.includes('type="submit"');
    const hasInput = code.includes('<input') && code.includes('type="submit"');
    if (hasButton || hasInput) mostrarSucesso(feedback, "Botão de Envio Criado! (+60 XP)", 60);
    else mostrarErro(feedback, ["Use <button type='submit'> ou <input type='submit'>."]);
}

function validarFlexbox() {
    const code = document.getElementById('css-flex-editor').innerText.toLowerCase();
    const feedback = document.getElementById('feedback-css-flex');
    let errors = [];
    if (!code.includes('justify-content')) errors.push("Faltou 'justify-content'.");
    if (!code.includes('align-items')) errors.push("Faltou 'align-items'.");
    if (!code.includes('center')) errors.push("Use 'center' para centralizar.");
    if (errors.length === 0) mostrarSucesso(feedback, "Flexbox Perfeito! (+60 XP)", 60);
    else mostrarErro(feedback, errors);
}

function validarGrid() {
    const code = document.getElementById('css-grid-editor').innerText.toLowerCase();
    const feedback = document.getElementById('feedback-css-grid');
    if (code.includes('grid-template-columns')) {
        if (code.includes('1fr 1fr') || code.includes('repeat(2')) mostrarSucesso(feedback, "Grid Configurado! (+70 XP)", 70);
        else mostrarErro(feedback, ["Defina 2 colunas (ex: 1fr 1fr)."]);
    } else mostrarErro(feedback, ["Use a propriedade 'grid-template-columns'."]);
}

function validarJSIf() {
    const code = document.getElementById('js-if-editor').innerText.toLowerCase();
    const feedback = document.getElementById('feedback-js-if');
    let errors = [];
    if (!code.includes('if') || !code.includes('else')) errors.push("Estrutura if/else incompleta.");
    if (!code.includes('return')) errors.push("Faltou retornar.");
    if (!code.includes('>=')) errors.push("Verifique a condição >= 18.");
    if (errors.length === 0) mostrarSucesso(feedback, "Lógica Aprovada! (+70 XP)", 70);
    else mostrarErro(feedback, errors);
}

function validarJSLoop() {
    const code = document.getElementById('js-loop-editor').innerText.toLowerCase();
    const feedback = document.getElementById('feedback-js-loop');
    if (code.includes('for') && code.includes('let')) {
        if (code.includes('++') || code.includes('i = i + 1')) mostrarSucesso(feedback, "Loop Correto! (+80 XP)", 80);
        else mostrarErro(feedback, ["Faltou o incremento (i++)."]);
    } else mostrarErro(feedback, ["Use: for (let i=0; i<N; i++)"]);
}

// ===== UTILITÁRIOS UI =====
function mostrarSucesso(el, msg, xp) {
    el.innerHTML = `<div class="msg-success"><i class="fas fa-check-circle"></i> ${msg}</div>`;
    el.style.display = 'block';
    if(!el.dataset.completed) {
        ganharXP(xp); // Som já toca dentro de ganharXP
        el.dataset.completed = "true";
    } else {
        playSound('success'); // Se já completou, toca só som
    }
}

function mostrarErro(el, erros) {
    el.innerHTML = `<div class="msg-error"><i class="fas fa-times-circle"></i> ${erros.join(" ")}</div>`;
    el.style.display = 'block';
    playSound('error');
}

function resetEditor(id) {
    document.getElementById(id).innerText = "";
    document.getElementById(id).focus();
    playSound('click');
}

function verificarConquistas() {
    const currentLevel = window.globalLevel || parseInt(localStorage.getItem('devstudy_level')) || 1;
    const trophies = [
        {id: 'trophy-lvl1', lvl: 1},
        {id: 'trophy-lvl5', lvl: 5},
        {id: 'trophy-lvl10', lvl: 10},
    ];
    
    trophies.forEach(t => {
        const el = document.getElementById(t.id);
        if(currentLevel >= t.lvl) {
            el.classList.remove('locked');
            el.classList.add('unlocked');
        }
    });
}

function ganharXP(qtd) {
    if (typeof adicionarXP === "function") adicionarXP(qtd);
}