import { useState } from "react";
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

      const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=ja`;

      const res = await fetch(url);
      const data = await res.json();

      if (data.cod !== 200) {
        setError("都市名が見つかりません");
        setWeather(null);
        return;
      }

      setWeather(data);
    } catch (err) {
      setError("通信エラーが発生しました");
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>⛅天気アプリ</h1>

      <input
        value={city}
        onChange={(e) => setCity(e.target.value)}
        placeholder="都市名を入力"
      />

      <button onClick={getWeather}>検索</button>

      {/* ローディング表示 */}
      {loading && <div className="spinner"></div>}

      {/* エラー表示 */}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* 天気表示 */}
      {weather && weather.main && (
        <div>
          <h2>{weather.name}</h2>
          <p>気温：{weather.main.temp} ℃</p>
          <p>天気：{weather.weather[0].description}</p>
        </div>
      )}
    </div>
  );
}

export default App;
