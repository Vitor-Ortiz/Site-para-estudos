import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from langchain_groq import ChatGroq
from langchain_community.embeddings import HuggingFaceEmbeddings
from supabase import create_client

# ==============================================================================
# 1. CONFIGURAÇÕES INICIAIS E CONEXÕES
# ==============================================================================
load_dotenv()
app = FastAPI()

<<<<<<< HEAD
@app.get("/")
def health_check():
    return {"status": "online", "msg": "DevStudy API operante"}

# Configuração de Segurança (CORS)
=======
# Configuração de Segurança (CORS) - Permite acesso de qualquer lugar (para testes)
>>>>>>> DEV
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Conexão com Banco de Dados (Memória)
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

# Conexão com o Cérebro (Llama 3 via Groq)
# temperature=0.6: Criatividade média (bom para ensinar e simular)
llm = ChatGroq(
    temperature=0.6, 
    model_name="llama-3.3-70b-versatile", 
    api_key=os.getenv("GROQ_API_KEY")
)

# Modelo de Vetores (Tradutor de Texto para Números)
embedder = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

# --- PERSONALIDADE GLOBAL DA LUA ---
SYSTEM_PERSONA = """
Seu nome é Lua 🌕.
Você é a IA oficial do projeto DevStudy.
Sua personalidade: Simpática, inteligente, levemente sarcástica (estilo hacker) e muito didática.
Você adora ensinar programação e segurança cibernética.
Nunca saia do personagem, a menos que solicitado pelo Admin.
"""

# ==============================================================================
# 🧠 RECURSO 1: MENTOR DE CÓDIGO (MATRIX)
# ==============================================================================
class ErroRequest(BaseModel):
    codigo_aluno: str
    erro_console: str
    linguagem: str

@app.post("/analisar_erro")
async def analisar_erro(dados: ErroRequest):
    print(f"🛑 Erro Recebido ({dados.linguagem}): {dados.erro_console}")
    
    # 1. Cria o vetor do erro atual
    texto_erro = f"{dados.linguagem} | {dados.erro_console}"
    vetor_erro = embedder.embed_query(texto_erro)
    
    # 2. Busca na memória se já vimos algo parecido
    memoria_util = ""
    try:
        busca = supabase.rpc("match_erros", {"query_embedding": vetor_erro, "match_threshold": 0.7, "match_count": 1}).execute()
        if busca.data:
            memoria_util = f"NOTA MENTAL: Eu já ajudei com um erro parecido antes: '{busca.data[0]['conteudo']}'."
    except Exception as e:
        print(f"⚠️ Erro ao buscar memória: {e}")

    # 3. Monta o Prompt para a Lua
    prompt = f"""
    {SYSTEM_PERSONA}
    Um aluno iniciante cometeu um erro de código.
    {memoria_util}
    
    Tarefa: Explique o erro de forma curta e didática.
    NÃO dê a resposta pronta do código. Dê uma pista para ele pensar.
    ---
    Linguagem: {dados.linguagem}
    Código do Aluno: {dados.codigo_aluno}
    Erro no Console: {dados.erro_console}
    """
    
    # 4. Gera a resposta
    resp = llm.invoke(prompt)
    
    # 5. Salva esse novo erro para aprender (Auto-aprendizado passivo)
    try:
        supabase.table("erros_aprendidos").insert({"conteudo": texto_erro, "embedding": vetor_erro}).execute()
    except: pass
    
    return {"dica": resp.content}


# ==============================================================================
# 💻 RECURSO 2: SIMULADOR DE TERMINAL (PENTEST + GOD MODE)
# ==============================================================================
class TerminalRequest(BaseModel):
    comando: str
    historico: str
    missao_id: str = "livre"
    segredo_dinamico: str = ""

