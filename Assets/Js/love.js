/* assets/js/love.js - Versão com Modal de Compra */

const START_DATE = new Date(2025, 5, 9); 

const PHOTOS = [
    "https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=400",
    "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?q=80&w=400",
    "https://images.unsplash.com/photo-1516589178581-a70df693c9ce?q=80&w=400"
];
let currentPhotoIndex = 0;

const LOVE_QUOTES = [
    "Você é o CSS da minha vida.", "Nenhum algoritmo calcula o quanto te amo.",
    "Você é minha constante favorita.", "Meu amor por você é um loop infinito.",
    "Você completou meu código fonte.", "Com você, a vida é livre de bugs."
];

const LOVE_ITEMS = [
    { name: "Açaí", price: 200, icon: "fa-ice-cream" },
    { name: "Massagem", price: 500, icon: "fa-hands" },
    { name: "Cinema", price: 800, icon: "fa-film" },
    { name: "Jantar", price: 1500, icon: "fa-utensils" },
    { name: "Chocolate", price: 150, icon: "fa-candy-cane" },
    { name: "Beijo", price: 50, icon: "fa-kiss-wink-heart" },
    { name: "Dormir de Conchinha", price: 1000, icon: "fa-bed" },
    { name: "Mimo Surpresa", price: 2000, icon: "fa-gift" }
];

let loveCoins = 5000;

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (!window.isLoveUser && !window.isAdminUser) {
            document.body.innerHTML = "<h1 style='color:red;text-align:center;margin-top:20%'>ACESSO RESTRITO 🚫</h1>";
            setTimeout(() => window.location.href = "../pages/home.html", 2000);
        } else {
            iniciarPagina();
        }
    }, 1500);
});

function iniciarPagina() {
    atualizarContador();
    setInterval(atualizarContador, 1000);
    setInterval(criarCoracao, 600);
    
    const img = document.getElementById('photo-display');
    if(img) img.src = PHOTOS[0];

    document.getElementById('love-coins').innerText = loveCoins;
    renderLoveShop();
}

window.mudarFoto = function(direcao) {
    currentPhotoIndex += direcao;
    if (currentPhotoIndex >= PHOTOS.length) currentPhotoIndex = 0;
    if (currentPhotoIndex < 0) currentPhotoIndex = PHOTOS.length - 1;
    const img = document.getElementById('photo-display');
    img.style.opacity = 0;
    setTimeout(() => { img.src = PHOTOS[currentPhotoIndex]; img.style.opacity = 1; }, 200);
};

function atualizarContador() {
    const diff = new Date() - START_DATE;
    const diffAbs = Math.abs(diff);
    const dias = Math.floor(diffAbs / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diffAbs / (1000 * 60 * 60)) % 24);
    const minutos = Math.floor((diffAbs / 1000 / 60) % 60);
    const segundos = Math.floor((diffAbs / 1000) % 60);
    const prefixo = diff > 0 ? "" : "Contagem: ";
    const el = document.getElementById('relationship-timer');
    if(el) el.innerHTML = `${prefixo}${dias}d ${horas}h ${minutos}m ${segundos}s`;
}

window.gerarAmor = function() {
    const frase = LOVE_QUOTES[Math.floor(Math.random() * LOVE_QUOTES.length)];
    const quoteEl = document.getElementById('love-quote');
    quoteEl.style.opacity = 0;
    setTimeout(() => { quoteEl.innerText = `"${frase}"`; quoteEl.style.opacity = 1; }, 300);
    if(window.playSoundGlobal) window.playSoundGlobal('success');
    if(window.confetti) window.confetti({ particleCount: 100, colors: ['#ff1493', '#fff'], shapes: ['heart'] });
    for(let i=0; i<5; i++) setTimeout(criarCoracao, i*100);
};

window.abrirCarta = () => document.getElementById('letter-modal').classList.remove('hidden');
window.fecharCarta = () => document.getElementById('letter-modal').classList.add('hidden');
window.abrirLoja = () => document.getElementById('shop-modal').classList.remove('hidden');
window.fecharLoja = () => document.getElementById('shop-modal').classList.add('hidden');

window.fecharPurchaseModal = () => document.getElementById('purchase-modal').classList.add('hidden');

let isPlaying = false;
window.toggleMusic = function() {
    const audio = document.getElementById('bg-music');
    const icon = document.getElementById('music-icon');
    const text = document.getElementById('music-text');
    const container = document.querySelector('.music-controls');
    if (isPlaying) { audio.pause(); container.classList.remove('playing'); icon.className = "fas fa-music"; text.innerText = "Toque para ouvir"; } 
    else { audio.play(); container.classList.add('playing'); icon.className = "fas fa-compact-disc fa-spin"; text.innerText = "Tocando..."; }
    isPlaying = !isPlaying;
};

function renderLoveShop() {
    const grid = document.getElementById('love-shop-grid');
    if(!grid) return;
    grid.innerHTML = '';
    LOVE_ITEMS.forEach(item => {
        const card = document.createElement('div');
        card.className = 'love-item';
        card.innerHTML = `
            <i class="fas ${item.icon}"></i><h4>${item.name}</h4><span class="price">${item.price} LC</span>
            <button class="btn-buy-love" onclick="comprarAmor('${item.name}', ${item.price}, '${item.icon}')">COMPRAR</button>
        `;
        grid.appendChild(card);
    });
}

// FUNÇÃO DE COMPRA ATUALIZADA (COM MODAL)
window.comprarAmor = function(item, price, iconClass) {
    if (loveCoins >= price) {
        loveCoins -= price;
        document.getElementById('love-coins').innerText = loveCoins;
        
        if(window.playSoundGlobal) window.playSoundGlobal('success');
        if(window.confetti) window.confetti({ colors: ['#4ade80', '#fff'], spread: 100 });

        // Fecha a loja
        fecharLoja();

        // Abre o modal de sucesso
        document.getElementById('purchase-item-name').innerText = item;
        document.getElementById('purchase-icon').className = `fas ${iconClass}`;
        document.getElementById('purchase-modal').classList.remove('hidden');

    } else {
        if(window.playSoundGlobal) window.playSoundGlobal('error');
        alert("Saldo insuficiente! 😢");
    }
};

function criarCoracao() {
    const heart = document.createElement('i');
    heart.classList.add('fas', 'fa-heart', 'heart-particle');
    heart.style.left = Math.random() * 100 + 'vw';
    heart.style.top = '100vh';
    const size = Math.random() * 20 + 10;
    heart.style.fontSize = size + 'px';
    heart.style.animationDuration = (Math.random() * 3 + 3) + 's';
    document.body.appendChild(heart);
    setTimeout(() => heart.remove(), 6000);
}