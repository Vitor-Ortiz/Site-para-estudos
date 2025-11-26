/* assets/js/love.js - Lógica Romântica V3 */

// --- DATA DE NAMORO (ANO, MÊS-1, DIA) ---
// Nota: Mês começa em 0 (Janeiro=0, Junho=5)
const START_DATE = new Date(2025, 5, 9); // 9 de Junho de 2025

const LOVE_QUOTES = [
    "Você é o CSS da minha vida.",
    "Nenhum algoritmo consegue calcular o quanto te amo.",
    "Você é minha constante favorita.",
    "Meu amor por você é um loop infinito.",
    "Você completou meu código fonte.",
    "Com você, a vida é livre de bugs."
];

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        // Verifica se é a namorada ou admin
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
    setInterval(criarCoracao, 400); // Chuva constante
}

function atualizarContador() {
    const agora = new Date();
    // Se a data for futura, inverte para mostrar "Faltam..." ou ajusta lógica
    // Assumindo que é uma data futura de "aniversário" ou que houve um erro de ano.
    // Se for data passada:
    const diff = agora - START_DATE;

    // Se a data for no futuro (ex: casamento marcado), mostra contagem regressiva
    // Se for namoro (passado), mostra tempo decorrido.
    // Vou assumir tempo decorrido (valor absoluto):
    const diffAbs = Math.abs(diff);

    const dias = Math.floor(diffAbs / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diffAbs / (1000 * 60 * 60)) % 24);
    const minutos = Math.floor((diffAbs / 1000 / 60) % 60);
    const segundos = Math.floor((diffAbs / 1000) % 60);

    const prefixo = diff > 0 ? "" : "Faltam: ";
    
    document.getElementById('relationship-timer').innerHTML = 
        `${prefixo}${dias}d ${horas}h ${minutos}m ${segundos}s`;
}

window.gerarAmor = function() {
    const frase = LOVE_QUOTES[Math.floor(Math.random() * LOVE_QUOTES.length)];
    const quoteEl = document.getElementById('love-quote');
    quoteEl.style.opacity = 0;
    setTimeout(() => {
        quoteEl.innerText = `"${frase}"`;
        quoteEl.style.opacity = 1;
    }, 300);

    if (window.confetti) {
        window.confetti({
            particleCount: 100, spread: 70, origin: { y: 0.6 },
            colors: ['#ff1493', '#ff69b4', '#ffffff'],
            shapes: ['heart']
        });
    }
    // Som
    if(window.playSoundGlobal) window.playSoundGlobal('success');
};

// --- CARTA ---
window.abrirCarta = function() {
    document.getElementById('letter-modal').classList.remove('hidden');
}

window.fecharCarta = function() {
    document.getElementById('letter-modal').classList.add('hidden');
}

// --- MÚSICA ---
let isPlaying = false;
window.toggleMusic = function() {
    const audio = document.getElementById('bg-music');
    const icon = document.getElementById('music-icon');
    const text = document.getElementById('music-text');

    if (isPlaying) {
        audio.pause();
        icon.classList.remove('fa-spin');
        text.innerText = "Toque para ouvir nossa música";
    } else {
        audio.play();
        icon.classList.add('fa-spin');
        text.innerText = "Tocando...";
    }
    isPlaying = !isPlaying;
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