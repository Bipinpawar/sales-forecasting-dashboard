import React, { useState } from "react";
import { Bar } from "react-chartjs-2";
import axios from "axios";
import "./App.css";

function App() {
  const [file, setFile] = useState(null);
  const [days, setDays] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [forecast, setForecast] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const API_URL = "https://sales-forecasting-dashboard-g6d4.onrender.com";

  const handleUpload = async () => {
    if (!file) return alert("Select file");

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      await axios.post(`${API_URL}/upload`, formData);
      alert("Upload successful");
    } catch (e) {
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const getForecast = async () => {
    if (!days) return alert("Enter days");

    try {
      setLoading(true);
      const res = await axios.post(`${API_URL}/forecast`, {
        days: Number(days),
      });

      setForecast(res.data.forecast || []);
      setHistory(res.data.history || []);
    } finally {
      setLoading(false);
    }
  };

  const askQuestion = async () => {
    if (!question) return;

    try {
      setLoading(true);
      const res = await axios.post(`${API_URL}/ask`, {
        question,
      });

      setAnswer(res.data.answer);
    } finally {
      setLoading(false);
    }
  };

  // Charts
  const pastChart = {
    labels: history.map((d) => d.date),
    datasets: [
      {
        label: "Past Sales",
        data: history.map((d) => d.sales),
        backgroundColor: "#4f46e5",
      },
    ],
  };

  const forecastChart = {
    labels: forecast.map((_, i) => `Day ${i + 1}`),
    datasets: [
      {
        label: "Forecast",
        data: forecast,
        backgroundColor: "#ef4444",
      },
    ],
  };

  return (
    <div className="container">
      <h1 className="title">📊 Sales Intelligence Dashboard</h1>

      {/* Upload */}
      <div className="card">
        <h3>Upload Data</h3>
        <div className="row">
          <input type="file" onChange={(e) => setFile(e.target.files[0])} />
          <button onClick={handleUpload}>Upload</button>
        </div>
      </div>

      {/* Forecast */}
      <div className="card">
        <h3>Forecast</h3>
        <div className="row">
          <input
            type="number"
            placeholder="Forecast days"
            value={days}
            onChange={(e) => setDays(e.target.value)}
          />
          <button onClick={getForecast}>Predict</button>
        </div>
      </div>

      {/* Charts */}
      <div className="charts">
        {history.length > 0 && (
          <div className="chart-card">
            <h4>Past Sales</h4>
            <Bar data={pastChart} />
          </div>
        )}

        {forecast.length > 0 && (
          <div className="chart-card">
            <h4>Forecast</h4>
            <Bar data={forecastChart} />
          </div>
        )}
      </div>

      {/* RAG */}
      <div className="card">
        <h3>Ask Questions (AI)</h3>
        <div className="row">
          <input
            type="text"
            placeholder="Ask something about your data..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <button onClick={askQuestion}>Ask</button>
        </div>

        {answer && <div className="answer-box">{answer}</div>}
      </div>

      {loading && <p className="loading">Processing...</p>}
    </div>
  );
}

export default App;