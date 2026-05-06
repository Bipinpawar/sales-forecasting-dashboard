import requests
import os

HF_API_KEY = os.getenv("HF_API_KEY")

# simple in-memory storage
documents = []

def create_rag_db(text_data):
    global documents
    documents = text_data.split("\n")  # split into lines

def ask_rag(question):
    global documents

    # 🔍 simple keyword match
    relevant_docs = [doc for doc in documents if any(word in doc.lower() for word in question.lower().split())]

    context = "\n".join(relevant_docs[:5])

    prompt = f"""
You are a data analyst.

Context:
{context}

Question: {question}

Answer clearly:
"""

    response = requests.post(
        "https://api-inference.huggingface.co/models/google/flan-t5-base",
        headers={"Authorization": f"Bearer {HF_API_KEY}"},
        json={"inputs": prompt}
    )

    try:
        return response.json()[0]["generated_text"]
    except:
        return "Error generating response"