/* assets/js/dashboard.js - Lógica da Matrix (Desafios e Conquistas) */

// ===== NAVEGAÇÃO DE ABAS =====
function carregarAba(abaId) {
    // Atualiza Sidebar
    document.querySelectorAll('.module-item').forEach(item => item.classList.remove('active'));
    
    // Atualiza Conteúdo
    document.querySelectorAll('.module-content').forEach(content => {
        content.classList.remove('active');
    });
    
    const target = document.getElementById(`aba-${abaId}`);
    if (target) {
        target.classList.add('active');
        if(window.playSoundGlobal) window.playSoundGlobal('click');
        
        // Se abrir a aba de troféus, verifica se há novos desbloqueios
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
        ganharXP(xpAmount); // Som de sucesso toca aqui
    } else {
        btn.classList.add('incorrect');
        btn.innerHTML += ' <i class="fas fa-times"></i>';
        if(window.playSoundGlobal) window.playSoundGlobal('error');
    }
}

// ===== VALIDAÇÕES DE CÓDIGO (HTML) =====

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
    
    if (hasButton || hasInput) mostrarSucesso(feedback, "Botão Criado! (+60 XP)", 60);
    else mostrarErro(feedback, ["Use <button type='submit'> ou <input type='submit'>."]);
}

// ===== VALIDAÇÕES DE CÓDIGO (CSS) =====

function validarFlexbox() {
    const code = document.getElementById('css-flex-editor').innerText.toLowerCase();
    const feedback = document.getElementById('feedback-css-flex');
    let errors = [];

    if (!code.includes('justify-content')) errors.push("Faltou 'justify-content'.");
    if (!code.includes('align-items')) errors.push("Faltou 'align-items'.");
    if (!code.includes('center')) errors.push("Use 'center'.");
    
    if (errors.length === 0) mostrarSucesso(feedback, "Flexbox Correto! (+60 XP)", 60);
    else mostrarErro(feedback, errors);
}

function validarGrid() {
    const code = document.getElementById('css-grid-editor').innerText.toLowerCase();
    const feedback = document.getElementById('feedback-css-grid');
    
    if (code.includes('grid-template-columns')) {
        if (code.includes('1fr 1fr') || code.includes('repeat(2')) mostrarSucesso(feedback, "Grid Ativo! (+70 XP)", 70);
        else mostrarErro(feedback, ["Defina 2 colunas (ex: 1fr 1fr)."]);
    } else mostrarErro(feedback, ["Use 'grid-template-columns'."]);
}

// ===== VALIDAÇÕES DE CÓDIGO (JS) =====

function validarJSIf() {
    const code = document.getElementById('js-if-editor').innerText.toLowerCase();
    const feedback = document.getElementById('feedback-js-if');
    let errors = [];

    if (!code.includes('if') || !code.includes('else')) errors.push("Use if/else.");
    if (!code.includes('return')) errors.push("Faltou return.");
    if (!code.includes('>=')) errors.push("Verifique >= 18.");
    
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

// ===== SISTEMA DE CONQUISTAS (ATUALIZADO) =====
function verificarConquistas() {
    // Pega o nível global e estatísticas
    const currentLevel = window.globalLevel || 1;
    const stats = window.userStats || { pomodoros: 0, tasks: 0 };

    // Lista de IDs e condições para desbloquear
    const trophies = [
        { id: 'trophy-lvl1', condition: currentLevel >= 1 },
        { id: 'trophy-lvl5', condition: currentLevel >= 5 },
        { id: 'trophy-lvl10', condition: currentLevel >= 10 },
        // Novas Conquistas (Pomodoro e Tasks)
        { id: 'trophy-pomodoro', condition: stats.pomodoros >= 1 },
        { id: 'trophy-taskmaster', condition: stats.tasks >= 3 }
    ];
    
    trophies.forEach(t => {
        const el = document.getElementById(t.id);
        // Só tenta alterar se o elemento existir na página
        if (el && t.condition) {
            el.classList.remove('locked');
            el.classList.add('unlocked');
        }
    });
}

// ===== UI & HELPERS =====

function mostrarSucesso(el, msg, xp) {
    el.innerHTML = `<div class="msg-success"><i class="fas fa-check-circle"></i> ${msg}</div>`;
    el.style.display = 'block';
    
    if(!el.dataset.completed) {
        ganharXP(xp);
        el.dataset.completed = "true";
    } else {
        if(window.playSoundGlobal) window.playSoundGlobal('success');
    }
}

function mostrarErro(el, erros) {
    el.innerHTML = `<div class="msg-error"><i class="fas fa-times-circle"></i> ${erros.join(" ")}</div>`;
    el.style.display = 'block';
    if(window.playSoundGlobal) window.playSoundGlobal('error');
}

function resetEditor(id) {
    // Textos padrão para resetar
    const defaults = {
        'html-editor': '\n<ol>\n  \n</ol>',
        'html-form-editor': '<form>\n  \n</form>',
        'css-flex-editor': '.box {\n  display: flex;\n  /* Use justify-content e align-items */\n  \n  \n}',
        'css-grid-editor': '.container {\n  display: grid;\n  /* Defina grid-template-columns */\n  \n}',
        'js-if-editor': 'function verificar(idade) {\n  // Dica: if (idade >= 18) { ... }\n  \n}',
        'js-loop-editor': 'function contar() {\n  for (let i = 0; i < 5; i++) {\n    // console.log(i);\n  }\n}'
    };
    
    const editor = document.getElementById(id);
    if(editor) {
        editor.innerText = defaults[id] || "";
        editor.focus();
        if(window.playSoundGlobal) window.playSoundGlobal('click');
    }
}

// Wrapper para garantir que chamamos a função global do game-data.js
function ganharXP(qtd) {
    if (typeof adicionarXP === "function") {
        adicionarXP(qtd);
    } else {
        console.warn("game-data.js não carregado ou função adicionarXP não encontrada");
    }
}

// Verifica conquistas ao carregar a página, caso já estejam desbloqueadas
document.addEventListener('DOMContentLoaded', () => {
    // Espera um pouco pelos dados do Firebase
    setTimeout(verificarConquistas, 2000);
});