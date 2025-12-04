/* assets/js/login.js - Autenticação V5 (Integrada e Corrigida) */

// NOTA IMPORTANTE:
// Não inicializamos o Firebase aqui porque o game-data.js já fez isso.
// Usamos as variáveis globais 'window.auth' e 'window.db'.

// --- LOGIN COM E-MAIL ---
function fazerLoginEmail() {
    const email = document.getElementById('email').value;
    const senha = document.getElementById('password').value;

    if (!email || !senha) {
        return atualizarStatus("Preencha todos os campos.", "erro");
    }

    atualizarStatus("Autenticando...", "info");

    // Usa a autenticação global
    window.auth.signInWithEmailAndPassword(email, senha)
        .then((userCredential) => {
            loginSucesso("E-mail");
        })
        .catch(tratarErro);
}

// --- LOGIN COM GOOGLE ---
function fazerLoginGoogle() {
    // Cria o provedor Google
    const provider = new firebase.auth.GoogleAuthProvider();
    
    atualizarStatus("Abrindo Pop-up do Google...", "info");

    // Usa a autenticação global
    window.auth.signInWithPopup(provider)
        .then((result) => {
            loginSucesso("Google");
        })
        .catch(tratarErro);
}

// --- CADASTRO (Se usar a página register.html) ---
function criarContaEmail() {
    const nome = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('password').value;

    if (!nome) return atualizarStatus("O nome é obrigatório.", "erro");
    if (!email || !senha) return atualizarStatus("Preencha e-mail e senha.", "erro");
    if (senha.length < 6) return atualizarStatus("Senha muito curta (min 6).", "erro");

    atualizarStatus("Criando perfil...", "info");

    window.auth.createUserWithEmailAndPassword(email, senha)
        .then((res) => {
            const user = res.user;
            
            // 1. Atualiza o nome de exibição no Auth
            user.updateProfile({ displayName: nome }).then(() => {
                
                // 2. Cria o documento no Banco de Dados
                const userDoc = {
                    nome: nome,
                    xp: 0, 
                    level: 1, 
                    isAdmin: false, 
                    customTitle: "",
                    criadoEm: firebase.firestore.FieldValue.serverTimestamp()
                };
                
                // Se for o seu e-mail, já dá Admin
                if(email === "vitorortiz512@gmail.com") userDoc.isAdmin = true;

                window.db.collection('jogadores').doc(user.uid).set(userDoc)
                    .then(() => loginSucesso("Cadastro"))
                    .catch(err => {
                        console.error(err);
                        // Se der erro no banco, entra mesmo assim (o game-data cria depois)
                        loginSucesso("Cadastro (Offline Mode)"); 
                    });
            });
        })
        .catch(tratarErro);
}

// --- MODO VISITANTE ---
function entrarComoConvidado() {
    // Redireciona direto. O game-data.js na home vai perceber que não tem user
    // e vai criar um ID de visitante temporário.
    window.location.href = "../home.html";
}

// --- FUNÇÕES DE INTERFACE (UI) ---

function loginSucesso(metodo) {
    atualizarStatus(`Acesso Autorizado (${metodo})! Entrando...`, "sucesso");
    
    // Pequeno delay para o usuário ler a mensagem
    setTimeout(() => {
        // CORREÇÃO: Volta para a pasta raiz onde está o index.html (Dashboard)
        window.location.href = "../../index.html"; 
    }, 1500);
}

function tratarErro(error) {
    console.error(error);
    let msg = error.message;
    
    // Traduzindo erros comuns do Firebase
    if(error.code === 'auth/wrong-password') msg = "Senha incorreta.";
    if(error.code === 'auth/user-not-found') msg = "Usuário não encontrado.";
    if(error.code === 'auth/email-already-in-use') msg = "E-mail já cadastrado.";
    if(error.code === 'auth/invalid-email') msg = "Formato de e-mail inválido.";
    if(error.code === 'auth/popup-closed-by-user') msg = "Login cancelado.";
    
    atualizarStatus(msg, "erro");
}

function atualizarStatus(msg, tipo) {
    const el = document.getElementById('status-msg');
    if(!el) return;
    
    el.innerText = msg;
    
    // Cores baseadas no tema Neon
    if (tipo === 'erro') el.style.color = '#ef4444'; // Vermelho
    else if (tipo === 'sucesso') el.style.color = '#4ade80'; // Verde
    else el.style.color = '#38bdf8'; // Azul (Info)
    
    // Efeito de tremor se for erro
    if (tipo === 'erro') {
        const card = document.querySelector('.login-card');
        if(card) {
            card.animate([
                { transform: 'translateX(0)' },
                { transform: 'translateX(-5px)' },
                { transform: 'translateX(5px)' },
                { transform: 'translateX(0)' }
            ], { duration: 300 });
        }
    }
}

// Atalho: Apertar Enter no campo de senha faz login
const passInput = document.getElementById('password');
if(passInput) {
    passInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            // Verifica qual botão está visível para decidir se é login ou cadastro
            if(document.querySelector('.btn-login-email')) fazerLoginEmail();
            else if(document.querySelector('.btn-register')) criarContaEmail();
        }
    });
}