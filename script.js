// ===== EXEMPLOS DE VARIÁVEIS E FUNÇÕES =====
function exemploVariaveis() {
    let nome = 'João';
    const idade = 25;

    function cumprimentar() {
        return 'Olá, ' + nome + '! Você tem ' + idade + ' anos.';
    }

    document.getElementById('resultadoVariaveis').textContent = cumprimentar();
}

// ===== MANIPULAÇÃO DO DOM =====
function alterarTexto() {
    document.getElementById('elementoDemo').textContent = 'Texto alterado com sucesso!';
}

function alterarCor() {
    document.getElementById('elementoDemo').style.color = 'red';
}

function adicionarClasse() {
    document.getElementById('elementoDemo').classList.add('destaque');
    // Adicionando uma classe CSS temporária
    let estilo = document.createElement('style');
    estilo.innerHTML = '.destaque { background-color: yellow; padding: 10px; }';
    document.head.appendChild(estilo);
}

function removerClasse() {
    document.getElementById('elementoDemo').classList.remove('destaque');
}

// ===== CALCULADORA =====
let display = document.getElementById('display');
let operador = '';
let valor1 = '';
let valor2 = '';

function adicionarNumero(numero) {
    if (operador === '') {
        valor1 += numero;
        display.value = valor1;
    } else {
        valor2 += numero;
        display.value = valor1 + operador + valor2;
    }
}

function adicionarOperador(op) {
    if (valor1 !== '') {
        operador = op;
        display.value = valor1 + operador;
    }
}

function limparDisplay() {
    display.value = '';
    valor1 = '';
    valor2 = '';
    operador = '';
}

function calcular() {
    if (valor1 !== '' && valor2 !== '' && operador !== '') {
        let resultado;
        let num1 = parseFloat(valor1);
        let num2 = parseFloat(valor2);

        switch (operador) {
            case '+':
                resultado = num1 + num2;
                break;
            case '-':
                resultado = num1 - num2;
                break;
            case '*':
                resultado = num1 * num2;
                break;
            case '/':
                resultado = num2 !== 0 ? num1 / num2 : 'Erro: Divisão por zero';
                break;
            default:
                resultado = 'Operação inválida';
        }

        display.value = resultado;
        valor1 = resultado.toString();
        valor2 = '';
        operador = '';
    }
}

// ===== LISTA DE TAREFAS =====
function adicionarTarefa() {
    const inputTarefa = document.getElementById('novaTarefa');
    const texto = inputTarefa.value.trim();

    if (texto !== '') {
        const lista = document.getElementById('listaTarefas');
        const li = document.createElement('li');
        li.style.padding = '8px';
        li.style.borderBottom = '1px solid #ddd';
        li.style.display = 'flex';
        li.style.justifyContent = 'space-between';
        li.style.alignItems = 'center';

        const span = document.createElement('span');
        span.textContent = texto;

        const btnConcluir = document.createElement('button');
        btnConcluir.textContent = 'Concluir';
        btnConcluir.style.backgroundColor = 'var(--success-color)';
        btnConcluir.style.color = 'white';
        btnConcluir.style.border = 'none';
        btnConcluir.style.padding = '5px 10px';
        btnConcluir.style.borderRadius = '3px';
        btnConcluir.style.cursor = 'pointer';
        btnConcluir.style.marginRight = '5px';

        btnConcluir.onclick = function () {
            span.style.textDecoration = 'line-through';
            span.style.color = '#888';
        };

        const btnRemover = document.createElement('button');
        btnRemover.textContent = 'Remover';
        btnRemover.style.backgroundColor = 'var(--accent-color)';
        btnRemover.style.color = 'white';
        btnRemover.style.border = 'none';
        btnRemover.style.padding = '5px 10px';
        btnRemover.style.borderRadius = '3px';
        btnRemover.style.cursor = 'pointer';

        btnRemover.onclick = function () {
            lista.removeChild(li);
        };

        const divBotoes = document.createElement('div');
        divBotoes.appendChild(btnConcluir);
        divBotoes.appendChild(btnRemover);

        li.appendChild(span);
        li.appendChild(divBotoes);

        lista.appendChild(li);
        inputTarefa.value = '';
    }
}

// ===== CONTADOR =====
let contador = 0;

function incrementar() {
    contador++;
    document.getElementById('valorContador').textContent = contador;
}

function decrementar() {
    contador--;
    document.getElementById('valorContador').textContent = contador;
}

