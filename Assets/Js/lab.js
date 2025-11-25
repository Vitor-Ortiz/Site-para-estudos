/* Lógica do Laboratório Flexbox */

function updateFlex() {
    // 1. Pegar valores dos inputs
    const direction = document.getElementById('ctrl-direction').value;
    const justify = document.getElementById('ctrl-justify').value;
    const align = document.getElementById('ctrl-align').value;
    const gap = document.getElementById('ctrl-gap').value;

    // 2. Aplicar ao elemento visual
    const container = document.getElementById('preview-box');
    container.style.flexDirection = direction;
    container.style.justifyContent = justify;
    container.style.alignItems = align;
    container.style.gap = gap;

    // 3. Gerar o código CSS para o usuário copiar
    const codeBlock = document.getElementById('code-output');
    codeBlock.innerText = `.container {
  display: flex;
  flex-direction: ${direction};
  justify-content: ${justify};
  align-items: ${align};
  gap: ${gap};
}`;
    
    // Efeito sonoro sutil
    if(window.playSoundGlobal) window.playSoundGlobal('hover');
}

// Inicializa
document.addEventListener('DOMContentLoaded', updateFlex);