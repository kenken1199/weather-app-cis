import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";
import "./App.css";

function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const getWeather = async () => {
    const apiKey = "32c9c21abe809dd221ec69ad91a34585";

    if (!city) {
      setError("都市名を入力してください");
      return;
    }

    try {
      setError("");
      setLoading(true);

      const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric&lang=ja`;

      const res = await fetch(url);
      const data = await res.json();

      if (Number(data.cod) !== 200) {
        setError("都市名が見つかりません");
        setWeather(null);
        return;
      }

      // 日別平均データ作成
      const dailyData = {};

      data.list.forEach((item) => {
        const date = item.dt_txt.slice(0, 10);

        if (!dailyData[date]) {
          dailyData[date] = [];
        }

        dailyData[date].push(item.main.temp);
      });

      const chartData = Object.keys(dailyData).map((date) => {
        const temps = dailyData[date];

        const avg = temps.reduce((sum, temp) => sum + temp, 0) / temps.length;

        return {
          date: date.slice(5),
          temp: Number(avg.toFixed(1)),
        };
      });

      setWeather({
        city: data.city.name,
        temp: data.list[0].main.temp,
        description: data.list[0].weather[0].description,
        chartData,
      });
    } catch (err) {
      setError("通信エラーが発生しました");
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>⛅天気アプリ (5日間平均)</h1>

      <input
        value={city}
        onChange={(e) => setCity(e.target.value)}
        placeholder="都市名を入力"
      />

      <button onClick={getWeather} disabled={loading}>
        検索
      </button>

      {/* ローディング表示 */}
      {loading && <div className="spinner"></div>}

      {/* エラー表示 */}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* 天気表示 */}
      {weather && !loading && (
        <div>
          <h2>{weather.city}</h2>
          <p>現在気温：{weather.temp} ℃</p>
          <p>{weather.description}</p>

          {/* 日別平均グラフ */}
          <LineChart width={500} height={300} data={weather.chartData}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="temp" />
          </LineChart>
        </div>
      )}
    </div>
  );
}

export default App;
