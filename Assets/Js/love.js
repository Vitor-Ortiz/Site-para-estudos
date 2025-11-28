/* assets/js/love.js - Protocolo Coração (Versão Final Completa) */

// =================================================
// 1. CONFIGURAÇÕES & DADOS
// =================================================

// Data de Início (Ano, Mês-1, Dia).
// Mês 4 = MAIO (Janeiro é 0). Isso corrige a contagem para 201 dias.
const START_DATE = new Date(2025, 4, 10); 

// Fotos para a Galeria (Carrossel)
const PHOTOS = [
    "../assets/img/1.jpeg",
    "../assets/img/2.jpeg",
    "../assets/img/3.jpeg",
    "../assets/img/4.jpeg",
    "../assets/img/5.jpeg", 
    "../assets/img/6.jpeg",
    "../assets/img/7.jpeg",
    "../assets/img/8.jpeg", 
    "../assets/img/9.jpeg",
    "../assets/img/10.jpeg",
    "../assets/img/11.jpeg",
    "../assets/img/12.jpeg",
    "../assets/img/13.jpeg"
];
let currentPhotoIndex = 0;

// Frases Românticas
const LOVE_QUOTES = [
    "Você é o CSS da minha vida: dá cor e sentido a tudo.",
    "Nenhum algoritmo complexo consegue calcular a dimensão do meu amor.",
    "Você é a minha constante favorita num mundo de variáveis.",
    "Meu amor por você é um loop infinito (while true).",
    "Você completou o meu código-fonte.",
    "Com você, a vida roda a 60 FPS, sem lag.",
    "Seu sorriso é a melhor interface que já vi.",
    "Você é a única feature que eu jamais mudaria.",
    "Ao teu lado, todo dia é um commit de felicidade."
];

// Catálogo da Loja de Mimos (Moeda: Love Coins)
const LOVE_ITEMS = [
    { name: "Açaí", price: 200, icon: "fa-ice-cream", type: "consumable" },
    { name: "Massagem", price: 500, icon: "fa-hands", type: "consumable" },
    { name: "Cinema", price: 800, icon: "fa-film", type: "consumable" },
    { name: "Jantar Romântico", price: 1500, icon: "fa-utensils", type: "consumable" },
    { name: "Chocolate", price: 150, icon: "fa-candy-cane", type: "consumable" },
    { name: "Beijo", price: 50, icon: "fa-kiss-wink-heart", type: "consumable" },
    { name: "Dormir de Conchinha", price: 1000, icon: "fa-bed", type: "consumable" },
    { name: "Mimo Surpresa", price: 2000, icon: "fa-gift", type: "consumable" },
    
    // ITEM REAL (Vai para o Inventário)
    { 
        id: "title_love", 
        name: "Título: Player 2", 
        price: 5000, 
        icon: "fa-gamepad", 
        type: "real_item" 
    }
];

// =================================================
// 2. INICIALIZAÇÃO E SEGURANÇA
// =================================================
document.addEventListener('DOMContentLoaded', () => {
    // Aguarda o game-data.js carregar as permissões do Firebase
    setTimeout(() => {
        // Verifica se é a namorada (isLoveUser) ou Admin
        if (!window.isLoveUser && !window.isAdminUser) {
            // Bloqueio de Segurança
            document.body.innerHTML = `
                <div style="height:100vh; display:flex; flex-direction:column; justify-content:center; align-items:center; background:#020202; color:#ff0000; font-family:monospace; text-align:center; padding:20px;">
                    <i class="fas fa-heart-broken" style="font-size:4rem; margin-bottom:20px;"></i>
                    <h1 style="font-size:2rem;">ACESSO RESTRITO 🚫</h1>
                    <p>Este conteúdo é protegido por criptografia sentimental.</p>
                    <p style="margin-top:10px; color:#666;">Redirecionando para a base...</p>
                </div>
            `;
            setTimeout(() => window.location.href = "../pages/home.html", 3000);
        } else {
            // Acesso Permitido
            iniciarPagina();
        }
    }, 1500);
});

function iniciarPagina() {
    // Inicia Contador
    atualizarContador();
    setInterval(atualizarContador, 1000);
    
    // Inicia Efeitos de Fundo
    setInterval(criarCoracao, 800);
    
    // Configura Foto Inicial
    const img = document.getElementById('photo-display');
    if(img) img.src = PHOTOS[0];

    // Configura Loja (USA VARIÁVEL GLOBAL DO GAME-DATA)
    const coinEl = document.getElementById('love-coins');
    if(coinEl) coinEl.innerText = window.loveCoins || 0;
    
    renderLoveShop();
}

