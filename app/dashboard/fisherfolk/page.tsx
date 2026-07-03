"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getClientAppSession } from "@/lib/auth/session"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Fish, AlertTriangle, MapPin, Phone, Shield, Waves, Sun, CloudRain, Thermometer, Wind, Eye, Navigation, Zap } from "lucide-react"
import { RealTimeAlerts } from "@/components/alerts/realtime-alerts"
import { EnhancedSafetyTips } from "@/components/safety/enhanced-safety-tips"
import { InteractiveMap } from "@/components/map/interactive-map"
import { useGeolocation } from "@/lib/geolocation"
import { useRealTimeData } from "@/lib/realtime-data"
import { mockCoastalConditions, getFishingSafetyColor } from "@/lib/mock-data"

export default function FisherfolkDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { location: userLocation } = useGeolocation()
  const { data: realTimeData, lastUpdate, isConnected } = useRealTimeData()

  useEffect(() => {
    const checkAuth = async () => {
      const session = await getClientAppSession()

      if (!session) {
        router.push("/auth/login")
        return
      }

      if (session.role !== "fisherfolk") {
        router.push("/dashboard")
        return
      }

      setUser(session.user)
      setLoading(false)
    }

    checkAuth()
  }, [router])

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  // Mock data for hackathon MVP
  const liveAlerts = [
    { id: 1, type: "Sea Level Rise", severity: "High", location: "Nearby Coast", time: "1 hour ago", action: "Return to shore" },
    { id: 2, type: "Cyclone Warning", severity: "Critical", location: "50km offshore", time: "3 hours ago", action: "Seek shelter immediately" },
    { id: 3, type: "Strong Currents", severity: "Medium", location: "Fishing zone A", time: "5 hours ago", action: "Use caution" },
  ]

  const safetyTips = [
    { id: 1, tip: "Always check weather forecast before going to sea", category: "Weather" },
    { id: 2, tip: "Keep emergency contacts readily available", category: "Safety" },
    { id: 3, tip: "Monitor sea level changes during high tide", category: "Navigation" },
    { id: 4, tip: "Avoid fishing during cyclone warnings", category: "Weather" },
    { id: 5, tip: "Carry life jackets and safety equipment", category: "Safety" },
  ]

  const coastalConditions = [
    { location: "Current Zone", seaLevel: "Normal", windSpeed: "15 km/h", visibility: "Good", fishing: "Safe" },
    { location: "Nearby Harbor", seaLevel: "High", windSpeed: "25 km/h", visibility: "Moderate", fishing: "Caution" },
    { location: "Deep Water", seaLevel: "Normal", windSpeed: "20 km/h", visibility: "Good", fishing: "Safe" },
  ]

  const weatherForecast = [
    { time: "Now", condition: "Sunny", temp: "28°C", wind: "15 km/h" },
    { time: "2 PM", condition: "Partly Cloudy", temp: "30°C", wind: "18 km/h" },
    { time: "4 PM", condition: "Cloudy", temp: "29°C", wind: "22 km/h" },
    { time: "6 PM", condition: "Light Rain", temp: "27°C", wind: "25 km/h" },
  ]

  return (
    <div className="flex-1 space-y-4 p-4 md:p-6">
      <div className="text-center md:text-left">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Fisherfolk Dashboard</h1>
        <p className="text-muted-foreground text-sm md:text-base">
          Stay safe with real-time coastal alerts and conditions
        </p>
      </div>

      {/* Emergency Alert Banner */}
      {liveAlerts.some(alert => alert.severity === "Critical") && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-800">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-semibold">EMERGENCY ALERT</span>
          </div>
          <p className="text-red-700 text-sm mt-1">
            Critical weather conditions detected. Return to shore immediately if at sea.
          </p>
        </div>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="conditions">Conditions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Quick Status Cards */}
          <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
            <Card className="text-center">
              <CardContent className="p-3">
                <div className="text-lg font-bold text-green-600">Safe</div>
                <div className="text-xs text-muted-foreground">Current Status</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-3">
                <div className="text-lg font-bold">28°C</div>
                <div className="text-xs text-muted-foreground">Temperature</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-3">
                <div className="text-lg font-bold">15 km/h</div>
                <div className="text-xs text-muted-foreground">Wind Speed</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-3">
                <div className="text-lg font-bold text-blue-600">Good</div>
                <div className="text-xs text-muted-foreground">Visibility</div>
              </CardContent>
            </Card>
          </div>

          {/* Real-Time Live Alerts */}
          <RealTimeAlerts maxItems={2} />

          {/* Enhanced Safety Tips */}
          <EnhancedSafetyTips maxItems={3} />

          {/* Emergency Contacts */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Phone className="h-5 w-5 text-red-500" />
                Emergency Contacts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button className="w-full" variant="destructive">
                  <Phone className="mr-2 h-4 w-4" />
                  Coast Guard: 1554
                </Button>
                <Button className="w-full" variant="outline">
                  <Phone className="mr-2 h-4 w-4" />
                  Weather Helpline: 1800-180-1717
                </Button>
                <Button className="w-full" variant="outline">
                  <Phone className="mr-2 h-4 w-4" />
                  Local Fisheries: 1800-425-1555
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <RealTimeAlerts showViewAll={true} maxItems={undefined} title="All Active Alerts" />
        </TabsContent>

        <TabsContent value="conditions" className="space-y-4">
          {/* Weather Forecast */}
          <Card>
            <CardHeader>
              <CardTitle>Weather Forecast</CardTitle>
              <CardDescription>Next 6 hours weather conditions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-2">
                {weatherForecast.map((forecast, index) => (
                  <div key={index} className="text-center p-2 border rounded">
                    <div className="text-xs font-medium">{forecast.time}</div>
                    <div className="text-lg">
                      {forecast.condition === "Sunny" && <Sun className="h-6 w-6 mx-auto text-yellow-500" />}
                      {forecast.condition === "Partly Cloudy" && <CloudRain className="h-6 w-6 mx-auto text-gray-500" />}
                      {forecast.condition === "Cloudy" && <CloudRain className="h-6 w-6 mx-auto text-gray-600" />}
                      {forecast.condition === "Light Rain" && <CloudRain className="h-6 w-6 mx-auto text-blue-500" />}
                    </div>
                    <div className="text-sm font-medium">{forecast.temp}</div>
                    <div className="text-xs text-muted-foreground">{forecast.wind}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Coastal Conditions */}
          <Card>
            <CardHeader>
              <CardTitle>Coastal Conditions</CardTitle>
              <CardDescription>Current sea conditions by location</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockCoastalConditions.map((condition) => (
                  <div key={condition.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-blue-500" />
                        <h3 className="font-medium">{condition.location}</h3>
                      </div>
                      <Badge 
                        variant={condition.fishingSafety === "safe" ? "default" : condition.fishingSafety === "caution" ? "secondary" : "destructive"}
                        className={getFishingSafetyColor(condition.fishingSafety)}
                      >
                        {condition.fishingSafety.toUpperCase()}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Waves className="h-4 w-4 text-blue-500" />
                        <div>
                          <div className="text-muted-foreground">Sea Level</div>
                          <div className="font-medium">{condition.seaLevel}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Wind className="h-4 w-4 text-gray-500" />
                        <div>
                          <div className="text-muted-foreground">Wind</div>
                          <div className="font-medium">{condition.windSpeed}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-green-500" />
                        <div>
                          <div className="text-muted-foreground">Visibility</div>
                          <div className="font-medium">{condition.visibility}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Thermometer className="h-4 w-4 text-orange-500" />
                        <div>
                          <div className="text-muted-foreground">Temperature</div>
                          <div className="font-medium">{condition.temperature}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Wave Height:</span>
                        <span className="ml-1 font-medium">{condition.waveHeight}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Current:</span>
                        <span className="ml-1 font-medium capitalize">{condition.currentStrength}</span>
                      </div>
                    </div>
                    
                    <div className="mt-2 text-xs text-muted-foreground">
                      Last updated: {new Date(condition.lastUpdated).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Interactive Map with Real-Time Data */}
          <InteractiveMap height="h-96" />
          
          {/* Real-Time Location Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Navigation className="h-5 w-5 text-blue-500" />
                Location & Data Status
                {isConnected && (
                  <div className="flex items-center gap-1">
                    <Zap className="h-3 w-3 text-green-500" />
                    <span className="text-xs text-green-600 font-normal">LIVE</span>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Your Location</h4>
                  {userLocation ? (
                    <div className="text-sm space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-green-700">GPS Active</span>
                      </div>
                      <div className="text-muted-foreground">
                        Lat: {userLocation.latitude.toFixed(6)}
                      </div>
                      <div className="text-muted-foreground">
                        Lng: {userLocation.longitude.toFixed(6)}
                      </div>
                      <div className="text-muted-foreground">
                        Accuracy: ±{userLocation.accuracy}m
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        <span className="text-gray-600">Location not available</span>
                      </div>
                      <p className="text-muted-foreground text-xs">
                        Enable location access for personalized alerts
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Real-Time Data</h4>
                  <div className="text-sm space-y-1">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className={isConnected ? 'text-green-700' : 'text-red-700'}>
                        {isConnected ? 'Connected' : 'Disconnected'}
                      </span>
                    </div>
                    {lastUpdate && (
                      <div className="text-muted-foreground">
                        Last update: {new Date(lastUpdate).toLocaleTimeString()}
                      </div>
                    )}
                    {realTimeData && (
                      <div className="text-muted-foreground">
                        {realTimeData.alerts?.length || 0} alerts • {realTimeData.conditions?.length || 0} monitoring stations
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
