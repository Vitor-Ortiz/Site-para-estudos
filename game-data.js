/* ARQUIVO: game-data.js - VERSÃO FINAL V33 (CORREÇÃO DE MOEDAS)
   ---------------------------------------------------------
   CORE SYSTEM DO DEVSTUDY
   Integra: Auth, Database, Admin, Shop (XP), Love Shop (Coins),
   LMS, Audio, Segurança e Streak Shield.
   ---------------------------------------------------------
*/

// =================================================
// 1. CONFIGURAÇÃO DO FIREBASE
// =================================================
const firebaseConfig = {
    apiKey: "AIzaSyBnDEycSpeFXYwNwSDhAza5BMbNPvC6JBA",
    authDomain: "devstudy-db.firebaseapp.com",
    projectId: "devstudy-db",
    storageBucket: "devstudy-db.firebasestorage.app",
    messagingSenderId: "894897799858",
    appId: "1:894897799858:web:615292d62afc04af61ffab"
};

// Inicializa apenas se ainda não existir
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();
const auth = firebase.auth();

// Expõe serviços para outros scripts
window.db = db;
window.auth = auth;

// =================================================
// 2. ESTADO GLOBAL (VARIÁVEIS)
// =================================================
window.globalXP = 0;
window.globalLevel = 1;
window.loveCoins = 0;          // Moeda da Loja Love
window.currentUser = null;
window.isAdminUser = false;    // Permissão Admin
window.isLoveUser = false;     // Permissão Página Love
window.userCustomTitle = "";   // Título personalizado

// Estatísticas
window.userStats = { pomodoros: 0, tasks: 0, streak: 0, lessons: [], lastLogin: null };
// Inventário
window.userInventory = []; 
window.userLoadout = { theme: 'theme_default', title: null };

// =================================================
// 3. SISTEMA DE ÁUDIO GLOBAL (COM DEBOUNCE)
// =================================================
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let lastSoundTime = 0;

function playSound(type) {
    const now = Date.now();
    if (now - lastSoundTime < 100) return;
    lastSoundTime = now;

    if (audioCtx.state === 'suspended') audioCtx.resume().catch(()=>{});

    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    const t = audioCtx.currentTime;

    if (type === 'hover') {
        oscillator.type = 'sine'; oscillator.frequency.setValueAtTime(400, t); oscillator.frequency.exponentialRampToValueAtTime(600, t + 0.05); gainNode.gain.setValueAtTime(0.03, t); gainNode.gain.exponentialRampToValueAtTime(0.001, t + 0.05); oscillator.start(t); oscillator.stop(t + 0.05);
    } else if (type === 'click') {
        oscillator.type = 'square'; oscillator.frequency.setValueAtTime(200, t); oscillator.frequency.exponentialRampToValueAtTime(800, t + 0.1); gainNode.gain.setValueAtTime(0.05, t); gainNode.gain.exponentialRampToValueAtTime(0.001, t + 0.1); oscillator.start(t); oscillator.stop(t + 0.1);
    } else if (type === 'success') {
        oscillator.type = 'triangle'; oscillator.frequency.setValueAtTime(400, t); oscillator.frequency.linearRampToValueAtTime(800, t + 0.1); oscillator.frequency.linearRampToValueAtTime(1200, t + 0.3); gainNode.gain.setValueAtTime(0.1, t); gainNode.gain.linearRampToValueAtTime(0, t + 0.5); oscillator.start(t); oscillator.stop(t + 0.5);
    } else if (type === 'error') {
        oscillator.type = 'sawtooth'; oscillator.frequency.setValueAtTime(100, t); oscillator.frequency.linearRampToValueAtTime(50, t + 0.3); gainNode.gain.setValueAtTime(0.1, t); gainNode.gain.linearRampToValueAtTime(0, t + 0.3); oscillator.start(t); oscillator.stop(t + 0.3);
    }
}
window.playSoundGlobal = playSound;

