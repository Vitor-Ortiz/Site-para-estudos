/* assets/js/lua.js - Lógica da Sala da Lua */

// --- CONFIGURAÇÃO ---
// Use localhost para testes na escola e Render para produção
const API_URL = "http://127.0.0.1:8000"; 
// const API_URL = "https://devstudy-api.onrender.com"; 

document.addEventListener('DOMContentLoaded', () => {
    // 1. SEGURANÇA: Verifica Admin
    setTimeout(() => {
        if (!window.isAdminUser) {
            const overlay = document.getElementById('security-overlay');
            overlay.innerHTML = `<i class="fas fa-lock" style="font-size: 4rem; margin-bottom: 20px;"></i><h1 style="margin-bottom:10px;">ACESSO NEGADO</h1><p style="color:#94a3b8;">Redirecionando...</p>`;
            setTimeout(() => window.location.href = "../index.html", 2000); // Volta para a raiz (ajuste se necessário)
        } else {
            const overlay = document.getElementById('security-overlay');
            overlay.style.opacity = '0';
            setTimeout(() => overlay.remove(), 500);
        }
    }, 2000);

    // 2. ELEMENTOS DO DOM
    const chatBox = document.getElementById('chat-box');
    const userInput = document.getElementById('user-input');
    const teachCheck = document.getElementById('teach-check');
    const btnSend = document.getElementById('btn-send');

    // 3. EVENTOS
    userInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') enviarMensagem(); });
    if(btnSend) btnSend.addEventListener('click', enviarMensagem);

    teachCheck.addEventListener('change', () => {
        if (teachCheck.checked) {
            userInput.style.borderColor = "#facc15";
            userInput.placeholder = "DIGITE O FATO QUE A LUA DEVE APRENDER...";
            btnSend.style.background = "#facc15";
            btnSend.style.color = "black";
        } else {
            userInput.style.borderColor = "#475569";
            userInput.placeholder = "Digite sua mensagem aqui...";
            btnSend.style.background = "#9333ea";
            btnSend.style.color = "white";
        }
    });

    // 4. FUNÇÃO DE ENVIO
    async function enviarMensagem() {
        const texto = userInput.value.trim();
        if (!texto) return;

        addMsg(texto, 'user');
        userInput.value = '';
        userInput.focus();

        const loadingId = addMsg(teachCheck.checked ? "💾 Gravando no Supabase..." : "🧠 Pensando...", 'lua', true);

        try {
            const response = await fetch(`${API_URL}/chat_lua`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mensagem: texto, memorizar: teachCheck.checked })
            });

            if (!response.ok) throw new Error("Erro na API Python");
            const data = await response.json();
            
            document.getElementById(loadingId).remove();
            addMsg(data.resposta, 'lua');

            if (teachCheck.checked) {
                teachCheck.checked = false;
                teachCheck.dispatchEvent(new Event('change'));
                addMsg("Informação salva na memória permanente.", "system");
            }

        } catch (error) {
            document.getElementById(loadingId).remove();
            addMsg("❌ Erro: O servidor Python não respondeu. Verifique o uvicorn.", 'system');
        }
    }

    // 5. HELPER VISUAL
    function addMsg(html, tipo, isLoading = false) {
        const div = document.createElement('div');
        div.className = `msg ${tipo}`;
        if (isLoading) {
            div.id = "loading-" + Date.now();
            div.style.opacity = "0.7";
            div.innerHTML = `<i class="fas fa-circle-notch fa-spin"></i> ${html}`;
        } else {
            div.innerHTML = html.replace(/\n/g, '<br>');
        }
        chatBox.appendChild(div);
        chatBox.scrollTop = chatBox.scrollHeight;
        return div.id;
    }
});