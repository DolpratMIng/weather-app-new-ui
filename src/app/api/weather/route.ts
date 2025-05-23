// src/app/api/weather/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db"; // Import your Prisma client

const OPEN_METEO_API_URL = "https://api.open-meteo.com/v1/forecast";
const LATITUDE = 13.75; // Latitude for Bangkok
const LONGITUDE = 100.51; // Longitude for Bangkok

// Helper function to map Open-Meteo weather codes to descriptions (simplified)
// IMPORTANT: For production, consult Open-Meteo's WMO Weather interpretation codes (WMO_CODE)
// for a comprehensive mapping. This is a basic example.
const getWeatherDescription = (code: number): string => {
  if (code === 0) return "Clear sky";
  if ([1, 2, 3].includes(code))
    return "Mainly clear, partly cloudy, and overcast";
  if ([45, 48].includes(code)) return "Fog and depositing rime fog";
  if ([51, 53, 55].includes(code)) return "Drizzle";
  if ([56, 57].includes(code)) return "Freezing Drizzle";
  if ([61, 63, 65].includes(code)) return "Rain";
  if ([66, 67].includes(code)) return "Freezing Rain";
  if ([71, 73, 75].includes(code)) return "Snow fall";
  if (code === 77) return "Snow grains";
  if ([80, 81, 82].includes(code)) return "Rain showers";
  if ([85, 86].includes(code)) return "Snow showers"; // Fixed typo here (was "code" -> code)
  if ([95].includes(code)) return "Thunderstorm";
  if ([96, 99].includes(code)) return "Thunderstorm with slight and heavy hail";
  return "Unknown"; // Default for unhandled codes
};

export async function GET(req: NextRequest) {
  try {
    const today = new Date();
    // Normalize today's date to midnight for comparison with @db.Date
    const todayMidnight = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    const params = new URLSearchParams({
      latitude: LATITUDE.toString(),
      longitude: LONGITUDE.toString(),
      current: "temperature_2m,relative_humidity_2m,weather_code", // Data for current weather
      daily:
        "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum", // Data for daily forecast/historical
      past_days: "7", // Request past 7 days of daily data
      forecast_days: "7", // Request future 7 days of daily data
      timezone: "Asia/Bangkok", // Set timezone for accurate local times
    });

    const response = await fetch(`${OPEN_METEO_API_URL}?${params.toString()}`);

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Open-Meteo API error:", errorData);
      return NextResponse.json(
        {
          message: "Failed to fetch weather data from Open-Meteo",
          error: errorData,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("Successfully fetched weather data from Open-Meteo.");

    const { current, daily } = data;

    // --- Store Current Weather ---
    if (current) {
      await prisma.currentWeather.upsert({
        // Using PascalCase model name: CurrentWeather
        where: { id: "bangkok-current-weather" }, // Using the fixed ID as per updated schema
        update: {
          temperature: current.temperature_2m,
          humidity: current.relative_humidity_2m, // Will be stored as Int
          weatherCode: current.weather_code,
          description: getWeatherDescription(current.weather_code),
          recordedAt: new Date(), // Update timestamp
        },
        create: {
          id: "bangkok-current-weather", // Create if not exists
          temperature: current.temperature_2m,
          humidity: current.relative_humidity_2m,
          weatherCode: current.weather_code,
          description: getWeatherDescription(current.weather_code),
          recordedAt: new Date(),
        },
      });
      console.log("Current weather data upserted.");
    }

    // --- Store Forecast and Historical Daily Weather ---
    if (daily && daily.time && daily.weather_code) {
      for (let i = 0; i < daily.time.length; i++) {
        const date = new Date(daily.time[i]);
        // Normalize the date to midnight for accurate comparison with @db.Date field
        const normalizedDate = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate()
        );

        // Use toDateString for comparison against today's normalized date
        const isPast =
          normalizedDate.toDateString() < todayMidnight.toDateString();
        const isToday =
          normalizedDate.toDateString() === todayMidnight.toDateString();

        // Store as historical if it's a past date or today's date
        // (Today's data serves as both current and the latest historical daily record)
        if (isPast || isToday) {
          await prisma.historicalDay.upsert({
            // Using PascalCase model name: HistoricalDay
            where: { date: normalizedDate }, // Use normalizedDate for upsert where clause
            update: {
              maxTemperature: daily.temperature_2m_max[i],
              minTemperature: daily.temperature_2m_min[i],
              precipitation: daily.precipitation_sum[i] || 0,
              weatherCode: daily.weather_code[i],
              description: getWeatherDescription(daily.weather_code[i]),
              recordedAt: new Date(),
            },
            create: {
              date: normalizedDate,
              maxTemperature: daily.temperature_2m_max[i],
              minTemperature: daily.temperature_2m_min[i],
              precipitation: daily.precipitation_sum[i] || 0,
              weatherCode: daily.weather_code[i],
              description: getWeatherDescription(daily.weather_code[i]),
              recordedAt: new Date(),
            },
          });
        }

        // Store as forecast if it's today's date or a future date
        if (!isPast) {
          // Includes today and future dates
          await prisma.forecastDay.upsert({
            // Using PascalCase model name: ForecastDay
            where: { date: normalizedDate }, // Use normalizedDate for upsert where clause
            update: {
              maxTemperature: daily.temperature_2m_max[i],
              minTemperature: daily.temperature_2m_min[i],
              weatherCode: daily.weather_code[i],
              description: getWeatherDescription(daily.weather_code[i]),
              recordedAt: new Date(),
            },
            create: {
              date: normalizedDate,
              maxTemperature: daily.temperature_2m_max[i],
              minTemperature: daily.temperature_2m_min[i],
              weatherCode: daily.weather_code[i],
              description: getWeatherDescription(daily.weather_code[i]),
              recordedAt: new Date(),
            },
          });
        }
      }
      console.log("Daily historical and forecast data upserted.");
    }

    return NextResponse.json({
      message: "Weather data fetched and stored successfully!",
    });
  } catch (error) {
    console.error("Error in API route /api/weather:", error);
    return NextResponse.json(
      { message: "Internal server error", error: (error as Error).message },
      { status: 500 }
    );
  }
}
