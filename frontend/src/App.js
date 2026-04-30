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

  // Upload
  const handleUpload = async () => {
    if (!file) return alert("Select file");

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      await axios.post("http://127.0.0.1:5000/upload", formData);
      alert("Upload successful");
    } catch (e) {
      console.error(e);
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  // Forecast
  const getForecast = async () => {
    if (!days) return alert("Enter days");

    try {
      setLoading(true);

      const res = await axios.post("http://127.0.0.1:5000/forecast", {
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

  // 📊 PAST DATA (BAR)
  const pastLabels = history.map((d) => d.date);
  const pastValues = history.map((d) => Number(d.sales));

  const pastChart = {
    labels: pastLabels,
    datasets: [
      {
        label: "Past Sales",
        data: pastValues,
        backgroundColor: "rgba(54, 162, 235, 0.6)",
      },
    ],
  };

  // 🔮 FORECAST DATA (BAR)
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
    <div style={{ textAlign: "center", padding: 20 }}>
      <h2>📊 Sales Dashboard</h2>

      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handleUpload} disabled={loading}>
        Upload
      </button>

      <br /><br />

      <input
        type="number"
        placeholder="Forecast days"
        value={days}
        onChange={(e) => setDays(e.target.value)}
      />

      <button onClick={getForecast} disabled={loading}>
        Predict
      </button>

      <br /><br />

      {loading && <p>Loading...</p>}

      {/* 📊 PAST CHART */}
      {history.length > 0 && (
        <div style={{ width: "90%", margin: "auto" }}>
          <h3>📉 Past Sales</h3>
          <Bar data={pastChart} options={options} />
        </div>
      )}

      <br />

      {/* 🔮 FORECAST CHART */}
      {forecast.length > 0 && (
        <div style={{ width: "90%", margin: "auto" }}>
          <h3>🔮 Forecast Sales</h3>
          <Bar data={forecastChart} options={options} />
        </div>
      )}
    </div>
  );
}

export default App;