// =================================================
// 4. EFEITOS VISUAIS (CONFETES)
// =================================================
function loadConfetti() {
    if (!window.confetti) {
        const script = document.createElement('script');
        script.src = "https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js";
        document.body.appendChild(script);
    }
}
loadConfetti();

// =================================================
// 5. SISTEMA DE HIERARQUIA (ROLES)
// =================================================
window.getRole = function(level) {
    // 1. Título Equipado da Loja
    if (window.userLoadout && window.userLoadout.title && window.userLoadout.title !== 'default_title') {
        const titles = {
            'title_bug_hunter': 'Bug Hunter 🐛',
            'title_architect': 'Architect 📐',
            'title_wizard': 'Code Wizard 🧙‍♂️',
            'title_ninja': 'Ninja 🥷',
            'title_fs': 'Fullstack 🌐',
            'title_coffee': 'Java Lover ☕',
            'title_hacker': 'Elite Hacker 💀',
            'title_guru': 'Tech Guru 🧘‍♂️',
            'title_love': 'Player 2 ❤️',
            'title_void_walker': 'Void Walker 🌌',
            'title_ai_overlord': 'AI Overlord 🤖',
            'title_time_traveler': 'Time Traveler ⏳',
            'title_neon_samurai': 'Neon Samurai ⚔️',
            'title_cyber_dragon': 'Cyber Dragon 🐲'
        };
        return titles[window.userLoadout.title] || "Operador";
    }
    
    // 2. Títulos Padrão por Nível
    if (level >= 500) return "Are You Admin ⁇";
    if (level >= 50) return "Cyber Legend 👑";
    if (level >= 20) return "Tech Lead 🚀";
    if (level >= 10) return "Developer 💻";
    if (level >= 5)  return "Apprentice ⚡";
    return "Neófito 🌱";
};

// =================================================
// 6. AUTENTICAÇÃO
// =================================================
auth.onAuthStateChanged((user) => {
    if (user) {
        // --- LOGADO ---
        window.currentUser = user;
        const nome = user.displayName || (user.email ? user.email.split('@')[0] : "Dev");
        carregarDados(user.uid, nome, false);
    } else {
        // --- VISITANTE ---
        if (window.location.pathname.includes("admin.html") || window.location.pathname.includes("love.html")) {
            return; // Scripts locais lidam com redirect
        }

        window.currentUser = null;
        let gid = localStorage.getItem('devstudy_guest_id');
        if (!gid) {
            gid = 'guest_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('devstudy_guest_id', gid);
        }
        carregarDados(gid, "Visitante", true);
    }
});

