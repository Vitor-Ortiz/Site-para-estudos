/* assets/js/login.js - Autenticação V4 (Separada) */

const authLogin = firebase.auth();
const dbLogin = firebase.firestore();

// --- LOGIN ---
function fazerLoginEmail() {
    const email = document.getElementById('email').value;
    const senha = document.getElementById('password').value;

    if (!email || !senha) return atualizarStatus("Preencha todos os campos.", "erro");

    atualizarStatus("Autenticando...", "info");

    authLogin.signInWithEmailAndPassword(email, senha)
        .then(() => loginSucesso("E-mail"))
        .catch(tratarErro);
}

function fazerLoginGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    authLogin.signInWithPopup(provider)
        .then(() => loginSucesso("Google"))
        .catch(tratarErro);
}

// --- REGISTRO ---
function criarContaEmail() {
    const nome = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('password').value;

    if (!nome) return atualizarStatus("O nome é obrigatório.", "erro");
    if (!email || !senha) return atualizarStatus("Preencha e-mail e senha.", "erro");
    if (senha.length < 6) return atualizarStatus("Senha muito curta (min 6).", "erro");

    atualizarStatus("Criando perfil...", "info");

    authLogin.createUserWithEmailAndPassword(email, senha)
        .then((res) => {
            const user = res.user;
            
            // Salvar Display Name
            user.updateProfile({ displayName: nome }).then(() => {
                // Salvar no Banco
                const userDoc = {
                    nome: nome,
                    xp: 0, level: 1, isAdmin: false, customTitle: "",
                    criadoEm: firebase.firestore.FieldValue.serverTimestamp()
                };
                
                if(email === "vitorortiz512@gmail.com") userDoc.isAdmin = true;

                dbLogin.collection('jogadores').doc(user.uid).set(userDoc)
                    .then(() => loginSucesso("Cadastro"))
                    .catch(err => {
                        console.error(err);
                        loginSucesso("Cadastro (Sem DB)"); // Tenta entrar mesmo se DB falhar
                    });
            });
        })
        .catch(tratarErro);
}

function entrarComoConvidado() {
    window.location.href = "../index.html";
}

// --- UI ---
function loginSucesso(tipo) {
    atualizarStatus(`Sucesso (${tipo})! Redirecionando...`, "sucesso");
    setTimeout(() => window.location.href = "../index.html", 1500);
}

function tratarErro(error) {
    let msg = error.message;
    if(error.code === 'auth/wrong-password') msg = "Senha incorreta.";
    if(error.code === 'auth/user-not-found') msg = "Usuário não encontrado.";
    if(error.code === 'auth/email-already-in-use') msg = "E-mail já existe.";
    atualizarStatus(msg, "erro");
}

function atualizarStatus(msg, tipo) {
    const el = document.getElementById('status-msg');
    if(!el) return;
    el.innerText = msg;
    el.style.color = tipo === 'erro' ? '#ef4444' : (tipo === 'sucesso' ? '#4ade80' : '#38bdf8');
}