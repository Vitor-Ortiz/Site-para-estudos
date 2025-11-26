/* assets/js/atlas/atlas.js - V2 (Com Animações) */

// --- CONFIGURAÇÃO DO CURSO (HTML5) ---
// Podes editar os links do YouTube aqui futuramente
const LESSONS = [
    {
        id: 'html_01',
        title: '1. O que é a Internet?',
        desc: 'Entenda como a web funciona: Servidores, Clientes, HTTP e o papel do navegador.',
        videoId: 'tn2M4X1y27E', 
        material: 'https://developer.mozilla.org/pt-BR/docs/Learn/Common_questions/Web_mechanics/How_does_the_Internet_work'
    },
    {
        id: 'html_02',
        title: '2. Estrutura HTML Básica',
        desc: 'Doctype, html, head e body. A anatomia de qualquer página web.',
        videoId: 'PlxWf493en4', 
        material: 'https://developer.mozilla.org/pt-BR/docs/Learn/HTML/Introduction_to_HTML/Getting_started'
    },
    {
        id: 'html_03',
        title: '3. Textos e Formatação',
        desc: 'Tags de título (h1-h6), parágrafos (p), negrito (strong) e itálico (em).',
        videoId: 'ulh8FNJt1ro',
        material: '#'
    },
    {
        id: 'html_04',
        title: '4. Listas Ordenadas e Não Ordenadas',
        desc: 'Como organizar conteúdo com <ul>, <ol> e <li>.',
        videoId: '',
        material: '#'
    },
    {
        id: 'html_05',
        title: '5. Links e Navegação (Âncoras)',
        desc: 'Conectando páginas com a tag <a> e atributos href, target e title.',
        videoId: '',
        material: '#'
    },
    {
        id: 'html_06',
        title: '6. Multimídia: Imagens e Vídeos',
        desc: 'Inserindo recursos visuais com <img>, <video> e <audio>.',
        videoId: '',
        material: '#'
    },
    {
        id: 'html_07',
        title: '7. Tabelas de Dados',
        desc: 'Estruturando dados complexos com <table>, <tr>, <th> e <td>.',
        videoId: '',
        material: '#'
    },
    {
        id: 'html_08',
        title: '8. Formulários Modernos',
        desc: 'Inputs, labels, validação nativa e envio de dados.',
        videoId: '',
        material: '#'
    },
    {
        id: 'html_09',
        title: '9. HTML Semântico',
        desc: 'Melhorando SEO e acessibilidade com <header>, <main>, <footer> e <article>.',
        videoId: '',
        material: '#'
    },
    {
        id: 'html_10',
        title: '10. Meta Tags e SEO',
        desc: 'Como preparar o seu site para o Google e redes sociais.',
        videoId: '',
        material: '#'
    }
];

let currentLessonId = null;

// --- INICIALIZAÇÃO ---
document.addEventListener('DOMContentLoaded', () => {
    renderLessonList();
    
    if (window.currentUser || window.globalXP > 0) {
        updateProgressUI();
    } else {
        window.addEventListener('gameDataLoaded', updateProgressUI);
        setTimeout(updateProgressUI, 1500);
    }
});

// --- RENDERIZAR LISTA LATERAL ---
function renderLessonList() {
    const list = document.getElementById('lesson-list');
    if(!list) return;

    list.innerHTML = '';

    LESSONS.forEach((lesson, index) => {
        const li = document.createElement('li');
        li.className = 'lesson-item';
        li.dataset.id = lesson.id;
        li.onclick = () => loadLesson(index);
        
        li.innerHTML = `
            <div style="display:flex; align-items:center; gap:10px;">
                <i class="far fa-circle status-icon"></i>
                <div style="display:flex; flex-direction:column;">
                    <span style="font-weight:bold; font-size:0.9rem;">Aula ${index + 1}</span>
                    <span style="font-size:0.75rem; opacity:0.7;">${lesson.title.split('. ')[1] || lesson.title}</span>
                </div>
            </div>
            <i class="fas fa-play" style="font-size:0.7rem; opacity:0.3;"></i>
        `;
        
        list.appendChild(li);
    });
}