function resetar() {
    contador = 0;
    document.getElementById('valorContador').textContent = contador;
}

// ===== QUIZ INTERATIVO =====
const quizData = [
    {
        question: "O que significa HTML?",
        options: [
            "HyperText Markup Language",
            "HighTech Modern Language",
            "HyperTransfer Markup Language",
            "Home Tool Markup Language"
        ],
        correct: 0,
        explanation: "HTML significa HyperText Markup Language (Linguagem de Marcação de Hipertexto)."
    },
    {
        question: "Qual propriedade CSS é usada para alterar a cor do texto?",
        options: [
            "text-color",
            "font-color",
            "color",
            "text-style"
        ],
        correct: 2,
        explanation: "A propriedade 'color' é usada para definir a cor do texto em CSS."
    },
    {
        question: "Como se declara uma variável em JavaScript?",
        options: [
            "variable x = 5;",
            "var x = 5;",
            "x = 5;",
            "declare x = 5;"
        ],
        correct: 1,
        explanation: "Em JavaScript, usamos 'var', 'let' ou 'const' para declarar variáveis."
    },
    {
        question: "Qual tag HTML é usada para criar um link?",
        options: [
            "&lt;link&gt;",
            "&lt;a&gt;",
            "&lt;href&gt;",
            "&lt;hyperlink&gt;"
        ],
        correct: 1,
        explanation: "A tag &lt;a&gt; é usada para criar hyperlinks em HTML."
    },
    {
        question: "Qual seletor CSS seleciona um elemento com id 'header'?",
        options: [
            ".header",
            "#header",
            "header",
            "*header"
        ],
        correct: 1,
        explanation: "O seletor '#' é usado para selecionar elementos por id em CSS."
    },
    {
        question: "Qual método JavaScript é usado para exibir uma caixa de alerta?",
        options: [
            "msg()",
            "alert()",
            "prompt()",
            "display()"
        ],
        correct: 1,
        explanation: "O método alert() exibe uma caixa de diálogo com uma mensagem especificada."
    },
    {
        question: "Qual propriedade CSS é usada para controlar o espaçamento entre elementos?",
        options: [
            "spacing",
            "margin",
            "padding",
            "border-spacing"
        ],
        correct: 1,
        explanation: "A propriedade 'margin' controla o espaço ao redor de um elemento, fora da borda."
    },
    {
        question: "Como se comenta uma linha em JavaScript?",
        options: [
            "// Este é um comentário",
            "<!-- Este é um comentário -->",
            "/* Este é um comentário */",
            "' Este é um comentário"
        ],
        correct: 0,
        explanation: "Em JavaScript, usamos '//' para comentários de uma linha e '/* */' para múltiplas linhas."
    }
];

// Variáveis do quiz
let currentQuestion = 0;
let score = 0;
let userAnswers = new Array(quizData.length).fill(null);

// Elementos do DOM
const quizProgress = document.getElementById('quizProgress');
const quizQuestion = document.getElementById('quizQuestion');
const quizOptions = document.getElementById('quizOptions');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const quizContent = document.getElementById('quizContent');
const quizResults = document.getElementById('quizResults');
const quizScore = document.getElementById('quizScore');
const quizMessage = document.getElementById('quizMessage');
const restartBtn = document.getElementById('restartBtn');

// Inicializar o quiz
function initQuiz() {
    showQuestion();
    updateProgress();

    // Event listeners
    prevBtn.addEventListener('click', showPreviousQuestion);
    nextBtn.addEventListener('click', showNextQuestion);
    restartBtn.addEventListener('click', restartQuiz);
}

// Mostrar a pergunta atual
function showQuestion() {
    const question = quizData[currentQuestion];
    quizQuestion.textContent = question.question;

    // Limpar opções anteriores
    quizOptions.innerHTML = '';

    // Adicionar novas opções
    question.options.forEach((option, index) => {
        const optionElement = document.createElement('div');
        optionElement.classList.add('quiz-option');

        // Marcar se já foi respondida
        if (userAnswers[currentQuestion] === index) {
            optionElement.classList.add('selected');
        }

        optionElement.textContent = option;
        optionElement.addEventListener('click', () => selectOption(index));
        quizOptions.appendChild(optionElement);
    });

    // Atualizar estado dos botões
    prevBtn.disabled = currentQuestion === 0;

    if (currentQuestion === quizData.length - 1) {
        nextBtn.textContent = 'Finalizar';
    } else {
        nextBtn.textContent = 'Próxima';
    }
}

