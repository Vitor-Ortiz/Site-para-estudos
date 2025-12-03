import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware # <--- NOVO IMPORT
from pydantic import BaseModel
from langchain_groq import ChatGroq
from langchain_community.embeddings import HuggingFaceEmbeddings
from supabase import create_client

load_dotenv()
app = FastAPI()

# --- CONFIGURAÇÃO DE SEGURANÇA (CORS) ---
# Isso permite que qualquer site local seu fale com o Python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Em produção, trocamos "*" pelo site real
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# ----------------------------------------

# Conexão com Supabase e IA
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))
llm = ChatGroq(temperature=0.5, model_name="llama-3.3-70b-versatile", api_key=os.getenv("GROQ_API_KEY"))
embedder = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

# Modelo de dados que vamos receber do Front-end
class ErroRequest(BaseModel):
    codigo_aluno: str
    erro_console: str
    linguagem: str

@app.post("/analisar_erro")
async def analisar_erro(dados: ErroRequest):
    print(f"Recebido erro de {dados.linguagem}")
    
    # A. Criar o Vetor do erro atual
    texto_erro_completo = f"Linguagem: {dados.linguagem} | Código: {dados.codigo_aluno} | Erro: {dados.erro_console}"
    vetor_erro = embedder.embed_query(texto_erro_completo)
    
    # B. Buscar na memória se já vimos algo parecido (RAG)
    # Chamamos a função SQL 'match_erros' que criamos no passo 1
    resposta_busca = supabase.rpc(
        "match_erros", 
        {"query_embedding": vetor_erro, "match_threshold": 0.7, "match_count": 1}
    ).execute()
    
    contexto_memoria = ""
    if resposta_busca.data:
        erro_parecido = resposta_busca.data[0]['conteudo']
        contexto_memoria = f"NOTA IMPORTANTE: Um aluno já teve um erro parecido antes: '{erro_parecido}'. Use isso para ajudar."
        print("💡 Encontrei um erro parecido na memória!")
    else:
        print("🆕 Erro inédito. Aprendendo...")

    # C. Montar o Prompt para o Llama 3
    prompt = f"""
    Você é um mentor sênior de programação (DevStudy AI).
    O aluno cometeu um erro. Analise e dê uma dica curta e direta.
    NÃO dê a resposta pronta do código. Faça o aluno pensar.
    
    {contexto_memoria}
    
    --- DADOS DO ALUNO ---
    Linguagem: {dados.linguagem}
    Código: {dados.codigo_aluno}
    Erro: {dados.erro_console}
    """
    
    # D. Gerar Resposta
    resposta_ia = llm.invoke(prompt)
    
    # E. Salvar esse novo erro na memória para o futuro
    supabase.table("erros_aprendidos").insert({
        "conteudo": texto_erro_completo,
        "embedding": vetor_erro
    }).execute()
    
    return {"dica": resposta_ia.content}