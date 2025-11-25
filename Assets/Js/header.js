/* assets/js/header.js - Atualizado com Admin */

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
                        <li><a href="${path}pages/game.html" style="color: #facc15"><i class="fas fa-gamepad"></i> Game</a></li>
                        
                        <li id="admin-nav-item" style="display:none;">
                            <a href="${path}pages/admin.html" class="admin-link" style="display:block">ADMIN</a>
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

    // Verificar Admin assim que o Header carrega (caso dados já existam)
    checkAdminVisibility();
});

// Ouve o evento do game-data.js
window.addEventListener('gameDataLoaded', checkAdminVisibility);

function checkAdminVisibility() {
    const adminItem = document.getElementById('admin-nav-item');
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