import os
from dotenv import load_dotenv
from langchain_groq import ChatGroq

# 1. Carrega as chaves do arquivo .env
load_dotenv()

print("🔌 Iniciando conexão com a Groq...")

# 2. Configura o Llama 3 (ATUALIZADO PARA O MODELO NOVO)
chat = ChatGroq(
    temperature=0.7, 
    model_name="llama-3.3-70b-versatile",  # <--- MUDAMOS AQUI
    api_key=os.getenv("GROQ_API_KEY")
)

def conversar_com_ia():
    print("🧠 Cérebro pronto! Perguntando algo...")
    
    # 3. Aqui é a pergunta que vamos fazer
    pergunta = "Explique para um iniciante o que é uma variável em Python em uma frase."
    
    # 4. Envia pro Llama
    # Adicionamos um tratamento de erro simples para você ver o que acontece
    try:
        resposta = chat.invoke(pergunta)
        print("-" * 30)
        print(f"🤖 Llama 3.3 diz:\n{resposta.content}")
        print("-" * 30)
    except Exception as e:
        print(f"❌ Deu erro: {e}")

if __name__ == "__main__":
    conversar_com_ia()