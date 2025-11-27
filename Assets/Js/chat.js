/* assets/js/chat.js - V4 (Auto-Limpeza 24h) */

let currentCollection = 'chat_global';
let messagesUnsubscribe = null;

document.addEventListener('DOMContentLoaded', () => {
    // Aguarda Auth e Dados do game-data.js
    setTimeout(() => {
        const user = window.currentUser;
        
        // 1. SEGURANÇA: Bloqueia Visitantes
        if (!user) {
            // Se for visitante, redireciona
            if(window.showNotification) window.showNotification("Chat restrito a membros. Faça login.", "error");
            setTimeout(() => window.location.href = "../pages/login.html", 2000);
            return;
        }

        // 2. SETUP: Mostra abas de Admin se tiver permissão
        if (window.isAdminUser) {
            const tabs = document.getElementById('admin-tabs');
            if(tabs) tabs.style.display = 'flex';
            
            // --- LIMPEZA AUTOMÁTICA (Só Admin executa) ---
            executarLimpezaDiaria();
        }

        // 3. INICIA CHAT
        iniciarChat(currentCollection);
    }, 1500);
});

// --- LIMPEZA AUTOMÁTICA (24H) ---
async function executarLimpezaDiaria() {
    console.log("🔄 Verificando mensagens antigas...");
    
    const now = new Date();
    const yesterday = new Date(now.getTime() - (24 * 60 * 60 * 1000)); // 24h atrás

    try {
        // Busca mensagens anteriores a ontem
        const snapshot = await window.db.collection('chat_global')
            .where('timestamp', '<', yesterday)
            .get();

        if (!snapshot.empty) {
            const batch = window.db.batch();
            snapshot.docs.forEach(doc => {
                batch.delete(doc.ref);
            });
            
            await batch.commit();
            
            const count = snapshot.size;
            console.log(`🧹 Limpeza: ${count} mensagens antigas apagadas.`);
            if(window.showNotification) window.showNotification(`Manutenção: ${count} msgs antigas removidas.`, 'info');
        } else {
            console.log("✅ Chat limpo. Nenhuma mensagem expirada.");
        }
    } catch (error) {
        console.error("Erro na limpeza automática (Falta índice?):", error);
        // Nota: Se der erro no console pedindo para criar índice, clique no link que o Firebase fornece.
    }
}

// --- TROCA DE CANAL ---
window.mudarCanal = function(collection) {
    if (collection === currentCollection) return;
    
    // Atualiza UI das abas
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    const status = document.getElementById('channel-status');
    if (status) {
        status.innerHTML = collection === 'chat_admin' 
            ? 'Canal: <span style="color:#ef4444">STAFF ONLY 🔒</span>' 
            : 'Canal: <span style="color:#4ade80">Global 🌐</span>';
    }
    
    currentCollection = collection;
    iniciarChat(currentCollection);
};

// --- INICIALIZAÇÃO ---
function iniciarChat(collectionName) {
    const chatWindow = document.getElementById('chat-window');
    if(chatWindow) chatWindow.innerHTML = ''; 

    if (messagesUnsubscribe) messagesUnsubscribe();

    // ESCUTA EM TEMPO REAL
    messagesUnsubscribe = window.db.collection(collectionName)
        .orderBy('timestamp', 'asc')
        .limitToLast(50)
        .onSnapshot((snapshot) => {
            
            snapshot.docChanges().forEach((change) => {
                // MENSAGEM NOVA
                if (change.type === "added") {
                    renderMessage(change.doc);
                }
                // MENSAGEM APAGADA
                if (change.type === "removed") {
                    const el = document.getElementById(`msg-${change.doc.id}`);
                    if (el) {
                        el.style.opacity = '0';
                        el.style.transform = 'translateX(20px)';
                        setTimeout(() => el.remove(), 300);
                    }
                }
            });
            
            // Scroll suave para o fundo
            if(chatWindow) {
                setTimeout(() => {
                    chatWindow.scrollTo({ top: chatWindow.scrollHeight, behavior: 'smooth' });
                }, 100);
            }
        });
}

