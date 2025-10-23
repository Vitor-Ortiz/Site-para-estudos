// ===== FUNÇÕES DA PÁGINA DE REVISÃO =====

// Mostrar/ocultar exercícios por categoria
function mostrarExercicio(categoria) {
    console.log('Mostrando exercícios de:', categoria); // Para debug
    
    // Oculta todas as categorias
    document.querySelectorAll('.exercicio-categoria').forEach(el => {
        el.style.display = 'none';
    });
    
    // Mostra a categoria selecionada
    const elementoCategoria = document.getElementById('exercicio-' + categoria);
    if (elementoCategoria) {
        elementoCategoria.style.display = 'block';
        
        // Rolagem suave para a seção
        elementoCategoria.scrollIntoView({ 
            behavior: 'smooth' 
        });
    }
}

// Verificar respostas das perguntas
function verificarResposta(elemento, tipo) {
    // Remove classes de todos os irmãos
    const opcoes = elemento.parentElement.querySelectorAll('.opcao');
    opcoes.forEach(opcao => {
        opcao.classList.remove('correta', 'incorreta');
    });
    
    // Adiciona classe ao elemento clicado
    elemento.classList.add(tipo);
    
    // Mostra resultado
    const resultadoId = elemento.parentElement.nextElementSibling.id;
    const resultado = document.getElementById(resultadoId);
    
    if (tipo === 'correta') {
        resultado.textContent = '✓ Correto! Parabéns!';
        resultado.className = 'resultado correto';
    } else {
        resultado.textContent = '✗ Incorreto. Tente novamente!';
        resultado.className = 'resultado incorreto';
        
        // Mostra a resposta correta
        const correta = elemento.parentElement.querySelector('.opcao.correta');
        if (correta) {
            correta.classList.add('correta');
        }
    }
}

// Verificar código HTML
function verificarCodigoHTML() {
    const codigo = document.getElementById('editor-html').textContent;
    const resultado = document.getElementById('resultado-desafio-html');
    
    if (codigo.includes('<ol>') && codigo.includes('<li>') && codigo.includes('</ol>')) {
        resultado.textContent = '✓ Parabéns! Sua lista ordenada está correta!';
        resultado.className = 'resultado correto';
    } else {
        resultado.textContent = '✗ Verifique se você usou as tags <ol> e <li> corretamente.';
        resultado.className = 'resultado incorreto';
    }
}

// Verificar código CSS
function verificarCodigoCSS() {
    const codigo = document.getElementById('editor-css').textContent;
    const resultado = document.getElementById('resultado-desafio-css');
    
    if (codigo.includes('.btn') && codigo.includes(':hover') && codigo.includes('background-color')) {
        resultado.textContent = '✓ Excelente! Seu botão está bem estilizado!';
        resultado.className = 'resultado correto';
    } else {
        resultado.textContent = '✗ Verifique se você usou a classe .btn e o pseudo-seletor :hover.';
        resultado.className = 'resultado incorreto';
    }
}

// Verificar código JavaScript
function verificarCodigoJS() {
    const codigo = document.getElementById('editor-js').textContent;
    const resultado = document.getElementById('resultado-desafio-js');
    
    if (codigo.includes('function') && codigo.includes('return') && codigo.includes('+')) {
        resultado.textContent = '✓ Ótimo trabalho! Sua função está funcionando perfeitamente!';
        resultado.className = 'resultado correto';
    } else {
        resultado.textContent = '✗ Verifique se você criou uma função com return e concatenação de strings.';
        resultado.className = 'resultado incorreto';
    }
}

// ===== EXEMPLO DO PROMPT =====
function exemploPrompt() {
    // 1. Abre o prompt para o usuário digitar
    const texto = window.prompt('Digite algo para exibir na tela:', 'Exemplo: Estou aprendendo JavaScript!');
    
    // 2. Obtém o elemento onde vamos mostrar o resultado
    const resultado = document.getElementById('resultado-prompt');
    
    // 3. Verifica se o usuário digitou algo
    if (texto !== null && texto.trim() !== '') {
        resultado.innerHTML = `
            <strong>Você digitou:</strong> "${texto}"
            <br><br>
            <small>Como isso funciona:</small>
            <div class="code-editor" style="font-size: 0.8rem;">
                // 1. Abre o prompt<br>
                const texto = window.prompt('Digite algo:');<br><br>
                
                // 2. Verifica se não é vazio<br>
                if (texto !== null && texto.trim() !== '') {<br>
                &nbsp;&nbsp;// 3. Exibe na tela<br>
                &nbsp;&nbsp;document.getElementById('resultado').innerHTML = texto;<br>
                }
            </div>
        `;
        resultado.style.display = 'block';
    } else if (texto !== null) {
        resultado.innerHTML = 'Você não digitou nada!';
        resultado.style.display = 'block';
    } else {
        resultado.innerHTML = 'Você cancelou o prompt!';
        resultado.style.display = 'block';
    }
}

// ===== INICIALIZAÇÃO QUANDO A PÁGINA CARREGA =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('Página de revisão carregada!'); // Para debug
    
    // Adiciona event listeners aos botões de categoria
    document.querySelectorAll('.revisao-btn[data-categoria]').forEach(botao => {
        botao.addEventListener('click', function() {
            const categoria = this.getAttribute('data-categoria');
            mostrarExercicio(categoria);
        });
    });
    
    // Adiciona event listeners aos botões de verificação de código
    const botoesVerificacao = [
        { id: 'verificar-html', funcao: verificarCodigoHTML },
        { id: 'verificar-css', funcao: verificarCodigoCSS },
        { id: 'verificar-js', funcao: verificarCodigoJS }
    ];
    
    botoesVerificacao.forEach(botao => {
        const elemento = document.getElementById(botao.id);
        if (elemento) {
            elemento.addEventListener('click', botao.funcao);
        }
    });
    
    // Adiciona event listener ao botão de prompt
    const botaoPrompt = document.getElementById('botao-prompt');
    if (botaoPrompt) {
        botaoPrompt.addEventListener('click', exemploPrompt);
    }
    
    // Adiciona event listeners às opções de resposta
    document.querySelectorAll('.opcao').forEach(opcao => {
        opcao.addEventListener('click', function() {
            const tipo = this.classList.contains('correta') ? 'correta' : 'incorreta';
            verificarResposta(this, tipo);
        });
    });
});