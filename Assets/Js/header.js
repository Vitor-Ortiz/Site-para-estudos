/* assets/js/header.js - V5 (Love Icon Added) */

document.addEventListener("DOMContentLoaded", () => {
    const header = document.querySelector("header");
    if (!header) return;

    const isPages = window.location.pathname.includes("/pages/");
    const path = isPages ? "../" : "./"; 

    header.innerHTML = `
        <div class="container">
            <div class="header-content">
                <a href="${path}index.html" class="logo">&lt;Dev<span>Study</span>/&gt;</a>
                
                <nav class="main-nav">
                    <ul>
                        <li><a href="${path}index.html#html">HTML</a></li>
                        <li><a href="${path}index.html#css">CSS</a></li>
                        <li><a href="${path}index.html#javascript">JS</a></li>
                        <li><a href="${path}pages/docs.html">Docs</a></li>
                        <li><a href="${path}pages/challenges.html">Matrix</a></li>
                        <li><a href="${path}pages/shop.html" style="color:#a855f7"><i class="fas fa-shopping-bag"></i> Loja</a></li>
                        <li><a href="${path}pages/game.html" class="highlight-link"><i class="fas fa-gamepad"></i> Game</a></li>
                        
                        <li id="admin-nav-item" style="display:none;">
                            <a href="${path}pages/admin.html" class="admin-link">ADMIN</a>
                        </li>

                        <li id="love-nav-item" style="display:none;">
                            <a href="${path}pages/love.html" style="color:#ff1493;"><i class="fas fa-heart"></i></a>
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

// Ouve quando os dados carregam para verificar permissões
window.addEventListener('gameDataLoaded', checkVisibility);

function checkVisibility() {
    // Admin
    const adminItem = document.getElementById('admin-nav-item');
    if (window.isAdminUser && adminItem) adminItem.style.display = 'block';

    // Love Page (Se for Admin OU LoveUser)
    const loveItem = document.getElementById('love-nav-item');
    if ((window.isAdminUser || window.isLoveUser) && loveItem) {
        loveItem.style.display = 'block';
    }
}

function highlightActiveLink() {
    const currentFile = window.location.pathname.split("/").pop();
    const links = document.querySelectorAll("nav a");
    links.forEach(link => {
        if (link.getAttribute("href").includes(currentFile) && currentFile !== "") {
            link.classList.add("active-link");
        }
    });
}