// =================================================
// 3. GALERIA DE FOTOS (CARROSSEL)
// =================================================
window.mudarFoto = function(direcao) {
    currentPhotoIndex += direcao;
    
    // Loop infinito do array
    if (currentPhotoIndex >= PHOTOS.length) currentPhotoIndex = 0;
    if (currentPhotoIndex < 0) currentPhotoIndex = PHOTOS.length - 1;
    
    const img = document.getElementById('photo-display');
    
    // Efeito de fade simples
    img.style.opacity = 0;
    setTimeout(() => {
        img.src = PHOTOS[currentPhotoIndex];
        img.style.opacity = 1;
    }, 200);
};

// =================================================
// 4. CONTADOR DE TEMPO
// =================================================
function atualizarContador() {
    const agora = new Date();
    const diff = agora - START_DATE;

    // Lógica para mostrar tempo decorrido
    const diffAbs = Math.abs(diff);
    const dias = Math.floor(diffAbs / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diffAbs / (1000 * 60 * 60)) % 24);
    const minutos = Math.floor((diffAbs / 1000 / 60) % 60);
    const segundos = Math.floor((diffAbs / 1000) % 60);

    // Se a data for no futuro, mostra contagem regressiva, senão mostra tempo juntos
    const prefixo = diff > 0 ? "" : "Contagem regressiva: ";
    
    const timerEl = document.getElementById('relationship-timer');
    if(timerEl) {
        timerEl.innerHTML = `${prefixo}${dias}d ${horas}h ${minutos}m ${segundos}s`;
    }
}

// =================================================
// 5. BOTÃO SURPRESA (Frases)
// =================================================
window.gerarAmor = function() {
    const frase = LOVE_QUOTES[Math.floor(Math.random() * LOVE_QUOTES.length)];
    const quoteEl = document.getElementById('love-quote');
    
    // Animação de fade no texto
    quoteEl.style.opacity = 0;
    setTimeout(() => {
        quoteEl.innerText = `"${frase}"`;
        quoteEl.style.opacity = 1;
    }, 300);

    // Som e Efeitos
    if(window.playSoundGlobal) window.playSoundGlobal('success');
    
    if(window.confetti) {
        window.confetti({
            particleCount: 100, spread: 70, origin: { y: 0.6 },
            colors: ['#ff1493', '#ff69b4', '#ffffff'],
            shapes: ['heart']
        });
    }
    
    // Explosão extra de corações no fundo
    for(let i=0; i<5; i++) setTimeout(criarCoracao, i*150);
};

// =================================================
// 6. GESTÃO DE MODAIS (CARTA, LOJA & COMPRA)
// =================================================
window.abrirCarta = function() {
    document.getElementById('letter-modal').classList.remove('hidden');
    if(window.playSoundGlobal) window.playSoundGlobal('click');
}

window.fecharCarta = function() {
    document.getElementById('letter-modal').classList.add('hidden');
}

window.abrirLoja = function() {
    document.getElementById('shop-modal').classList.remove('hidden');
    if(window.playSoundGlobal) window.playSoundGlobal('click');
    
    // Atualiza saldo ao abrir
    document.getElementById('love-coins').innerText = window.loveCoins || 0;
}

window.fecharLoja = function() {
    document.getElementById('shop-modal').classList.add('hidden');
}

window.fecharPurchaseModal = function() {
    document.getElementById('purchase-modal').classList.add('hidden');
}

// =================================================
// 7. LOJA DE MIMOS (INTEGRADA AO BANCO)
// =================================================
function renderLoveShop() {
    const grid = document.getElementById('love-shop-grid');
    if(!grid) return;
    
    grid.innerHTML = '';
    
    const inventory = window.userInventory || [];

    LOVE_ITEMS.forEach(item => {
        // Verifica se é item real e se já tem
        const isOwned = item.type === 'real_item' && inventory.includes(item.id);
        
        let btnHTML = "COMPRAR";
        let btnClass = "btn-buy-love";
        let btnAction = `comprarAmor('${item.name}', ${item.price}, '${item.icon}', '${item.type}', '${item.id}')`;
        let isDisabled = false;
        let priceDisplay = `${item.price} LC`;

        if (isOwned) {
            // Se for título e já tiver, vira botão de equipar
            btnHTML = "EQUIPAR";
            btnClass += " owned";
            priceDisplay = "Adquirido";
            btnAction = `equiparTitulo('${item.id}')`;
            
            // Se já estiver equipado
            if (window.userLoadout && window.userLoadout.title === item.id) {
                btnHTML = "EQUIPADO";
                btnClass = "btn-buy-love equipped";
                isDisabled = true;
            }
        }

        const card = document.createElement('div');
        card.className = 'love-item';
        card.innerHTML = `
            <i class="fas ${item.icon}"></i>
            <h4>${item.name}</h4>
            <span class="price">${priceDisplay}</span>
            <button class="${btnClass}" onclick="${btnAction}" ${isDisabled ? 'disabled' : ''}>
                ${btnHTML}
            </button>
        `;
        grid.appendChild(card);
    });
}

