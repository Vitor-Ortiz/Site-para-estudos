/* assets/js/shop.js - V3 (Com Animação de Compra) */

const CATALOG = {
    items: [
        { id: 'item_shield', name: 'Escudo de Defensiva', price: 500, desc: 'Protege sua sequência de dias.', icon: 'fa-shield-alt', type: 'consumable' }
    ],
    themes: [
        // TEMAS CLÁSSICOS
        { id: 'theme_default', name: 'Cyber Blue', price: 0, desc: 'O visual clássico.', icon: 'fa-desktop' },
        { id: 'theme_matrix', name: 'The Matrix', price: 500, desc: 'Verde hacker.', icon: 'fa-code', styleClass: 'preview-matrix' },
        { id: 'theme_dracula', name: 'Dracula', price: 1200, desc: 'Roxo escuro.', icon: 'fa-moon', styleClass: 'preview-dracula' },
        { id: 'theme_gold', name: 'Golden State', price: 5000, desc: 'Luxo puro.', icon: 'fa-crown', styleClass: 'preview-gold' },
        { id: 'theme_fire', name: 'Firewall', price: 2500, desc: 'Quente.', icon: 'fa-fire', styleClass: 'preview-fire' },
        
        // NOVOS TEMAS (Verificados)
        { id: 'theme_neon', name: 'Neon Future', price: 3000, desc: 'Ciano e Roxo.', icon: 'fa-bolt', styleClass: 'preview-neon' },
        { id: 'theme_retro', name: 'Retro Amber', price: 1500, desc: 'Monitores antigos.', icon: 'fa-terminal', styleClass: 'preview-retro' },
        { id: 'theme_ocean', name: 'Deep Ocean', price: 2000, desc: 'Azul profundo.', icon: 'fa-water', styleClass: 'preview-ocean' },
        { id: 'theme_cyberpunk', name: 'Night City', price: 4000, desc: 'Amarelo elétrico.', icon: 'fa-city', styleClass: 'preview-cyberpunk' },
        { id: 'theme_midnight_purple', name: 'Midnight', price: 3500, desc: 'Roxo profundo.', icon: 'fa-moon', styleClass: 'preview-midnight-purple' },
        { id: 'theme_acid_green', name: 'Acid Green', price: 2800, desc: 'Verde tóxico.', icon: 'fa-biohazard', styleClass: 'preview-acid-green' },
        { id: 'theme_crystal_blue', name: 'Crystal', price: 3200, desc: 'Azul cristal.', icon: 'fa-gem', styleClass: 'preview-crystal-blue' },
        { id: 'theme_lava_red', name: 'Lava Flow', price: 4000, desc: 'Vermelho vulcânico.', icon: 'fa-temperature-high', styleClass: 'preview-lava-red' },
        { id: 'theme_cyber_void', name: 'Cyber Void', price: 4500, desc: 'Preto absoluto.', icon: 'fa-skull', styleClass: 'preview-cyber-void' },

        // O TEMA ESPECIAL (Única entrada)
        { id: 'theme_galaxy', name: 'The Galaxy', price: 5000, desc: 'Fundo cósmico animado.', icon: 'fa-user-astronaut', styleClass: 'preview-galaxy' }
    ],
    titles: [
        { id: 'default_title', name: 'Padrão (Nível)', price: 0, desc: 'Usa o nível atual.', icon: 'fa-user' },
        { id: 'title_bug_hunter', name: 'Bug Hunter', price: 300, desc: 'Tag: Bug Hunter 🐛', icon: 'fa-bug' },
        { id: 'title_architect', name: 'Architect', price: 800, desc: 'Tag: Architect 📐', icon: 'fa-ruler-combined' },
        { id: 'title_wizard', name: 'Code Wizard', price: 2000, desc: 'Tag: Wizard 🧙‍♂️', icon: 'fa-hat-wizard' },
        { id: 'title_hacker', name: 'Elite Hacker', price: 3500, desc: 'Tag: Elite Hacker 💀', icon: 'fa-user-secret' },
        { id: 'title_fs', name: 'Fullstack', price: 5000, desc: 'Tag: Fullstack 🌐', icon: 'fa-layer-group' },
        { id: 'title_coffee', name: 'Coffee Lover', price: 150, desc: 'Tag: Java Lover ☕', icon: 'fa-coffee' },
        { id: 'title_ninja', name: 'Ninja', price: 1000, desc: 'Tag: Ninja 🥷', icon: 'fa-user-ninja' },
        { id: 'title_guru', name: 'Tech Guru', price: 10000, desc: 'Tag: Guru 🧘‍♂️', icon: 'fa-om' },
        { id: 'title_void_walker', name: 'Void Walker', price: 6000, desc: 'Tag: Void Walker 🌌', icon: 'fa-meteor' },
        { id: 'title_ai_overlord', name: 'AI Overlord', price: 8000, desc: 'Tag: AI Overlord 🤖', icon: 'fa-robot' },
        { id: 'title_time_traveler', name: 'Time Traveler', price: 5500, desc: 'Tag: Time Traveler ⏳', icon: 'fa-hourglass-half' },
        { id: 'title_digital_shaman', name: 'Digital Shaman', price: 4500, desc: 'Tag: Digital Shaman 🌀', icon: 'fa-eye' },
        { id: 'title_neon_samurai', name: 'Neon Samurai', price: 3800, desc: 'Tag: Neon Samurai ⚔️', icon: 'fa-khanda' },
        { id: 'title_quantum_ghost', name: 'Quantum Ghost', price: 7000, desc: 'Tag: Quantum Ghost 👻', icon: 'fa-ghost' },
        { id: 'title_data_alchemist', name: 'Data Alchemist', price: 5200, desc: 'Tag: Data Alchemist 🔮', icon: 'fa-flask' },
        { id: 'title_cyber_dragon', name: 'Cyber Dragon', price: 6500, desc: 'Tag: Cyber Dragon 🐲', icon: 'fa-dragon' }
    ]
};