// =================================================
// 7. GESTÃO DE DADOS (CORE)
// =================================================
async function carregarDados(uid, nomeAtual, isGuest) {
    const docRef = db.collection('jogadores').doc(uid);
    try {
        const doc = await docRef.get();
        let data;

        if (doc.exists) {
            data = doc.data();
            
            // === AUTO-DESTRUIÇÃO 24H (CONVIDADOS) ===
            if (isGuest && data.criadoEm) {
                const agora = new Date();
                const criadoEm = data.criadoEm.toDate();
                const diffHoras = Math.abs(agora - criadoEm) / 36e5; // Horas

                if (diffHoras >= 24) {
                    await docRef.delete();
                    localStorage.removeItem('devstudy_guest_id');
                    alert("Sessão de visitante expirada (24h). Reiniciando.");
                    window.location.reload();
                    return;
                }
            }

            // Carrega Estado
            window.globalXP = data.xp || 0;
            window.globalLevel = data.level || 1;
            window.loveCoins = (data.loveCoins !== undefined) ? data.loveCoins : 0;
            window.userCustomTitle = data.customTitle || "";
            
            window.userStats = data.stats || { pomodoros: 0, tasks: 0, streak: 0, lessons: [], lastLogin: null };
            if(!window.userStats.lessons) window.userStats.lessons = [];
            
            window.userInventory = data.inventory || [];
            window.userLoadout = data.loadout || { theme: 'theme_default', title: null };

            // === LÓGICA DE STREAK (DIAS CONSECUTIVOS) ===
            if (!isGuest) {
                const today = new Date().setHours(0,0,0,0);
                const last = data.stats?.lastLogin ? data.stats.lastLogin.toDate().setHours(0,0,0,0) : 0;
                const diffDays = (today - last) / 86400000;

                if (diffDays === 1) {
                    // Dia seguinte: Aumenta Streak
                    window.userStats.streak = (window.userStats.streak || 0) + 1;
                    // Bónus de Streak
                    if (window.userStats.streak % 5 === 0) window.adicionarLoveCoins(50);

                } else if (diffDays > 1) {
                    // Perdeu dias: Verifica Escudo
                    if (window.userInventory.includes('item_shield')) {
                        const idx = window.userInventory.indexOf('item_shield');
                        if (idx > -1) window.userInventory.splice(idx, 1); // Consome
                        showNotification("🛡️ Escudo usado! Streak salva.", "info");
                    } else {
                        window.userStats.streak = 1; // Reseta
                    }
                } else if (diffDays !== 0) {
                    window.userStats.streak = 1; // Primeira vez
                }
                
                window.userStats.lastLogin = firebase.firestore.FieldValue.serverTimestamp();
                docRef.update({ 
                    stats: window.userStats, 
                    inventory: window.userInventory,
                    loveCoins: window.loveCoins
                });
            }

            if (!isGuest && (!data.nome || data.nome === "Convidado")) {
                 docRef.update({ nome: nomeAtual });
            }

        } else {
            // === CRIAÇÃO DE NOVO PERFIL ===
            data = {
                xp: 0, level: 1, loveCoins: 500, // Bónus inicial
                nome: nomeAtual, isAdmin: false, customTitle: "",
                stats: { pomodoros: 0, tasks: 0, streak: 1, lessons: [], lastLogin: firebase.firestore.FieldValue.serverTimestamp() },
                inventory: [], loadout: { theme: 'theme_default' },
                criadoEm: firebase.firestore.FieldValue.serverTimestamp()
            };
            await docRef.set(data);
            
            // Reseta locais
            window.globalXP = 0; window.globalLevel = 1; window.loveCoins = 500;
            window.userStats = data.stats; window.userInventory = []; window.userLoadout = { theme: 'theme_default' };
        }
        
        // === ADMIN CHECK ===
        if(window.currentUser && window.currentUser.email === "vitorortiz512@gmail.com") {
             data.isAdmin = true;
             docRef.update({ isAdmin: true });
        }
        window.isAdminUser = data.isAdmin || false;

        // === LOVE PROTOCOL CHECK (NAMORADA) ===
        if (window.isAdminUser || (window.currentUser && window.currentUser.email === "namorada@gmail.com")) {
            window.isLoveUser = true;
        } else {
            window.isLoveUser = false;
        }
        
        // Aplica o tema visual salvo
        aplicarTema(window.userLoadout.theme);

        // Avisa toda a aplicação que estamos prontos
        window.dispatchEvent(new CustomEvent('gameDataLoaded'));
        atualizarHUD();
        atualizarUIComNome(nomeAtual, !!window.currentUser);

    } catch (error) { console.error("Erro DB:", error); }
}

// =================================================
// 8. SISTEMA DE LOJA E INVENTÁRIO
// =================================================

// Helper para adicionar Love Coins (Página Love/Bónus)
window.adicionarLoveCoins = function(qtd) {
    window.loveCoins += qtd;
    const el = document.getElementById('love-coins');
    if(el) el.innerText = window.loveCoins;
    salvarProgresso();
};

