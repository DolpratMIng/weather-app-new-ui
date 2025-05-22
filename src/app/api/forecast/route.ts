// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/db";

// const API_URL = "https://api.open-meteo.com/v1/forecast";

// export async function GET(request: Request) {
//   const { searchParams } = new URL(request.url);
//   const lat = searchParams.get("lat");
//   const lon = searchParams.get("lon");
//   if (!lat || !lon)
//     return NextResponse.json({ error: "Missing lat/lon" }, { status: 400 });

//   const res = await fetch(
//     `${API_URL}?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=Asia/Bangkok&forecast_days=7`
//   );
//   if (!res.ok) throw new Error("Open-Meteo error");
//   const data = await res.json();

//   const created = [];
//   for (let i = 0; i < data.daily.time.length; i++) {
//     const date = new Date(data.daily.time[i]);
//     const rec = await prisma.forecastDay.create({
//       data: {
//         date,
//         maxTemperature: data.daily.temperature_2m_max[i],
//         minTemperature: data.daily.temperature_2m_min[i],
//         weatherCode: data.daily.weathercode[i],
//         description: data.daily.weathercode[i].toString(),
//       },
//     });
//     created.push(rec);
//   }

//   return NextResponse.json({ daily: created });
// }

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const API_URL = "https://api.open-meteo.com/v1/forecast";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get("lat");
    const lon = searchParams.get("lon");
    if (!lat || !lon) {
      return NextResponse.json({ error: "Missing lat/lon" }, { status: 400 });
    }

    const res = await fetch(
      `${API_URL}?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=Asia/Bangkok&forecast_days=7`
    );

    if (!res.ok) {
      console.error("Failed to fetch from Open-Meteo:", await res.text());
      return NextResponse.json(
        { error: "Open-Meteo fetch failed" },
        { status: 502 }
      );
    }

    const data = await res.json();

    const created = [];
    for (let i = 0; i < data.daily.time.length; i++) {
      const date = new Date(data.daily.time[i]);
      const rec = await prisma.forecastDay.create({
        data: {
          date,
          maxTemperature: data.daily.temperature_2m_max[i],
          minTemperature: data.daily.temperature_2m_min[i],
          weatherCode: data.daily.weathercode[i],
          description: data.daily.weathercode[i].toString(),
        },
      });
      created.push(rec);
    }

    return NextResponse.json({ daily: created });
  } catch (error: any) {
    console.error("API Forecast Handler Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
