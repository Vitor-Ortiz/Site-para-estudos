/* ARQUIVO: game-data.js - V5 (Audio Global + Roles + Correção Header) */

// --- 1. Configuração do Firebase ---
const firebaseConfig = {
    apiKey: "AIzaSyBnDEycSpeFXYwNwSDhAza5BMbNPvC6JBA",
    authDomain: "devstudy-db.firebaseapp.com",
    projectId: "devstudy-db",
    storageBucket: "devstudy-db.firebasestorage.app",
    messagingSenderId: "894897799858",
    appId: "1:894897799858:web:615292d62afc04af61ffab"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();
const auth = firebase.auth();

// --- 2. Variáveis Globais ---
let globalXP = 0;
let globalLevel = 1;
let currentUser = null;

// --- 3. SISTEMA DE ÁUDIO GLOBAL ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    const now = audioCtx.currentTime;

    if (type === 'hover') {
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(400, now);
        oscillator.frequency.exponentialRampToValueAtTime(600, now + 0.05);
        gainNode.gain.setValueAtTime(0.03, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        oscillator.start(now);
        oscillator.stop(now + 0.05);
    } else if (type === 'click') {
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(200, now);
        oscillator.frequency.exponentialRampToValueAtTime(800, now + 0.1);
        gainNode.gain.setValueAtTime(0.05, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        oscillator.start(now);
        oscillator.stop(now + 0.1);
    } else if (type === 'success') {
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(400, now);
        oscillator.frequency.linearRampToValueAtTime(800, now + 0.1);
        oscillator.frequency.linearRampToValueAtTime(1200, now + 0.3);
        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.linearRampToValueAtTime(0, now + 0.5);
        oscillator.start(now);
        oscillator.stop(now + 0.5);
    } else if (type === 'error') {
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(100, now);
        oscillator.frequency.linearRampToValueAtTime(50, now + 0.3);
        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.linearRampToValueAtTime(0, now + 0.3);
        oscillator.start(now);
        oscillator.stop(now + 0.3);
    }
}

// Expõe a função globalmente
window.playSoundGlobal = playSound;

// --- 4. SISTEMA DE ROLES (CARGOS) ---
function getRole(level) {
    if (level >= 50) return "Cyber Legend 👑";
    if (level >= 20) return "Tech Lead 🚀";
    if (level >= 10) return "Developer 💻";
    if (level >= 5) return "Apprentice ⚡";
    return "Neófito 🌱";
}

// --- 5. Inicialização ---
auth.onAuthStateChanged((user) => {
    if (user) {
        // LOGADO
        currentUser = user;
        carregarDados(user.uid);

        const nome = user.displayName ? user.displayName.split(' ')[0] : "Dev";
        atualizarUIComNome(nome, true);
    } else {
        // CONVIDADO
        let guestId = localStorage.getItem('devstudy_guest_id');
        if (!guestId) {
            guestId = 'guest_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('devstudy_guest_id', guestId);
        }
        carregarDados(guestId);
        atualizarUIComNome("Visitante", false);
    }
});

// --- 6. Carregar/Salvar ---
async function carregarDados(uid) {
    const docRef = db.collection('jogadores').doc(uid);
    try {
        const doc = await docRef.get();
        let data;

        if (doc.exists) {
            data = doc.data();
            globalXP = data.xp || 0;
            globalLevel = data.level || 1;
        } else {
            data = {
                xp: 0, level: 1,
                nome: currentUser ? currentUser.displayName : "Convidado",
                isAdmin: false,
                criadoEm: firebase.firestore.FieldValue.serverTimestamp()
            };
            await docRef.set(data);
        }
        if (currentUser && currentUser.email === "vitorortiz512@gmail.com") { // <--- Coloca o teu email aqui!
            data.isAdmin = true;
            docRef.update({ isAdmin: true });
        }

        // Guarda se é admin globalmente
        window.isAdminUser = data.isAdmin || false;

        // Dispara evento para o header.js saber que carregou
        window.dispatchEvent(new CustomEvent('gameDataLoaded'));

        atualizarHUD();
    } catch (error) { console.error("Erro DB:", error); }
}

async function adicionarXP(qtd) {
    const roleAntiga = getRole(globalLevel);
    globalXP += qtd;

    // Level Up
    if (globalXP >= globalLevel * 100) {
        globalLevel++;
        const roleNova = getRole(globalLevel);

        if (roleNova !== roleAntiga) {
            alert(`🏆 PROMOÇÃO! Cargo Novo: ${roleNova}`);
        } else {
            alert(`🎉 LEVEL UP! NÍVEL ${globalLevel}!`);
        }
        playSound('success');
    } else {
        playSound('success');
    }

    atualizarHUD();
    mostrarFloatXP(qtd);

    // Atualiza cargo na UI
    const nome = currentUser ? currentUser.displayName.split(' ')[0] : "Visitante";
    atualizarUIComNome(nome, !!currentUser);

    const uid = currentUser ? currentUser.uid : localStorage.getItem('devstudy_guest_id');
    if (uid) {
        db.collection('jogadores').doc(uid).update({ xp: globalXP, level: globalLevel }).catch(console.error);
    }
}

// --- 7. Interface (CORRIGIDA COM TIMEOUT) ---
function atualizarHUD() {
    const xpEl = document.getElementById('userXP');
    const lvlEl = document.getElementById('userLevel');
    // Se o header ainda não existe, não faz mal, o atualizarUIComNome vai chamar isto de novo
    if (xpEl) xpEl.textContent = globalXP;
    if (lvlEl) lvlEl.textContent = globalLevel;
}

function atualizarUIComNome(nome, isLogado) {
    const container = document.getElementById('user-info-display');

    // IMPORTANTE: Se o header.js ainda não criou o HTML, espera e tenta de novo
    if (!container) {
        setTimeout(() => atualizarUIComNome(nome, isLogado), 500);
        return;
    }

    const role = getRole(globalLevel);

    if (isLogado) {
        container.innerHTML = `
            <div style="text-align: right; line-height: 1.2;">
                <span style="color: #4ade80; font-family: 'Fira Code', monospace; font-size: 0.9rem;">
                    <i class="fas fa-user-astronaut"></i> ${nome}
                </span>
                <br>
                <span style="color: #facc15; font-size: 0.7rem; font-family: 'Inter', sans-serif; letter-spacing: 1px; text-transform: uppercase;">
                    ${role}
                </span>
            </div>
            <button onclick="fazerLogout()" style="margin-left: 10px; background:none; border:1px solid rgba(248, 113, 113, 0.5); border-radius: 4px; color:#f87171; cursor:pointer; font-size:0.7rem; padding: 4px 8px; transition: all 0.2s;" title="Sair">
                <i class="fas fa-sign-out-alt"></i>
            </button>
        `;
    } else {
        container.innerHTML = `
            <div style="text-align: right;">
                <span style="color: #94a3b8; font-family: 'Fira Code', monospace; font-size: 0.9rem;">
                    <i class="fas fa-user-secret"></i> ${nome}
                </span>
                <br>
                <span style="color: #64748b; font-size: 0.7rem;">${role}</span>
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

function fazerLogout() {
    auth.signOut().then(() => {
        window.location.reload();
    });
}

// Ativa sons globais
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const interactives = document.querySelectorAll('button, a, .interactive-btn, .card');
        interactives.forEach(el => {
            el.addEventListener('mouseenter', () => playSound('hover'));
        });
    }, 1000);
});