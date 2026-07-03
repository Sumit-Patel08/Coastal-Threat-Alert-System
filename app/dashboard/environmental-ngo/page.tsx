"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getClientAppSession } from "@/lib/auth/session"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Leaf, Satellite, AlertTriangle, TreePine, TrendingDown, Globe } from "lucide-react"
import Image from "next/image"
import { UrgentFloodAlert } from "@/components/alerts/urgent-flood-alert"
import { EnhancedSatelliteViewer } from "@/components/satellite/enhanced-satellite-viewer"
// import { PollutionAlertsSection } from "@/components/alerts/pollution-alerts-section"
import { BlueCarbonDetails } from "@/components/alerts/blue-carbon-details"
import { PollutionInvestigation } from "@/components/alerts/pollution-investigation"

export default function EnvironmentalNGODashboard() {
  const [selectedEcosystem, setSelectedEcosystem] = useState<string | null>(null)
  const [selectedPollutionAlert, setSelectedPollutionAlert] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const session = await getClientAppSession()

      if (!session) {
        router.push("/auth/login")
        return
      }

      if (session.role !== "environmental_ngo") {
        router.push("/dashboard")
        return
      }

      setUser(session.user)
      setProfile(session.profile)
      setLoading(false)
    }

    checkAuth()
  }, [router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (selectedEcosystem) {
    return (
      <BlueCarbonDetails 
        ecosystem={selectedEcosystem} 
        onBack={() => setSelectedEcosystem(null)} 
      />
    )
  }

  if (selectedPollutionAlert) {
    return (
      <PollutionInvestigation 
        alert={selectedPollutionAlert} 
        onBack={() => setSelectedPollutionAlert(null)} 
      />
    )
  }

  // Mock data for hackathon MVP
  const environmentalData = [
    { metric: "Mangrove Coverage", value: "4,500 km²", change: "+2.3%", status: "Improving" },
    { metric: "Carbon Sequestration", value: "2.8M tons CO2", change: "+1.8%", status: "Good" },
    { metric: "Water Quality Index", value: "72/100", change: "-3.2%", status: "Declining" },
    { metric: "Biodiversity Score", value: "8.4/10", change: "+0.5%", status: "Stable" },
  ]

  const pollutionAlerts = [
    { id: 1, type: "Algal Bloom", location: "Mumbai Coast", severity: "High", area: "15 km²" },
    { id: 2, type: "Plastic Pollution", location: "Chennai Coast", severity: "Medium", area: "8 km²" },
    { id: 3, type: "Oil Spill", location: "Kolkata Coast", severity: "Critical", area: "25 km²" },
    { id: 4, type: "Sewage Discharge", location: "Kochi Coast", severity: "Low", area: "3 km²" },
  ]

  const blueCarbonData = [
    { ecosystem: "Mangroves", carbonStock: "1,200 tons/ha", area: "3,200 km²", status: "Protected" },
    { ecosystem: "Salt Marshes", carbonStock: "800 tons/ha", area: "1,800 km²", status: "At Risk" },
    { ecosystem: "Seagrass Beds", carbonStock: "600 tons/ha", area: "2,100 km²", status: "Declining" },
    { ecosystem: "Tidal Flats", carbonStock: "400 tons/ha", area: "1,500 km²", status: "Stable" },
  ]

  return (
    <div className="flex-1 space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Environmental NGO Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor coastal ecosystems and environmental threats
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="satellite">Satellite Imagery</TabsTrigger>
          <TabsTrigger value="pollution">Pollution Alerts</TabsTrigger>
          <TabsTrigger value="blue-carbon">Blue Carbon</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Mangrove Coverage</CardTitle>
                <TreePine className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4,500 km²</div>
                <p className="text-xs text-muted-foreground text-green-600">+2.3% from last year</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Carbon Sequestration</CardTitle>
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2.8M tons</div>
                <p className="text-xs text-muted-foreground text-green-600">CO2 absorbed annually</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Water Quality</CardTitle>
                <Globe className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">72/100</div>
                <p className="text-xs text-muted-foreground text-red-600">-3.2% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8</div>
                <p className="text-xs text-muted-foreground">Environmental threats</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Environmental Metrics</CardTitle>
                <CardDescription>Key ecosystem health indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {environmentalData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{item.metric}</div>
                        <div className="text-sm text-muted-foreground">{item.value}</div>
                      </div>
                      <div className="text-right">
                        <Badge variant={item.status === "Improving" ? "default" : item.status === "Good" ? "default" : item.status === "Declining" ? "destructive" : "secondary"}>
                          {item.status}
                        </Badge>
                        <div className="text-xs text-muted-foreground mt-1">{item.change}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <UrgentFloodAlert />
          </div>
        </TabsContent>

        <TabsContent value="satellite" className="space-y-4">
          <EnhancedSatelliteViewer />
        </TabsContent>

        <TabsContent value="pollution" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Pollution Alerts
              </CardTitle>
              <CardDescription>Active pollution incidents requiring attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pollutionAlerts.map((alert) => (
                  <div key={alert.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold">{alert.type}</h3>
                      <Badge variant={alert.severity === "Critical" ? "destructive" : alert.severity === "High" ? "destructive" : alert.severity === "Medium" ? "secondary" : "default"}>
                        {alert.severity}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="font-medium">Location</div>
                        <div className="text-muted-foreground">{alert.location}</div>
                      </div>
                      <div>
                        <div className="font-medium">Affected Area</div>
                        <div className="text-muted-foreground">{alert.area}</div>
                      </div>
                    </div>
                    <div className="mt-3">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setSelectedPollutionAlert(alert)}
                      >
                        Investigate
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="blue-carbon" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Blue Carbon Ecosystems</CardTitle>
              <CardDescription>Coastal carbon sequestration and storage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {blueCarbonData.map((ecosystem, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold">{ecosystem.ecosystem}</h3>
                      <Badge variant={ecosystem.status === "Protected" ? "default" : ecosystem.status === "At Risk" ? "destructive" : ecosystem.status === "Declining" ? "destructive" : "secondary"}>
                        {ecosystem.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="font-medium">Carbon Stock</div>
                        <div className="text-muted-foreground">{ecosystem.carbonStock}</div>
                      </div>
                      <div>
                        <div className="font-medium">Total Area</div>
                        <div className="text-muted-foreground">{ecosystem.area}</div>
                      </div>
                    </div>
                    <div className="mt-3">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setSelectedEcosystem(ecosystem.ecosystem)}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">Blue Carbon Importance</h3>
                <p className="text-sm text-green-700">
                  Coastal ecosystems like mangroves, salt marshes, and seagrass beds are critical for carbon sequestration. 
                  They store up to 10x more carbon per hectare than terrestrial forests and help mitigate climate change.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