// Selecionar uma opção
function selectOption(optionIndex) {
    userAnswers[currentQuestion] = optionIndex;

    // Remover seleção anterior
    const options = quizOptions.querySelectorAll('.quiz-option');
    options.forEach(option => option.classList.remove('selected'));

    // Adicionar seleção atual
    options[optionIndex].classList.add('selected');
}

// Mostrar pergunta anterior
function showPreviousQuestion() {
    if (currentQuestion > 0) {
        currentQuestion--;
        showQuestion();
        updateProgress();
    }
}

// Mostrar próxima pergunta
function showNextQuestion() {
    // Verificar se a pergunta atual foi respondida
    if (userAnswers[currentQuestion] === null) {
        alert('Por favor, selecione uma resposta antes de continuar.');
        return;
    }

    if (currentQuestion < quizData.length - 1) {
        currentQuestion++;
        showQuestion();
        updateProgress();
    } else {
        // Última pergunta - finalizar quiz
        finishQuiz();
    }
}

// Atualizar barra de progresso
function updateProgress() {
    const progress = ((currentQuestion + 1) / quizData.length) * 100;
    quizProgress.style.width = `${progress}%`;
}

// Finalizar o quiz
function finishQuiz() {
    // Calcular pontuação
    score = 0;
    userAnswers.forEach((answer, index) => {
        if (answer === quizData[index].correct) {
            score++;
        }
    });

    // Mostrar resultados
    quizContent.style.display = 'none';
    quizResults.style.display = 'block';

    quizScore.textContent = `${score}/${quizData.length}`;

    // Mensagem personalizada baseada na pontuação
    const percentage = (score / quizData.length) * 100;
    if (percentage >= 80) {
        quizMessage.textContent = 'Excelente! Você domina os conceitos básicos de desenvolvimento web!';
    } else if (percentage >= 60) {
        quizMessage.textContent = 'Muito bom! Você tem um bom conhecimento, mas ainda pode melhorar.';
    } else if (percentage >= 40) {
        quizMessage.textContent = 'Bom começo! Continue estudando para melhorar seu conhecimento.';
    } else {
        quizMessage.textContent = 'Não desanime! Revise os materiais e tente novamente.';
    }
}

// Reiniciar o quiz
function restartQuiz() {
    currentQuestion = 0;
    score = 0;
    userAnswers.fill(null);

    quizContent.style.display = 'block';
    quizResults.style.display = 'none';

    showQuestion();
    updateProgress();
}

// Inicializar o quiz quando a página carregar
document.addEventListener('DOMContentLoaded', initQuiz);