document.addEventListener('DOMContentLoaded', () => {
    if (window.currentUser) { initShop(); } 
    else { window.addEventListener('gameDataLoaded', initShop); setTimeout(initShop, 1500); }
});

function initShop() { updateWalletUI(); renderSection('shop-items', CATALOG.items, 'item'); renderSection('shop-themes', CATALOG.themes, 'theme'); renderSection('shop-titles', CATALOG.titles, 'title'); }
function updateWalletUI() { const xpEl = document.getElementById('shop-user-xp'); if(xpEl) xpEl.innerText = window.globalXP ? window.globalXP.toLocaleString() : 0; }

function renderSection(cid, items, type) {
    const container = document.getElementById(cid);
    if(!container) return;
    container.innerHTML = '';
    
    const inv = window.userInventory || [];
    const cur = window.userLoadout ? window.userLoadout[type] : null;
    const xp = window.globalXP || 0;

    items.forEach(item => {
        const isOwned = item.price === 0 || inv.includes(item.id);
        const isConsumable = item.type === 'consumable';
        const count = inv.filter(id => id === item.id).length;
        const canAfford = xp >= item.price;
        
        let btnHTML, btnClass = 'btn-buy', btnAction, isDisabled = false;

        if (isConsumable) {
            if (canAfford) {
                btnHTML = `COMPRAR (${item.price} XP)`;
                btnAction = `comprarItem('${item.id}', ${item.price}, '${item.name}', '${item.icon}')`;
            } else {
                btnHTML = `FALTA XP`; btnClass += ' too-expensive'; isDisabled = true;
            }
            if (count > 0) btnHTML = `COMPRAR MAIS (${count})`;
        } else {
            const isEquipped = cur === item.id || (item.price === 0 && !cur && type === 'theme');
            if (isEquipped) {
                btnHTML = 'EQUIPADO'; btnClass += ' equipped'; isDisabled = true;
            } else if (isOwned) {
                btnHTML = 'EQUIPAR'; btnClass += ' owned';
                btnAction = `equiparItem('${type}', '${item.id}')`;
            } else if (canAfford) {
                btnHTML = `COMPRAR (${item.price})`;
                btnAction = `comprarItem('${item.id}', ${item.price}, '${item.name}', '${item.icon}')`;
            } else {
                btnHTML = `FALTA XP`; btnClass += ' too-expensive'; isDisabled = true;
            }
        }

        const card = document.createElement('div');
        card.className = `shop-item ${item.styleClass || ''}`;
        let qtyBadge = (isConsumable && count > 0) ? `<div class="item-qty">${count}x</div>` : '';

        card.innerHTML = `
            ${qtyBadge}
            <div class="item-price">${item.price === 0 ? 'GRÁTIS' : item.price + ' XP'}</div>
            <div class="item-icon"><i class="fas ${item.icon}"></i></div>
            <h3>${item.name}</h3>
            <p>${item.desc}</p>
            <button class="${btnClass}" onclick="${btnAction}" ${isDisabled ? 'disabled' : ''}>
                ${btnHTML}
            </button>
        `;
        container.appendChild(card);
    });
}

// Ponte atualizada para aceitar nome e ícone
window.comprarItem = function (itemId, price, name, icon) {
    if (window.comprarItemGlobal) {
        window.comprarItemGlobal(itemId, price, name, icon).then(() => initShop());
    }
};

window.equiparItem = function (type, itemId) {
    if (window.equiparItemGlobal) {
        window.equiparItemGlobal(type, itemId).then(() => initShop());
    }
};