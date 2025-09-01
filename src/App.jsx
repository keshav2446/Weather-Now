import { useState } from "react";
import { motion } from "framer-motion";
import { WiDaySunny, WiCloudy, WiRain, WiSnow } from "react-icons/wi";

function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getWeatherIcon = (condition) => {
    if (condition.includes("cloud")) return <WiCloudy size={60} />;
    if (condition.includes("rain")) return <WiRain size={60} />;
    if (condition.includes("snow")) return <WiSnow size={60} />;
    return <WiDaySunny size={60} />;
  };

  const getBackgroundClass = (condition) => {
    if (!condition) return "from-indigo-500 via-blue-500 to-cyan-400";
    if (condition.includes("rain"))
      return "from-gray-700 via-blue-800 to-gray-900";
    if (condition.includes("cloud"))
      return "from-blue-400 via-gray-400 to-gray-600";
    if (condition.includes("snow"))
      return "from-blue-200 via-cyan-300 to-white";
    return "from-yellow-400 via-orange-500 to-red-500"; // sunny
  };

  const fetchWeather = async () => {
    if (!city) return;
    setLoading(true);
    setError("");
    setWeather(null);

    try {
      // Step 1: Get Lat/Lon
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${city}`
      );
      const geoData = await geoRes.json();

      if (!geoData.results || geoData.results.length === 0) {
        setError("City not found ❌");
        setLoading(false);
        return;
      }

      const { latitude, longitude, country_code, name } = geoData.results[0];

      // Step 2: Get Weather
      const weatherRes = await fetch(
  `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=relativehumidity_2m&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`
);

      const weatherData = await weatherRes.json();

      const current = weatherData.current_weather;

      setWeather({
        city: name,
        country: country_code,
        temp: current.temperature,
        feels: current.apparent_temperature || current.temperature,
        condition: current.weathercode === 0 ? "Sunny" : "Cloudy",
        humidity: weatherData.hourly.relativehumidity_2m[0],
        wind: current.windspeed,
        forecast: weatherData.daily, 
      });
    } catch (err) {
      setError("Failed to fetch weather ⚠️");
    }

    setLoading(false);
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${getBackgroundClass(
        weather?.condition?.toLowerCase()
      )} p-4 transition-all duration-700`}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="backdrop-blur-md bg-white/20 shadow-xl rounded-3xl p-6 w-full max-w-md"
      >
        {/* Title */}
        <h1 className="text-3xl font-bold text-white text-center mb-6">
          🌤️ Weather Now
        </h1>

        {/* Input Box */}
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            placeholder="Enter city..."
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="flex-1 border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-300"
          />
          <button
            onClick={fetchWeather}
            className="bg-cyan-500 hover:bg-cyan-600 text-white font-semibold px-4 py-2 rounded-xl shadow"
          >
            Search
          </button>
        </div>

        {/* Loading */}
        {loading && <p className="text-white text-center">⏳ Loading...</p>}

        {/* Error */}
        {error && <p className="text-red-300 text-center">{error}</p>}

        {/* Weather Card */}
        {weather && !loading && !error && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center text-white"
          >
            <div className="flex justify-center mb-4">
              {getWeatherIcon(weather.condition.toLowerCase())}
            </div>
            <h2 className="text-2xl font-semibold">
              {weather.city}, {weather.country}
            </h2>
            <p className="text-4xl font-bold">{weather.temp}°C</p>
            <p className="italic text-gray-200">
              Feels like {weather.feels}°C
            </p>
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <p>💧 Humidity: {weather.humidity}%</p>
              <p>🌬 Wind: {weather.wind} km/h</p>
            </div>

            {/* 5-Day Forecast */}
{weather?.forecast && (
  <div className="mt-6">
    <h3 className="text-lg font-semibold mb-2 text-white">5-Day Forecast</h3>
    <div className="grid grid-cols-5 gap-2">
      {weather.forecast.time.slice(0, 5).map((date, i) => (
        <div
          key={date}
          className="bg-white/20 rounded-xl p-2 text-sm text-white flex flex-col items-center"
        >
          <p className="font-medium">
            {new Date(date).toLocaleDateString("en-US", {
              weekday: "short",
            })}
          </p>
          <p className="text-xs">
            {weather.forecast.temperature_2m_max[i]}° /{" "}
            {weather.forecast.temperature_2m_min[i]}°
          </p>
          <span className="mt-1">
            {getWeatherIcon(
              weather.forecast.weathercode[i] === 0 ? "sunny" : "cloudy"
            )}
          </span>
        </div>
      ))}
    </div>
  </div>
)}

          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

export default App;
