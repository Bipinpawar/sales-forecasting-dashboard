from langchain.text_splitter import CharacterTextSplitter
from langchain.vectorstores import FAISS
from langchain.embeddings import HuggingFaceEmbeddings
import requests
import os

HF_API_KEY = os.getenv("HF_API_KEY")

def create_rag_db(text_data):
    splitter = CharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    docs = splitter.create_documents([text_data])

    embeddings = HuggingFaceEmbeddings(
        model_name="all-MiniLM-L6-v2"
    )

    db = FAISS.from_documents(docs, embeddings)
    return db


def ask_rag(db, question):
    docs = db.similarity_search(question, k=3)

    context = "\n".join([doc.page_content for doc in docs])

    prompt = f"""
You are a data analyst.

Use the data below to answer:

{context}

Question: {question}

Answer clearly:
"""

    response = requests.post(
        "https://api-inference.huggingface.co/models/google/flan-t5-large",
        headers={"Authorization": f"Bearer {HF_API_KEY}"},
        json={"inputs": prompt}
    )

    try:
        return response.json()[0]["generated_text"]
    except:
        return "Error generating response"