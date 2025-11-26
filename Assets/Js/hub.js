/* assets/js/hub.js - Lógica do Neural Hub */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Espera dados do utilizador carregarem
    if (window.currentUser) {
        initHub();
    } else {
        window.addEventListener('gameDataLoaded', initHub);
        // Fallback de segurança
        setTimeout(initHub, 2000); 
    }
    
    // 2. Carrega Ranking Independentemente
    carregarRanking();
});

function initHub() {
    const user = window.currentUser;
    const xp = window.globalXP || 0;
    const level = window.globalLevel || 1;

    // Preencher Header de Boas Vindas
    const nameEl = document.getElementById('hub-username');
    if(nameEl) nameEl.innerText = `Bem-vindo, ${user ? (user.displayName || 'Operador') : 'Visitante'}.`;

    // Preencher Card de Status (Circular)
    const levelEl = document.getElementById('hub-level');
    const curXpEl = document.getElementById('hub-current-xp');
    const nextXpEl = document.getElementById('hub-next-xp');
    
    if(levelEl) levelEl.textContent = level;
    if(curXpEl) curXpEl.textContent = xp;
    
    // Cálculo do Próximo Nível (Baseado na lógica do game-data: Nível * 100)
    const nextLevelXP = level * 100;
    if(nextXpEl) nextXpEl.textContent = nextLevelXP;

    // Barra de Progresso Circular
    const xpInThisLevel = xp - ((level - 1) * 100); // Quanto XP tem neste nível atual
    const xpNeeded = 100; // Quanto precisa por nível (fixo na nossa lógica atual)
    
    // Regra de 3 para percentagem (0 a 100)
    // Nota: stroke-dasharray="X, 100" -> X é a percentagem preenchida
    const percent = Math.min(100, Math.max(0, (xpInThisLevel / xpNeeded) * 100));
    
    const circle = document.querySelector('.circle');
    if(circle) {
        // Animação SVG
        circle.setAttribute('stroke-dasharray', `${percent}, 100`);
    }
    
    // Barra linear também
    const bar = document.querySelector('.xp-fill');
    if(bar) bar.style.width = `${percent}%`;
}

async function carregarRanking() {
    const list = document.getElementById('ranking-list');
    
    try {
        // Busca Top 10 jogadores
        const snapshot = await firebase.firestore().collection('jogadores')
            .orderBy('xp', 'desc')
            .limit(10)
            .get();
        
        let html = '';
        let rank = 1;

        snapshot.forEach(doc => {
            const data = doc.data();
            const isMe = window.currentUser && window.currentUser.uid === doc.id;
            
            // Avatar
            const avatar = `https://ui-avatars.com/api/?name=${data.nome}&background=random&color=fff`;
            
            // Classe especial para Top 3
            let rankClass = '';
            if(rank === 1) rankClass = 'rank-1';
            if(rank === 2) rankClass = 'rank-2';
            if(rank === 3) rankClass = 'rank-3';
            if(isMe) rankClass += ' current-user-rank'; // Para destacar você mesmo (add CSS se quiser)

            html += `
                <div class="rank-item ${rankClass}" style="${isMe ? 'border:1px solid #38bdf8' : ''}">
                    <div class="rank-pos">#${rank}</div>
                    <img src="${avatar}" class="rank-avatar">
                    <div class="rank-info">
                        <span class="rank-name">${data.nome} ${isMe ? '(Você)' : ''}</span>
                        <span class="rank-role">${window.getRole ? window.getRole(data.level) : 'Dev'}</span>
                    </div>
                    <div class="rank-xp">${data.xp} XP</div>
                </div>
            `;
            rank++;
        });

        if (html === '') html = '<div style="padding:20px; text-align:center; color:#666;">Nenhum operador encontrado.</div>';
        
        list.innerHTML = html;

    } catch (e) {
        console.error("Erro ranking:", e);
        list.innerHTML = '<div style="padding:20px; color:#ef4444; text-align:center;">Erro ao carregar dados da rede.</div>';
    }
}