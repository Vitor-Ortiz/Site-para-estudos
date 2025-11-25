/* assets/js/profile.js - Lógica do Perfil V2 */

document.addEventListener('DOMContentLoaded', () => {
    // Verifica se os dados globais já existem
    if (window.currentUser || window.globalLevel > 1) {
        renderProfile();
    } else {
        // Se não, espera pelo evento do game-data.js
        window.addEventListener('gameDataLoaded', renderProfile);
        // Fallback de segurança
        setTimeout(renderProfile, 1500);
    }
});

function renderProfile() {
    // Pega dados das variáveis globais (definidas no game-data.js)
    const user = window.currentUser;
    const xp = window.globalXP || 0;
    const level = window.globalLevel || 1;
    
    // --- CORREÇÃO DO TÍTULO AQUI ---
    // Prioridade: Título Personalizado > Título do Nível
    const roleText = window.userCustomTitle ? `★ ${window.userCustomTitle}` : window.getRole(level);
    
    // Elementos DOM
    const nameEl = document.getElementById('profile-name');
    const roleEl = document.getElementById('profile-role');
    const lvlBadge = document.getElementById('profile-lvl-badge');
    const xpEl = document.getElementById('profile-xp');
    const idEl = document.getElementById('profile-id');
    const avatarEl = document.getElementById('profile-avatar');

    if(nameEl) nameEl.textContent = user ? (user.displayName || "Utilizador") : "Visitante";
    
    if(roleEl) {
        roleEl.textContent = roleText;
        // Se for título personalizado, muda a cor para Rosa, senão usa Amarelo padrão
        if (window.userCustomTitle) {
            roleEl.style.color = "#f472b6";
            roleEl.style.borderColor = "#f472b6";
            roleEl.style.background = "rgba(244, 114, 182, 0.1)";
        }
    }

    if(lvlBadge) lvlBadge.textContent = level;
    if(xpEl) xpEl.textContent = xp.toLocaleString();
    if(idEl) idEl.textContent = user ? user.uid.substring(0, 8) : "#GUEST";
    
    if (avatarEl) {
        if (user && user.photoURL) {
            avatarEl.src = user.photoURL;
        } else {
            // Avatar gerado com iniciais se não tiver foto
            const nome = user ? (user.displayName || "U") : "U";
            avatarEl.src = `https://ui-avatars.com/api/?name=${nome}&background=0f172a&color=38bdf8&bold=true`;
        }
    }

    // Barra de XP (Cálculo visual: 0 a 100%)
    const xpCurrentLevel = xp % 100; 
    const percent = xpCurrentLevel + "%";
    const barFill = document.getElementById('profile-xp-bar');
    const xpText = document.getElementById('xp-percent');
    
    if(barFill) barFill.style.width = percent;
    if(xpText) xpText.textContent = percent;

    // Renderizar Gráficos e Medalhas
    if(typeof renderChart === "function") renderChart(level, xp);
    if(typeof renderMedals === "function") renderMedals(level);
}

// --- GRÁFICO CHART.JS ---
function renderChart(level, xp) {
    const canvas = document.getElementById('skillsChart');
    if(!canvas) return;

    const ctx = canvas.getContext('2d');
    
    // Simulação de atributos baseados no nível
    const htmlSkill = Math.min(100, level * 5 + 20);
    const cssSkill = Math.min(100, level * 4 + 15);
    const jsSkill = Math.min(100, level * 3 + 10);
    const logicSkill = Math.min(100, level * 2 + 5);
    const debugSkill = Math.min(100, xp / 50); // Baseado em XP total

    // Destrói gráfico anterior se existir (para não sobrepor ao atualizar)
    if(window.myProfileChart) window.myProfileChart.destroy();

    window.myProfileChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['HTML', 'CSS', 'JS', 'Lógica', 'Debug'],
            datasets: [{
                label: 'Nível de Habilidade',
                data: [htmlSkill, cssSkill, jsSkill, logicSkill, debugSkill],
                backgroundColor: 'rgba(56, 189, 248, 0.2)',
                borderColor: '#38bdf8',
                pointBackgroundColor: '#facc15',
                pointBorderColor: '#fff',
                borderWidth: 2
            }]
        },
        options: {
            scales: {
                r: {
                    angleLines: { color: 'rgba(255,255,255,0.1)' },
                    grid: { color: 'rgba(255,255,255,0.1)' },
                    pointLabels: {
                        color: '#94a3b8',
                        font: { family: "'Fira Code', monospace", size: 10 }
                    },
                    ticks: { display: false, max: 100 },
                    suggestedMin: 0,
                    suggestedMax: 100
                }
            },
            plugins: { legend: { display: false } }
        }
    });
}

// --- MEDALHAS ---
function renderMedals(level) {
    const gallery = document.getElementById('medals-gallery');
    if(!gallery) return;

    const medals = [
        { lvl: 1, icon: 'fa-seedling', title: 'Iniciado' },
        { lvl: 5, icon: 'fa-code', title: 'Coder' },
        { lvl: 10, icon: 'fa-rocket', title: 'Hacker' },
        { lvl: 20, icon: 'fa-crown', title: 'Lenda' },
        { lvl: 50, icon: 'fa-dragon', title: 'Mítico' }
    ];

    gallery.innerHTML = '';

    medals.forEach(m => {
        const isUnlocked = level >= m.lvl;
        const div = document.createElement('div');
        div.className = `medal-item ${isUnlocked ? 'unlocked' : 'locked'}`; // Adiciona classe locked explicita
        
        div.innerHTML = `
            <div class="medal-icon-wrapper">
                <i class="fas ${m.icon}"></i>
            </div>
            <p>${m.title}</p>
            ${!isUnlocked ? `<span class="lock-tag">Lvl ${m.lvl}</span>` : ''}
        `;
        gallery.appendChild(div);
    });
}