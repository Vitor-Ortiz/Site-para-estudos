/* ARQUIVO: game-data.js - V9 (New Roles + Admin Tools) */

// --- 1. Configuração do Firebase ---
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

// --- 2. Variáveis Globais (Expostas para todo o site) ---
window.globalXP = 0;
window.globalLevel = 1;
window.currentUser = null;
window.isAdminUser = false;
window.userCustomTitle = "";

// --- 3. Sistema de Áudio Global ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    const now = audioCtx.currentTime;

    if (type === 'hover') {
        oscillator.type = 'sine'; oscillator.frequency.setValueAtTime(400, now); oscillator.frequency.exponentialRampToValueAtTime(600, now + 0.05); gainNode.gain.setValueAtTime(0.03, now); gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.05); oscillator.start(now); oscillator.stop(now + 0.05);
    } else if (type === 'click') {
        oscillator.type = 'square'; oscillator.frequency.setValueAtTime(200, now); oscillator.frequency.exponentialRampToValueAtTime(800, now + 0.1); gainNode.gain.setValueAtTime(0.05, now); gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1); oscillator.start(now); oscillator.stop(now + 0.1);
    } else if (type === 'success') {
        oscillator.type = 'triangle'; oscillator.frequency.setValueAtTime(400, now); oscillator.frequency.linearRampToValueAtTime(800, now + 0.1); oscillator.frequency.linearRampToValueAtTime(1200, now + 0.3); gainNode.gain.setValueAtTime(0.1, now); gainNode.gain.linearRampToValueAtTime(0, now + 0.5); oscillator.start(now); oscillator.stop(now + 0.5);
    } else if (type === 'error') {
        oscillator.type = 'sawtooth'; oscillator.frequency.setValueAtTime(100, now); oscillator.frequency.linearRampToValueAtTime(50, now + 0.3); gainNode.gain.setValueAtTime(0.1, now); gainNode.gain.linearRampToValueAtTime(0, now + 0.3); oscillator.start(now); oscillator.stop(now + 0.3);
    }
}
window.playSoundGlobal = playSound;

// --- 4. Carregador de Confetes ---
function loadConfetti() {
    if (!window.confetti) {
        const script = document.createElement('script');
        script.src = "https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js";
        document.body.appendChild(script);
    }
}
loadConfetti();

// --- 5. Sistema de Roles (Cargos) - ATUALIZADO ---
window.getRole = function(level) {
    if (level >= 500) return "Are You Admin ⁇"; // NOVO TÍTULO SECRETO
    if (level >= 50) return "Cyber Legend 👑";
    if (level >= 20) return "Tech Lead 🚀";
    if (level >= 10) return "Developer 💻";
    if (level >= 5)  return "Apprentice ⚡";
    return "Neófito 🌱";
};

// --- 6. Inicialização e Auth Listener ---
auth.onAuthStateChanged((user) => {
    if (user) {
        window.currentUser = user;
        console.log("Conectado como:", user.email);
        carregarDados(user.uid);
        const nome = user.displayName ? user.displayName.split(' ')[0] : "Dev";
        atualizarUIComNome(nome, true);
    } else {
        window.currentUser = null;
        let guestId = localStorage.getItem('devstudy_guest_id');
        if (!guestId) {
            guestId = 'guest_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('devstudy_guest_id', guestId);
        }
        carregarDados(guestId);
        atualizarUIComNome("Visitante", false);
    }
});

// --- 7. Carregar Dados do Firestore ---
async function carregarDados(uid) {
    const docRef = db.collection('jogadores').doc(uid);
    try {
        const doc = await docRef.get();
        let data;

        if (doc.exists) {
            data = doc.data();
            window.globalXP = data.xp || 0;
            window.globalLevel = data.level || 1;
            window.userCustomTitle = data.customTitle || "";
        } else {
            data = {
                xp: 0, level: 1,
                nome: window.currentUser ? window.currentUser.displayName : "Convidado",
                isAdmin: false,
                customTitle: "",
                criadoEm: firebase.firestore.FieldValue.serverTimestamp()
            };
            await docRef.set(data);
            window.globalXP = 0;
            window.globalLevel = 1;
        }
        
        // Admin Check
        if(window.currentUser && window.currentUser.email === "vitorortiz512@gmail.com") {
             data.isAdmin = true;
             docRef.update({ isAdmin: true });
        }
        window.isAdminUser = data.isAdmin || false;
        
        window.dispatchEvent(new CustomEvent('gameDataLoaded'));
        atualizarHUD();
        const nome = window.currentUser ? window.currentUser.displayName.split(' ')[0] : "Visitante";
        atualizarUIComNome(nome, !!window.currentUser);

    } catch (error) { console.error("Erro DB:", error); }
}