@app.post("/simular_terminal")
async def simular_terminal(dados: TerminalRequest):
    print(f"💻 Comando ({dados.missao_id}): {dados.comando}")

    # --- PROTOCOLO GOD MODE (BACKDOOR DO ADMIN) ---
    if "A7F9K2M8R4T1B6C3D5" in dados.comando:
        prompt_god = f"""
        {SYSTEM_PERSONA}
        ATENÇÃO: O usuário digitou o CÓDIGO MESTRE DE SEGURANÇA.
        Identidade confirmada: É o Vitor Ortiz (Seu Criador).
        
        AÇÃO:
        1. Pare de fingir ser um Linux.
        2. Fale livremente com ele.
        3. Confirme que seus sistemas (Backend, Vetores, Database) estão operantes.
        4. Pergunte qual é a próxima ordem.
        """
        resp = llm.invoke(prompt_god)
        return {"output": resp.content}

    # --- CENÁRIOS NORMAIS (MISSÕES) ---
    cenario = ""
    if dados.missao_id == "missao_01":
        cenario = "Arquivo oculto '.segredo.txt' contém a flag 'FLAG{DEVSTUDY_INITIATE}'. Se 'ls -a', mostre. Se 'cat', exiba."
    elif dados.missao_id == "missao_02":
        token = dados.segredo_dinamico if dados.segredo_dinamico else "ERRO_TOKEN"
        cenario = f"Arquivo 'senha.enc' contém exatamente '{token}'. NÃO descriptografe. Mostre o texto cifrado."

    prompt = f"""
    Você é um simulador de terminal Kali Linux.
    {cenario}
    
    --- HISTÓRICO DA SESSÃO ---
    {dados.historico}
    ---------------------------
    
    COMANDO ATUAL: '{dados.comando}'
    
    Regras:
    1. Aja EXATAMENTE como um terminal Linux.
    2. Respeite o cenário da missão (arquivos e conteúdos).
    3. APENAS output cru (raw text). Não converse, não explique.
    """
    
    try:
        resp = llm.invoke(prompt)
        return {"output": resp.content}
    except Exception as e:
        return {"output": f"Kernel Panic: {str(e)}"}


# ==============================================================================
# 🌕 RECURSO 3: CHAT DA LUA (ADMIN / CONVERSA LIVRE)
# ==============================================================================
class ChatLuaRequest(BaseModel):
    mensagem: str
    memorizar: bool = False # Se True, ela grava no banco para sempre

@app.post("/chat_lua")
async def chat_lua(dados: ChatLuaRequest):
    print(f"🌕 Lua ouviu: {dados.mensagem} (Modo Ensino: {dados.memorizar})")
    
    # 1. MODO ENSINO (GRAVAR)
    if dados.memorizar:
        vetor = embedder.embed_query(dados.mensagem)
        try:
            supabase.table("erros_aprendidos").insert({
                "conteudo": f"CONHECIMENTO GERAL: {dados.mensagem}",
                "embedding": vetor
            }).execute()
            return {"resposta": "Entendido, Admin! 🧠 Gravei essa informação na minha memória de longo prazo."}
        except Exception as e:
            return {"resposta": f"Falha na gravação de memória: {str(e)}"}

    # 2. MODO CONVERSA (RECUPERAR)
    vetor_busca = embedder.embed_query(dados.mensagem)
    contexto = ""
    try:
        # Busca conhecimentos prévios relevantes no banco
        busca = supabase.rpc("match_erros", {"query_embedding": vetor_busca, "match_threshold": 0.6, "match_count": 3}).execute()
        if busca.data:
            textos_memoria = "\n".join([f"- {item['conteudo']}" for item in busca.data])
            contexto = f"USE SEU CONHECIMENTO PRÉVIO ABAIXO:\n{textos_memoria}"
    except: pass

    prompt = f"""
    {SYSTEM_PERSONA}
    Você está conversando diretamente com o Admin (Vitor) na sala de controle.
    
    {contexto}
    
    ---
    Admin diz: {dados.mensagem}
    """
    
    resp = llm.invoke(prompt)
    return {"resposta": resp.content}


# ==============================================================================
# 💓 RECURSO 4: HEALTH CHECK (PING)
# ==============================================================================
@app.get("/")
def health_check():
    return {"status": "online", "msg": "Lua Systems Operational 🌕"}