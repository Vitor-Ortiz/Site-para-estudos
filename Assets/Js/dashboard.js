/* assets/js/dashboard.js - V FINAL (Com Nuvem e Monitoramento) */

// Variáveis para os editores (CodeJar)
let jarHTML, jarHTMLForm, jarCSS, jarGrid, jarJS, jarLoop;

// Variável global para guardar o erro atual (evita bugs de aspas no HTML)
let erroAtualContexto = null;

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
    setTimeout(initEditors, 500);
    setTimeout(verificarConquistas, 1500);
    
    // Inicia o monitoramento do servidor
    verificarStatusServidor();
});

function initEditors() {
    if (!window.CodeJar) return; 
    const highlight = editor => Prism.highlightElement(editor);

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
    document.querySelectorAll('.module-item').forEach(item => item.classList.remove('active'));
    document.querySelectorAll('.module-content').forEach(content => content.classList.remove('active'));
    
    const target = document.getElementById(`aba-${abaId}`);
    if (target) {
        target.classList.add('active');
        if(window.playSoundGlobal) window.playSoundGlobal('click');
        if(abaId === 'trophies') verificarConquistas();
    }
}

// =================================================
// 3. UI HELPER & VALIDAÇÃO
// =================================================
function getCode(id, jarInstance) {
    if (jarInstance) return jarInstance.toString().toLowerCase();
    const el = document.getElementById(id);
    return el ? el.innerText.toLowerCase() : "";
}

function mostrarSucesso(el, msg, xp) {
    if (!el) return;
    el.innerHTML = `<div class="msg-success"><i class="fas fa-check-circle"></i> ${msg}</div>`;
    el.style.display = 'block';
    
    if(!el.dataset.completed) {
        if(typeof adicionarXP === "function") adicionarXP(xp);
        el.dataset.completed = "true";
    } else {
        if(window.playSoundGlobal) window.playSoundGlobal('success');
    }
}

// Função mostrarErro Inteligente (Salva Contexto)
function mostrarErro(el, erros, codigoContexto = null, langContexto = null) {
    if (!el) return;
    
    const textoErro = erros.join(" ");
    let html = `<div class="msg-error"><div><i class="fas fa-times-circle"></i> ${textoErro}</div>`;

    if (codigoContexto && langContexto) {
        erroAtualContexto = { codigo: codigoContexto, erro: textoErro, lang: langContexto };
        
        html += `<button class="btn-ai-help" onclick="acionarMentorIA(this)">
                    <i class="fas fa-brain"></i> Perguntar à IA
                 </button>`;
    }

    html += `</div>`;
    el.innerHTML = html;
    el.style.display = 'block';
    if(window.playSoundGlobal) window.playSoundGlobal('error');
}

function acionarMentorIA(btn) {
    if (erroAtualContexto) {
        perguntarMentorIA(btn, erroAtualContexto.codigo, erroAtualContexto.erro, erroAtualContexto.lang);
    } else {
        alert("Erro ao recuperar contexto do código.");
    }
}

function resetEditor(id) {
    if (id === 'html' && jarHTML) jarHTML.updateCode(CODE_TEMPLATES['html-editor']);
    else if (id === 'html-form' && jarHTMLForm) jarHTMLForm.updateCode(CODE_TEMPLATES['html-form-editor']);
    else if (id === 'css' && jarCSS) jarCSS.updateCode(CODE_TEMPLATES['css-flex-editor']);
    else if (id === 'css-grid' && jarGrid) jarGrid.updateCode(CODE_TEMPLATES['css-grid-editor']);
    else if (id === 'js' && jarJS) jarJS.updateCode(CODE_TEMPLATES['js-if-editor']);
    else if (id === 'js-loop' && jarLoop) jarLoop.updateCode(CODE_TEMPLATES['js-loop-editor']);
    
    if(window.playSoundGlobal) window.playSoundGlobal('click');
}

// =================================================
// 4. VALIDAÇÕES ESPECÍFICAS
// =================================================
function validarHTML() {
    const code = getCode('html-editor', jarHTML);
    const feedback = document.getElementById('feedback-html');
    
    if (code.includes('<ol>') && code.includes('<li>')) {
        const count = (code.match(/<li>/g) || []).length;
        if(count >= 3) mostrarSucesso(feedback, "Lista Válida! (+50 XP)", 50);
        else mostrarErro(feedback, ["Precisa de pelo menos 3 itens <li>."], code, 'html');
    } else mostrarErro(feedback, ["Use as tags <ol> e <li>."], code, 'html');
}

