/* assets/js/login.js */

function fazerLoginGoogle() {
    // Cria o provedor Google
    const provider = new firebase.auth.GoogleAuthProvider();
    const status = document.getElementById('status-msg');
    
    status.innerText = "Conectando ao servidor seguro...";
    
    // Abre o Popup do Google
    firebase.auth().signInWithPopup(provider)
        .then((result) => {
            status.style.color = "#4ade80";
            status.innerText = "Acesso Autorizado! Redirecionando...";
            
            // Sucesso! Volta para a Home
            setTimeout(() => {
                window.location.href = "../index.html";
            }, 1000);
        })
        .catch((error) => {
            console.error(error);
            status.style.color = "#ef4444"; // Vermelho
            
            // Tratamento de erros comuns
            if (error.code === 'auth/unauthorized-domain') {
                status.innerText = "Erro: Domínio não autorizado no Firebase.";
            } else {
                status.innerText = "Erro: " + error.message;
            }
        });
}

function entrarComoConvidado() {
    window.location.href = "../index.html";
}