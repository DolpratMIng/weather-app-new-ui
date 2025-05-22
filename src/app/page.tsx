import { prisma } from "@/lib/db";
import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  Droplets,
  MapPin,
  Sun,
  Thermometer,
  Wind,
} from "lucide-react";

export default async function HomePage() {
  // Keep your original data fetching logic
  const [current] = await prisma.currentWeather.findMany({
    orderBy: { recordedAt: "desc" },
    take: 1,
  });

  const forecast = await prisma.forecastDay.findMany({
    orderBy: { date: "asc" },
    take: 7,
  });

  const historical = await prisma.historicalDay.findMany({
    orderBy: { date: "desc" },
    take: 7,
  });

  // Helper function to get weather icon based on weather code
  const getWeatherIcon = (code: number, className = "h-8 w-8") => {
    // This is a simplified mapping - adjust based on your actual weather codes
    if (code < 300) return <CloudLightning className={className} />; // Thunderstorm
    if (code < 400) return <CloudDrizzle className={className} />; // Drizzle
    if (code < 600) return <CloudRain className={className} />; // Rain
    if (code < 700) return <CloudSnow className={className} />; // Snow
    if (code < 800) return <CloudFog className={className} />; // Atmosphere (fog, mist, etc.)
    if (code === 800) return <Sun className={className} />; // Clear sky
    if (code < 900) return <Cloud className={className} />; // Clouds
    return <Wind className={className} />; // Other
  };

  // Format date to display day name
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <MapPin className="h-6 w-6 text-sky-600" />
            <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white text-center">
              Bangkok Weather
            </h1>
          </div>
          <p className="text-slate-600 dark:text-slate-300 text-center">
            Real-time weather data and forecasts
          </p>
        </header>

        <main className="space-y-8">
          {/* Current Weather Card */}
          <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden border border-sky-100 dark:border-slate-700">
            <div className="p-6 md:p-8">
              <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                Current Weather
              </h2>

              {current ? (
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="flex-shrink-0 bg-gradient-to-br from-sky-100 to-blue-50 dark:from-sky-900/30 dark:to-blue-900/20 p-6 rounded-2xl">
                    {getWeatherIcon(
                      current.weatherCode,
                      "h-20 w-20 text-sky-600 dark:text-sky-400"
                    )}
                  </div>

                  <div className="flex-grow">
                    <div className="flex items-baseline gap-2">
                      <span className="text-6xl font-bold text-slate-800 dark:text-white">
                        {current.temperature}°C
                      </span>
                      <span className="text-slate-500 dark:text-slate-400 text-lg">
                        {current.description}
                      </span>
                    </div>

                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-700/40 p-3 rounded-xl">
                        <Droplets className="h-5 w-5 text-sky-500" />
                        <span className="text-slate-700 dark:text-slate-300">
                          Humidity: {current.humidity}%
                        </span>
                      </div>
                      <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-700/40 p-3 rounded-xl">
                        <Wind className="h-5 w-5 text-indigo-500" />
                        <span className="text-slate-700 dark:text-slate-300">
                          Code: {current.weatherCode}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                      Updated:{" "}
                      {new Date(current.recordedAt).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-100 dark:bg-slate-700/50 rounded-xl p-6 text-center">
                  <p className="text-slate-600 dark:text-slate-300">
                    No current weather data available.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* 7-Day Forecast */}
          <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden border border-sky-100 dark:border-slate-700">
            <div className="p-6 md:p-8">
              <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-6 flex items-center gap-2">
                <Thermometer className="h-5 w-5 text-orange-500" />
                7-Day Forecast
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
                {forecast.map((day) => (
                  <div
                    key={day.id}
                    className="bg-gradient-to-b from-slate-50 to-sky-50 dark:from-slate-700/40 dark:to-slate-700/20 rounded-xl p-4 transition-all hover:shadow-md hover:translate-y-[-4px] border border-slate-100 dark:border-slate-700"
                  >
                    <div className="text-center">
                      <p className="font-medium text-slate-800 dark:text-white mb-2">
                        {formatDate(day.date)}
                      </p>
                      <div className="flex justify-center my-3">
                        {getWeatherIcon(
                          day.weatherCode,
                          "h-12 w-12 text-sky-500 dark:text-sky-400"
                        )}
                      </div>
                      <div className="flex justify-center items-center gap-2 mt-2">
                        <span className="text-slate-800 dark:text-white font-semibold">
                          {day.maxTemperature}°
                        </span>
                        <span className="text-slate-500 dark:text-slate-400">
                          {day.minTemperature}°
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 truncate">
                        {day.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Historical Data */}
          <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden border border-sky-100 dark:border-slate-700">
            <div className="p-6 md:p-8">
              <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-6 flex items-center gap-2">
                <CloudRain className="h-5 w-5 text-blue-500" />
                Historical Weather (Last 7 Days)
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px]">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <th className="text-left py-3 px-4 font-medium text-slate-600 dark:text-slate-300">
                        Date
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-slate-600 dark:text-slate-300">
                        Temperature
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-slate-600 dark:text-slate-300">
                        Precipitation
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-slate-600 dark:text-slate-300">
                        Conditions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {historical.map((day) => (
                      <tr
                        key={day.id}
                        className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30"
                      >
                        <td className="py-3 px-4">
                          <span className="font-medium text-slate-700 dark:text-slate-200">
                            {formatDate(day.date)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1">
                            <span className="text-slate-800 dark:text-white">
                              {day.maxTemperature}°
                            </span>
                            <span className="text-slate-400 dark:text-slate-500">
                              /
                            </span>
                            <span className="text-slate-600 dark:text-slate-300">
                              {day.minTemperature}°
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1">
                            <CloudRain className="h-4 w-4 text-blue-500" />
                            <span className="text-slate-700 dark:text-slate-300">
                              {day.precipitation} mm
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {getWeatherIcon(
                              day.weatherCode,
                              "h-5 w-5 text-slate-600 dark:text-slate-400"
                            )}
                            <span className="text-slate-600 dark:text-slate-300 text-sm">
                              {day.description}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </main>

        <footer className="mt-12 text-center text-slate-500 dark:text-slate-400 text-sm">
          <p>Weather data for Bangkok, Thailand. Updated via Open-Meteo API.</p>
        </footer>
      </div>
    </div>
  );
}
