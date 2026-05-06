import React, { useState } from "react";
import { Bar } from "react-chartjs-2";
import axios from "axios";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  Title,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  Title
);

function App() {
  const [file, setFile] = useState(null);
  const [days, setDays] = useState("");
  const [forecast, setForecast] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🧠 RAG states
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const API_URL = "https://sales-forecasting-dashboard-g6d4.onrender.com";

  // =========================
  // 📁 Upload
  // =========================
  const handleUpload = async () => {
    if (!file) return alert("Select file");

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      await axios.post(`${API_URL}/upload`, formData);
      alert("Upload successful");
    } catch (e) {
      console.error(e);
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // 📈 Forecast
  // =========================
  const getForecast = async () => {
    if (!days) return alert("Enter days");

    try {
      setLoading(true);

      const res = await axios.post(`${API_URL}/forecast`, {
        days: Number(days),
      });

      setForecast(res.data.forecast || []);
      setHistory(res.data.history || []);
    } catch (e) {
      console.error(e);
      alert("Forecast failed");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // 🧠 RAG QUERY
  // =========================
  const askQuestion = async () => {
    if (!question) return alert("Ask something");

    try {
      setLoading(true);

      const res = await axios.post(`${API_URL}/ask`, {
        question,
      });

      setAnswer(res.data.answer);
    } catch (e) {
      console.error(e);
      alert("Failed to get answer");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // 📊 Past Chart
  // =========================
  const pastChart = {
    labels: history.map((d) => d.date),
    datasets: [
      {
        label: "Past Sales",
        data: history.map((d) => Number(d.sales)),
        backgroundColor: "rgba(54, 162, 235, 0.6)",
      },
    ],
  };

  // =========================
  // 🔮 Forecast Chart
  // =========================
  let forecastLabels = [];
  let forecastValues = [];

  if (history.length && forecast.length) {
    const lastDate = new Date(history[history.length - 1].date);

    forecast.forEach((value, i) => {
      const d = new Date(lastDate);
      d.setDate(d.getDate() + i + 1);

      forecastLabels.push(d.toISOString().split("T")[0]);
      forecastValues.push(Number(value));
    });
  }

  const forecastChart = {
    labels: forecastLabels,
    datasets: [
      {
        label: "Forecast Sales",
        data: forecastValues,
        backgroundColor: "rgba(255, 99, 132, 0.6)",
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
    },
  };

  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      <h1 style={{ textAlign: "center" }}>📊 Sales Intelligence Dashboard</h1>

      {/* =========================
          📁 Upload Section
      ========================= */}
      <div style={card}>
        <h3>Upload Data</h3>
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        <button onClick={handleUpload} disabled={loading} style={btn}>
          Upload
        </button>
      </div>

      {/* =========================
          📈 Forecast Section
      ========================= */}
      <div style={card}>
        <h3>Forecast</h3>
        <input
          type="number"
          placeholder="Forecast days"
          value={days}
          onChange={(e) => setDays(e.target.value)}
        />
        <button onClick={getForecast} disabled={loading} style={btn}>
          Predict
        </button>
      </div>

      {/* =========================
          🧠 RAG Section
      ========================= */}
      <div style={card}>
        <h3>Ask Questions (RAG)</h3>
        <input
          type="text"
          placeholder="e.g. What is average sales?"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          style={{ width: "60%" }}
        />
        <button onClick={askQuestion} style={btn}>
          Ask
        </button>

        {answer && (
          <div style={{ marginTop: 10, background: "#f4f4f4", padding: 10 }}>
            <strong>Answer:</strong> {answer}
          </div>
        )}
      </div>

      {loading && <p>Loading...</p>}

      {/* =========================
          Charts
      ========================= */}
      {history.length > 0 && (
        <div style={card}>
          <h3>📉 Past Sales</h3>
          <Bar data={pastChart} options={options} />
        </div>
      )}

      {forecast.length > 0 && (
        <div style={card}>
          <h3>🔮 Forecast</h3>
          <Bar data={forecastChart} options={options} />
        </div>
      )}
    </div>
  );
}

// 🎨 Simple Styles
const card = {
  background: "#fff",
  padding: 20,
  margin: "20px auto",
  width: "90%",
  boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
  borderRadius: "10px",
};

const btn = {
  marginLeft: 10,
  padding: "6px 12px",
  cursor: "pointer",
};

export default App;