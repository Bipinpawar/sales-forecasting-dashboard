import os
import requests

from langchain_text_splitters import CharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings

HF_API_KEY = os.getenv("HF_API_KEY")


# =========================
# 🔹 CREATE VECTOR DB
# =========================
def create_rag_db(text_data):
    splitter = CharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    docs = splitter.create_documents([text_data])

    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )

    db = FAISS.from_documents(docs, embeddings)
    return db


# =========================
# 🔹 ASK RAG
# =========================
def ask_rag(db, question):
    docs = db.similarity_search(question, k=3)

    context = "\n".join([doc.page_content for doc in docs])

    prompt = f"""
You are a business data analyst.

Analyze the following data and answer clearly.

DATA:
{context}

QUESTION:
{question}

Answer:
"""

    try:
        response = requests.post(
            "https://api-inference.huggingface.co/models/google/flan-t5-large",
            headers={"Authorization": f"Bearer {HF_API_KEY}"},
            json={"inputs": prompt},
            timeout=30
        )

        if response.status_code != 200:
            return f"Error: {response.text}"

        return response.json()[0]["generated_text"]

    except Exception as e:
        return f"Error: {str(e)}"