// ===== BANCO DE COMANDOS =====
document.addEventListener('DOMContentLoaded', function () {
    // Contadores de comandos
    document.getElementById('htmlCount').textContent = '24';
    document.getElementById('cssCount').textContent = '18';
    document.getElementById('jsCount').textContent = '15';
    document.getElementById('totalCount').textContent = '57+';

    // Navegação entre abas
    const tabs = document.querySelectorAll('.command-tab');
    const contents = document.querySelectorAll('.commands-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.getAttribute('data-tab');

            // Atualizar abas ativas
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Mostrar conteúdo correspondente
            contents.forEach(content => {
                content.classList.remove('active');
                if (content.id === `${target}-content`) {
                    content.classList.add('active');
                }
            });
        });
    });

    // Funcionalidade de pesquisa
    const searchInput = document.getElementById('commandSearch');
    searchInput.addEventListener('input', function () {
        const searchTerm = this.value.toLowerCase();
        const activeContent = document.querySelector('.commands-content.active');
        const cards = activeContent.querySelectorAll('.command-card');

        cards.forEach(card => {
            const cardText = card.textContent.toLowerCase();
            if (cardText.includes(searchTerm)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });

    // Funcionalidade de copiar código
    const copyButtons = document.querySelectorAll('.copy-btn');
    copyButtons.forEach(button => {
        button.addEventListener('click', function () {
            const code = this.getAttribute('data-code');
            navigator.clipboard.writeText(code).then(() => {
                // Feedback visual
                const originalText = this.textContent;
                this.textContent = 'Copiado!';
                this.style.background = '#28a745';

                setTimeout(() => {
                    this.textContent = originalText;
                    this.style.background = '';
                }, 2000);
            });
        });
    });
});

// ===== EXEMPLO DE PROMPT =====
document.addEventListener('DOMContentLoaded', function () {
    // 1. Capturar o elemento do botão
    const btnPrompt = document.getElementById('btnPrompt');
    const resultado = document.getElementById('resultado');

    // 2. Adicionar evento de clique no botão
    btnPrompt.addEventListener('click', function () {
        // 3. Exibir o prompt para o usuário
        const textoDigitado = window.prompt(
            'Digite algo interessante:',
            'Ex: Meu nome é João e estou aprendendo JavaScript!'
        );

        // 4. Processar a resposta do usuário
        if (textoDigitado !== null && textoDigitado.trim() !== '') {
            // Usuário digitou algo válido
            resultado.textContent = textoDigitado;
            resultado.classList.add('highlight');

            // Remover o destaque após 2 segundos
            setTimeout(() => {
                resultado.classList.remove('highlight');
            }, 2000);

        } else if (textoDigitado !== null && textoDigitado.trim() === '') {
            // Usuário clicou em OK mas não digitou nada
            resultado.textContent = 'Você não digitou nada! Tente novamente.';
            resultado.classList.add('highlight');

            setTimeout(() => {
                resultado.classList.remove('highlight');
            }, 2000);

        } else {
            // Usuário clicou em Cancelar
            resultado.textContent = 'Operação cancelada pelo usuário.';
            resultado.classList.add('highlight');

            setTimeout(() => {
                resultado.classList.remove('highlight');
            }, 2000);
        }
    });

    // ===== BÔNUS: Várias formas de usar prompt =====

    // Exemplo 1: Coletar nome do usuário
    function coletarNome() {
        const nome = prompt('Qual é o seu nome?');
        if (nome) {
            alert(`Olá, ${nome}! Seja bem-vindo!`);
        }
    }

    // Exemplo 2: Calculadora simples com prompt
    function calculadoraPrompt() {
        const num1 = parseFloat(prompt('Digite o primeiro número:'));
        const num2 = parseFloat(prompt('Digite o segundo número:'));
        const operacao = prompt('Digite a operação (+, -, *, /):');

        let resultado;

        switch (operacao) {
            case '+':
                resultado = num1 + num2;
                break;
            case '-':
                resultado = num1 - num2;
                break;
            case '*':
                resultado = num1 * num2;
                break;
            case '/':
                resultado = num2 !== 0 ? num1 / num2 : 'Erro: Divisão por zero';
                break;
            default:
                resultado = 'Operação inválida';
        }

        alert(`Resultado: ${resultado}`);
    }

    // Exemplo 3: Lista de compras com prompt
    function listaCompras() {
        const itens = [];
        let continuar = true;

        while (continuar) {
            const item = prompt('Digite um item para a lista de compras (ou cancelar para parar):');

            if (item && item.trim() !== '') {
                itens.push(item.trim());
            } else {
                continuar = false;
            }
        }

        if (itens.length > 0) {
            alert('Sua lista de compras:\n- ' + itens.join('\n- '));
        } else {
            alert('Lista de compras vazia!');
        }
    }

    // Adicionando exemplos extras ao HTML (opcional)
    const bonusSection = document.createElement('div');
    bonusSection.innerHTML = `
        <div style="margin-top: 2rem; padding-top: 2rem; border-top: 1px solid #ddd;">
            <h4 style="color: #2c3e50;">Exemplos Bônus:</h4>
            <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-top: 1rem;">
                <button class="prompt-btn" onclick="coletarNome()" style="background: #e74c3c;">Coletar Nome</button>
                <button class="prompt-btn" onclick="calculadoraPrompt()" style="background: #2ecc71;">Calculadora</button>
                <button class="prompt-btn" onclick="listaCompras()" style="background: #f39c12;">Lista Compras</button>
            </div>
        </div>
    `;

    document.querySelector('.prompt-demo').appendChild(bonusSection);
});

// ===== EXPLICAÇÃO DETALHADA =====
/*
COMO O PROMPT FUNCIONA:

1. window.prompt() - Exibe uma caixa de diálogo com uma mensagem e um campo de entrada
   - Parâmetro 1: Mensagem para o usuário
   - Parâmetro 2 (opcional): Valor padrão no campo

2. Retorno:
   - String: Se o usuário digitar algo e clicar em OK
   - null: Se o usuário clicar em Cancelar

3. Tratamento de respostas:
   - Verificamos se não é null (não cancelou)
   - Verificamos se não está vazio (digitou algo)
   - Executamos ações baseadas na resposta

4. Boas práticas:
   - Sempre validar a entrada
   - Tratar casos de cancelamento
   - Fornecer feedback visual ao usuário
*/