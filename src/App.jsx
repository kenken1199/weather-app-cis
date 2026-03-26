import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";
import { ResponsiveContainer } from "recharts";
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
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-300 to-blue-200 flex items-center justify-center p-4">
      <div className="bg-white/80 backdrop-blur-md shadow-2xl rounded-3xl p-6 w-full max-w-md border border-white/40">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          ⛅ 天気アプリ
        </h1>

        {/* 入力 */}
        <div className="flex gap-2 mb-5">
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="都市名を入力（例：Tokyo）"
            className="flex-1 border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          />
          <button
            onClick={getWeather}
            disabled={loading}
            className="bg-blue-500 text-white px-4 rounded-xl hover:bg-blue-600 active:scale-95 transition disabled:opacity-50"
          >
            検索
          </button>
        </div>

        {/* ローディング */}
        {loading && (
          <div className="flex justify-center my-6">
            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        )}

        {/* エラー */}
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        {/* 結果 */}
        {weather && !loading && (
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-700">
              {weather.city}
            </h2>

            <p className="text-4xl font-bold my-2 text-blue-600">
              {weather.temp}℃
            </p>

            <p className="text-gray-600 mb-4 capitalize">
              {weather.description}
            </p>

            {/* グラフ */}
            <div className="bg-white rounded-xl p-3 shadow-inner">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart
                  data={weather.chartData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
                >
                  <XAxis dataKey="date" interval={0} fontSize={12} />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="temp"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
