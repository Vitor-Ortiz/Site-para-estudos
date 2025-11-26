/* assets/js/admin.js - Painel de Controle V5 (Sem Modo Espião) */

document.addEventListener('DOMContentLoaded', () => {
    // Aguarda a verificação de admin do game-data.js
    // Dá um tempo para o Firebase conectar e verificar o email
    setTimeout(() => {
        if (!window.isAdminUser) {
            document.body.innerHTML = `
                <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; color:#ef4444; background:#020617; font-family:monospace;">
                    <i class="fas fa-lock" style="font-size: 4rem; margin-bottom: 20px;"></i>
                    <h1 style="margin-bottom:10px;">ACESSO NEGADO</h1>
                    <p style="color:#94a3b8;">Suas credenciais não possuem privilégios de Administrador.</p>
                    <p style="font-size:0.8rem; margin-top:20px; color:#64748b;">Redirecionando para a base...</p>
                </div>
            `;
            setTimeout(() => window.location.href = "../index.html", 3000);
        } else {
            // Se for admin, carrega a tabela
            carregarUsuarios();
        }
    }, 1500);
});

async function carregarUsuarios() {
    const tbody = document.getElementById('users-table-body');
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:20px; color:#94a3b8;"><i class="fas fa-circle-notch fa-spin"></i> Acedendo à base de dados neural...</td></tr>';

    try {
        // Busca todos os jogadores ordenados por XP (do maior para o menor)
        const snapshot = await window.db.collection('jogadores').orderBy('xp', 'desc').get();
        
        let html = '';
        let totalXP = 0;
        
        if (snapshot.empty) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:20px; color:#94a3b8;">Nenhum utilizador encontrado.</td></tr>';
            return;
        }

        snapshot.forEach(doc => {
            const user = doc.data();
            totalXP += (user.xp || 0);
            
            // Badge de Cargo
            const roleBadge = user.isAdmin 
                ? '<span class="badge-admin"><i class="fas fa-shield-alt"></i> ADMIN</span>' 
                : '<span class="badge-user">USER</span>';
                
            // Badge de Título Personalizado ou Cargo Automático
            const titleDisplay = user.customTitle 
                ? `<span class="custom-title-tag">${user.customTitle}</span>` 
                : `<span style="color:#64748b; font-size:0.8rem;">${window.getRole ? window.getRole(user.level || 1) : '-'}</span>`;

            // Verifica se é o próprio admin (para lógica de reset self)
            const isMe = window.currentUser && window.currentUser.uid === doc.id;

            // Destaque visual para High Level (> 5000 XP)
            const rowStyle = user.xp > 5000 ? 'background: rgba(250, 204, 21, 0.05);' : '';

            html += `
                <tr style="${rowStyle}">
                    <td>
                        <div style="display:flex; flex-direction:column;">
                            <strong style="font-size:0.95rem; color:white;">${user.nome || 'Desconhecido'}</strong>
                            <span style="font-size:0.65rem; color:#64748b; font-family:monospace;">ID: ${doc.id.substring(0,8)}...</span>
                        </div>
                    </td>
                    <td>
                        <strong style="color:#fff; font-size:1.1rem;">${user.level || 1}</strong>
                    </td>
                    <td>${titleDisplay}</td>
                    <td>${roleBadge}</td>
                    <td>
                        <div style="display:flex; gap:5px;">
                            
                            <button class="action-btn btn-gift" onclick="darXP('${doc.id}', '${user.nome}')" title="Dar XP">
                                <i class="fas fa-gift"></i>
                            </button>
                            
                            <button class="action-btn btn-level" onclick="setarNivel('${doc.id}', '${user.nome}')" title="Definir Nível Exato">
                                <i class="fas fa-tachometer-alt"></i>
                            </button>
                            
                            <button class="action-btn btn-tag" onclick="mudarTitulo('${doc.id}', '${user.nome}')" title="Alterar Título/Cargo">
                                <i class="fas fa-tag"></i>
                            </button>

                            ${!user.isAdmin || isMe ? `
                            <button class="action-btn btn-danger" onclick="resetarUsuario('${doc.id}', '${user.nome}')" title="Resetar Conta">
                                <i class="fas fa-ban"></i>
                            </button>` : ''}
                        </div>
                    </td>
                </tr>
            `;
        });

        tbody.innerHTML = html;
        
        // Atualiza métricas da sidebar
        const totalEl = document.getElementById('stat-total');
        const xpEl = document.getElementById('stat-xp');
        if(totalEl) totalEl.innerText = snapshot.size;
        if(xpEl) xpEl.innerText = totalXP.toLocaleString();

    } catch (e) {
        console.error(e);
        tbody.innerHTML = `<tr><td colspan="5" style="color:#ef4444; text-align:center;">Erro ao carregar: ${e.message}</td></tr>`;
    }
}

// --- AÇÕES INDIVIDUAIS ---

