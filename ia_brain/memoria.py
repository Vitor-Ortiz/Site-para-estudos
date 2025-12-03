import os
from dotenv import load_dotenv
from langchain_community.embeddings import HuggingFaceEmbeddings
from supabase import create_client

load_dotenv()

# 1. Configura o Supabase (O Banco)
supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY")
)

# 2. Configura o Modelo de Vetores (O Tradutor Texto -> Números)
# Na primeira vez, ele vai baixar uns 100MB, pode demorar um pouquinho.
print("📥 Carregando modelo de vetores (pode demorar na 1ª vez)...")
modelo_embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

def salvar_memoria_teste():
    texto_erro = "Erro de sintaxe: O aluno esqueceu de fechar o parênteses na função."
    
    print(f"🧮 Transformando texto em números: '{texto_erro}'")
    
    # 3. Gera o vetor (uma lista de 384 números)
    vetor = modelo_embeddings.embed_query(texto_erro)
    
    print("💾 Salvando no Supabase...")
    
    # 4. Envia para o banco
    dados = {
        "conteudo": texto_erro,
        "embedding": vetor
    }
    
    resposta = supabase.table("erros_aprendidos").insert(dados).execute()
    print("✅ Memória salva com sucesso!", resposta)

if __name__ == "__main__":
    salvar_memoria_teste()