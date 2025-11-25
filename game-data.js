/* ARQUIVO: game-data.js
   RESPONSABILIDADE: Gerenciar conexão com o Banco de Dados (Firebase) e XP Global.
*/

// --- 1. Configuração do Firebase ---
// (Já inseri as tuas chaves aqui!)
const firebaseConfig = {
    apiKey: "AIzaSyBnDEycSpeFXYwNwSDhAza5BMbNPvC6JBA",
    authDomain: "devstudy-db.firebaseapp.com",
    projectId: "devstudy-db",
    storageBucket: "devstudy-db.firebasestorage.app",
    messagingSenderId: "894897799858",
    appId: "1:894897799858:web:615292d62afc04af61ffab"
};

// Inicializa o Firebase (versão compatibilidade CDN)
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

// --- 2. Sistema de Identificação ---
// Gera um ID único para este navegador se não existir
let userId = localStorage.getItem('devstudy_uid');
if (!userId) {
    userId = 'user_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('devstudy_uid', userId);
}
console.log("Conectado como UserID:", userId);

// --- 3. Variáveis Globais de Estado ---
let globalXP = 0;
let globalLevel = 1;

// --- 4. Funções Principais ---

// Carregar dados do banco ao iniciar
async function initGameSystem() {
    const docRef = db.collection('jogadores').doc(userId);
    
    try {
        const doc = await docRef.get();
        if (doc.exists) {
            // Jogador existe, carregar dados
            const data = doc.data();
            globalXP = data.xp || 0;
            globalLevel = data.level || 1;
            console.log("Dados carregados da nuvem:", data);
        } else {
            // Novo jogador, criar registro
            await docRef.set({
                xp: 0,
                level: 1,
                criadoEm: firebase.firestore.FieldValue.serverTimestamp()
            });
            console.log("Novo perfil criado na nuvem!");
        }
        atualizarHUD();
    } catch (error) {
        console.error("Erro ao conectar no DB:", error);
        // Fallback: Se der erro (ex: sem internet), tenta usar localStorage antigo
        globalXP = parseInt(localStorage.getItem('devstudy_xp')) || 0;
        globalLevel = parseInt(localStorage.getItem('devstudy_level')) || 1;
        atualizarHUD();
    }
}

// Adicionar XP e Salvar na Nuvem
async function adicionarXP(quantidade) {
    globalXP += quantidade;
    
    // Verifica Level Up (Ex: a cada 100 xp)
    let subiuNivel = false;
    if (globalXP >= globalLevel * 100) {
        globalLevel++;
        alert(`🎉 LEVEL UP! NÍVEL ${globalLevel} ALCANÇADO!`);
        playSound('success'); // Toca som se disponível
    }

    // Atualiza a tela imediatamente (para ser rápido)
    atualizarHUD();
    mostrarFloatXP(quantidade);

    // Salva na nuvem (Firestore)
    try {
        await db.collection('jogadores').doc(userId).update({
            xp: globalXP,
            level: globalLevel,
            ultimoLogin: firebase.firestore.FieldValue.serverTimestamp()
        });
    } catch (error) {
        console.error("Erro ao salvar progresso:", error);
    }
}

// Atualiza os números na tela (Header)
function atualizarHUD() {
    const xpEl = document.getElementById('userXP');
    const lvlEl = document.getElementById('userLevel');
    if (xpEl) xpEl.textContent = globalXP;
    if (lvlEl) lvlEl.textContent = globalLevel;
}

// Efeito visual de XP flutuando
function mostrarFloatXP(qtd) {
    const floatXP = document.createElement('div');
    floatXP.textContent = `+${qtd} XP`;
    floatXP.style.position = 'fixed';
    floatXP.style.left = '50%';
    floatXP.style.top = '50%';
    floatXP.style.transform = 'translate(-50%, -50%)';
    floatXP.style.color = '#4ade80'; // Verde Sucesso
    floatXP.style.fontWeight = 'bold';
    floatXP.style.fontSize = '2rem';
    floatXP.style.zIndex = '9999';
    floatXP.style.pointerEvents = 'none';
    floatXP.style.animation = 'floatUp 1.5s ease-out forwards';
    
    document.body.appendChild(floatXP);
    setTimeout(() => floatXP.remove(), 1500);
}

// Inicia o sistema automaticamente
document.addEventListener('DOMContentLoaded', initGameSystem);