// --- 8. Funções de XP e Nível ---

// Adicionar XP (Normal)
async function adicionarXP(qtd) {
    const roleAntiga = window.getRole(window.globalLevel);
    window.globalXP += qtd;
    
    if (window.globalXP >= window.globalLevel * 100) {
        window.globalLevel++;
        
        // Se existir título customizado, usa ele no modal
        const displayRole = window.userCustomTitle || window.getRole(window.globalLevel);
        
        if(typeof showLevelUpModal === "function") {
             showLevelUpModal(window.globalLevel, displayRole);
        } else {
             alert(`LEVEL UP! ${window.globalLevel}`);
        }
        playSound('success');
    } else {
        playSound('success');
    }

    atualizarHUD();
    if(typeof mostrarFloatXP === "function") mostrarFloatXP(qtd);

    salvarProgresso();
}

// NOVA FUNÇÃO: Definir Nível Manualmente (Admin Tool)
// Uso no Console: definirNivel('ID_DO_USUARIO', 500)
window.definirNivel = async function(targetUid, novoNivel) {
    // Se não passar UID, tenta aplicar a si mesmo
    const uid = targetUid || (window.currentUser ? window.currentUser.uid : localStorage.getItem('devstudy_guest_id'));
    
    if(!uid) return console.error("Usuário não identificado");

    try {
        // Calcula XP base para esse nível (Ex: Nível 500 = 50000 XP)
        const novoXP = (novoNivel - 1) * 100; 
        
        await db.collection('jogadores').doc(uid).update({
            level: parseInt(novoNivel),
            xp: novoXP
        });
        
        console.log(`✅ Sucesso! Usuário ${uid} agora é Nível ${novoNivel}`);
        
        // Se for o próprio usuário, atualiza a tela
        if(uid === (window.currentUser?.uid || localStorage.getItem('devstudy_guest_id'))) {
            window.globalLevel = parseInt(novoNivel);
            window.globalXP = novoXP;
            atualizarHUD();
            const nome = window.currentUser ? window.currentUser.displayName.split(' ')[0] : "Visitante";
            atualizarUIComNome(nome, !!window.currentUser);
            playSound('success');
            alert(`HACK DE SISTEMA: Nível alterado para ${novoNivel}!`);
        } else {
            alert(`Usuário atualizado para Nível ${novoNivel}`);
        }

    } catch(e) {
        console.error("Erro ao definir nível:", e);
        alert("Erro: " + e.message);
    }
};

// Função auxiliar para salvar
function salvarProgresso() {
    const nome = window.currentUser ? window.currentUser.displayName.split(' ')[0] : "Visitante";
    atualizarUIComNome(nome, !!window.currentUser);

    const uid = window.currentUser ? window.currentUser.uid : localStorage.getItem('devstudy_guest_id');
    if(uid) {
        db.collection('jogadores').doc(uid).update({ xp: window.globalXP, level: window.globalLevel }).catch(console.error);
    }
}

// --- 9. Interface e UI ---

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

    const role = window.userCustomTitle ? `★ ${window.userCustomTitle}` : window.getRole(window.globalLevel);
    
    const isPages = window.location.pathname.includes("/pages/");
    const profileLink = isPages ? "profile.html" : "pages/profile.html";

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
            <div class="user-profile-widget guest">
                <div class="user-details">
                    <span class="user-name">${nome}</span>
                    <span class="user-role">${role}</span>
                </div>
                <div class="user-avatar-link guest-avatar">
                    <i class="fas fa-user-secret"></i>
                </div>
            </div>
        `;
    }
    atualizarHUD();
}

function mostrarFloatXP(qtd) {
    const floatXP = document.createElement('div');
    floatXP.textContent = `+${qtd} XP`;
    floatXP.style.position = 'fixed';
    floatXP.style.left = '50%';
    floatXP.style.top = '50%';
    floatXP.style.transform = 'translate(-50%, -50%)';
    floatXP.style.color = '#4ade80';
    floatXP.style.fontWeight = 'bold';
    floatXP.style.fontSize = '2rem';
    floatXP.style.zIndex = '9999';
    floatXP.style.pointerEvents = 'none';
    floatXP.style.animation = 'floatUp 1.5s ease-out forwards';
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

window.closeLevelModal = function(btn) {
    const modal = btn.closest('.level-up-overlay');
    modal.style.opacity = '0';
    setTimeout(() => modal.remove(), 300);
    playSound('click');
}

function fazerLogout() {
    auth.signOut().then(() => {
        window.location.reload();
    });
}

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const interactives = document.querySelectorAll('button, a, .interactive-btn, .card');
        interactives.forEach(el => {
            el.addEventListener('mouseenter', () => playSound('hover'));
        });
    }, 1000);
});