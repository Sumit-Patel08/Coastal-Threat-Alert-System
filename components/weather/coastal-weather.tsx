'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { WeatherAPI, WeatherData } from '@/lib/weather-api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Cloud, Sun, CloudRain, Wind, Eye, Droplets, Thermometer, RefreshCw } from 'lucide-react'

interface CoastalWeatherProps {
  cities?: string[]
  showDetailed?: boolean
}

export function CoastalWeather({
  cities = ['Mumbai', 'Chennai', 'Kochi', 'Kolkata', 'Visakhapatnam'],
  showDetailed = true,
}: CoastalWeatherProps) {
  const [weatherData, setWeatherData] = useState<{ [key: string]: WeatherData }>({})
  const [lastFetchedAt, setLastFetchedAt] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  const citiesKey = useMemo(() => cities.join('|'), [cities])

  const loadFromCache = useCallback(() => {
    const weatherMap: { [key: string]: WeatherData } = {}
    let oldestFresh: number | null = null
    let allFresh = true

    for (const city of cities) {
      const cached = WeatherAPI.getCachedWeather(city)
      if (!cached || !WeatherAPI.isCacheFresh(city)) {
        allFresh = false
        continue
      }
      weatherMap[city] = cached.data
      oldestFresh =
        oldestFresh === null ? cached.fetchedAt : Math.min(oldestFresh, cached.fetchedAt)
    }

    if (allFresh && Object.keys(weatherMap).length === cities.length) {
      setWeatherData(weatherMap)
      setLastFetchedAt(oldestFresh)
      return true
    }

    // Show any partial cache while a background fetch runs
    if (Object.keys(weatherMap).length > 0) {
      setWeatherData(weatherMap)
      setLastFetchedAt(oldestFresh)
    }

    return false
  }, [cities])

  const fetchWeatherData = useCallback(
    async (forceRefresh = false) => {
      try {
        if (forceRefresh) {
          setRefreshing(true)
        } else {
          setLoading(true)
        }
        setError(null)

        const weatherMap: { [key: string]: WeatherData } = {}
        let newestFetchedAt = 0

        for (let index = 0; index < cities.length; index++) {
          const city = cities[index]
          try {
            const needsNetwork = forceRefresh || !WeatherAPI.isCacheFresh(city)
            const data = await WeatherAPI.getCurrentWeather(city, { forceRefresh })
            weatherMap[city] = data
            const cached = WeatherAPI.getCachedWeather(city)
            if (cached) {
              newestFetchedAt = Math.max(newestFetchedAt, cached.fetchedAt)
            }
            if (needsNetwork && index < cities.length - 1) {
              await new Promise((resolve) => setTimeout(resolve, 50))
            }
          } catch (cityError) {
            console.error(`Failed to fetch weather for ${city}:`, cityError)
          }
        }

        setWeatherData(weatherMap)
        setLastFetchedAt(newestFetchedAt || Date.now())
      } catch (err) {
        console.error('Error fetching weather data:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch weather data')
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [cities],
  )

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    // Prefer cached data (valid for 30 minutes). Only call APIs when stale/missing.
    const hasFreshCache = loadFromCache()
    if (!hasFreshCache) {
      void fetchWeatherData(false)
    }
  }, [mounted, citiesKey, loadFromCache, fetchWeatherData])

  const handleRefresh = () => {
    void fetchWeatherData(true)
  }

  const getWeatherIcon = (weatherMain: string) => {
    switch (weatherMain.toLowerCase()) {
      case 'clear':
        return <Sun className="h-6 w-6 text-yellow-500" />
      case 'clouds':
        return <Cloud className="h-6 w-6 text-gray-500" />
      case 'rain':
      case 'drizzle':
        return <CloudRain className="h-6 w-6 text-blue-500" />
      default:
        return <Cloud className="h-6 w-6 text-gray-500" />
    }
  }

  const getWindDirection = (deg: number) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
    return directions[Math.round(deg / 45) % 8]
  }

  if (!mounted) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            Coastal Weather Conditions
            <Badge variant="outline" className="ml-auto">
              Initializing...
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cities.map((city) => (
              <div key={city} className="border rounded-lg p-4 space-y-3 animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                  <div className="h-6 w-6 bg-gray-200 rounded"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading && Object.keys(weatherData).length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            Coastal Weather Conditions
            <Badge variant="outline" className="ml-auto">
              Loading...
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cities.map((city) => (
              <div key={city} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">{city}</h3>
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
                </div>
                <div className="text-sm text-gray-500">Fetching weather data...</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error && Object.keys(weatherData).length === 0) {
    return (
      <Card className="w-full border-red-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2 text-red-600">
            <Cloud className="h-5 w-5" />
            Weather Service Error
          </CardTitle>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Retry
          </Button>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-600">{error}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 gap-4">
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            Coastal Weather Conditions
            <Badge variant="outline" className="ml-2">
              Cached 30 min
            </Badge>
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing || loading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(weatherData).map(([city, data]) => (
              <div key={city} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">{data.name}</h3>
                  {getWeatherIcon(data.weather[0]?.main)}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Thermometer className="h-4 w-4 text-red-500" />
                    <span className="text-2xl font-bold">
                      {WeatherAPI.formatTemperature(data.main.temp)}
                    </span>
                    <span className="text-sm text-gray-500">
                      Feels like {WeatherAPI.formatTemperature(data.main.feels_like)}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 capitalize">
                    {data.weather[0]?.description}
                  </p>

                  {showDetailed && (
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                      <div className="flex items-center gap-1">
                        <Droplets className="h-3 w-3" />
                        {data.main.humidity}%
                      </div>
                      <div className="flex items-center gap-1">
                        <Wind className="h-3 w-3" />
                        {data.wind.speed} m/s {getWindDirection(data.wind.deg)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {(data.visibility / 1000).toFixed(1)} km
                      </div>
                      <div className="flex items-center gap-1">
                        <Cloud className="h-3 w-3" />
                        {data.clouds.all}%
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>H: {WeatherAPI.formatTemperature(data.main.temp_max)}</span>
                    <span>L: {WeatherAPI.formatTemperature(data.main.temp_min)}</span>
                    <span>{data.main.pressure} hPa</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t">
            <p className="text-xs text-gray-500 text-center">
              Updates automatically every 30 minutes
              {lastFetchedAt
                ? ` • Last updated ${WeatherAPI.formatLastUpdated(lastFetchedAt)}`
                : ''}
              {' • '}
              Use Refresh for the latest data
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
