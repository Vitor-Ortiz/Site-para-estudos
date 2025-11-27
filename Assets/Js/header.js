/* assets/js/header.js - Versão Final (Correção de Caminhos) */

document.addEventListener("DOMContentLoaded", () => {
    const header = document.querySelector("header");
    if (!header) return;

    // 1. DETECÇÃO DE CAMINHO INTELIGENTE
    // Verifica onde o arquivo atual está para ajustar os links (../ ou ../../)
    const pathname = window.location.pathname;
    let rootPath = "./";

    // Se estiver dentro de /pages/atlas/ (2 níveis de profundidade)
    if (pathname.includes("/pages/atlas/")) {
        rootPath = "../../";
    } 
    // Se estiver apenas em /pages/ (1 nível de profundidade)
    else if (pathname.includes("/pages/")) {
        rootPath = "../";
    }
    // Se estiver na raiz (index.html), mantém "./"

    // 2. RENDERIZAÇÃO DO HTML
    header.innerHTML = `
        <div class="container">
            <div class="header-content">
                <a href="${rootPath}index.html" class="logo" id="app-logo">&lt;Dev<span>Study</span>/&gt;</a>
                
                <nav class="main-nav">
                    <ul>
                        <li><a href="${rootPath}index.html#html">HTML</a></li>
                        <li><a href="${rootPath}index.html#css">CSS</a></li>
                        <li><a href="${rootPath}index.html#javascript">JS</a></li>
                        
                        <li><a href="${rootPath}pages/docs.html">Docs</a></li>
                        <li><a href="${rootPath}pages/challenges.html">Matrix</a></li>
                        
                        <li><a href="${rootPath}pages/chat.html" style="color:var(--primary-neon)"><i class="fas fa-comments"></i> Taverna</a></li>
                        
                        <li><a href="${rootPath}pages/shop.html" style="color:#a855f7"><i class="fas fa-shopping-bag"></i> Loja</a></li>
                        
                        <li><a href="${rootPath}pages/game.html" class="highlight-link"><i class="fas fa-gamepad"></i> Game</a></li>
                        
                        <li id="admin-nav-item" style="display:none;">
                            <a href="${rootPath}pages/admin.html" class="admin-link">ADMIN</a>
                        </li>
                        <li id="love-nav-item" style="display:none;">
                            <a href="${rootPath}pages/love.html" style="color:#ff1493;"><i class="fas fa-heart"></i></a>
                        </li>
                    </ul>
                </nav>

                <div class="user-area">
                    <div id="user-info-display"></div>
                    
                    <div class="xp-container">
                        <span class="xp-label">LVL <span id="userLevel">...</span></span>
                        <span class="xp-value"><span id="userXP">...</span> XP</span>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    highlightActiveLink();
    checkVisibility();
});

// 3. VERIFICAÇÃO DE PERMISSÕES (ADMIN/LOVE)
// Ouve o evento disparado pelo game-data.js quando o login termina
window.addEventListener('gameDataLoaded', checkVisibility);

function checkVisibility() {
    // Botão Admin
    const adminItem = document.getElementById('admin-nav-item');
    if (window.isAdminUser && adminItem) {
        adminItem.style.display = 'block';
    }

    // Botão Love
    const loveItem = document.getElementById('love-nav-item');
    if ((window.isAdminUser || window.isLoveUser) && loveItem) {
        loveItem.style.display = 'block';
    }
}

// 4. DESTAQUE DO LINK ATIVO
function highlightActiveLink() {
    const currentFile = window.location.pathname.split("/").pop();
    const links = document.querySelectorAll("nav a");
    
    links.forEach(link => {
        const href = link.getAttribute("href");
        // Marca ativo se for o arquivo atual e não for um link âncora (#)
        if (href.includes(currentFile) && currentFile !== "" && !href.includes("#")) {
            link.classList.add("active-link");
        }
    });
}