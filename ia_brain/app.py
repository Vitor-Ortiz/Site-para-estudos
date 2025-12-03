import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from langchain_groq import ChatGroq
from langchain_community.embeddings import HuggingFaceEmbeddings
from supabase import create_client

# 1. Configurações Iniciais
load_dotenv()
app = FastAPI()

@app.get("/")
def health_check():
    return {"status": "online", "msg": "DevStudy API operante"}

# Configuração de Segurança (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Conectar Ferramentas
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

llm = ChatGroq(
    temperature=0.6, 
    model_name="llama-3.3-70b-versatile", 
    api_key=os.getenv("GROQ_API_KEY")
)

embedder = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")


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
    
    # RAG: Busca na memória
    texto_erro = f"Linguagem: {dados.linguagem} | Código: {dados.codigo_aluno} | Erro: {dados.erro_console}"
    vetor_erro = embedder.embed_query(texto_erro)
    
    contexto_memoria = ""
    try:
        resposta_busca = supabase.rpc("match_erros", {"query_embedding": vetor_erro, "match_threshold": 0.7, "match_count": 1}).execute()
        if resposta_busca.data:
            erro_parecido = resposta_busca.data[0]['conteudo']
            contexto_memoria = f"NOTA: Um aluno já teve um erro parecido: '{erro_parecido}'."
            print("💡 Memória ativada!")
    except Exception as e:
        print(f"⚠️ Erro na memória: {e}")

    # Prompt do Mentor
    prompt = f"""
    Você é um mentor sênior de programação.
    O aluno cometeu um erro. Dê uma dica curta e didática.
    NÃO dê a resposta pronta.
    {contexto_memoria}
    ---
    Linguagem: {dados.linguagem}
    Código: {dados.codigo_aluno}
    Erro: {dados.erro_console}
    """
    
    resposta_ia = llm.invoke(prompt)
    
    # Salva o erro novo
    try:
        supabase.table("erros_aprendidos").insert({"conteudo": texto_erro, "embedding": vetor_erro}).execute()
    except: pass
    
    return {"dica": resposta_ia.content}


# ==============================================================================
# 💻 RECURSO 2: SIMULADOR DE TERMINAL + MISSÕES DINÂMICAS
# ==============================================================================

class TerminalRequest(BaseModel):
    comando: str
    historico: str
    missao_id: str = "livre"
    segredo_dinamico: str = "" # <--- NOVO CAMPO: O Frontend manda a senha criptografada aqui

@app.post("/simular_terminal")
async def simular_terminal(dados: TerminalRequest):
    print(f"💻 Comando ({dados.missao_id}): {dados.comando}")
    
    # --- CENÁRIOS DAS MISSÕES ---
    cenario_secreto = ""
    
    if dados.missao_id == "missao_01":
        cenario_secreto = """
        [CENÁRIO DA MISSÃO 01 - FÁCIL]
        Existe um arquivo oculto '.segredo.txt'.
        Conteúdo: 'FLAG{DEVSTUDY_INITIATE}'.
        Se 'ls -a', mostre o arquivo. Se 'cat', mostre a flag.
        """
        
    elif dados.missao_id == "missao_02":
        # Aqui usamos o segredo que o Frontend gerou aleatoriamente
        conteudo_arquivo = dados.segredo_dinamico if dados.segredo_dinamico else "IODJ{ERRO_NO_SISTEMA}"
        
        cenario_secreto = f"""
        [CENÁRIO DA MISSÃO 02 - CRIPTOGRAFIA]
        Você está em um servidor seguro.
        Existe um arquivo 'senha_admin.enc'.
        
        IMPORTANTE: O conteúdo desse arquivo é EXATAMENTE: '{conteudo_arquivo}'.
        NÃO DESCRIPTOGRAFE. Mostre exatamente esse texto confuso se o usuário der 'cat'.
        """

    # Prompt do Terminal
    prompt = f"""
    Você é um simulador de terminal Kali Linux.
    
    {cenario_secreto}
    
    --- HISTÓRICO RECENTE ---
    {dados.historico}
    -------------------------
    
    COMANDO ATUAL: '{dados.comando}'
    
    Sua tarefa:
    1. Aja EXATAMENTE como um terminal Linux.
    2. Respeite o cenário.
    3. APENAS output cru.
    """
    
    try:
        resposta = llm.invoke(prompt)
        return {"output": resposta.content}
    except Exception as e:
        return {"output": f"Kernel Panic: {str(e)}"}