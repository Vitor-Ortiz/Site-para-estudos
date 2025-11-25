/* assets/js/lab.js - Lógica da Documentação e Labs */

// ===== NAVEGAÇÃO DE ABAS =====
function carregarAba(abaId) {
  // Atualiza Sidebar (Visual)
  document.querySelectorAll('.module-item').forEach(item => item.classList.remove('active'));
  // Nota: O active visual no clique é handled pelo CSS :active ou lógica custom se necessário,
  // aqui focamos no conteúdo.
  
  // Esconde todos os conteúdos
  document.querySelectorAll('.module-content').forEach(content => {
      content.classList.remove('active');
  });
  
  // Mostra o alvo
  const target = document.getElementById(`aba-${abaId}`);
  if (target) {
      target.classList.add('active');
      if(window.playSoundGlobal) window.playSoundGlobal('click');
  }
}

// ===== LABORATÓRIO FLEXBOX =====
function updateFlex() {
  const direction = document.getElementById('ctrl-direction').value;
  const justify = document.getElementById('ctrl-justify').value;
  const align = document.getElementById('ctrl-align').value;
  const gap = document.getElementById('ctrl-gap').value;

  const container = document.getElementById('preview-box');
  container.style.flexDirection = direction;
  container.style.justifyContent = justify;
  container.style.alignItems = align;
  container.style.gap = gap;

  // Atualiza o código visual
  const codeBlock = document.getElementById('code-output');
  codeBlock.innerText = `.container {
display: flex;
flex-direction: ${direction};
justify-content: ${justify};
align-items: ${align};
gap: ${gap};
}`;
  
  if(window.playSoundGlobal) window.playSoundGlobal('hover');
}

// Inicializa
document.addEventListener('DOMContentLoaded', () => {
  updateFlex();
});