window.comprarAmor = function(name, price, iconClass, type, itemId) {
    // Usa variável GLOBAL (window.loveCoins)
    if (window.loveCoins >= price) {
        
        // 1. Processa Item Real (Título)
        if (type === 'real_item') {
            if (!window.userInventory.includes(itemId)) {
                window.userInventory.push(itemId);
                // Salva no banco
                if(window.salvarProgressoGlobal) window.salvarProgressoGlobal(); 
            }
        }

        // 2. Desconta e Salva (Usa função global do game-data)
        if (window.adicionarLoveCoins) {
            window.adicionarLoveCoins(-price);
        }
        
        // 3. Atualiza UI Local
        document.getElementById('love-coins').innerText = window.loveCoins;
        
        // 4. Efeitos
        if(window.playSoundGlobal) window.playSoundGlobal('success');
        if(window.confetti) window.confetti({ colors: ['#4ade80', '#fff'], spread: 80 });

        // Fecha loja e abre confirmação
        fecharLoja();
        
        // Re-renderiza se foi item real para atualizar botão
        if (type === 'real_item') renderLoveShop();

        // Abre Modal Sucesso
        const modalName = document.getElementById('purchase-item-name');
        const modalIcon = document.getElementById('purchase-icon');
        if(modalName) modalName.innerText = name;
        if(modalIcon) modalIcon.className = `fas ${iconClass}`;
        
        document.getElementById('purchase-modal').classList.remove('hidden');

    } else {
        if(window.playSoundGlobal) window.playSoundGlobal('error');
        alert("Saldo insuficiente! 😢");
    }
};

// Função para equipar título direto daqui
window.equiparTitulo = function(itemId) {
    if(window.equiparItemGlobal) {
        window.equiparItemGlobal('title', itemId).then(() => {
            renderLoveShop(); // Atualiza botão para "Equipado"
            if(window.confetti) window.confetti({ particleCount: 30, spread: 40 });
        });
    }
};

// =================================================
// 8. PLAYER DE MÚSICA
// =================================================
let isPlaying = false;

window.toggleMusic = function() {
    const audio = document.getElementById('bg-music');
    const icon = document.getElementById('music-icon');
    const text = document.getElementById('music-text');
    const container = document.querySelector('.music-controls');

    if (isPlaying) {
        audio.pause();
        container.classList.remove('playing'); 
        icon.className = "fas fa-music";
        text.innerText = "Toque para ouvir nossa música";
    } else {
        audio.play().then(() => {
            container.classList.add('playing'); 
            icon.className = "fas fa-compact-disc fa-spin"; 
            text.innerText = "Tocando...";
        }).catch(e => {
            alert("Clique na página para permitir o áudio!");
        });
    }
    isPlaying = !isPlaying;
};

// =================================================
// 9. EFEITOS DE FUNDO (CHUVA DE CORAÇÕES)
// =================================================
function criarCoracao() {
    const heart = document.createElement('i');
    heart.classList.add('fas', 'fa-heart', 'heart-particle');
    
    // Posição aleatória na largura da tela
    heart.style.left = Math.random() * 100 + 'vw';
    heart.style.top = '100vh'; // Começa abaixo da tela
    
    // Tamanho variável
    const size = Math.random() * 20 + 10;
    heart.style.fontSize = size + 'px';
    
    // Velocidade de subida variável
    heart.style.animationDuration = (Math.random() * 3 + 4) + 's';
    
    // Opacidade aleatória
    heart.style.opacity = Math.random() * 0.6 + 0.2;
    
    document.body.appendChild(heart);
    
    // Limpeza automática para não pesar a memória
    setTimeout(() => {
        heart.remove();
    }, 7000);
}