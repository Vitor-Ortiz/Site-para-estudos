/* assets/js/profile.js - Gestão de Perfil Completa */

document.addEventListener('DOMContentLoaded', () => {
    // Verifica se os dados globais já existem
    if (window.currentUser || window.globalLevel > 1) {
        renderProfile();
    } else {
        // Se não, espera pelo evento do game-data.js
        window.addEventListener('gameDataLoaded', renderProfile);
        // Fallback de segurança para carregar mesmo se o evento já tiver passado
        setTimeout(renderProfile, 1500);
    }
});

function renderProfile() {
    // Pega dados das variáveis globais (definidas no game-data.js)
    const user = window.currentUser;
    const xp = window.globalXP || 0;
    const level = window.globalLevel || 1;
    const stats = window.userStats || { streak: 0, pomodoros: 0, tasks: 0, dailyQuests: [] };
    
    // --- LÓGICA DE TÍTULO ---
    // Prioridade: Título Personalizado > Título do Nível
    const roleText = window.userCustomTitle ? `★ ${window.userCustomTitle}` : window.getRole(level);
    
    // --- DOM ELEMENTS ---
    const nameEl = document.getElementById('profile-name');
    const roleEl = document.getElementById('profile-role');
    const lvlBadge = document.getElementById('profile-lvl-badge');
    const xpEl = document.getElementById('profile-xp');
    const idEl = document.getElementById('profile-id');
    const streakEl = document.getElementById('streak-days');
    const avatarEl = document.getElementById('profile-avatar');

    // Preenchimento de Texto
    if(nameEl) nameEl.textContent = user ? (user.displayName || "Operador") : "Visitante";
    
    if(roleEl) {
        roleEl.textContent = roleText;
        // Estilo especial se for título customizado
        if (window.userCustomTitle) {
            roleEl.style.color = "#f472b6";
            roleEl.style.borderColor = "#f472b6";
            roleEl.style.background = "rgba(244, 114, 182, 0.1)";
        }
    }

    if(lvlBadge) lvlBadge.textContent = level;
    if(xpEl) xpEl.textContent = xp.toLocaleString();
    if(idEl) idEl.textContent = user ? '#' + user.uid.substring(0, 6).toUpperCase() : "#GUEST";
    if(streakEl) streakEl.textContent = stats.streak || 0;

    // --- LÓGICA DE AVATAR ---
    // 1. Tenta customizado (URL ou Base64 salvo no Loadout)
    // 2. Tenta foto do Google
    // 3. Usa placeholder com iniciais
    if (window.userLoadout && window.userLoadout.customAvatar) {
        avatarEl.src = window.userLoadout.customAvatar;
    } else if (user && user.photoURL) {
        avatarEl.src = user.photoURL;
    } else {
        const n = user ? (user.displayName || "U") : "U";
        avatarEl.src = `https://ui-avatars.com/api/?name=${n}&background=0f172a&color=38bdf8&bold=true`;
    }

    // --- BARRA DE PROGRESSO ---
    // Supondo 100 XP por nível para visualização
    const xpCurrentLevel = xp % 100; 
    const percent = xpCurrentLevel + "%";
    const barFill = document.getElementById('profile-xp-bar');
    const xpText = document.getElementById('xp-percent');
    
    if(barFill) barFill.style.width = percent;
    if(xpText) xpText.textContent = percent;

    // --- RENDERIZAÇÃO DOS COMPONENTES ---
    renderDailyQuests(stats.dailyQuests);
    renderChart(level, xp, stats);
    renderMedals(level);
}

// =================================================
// 1. MISSÕES DIÁRIAS
// =================================================
function renderDailyQuests(quests) {
    const list = document.getElementById('daily-quests-list');
    if(!list) return;
    list.innerHTML = '';

    // Se não houver missões (ex: primeiro login ou erro), mostra fallback ou gera visualmente
    // Nota: A lógica real de gerar missões deve estar no game-data.js, aqui apenas exibimos.
    // Se a lista estiver vazia, mostra placeholders para não ficar feio.
    const displayQuests = (quests && quests.length > 0) ? quests : [
        { text: "Fazer Login diário", xp: 50, done: true },
        { text: "Completar 1 Pomodoro", xp: 100, done: (window.userStats?.pomodoros > 0) },
        { text: "Visitar a Matrix", xp: 20, done: false }
    ];

    displayQuests.forEach(q => {
        const div = document.createElement('div');
        div.className = `quest-item ${q.done ? 'completed' : ''}`;
        
        div.innerHTML = `
            <div class="quest-info">
                <h4>${q.text}</h4>
                <span class="quest-xp">+${q.xp} XP</span>
            </div>
            <div class="quest-check">
                ${q.done ? '<i class="fas fa-check"></i>' : ''}
            </div>
        `;
        list.appendChild(div);
    });
}