// --- RENDERIZAÇÃO ---
function renderMessage(doc) {
    const msg = doc.data();
    const msgId = doc.id;
    const chatWindow = document.getElementById('chat-window');
    if(!chatWindow) return;
    
    // Verifica se é o próprio utilizador
    const isMe = window.currentUser && (window.currentUser.uid === msg.uid);
    
    // Formata Hora
    let timeString = "--:--";
    let canDelete = false;

    if (msg.timestamp) {
        const date = msg.timestamp.toDate();
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        timeString = `${hours}:${minutes}`;

        // VERIFICAÇÃO DE TEMPO (5 MINUTOS)
        const now = new Date();
        const diffMinutes = (now - date) / (1000 * 60);
        
        // Regra de Delete: (É minha E < 5min) OU (Sou Admin)
        if ((isMe && diffMinutes < 5) || window.isAdminUser) {
            canDelete = true;
        }
    }

    // Classes CSS
    const msgClass = isMe ? 'me' : 'other';
    
    // Badge
    let roleBadge = `<span class="msg-role role-user">${msg.role || 'User'}</span>`;
    if (msg.isAdmin) roleBadge = `<span class="msg-role role-admin">ADMIN</span>`;
    else if (msg.role && msg.role.includes('★')) roleBadge = `<span class="msg-role" style="border:1px solid #facc15; color:#facc15">${msg.role.replace('★','')}</span>`;

    // Botão Lixo (Se permitido)
    const deleteBtn = canDelete 
        ? `<div class="msg-delete-btn" onclick="apagarMensagem('${msgId}')" title="Apagar"><i class="fas fa-trash"></i></div>` 
        : '';

    const html = `
        <div class="message ${msgClass} ${msg.isAdmin ? 'admin' : ''}" id="msg-${msgId}">
            ${deleteBtn}
            <div class="message-header">
                <span class="msg-author">${escapeHTML(msg.name)}</span>
                ${roleBadge}
                <span class="msg-time">${timeString}</span>
            </div>
            <div class="message-body">
                ${escapeHTML(msg.text)}
            </div>
        </div>
    `;
    
    chatWindow.insertAdjacentHTML('beforeend', html);
}

// --- ENVIAR ---
window.enviarMensagem = function(e) {
    e.preventDefault();
    const input = document.getElementById('chat-input');
    const text = input.value.trim();

    if (!text) return;
    if (!window.currentUser) return alert("Login necessário.");

    let userRole = "Operador";
    if (window.userCustomTitle) userRole = window.userCustomTitle;
    else if (window.getRole) userRole = window.getRole(window.globalLevel);

    if (window.isAdminUser && !window.userCustomTitle) userRole = "Admin";

    window.db.collection(currentCollection).add({
        text: text,
        uid: window.currentUser.uid,
        name: window.currentUser.displayName || "Operador",
        role: userRole,
        isAdmin: window.isAdminUser || false,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        input.value = '';
        if(window.playSoundGlobal) window.playSoundGlobal('click');
    }).catch(err => {
        console.error(err);
        if(window.showNotification) window.showNotification("Erro ao enviar", "error");
    });
};

// --- APAGAR ---
window.apagarMensagem = function(docId) {
    if(!confirm("Apagar esta mensagem?")) return;

    window.db.collection(currentCollection).doc(docId).delete()
        .then(() => {
            if(window.showNotification) window.showNotification("Mensagem apagada.", "info");
            if(window.playSoundGlobal) window.playSoundGlobal('hover');
        })
        .catch(err => {
            alert("Não foi possível apagar. (O tempo limite expirou?)");
        });
};

function escapeHTML(str) {
    if(!str) return "";
    return str.replace(/[&<>'"]/g, 
        tag => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'}[tag]));
}