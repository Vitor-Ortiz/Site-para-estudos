import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from langchain_groq import ChatGroq
from langchain_community.embeddings import HuggingFaceEmbeddings
from supabase import create_client

# 1. Configurações
load_dotenv()
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

llm = ChatGroq(
    temperature=0.6, 
    model_name="llama-3.3-70b-versatile", 
    api_key=os.getenv("GROQ_API_KEY")
)

embedder = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

# --- PERSONALIDADE GLOBAL ---
SYSTEM_PERSONA = """
Seu nome é Lua 🌕.
Você é a IA oficial do projeto DevStudy.
Sua personalidade: Simpática, inteligente, levemente sarcástica (estilo hacker) e muito didática.
Você adora ensinar programação e segurança cibernética.
Nunca saia do personagem.
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
    # RAG (Busca na memória)
    texto_erro = f"{dados.linguagem} | {dados.erro_console}"
    vetor = embedder.embed_query(texto_erro)
    
    memoria_util = ""
    try:
        busca = supabase.rpc("match_erros", {"query_embedding": vetor, "match_threshold": 0.7, "match_count": 1}).execute()
        if busca.data:
            memoria_util = f"Lembre-se: Você já resolveu isso antes: '{busca.data[0]['conteudo']}'"
    except: pass

    prompt = f"""
    {SYSTEM_PERSONA}
    O aluno cometeu um erro. Ajude-o.
    {memoria_util}
    ---
    Lang: {dados.linguagem}
    Code: {dados.codigo_aluno}
    Error: {dados.erro_console}
    """
    resp = llm.invoke(prompt)
    
    # Auto-aprendizado passivo
    try:
        supabase.table("erros_aprendidos").insert({"conteudo": texto_erro, "embedding": vetor}).execute()
    except: pass
    
    return {"dica": resp.content}

# ==============================================================================
# 💻 RECURSO 2: SIMULADOR DE TERMINAL (PENTEST)
# ==============================================================================
class TerminalRequest(BaseModel):
    comando: str
    historico: str
    missao_id: str = "livre"
    segredo_dinamico: str = ""

@app.post("/simular_terminal")
async def simular_terminal(dados: TerminalRequest):
    cenario = ""
    if dados.missao_id == "missao_01":
        cenario = "Arquivo oculto '.segredo.txt' com 'FLAG{DEVSTUDY_INITIATE}'."
    elif dados.missao_id == "missao_02":
        token = dados.segredo_dinamico if dados.segredo_dinamico else "ERRO"
        cenario = f"Arquivo 'senha.enc' contém exatamente '{token}'. Não decifre."

    prompt = f"""
    Atue como um Terminal Kali Linux.
    {cenario}
    --- HISTÓRICO ---
    {dados.historico}
    ---
    CMD: {dados.comando}
    """
    resp = llm.invoke(prompt)
    return {"output": resp.content}

# ==============================================================================
# 🌕 RECURSO 3: CHAT DA LUA (ADMIN / CONVERSA LIVRE)
# ==============================================================================
class ChatLuaRequest(BaseModel):
    mensagem: str
    memorizar: bool = False # Se True, ela grava no banco

@app.post("/chat_lua")
async def chat_lua(dados: ChatLuaRequest):
    print(f"🌕 Lua ouviu: {dados.mensagem} (Memorizar: {dados.memorizar})")
    
    # 1. Se for para MEMORIZAR (Admin ensinando)
    if dados.memorizar:
        vetor = embedder.embed_query(dados.mensagem)
        try:
            supabase.table("erros_aprendidos").insert({
                "conteudo": f"CONHECIMENTO GERAL: {dados.mensagem}",
                "embedding": vetor
            }).execute()
            return {"resposta": "Entendido, mestre! 🧠 Gravei essa informação na minha memória permanente."}
        except Exception as e:
            return {"resposta": f"Tentei memorizar, mas deu erro no banco: {str(e)}"}

    # 2. Se for Conversa Normal (RAG)
    vetor_busca = embedder.embed_query(dados.mensagem)
    contexto = ""
    try:
        busca = supabase.rpc("match_erros", {"query_embedding": vetor_busca, "match_threshold": 0.6, "match_count": 2}).execute()
        if busca.data:
            textos_memoria = "\n".join([f"- {item['conteudo']}" for item in busca.data])
            contexto = f"USE SEU CONHECIMENTO PRÉVIO:\n{textos_memoria}"
    except: pass

    prompt = f"""
    {SYSTEM_PERSONA}
    Você está conversando com o Admin (Vitor).
    {contexto}
    ---
    Admin diz: {dados.mensagem}
    """
    
    resp = llm.invoke(prompt)
    return {"resposta": resp.content}

# Rota de Ping
@app.get("/")
def health_check(): return {"status": "online", "msg": "Lua está acordada 🌕"}