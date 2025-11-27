/* assets/js/dashboard.js - Lógica da Matrix, Editor e Conquistas (V32) */

// Variáveis para os editores (CodeJar)
let jarHTML, jarHTMLForm, jarCSS, jarGrid, jarJS, jarLoop;

// Templates de Código (Para Reset)
const CODE_TEMPLATES = {
    'html-editor': '\n<ol>\n  <li>Item 1</li>\n</ol>',
    'html-form-editor': '<form>\n  \n</form>',
    'css-flex-editor': '.box {\n  display: flex;\n  /* Use justify-content e align-items */\n  \n}',
    'css-grid-editor': '.container {\n  display: grid;\n  /* Defina grid-template-columns */\n  \n}',
    'js-if-editor': 'function verificar(idade) {\n  // Dica: if (idade >= 18) { ... }\n  \n}',
    'js-loop-editor': 'function contar() {\n  for (let i = 0; i < 5; i++) {\n    // console.log(i);\n  }\n}'
};

// =================================================
// 1. INICIALIZAÇÃO
// =================================================
document.addEventListener('DOMContentLoaded', () => {
    // Inicializa Editores (com pequeno delay para garantir que a lib carregou)
    setTimeout(initEditors, 500);
    
    // Verifica conquistas iniciais
    setTimeout(verificarConquistas, 1500);
});

function initEditors() {
    // Verifica se o CodeJar foi carregado (via HTML)
    if (!window.CodeJar) {
        console.log("Modo Editor Simples (CodeJar não detectado)");
        return; 
    }

    const highlight = editor => Prism.highlightElement(editor);

    // Configura cada editor se o elemento existir na página
    const elHTML = document.getElementById('html-editor');
    if(elHTML) { jarHTML = window.CodeJar(elHTML, highlight); jarHTML.updateCode(CODE_TEMPLATES['html-editor']); }

    const elForm = document.getElementById('html-form-editor');
    if(elForm) { jarHTMLForm = window.CodeJar(elForm, highlight); jarHTMLForm.updateCode(CODE_TEMPLATES['html-form-editor']); }

    const elCSS = document.getElementById('css-flex-editor');
    if(elCSS) { jarCSS = window.CodeJar(elCSS, highlight); jarCSS.updateCode(CODE_TEMPLATES['css-flex-editor']); }

    const elGrid = document.getElementById('css-grid-editor');
    if(elGrid) { jarGrid = window.CodeJar(elGrid, highlight); jarGrid.updateCode(CODE_TEMPLATES['css-grid-editor']); }

    const elJS = document.getElementById('js-if-editor');
    if(elJS) { jarJS = window.CodeJar(elJS, highlight); jarJS.updateCode(CODE_TEMPLATES['js-if-editor']); }

    const elLoop = document.getElementById('js-loop-editor');
    if(elLoop) { jarLoop = window.CodeJar(elLoop, highlight); jarLoop.updateCode(CODE_TEMPLATES['js-loop-editor']); }
}

// =================================================
// 2. NAVEGAÇÃO
// =================================================
function carregarAba(abaId) {
    // Atualiza Sidebar
    document.querySelectorAll('.module-item').forEach(item => item.classList.remove('active'));
    // Atualiza Conteúdo
    document.querySelectorAll('.module-content').forEach(content => content.classList.remove('active'));
    
    const target = document.getElementById(`aba-${abaId}`);
    if (target) {
        target.classList.add('active');
        if(window.playSoundGlobal) window.playSoundGlobal('click');
        
        // Se for a aba de troféus, força verificação
        if(abaId === 'trophies') verificarConquistas();
    }
}

// =================================================
// 3. QUIZZES
// =================================================
function checkQuiz(btn, isCorrect, xpAmount = 0) {
    if (btn.disabled) return;
    
    const parent = btn.parentElement;
    parent.querySelectorAll('.quiz-opt').forEach(b => b.disabled = true);

    if (isCorrect) {
        btn.classList.add('correct');
        btn.innerHTML += ' <i class="fas fa-check"></i>';
        ganharXP(xpAmount); // Som toca aqui
    } else {
        btn.classList.add('incorrect');
        btn.innerHTML += ' <i class="fas fa-times"></i>';
        if(window.playSoundGlobal) window.playSoundGlobal('error');
    }
}

// =================================================
// 4. VALIDAÇÃO DE CÓDIGO (LÓGICA INTELIGENTE)
// =================================================

// Helper para pegar código (compatível com CodeJar ou Texto puro)
function getCode(id, jarInstance) {
    if (jarInstance) return jarInstance.toString().toLowerCase();
    const el = document.getElementById(id);
    return el ? el.innerText.toLowerCase() : "";
}

// --- HTML ---
function validarHTML() {
    const code = getCode('html-editor', jarHTML);
    const feedback = document.getElementById('feedback-html');
    
    if (code.includes('<ol>') && code.includes('<li>')) {
        const count = (code.match(/<li>/g) || []).length;
        if(count >= 3) mostrarSucesso(feedback, "Lista Válida! (+50 XP)", 50);
        else mostrarErro(feedback, ["Precisa de pelo menos 3 itens <li>."]);
    } else mostrarErro(feedback, ["Use as tags <ol> e <li>."]);
}