// LOJA PRINCIPAL (Gasta XP)
window.comprarItemGlobal = async function(itemId, price, name, icon) {
    // Verifica XP (Loja Principal)
    if (window.globalXP < price) {
        showNotification("XP Insuficiente! Treine mais.", "error");
        playSound('error');
        return;
    }

    if (confirm(`Comprar "${name}" por ${price} XP?`)) {
        window.globalXP -= price; // Desconta XP
        
        // Adiciona ao inventário
        if (itemId === 'item_shield' || !window.userInventory.includes(itemId)) {
            window.userInventory.push(itemId);
        }

        playSound('success');
        
        if(typeof showPurchaseModal === "function") showPurchaseModal(name, icon);
        else showNotification("Item Adquirido!", "success");
        
        atualizarHUD();
        salvarProgresso();
    }
};

// Equipar Itens
window.equiparItemGlobal = async function(type, itemId) {
    if (!window.userLoadout) window.userLoadout = {};
    window.userLoadout[type] = itemId;
    playSound('click');
    
    if (type === 'theme') aplicarTema(itemId);
    
    const nome = window.currentUser ? window.currentUser.displayName.split(' ')[0] : "Visitante";
    atualizarUIComNome(nome, !!window.currentUser);

    salvarProgresso();
};

// Aplicação de Temas
function aplicarTema(themeId) {
    const root = document.documentElement;
    const body = document.body;
    
    // 1. LIMPEZA GERAL (Remove estrelas e classes antigas)
    body.style.backgroundImage = '';
    body.classList.remove('theme-galaxy-body');
    const oldStars = document.querySelectorAll('.star-effect');
    oldStars.forEach(star => star.remove());
    
    // 2. TEMA PADRÃO
    if (!themeId || themeId === 'theme_default') {
        root.style.setProperty('--primary-neon', '#38bdf8');
        root.style.setProperty('--secondary-neon', '#f472b6');
        root.style.setProperty('--bg-dark', '#0f172a');
        // Recria o gradiente padrão do CSS se necessário
        body.style.backgroundImage = "radial-gradient(circle at 10% 20%, rgba(56, 189, 248, 0.15) 0%, transparent 20%), radial-gradient(circle at 90% 80%, rgba(244, 114, 182, 0.15) 0%, transparent 20%)";
        return;
    }

    // 3. TEMA GALAXY V2 (Animado e Vibrante)
    if (themeId === 'theme_galaxy') {
        root.style.setProperty('--primary-neon', '#c084fc'); // Roxo Cósmico
        root.style.setProperty('--secondary-neon', '#60a5fa'); // Azul Estelar
        root.style.setProperty('--bg-dark', '#030712'); // Preto Espacial
        
        // Gradiente Complexo
        body.style.backgroundImage = `
            radial-gradient(ellipse 80% 50% at 50% -20%, rgba(139, 92, 246, 0.3) 0%, rgba(79, 70, 229, 0.2) 30%, rgba(30, 58, 138, 0.1) 60%, transparent 100%),
            radial-gradient(ellipse 60% 40% at 10% 100%, rgba(219, 39, 119, 0.4) 0%, rgba(219, 39, 119, 0.2) 40%, transparent 80%),
            radial-gradient(ellipse 60% 40% at 90% 100%, rgba(59, 130, 246, 0.4) 0%, rgba(59, 130, 246, 0.2) 40%, transparent 80%),
            linear-gradient(135deg, #030712 0%, #1e1b4b 25%, #3730a3 50%, #1e1b4b 75%, #030712 100%)
        `;
        
        // Gera Estrelas
        const starsContainer = document.createElement('div');
        starsContainer.className = 'star-effect';
        starsContainer.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:-1;';
        
        for (let i = 0; i < 100; i++) {
            const star = document.createElement('div');
            const size = Math.random() * 2 + 1;
            star.style.cssText = `
                position:absolute; width:${size}px; height:${size}px; background:white; border-radius:50%;
                opacity:${Math.random()}; left:${Math.random()*100}%; top:${Math.random()*100}%;
                animation: twinkle ${Math.random()*3+2}s infinite alternate;
            `;
            starsContainer.appendChild(star);
        }
        document.body.appendChild(starsContainer);
        
        // Injeta animação se não existir
        if (!document.querySelector('#star-animation')) {
            const s = document.createElement('style'); s.id = 'star-animation';
            s.textContent = `@keyframes twinkle { 0% { opacity:0.1; transform:scale(0.8); } 100% { opacity:0.8; transform:scale(1.2); } }`;
            document.head.appendChild(s);
        }
        return;
    }

    // 4. OUTROS TEMAS
    const themes = {
        'theme_matrix':  { p:'#00ff00', s:'#008f11', b:'#050a05' },
        'theme_dracula': { p:'#bd93f9', s:'#ff79c6', b:'#282a36' },
        'theme_gold':    { p:'#ffd700', s:'#c0c0c0', b:'#1a1a00' },
        'theme_fire':    { p:'#ff4500', s:'#ff8c00', b:'#1a0500' },
        'theme_neon':    { p:'#b026ff', s:'#00d4ff', b:'#0b001a' },
        'theme_retro':   { p:'#ffb000', s:'#ff5500', b:'#1a1000' },
        'theme_ocean':   { p:'#00bfff', s:'#0077be', b:'#001f3f' },
        'theme_cyberpunk':{ p:'#fcee0a', s:'#0afcce', b:'#220a29' },
        'theme_midnight_purple': { p:'#a855f7', s:'#d8b4fe', b:'#1e1b4b' },
        'theme_acid_green': { p:'#84cc16', s:'#ecfccb', b:'#1a2e05' },
        'theme_crystal_blue': { p:'#06b6d4', s:'#a5f3fc', b:'#083344' },
        'theme_lava_red': { p:'#ef4444', s:'#fca5a5', b:'#450a0a' },
        'theme_cyber_void': { p:'#14b8a6', s:'#99f6e4', b:'#000000' }
    };

    const t = themes[themeId];
    if (t) {
        root.style.setProperty('--primary-neon', t.p);
        root.style.setProperty('--secondary-neon', t.s);
        root.style.setProperty('--bg-dark', t.b);
        body.style.backgroundImage = 'none'; // Remove fundo para cor sólida
    }
}

