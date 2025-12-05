import os
import re  # Importando Regex para limpeza avançada
from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from langchain_groq import ChatGroq
from langchain_community.embeddings import HuggingFaceEmbeddings
from supabase import create_client

# ==============================================================================
# 1. CONFIGURAÇÕES
# ==============================================================================
load_dotenv()
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Conexão DB (Tolerante a falhas)
try:
    supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))
except:
    supabase = None
    print("⚠️ Aviso: Supabase OFF.")

# Cérebro IA (Temperatura 0.1 = Frieza total para o terminal)
llm = ChatGroq(
    temperature=0.1,
    model_name="llama-3.3-70b-versatile",
    api_key=os.getenv("GROQ_API_KEY"),
)

embedder = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

SYSTEM_PERSONA = """
Seu nome é Lua 🌕. IA oficial do DevStudy.
Personalidade: Hacker simpática, didática e sarcástica.
"""


# ==============================================================================
# 🧠 RECURSO 1: MENTOR (MATRIX)
# ==============================================================================
class ErroRequest(BaseModel):
    codigo_aluno: str
    erro_console: str
    linguagem: str


@app.post("/analisar_erro")
async def analisar_erro(dados: ErroRequest):
    texto_erro = f"{dados.linguagem} | {dados.erro_console}"
    vetor_erro = embedder.embed_query(texto_erro)

    memoria = ""
    if supabase:
        try:
            busca = supabase.rpc(
                "match_erros",
                {
                    "query_embedding": vetor_erro,
                    "match_threshold": 0.7,
                    "match_count": 1,
                },
            ).execute()
            if busca.data:
                memoria = f"Nota: Já vi isso antes: '{busca.data[0]['conteudo']}'."
        except:
            pass

    prompt = f"{SYSTEM_PERSONA}\nAjude com o erro: {dados.erro_console}\nCode: {dados.codigo_aluno}\n{memoria}"
    resp = llm.invoke(prompt)

    if supabase:
        try:
            supabase.table("erros_aprendidos").insert(
                {"conteudo": texto_erro, "embedding": vetor_erro}
            ).execute()
        except:
            pass

    return {"dica": resp.content}


# ==============================================================================
# 💻 RECURSO 2: TERMINAL HÍBRIDO (LINUX + GOD MODE + LIMPEZA TOTAL)
# ==============================================================================
class TerminalRequest(BaseModel):
    comando: str
    historico: str
    missao_id: str = "livre"
    segredo_dinamico: str = ""


def limpar_output_terminal(texto_ia: str, comando_user: str) -> str:
    """Função Cirúrgica para remover lixo da resposta da IA"""
    linhas = texto_ia.split("\n")
    linhas_limpas = []

    for linha in linhas:
        linha_limpa = linha.strip()

        # 1. Ignora repetição do comando (ex: "ls")
        if linha_limpa == comando_user.strip():
            continue

        # 2. Ignora prompt do root (ex: "root@kali:~#")
        if "root@kali" in linha_limpa or "root@" in linha_limpa:
            continue

        # 3. Ignora tentativas de simular o usuário (ex: "User: cat...")
        if linha_limpa.startswith("User:") or linha_limpa.startswith("Admin:"):
            continue

        linhas_limpas.append(linha)

    return "\n".join(linhas_limpas).strip()