function validarHTMLForm() {
    const code = getCode('html-form-editor', typeof jarHTMLForm !== 'undefined' ? jarHTMLForm : null);
    const feedback = document.getElementById('feedback-html-form');
    
    const hasButton = code.includes('<button') && code.includes('type="submit"');
    const hasInput = code.includes('<input') && code.includes('type="submit"');
    
    if (hasButton || hasInput) mostrarSucesso(feedback, "Botão de Envio Criado! (+60 XP)", 60);
    else mostrarErro(feedback, ["Use <button type='submit'> ou <input type='submit'>."]);
}

// --- CSS ---
function validarFlexbox() {
    const code = getCode('css-flex-editor', jarCSS);
    const feedback = document.getElementById('feedback-css-flex');
    let errors = [];

    if (!code.includes('justify-content')) errors.push("Faltou 'justify-content'.");
    if (!code.includes('align-items')) errors.push("Faltou 'align-items'.");
    if (!code.includes('center')) errors.push("Use 'center' para centralizar.");
    
    if (errors.length === 0) mostrarSucesso(feedback, "Flexbox Perfeito! (+60 XP)", 60);
    else mostrarErro(feedback, errors);
}

function validarGrid() {
    const code = getCode('css-grid-editor', typeof jarGrid !== 'undefined' ? jarGrid : null);
    const feedback = document.getElementById('feedback-css-grid');
    
    if (code.includes('grid-template-columns')) {
        if (code.includes('1fr 1fr') || code.includes('repeat(2')) mostrarSucesso(feedback, "Grid Configurado! (+70 XP)", 70);
        else mostrarErro(feedback, ["Defina 2 colunas (ex: 1fr 1fr)."]);
    } else mostrarErro(feedback, ["Use a propriedade 'grid-template-columns'."]);
}

// --- JS ---
function validarJSIf() {
    const code = getCode('js-if-editor', jarJS);
    const feedback = document.getElementById('feedback-js-if');
    let errors = [];

    if (!code.includes('if') || !code.includes('else')) errors.push("Estrutura if/else incompleta.");
    if (!code.includes('return')) errors.push("Faltou retornar.");
    if (!code.includes('>=')) errors.push("Verifique a condição >= 18.");
    
    if (errors.length === 0) mostrarSucesso(feedback, "Lógica Aprovada! (+70 XP)", 70);
    else mostrarErro(feedback, errors);
}

function validarJSLoop() {
    const code = getCode('js-loop-editor', typeof jarLoop !== 'undefined' ? jarLoop : null);
    const feedback = document.getElementById('feedback-js-loop');
    
    if (code.includes('for') && code.includes('let')) {
        if (code.includes('++') || code.includes('i = i + 1')) mostrarSucesso(feedback, "Loop Correto! (+80 XP)", 80);
        else mostrarErro(feedback, ["Faltou o incremento (i++)."]);
    } else mostrarErro(feedback, ["Use: for (let i=0; i<N; i++)"]);
}

// =================================================
// 5. SISTEMA DE CONQUISTAS (TROFÉUS)
// =================================================
function verificarConquistas() {
    const level = window.globalLevel || 1;
    // Pega stats globais ou inicia zerado
    const stats = window.userStats || { pomodoros: 0, tasks: 0 };

    // Atualiza Troféus de Nível
    unlockTrophy('trophy-lvl1', level >= 1);
    unlockTrophy('trophy-lvl5', level >= 5);
    unlockTrophy('trophy-lvl10', level >= 10);
    
    // Atualiza Troféus de Stats (Novos!)
    unlockTrophy('trophy-pomodoro', stats.pomodoros >= 1);
    unlockTrophy('trophy-taskmaster', stats.tasks >= 3);
    
    // Debug (Calculadora)
    // unlockTrophy('trophy-debug', ...);
}

function unlockTrophy(elementId, condition) {
    const el = document.getElementById(elementId);
    if (el && condition) {
        el.classList.remove('locked');
        el.classList.add('unlocked');
    }
}

// =================================================
// 6. UI & UTILITÁRIOS
// =================================================

function mostrarSucesso(el, msg, xp) {
    if (!el) return; // Proteção se o elemento não existir
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
    if (!el) return;
    el.innerHTML = `<div class="msg-error"><i class="fas fa-times-circle"></i> ${erros.join(" ")}</div>`;
    el.style.display = 'block';
    if(window.playSoundGlobal) window.playSoundGlobal('error');
}

function resetEditor(id) {
    // Reseta CodeJar se existir
    if (id === 'html' && jarHTML) jarHTML.updateCode(CODE_TEMPLATES['html-editor']);
    else if (id === 'html-form' && jarHTMLForm) jarHTMLForm.updateCode(CODE_TEMPLATES['html-form-editor']);
    else if (id === 'css' && jarCSS) jarCSS.updateCode(CODE_TEMPLATES['css-flex-editor']);
    else if (id === 'css-grid' && jarGrid) jarGrid.updateCode(CODE_TEMPLATES['css-grid-editor']);
    else if (id === 'js' && jarJS) jarJS.updateCode(CODE_TEMPLATES['js-if-editor']);
    else if (id === 'js-loop' && jarLoop) jarLoop.updateCode(CODE_TEMPLATES['js-loop-editor']);
    
    // Reseta também o elemento nativo como fallback
    const el = document.getElementById(id + '-editor') || document.getElementById(id);
    if(el && CODE_TEMPLATES[el.id]) {
        el.innerText = CODE_TEMPLATES[el.id];
    }
    
    if(window.playSoundGlobal) window.playSoundGlobal('click');
}

function ganharXP(qtd) {
    if (typeof adicionarXP === "function") {
        adicionarXP(qtd);
    } else {
        console.warn("game-data.js não carregado ou função adicionarXP não encontrada.");
    }
}