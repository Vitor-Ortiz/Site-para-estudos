/* assets/js/admin.js - Lógica de Controle Supremo */

document.addEventListener('DOMContentLoaded', () => {
    // Proteção de Rota: Verifica se é Admin
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
    }, 1500); // Tempo para o game-data.js carregar
});

async function carregarUsuarios() {
    const tbody = document.getElementById('users-table-body');
    // Spinner de carregamento
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 20px;"><i class="fas fa-circle-notch fa-spin"></i> Carregando dados...</td></tr>';

    try {
        const snapshot = await firebase.firestore().collection('jogadores').orderBy('xp', 'desc').get();
        
        let html = '';
        let totalXP = 0;
        
        snapshot.forEach(doc => {
            const user = doc.data();
            totalXP += (user.xp || 0);
            
            // Badge de Admin ou User
            const roleBadge = user.isAdmin 
                ? '<span class="badge-admin"><i class="fas fa-shield-alt"></i> ADMIN</span>' 
                : '<span class="badge-user">USER</span>';
                
            // Título Personalizado
            const customTitle = user.customTitle 
                ? `<span class="custom-title-tag">${user.customTitle}</span>` 
                : '';

            // Cargo Automático (Baseado no Nível)
            const autoRole = window.getRole ? window.getRole(user.level || 1) : '-';

            // Destaque visual para quem tem muito XP
            const rowStyle = user.xp > 5000 ? 'background: rgba(250, 204, 21, 0.05);' : '';

            html += `
                <tr style="${rowStyle}">
                    <td>
                        <div style="display:flex; flex-direction:column;">
                            <strong style="font-size:0.95rem;">${user.nome || 'Desconhecido'}</strong>
                            <span style="font-size:0.7rem; color:#64748b; font-family:monospace;">ID: ${doc.id}</span>
                        </div>
                    </td>
                    <td>
                        <strong style="color:#fff; font-size:1.1rem;">${user.level || 1}</strong>
                    </td>
                    <td>
                        ${customTitle} <span style="color:#94a3b8; font-size:0.8rem;">${autoRole}</span>
                    </td>
                    <td>${roleBadge}</td>
                    <td>
                        <div style="display:flex;">
                            <button class="action-btn btn-gift" onclick="darXP('${doc.id}', '${user.nome}')" title="Dar XP">
                                <i class="fas fa-gift"></i>
                            </button>
                            
                            <button class="action-btn btn-level" onclick="setarNivel('${doc.id}', '${user.nome}')" title="Definir Nível">
                                <i class="fas fa-tachometer-alt"></i>
                            </button>
                            
                            <button class="action-btn btn-tag" onclick="mudarTitulo('${doc.id}', '${user.nome}')" title="Alterar Título">
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
        
        // Atualiza estatísticas na sidebar
        document.getElementById('stat-total').innerText = snapshot.size;
        document.getElementById('stat-xp').innerText = formatNumber(totalXP);

    } catch (error) {
        console.error(error);
        tbody.innerHTML = `<tr><td colspan="5" style="color:#ef4444; text-align:center;">Erro: ${error.message}</td></tr>`;
    }
}

// --- AÇÕES DO ADMIN ---

async function darXP(uid, nome) {
    const valor = prompt(`Quantos XP deseja dar para ${nome}?`, "500");
    if (!valor) return;

    // Usa a função global window.adicionarXP se for o próprio usuário, 
    // mas para outros precisamos acessar o banco direto.
    // O ideal é criar uma função auxiliar no game-data.js ou fazer aqui direto:
    
    try {
        const docRef = firebase.firestore().collection('jogadores').doc(uid);
        const doc = await docRef.get();
        if (doc.exists) {
            const atualXP = doc.data().xp || 0;
            const novoXP = atualXP + parseInt(valor);
            // Recalcula nível simples (100 XP = 1 Nível)
            const novoNivel = Math.floor(novoXP / 100) + 1;
            
            await docRef.update({ xp: novoXP, level: novoNivel });
            alert(`Sucesso! ${nome} recebeu ${valor} XP.`);
            carregarUsuarios(); // Atualiza tabela
        }
    } catch (e) { alert("Erro: " + e.message); }
}

async function setarNivel(uid, nome) {
    const nivel = prompt(`Definir nível exato para ${nome}:`, "10");
    if (!nivel) return;

    // Usa a função global que criamos no game-data.js
    if (window.definirNivel) {
        await window.definirNivel(uid, nivel);
        carregarUsuarios();
    } else {
        alert("Erro: Função definirNivel não encontrada no sistema.");
    }
}

async function mudarTitulo(uid, nome) {
    const titulo = prompt(`Novo Título para ${nome} (Deixe vazio para remover):`, "Mestre Jedi");
    if (titulo === null) return;

    try {
        await firebase.firestore().collection('jogadores').doc(uid).update({
            customTitle: titulo
        });
        carregarUsuarios();
    } catch (e) { alert("Erro: " + e.message); }
}

async function resetarUsuario(uid, nome) {
    if (confirm(`TEM CERTEZA que deseja ZERAR o progresso de ${nome}? Isso não pode ser desfeito.`)) {
        try {
            await firebase.firestore().collection('jogadores').doc(uid).update({
                xp: 0,
                level: 1,
                customTitle: ""
            });
            alert("Usuário resetado.");
            carregarUsuarios();
        } catch (e) { alert("Erro: " + e.message); }
    }
}

// Ações Self (Sidebar)
function giveSelfXP() {
    if (window.adicionarXP) window.adicionarXP(1000);
    setTimeout(carregarUsuarios, 1000); // Atualiza tabela depois
}

function resetSelf() {
    if (confirm("Resetar seu próprio perfil?")) {
        // Chama a função de reset passando o próprio ID
        if (window.currentUser) resetarUsuario(window.currentUser.uid, "VOCÊ");
    }
}

// Utilitário para formatar números (Ex: 1.500)
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}