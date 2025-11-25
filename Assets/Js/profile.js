/* assets/js/profile.js - Lógica do Perfil */

document.addEventListener('DOMContentLoaded', () => {
    // Aguarda os dados do game-data.js
    // Usamos um listener ou um timeout se já estiver carregado
    if (window.currentUser || window.globalLevel > 1) {
        renderProfile();
    } else {
        window.addEventListener('gameDataLoaded', renderProfile);
        // Fallback
        setTimeout(renderProfile, 1000);
    }
});

function renderProfile() {
    // 1. Preencher ID Card
    const user = window.currentUser;
    const xp = window.globalXP || 0;
    const level = window.globalLevel || 1;
    
    document.getElementById('profile-name').textContent = user ? user.displayName : "Visitante";
    document.getElementById('profile-role').textContent = getRole(level);
    document.getElementById('profile-lvl-badge').textContent = level;
    document.getElementById('profile-xp').textContent = xp;
    document.getElementById('profile-id').textContent = user ? user.uid.substring(0, 8) : "#GUEST";
    
    if (user && user.photoURL) {
        document.getElementById('profile-avatar').src = user.photoURL;
    } else {
        document.getElementById('profile-avatar').src = "https://cdn-icons-png.flaticon.com/512/149/149071.png"; // Avatar padrão
    }

    // Barra de XP (Cálculo Simples: cada nível são 100 XP)
    const xpCurrentLevel = xp % 100;
    const percent = xpCurrentLevel + "%";
    document.getElementById('profile-xp-bar').style.width = percent;
    document.getElementById('xp-percent').textContent = percent;

    // 2. Renderizar Gráfico (Chart.js)
    renderChart(level, xp);

    // 3. Renderizar Medalhas
    renderMedals(level);
}

function renderChart(level, xp) {
    const ctx = document.getElementById('skillsChart').getContext('2d');
    
    // Simulando skills baseadas no XP total
    // No futuro, podemos salvar XP separado por categoria (HTML, CSS, JS)
    const htmlSkill = Math.min(100, level * 10 + 20);
    const cssSkill = Math.min(100, level * 8 + 15);
    const jsSkill = Math.min(100, level * 5 + 10);
    const debugSkill = Math.min(100, xp / 20);

    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['HTML5', 'CSS3', 'JavaScript', 'Debugging', 'Design'],
            datasets: [{
                label: 'Nível de Competência',
                data: [htmlSkill, cssSkill, jsSkill, debugSkill, cssSkill - 10],
                backgroundColor: 'rgba(56, 189, 248, 0.2)',
                borderColor: '#38bdf8',
                pointBackgroundColor: '#facc15',
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
                        font: { family: "'Fira Code', monospace" }
                    },
                    ticks: { display: false, max: 100 }
                }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });
}

function renderMedals(level) {
    const gallery = document.getElementById('medals-gallery');
    const medals = [
        { lvl: 1, icon: 'fa-seedling', title: 'Iniciado' },
        { lvl: 5, icon: 'fa-code', title: 'Coder' },
        { lvl: 10, icon: 'fa-rocket', title: 'Hacker' },
        { lvl: 20, icon: 'fa-crown', title: 'Lenda' }
    ];

    gallery.innerHTML = '';

    medals.forEach(m => {
        const isUnlocked = level >= m.lvl;
        const div = document.createElement('div');
        div.className = `medal-item ${isUnlocked ? 'unlocked' : ''}`;
        div.innerHTML = `
            <i class="fas ${m.icon}"></i>
            <p>${m.title}</p>
            ${!isUnlocked ? `<small style="font-size:0.6rem; color:#666">Lvl ${m.lvl}</small>` : ''}
        `;
        gallery.appendChild(div);
    });
}