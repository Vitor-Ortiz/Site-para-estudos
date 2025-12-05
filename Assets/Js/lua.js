/* assets/js/lua.js - Lógica da Sala da Lua (Com Upload) */

// CONFIGURAÇÃO DE API
// Use localhost para testes locais. Quando subir pro Render, troque o link.
const API_URL = "https://devstudy-api.onrender.com";
// const API_URL = "https://devstudy-api.onrender.com"; 

document.addEventListener('DOMContentLoaded', () => {
    
    // ========================================================
    // 1. SEGURANÇA: Verifica se é Admin
    // ========================================================
    setTimeout(() => {
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
    }, 2000); // Aguarda game-data.js carregar

    // ========================================================
    // 2. ELEMENTOS DO DOM
    // ========================================================
    const chatBox = document.getElementById('chat-box');
    const userInput = document.getElementById('user-input');
    const teachCheck = document.getElementById('teach-check');
    const btnSend = document.getElementById('btn-send');
    const fileInput = document.getElementById('file-upload'); // O input escondido
    const btnAttach = document.getElementById('btn-attach');  // O botão de clipe

    // ========================================================
    // 3. EVENTOS (CLIQUES E TECLAS)
    // ========================================================
    
    // Enviar com Enter
    userInput.addEventListener('keydown', (e) => { 
        if (e.key === 'Enter') enviarMensagem(); 
    });
    
    // Enviar com Botão
    if(btnSend) btnSend.addEventListener('click', enviarMensagem);

    // Mudança visual do "Modo Ensino"
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

    // ========================================================
    // 4. LÓGICA DE UPLOAD DE ARQUIVO (NOVO!)
    // ========================================================
    if(fileInput) {
        fileInput.addEventListener('change', async () => {
            const file = fileInput.files[0];
            if (!file) return;

            // Feedback visual no chat
            const loadingId = addMsg(`📂 Enviando arquivo: <strong>${file.name}</strong> para análise...`, 'lua', true);

            // Prepara o pacote do arquivo
            const formData = new FormData();
            formData.append('file', file);

            try {
                // Envia para o Python
                const response = await fetch(`${API_URL}/upload_conhecimento`, {
                    method: 'POST',
                    body: formData // O navegador define o Content-Type automaticamente aqui
                });

                const data = await response.json();
                
                // Remove mensagem de "carregando"
                const loadingEl = document.getElementById(loadingId);
                if(loadingEl) loadingEl.remove();

                if (data.status === 'sucesso') {
                    // Mensagem de sucesso
                    addMsg(`✅ ARQUIVO PROCESSADO: ${file.name}`, 'system');
                    addMsg(`Li o conteúdo do arquivo e gravei na minha memória. Pode me fazer perguntas sobre ele!`, 'lua');
                } else {
                    addMsg(`❌ Erro no processamento: ${data.msg}`, 'system');
                }

            } catch (error) {
                const loadingEl = document.getElementById(loadingId);
                if(loadingEl) loadingEl.remove();
                addMsg("❌ Erro de upload. O servidor Python está rodando?", 'system');
                console.error(error);
            }
            
            // Limpa o input para permitir enviar o mesmo arquivo de novo se precisar
            fileInput.value = '';
        });
    }

    // ========================================================
    // 5. LÓGICA DE ENVIO DE TEXTO
    // ========================================================
    async function enviarMensagem() {
        const texto = userInput.value.trim();
        if (!texto) return;

        // Adiciona msg do usuário na tela
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

            // Se estava ensinando, desliga o modo e avisa
            if (isTeaching) {
                teachCheck.checked = false;
                teachCheck.dispatchEvent(new Event('change'));
                addMsg("Informação salva na memória permanente.", "system");
            }

        } catch (error) {
            const loadingEl = document.getElementById(loadingId);
            if(loadingEl) loadingEl.remove();
            addMsg("❌ Erro: O servidor Python não respondeu.", 'system');
            console.error(error);
        }
    }

    // ========================================================
    // 6. HELPER VISUAL (CRIA OS BALÕES)
    // ========================================================
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