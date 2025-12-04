/* assets/js/lua.js - Lógica da Sala da Lua (V Final) */

// CONFIGURAÇÃO DE API
// Use localhost para testes na escola e Render para produção
const API_URL = "http://127.0.0.1:8000"; 
// const API_URL = "https://devstudy-api.onrender.com"; 

document.addEventListener('DOMContentLoaded', () => {
    // 1. SEGURANÇA: Verifica Admin
    setTimeout(() => {
        // Se window.isAdminUser for undefined ou false, bloqueia
        if (!window.isAdminUser) {
            const overlay = document.getElementById('security-overlay');
            if(overlay) {
                overlay.innerHTML = `<i class="fas fa-lock" style="font-size: 4rem; margin-bottom: 20px;"></i><h1 style="margin-bottom:10px;">ACESSO NEGADO</h1><p style="color:#94a3b8;">Redirecionando...</p>`;
                setTimeout(() => window.location.href = "../index.html", 2000);
            }
        } else {
            const overlay = document.getElementById('security-overlay');
            if(overlay) {
                overlay.style.opacity = '0';
                setTimeout(() => overlay.remove(), 500);
            }
        }
    }, 2000);

    // 2. ELEMENTOS
    const chatBox = document.getElementById('chat-box');
    const userInput = document.getElementById('user-input');
    const teachCheck = document.getElementById('teach-check');
    const btnSend = document.getElementById('btn-send');

    // 3. EVENTOS
    userInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') enviarMensagem(); });
    if(btnSend) btnSend.addEventListener('click', enviarMensagem);

    if(teachCheck) {
        teachCheck.addEventListener('change', () => {
            if (teachCheck.checked) {
                userInput.style.borderColor = "#facc15";
                userInput.placeholder = "DIGITE O FATO QUE A LUA DEVE APRENDER...";
                if(btnSend) {
                    btnSend.style.background = "#facc15";
                    btnSend.style.color = "black";
                }
            } else {
                userInput.style.borderColor = "#475569";
                userInput.placeholder = "Digite sua mensagem aqui...";
                if(btnSend) {
                    btnSend.style.background = "#9333ea";
                    btnSend.style.color = "white";
                }
            }
        });
    }

    // 4. ENVIO DE MENSAGEM
    async function enviarMensagem() {
        const texto = userInput.value.trim();
        if (!texto) return;

        // Adiciona msg do usuário
        addMsg(texto, 'user');
        
        userInput.value = '';
        userInput.focus();

        const isTeaching = teachCheck ? teachCheck.checked : false;
        const loadingId = addMsg(isTeaching ? "💾 Gravando no Supabase..." : "🧠 Pensando...", 'lua', true);

        try {
            const response = await fetch(`${API_URL}/chat_lua`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mensagem: texto, memorizar: isTeaching })
            });

            if (!response.ok) throw new Error("Erro na API Python");
            const data = await response.json();
            
            // Remove loading e mostra resposta
            const loadingEl = document.getElementById(loadingId);
            if(loadingEl) loadingEl.remove();
            
            addMsg(data.resposta, 'lua');

            if (isTeaching) {
                teachCheck.checked = false;
                teachCheck.dispatchEvent(new Event('change'));
                addMsg("Informação salva na memória permanente.", "system");
            }

        } catch (error) {
            const loadingEl = document.getElementById(loadingId);
            if(loadingEl) loadingEl.remove();
            addMsg("❌ Erro: O servidor Python não respondeu. Verifique o terminal uvicorn.", 'system');
            console.error(error);
        }
    }

    // 5. HELPER VISUAL (CRIA AS DIVS)
    function addMsg(html, tipo, isLoading = false) {
        const div = document.createElement('div');
        
        // Define a classe correta: 'msg lua', 'msg user' ou 'msg system'
        div.className = `msg ${tipo}`;
        
        if (isLoading) {
            div.id = "loading-" + Date.now();
            div.style.opacity = "0.7";
            div.innerHTML = `<i class="fas fa-circle-notch fa-spin"></i> ${html}`;
        } else {
            // Transforma quebras de linha em <br> para visualização correta
            div.innerHTML = html.replace(/\n/g, '<br>');
        }
        
        chatBox.appendChild(div);
        
        // Scroll automático para o fim
        requestAnimationFrame(() => {
            chatBox.scrollTop = chatBox.scrollHeight;
        });
        
        return div.id;
    }
});