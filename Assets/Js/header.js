/* assets/js/header.js - V3 Final */

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
                        <li><a href="${path}pages/game.html" class="highlight-link"><i class="fas fa-gamepad"></i> Game</a></li>
                        
                        <li id="admin-nav-item" style="display:none;">
                            <a href="${path}pages/admin.html" class="admin-link"><i class="fas fa-shield-alt"></i> ADMIN</a>
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
    
    // Verifica se já somos admin (caso os dados tenham chegado antes do header)
    checkAdminVisibility();
});

// Ouve o evento que vem do game-data.js quando o login termina
window.addEventListener('gameDataLoaded', checkAdminVisibility);

function checkAdminVisibility() {
    const adminItem = document.getElementById('admin-nav-item');
    // Verifica a variável global window.isAdminUser que definimos no game-data.js
    if (window.isAdminUser && adminItem) {
        adminItem.style.display = 'block';
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