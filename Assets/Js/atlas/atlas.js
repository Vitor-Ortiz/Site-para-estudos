/* assets/js/atlas/html.js - Curso HTML5 */

const LESSONS = [
    { id: 'html_01', title: 'O que é HTML?', desc: 'Conceitos fundamentais da Web.', videoId: 'PlxWf493en4' },
    { id: 'html_02', title: 'Primeira Página', desc: 'Criando o arquivo index.html.', videoId: 'CZ2d05h95jI' },
    { id: 'html_03', title: 'Tags de Texto', desc: 'H1, P, Span e formatação.', videoId: 'RjHtmDIgW2M' }
];

let currentLessonId = null;

document.addEventListener('DOMContentLoaded', () => {
    renderLessonList();
    if (window.currentUser || window.globalXP > 0) {
        updateProgressUI();
    } else {
        window.addEventListener('gameDataLoaded', updateProgressUI);
    }
});

function renderLessonList() {
    const list = document.getElementById('lesson-list');
    list.innerHTML = '';
    LESSONS.forEach((lesson, index) => {
        const li = document.createElement('li');
        li.className = 'lesson-item';
        li.dataset.id = lesson.id;
        li.onclick = () => loadLesson(index);
        li.innerHTML = `<i class="far fa-circle status-icon"></i><span>${index + 1}. ${lesson.title}</span>`;
        list.appendChild(li);
    });
}

function loadLesson(index) {
    const lesson = LESSONS[index];
    currentLessonId = lesson.id;
    
    document.querySelectorAll('.lesson-item').forEach(i => i.classList.remove('active'));
    document.querySelector(`.lesson-item[data-id="${lesson.id}"]`).classList.add('active');
    
    document.getElementById('lesson-title').innerText = lesson.title;
    document.getElementById('lesson-desc').innerText = lesson.desc;
    
    document.getElementById('video-overlay').style.display = 'none';
    document.getElementById('video-frame').src = `https://www.youtube.com/embed/${lesson.videoId}`;
    
    checkCompletionStatus();
}

function checkCompletionStatus() {
    const btn = document.getElementById('btn-complete');
    const completed = window.userStats?.lessons || [];
    
    if (completed.includes(currentLessonId)) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-check"></i> CONCLUÍDO';
        btn.style.background = 'rgba(74, 222, 128, 0.2)';
    } else {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-check-circle"></i> MARCAR VISTO (+50 XP)';
        btn.style.background = 'var(--primary-neon)';
    }
}

function updateProgressUI() {
    const completed = window.userStats?.lessons || [];
    const total = LESSONS.length;
    let count = 0;
    
    LESSONS.forEach(lesson => {
        if (completed.includes(lesson.id)) {
            const item = document.querySelector(`.lesson-item[data-id="${lesson.id}"]`);
            if (item) {
                item.classList.add('completed');
                item.querySelector('.status-icon').className = 'fas fa-check-circle';
            }
            count++;
        }
    });
    
    const percent = (count / total) * 100;
    document.getElementById('course-progress').style.width = `${percent}%`;
    if (currentLessonId) checkCompletionStatus();
}

window.concluirAulaAtual = function() {
    if (!currentLessonId) return;
    if (window.registrarAula) {
        window.registrarAula(currentLessonId);
        setTimeout(updateProgressUI, 500); 
    }
};