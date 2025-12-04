/* assets/js/header.js - Versão Final (Caminhos + Login Inteligente) */

document.addEventListener("DOMContentLoaded", () => {
    const header = document.querySelector("header");
    if (!header) return;

    // 1. DETECÇÃO DE CAMINHO INTELIGENTE
    const pathname = window.location.pathname;
    let rootPath = "./";

    // Nível 2: Dentro de /pages/admin/ ou /pages/lua/
    if (pathname.includes("/pages/admin/") || pathname.includes("/pages/lua/") || pathname.includes("/pages/atlas/")) {
        rootPath = "../../";
    } 
    // Nível 1: Dentro de /pages/
    else if (pathname.includes("/pages/")) {
        rootPath = "../";
    }
    // Nível 0: Raiz (index.html) usa "./"

    // 2. LOGO DESTINO (Padrão para Index, muda se logado depois)
    let logoLink = `${rootPath}index.html`;

    // 3. RENDERIZAÇÃO DO HTML
    header.innerHTML = `
        <div class="container">
            <div class="header-content">
                <a href="${logoLink}" class="logo" id="app-logo">&lt;Dev<span>Study</span>/&gt;</a>
                
                <nav class="main-nav">
                    <ul>
                        <li><a href="${rootPath}index.html#html">HTML</a></li>
                        <li><a href="${rootPath}index.html#css">CSS</a></li>
                        <li><a href="${rootPath}index.html#javascript">JS</a></li>
                        
                        <li><a href="${rootPath}pages/docs.html">Docs</a></li>
                        <li><a href="${rootPath}pages/challenges.html">Matrix</a></li>
                        <li><a href="${rootPath}pages/pentest.html" style="color:#ef4444;"><i class="fas fa-terminal"></i> Pentest</a></li>
                        
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
                    <div id="user-info-display">
                        <a href="${rootPath}pages/login.html" class="btn-sm btn-outline" style="text-decoration:none; color:#94a3b8; border:1px solid #334155; padding:5px 15px; border-radius:6px; font-size:0.8rem;">
                            Login
                        </a>
                    </div>
                    
                    <div class="xp-container" style="display:none;" id="xp-display-box">
                        <span class="xp-label">LVL <span id="userLevel">...</span></span>
                        <span class="xp-value"><span id="userXP">...</span> XP</span>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    highlightActiveLink();
    
    // Inicia verificação de Auth
    monitorarLogin(rootPath);
});

// 4. LÓGICA DE LOGIN E VISIBILIDADE
function monitorarLogin(rootPath) {
    // Tenta esperar o Firebase carregar
    const check = setInterval(() => {
        if (window.auth && window.db) {
            clearInterval(check);
            
            window.auth.onAuthStateChanged((user) => {
                const logo = document.getElementById('app-logo');
                const adminItem = document.getElementById('admin-nav-item');
                const loveItem = document.getElementById('love-nav-item');
                const xpBox = document.getElementById('xp-display-box');

                if (user) {
                    // SE LOGADO:
                    // 1. Logo vai para Home (ou Challenges se não tiver Home)
                    logo.href = `${rootPath}pages/home.html`; 
                    logo.title = "Ir para Dashboard";
                    
                    // 2. Mostra XP
                    if(xpBox) xpBox.style.display = "flex";

                    // 3. Verifica Admin no Banco (Delay pequeno pra dar tempo do game-data)
                    setTimeout(() => {
                        if (window.isAdminUser) adminItem.style.display = 'block';
                        if (window.isAdminUser || window.isLoveUser) loveItem.style.display = 'block';
                    }, 500);

                } else {
                    // SE DESLOGADO:
                    logo.href = `${rootPath}index.html`;
                    if(xpBox) xpBox.style.display = "none";
                    if(adminItem) adminItem.style.display = 'none';
                }
            });
        }
    }, 200); // Checa a cada 200ms
}

// 5. DESTAQUE DO LINK ATIVO
function highlightActiveLink() {
    const currentFile = window.location.pathname.split("/").pop();
    const links = document.querySelectorAll("nav a");
    
    links.forEach(link => {
        const href = link.getAttribute("href");
        if (href && href.includes(currentFile) && currentFile !== "" && !href.includes("#")) {
            link.classList.add("active-link");
        }
    });
}