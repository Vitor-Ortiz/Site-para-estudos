/* ARQUIVO: game-data.js - VERSÃO FINAL V25 (REVISADA)
   Funcionalidades:
   1. Autenticação & Segurança
   2. Sistema de Admin & Roles
   3. Áudio Global & Confetes
   4. Limpeza Automática de Convidados (24h)
   5. Estatísticas (Pomodoro/Tarefas)
   6. Loja e Inventário (Comprar/Equipar/Consumir)
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

// Inicializa Firebase apenas uma vez
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();
const auth = firebase.auth();

// Expõe serviços para outros scripts (Admin.js, Login.js)
window.db = db;
window.auth = auth;

// =================================================
// 2. ESTADO GLOBAL (VARIÁVEIS)
// =================================================
window.globalXP = 0;
window.globalLevel = 1;
window.currentUser = null;
window.isAdminUser = false;
window.userCustomTitle = "";
// Estatísticas completas (incluindo aulas e streak)
window.userStats = { pomodoros: 0, tasks: 0, streak: 0, lessons: [], lastLogin: null };
window.userInventory = [];
window.userLoadout = { theme: 'theme_default', title: null };

// =================================================
// 3. SISTEMA DE ÁUDIO GLOBAL (COM PROTEÇÃO)
// =================================================
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let lastSoundTime = 0; // Previne som duplicado

function playSound(type) {
    // Debounce: Impede sons muito rápidos (menos de 100ms)
    const now = Date.now();
    if (now - lastSoundTime < 100) return;
    lastSoundTime = now;

    if (audioCtx.state === 'suspended') audioCtx.resume();
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
            'title_coffee': 'Java Lover ☕'
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
// 6. AUTENTICAÇÃO E INICIALIZAÇÃO
// =================================================
auth.onAuthStateChanged((user) => {
    if (user) {
        // --- USUÁRIO LOGADO ---
        window.currentUser = user;
        console.log("Conectado como:", user.email);
        
        // Define nome seguro
        const nome = user.displayName || (user.email ? user.email.split('@')[0] : "Dev");
        
        // Carrega dados (false = não é convidado)
        carregarDados(user.uid, nome, false);
    } else {
        // --- VISITANTE ---
        
        // Segurança: Bloqueia acesso direto ao Admin sem login
        if (window.location.pathname.includes("admin.html")) {
            console.warn("Admin protegido. Login necessário.");
            return; // O script do admin.js fará o redirect
        }

        window.currentUser = null;
        
        // Gestão de ID Temporário
        let guestId = localStorage.getItem('devstudy_guest_id');
        if (!guestId) {
            guestId = 'guest_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('devstudy_guest_id', guestId);
        }
        
        // true = É convidado (Ativa timer de 24h)
        carregarDados(guestId, "Visitante", true);
    }
});

// =================================================
// 7. GESTÃO DE DADOS (CARREGAR/SALVAR/RESETAR)
// =================================================
async function carregarDados(uid, nomeAtual, isGuest) {
    const docRef = db.collection('jogadores').doc(uid);
    try {
        const doc = await docRef.get();
        let data;

        if (doc.exists) {
            data = doc.data();
            
            // === LÓGICA DE AUTO-DESTRUIÇÃO (24 HORAS) ===
            if (isGuest && data.criadoEm) {
                const agora = new Date();
                const criadoEm = data.criadoEm.toDate();
                const diffHoras = Math.abs(agora - criadoEm) / 36e5; // Horas

                if (diffHoras >= 24) {
                    console.log("Sessão expirada. Resetando...");
                    await docRef.delete();
                    localStorage.removeItem('devstudy_guest_id');
                    alert("Sua sessão temporária de 24h expirou. O progresso foi reiniciado.");
                    window.location.reload();
                    return;
                }
            }

            // Carrega Estado
            window.globalXP = data.xp || 0;
            window.globalLevel = data.level || 1;
            window.userCustomTitle = data.customTitle || "";
            
            // Garante estrutura de stats e inventário
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
                } else if (diffDays > 1) {
                    // Perdeu dias: Verifica Escudo
                    if (window.userInventory.includes('item_shield')) {
                        const idx = window.userInventory.indexOf('item_shield');
                        if (idx > -1) window.userInventory.splice(idx, 1); // Consome
                        showNotification("🛡️ Escudo usado! Streak salvo.", "info");
                    } else {
                        window.userStats.streak = 1; // Reseta
                    }
                } else if (diffDays !== 0) {
                    window.userStats.streak = 1; // Primeira vez
                }
                
                window.userStats.lastLogin = firebase.firestore.FieldValue.serverTimestamp();
                docRef.update({ stats: window.userStats, inventory: window.userInventory });
            }

            // Atualiza nome se necessário
            if (!isGuest && (data.nome === "Convidado" || !data.nome)) {
                 docRef.update({ nome: nomeAtual });
            }

        } else {
            // --- CRIAÇÃO DE NOVO PERFIL ---
            data = {
                xp: 0, level: 1,
                nome: nomeAtual,
                isAdmin: false,
                customTitle: "",
                stats: { pomodoros: 0, tasks: 0, streak: 1, lessons: [], lastLogin: firebase.firestore.FieldValue.serverTimestamp() },
                inventory: [],
                loadout: { theme: 'theme_default' },
                criadoEm: firebase.firestore.FieldValue.serverTimestamp()
            };
            await docRef.set(data);
            
            // Reseta locais
            window.globalXP = 0; window.globalLevel = 1;
            window.userStats = data.stats; window.userInventory = []; window.userLoadout = { theme: 'theme_default' };
        }
        
        // --- VERIFICAÇÃO DE ADMIN SUPREMO ---
        if(window.currentUser && window.currentUser.email === "vitorortiz512@gmail.com") {
             data.isAdmin = true;
             docRef.update({ isAdmin: true });
        }
        window.isAdminUser = data.isAdmin || false;
        
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
window.comprarItemGlobal = async function(itemId, price, name, icon) {
    if (window.globalXP < price) {
        showNotification("XP Insuficiente!", "error");
        playSound('error');
        return;
    }

    if (confirm(`Comprar "${name}" por ${price} XP?`)) {
        window.globalXP -= price;
        
        // Adiciona ao inventário
        // Se for item consumível (Escudo), permite adicionar múltiplos
        // Se for tema/título, apenas 1
        if (itemId === 'item_shield' || !window.userInventory.includes(itemId)) {
            window.userInventory.push(itemId);
        }

        playSound('success');
        
        // Animação
        if(typeof showPurchaseModal === "function") showPurchaseModal(name, icon);
        else showNotification("Item Adquirido!", "success");
        
        atualizarHUD();
        salvarProgresso();
    }
};

window.equiparItemGlobal = async function(type, itemId) {
    if (!window.userLoadout) window.userLoadout = {};
    
    // Atualiza loadout
    window.userLoadout[type] = itemId;
    playSound('click');

    // Aplica efeito imediato (se for tema)
    if (type === 'theme') aplicarTema(itemId);
    
    // Atualiza UI (se for título, o nome muda no header)
    const nome = window.currentUser ? window.currentUser.displayName.split(' ')[0] : "Visitante";
    atualizarUIComNome(nome, !!window.currentUser);

    salvarProgresso();
};

function aplicarTema(themeId) {
    const root = document.documentElement;
    
    // Reset para Padrão
    if (!themeId || themeId === 'theme_default') {
        root.style.setProperty('--primary-neon', '#38bdf8');
        root.style.setProperty('--secondary-neon', '#f472b6');
        root.style.setProperty('--bg-dark', '#0f172a');
        return;
    }

    // Temas Especiais
    const themes = {
        'theme_matrix':  { p: '#00ff00', s: '#008f11', b:'#050a05' },
        'theme_dracula': { p: '#bd93f9', s: '#ff79c6', b:'#282a36' },
        'theme_gold':    { p: '#ffd700', s: '#c0c0c0', b:'#1a1a00' },
        'theme_fire':    { p: '#ff4500', s: '#ff8c00', b:'#1a0500' },
        'theme_neon':    { p: '#b026ff', s: '#00d4ff', b:'#0b001a' },
        'theme_retro':   { p: '#ffb000', s: '#ff5500', b:'#1a1000' }
    };

    const theme = themes[themeId];
    if (theme) {
        root.style.setProperty('--primary-neon', theme.p);
        root.style.setProperty('--secondary-neon', theme.s);
        root.style.setProperty('--bg-dark', theme.b);
    }
}

// =================================================
// 9. PROGRESSO E ESTATÍSTICAS
// =================================================
// Registar Aula (LMS)
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
        
        const displayRole = window.userCustomTitle || window.getRole(window.globalLevel);
        
        if(typeof showLevelUpModal === "function") {
             showLevelUpModal(window.globalLevel, displayRole);
        } else {
             showNotification(`LEVEL UP! NÍVEL ${window.globalLevel}`, "success");
        }
        playSound('success');
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
        
        // Se for o próprio usuário, atualiza a tela
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
    
    // Retry system: Se o header.js ainda não criou o HTML, espera e tenta de novo
    if (!container) {
        setTimeout(() => atualizarUIComNome(nome, isLogado), 200);
        return;
    }

    // Lógica de Título: Custom > Loja > Nível
    let role = window.userCustomTitle ? `★ ${window.userCustomTitle}` : window.getRole(window.globalLevel);

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

// Modal de Compra
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

// SISTEMA DE NOTIFICAÇÃO (TOAST)
function showNotification(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = 'toast-notification'; // Usa a classe do CSS
    
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

function fazerLogout() {
    auth.signOut().then(() => {
        window.location.href = window.location.pathname.includes("/pages/") ? "../index.html" : "index.html";
    });
}

// Inicializador de Sons
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const interactives = document.querySelectorAll('button, a, .interactive-btn, .card');
        interactives.forEach(el => {
            el.addEventListener('mouseenter', () => playSound('hover'));
        });
    }, 1000);
});