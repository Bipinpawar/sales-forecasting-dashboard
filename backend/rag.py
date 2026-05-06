import requests
import os

HF_API_KEY = os.getenv("HF_API_KEY")

# global storage
documents = []

# =========================
# CREATE RAG DATA
# =========================
def create_rag_db(text_data):
    global documents
    documents = text_data.split("\n")

# =========================
# ASK QUESTION
# =========================
def ask_rag(question):
    global documents

    if not documents:
        return "No data available. Please upload file first."

    if not question:
        return "Please provide a question."

    # 🔍 simple keyword match
    relevant_docs = [
        doc for doc in documents
        if any(word in doc.lower() for word in question.lower().split())
    ]

    # ⚠️ fallback if nothing matched
    if not relevant_docs:
        relevant_docs = documents[:5]

    context = "\n".join(relevant_docs[:5])

    prompt = f"""
You are a data analyst.

Context:
{context}

Question: {question}

Answer clearly based only on the data:
"""

    try:
        response = requests.post(
            "https://api-inference.huggingface.co/models/google/flan-t5-base",
            headers={
                "Authorization": f"Bearer {HF_API_KEY}",
                "Content-Type": "application/json"
            },
            json={"inputs": prompt},
            timeout=20
        )

        result = response.json()

        # 🔥 Handle HF API errors properly
        if isinstance(result, dict) and result.get("error"):
            return f"HF Error: {result['error']}"

        return result[0]["generated_text"]

    except Exception as e:
        return f"Error: {str(e)}"