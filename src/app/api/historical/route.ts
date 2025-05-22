import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const API_URL = "https://api.open-meteo.com/v1/forecast";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");
  if (!lat || !lon)
    return NextResponse.json({ error: "Missing lat/lon" }, { status: 400 });

  // calculate dates
  const today = new Date();
  const end = new Date(today);
  end.setDate(end.getDate() - 1);
  const start = new Date(today);
  start.setDate(start.getDate() - 7);

  const fmt = (d: Date) => d.toISOString().split("T")[0];
  const url = `${API_URL}?latitude=${lat}&longitude=${lon}&start_date=${fmt(
    start
  )}&end_date=${fmt(
    end
  )}&daily=temperature_2m_max,temperature_2m_min,weathercode,precipitation_sum&timezone=Asia/Bangkok`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Open-Meteo error");
  const data = await res.json();

  const created = [];
  for (let i = 0; i < data.daily.time.length; i++) {
    const date = new Date(data.daily.time[i]);
    const rec = await prisma.historicalDay.create({
      data: {
        date,
        maxTemperature: data.daily.temperature_2m_max[i],
        minTemperature: data.daily.temperature_2m_min[i],
        weatherCode: data.daily.weathercode[i],
        description: data.daily.weathercode[i].toString(),
        precipitation: data.daily.precipitation_sum[i],
      },
    });
    created.push(rec);
  }

  return NextResponse.json({ daily: created });
}
