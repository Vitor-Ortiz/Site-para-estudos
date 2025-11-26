/* assets/js/lab.js - V2 (Integrado com Database) */

// Função de segurança HTML (Mantida)
function escapeHTML(str) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

document.addEventListener('DOMContentLoaded', () => {
    // Verifica se o banco de dados carregou
    if (window.COMMANDS_DB) {
        renderCommands(window.COMMANDS_DB);
    } else {
        console.error("Erro: database.js não carregado.");
        document.getElementById('commands-list').innerHTML = "Erro ao carregar base de dados.";
    }
    
    // Inicia Lab Flexbox
    updateFlex();
});

// --- PESQUISA ---
let currentFilter = 'all';

function filtrarTipo(type) {
    currentFilter = type;
    
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        // Ajuste para aceitar o texto do botão ou o valor passado
        const btnType = btn.getAttribute('onclick').split("'")[1];
        if(btnType === type) btn.classList.add('active');
    });

    aplicarFiltros();
}

function filtrarComandos() { aplicarFiltros(); }

function aplicarFiltros() {
    const termo = document.getElementById('cmd-search').value.toLowerCase();
    
    // Usa a base de dados global
    const filtrados = window.COMMANDS_DB.filter(cmd => {
        const matchType = currentFilter === 'all' || cmd.type === currentFilter;
        const matchText = cmd.name.toLowerCase().includes(termo) || cmd.desc.toLowerCase().includes(termo);
        return matchType && matchText;
    });

    renderCommands(filtrados);
}

function renderCommands(lista) {
    const container = document.getElementById('commands-list');
    container.innerHTML = '';

    if (lista.length === 0) {
        container.innerHTML = '<p style="color:var(--text-muted); text-align:center; grid-column:1/-1;">Nenhum comando encontrado.</p>';
        return;
    }

    lista.forEach(cmd => {
        const safeName = escapeHTML(cmd.name);
        const safeCode = escapeHTML(cmd.code);

        const card = document.createElement('div');
        card.className = `cmd-card ${cmd.type}`;
        card.innerHTML = `
            <div class="cmd-header">
                <span class="cmd-name">${safeName}</span>
                <span class="cmd-type ${cmd.type}">${cmd.type.toUpperCase()}</span>
            </div>
            <p class="cmd-desc">${cmd.desc}</p>
            <div class="cmd-code">${safeCode}</div>
        `;
        container.appendChild(card);
    });
}

// --- NAVEGAÇÃO ---
function carregarAba(abaId) {
    document.querySelectorAll('.module-item').forEach(item => item.classList.remove('active'));
    document.querySelectorAll('.module-content').forEach(content => content.classList.remove('active'));
    
    const target = document.getElementById(`aba-${abaId}`);
    if (target) {
        target.classList.add('active');
        if(window.playSoundGlobal) window.playSoundGlobal('click');
    }
}

// --- LAB FLEXBOX ---
function updateFlex() {
    const d = document.getElementById('ctrl-direction').value;
    const j = document.getElementById('ctrl-justify').value;
    const a = document.getElementById('ctrl-align').value;
    const g = document.getElementById('ctrl-gap').value;
    const c = document.getElementById('preview-box');
    const out = document.getElementById('code-output');

    if(c) { c.style.flexDirection = d; c.style.justifyContent = j; c.style.alignItems = a; c.style.gap = g; }
    if(out) out.innerText = `.container {\n  display: flex;\n  flex-direction: ${d};\n  justify-content: ${j};\n  align-items: ${a};\n  gap: ${g};\n}`;
}