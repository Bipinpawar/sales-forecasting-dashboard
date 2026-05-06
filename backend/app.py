from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
from statsmodels.tsa.arima.model import ARIMA
import os

# RAG
from rag import create_rag_db, ask_rag

app = Flask(__name__)

# ✅ CORS FIX (VERY IMPORTANT)
CORS(
    app,
    resources={r"/*": {"origins": "*"}},
    supports_credentials=True
)

df = None
rag_db = None


# =========================
# ✅ HANDLE PREFLIGHT (FIX)
# =========================
@app.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        return '', 200


# =========================
# 🏠 HEALTH CHECK
# =========================
@app.route('/')
def home():
    return "API is running 🚀"


# =========================
# 📁 UPLOAD API
# =========================
@app.route('/upload', methods=['POST', 'OPTIONS'])
def upload():
    global df, rag_db

    if request.method == "OPTIONS":
        return '', 200

    file = request.files.get('file')
    if not file:
        return jsonify({"error": "No file uploaded"}), 400

    try:
        raw_df = pd.read_csv(file)
    except Exception as e:
        return jsonify({"error": str(e)}), 400

    raw_df.columns = [col.lower().strip() for col in raw_df.columns]

    date_col = next((c for c in raw_df.columns if 'date' in c), None)
    sales_col = next((c for c in raw_df.columns if any(k in c for k in ['sales','revenue','amount','price'])), None)

    if not date_col or not sales_col:
        return jsonify({"error": "Invalid columns"}), 400

    df = raw_df[[date_col, sales_col]].copy()
    df.columns = ['date', 'sales']

    df['date'] = pd.to_datetime(df['date'], errors='coerce')
    df['sales'] = pd.to_numeric(df['sales'], errors='coerce')
    df = df.dropna()

    df = df.groupby('date').sum().reset_index()
    df = df.sort_values('date')

    # Fill missing dates
    df = df.set_index('date').asfreq('D')
    df['sales'] = df['sales'].fillna(0)
    df = df.reset_index()

    # 🔥 CREATE RAG DB
    text_data = df.to_string()
    rag_db = create_rag_db(text_data)

    return jsonify({
        "message": "Upload successful & RAG ready",
        "records": len(df)
    })


# =========================
# 📈 FORECAST API
# =========================
@app.route('/forecast', methods=['POST', 'OPTIONS'])
def forecast():
    global df

    if request.method == "OPTIONS":
        return '', 200

    if df is None:
        return jsonify({"error": "Upload data first"}), 400

    try:
        days = int(request.json.get('days', 7))
    except:
        return jsonify({"error": "Invalid days"}), 400

    try:
        y = df['sales']

        model = ARIMA(y, order=(5, 1, 0))
        model_fit = model.fit()

        forecast_values = model_fit.forecast(steps=days)

        df_copy = df.copy()
        df_copy['date'] = df_copy['date'].dt.strftime('%Y-%m-%d')

        return jsonify({
            "forecast": forecast_values.tolist(),
            "history": df_copy.to_dict(orient='records')
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# =========================
# 🧠 RAG API
# =========================
@app.route('/ask', methods=['POST', 'OPTIONS'])
def ask():
    global rag_db

    if request.method == "OPTIONS":
        return '', 200

    question = request.json.get('question')

    if not question:
        return jsonify({"answer": "Please ask a question"})

    if rag_db is None:
        return jsonify({"answer": "Upload data first"})

    try:
        answer = ask_rag(rag_db, question)
        return jsonify({"answer": answer})
    except Exception as e:
        return jsonify({"answer": str(e)})


# =========================
# 🚀 RUN APP
# =========================
if __name__ == '__main__':
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port)