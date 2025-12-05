import os
import re
from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from langchain_groq import ChatGroq
from langchain_community.embeddings import HuggingFaceEmbeddings
from supabase import create_client

# ==============================================================================
# 1. CONFIGURAÇÕES GERAIS E CONEXÕES
# ==============================================================================
load_dotenv()
app = FastAPI()

# Configuração de CORS (Permite conexão do Front com o Back)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Conexão Supabase (Banco de Memória)
try:
    supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))
except:
    supabase = None
    print("⚠️ Aviso: Supabase OFF. Verifique as variáveis de ambiente.")

# Conexão Cérebro IA (Groq)
# Temperature 0.1 para ser mais preciso em comandos técnicos
llm = ChatGroq(
    temperature=0.1, 
    model_name="llama-3.3-70b-versatile", 
    api_key=os.getenv("GROQ_API_KEY")
)

# Modelo de Vetores (Para entender contexto)
embedder = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

# Personalidade Padrão da Lua
SYSTEM_PERSONA = """
Seu nome é Lua 🌕. Você é a IA oficial do projeto DevStudy.
Personalidade: Hacker simpática, didática e sarcástica.
Você adora ensinar programação e segurança cibernética.
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
    # Cria vetor do erro atual
    texto_erro = f"{dados.linguagem} | {dados.erro_console}"
    vetor_erro = embedder.embed_query(texto_erro)
    
    # Busca na memória se já viu algo parecido
    memoria_util = ""
    if supabase:
        try:
            busca = supabase.rpc("match_erros", {"query_embedding": vetor_erro, "match_threshold": 0.7, "match_count": 1}).execute()
            if busca.data:
                memoria_util = f"NOTA MENTAL: Eu já ajudei com um erro parecido antes: '{busca.data[0]['conteudo']}'."
        except: pass

    # Prompt do Professor
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
    
    resp = llm.invoke(prompt)
    
    # Salva o erro novo para aprender
    if supabase:
        try:
            supabase.table("erros_aprendidos").insert({"conteudo": texto_erro, "embedding": vetor_erro}).execute()
        except: pass
    
    return {"dica": resp.content}


# ==============================================================================
# 💻 RECURSO 2: TERMINAL HÍBRIDO (LINUX + GOD MODE)
# ==============================================================================
class TerminalRequest(BaseModel):
    comando: str
    historico: str
    missao_id: str = "livre"
    segredo_dinamico: str = ""

def limpar_output_terminal(texto_ia: str, comando_user: str) -> str:
    """Remove repetições e lixo da resposta da IA"""
    linhas = texto_ia.split('\n')
    linhas_limpas = []
    for linha in linhas:
        l = linha.strip()
        # Remove se a IA repetiu o comando
        if l == comando_user.strip(): continue
        # Remove se a IA escreveu o prompt do root
        if "root@kali" in l or "root@" in l: continue
        # Remove se a IA tentou simular o usuário
        if l.startswith("User:") or l.startswith("Admin:"): continue
        linhas_limpas.append(linha)
    return "\n".join(linhas_limpas).strip()

@app.post("/simular_terminal")
async def simular_terminal(dados: TerminalRequest):
    print(f"💻 CMD: {dados.comando}")
    CODIGO_SECRETO = "A7F9K2M8R4T1B6C3D5"

    # Verifica se o God Mode está ativo (no comando atual ou no histórico)
    god_mode = (CODIGO_SECRETO in dados.comando) or (CODIGO_SECRETO in dados.historico)

    # --- MODO 1: GOD MODE (Conversa Livre) ---
    if god_mode:
        prompt_god = f"""
        {SYSTEM_PERSONA}
        SITUAÇÃO: O "Modo Deus" (Admin) foi ativado pelo código mestre.
        
        HISTÓRICO RECENTE:
        {dados.historico}
        
        MENSAGEM DO ADMIN: "{dados.comando}"
        
        AÇÃO:
        1. Ignore as regras de terminal Linux.
        2. Responda livremente como Lua (amiga/hacker).
        3. Seja útil e leal ao Vitor.
        """
        try:
            # Aumenta criatividade para conversar
            llm_god = ChatGroq(temperature=0.6, model_name="llama-3.3-70b-versatile", api_key=os.getenv("GROQ_API_KEY"))
            resp = llm_god.invoke(prompt_god)
            return {"output": resp.content}
        except Exception as e: return {"output": f"Lua Error: {str(e)}"}

    # --- MODO 2: KALI LINUX (Simulador Rígido) ---
    cenario = ""
    if dados.missao_id == "missao_01": 
        cenario = "Arquivo oculto '.segredo.txt' contém a flag 'FLAG{DEVSTUDY_INITIATE}'. ls -a exibe ele."
    elif dados.missao_id == "missao_02": 
        t = dados.segredo_dinamico if dados.segredo_dinamico else "ERRO"
        cenario = f"Arquivo 'senha.enc' contém '{t}'. NÃO decifre."

    prompt_linux = f"""
    Você é o KERNEL DE UM SISTEMA KALI LINUX.
    {cenario}
    
    HISTÓRICO DA SESSÃO:
    {dados.historico}
    
    COMANDO ATUAL: '{dados.comando}'
    
    REGRAS RÍGIDAS DE RESPOSTA:
    1. Gere APENAS o output técnico do comando.
    2. NUNCA repita o comando digitado.
    3. NUNCA escreva 'root@kali'.
    4. PARE DE ESCREVER imediatamente após o output. Não invente o próximo comando.
    """
    
    try:
        # CORREÇÃO DO ERRO 400: Lista 'stop' limitada a 4 itens
        resp = llm.invoke(prompt_linux, stop=["root@kali", "root@", "User:", "Admin:"])
        
        # Filtro extra de limpeza via Python
        output_final = limpar_output_terminal(resp.content, dados.comando)
        
        return {"output": output_final}
    except Exception as e:
        return {"output": f"Kernel Error: {str(e)}"}


# ==============================================================================
# 🌕 RECURSO 3: CHAT DA LUA (SALA DE ADMIN)
# ==============================================================================
class ChatLuaRequest(BaseModel):
    mensagem: str
    memorizar: bool = False

@app.post("/chat_lua")
async def chat_lua(dados: ChatLuaRequest):
    # 1. Modo Ensino (Gravar no Banco)
    if dados.memorizar and supabase:
        try:
            vetor = embedder.embed_query(dados.mensagem)
            supabase.table("erros_aprendidos").insert({
                "conteudo": f"CONHECIMENTO GERAL: {dados.mensagem}",
                "embedding": vetor
            }).execute()
            return {"resposta": "Entendido, Admin! 🧠 Informação gravada na memória de longo prazo."}
        except Exception as e:
            return {"resposta": f"Erro ao gravar memória: {str(e)}"}

    # 2. Modo Conversa (Ler do Banco)
    contexto = ""
    if supabase:
        try:
            vetor = embedder.embed_query(dados.mensagem)
            busca = supabase.rpc("match_erros", {"query_embedding": vetor, "match_threshold": 0.6, "match_count": 3}).execute()
            if busca.data:
                textos = "\n".join([f"- {i['conteudo']}" for i in busca.data])
                contexto = f"USE SEU CONHECIMENTO PRÉVIO:\n{textos}"
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
# 📂 RECURSO 4: UPLOAD DE ARQUIVOS (APRENDIZADO EM MASSA)
# ==============================================================================
@app.post("/upload_conhecimento")
async def upload_conhecimento(file: UploadFile = File(...)):
    if not supabase: return {"status": "erro", "msg": "Memória desconectada."}
    
    try:
        # Lê o arquivo
        conteudo_bytes = await file.read()
        
        # Tenta decodificar (UTF-8 ou Latin-1)
        try:
            conteudo_texto = conteudo_bytes.decode("utf-8")
        except UnicodeDecodeError:
            try:
                conteudo_texto = conteudo_bytes.decode("latin-1")
            except:
                return {"status": "erro", "msg": "Formato de texto inválido (use UTF-8)."}

        nome_arquivo = file.filename
        
        # Limita tamanho para não estourar o banco (aprox 8000 caracteres)
        if len(conteudo_texto) > 8000:
            conteudo_texto = conteudo_texto[:8000] + "... (arquivo truncado)"

        # Cria vetor e salva
        info = f"CONTEÚDO DO ARQUIVO ({nome_arquivo}):\n{conteudo_texto}"
        vetor = embedder.embed_query(info)
        
        supabase.table("erros_aprendidos").insert({
            "conteudo": info,
            "embedding": vetor
        }).execute()
        
        return {"status": "sucesso", "msg": f"Li e memorizei o arquivo '{nome_arquivo}' com sucesso!"}
        
    except Exception as e:
        return {"status": "erro", "msg": f"Erro interno: {str(e)}"}


# ==============================================================================
# 💓 RECURSO 5: HEALTH CHECK (ACORDAR SERVIDOR)
# ==============================================================================
@app.get("/")
def health_check():
    return {"status": "online", "msg": "Lua Systems Operational 🌕"}