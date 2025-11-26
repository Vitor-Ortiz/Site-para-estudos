/* assets/js/love.js - Protocolo Coração (Versão Final Completa) */

// =================================================
// 1. CONFIGURAÇÕES & DADOS
// =================================================

// Data de Início (Ano, Mês-1, Dia). Mês 5 = Junho.
const START_DATE = new Date(2025, 5, 9); 

// Fotos para a Galeria (Carrossel)
// Substitua as URLs abaixo pelas fotos reais de vocês!
const PHOTOS = [
    "https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=400", // Foto 1
    "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?q=80&w=400", // Foto 2
    "https://images.unsplash.com/photo-1516589178581-a70df693c9ce?q=80&w=400"  // Foto 3
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
    { name: "Açaí", price: 200, icon: "fa-ice-cream" },
    { name: "Massagem", price: 500, icon: "fa-hands" },
    { name: "Cinema", price: 800, icon: "fa-film" },
    { name: "Jantar Romântico", price: 1500, icon: "fa-utensils" },
    { name: "Chocolate", price: 150, icon: "fa-candy-cane" },
    { name: "Beijo", price: 50, icon: "fa-kiss-wink-heart" },
    { name: "Dormir de Conchinha", price: 1000, icon: "fa-bed" },
    { name: "Mimo Surpresa", price: 2000, icon: "fa-gift" }
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

    // Configura Loja (Lê saldo global do game-data.js)
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

    // Lógica para mostrar tempo decorrido (ou falta)
    const diffAbs = Math.abs(diff);
    const dias = Math.floor(diffAbs / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diffAbs / (1000 * 60 * 60)) % 24);
    const minutos = Math.floor((diffAbs / 1000 / 60) % 60);
    const segundos = Math.floor((diffAbs / 1000) % 60);

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

    LOVE_ITEMS.forEach(item => {
        const card = document.createElement('div');
        card.className = 'love-item';
        card.innerHTML = `
            <i class="fas ${item.icon}"></i>
            <h4>${item.name}</h4>
            <span class="price">${item.price} LC</span>
            <button class="btn-buy-love" onclick="comprarAmor('${item.name}', ${item.price}, '${item.icon}')">COMPRAR</button>
        `;
        grid.appendChild(card);
    });
}

window.comprarAmor = function(item, price, iconClass) {
    // Verifica saldo global (window.loveCoins vem do game-data.js)
    if (window.loveCoins >= price) {
        
        // Usa a função global do game-data.js para descontar e salvar no Firebase
        window.adicionarLoveCoins(-price);
        
        // Atualiza visualmente o saldo
        document.getElementById('love-coins').innerText = window.loveCoins;
        
        // Efeitos
        if(window.playSoundGlobal) window.playSoundGlobal('success');
        if(window.confetti) window.confetti({ colors: ['#4ade80', '#fff'], spread: 80 });

        // Fecha a loja para mostrar a confirmação
        fecharLoja();

        // Abre o Modal de Sucesso com o item comprado
        document.getElementById('purchase-item-name').innerText = item;
        const iconEl = document.getElementById('purchase-icon');
        if(iconEl) iconEl.className = `fas ${iconClass}`;
        
        document.getElementById('purchase-modal').classList.remove('hidden');

    } else {
        // Saldo Insuficiente
        if(window.playSoundGlobal) window.playSoundGlobal('error');
        
        // Animação Shake na carteira (se o CSS tiver .shake)
        const wallet = document.querySelector('.wallet');
        if(wallet) {
            wallet.classList.add('shake');
            setTimeout(() => wallet.classList.remove('shake'), 500);
        }
        
        alert("Saldo insuficiente de Love Coins! 😢\nPeça um beijo para recarregar.");
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
        container.classList.remove('playing'); // Remove animação das barras e borda
        icon.className = "fas fa-music";
        text.innerText = "Toque para ouvir nossa música";
    } else {
        // Tenta tocar (navegadores bloqueiam autoplay sem interação)
        audio.play().then(() => {
            container.classList.add('playing'); // Ativa animação das barras
            icon.className = "fas fa-compact-disc fa-spin"; // Ícone girando
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