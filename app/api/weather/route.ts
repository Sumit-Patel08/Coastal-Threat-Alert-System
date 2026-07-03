import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const WEATHER_CACHE_TTL_MS = 30 * 60 * 1000

type WeatherPayload = {
  temperature: number
  humidity: number
  windSpeed: number
  seaLevel: number
  tideHeight: number
  pollutionIndex: number
  visibility: number
  pollutionLevel: number
}

type CacheEntry = {
  data: WeatherPayload
  fetchedAt: number
}

const weatherCache = new Map<string, CacheEntry>()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const city = searchParams.get('city') || 'Mumbai'
    const forceRefresh = searchParams.get('refresh') === 'true'
    const cacheKey = city.trim().toLowerCase()

    const cached = weatherCache.get(cacheKey)
    const isFresh =
      cached && Date.now() - cached.fetchedAt < WEATHER_CACHE_TTL_MS

    if (!forceRefresh && isFresh && cached) {
      return NextResponse.json({
        city,
        data: cached.data,
        timestamp: new Date(cached.fetchedAt).toISOString(),
        cached: true,
        cacheTtlMinutes: 30,
      })
    }

    const weatherData = await fetchWeatherData(city)
    const fetchedAt = Date.now()
    weatherCache.set(cacheKey, { data: weatherData, fetchedAt })

    // Best-effort sensor logging; do not block weather responses if Supabase is down
    try {
      const supabase = await createClient()
      await supabase.from('sensor_data').insert([
        {
          sensor_type: 'weather_station',
          location: `${city} Weather Station`,
          value: weatherData.windSpeed,
          unit: 'km/h',
          timestamp: new Date(fetchedAt).toISOString(),
        },
        {
          sensor_type: 'tide_gauge',
          location: `${city} Coast`,
          value: weatherData.seaLevel,
          unit: 'm',
          timestamp: new Date(fetchedAt).toISOString(),
        },
        {
          sensor_type: 'pollution_sensor',
          location: `${city} Harbor`,
          value: weatherData.pollutionLevel,
          unit: 'ppm',
          timestamp: new Date(fetchedAt).toISOString(),
        },
      ])
    } catch (sensorError) {
      console.warn('Weather sensor logging skipped:', sensorError)
    }

    return NextResponse.json({
      city,
      data: weatherData,
      timestamp: new Date(fetchedAt).toISOString(),
      cached: false,
      cacheTtlMinutes: 30,
    })
  } catch (error) {
    console.error('Weather API error:', error)
    return NextResponse.json({ error: 'Failed to fetch weather data' }, { status: 500 })
  }
}

async function fetchWeatherData(city: string): Promise<WeatherPayload> {
  const cityVariations = {
    Mumbai: { tempBase: 28, seaLevelBase: 1.8, pollutionBase: 120, windBase: 25 },
    Chennai: { tempBase: 30, seaLevelBase: 1.5, pollutionBase: 95, windBase: 20 },
    Kolkata: { tempBase: 32, seaLevelBase: 2.1, pollutionBase: 110, windBase: 18 },
    Kochi: { tempBase: 26, seaLevelBase: 1.3, pollutionBase: 70, windBase: 15 },
    Visakhapatnam: { tempBase: 29, seaLevelBase: 1.6, pollutionBase: 85, windBase: 22 },
    Goa: { tempBase: 27, seaLevelBase: 1.4, pollutionBase: 60, windBase: 16 },
    Mangalore: { tempBase: 28, seaLevelBase: 1.5, pollutionBase: 75, windBase: 18 },
    Puducherry: { tempBase: 29, seaLevelBase: 1.4, pollutionBase: 80, windBase: 19 },
    Thiruvananthapuram: { tempBase: 27, seaLevelBase: 1.2, pollutionBase: 65, windBase: 14 },
    Bhubaneswar: { tempBase: 31, seaLevelBase: 1.7, pollutionBase: 90, windBase: 20 },
    Surat: { tempBase: 33, seaLevelBase: 1.6, pollutionBase: 105, windBase: 23 },
    Vadodara: { tempBase: 34, seaLevelBase: 1.5, pollutionBase: 95, windBase: 21 },
  }

  const cityData =
    cityVariations[city as keyof typeof cityVariations] || cityVariations.Mumbai

  return {
    temperature: cityData.tempBase + Math.random() * 8 - 4,
    humidity: 65 + Math.random() * 25,
    windSpeed: cityData.windBase + Math.random() * 15,
    seaLevel: cityData.seaLevelBase + Math.random() * 0.6 - 0.3,
    tideHeight: 0.8 + Math.random() * 1.5,
    pollutionIndex: Math.floor(cityData.pollutionBase + Math.random() * 40 - 20),
    visibility: 6 + Math.random() * 8,
    pollutionLevel: cityData.pollutionBase / 10 + Math.random() * 2,
  }
}