function validarFlexbox() {
    const code = getCode('css-flex-editor', jarCSS);
    const feedback = document.getElementById('feedback-css-flex');
    let errors = [];
    if (!code.includes('justify-content')) errors.push("Faltou 'justify-content'.");
    if (!code.includes('align-items')) errors.push("Faltou 'align-items'.");
    if (!code.includes('center')) errors.push("Use 'center' para centralizar.");
    
    if (errors.length === 0) mostrarSucesso(feedback, "Flexbox Perfeito! (+60 XP)", 60);
    else mostrarErro(feedback, errors, code, 'css');
}

function validarJSIf() {
    const code = getCode('js-if-editor', jarJS);
    const feedback = document.getElementById('feedback-js-if');
    let errors = [];
    if (!code.includes('if') || !code.includes('else')) errors.push("Estrutura if/else incompleta.");
    if (!code.includes('return')) errors.push("Faltou retornar.");
    if (!code.includes('>=')) errors.push("Verifique a condição >= 18.");
    
    if (errors.length === 0) mostrarSucesso(feedback, "Lógica Aprovada! (+70 XP)", 70);
    else mostrarErro(feedback, errors, code, 'javascript');
}

// =================================================
// 5. CONQUISTAS
// =================================================
function verificarConquistas() {
    const level = window.globalLevel || 1;
    const stats = window.userStats || { pomodoros: 0, tasks: 0 };
    unlockTrophy('trophy-lvl1', level >= 1);
    unlockTrophy('trophy-lvl5', level >= 5);
    unlockTrophy('trophy-lvl10', level >= 10);
}
function unlockTrophy(id, condition) {
    const el = document.getElementById(id);
    if (el && condition) { el.classList.remove('locked'); el.classList.add('unlocked'); }
}

// =================================================
// 6. INTEGRAÇÃO IA (MENTOR)
// =================================================
async function perguntarMentorIA(btn, codigo, erroTexto, linguagem) {
    const parentDiv = btn.parentElement;
    btn.innerHTML = '<i class="fas fa-circle-notch ai-loading-icon"></i> Analisando...';
    btn.disabled = true;

    try {
        // --- CONEXÃO COM A NUVEM (RENDER) ---
        const resposta = await fetch('https://devstudy-api.onrender.com/analisar_erro', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                codigo_aluno: codigo,
                erro_console: erroTexto,
                linguagem: linguagem
            })
        });

        if (!resposta.ok) throw new Error("Servidor IA Offline");
        const dados = await resposta.json();

        const respostaDiv = document.createElement('div');
        respostaDiv.className = 'ai-response-box';
        respostaDiv.innerHTML = `<strong>💡 Dica do Mentor:</strong><br>${dados.dica}`;
        parentDiv.appendChild(respostaDiv);
        btn.remove();

    } catch (error) {
        console.error(error);
        btn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Erro na IA';
        btn.style.background = '#ef4444';
        alert("O servidor da IA está acordando. Tente novamente em 30 segundos.");
    }
}

// =================================================
// 7. MONITORAMENTO DE SISTEMA (PING)
// =================================================
async function verificarStatusServidor() {
    const statusText = document.querySelector('.progress-widget span');
    const statusBar = document.querySelector('.progress-bar .fill');
    if(!statusText || !statusBar) return;

    statusText.innerText = "Status: Conectando...";
    statusBar.style.background = "#facc15";
    statusBar.style.width = "50%";
    statusBar.style.animation = "pulse-bar 1s infinite";

    try {
        // --- PING NO RENDER ---
        const response = await fetch('https://devstudy-api.onrender.com/');
        if (response.ok) {
            statusText.innerHTML = "Status: <span style='color:#4ade80'>ONLINE</span>";
            statusBar.style.background = "#4ade80";
            statusBar.style.width = "100%";
            statusBar.style.animation = "none";
            statusBar.style.boxShadow = "0 0 10px #4ade80";
        } else throw new Error("Erro 500");
    } catch (error) {
        statusText.innerHTML = "Status: <span style='color:#ef4444'>OFFLINE</span>";
        statusBar.style.background = "#ef4444";
        statusBar.style.width = "100%";
        statusBar.style.animation = "none";
    }
}