// =================================================
// 2. GRÁFICO (RADAR CHART)
// =================================================
let skillsChartInstance = null;

function renderChart(level, xp, stats) {
    const canvas = document.getElementById('skillsChart');
    if(!canvas) return;

    const ctx = canvas.getContext('2d');
    
    // Destrói gráfico anterior para evitar sobreposição
    if (skillsChartInstance) {
        skillsChartInstance.destroy();
    }

    // Dados Dinâmicos Baseados no Progresso
    const htmlSkill = Math.min(100, level * 8 + 20);
    const cssSkill = Math.min(100, level * 7 + 15);
    const jsSkill = Math.min(100, level * 5 + 10);
    const logicSkill = Math.min(100, (stats.tasks || 0) * 10);
    const focusSkill = Math.min(100, (stats.pomodoros || 0) * 5);

    skillsChartInstance = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['HTML', 'CSS', 'JS', 'Lógica', 'Foco'],
            datasets: [{
                label: 'Nível de Habilidade',
                data: [htmlSkill, cssSkill, jsSkill, logicSkill, focusSkill],
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
                        font: { family: "'Fira Code', monospace", size: 11 }
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

// =================================================
// 3. GALERIA DE MEDALHAS
// =================================================
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
        div.className = `medal-item ${isUnlocked ? 'unlocked' : 'locked'}`;
        
        div.innerHTML = `
            <i class="fas ${m.icon}"></i>
            <p>${m.title}</p>
            ${!isUnlocked ? `<span class="lock-tag">Lvl ${m.lvl}</span>` : ''}
        `;
        gallery.appendChild(div);
    });
}

// =================================================
// 4. SISTEMA DE AVATAR (MODAL & UPLOAD)
// =================================================

// Abrir/Fechar Modal
window.openAvatarModal = () => {
    const modal = document.getElementById('avatar-modal');
    if(modal) modal.style.display = 'flex';
};

window.closeAvatarModal = () => {
    const modal = document.getElementById('avatar-modal');
    if(modal) modal.style.display = 'none';
};

// Selecionar Avatar (Preset ou URL)
window.selectAvatar = async function(url) {
    if (!window.userLoadout) window.userLoadout = {};
    
    // Atualiza localmente
    window.userLoadout.customAvatar = url;
    const img = document.getElementById('profile-avatar');
    if(img) img.src = url;
    
    // Salva no Firebase (chama função global do game-data.js)
    // Tenta usar a função de salvar global, se não existir, tenta update manual
    if (window.salvarProgressoGlobal) {
        window.salvarProgressoGlobal();
    } else {
        // Fallback direto ao Firestore se a função global não estiver exposta
        const uid = window.currentUser ? window.currentUser.uid : localStorage.getItem('devstudy_guest_id');
        if(uid && window.db) {
            await window.db.collection('jogadores').doc(uid).update({
                loadout: window.userLoadout
            });
        }
    }
    
    if(window.playSoundGlobal) window.playSoundGlobal('success');
    closeAvatarModal();
};

// Salvar via Input de URL
window.saveCustomAvatar = () => {
    const url = document.getElementById('avatar-url-input').value;
    if(url) selectAvatar(url);
};

// Upload de Arquivo Local (Converte para Base64)
window.handleFileUpload = function(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const base64Image = e.target.result;
            // Verifica tamanho (opcional, para não estourar o localStorage/Firestore)
            if (base64Image.length > 1000000) { // ~1MB limit warning
                alert("Imagem muito grande! Tente uma menor.");
                return;
            }
            selectAvatar(base64Image);
        };
        
        reader.readAsDataURL(input.files[0]);
    }
};