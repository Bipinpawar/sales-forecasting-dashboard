from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
from statsmodels.tsa.arima.model import ARIMA

app = Flask(__name__)
CORS(app)

# store processed data globally
df = None

# =========================
# 📁 UPLOAD API
# =========================
@app.route('/upload', methods=['POST'])
def upload():
    global df

    file = request.files['file']
    raw_df = pd.read_csv(file)

    # 🔹 Normalize column names
    raw_df.columns = [col.lower().strip() for col in raw_df.columns]

    # 🔍 Detect date column
    date_col = None
    for col in raw_df.columns:
        if 'date' in col:
            date_col = col
            break

    # 🔍 Detect sales column
    sales_col = None
    for col in raw_df.columns:
        if any(keyword in col for keyword in ['sales', 'revenue', 'amount', 'price']):
            sales_col = col
            break

    # ❌ If not found
    if not date_col or not sales_col:
        return jsonify({
            "error": "Could not detect date/sales column",
            "columns_found": raw_df.columns.tolist()
        }), 400

    # ✅ Keep only required columns
    df = raw_df[[date_col, sales_col]].copy()
    df.columns = ['date', 'sales']

    # 🔹 Convert types
    df['date'] = pd.to_datetime(df['date'], errors='coerce')
    df['sales'] = pd.to_numeric(df['sales'], errors='coerce')

    # 🔹 Remove invalid rows
    df = df.dropna()

    # 🔥 Aggregate same dates
    df = df.groupby('date').sum().reset_index()

    # 🔹 Sort by date
    df = df.sort_values('date')
    # 🔥 Fill missing dates (CRITICAL FIX)
    df = df.set_index('date').asfreq('D')

    # 🔹 Fill missing sales with 0 (or use forward fill)
    df['sales'] = df['sales'].fillna(0)

    # 🔹 Reset index
    df = df.reset_index()

    return jsonify({
        "message": "File processed successfully!",
        "detected_columns": {
            "date": date_col,
            "sales": sales_col
        },
        "total_records": len(df)
    })


# =========================
# 📈 FORECAST API
# =========================
@app.route('/forecast', methods=['POST'])
def forecast():
    global df

    if df is None:
        return jsonify({"error": "Please upload data first"}), 400

    days = request.json.get('days', 7)

    # 🔹 Sales data
    y = df['sales']

    # 🔥 ARIMA MODEL
    model = ARIMA(y, order=(5, 1, 0))
    model_fit = model.fit()

    forecast_values = model_fit.forecast(steps=days)

    # ✅ Convert date to ISO format for frontend
    df_copy = df.copy()
    df_copy['date'] = df_copy['date'].dt.strftime('%Y-%m-%d')

    return jsonify({
        "forecast": forecast_values.tolist(),
        "history": df_copy.to_dict(orient='records')
    })


# =========================
# 🚀 RUN APP
# =========================
if __name__ == '__main__':
    app.run(debug=True)