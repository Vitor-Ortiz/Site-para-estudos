/* ARQUIVO: game-data.js - VERSÃO FINAL V33 (COM CORES DE TÍTULOS)
   ---------------------------------------------------------
   CORE SYSTEM DO DEVSTUDY
   Integra: Auth, Database, Admin, Shop (LoveCoins), LMS, 
   Audio, Segurança e Protocolo Love.
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

// Expõe serviços para outros scripts (Admin.js, Login.js)
window.db = db;
window.auth = auth;

// =================================================
// 2. ESTADO GLOBAL (VARIÁVEIS)
// =================================================
window.globalXP = 0;
window.globalLevel = 1;
window.loveCoins = 0;          // Moeda da Loja
window.currentUser = null;
window.isAdminUser = false;    // Permissão Admin
window.isLoveUser = false;     // Permissão Página Love
window.userCustomTitle = "";   // Título personalizado pelo Admin

// Estatísticas completas
window.userStats = {
    pomodoros: 0,
    tasks: 0,
    streak: 0,
    lessons: [],
    lastLogin: null
};

// Inventário e Personalização
window.userInventory = [];
window.userLoadout = { theme: 'theme_default', title: null };

// =================================================
// 2.1 SISTEMA DE CORES DOS TÍTULOS
// =================================================
const TITLE_COLORS = {
    // Títulos Clássicos
    'default_title': '#94a3b8',      // Cinza (Padrão)
    'title_bug_hunter': '#ef4444',   // Vermelho
    'title_architect': '#38bdf8',    // Azul Ciano
    'title_wizard': '#a855f7',       // Roxo Mágico
    'title_ninja': '#10b981',        // Verde Esmeralda
    'title_fs': '#facc15',           // Amarelo Ouro
    'title_coffee': '#d97706',       // Café
    'title_hacker': '#22c55e',       // Verde Matrix
    'title_guru': '#0ea5e9',         // Azul Celeste
    'title_love': '#ff1493',         // Rosa Choque (Namorada)
    
    // Títulos Cósmicos/Místicos
    'title_void_walker': '#64748b',  // Cinza Escuro
    'title_ai_overlord': '#f43f5e',  // Rosa Avermelhado
    'title_time_traveler': '#fb923c',// Laranja
    'title_digital_shaman': '#2dd4bf', // Turquesa
    'title_neon_samurai': '#c084fc', // Roxo Neon
    'title_quantum_ghost': '#e879f9', // Rosa Fantasma
    'title_data_alchemist': '#fcd34d', // Dourado Claro
    'title_cyber_dragon': '#8b5cf6',  // Roxo Dragão
    
    // NOVOS TÍTULOS ADICIONADOS
    'title_cyber_sentinel': '#00ff88',     // Verde Cyber
    'title_code_breaker': '#ff5500',       // Laranja Elétrico
    'title_netrunner': '#00eeff',          // Azul Holográfico
    'title_binary_mage': '#ff00ff',        // Magenta
    'title_cyber_gladiator': '#ffd700',    // Dourado
    'title_data_miner': '#84cc16',         // Verde Mineração
    'title_quantum_coder': '#00f7ff',      // Ciano Quântico
    'title_cyber_shinobi': '#a855f7',      // Roxo Shinobi
    'title_ai_whisperer': '#00ffcc',       // Verde AI
    'title_bug_exterminator': '#ef4444',   // Vermelho Exterminador
    'title_memory_hacker': '#b026ff',      // Roxo Memória
    'title_cyber_samurai': '#fcee0a'       // Amarelo Samurai
};

// =================================================
// 3. SISTEMA DE ÁUDIO GLOBAL (COM DEBOUNCE)
// =================================================
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let lastSoundTime = 0;

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
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(400, t);
        oscillator.frequency.exponentialRampToValueAtTime(600, t + 0.05);
        gainNode.gain.setValueAtTime(0.03, t);
        gainNode.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
        oscillator.start(t); oscillator.stop(t + 0.05);
    }
    else if (type === 'click') {
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(200, t);
        oscillator.frequency.exponentialRampToValueAtTime(800, t + 0.1);
        gainNode.gain.setValueAtTime(0.05, t);
        gainNode.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
        oscillator.start(t); oscillator.stop(t + 0.1);
    }
    else if (type === 'success') {
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(400, t);
        oscillator.frequency.linearRampToValueAtTime(800, t + 0.1);
        oscillator.frequency.linearRampToValueAtTime(1200, t + 0.3);
        gainNode.gain.setValueAtTime(0.1, t);
        gainNode.gain.linearRampToValueAtTime(0, t + 0.5);
        oscillator.start(t); oscillator.stop(t + 0.5);
    }
    else if (type === 'error') {
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(100, t);
        oscillator.frequency.linearRampToValueAtTime(50, t + 0.3);
        gainNode.gain.setValueAtTime(0.1, t);
        gainNode.gain.linearRampToValueAtTime(0, t + 0.3);
        oscillator.start(t); oscillator.stop(t + 0.3);
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
window.getRole = function (level) {
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
            'title_digital_shaman': 'Digital Shaman 🌀',
            'title_neon_samurai': 'Neon Samurai ⚔️',
            'title_quantum_ghost': 'Quantum Ghost 👻',
            'title_data_alchemist': 'Data Alchemist 🔮',
            'title_cyber_dragon': 'Cyber Dragon 🐲',
            // NOVOS TÍTULOS
            'title_cyber_sentinel': 'Cyber Sentinel 🛡️',
            'title_code_breaker': 'Code Breaker 🔓',
            'title_netrunner': 'Netrunner 🏃‍♂️',
            'title_binary_mage': 'Binary Mage 🔢',
            'title_cyber_gladiator': 'Cyber Gladiator ⚔️',
            'title_data_miner': 'Data Miner ⛏️',
            'title_quantum_coder': 'Quantum Coder ⚛️',
            'title_cyber_shinobi': 'Cyber Shinobi 🥷',
            'title_ai_whisperer': 'AI Whisperer 🤫',
            'title_bug_exterminator': 'Bug Exterminator 🐜',
            'title_memory_hacker': 'Memory Hacker 🧠',
            'title_cyber_samurai': 'Cyber Samurai 🗡️'
        };
        return titles[window.userLoadout.title] || "Operador";
    }

    // 2. Títulos Padrão por Nível
    if (level >= 500) return "Are You Admin ⁇";
    if (level >= 50) return "Cyber Legend 👑";
    if (level >= 20) return "Tech Lead 🚀";
    if (level >= 10) return "Developer 💻";
    if (level >= 5) return "Apprentice ⚡";
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

        // Carrega dados (false = NÃO é convidado)
        carregarDados(user.uid, nome, false);
    } else {
        // --- VISITANTE ---

        // Segurança: Bloqueia acesso direto ao Admin/Love sem login
        if (window.location.pathname.includes("admin.html") || window.location.pathname.includes("love.html")) {
            // Deixa os scripts específicos da página lidarem com o redirect
            return;
        }

        window.currentUser = null;

        // Gestão de ID Temporário
        let guestId = localStorage.getItem('devstudy_guest_id');
        if (!guestId) {
            guestId = 'guest_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('devstudy_guest_id', guestId);
        }

        // Carrega dados (true = É convidado, ativa timer 24h)
        carregarDados(guestId, "Visitante", true);
    }
});

// =================================================
// 7. GESTÃO DE DADOS (CORE) - MANTIDO IGUAL
// =================================================
async function carregarDados(uid, nomeAtual, isGuest) {
    const docRef = db.collection('jogadores').doc(uid);
    try {
        const doc = await docRef.get();
        let data;

        if (doc.exists) {
            data = doc.data();

            // === AUTO-DESTRUIÇÃO (24H) ===
            if (isGuest && data.criadoEm) {
                const agora = new Date();
                const criadoEm = data.criadoEm.toDate();
                const diffHoras = Math.abs(agora - criadoEm) / 36e5; // Horas

                if (diffHoras >= 24) {
                    console.log("Sessão expirada. Resetando...");
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

            // Garante estrutura de stats e inventário
            window.userStats = data.stats || { pomodoros: 0, tasks: 0, streak: 0, lessons: [], lastLogin: null };
            if (!window.userStats.lessons) window.userStats.lessons = [];

            window.userInventory = data.inventory || [];
            window.userLoadout = data.loadout || { theme: 'theme_default', title: null };

            // === LÓGICA DE STREAK (DIAS CONSECUTIVOS) ===
            if (!isGuest) {
                const today = new Date().setHours(0, 0, 0, 0);
                const last = data.stats?.lastLogin ? data.stats.lastLogin.toDate().setHours(0, 0, 0, 0) : 0;
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

            // Atualiza nome se necessário
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

        // === VERIFICAÇÃO DE ADMIN ===
        if (window.currentUser && window.currentUser.email === "vitorortiz512@gmail.com") {
            data.isAdmin = true;
            docRef.update({ isAdmin: true });
        }
        window.isAdminUser = data.isAdmin || false;

        // === VERIFICAÇÃO DE LOVE USER (NAMORADA) ===
        if (window.isAdminUser || (window.currentUser && window.currentUser.name === "Yasmim Sanches")) {
            window.isLoveUser = true;
            console.log("❤️ Acesso Especial: Concedido");
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
// 8. SISTEMA DE LOJA E INVENTÁRIO - MANTIDO IGUAL
// =================================================

// Helper para adicionar Love Coins (Página Love/Bónus)
window.adicionarLoveCoins = function (qtd) {
    window.loveCoins += qtd;
    const el = document.getElementById('love-coins');
    if (el) el.innerText = window.loveCoins;
    salvarProgresso();
};

// LOJA PRINCIPAL (Gasta XP)
window.comprarItemGlobal = async function (itemId, price, name, icon) {
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

        if (typeof showPurchaseModal === "function") showPurchaseModal(name, icon);
        else showNotification("Item Adquirido!", "success");

        atualizarHUD();
        salvarProgresso();
    }
};

// Equipar Itens
window.equiparItemGlobal = async function (type, itemId) {
    if (!window.userLoadout) window.userLoadout = {};
    window.userLoadout[type] = itemId;
    playSound('click');

    if (type === 'theme') aplicarTema(itemId);

    const nome = window.currentUser ? window.currentUser.displayName.split(' ')[0] : "Visitante";
    atualizarUIComNome(nome, !!window.currentUser);

    salvarProgresso();
};

// =================================================
// 8.1 APLICAR TEMAS - MANTIDO IGUAL (já estava completo)
// =================================================
function aplicarTema(themeId) {
    const root = document.documentElement;
    const body = document.body;

    // Limpa temas anteriores
    body.style.backgroundImage = '';
    body.classList.remove('theme-galaxy-body');
    const stars = document.querySelectorAll('.star-effect');
    stars.forEach(s => s.remove());
    const binaryRain = document.querySelectorAll('.binary-rain-effect');
    binaryRain.forEach(b => b.remove());
    const neuralNet = document.querySelectorAll('.neural-net-effect');
    neuralNet.forEach(n => n.remove());
    const glitch = document.querySelectorAll('.glitch-effect');
    glitch.forEach(g => g.remove());
    const quantum = document.querySelectorAll('.quantum-effect');
    quantum.forEach(q => q.remove());

    // Reset para Padrão
    if (!themeId || themeId === 'theme_default') {
        root.style.setProperty('--primary-neon', '#38bdf8');
        root.style.setProperty('--secondary-neon', '#f472b6');
        root.style.setProperty('--bg-dark', '#0f172a');
        body.style.backgroundImage = "radial-gradient(circle at 10% 20%, rgba(56, 189, 248, 0.15) 0%, transparent 20%), radial-gradient(circle at 90% 80%, rgba(244, 114, 182, 0.15) 0%, transparent 20%)";
        return;
    }

    // Tema GALAXY (Especial)
    if (themeId === 'theme_galaxy') {
        root.style.setProperty('--primary-neon', '#d946ef');
        root.style.setProperty('--secondary-neon', '#8b5cf6');
        root.style.setProperty('--bg-dark', '#0f0c29');

        body.style.backgroundImage = `
            radial-gradient(ellipse 80% 50% at 50% -20%, rgba(139, 92, 246, 0.3) 0%, rgba(79, 70, 229, 0.2) 30%, transparent 100%),
            linear-gradient(135deg, #030712 0%, #1e1b4b 50%, #030712 100%)
        `;

        // Cria Estrelas
        const c = document.createElement('div');
        c.className = 'star-effect';
        c.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:-1;';
        for (let i = 0; i < 80; i++) {
            const s = document.createElement('div');
            const sz = Math.random() * 2 + 1;
            s.style.cssText = `position:absolute;width:${sz}px;height:${sz}px;background:white;border-radius:50%;opacity:${Math.random()};left:${Math.random() * 100}%;top:${Math.random() * 100}%;animation:twinkle ${Math.random() * 3 + 2}s infinite alternate;`;
            c.appendChild(s);
        }
        document.body.appendChild(c);
        if (!document.getElementById('star-anim')) {
            const st = document.createElement('style');
            st.id = 'star-anim';
            st.textContent = `@keyframes twinkle{0%{opacity:0.2;transform:scale(0.8)}100%{opacity:1;transform:scale(1.2)}}`;
            document.head.appendChild(st);
        }
        return;
    }

    // TEMA QUANTUM REALM
    if (themeId === 'theme_quantum') {
        root.style.setProperty('--primary-neon', '#00f7ff');
        root.style.setProperty('--secondary-neon', '#ff00f7');
        root.style.setProperty('--bg-dark', '#0a0a2a');

        body.style.backgroundImage = `
            radial-gradient(ellipse 80% 50% at 20% 20%, rgba(0, 247, 255, 0.3) 0%, transparent 40%),
            radial-gradient(ellipse 80% 50% at 80% 80%, rgba(255, 0, 247, 0.3) 0%, transparent 40%),
            linear-gradient(135deg, #0a0a2a 0%, #1a0a2a 50%, #0a2a2a 100%)
        `;

        // Cria Partículas Quânticas
        const quantumContainer = document.createElement('div');
        quantumContainer.className = 'quantum-effect';
        quantumContainer.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:-1;';

        for (let i = 0; i < 60; i++) {
            const particle = document.createElement('div');
            const size = Math.random() * 3 + 1;
            const colors = ['#00f7ff', '#ff00f7', '#00ff88'];
            const color = colors[Math.floor(Math.random() * colors.length)];

            particle.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                background: ${color};
                border-radius: 50%;
                opacity: ${Math.random() * 0.6 + 0.2};
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation: quantumFloat ${Math.random() * 8 + 4}s infinite ease-in-out;
                box-shadow: 0 0 ${size * 2}px ${color};
            `;
            quantumContainer.appendChild(particle);
        }
        document.body.appendChild(quantumContainer);
        return;
    }

    // TEMA BINARY RAIN
    if (themeId === 'theme_binary_rain') {
        root.style.setProperty('--primary-neon', '#00ff88');
        root.style.setProperty('--secondary-neon', '#88ff00');
        root.style.setProperty('--bg-dark', '#001100');

        body.style.backgroundImage = `
            linear-gradient(160deg, #001100 0%, #003300 30%, #001a00 70%, #000500 100%)
        `;

        // Cria Chuva Binária
        const binaryContainer = document.createElement('div');
        binaryContainer.className = 'binary-rain-effect';
        binaryContainer.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:-1;font-family:"Fira Code", monospace;color:rgba(0,255,136,0.3);font-size:14px;';

        for (let i = 0; i < 40; i++) {
            const binaryChar = document.createElement('div');
            const chars = ['0', '1'];
            const char = chars[Math.floor(Math.random() * chars.length)];
            const delay = Math.random() * 5;

            binaryChar.textContent = char;
            binaryChar.style.cssText = `
                position: absolute;
                left: ${Math.random() * 100}%;
                top: -20px;
                animation: binaryFall ${Math.random() * 3 + 2}s linear infinite;
                animation-delay: ${delay}s;
                opacity: ${Math.random() * 0.5 + 0.1};
            `;
            binaryContainer.appendChild(binaryChar);
        }
        document.body.appendChild(binaryContainer);
        return;
    }

    // TEMA NEURAL NETWORK
    if (themeId === 'theme_neural_net') {
        root.style.setProperty('--primary-neon', '#ff5500');
        root.style.setProperty('--secondary-neon', '#55ff00');
        root.style.setProperty('--bg-dark', '#1a001a');

        body.style.backgroundImage = `
            radial-gradient(ellipse at 20% 30%, rgba(255, 85, 0, 0.1) 0%, transparent 40%),
            radial-gradient(ellipse at 80% 70%, rgba(85, 255, 0, 0.1) 0%, transparent 40%),
            linear-gradient(135deg, #1a001a 0%, #001a1a 50%, #1a001a 100%)
        `;

        // Cria Rede Neural
        const neuralContainer = document.createElement('div');
        neuralContainer.className = 'neural-net-effect';
        neuralContainer.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:-1;';

        // Cria nós
        for (let i = 0; i < 25; i++) {
            const node = document.createElement('div');
            const size = Math.random() * 4 + 2;
            const colors = ['#ff5500', '#55ff00', '#ff00f7'];
            const color = colors[Math.floor(Math.random() * colors.length)];

            node.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                background: ${color};
                border-radius: 50%;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation: neuralPulse ${Math.random() * 4 + 2}s infinite ease-in-out;
                box-shadow: 0 0 ${size * 3}px ${color};
            `;
            neuralContainer.appendChild(node);
        }
        document.body.appendChild(neuralContainer);
        return;
    }

    // TEMA GLITCH MATRIX
    if (themeId === 'theme_glitch') {
        root.style.setProperty('--primary-neon', '#ff00ff');
        root.style.setProperty('--secondary-neon', '#00ffff');
        root.style.setProperty('--bg-dark', '#000000');

        body.style.backgroundImage = `
            linear-gradient(45deg, #000000 0%, #110011 25%, #001100 50%, #000011 75%, #000000 100%)
        `;

        // Cria Efeito Glitch
        const glitchContainer = document.createElement('div');
        glitchContainer.className = 'glitch-effect';
        glitchContainer.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:-1;';

        // Linhas de glitch
        for (let i = 0; i < 20; i++) {
            const glitchLine = document.createElement('div');
            const height = Math.random() * 3 + 1;
            const colors = ['rgba(255,0,255,0.1)', 'rgba(0,255,255,0.1)', 'rgba(255,0,0,0.1)'];
            const color = colors[Math.floor(Math.random() * colors.length)];

            glitchLine.style.cssText = `
                position: absolute;
                left: 0;
                width: 100%;
                height: ${height}px;
                background: ${color};
                top: ${Math.random() * 100}%;
                animation: glitchScan ${Math.random() * 2 + 1}s linear infinite;
                opacity: ${Math.random() * 0.3 + 0.1};
            `;
            glitchContainer.appendChild(glitchLine);
        }
        document.body.appendChild(glitchContainer);
        return;
    }

    // Temas Especiais
    const themes = {
        'theme_matrix': { p: '#00ff00', s: '#008f11', b: '#050a05' },
        'theme_dracula': { p: '#bd93f9', s: '#ff79c6', b: '#282a36' },
        'theme_gold': { p: '#ffd700', s: '#c0c0c0', b: '#1a1a00' },
        'theme_fire': { p: '#ff4500', s: '#ff8c00', b: '#1a0500' },
        'theme_neon': { p: '#b026ff', s: '#00d4ff', b: '#0b001a' },
        'theme_retro': { p: '#ffb000', s: '#ff5500', b: '#1a1000' },
        'theme_ocean': { p: '#00bfff', s: '#0077be', b: '#001f3f' },
        'theme_cyberpunk': { p: '#fcee0a', s: '#0afcce', b: '#220a29' },
        'theme_midnight_purple': { p: '#a855f7', s: '#d8b4fe', b: '#1e1b4b' },
        'theme_acid_green': { p: '#84cc16', s: '#ecfccb', b: '#1a2e05' },
        'theme_crystal_blue': { p: '#06b6d4', s: '#a5f3fc', b: '#083344' },
        'theme_lava_red': { p: '#ef4444', s: '#fca5a5', b: '#450a0a' },
        'theme_cyber_void': { p: '#14b8a6', s: '#99f6e4', b: '#000000' },

        // Novos temas simples (sem fundos especiais)
        'theme_hologram': { p: '#00eeff', s: '#0099ff', b: '#001122' },
        'theme_cyber_city': { p: '#ff0077', s: '#7700ff', b: '#110022' },
        'theme_synth': { p: '#ff0088', s: '#8800ff', b: '#220022' },
        'theme_data_stream': { p: '#00ffcc', s: '#cc00ff', b: '#002233' }
    };

    const t = themes[themeId];
    if (t) {
        root.style.setProperty('--primary-neon', t.p);
        root.style.setProperty('--secondary-neon', t.s);
        root.style.setProperty('--bg-dark', t.b);
        body.style.backgroundImage = 'none';
    }
}

// Adiciona as animações CSS necessárias
if (!document.getElementById('theme-animations')) {
    const style = document.createElement('style');
    style.id = 'theme-animations';
    style.textContent = `
        @keyframes quantumFloat {
            0%, 100% { transform: translateY(0) translateX(0) rotate(0deg); }
            25% { transform: translateY(-20px) translateX(10px) rotate(90deg); }
            50% { transform: translateY(0) translateX(20px) rotate(180deg); }
            75% { transform: translateY(20px) translateX(10px) rotate(270deg); }
        }
        
        @keyframes binaryFall {
            0% { transform: translateY(-20px); opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { transform: translateY(100vh); opacity: 0; }
        }
        
        @keyframes neuralPulse {
            0%, 100% { transform: scale(1); opacity: 0.3; }
            50% { transform: scale(1.5); opacity: 0.8; }
        }
        
        @keyframes glitchScan {
            0% { transform: translateY(-100%); }
            100% { transform: translateY(100vh); }
        }
        
        @keyframes twinkle {
            0% { opacity: 0.2; transform: scale(0.8); }
            100% { opacity: 1; transform: scale(1.2); }
        }
    `;
    document.head.appendChild(style);
}

// =================================================
// 9. PROGRESSO E ESTATÍSTICAS - MANTIDO IGUAL
// =================================================
// Registar Aula (LMS)
window.registrarAula = function (lessonId) {
    if (!window.userStats.lessons) window.userStats.lessons = [];
    if (window.userStats.lessons.includes(lessonId)) {
        showNotification("Aula já completada!", "info");
        return;
    }
    window.userStats.lessons.push(lessonId);
    showNotification("Aula Concluída! +50 XP", "success");
    playSound('success');
    adicionarXP(50);
};

window.registrarPomodoro = function () {
    window.userStats.pomodoros = (window.userStats.pomodoros || 0) + 1;
    if (window.userStats.pomodoros === 1) showNotification("🏆 CONQUISTA: Senhor do Tempo!", "success");
    adicionarXP(100);
    window.adicionarLoveCoins(50); // Bónus
};

window.registrarTarefa = function () {
    window.userStats.tasks = (window.userStats.tasks || 0) + 1;
    if (window.userStats.tasks === 3) showNotification("🏆 CONQUISTA: Task Master!", "success");
    adicionarXP(15);
};

async function adicionarXP(qtd) {
    window.globalXP += qtd;

    // Level Up Check
    if (window.globalXP >= window.globalLevel * 100) {
        window.globalLevel++;

        const role = window.userCustomTitle || window.getRole(window.globalLevel);

        if (typeof showLevelUpModal === "function") {
            showLevelUpModal(window.globalLevel, role);
        } else {
            showNotification(`LEVEL UP! NÍVEL ${window.globalLevel}`, "success");
        }
        playSound('success');
        window.adicionarLoveCoins(100); // Bónus Nível
    }

    atualizarHUD();
    if (typeof mostrarFloatXP === "function") mostrarFloatXP(qtd);
    salvarProgresso();
}

// Admin Tool: Definir Nível
window.definirNivel = async function (targetUid, novoNivel) {
    const uid = targetUid || (window.currentUser ? window.currentUser.uid : localStorage.getItem('devstudy_guest_id'));
    if (!uid) return;

    try {
        const novoXP = (novoNivel - 1) * 100;
        await db.collection('jogadores').doc(uid).update({ level: parseInt(novoNivel), xp: novoXP });

        if (uid === (window.currentUser?.uid || localStorage.getItem('devstudy_guest_id'))) {
            window.globalLevel = parseInt(novoNivel);
            window.globalXP = novoXP;
            atualizarHUD();
            const nome = window.currentUser ? (window.currentUser.displayName || "Dev") : "Visitante";
            atualizarUIComNome(nome, !!window.currentUser);
            playSound('success');
            showNotification(`Nível definido para ${novoNivel}!`, "success");
        }
    } catch (e) { alert("Erro: " + e.message); }
};

// Função Global de Salvamento
function salvarProgresso() {
    const uid = window.currentUser ? window.currentUser.uid : localStorage.getItem('devstudy_guest_id');
    if (uid) {
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
// 10. INTERFACE DE UTILIZADOR (UI) - ATUALIZADA COM CORES
// =================================================
function atualizarHUD() {
    const xpEl = document.getElementById('userXP');
    const lvlEl = document.getElementById('userLevel');
    if (xpEl) xpEl.textContent = window.globalXP;
    if (lvlEl) lvlEl.textContent = window.globalLevel;
}

function atualizarUIComNome(nome, isLogado) {
    const container = document.getElementById('user-info-display');

    // Retry system
    if (!container) {
        setTimeout(() => atualizarUIComNome(nome, isLogado), 200);
        return;
    }

    // Lógica de Título com CORES ESPECÍFICAS
    let role = window.getRole(window.globalLevel);
    let roleColor = 'var(--secondary-neon)'; // Cor padrão do tema

    // 1. Título Personalizado (Admin) - Rosa
    if (window.userCustomTitle) {
        role = `★ ${window.userCustomTitle}`;
        roleColor = '#f472b6'; // Rosa do tema
    }
    // 2. Título Equipado da Loja - Cor específica
    else if (window.userLoadout && window.userLoadout.title && TITLE_COLORS[window.userLoadout.title]) {
        roleColor = TITLE_COLORS[window.userLoadout.title];
    }

    const isPages = window.location.pathname.includes("/pages/");
    const profileLink = isPages ? "profile.html" : "pages/profile.html";
    const loginLink = isPages ? "login.html" : "pages/login.html";

    if (isLogado) {
        const avatarSrc = window.currentUser && window.currentUser.photoURL
            ? window.currentUser.photoURL
            : `https://ui-avatars.com/api/?name=${nome}&background=0D8ABC&color=fff`;

        container.innerHTML = `
            <div class="user-profile-widget" onclick="window.location.href='${profileLink}'" style="cursor:pointer;">
                <div class="user-details">
                    <a href="${profileLink}" class="user-name" title="Ver Perfil">${nome}</a>
                    <span class="user-role" style="color:${roleColor}; font-weight:bold; text-transform:uppercase; letter-spacing:0.5px;">${role}</span>
                </div>
                <a href="${profileLink}" class="user-avatar-link">
                    <img src="${avatarSrc}" alt="Avatar" style="border-color:${roleColor};">
                </a>
                <button onclick="event.stopPropagation(); fazerLogout()" class="btn-logout" title="Sair">
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

// SISTEMA DE NOTIFICAÇÃO (TOAST) - MANTIDO IGUAL
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

window.closeLevelModal = function (btn) {
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

// Inicializador de Sons e Animações CSS
document.addEventListener('DOMContentLoaded', () => {
    // Injeta CSS para animações (garante funcionamento)
    const s = document.createElement('style');
    s.innerHTML = `
    @keyframes floatUp{0%{transform:translate(-50%,-50%);opacity:1}100%{transform:translate(-50%,-150%);opacity:0}}
    @keyframes toastIn{from{transform:translateX(-50%) translateY(20px);opacity:0}to{transform:translateX(-50%) translateY(0);opacity:1}}
    .xp-floater{position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);color:#4ade80;font-weight:bold;font-size:2rem;z-index:9999;pointer-events:none;text-shadow:0 0 10px rgba(0,0,0,0.5);animation:floatUp 1.5s ease-out forwards;font-family:monospace}
    .toast-notification{position:fixed;bottom:30px;left:50%;transform:translateX(-50%);background:#0f172a;border:1px solid #4ade80;padding:12px 24px;border-radius:50px;color:white;display:flex;align-items:center;gap:10px;box-shadow:0 10px 30px rgba(0,0,0,0.5);z-index:10000;animation:toastIn 0.4s forwards;font-family:sans-serif}
    `;
    document.head.appendChild(s);

    setTimeout(() => {
        const interactives = document.querySelectorAll('button, a, .interactive-btn, .card');
        interactives.forEach(el => {
            el.addEventListener('mouseenter', () => playSound('hover'));
        });
    }, 1000);
});