// =================================================
// 9. PROGRESSO E ESTATÍSTICAS
// =================================================
window.registrarAula = function(lessonId) {
    if(!window.userStats.lessons) window.userStats.lessons = [];
    if(window.userStats.lessons.includes(lessonId)) {
        showNotification("Aula já completada!", "info");
        return;
    }
    window.userStats.lessons.push(lessonId);
    showNotification("Aula Concluída! +50 XP", "success");
    playSound('success');
    adicionarXP(50);
};

window.registrarPomodoro = function() {
    window.userStats.pomodoros = (window.userStats.pomodoros || 0) + 1;
    if(window.userStats.pomodoros === 1) showNotification("🏆 CONQUISTA: Senhor do Tempo!", "success");
    adicionarXP(100);
    window.adicionarLoveCoins(50); // Bónus
};

window.registrarTarefa = function() {
    window.userStats.tasks = (window.userStats.tasks || 0) + 1;
    if(window.userStats.tasks === 3) showNotification("🏆 CONQUISTA: Task Master!", "success");
    adicionarXP(15);
};

async function adicionarXP(qtd) {
    window.globalXP += qtd;
    
    // Level Up Check
    if (window.globalXP >= window.globalLevel * 100) {
        window.globalLevel++;
        
        const role = window.userCustomTitle || window.getRole(window.globalLevel);
        
        if(typeof showLevelUpModal === "function") {
             showLevelUpModal(window.globalLevel, role);
        } else {
             showNotification(`LEVEL UP! NÍVEL ${window.globalLevel}`, "success");
        }
        playSound('success');
        window.adicionarLoveCoins(100); // Bónus Nível
    }
    
    atualizarHUD();
    if(typeof mostrarFloatXP === "function") mostrarFloatXP(qtd);
    salvarProgresso();
}

