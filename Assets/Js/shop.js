/* assets/js/shop.js - V3 (Com Animação de Compra) */

const CATALOG = {
    items: [
        { 
            id: 'item_shield', 
            name: 'Escudo de Defensiva', 
            price: 500, 
            desc: 'Protege sua sequência de dias (Streak) se esquecer de logar.', 
            icon: 'fa-shield-alt',
            type: 'consumable' 
        }
    ],
    themes: [
        { id: 'theme_default', name: 'Cyber Blue', price: 0, desc: 'O visual clássico.', icon: 'fa-desktop' },
        { id: 'theme_matrix', name: 'The Matrix', price: 500, desc: 'Verde hacker terminal.', icon: 'fa-code', styleClass: 'preview-matrix' },
        { id: 'theme_dracula', name: 'Dracula', price: 1200, desc: 'Tons roxos escuros.', icon: 'fa-moon', styleClass: 'preview-dracula' },
        { id: 'theme_gold', name: 'Golden State', price: 5000, desc: 'Luxo puro.', icon: 'fa-crown', styleClass: 'preview-gold' },
        { id: 'theme_fire', name: 'Firewall', price: 2500, desc: 'Quente e agressivo.', icon: 'fa-fire', styleClass: 'preview-fire' },
        { id: 'theme_neon', name: 'Neon Future', price: 3000, desc: 'Ciano e Roxo Vibrante.', icon: 'fa-bolt', styleClass: 'preview-neon' },
        { id: 'theme_retro', name: 'Retro Amber', price: 1500, desc: 'Monitores antigos.', icon: 'fa-terminal', styleClass: 'preview-retro' }
    ],
    titles: [
        { id: 'default_title', name: 'Padrão (Nível)', price: 0, desc: 'Usa o título do nível.', icon: 'fa-user' },
        { id: 'title_bug_hunter', name: 'Bug Hunter', price: 300, desc: 'Tag: Bug Hunter 🐛', icon: 'fa-bug' },
        { id: 'title_architect', name: 'Architect', price: 800, desc: 'Tag: Architect 📐', icon: 'fa-ruler-combined' },
        { id: 'title_wizard', name: 'Code Wizard', price: 2000, desc: 'Tag: Wizard 🧙‍♂️', icon: 'fa-hat-wizard' },
        { id: 'title_ninja', name: 'Ninja', price: 1000, desc: 'Tag: Ninja 🥷', icon: 'fa-user-ninja' },
        { id: 'title_fs', name: 'Fullstack', price: 5000, desc: 'Tag: Fullstack 🌐', icon: 'fa-layer-group' },
        { id: 'title_coffee', name: 'Coffee Lover', price: 150, desc: 'Tag: Java Lover ☕', icon: 'fa-coffee' }
    ]
};

document.addEventListener('DOMContentLoaded', () => {
    if (window.currentUser) {
        initShop();
    } else {
        window.addEventListener('gameDataLoaded', initShop);
        setTimeout(initShop, 1500);
    }
});

function initShop() {
    updateWalletUI();
    renderSection('shop-items', CATALOG.items, 'item');
    renderSection('shop-themes', CATALOG.themes, 'theme');
    renderSection('shop-titles', CATALOG.titles, 'title');
}

function updateWalletUI() {
    const xpEl = document.getElementById('shop-user-xp');
    if(xpEl) xpEl.innerText = window.globalXP ? window.globalXP.toLocaleString() : 0;
}

function renderSection(containerId, items, type) {
    const container = document.getElementById(containerId);
    if(!container) return;
    container.innerHTML = '';
    
    const inventory = window.userInventory || [];
    const currentEquipped = window.userLoadout ? window.userLoadout[type] : null;
    const userXP = window.globalXP || 0;

    items.forEach(item => {
        const isOwned = item.price === 0 || inventory.includes(item.id);
        const canAfford = userXP >= item.price;
        const isConsumable = item.type === 'consumable';
        const count = inventory.filter(id => id === item.id).length;

        let btnHTML = '';
        let btnClass = 'btn-buy';
        let btnAction = '';
        let isDisabled = false;

        // Lógica do Botão
        if (isConsumable) {
            if (canAfford) {
                btnHTML = `COMPRAR (${item.price} XP)`;
                // ATUALIZAÇÃO: Passamos nome e ícone agora!
                btnAction = `comprarItem('${item.id}', ${item.price}, '${item.name}', '${item.icon}')`;
            } else {
                btnHTML = `FALTA ${item.price - userXP} XP`;
                btnClass += ' too-expensive';
                isDisabled = true;
            }
            if (count > 0) btnHTML = `COMPRAR MAIS (Tens: ${count})`;

        } else {
            const isEquipped = currentEquipped === item.id || (item.price === 0 && !currentEquipped && type === 'theme');
            
            if (isEquipped) {
                btnHTML = '<i class="fas fa-check-circle"></i> EQUIPADO';
                btnClass += ' equipped';
                isDisabled = true;
            } else if (isOwned) {
                btnHTML = 'EQUIPAR';
                btnClass += ' owned';
                btnAction = `equiparItem('${type}', '${item.id}')`;
            } else if (canAfford) {
                btnHTML = `COMPRAR (${item.price})`;
                // ATUALIZAÇÃO: Passamos nome e ícone agora!
                btnAction = `comprarItem('${item.id}', ${item.price}, '${item.name}', '${item.icon}')`;
            } else {
                btnHTML = `FALTA ${item.price - userXP}`;
                btnClass += ' too-expensive';
                isDisabled = true;
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
window.comprarItem = function(itemId, price, name, icon) {
    if(window.comprarItemGlobal) {
        window.comprarItemGlobal(itemId, price, name, icon).then(() => initShop());
    }
};

window.equiparItem = function(type, itemId) {
    if(window.equiparItemGlobal) {
        window.equiparItemGlobal(type, itemId).then(() => initShop());
    }
};