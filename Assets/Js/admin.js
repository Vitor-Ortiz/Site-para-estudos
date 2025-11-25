/* assets/js/admin.js - Lógica de Controle Supremo */

document.addEventListener('DOMContentLoaded', () => {
    // Aguarda verificação de admin do game-data.js
    setTimeout(() => {
        if (!window.isAdminUser) {
            document.body.innerHTML = `
                <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; color:#ef4444; background:#020617;">
                    <i class="fas fa-lock" style="font-size: 4rem; margin-bottom: 20px;"></i>
                    <h1 style="font-family:monospace;">ACESSO NEGADO</h1>
                    <p>Suas credenciais não possuem privilégios de Administrador.</p>
                </div>
            `;
            setTimeout(() => window.location.href = "../index.html", 3000);
        } else {
            carregarUsuarios();
        }
    }, 1500); // Tempo de espera seguro para o Firebase carregar
});

async function carregarUsuarios() {
    const tbody = document.getElementById('users-table-body');
    // Spinner
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:20px; color:#94a3b8;"><i class="fas fa-circle-notch fa-spin"></i> A carregar dados...</td></tr>';

    try {
        const snapshot = await firebase.firestore().collection('jogadores').orderBy('xp', 'desc').get();
        let html = '';
        let totalXP = 0;

        snapshot.forEach(doc => {
            const user = doc.data();
            totalXP += (user.xp || 0);
            
            const roleBadge = user.isAdmin 
                ? '<span class="badge-admin"><i class="fas fa-shield-alt"></i> ADMIN</span>' 
                : '<span class="badge-user">USER</span>';
            
            // Título Personalizado
            const customTitleHTML = user.customTitle 
                ? `<span class="custom-title-tag">${user.customTitle}</span>` 
                : '';

            // Cargo Automático
            const autoRole = window.getRole ? window.getRole(user.level || 1) : '-';

            // Destaque para Top Players
            const rowStyle = user.xp > 10000 ? 'background: rgba(250, 204, 21, 0.05);' : '';

            html += `
                <tr style="${rowStyle}">
                    <td>
                        <div style="display:flex; flex-direction:column;">
                            <strong style="font-size:0.95rem;">${user.nome || 'Desconhecido'}</strong>
                            <span style="font-size:0.7rem; color:#64748b; font-family:monospace;">ID: ${doc.id.substring(0,8)}...</span>
                        </div>
                    </td>
                    <td>
                        <strong style="color:#fff; font-size:1.1rem;">${user.level || 1}</strong>
                    </td>
                    <td>
                        ${customTitleHTML} <span style="color:#94a3b8; font-size:0.8rem;">${autoRole}</span>
                    </td>
                    <td>${roleBadge}</td>
                    <td>
                        <div style="display:flex; gap:5px;">
                            <button class="action-btn btn-gift" onclick="darXP('${doc.id}', '${user.nome}')" title="Dar XP">
                                <i class="fas fa-gift"></i>
                            </button>
                            
                            <button class="action-btn btn-level" onclick="setarNivel('${doc.id}', '${user.nome}')" title="Definir Nível">
                                <i class="fas fa-tachometer-alt"></i>
                            </button>
                            
                            <button class="action-btn btn-tag" onclick="mudarTitulo('${doc.id}', '${user.nome}')" title="Mudar Título">
                                <i class="fas fa-tag"></i>
                            </button>

                            ${!user.isAdmin ? `
                            <button class="action-btn btn-danger" onclick="resetarUsuario('${doc.id}', '${user.nome}')" title="Resetar Conta">
                                <i class="fas fa-ban"></i>
                            </button>` : ''}
                        </div>
                    </td>
                </tr>
            `;
        });

        tbody.innerHTML = html;
        
        // Atualiza Stats na Sidebar
        const totalEl = document.getElementById('stat-total');
        const xpEl = document.getElementById('stat-xp');
        if(totalEl) totalEl.innerText = snapshot.size;
        if(xpEl) xpEl.innerText = totalXP.toLocaleString();

    } catch (e) {
        console.error(e);
        tbody.innerHTML = `<tr><td colspan="5" style="color:#ef4444; text-align:center;">Erro ao carregar: ${e.message}</td></tr>`;
    }
}

// --- FUNÇÕES DE AÇÃO ---

async function darXP(uid, nome) {
    const qtd = prompt(`Quanto XP para ${nome}?`, "1000");
    if(!qtd) return;
    
    try {
        const docRef = firebase.firestore().collection('jogadores').doc(uid);
        const doc = await docRef.get();
        if(doc.exists) {
            const currentXP = doc.data().xp || 0;
            const newXP = currentXP + parseInt(qtd);
            const newLevel = Math.floor(newXP / 100) + 1;
            
            await docRef.update({ xp: newXP, level: newLevel });
            alert("XP Adicionado!");
            carregarUsuarios();
        }
    } catch(e) { alert(e.message); }
}

async function setarNivel(uid, nome) {
    const nivel = prompt(`Definir nível para ${nome}:`, "50");
    if(!nivel) return;
    
    // Usa a função global exposta no game-data.js
    if (window.definirNivel) {
        await window.definirNivel(uid, nivel);
        carregarUsuarios();
    } else {
        alert("Erro: Função definirNivel indisponível.");
    }
}

async function mudarTitulo(uid, nome) {
    const titulo = prompt(`Novo Título para ${nome} (Vazio para remover):`, "Mestre Jedi");
    if(titulo === null) return;
    
    try {
        await firebase.firestore().collection('jogadores').doc(uid).update({ customTitle: titulo });
        alert("Título atualizado!");
        carregarUsuarios();
    } catch(e) { alert(e.message); }
}

async function resetarUsuario(uid, nome) {
    if (confirm(`TEM CERTEZA que deseja ZERAR o progresso de ${nome}?`)) {
        try {
            await firebase.firestore().collection('jogadores').doc(uid).update({
                xp: 0, level: 1, customTitle: ""
            });
            alert("Usuário resetado.");
            carregarUsuarios();
        } catch (e) { alert(e.message); }
    }
}

function giveSelfXP() {
    if(window.adicionarXP) {
        window.adicionarXP(1000);
        setTimeout(carregarUsuarios, 1000);
    }
}

function resetSelf() {
    if(window.currentUser && confirm("Resetar seu próprio perfil?")) {
        resetarUsuario(window.currentUser.uid, "VOCÊ");
    }
}