// Admin Tool: Definir Nível
window.definirNivel = async function(targetUid, novoNivel) {
    const uid = targetUid || (window.currentUser ? window.currentUser.uid : localStorage.getItem('devstudy_guest_id'));
    if(!uid) return;

    try {
        const novoXP = (novoNivel - 1) * 100; 
        await db.collection('jogadores').doc(uid).update({ level: parseInt(novoNivel), xp: novoXP });
        
        if(uid === (window.currentUser?.uid || localStorage.getItem('devstudy_guest_id'))) {
            window.globalLevel = parseInt(novoNivel);
            window.globalXP = novoXP;
            atualizarHUD();
            const nome = window.currentUser ? (window.currentUser.displayName || "Dev") : "Visitante";
            atualizarUIComNome(nome, !!window.currentUser);
            playSound('success');
            showNotification(`Nível definido para ${novoNivel}!`, "success");
        }
    } catch(e) { alert("Erro: " + e.message); }
};

// Função Global de Salvamento
function salvarProgresso() {
    const uid = window.currentUser ? window.currentUser.uid : localStorage.getItem('devstudy_guest_id');
    if(uid) {
        db.collection('jogadores').doc(uid).update({ 
            xp: window.globalXP, 
            level: window.globalLevel, 
            loveCoins: window.loveCoins,
            inventory: window.userInventory,
            loadout: window.userLoadout,
            stats: window.userStats
        }).catch(console.error);
    }
}

// =================================================
// 10. INTERFACE DE UTILIZADOR (UI)
// =================================================
function atualizarHUD() {
    const xpEl = document.getElementById('userXP');
    const lvlEl = document.getElementById('userLevel');
    if (xpEl) xpEl.textContent = window.globalXP;
    if (lvlEl) lvlEl.textContent = window.globalLevel;
}

function atualizarUIComNome(nome, isLogado) {
    const container = document.getElementById('user-info-display');
    
    if (!container) {
        setTimeout(() => atualizarUIComNome(nome, isLogado), 200);
        return;
    }

    // Lógica de Título
    let role = window.getRole(window.globalLevel);
    if (window.userCustomTitle) role = `★ ${window.userCustomTitle}`;

    const isPages = window.location.pathname.includes("/pages/");
    const profileLink = isPages ? "profile.html" : "pages/profile.html";
    const loginLink = isPages ? "login.html" : "pages/login.html";

    if (isLogado) {
        const avatarSrc = window.currentUser && window.currentUser.photoURL 
            ? window.currentUser.photoURL 
            : `https://ui-avatars.com/api/?name=${nome}&background=0D8ABC&color=fff`;

        container.innerHTML = `
            <div class="user-profile-widget">
                <div class="user-details">
                    <a href="${profileLink}" class="user-name" title="Ver Perfil">${nome}</a>
                    <span class="user-role" style="${window.userCustomTitle ? 'color:#f472b6' : ''}">${role}</span>
                </div>
                <a href="${profileLink}" class="user-avatar-link">
                    <img src="${avatarSrc}" alt="Avatar">
                </a>
                <button onclick="fazerLogout()" class="btn-logout" title="Sair">
                    <i class="fas fa-sign-out-alt"></i>
                </button>
            </div>
        `;
    } else {
        container.innerHTML = `
            <a href="${loginLink}" style="text-decoration:none;">
                <div class="user-profile-widget guest" title="Fazer Login">
                    <div class="user-details">
                        <span class="user-name" style="color:#94a3b8;">${nome}</span>
                        <span class="user-role">Clique p/ Entrar</span>
                    </div>
                    <div class="user-avatar-link guest-avatar">
                        <i class="fas fa-user-secret"></i>
                    </div>
                </div>
            </a>
        `;
    }
    atualizarHUD();
}

// SISTEMA DE NOTIFICAÇÃO (TOAST)
function showNotification(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    
    let icon = 'fa-check-circle';
    let color = '#4ade80';

    if (type === 'info') { icon = 'fa-info-circle'; color = '#38bdf8'; }
    if (type === 'error') { icon = 'fa-exclamation-circle'; color = '#ef4444'; }

    toast.style.borderColor = color;
    toast.innerHTML = `
        <i class="fas ${icon} toast-icon" style="color:${color}"></i>
        <span class="toast-text">${message}</span>
    `;
    
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
}