// --- CARREGAR AULA NO PLAYER ---
function loadLesson(index) {
    const lesson = LESSONS[index];
    currentLessonId = lesson.id;

    // Atualiza Visual da Lista (Ativo)
    document.querySelectorAll('.lesson-item').forEach(item => item.classList.remove('active'));
    const activeItem = document.querySelector(`.lesson-item[data-id="${lesson.id}"]`);
    if(activeItem) activeItem.classList.add('active');

    // Atualiza Conteúdo
    document.getElementById('lesson-title').innerText = lesson.title;
    document.getElementById('lesson-desc').innerText = lesson.desc;
    
    const btnMaterial = document.getElementById('btn-material');
    if(lesson.material && lesson.material !== '#') {
        btnMaterial.href = lesson.material;
        btnMaterial.style.display = 'inline-flex';
    } else {
        btnMaterial.style.display = 'none';
    }

    // Atualiza Vídeo
    const videoOverlay = document.getElementById('video-overlay');
    const videoFrame = document.getElementById('video-frame');

    if (lesson.videoId) {
        videoOverlay.style.display = 'none';
        videoFrame.src = `https://www.youtube.com/embed/${lesson.videoId}`;
    } else {
        videoOverlay.style.display = 'flex';
        videoOverlay.innerHTML = `
            <i class="fas fa-video-slash" style="font-size:3rem; color:#64748b; margin-bottom:15px;"></i>
            <p>Vídeo em produção.</p>
        `;
        videoFrame.src = '';
    }

    checkCompletionStatus();
}

// --- VERIFICAR STATUS DO BOTÃO ---
function checkCompletionStatus() {
    const btn = document.getElementById('btn-complete');
    const completedLessons = window.userStats?.lessons || [];
    
    if (completedLessons.includes(currentLessonId)) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-check"></i> AULA CONCLUÍDA';
        btn.className = 'btn btn-outline'; // Remove estilo primário
        btn.style.background = 'rgba(74, 222, 128, 0.1)';
        btn.style.color = '#4ade80';
        btn.style.borderColor = '#4ade80';
        btn.style.cursor = 'default';
    } else {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-check-circle"></i> MARCAR COMO VISTO (+50 XP)';
        btn.className = 'btn btn-primary'; // Restaura estilo primário
        btn.style.background = 'var(--primary-neon)';
        btn.style.color = '#000';
        btn.style.borderColor = 'var(--primary-neon)';
        btn.style.cursor = 'pointer';
    }
}

// --- ATUALIZAR UI GERAL ---
function updateProgressUI() {
    const completedLessons = window.userStats?.lessons || [];
    const total = LESSONS.length;
    let count = 0;

    LESSONS.forEach(lesson => {
        if (completedLessons.includes(lesson.id)) {
            const item = document.querySelector(`.lesson-item[data-id="${lesson.id}"]`);
            if (item) {
                item.classList.add('completed');
                item.querySelector('.status-icon').className = 'fas fa-check-circle status-icon';
            }
            count++;
        }
    });

    const percent = Math.round((count / total) * 100);
    const bar = document.getElementById('course-progress');
    if(bar) bar.style.width = `${percent}%`;
    
    if (currentLessonId) checkCompletionStatus();
}

// --- AÇÃO: CONCLUIR AULA (COM EFEITOS) ---
window.concluirAulaAtual = function() {
    if (!currentLessonId) return;
    
    // 1. Feedback Visual Imediato
    const btn = document.getElementById('btn-complete');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> A SALVAR...';
    
    // 2. Dispara Confetes!
    if (window.confetti) {
        window.confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#4ade80', '#ffffff']
        });
    }


    // 4. Salva e Atualiza
    if (window.registrarAula) {
        // Adiciona classe de animação
        btn.classList.add('btn-success-anim');
        
        setTimeout(() => {
            window.registrarAula(currentLessonId);
            updateProgressUI();
            btn.classList.remove('btn-success-anim');
        }, 800); // Pequeno delay para a animação
    } else {
        console.error("Erro: game-data.js não carregado.");
    }
};