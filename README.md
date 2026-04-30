📊 Sales Forecast Dashboard

A React-based analytics dashboard that visualizes past sales data and forecasted future sales using bar charts. The project integrates with a backend API to upload CSV data and generate AI/ML-based forecasts.

🚀 Features
📁 Upload sales CSV file
📈 Visualize past sales (Bar Chart)
🔮 View forecasted sales (Bar Chart)
🔄 Real-time API integration (Flask backend)
⚡ Loading state handling
📊 Clean separation of historical vs predicted data

🛠️ Tech Stack
Frontend
React.js
Chart.js
react-chartjs-2
Axios
Backend (Expected)
Python Flask / FastAPI
Pandas
ML Forecasting model (ARIMA / Prophet / custom model)

📂 Project Structure
```
sales-forecast-dashboard/
│
├── src/
│   ├── App.js
│   ├── index.js
│   └── components/
│
├── public/
├── package.json
└── README.md
```
⚙️ Installation
1. Clone repository
git clone https://github.com/your-username/sales-forecast-dashboard.git
cd sales-forecast-dashboard
2. Install dependencies
npm install
3. Start React app
npm start
🔌 Backend API Requirements

Make sure your backend is running on:

http://127.0.0.1:5000

screenshot
<img width="1886" height="867" alt="image" src="https://github.com/user-attachments/assets/8ecb3be7-f39b-41ae-b580-a11492522c33" />