function mostrarFloatXP(qtd) {
    const floatXP = document.createElement('div');
    floatXP.textContent = `+${qtd} XP`;
    floatXP.style.cssText = "position:fixed; left:50%; top:50%; transform:translate(-50%, -50%); color:#4ade80; font-weight:bold; font-size:2rem; z-index:9999; pointer-events:none; animation:floatUp 1.5s ease-out forwards;";
    document.body.appendChild(floatXP);
    setTimeout(() => floatXP.remove(), 1500);
}

function showLevelUpModal(level, role) {
    const modal = document.createElement('div');
    modal.className = 'level-up-overlay';
    modal.innerHTML = `
        <div class="level-up-card">
            <div class="level-up-content">
                <div class="level-up-icon"><i class="fas fa-crown"></i></div>
                <h2 class="level-up-title">LEVEL UP!</h2>
                <p style="color: #94a3b8; margin-bottom: 5px;">Nível ${level} Alcançado</p>
                <div class="level-up-role">${role}</div>
                <button class="btn-claim" onclick="closeLevelModal(this)">CONTINUAR</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    if (window.confetti) window.confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#facc15', '#38bdf8', '#f472b6'] });
}

function showPurchaseModal(name, iconClass) {
    const modal = document.createElement('div');
    modal.className = 'level-up-overlay';
    modal.innerHTML = `
        <div class="level-up-card" style="border-color: #4ade80; box-shadow: 0 0 50px rgba(74, 222, 128, 0.3);">
            <div class="level-up-content">
                <div class="level-up-icon" style="color: #4ade80;"><i class="fas ${iconClass}"></i></div>
                <h2 class="level-up-title">COMPRA SUCESSO!</h2>
                <p style="color: #94a3b8; margin-bottom: 5px;">Adquiriste:</p>
                <div class="level-up-role" style="color: white;">${name}</div>
                <button class="btn-claim" onclick="closeLevelModal(this)" style="background: #4ade80; color: #000;">CONFIRMAR</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    if (window.confetti) window.confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#4ade80', '#ffffff', '#38bdf8'] });
}

window.closeLevelModal = function(btn) {
    const modal = btn.closest('.level-up-overlay');
    modal.style.opacity = '0';
    setTimeout(() => modal.remove(), 300);
    playSound('click');
}

function fazerLogout() {
    auth.signOut().then(() => {
        window.location.href = window.location.pathname.includes("/pages/") ? "../index.html" : "index.html";
    });
}

// CSS Injetado para garantir animações de Toast e XP (Fallback)
(function(){
    const s=document.createElement('style');
    s.innerHTML=`
    @keyframes floatUp{0%{transform:translate(-50%,-50%);opacity:1}100%{transform:translate(-50%,-150%);opacity:0}}
    @keyframes toastIn{from{transform:translateX(-50%) translateY(20px);opacity:0}to{transform:translateX(-50%) translateY(0);opacity:1}}
    .xp-floater{position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);color:#4ade80;font-weight:bold;font-size:2rem;z-index:9999;pointer-events:none;text-shadow:0 0 10px rgba(0,0,0,0.5);animation:floatUp 1.5s ease-out forwards;font-family:monospace}
    .toast-notification{position:fixed;bottom:30px;left:50%;transform:translateX(-50%);background:#0f172a;border:1px solid #4ade80;padding:12px 24px;border-radius:50px;color:white;display:flex;align-items:center;gap:10px;box-shadow:0 10px 30px rgba(0,0,0,0.5);z-index:10000;animation:toastIn 0.4s forwards;font-family:sans-serif}
    `;
    document.head.appendChild(s);
})();

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const interactives = document.querySelectorAll('button, a, .interactive-btn, .card');
        interactives.forEach(el => {
            el.addEventListener('mouseenter', () => playSound('hover'));
        });
    }, 1000);
});