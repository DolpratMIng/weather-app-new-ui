import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const API_URL = "https://api.open-meteo.com/v1/forecast";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");
  if (!lat || !lon)
    return NextResponse.json({ error: "Missing lat/lon" }, { status: 400 });

  const res = await fetch(
    `${API_URL}?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=Asia/Bangkok`
  );
  if (!res.ok) throw new Error("Open-Meteo error");
  const data = await res.json();
  const cw = data.current_weather;

  const record = await prisma.currentWeather.create({
    data: {
      temperature: cw.temperature,
      humidity: 0, // fallback because humidity not available in current_weather
      weatherCode: cw.weathercode,
      description: cw.weathercode.toString(),
    },
  });

  return NextResponse.json(record);
}