// 1. Dar XP (Soma ao atual)
async function darXP(uid, nome) {
    const qtd = prompt(`Quanto XP deseja ADICIONAR para ${nome}?\n(Use valor negativo para remover, ex: -500)`, "1000");
    if(!qtd) return;
    
    try {
        const docRef = window.db.collection('jogadores').doc(uid);
        const doc = await docRef.get();
        
        if (doc.exists) {
            const currentXP = doc.data().xp || 0;
            const newXP = Math.max(0, currentXP + parseInt(qtd)); // Não deixa ficar negativo
            
            // Recalcula nível simples (100 XP = 1 Nível) para manter consistência
            const newLevel = Math.floor(newXP / 100) + 1;
            
            await docRef.update({ xp: newXP, level: newLevel });
            alert(`✅ Sucesso! ${nome} agora tem ${newXP} XP (Nível ${newLevel}).`);
            carregarUsuarios(); // Atualiza tabela
        }
    } catch(e) { alert("Erro: " + e.message); }
}

// 2. Definir Nível (Usa a função global do game-data.js)
async function setarNivel(uid, nome) {
    const nivel = prompt(`Definir nível EXATO para ${nome}:`, "50");
    if(!nivel) return;
    
    if (window.definirNivel) {
        await window.definirNivel(uid, nivel);
        carregarUsuarios(); // Recarrega a tabela
    } else {
        alert("Erro: Função 'definirNivel' não encontrada no sistema global (game-data.js).");
    }
}

// 3. Mudar Título (Custom Title)
async function mudarTitulo(uid, nome) {
    const titulo = prompt(`Novo Título para ${nome} (Deixe vazio para remover):`, "Mestre Jedi");
    if(titulo === null) return; // Cancelou
    
    try {
        await window.db.collection('jogadores').doc(uid).update({ customTitle: titulo });
        alert("✅ Título atualizado com sucesso!");
        carregarUsuarios();
    } catch(e) { alert("Erro: " + e.message); }
}

// 4. Resetar Usuário (Zera tudo)
async function resetarUsuario(uid, nome) {
    if (confirm(`🔴 PERIGO: Isso vai ZERAR todo o progresso de ${nome}.\nXP, Nível, Inventário e Títulos serão perdidos.\n\nTem a certeza?`)) {
        try {
            await window.db.collection('jogadores').doc(uid).update({
                xp: 0,
                level: 1,
                customTitle: "",
                stats: { pomodoros: 0, tasks: 0 },
                inventory: [],
                loadout: { theme: 'theme_default' }
            });
            alert("✅ Usuário resetado para o padrão de fábrica.");
            carregarUsuarios();
        } catch (e) { alert("Erro: " + e.message); }
    }
}


// --- AÇÕES GLOBAIS / SIDEBAR ---

// Limpeza em Massa (Visitantes e Convidados)
async function apagarVisitantes() {
    if (!confirm("☢️ EXECUTAR LIMPEZA DE SISTEMA?\n\nIsto vai APAGAR PERMANENTEMENTE do banco de dados todos os utilizadores com o nome 'Visitante' ou 'Convidado'.\n\nEsta ação é irreversível e serve para poupar espaço.\n\nContinuar?")) return;
    
    const btn = document.querySelector('button[onclick="apagarVisitantes()"]');
    const originalText = btn ? btn.innerHTML : '';
    if(btn) btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> A limpar...';
    
    try {
        const batch = window.db.batch();
        let count = 0;

        // 1. Busca "Visitante"
        const snap1 = await window.db.collection('jogadores').where('nome', '==', 'Visitante').get();
        snap1.docs.forEach(doc => { batch.delete(doc.ref); count++; });

        // 2. Busca "Convidado"
        const snap2 = await window.db.collection('jogadores').where('nome', '==', 'Convidado').get();
        snap2.docs.forEach(doc => { batch.delete(doc.ref); count++; });

        if (count === 0) {
            alert("Sistema limpo. Nenhum visitante encontrado.");
        } else {
            await batch.commit();
            alert(`✅ LIMPEZA CONCLUÍDA: ${count} contas temporárias foram eliminadas.`);
            carregarUsuarios();
        }
    } catch (e) { 
        alert("Erro na limpeza: " + e.message); 
    } finally {
        if(btn) btn.innerHTML = originalText;
    }
}

// Atalho para dar XP a si mesmo
function giveSelfXP() {
    if(window.adicionarXP) {
        window.adicionarXP(1000);
        // Pequeno delay para o Firebase processar antes de recarregar a tabela
        setTimeout(carregarUsuarios, 1000);
    }
}

// Atalho para resetar a si mesmo
function resetSelf() {
    if(window.currentUser && confirm("Tem a certeza que quer resetar o seu PRÓPRIO perfil?")) {
        // Chama a função de reset passando o próprio ID
        resetarUsuario(window.currentUser.uid, "VOCÊ (ADMIN)");
    }
}