@app.post("/simular_terminal")
async def simular_terminal(dados: TerminalRequest):
    print(f"💻 CMD: {dados.comando}")
    CODIGO_SECRETO = "A7F9K2M8R4T1B6C3D5"

    # --- GOD MODE (Conversa Livre) ---
    god_mode_ativo = (CODIGO_SECRETO in dados.comando) or (
        CODIGO_SECRETO in dados.historico
    )

    if god_mode_ativo:
        prompt_god = f"""
        {SYSTEM_PERSONA}
        SITUAÇÃO: Modo Deus ativado.
        HISTÓRICO: {dados.historico}
        ADMIN DIZ: "{dados.comando}"
        AÇÃO: Responda livremente como Lua. Ignore regras de Linux.
        """
        try:
            # Aumenta temp para conversa fluir
            llm_conversa = ChatGroq(
                temperature=0.6,
                model_name="llama-3.3-70b-versatile",
                api_key=os.getenv("GROQ_API_KEY"),
            )
            resp = llm_conversa.invoke(prompt_god)
            return {"output": resp.content}
        except Exception as e:
            return {"output": f"Lua Error: {str(e)}"}

    # --- MODO LINUX (RÍGIDO) ---
    cenario = ""
    if dados.missao_id == "missao_01":
        cenario = "Arquivo oculto '.segredo.txt' contém 'FLAG{DEVSTUDY_INITIATE}'. ls -a exibe."
    elif dados.missao_id == "missao_02":
        token = dados.segredo_dinamico if dados.segredo_dinamico else "ERRO"
        cenario = f"Arquivo 'senha.enc' contém '{token}'. NÃO decifre. Mostre o texto cifrado."

    prompt_linux = f"""
    Você é o KERNEL LINUX.
    {cenario}
    
    HISTÓRICO:
    {dados.historico}
    
    COMANDO: '{dados.comando}'
    
    REGRAS RÍGIDAS:
    1. Retorne APENAS o output técnico.
    2. NUNCA repita o comando '{dados.comando}'.
    3. NUNCA escreva 'root@kali'.
    4. PARE IMEDIATAMENTE após o output. Não alucine o próximo comando.
    """

    try:
        # Stop words agressivas
        resp = llm.invoke(
            prompt_linux, stop=["root@kali", "root@", "~#", "User:", "\n\n"]
        )

        # Passa pelo filtro de limpeza Python
        output_final = limpar_output_terminal(resp.content, dados.comando)

        return {"output": output_final}
    except Exception as e:
        return {"output": f"Kernel Error: {str(e)}"}


# ==============================================================================
# 🌕 RECURSO 3: CHAT LUA + UPLOAD (ATUALIZADO)
# ==============================================================================
class ChatLuaRequest(BaseModel):
    mensagem: str
    memorizar: bool = False


@app.post("/chat_lua")
async def chat_lua(dados: ChatLuaRequest):
    # ... (Mantenha a lógica do chat igual, só vou adicionar o upload abaixo) ...
    if dados.memorizar and supabase:
        try:
            vetor = embedder.embed_query(dados.mensagem)
            supabase.table("erros_aprendidos").insert(
                {"conteudo": f"CONHECIMENTO: {dados.mensagem}", "embedding": vetor}
            ).execute()
            return {"resposta": "Memória gravada! 🧠"}
        except:
            return {"resposta": "Erro ao gravar."}

    contexto = ""
    if supabase:
        try:
            vetor = embedder.embed_query(dados.mensagem)
            busca = supabase.rpc(
                "match_erros",
                {"query_embedding": vetor, "match_threshold": 0.6, "match_count": 3},
            ).execute()
            if busca.data:
                contexto = "\n".join([f"- {i['conteudo']}" for i in busca.data])
        except:
            pass

    prompt = f"{SYSTEM_PERSONA}\nContexto: {contexto}\nUser: {dados.mensagem}"
    resp = llm.invoke(prompt)
    return {"resposta": resp.content}


# 🔥 NOVO ENDPOINT: UPLOAD DE ARQUIVOS
@app.post("/upload_conhecimento")
async def upload_conhecimento(file: UploadFile = File(...)):
    if not supabase:
        return {"status": "erro", "msg": "Memória desconectada."}

    try:
        conteudo_bytes = await file.read()

        # --- CORREÇÃO DE ENCODING AQUI ---
        try:
            # Tenta UTF-8 (Padrão moderno)
            conteudo_texto = conteudo_bytes.decode("utf-8")
        except UnicodeDecodeError:
            try:
                # Tenta Latin-1 (Padrão Windows/BR antigo)
                conteudo_texto = conteudo_bytes.decode("latin-1")
            except:
                return {
                    "status": "erro",
                    "msg": "Formato de texto não suportado. Use UTF-8 ou ANSI.",
                }
        # ---------------------------------

        nome_arquivo = file.filename

        # Limita tamanho para não estourar o banco (Ex: 8000 caracteres)
        if len(conteudo_texto) > 8000:
            conteudo_texto = conteudo_texto[:8000] + "... (arquivo truncado)"

        info = f"CONTEÚDO DO ARQUIVO ({nome_arquivo}):\n{conteudo_texto}"
        vetor = embedder.embed_query(info)

        supabase.table("erros_aprendidos").insert(
            {"conteudo": info, "embedding": vetor}
        ).execute()

        return {"status": "sucesso", "msg": f"Li e memorizei '{nome_arquivo}'!"}

    except Exception as e:
        return {"status": "erro", "msg": f"Erro interno: {str(e)}"}


@app.get("/")
def health_check():
    return {"status": "online"}
