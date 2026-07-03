import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertTriangle, TrendingUp, Map, Bell, Activity } from "lucide-react"
import { AIAlertLogs } from "@/components/alerts/ai-alert-logs"
import { HistoricalTrendsCharts } from "@/components/charts/historical-trends-charts"
import { requireServerRole } from "@/lib/auth/session.server"

export default async function DisasterManagementDashboard() {
  await requireServerRole("disaster_management")

  // Mock data for hackathon MVP
  const riskData = [
    { region: "Mumbai Coast", risk: "High", seaLevel: "+2.3m", cyclones: 3, pollution: "Moderate" },
    { region: "Chennai Coast", risk: "Medium", seaLevel: "+1.8m", cyclones: 2, pollution: "High" },
    { region: "Kolkata Coast", risk: "High", seaLevel: "+2.1m", cyclones: 4, pollution: "Moderate" },
    { region: "Kochi Coast", risk: "Low", seaLevel: "+1.2m", cyclones: 1, pollution: "Low" },
  ]

  const recentAlerts = [
    { id: 1, type: "Sea Level Rise", severity: "High", location: "Mumbai Coast", time: "2 hours ago" },
    { id: 2, type: "Cyclone Warning", severity: "Critical", location: "Chennai Coast", time: "4 hours ago" },
    { id: 3, type: "Pollution Alert", severity: "Medium", location: "Kolkata Coast", time: "6 hours ago" },
  ]

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Disaster Management Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor coastal ecosystems and environmental conservation efforts
          </p>
        </div>
        <Button>
          <Bell className="mr-2 h-4 w-4" />
          View All Alerts
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="risk-assessment">Risk Assessment</TabsTrigger>
          <TabsTrigger value="alerts">Alert Logs</TabsTrigger>
          <TabsTrigger value="trends">Historical Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">+2 from yesterday</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">High Risk Zones</CardTitle>
                <Map className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground">Mumbai, Chennai, Kolkata</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Sea Level</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+1.9m</div>
                <p className="text-xs text-muted-foreground">+0.3m from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cyclone Count</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">10</div>
                <p className="text-xs text-muted-foreground">This season</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Alerts</CardTitle>
                <CardDescription>Latest threat notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentAlerts.map((alert) => (
                    <div key={alert.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{alert.type}</div>
                        <div className="text-sm text-muted-foreground">{alert.location}</div>
                      </div>
                      <div className="text-right">
                        <Badge variant={alert.severity === "Critical" ? "destructive" : alert.severity === "High" ? "default" : "secondary"}>
                          {alert.severity}
                        </Badge>
                        <div className="text-xs text-muted-foreground mt-1">{alert.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

          </div>
        </TabsContent>

        <TabsContent value="risk-assessment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Coastal Risk Assessment</CardTitle>
              <CardDescription>Risk levels by coastal region</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {riskData.map((region, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">{region.region}</div>
                      <div className="text-sm text-muted-foreground">
                        Sea Level: {region.seaLevel} | Cyclones: {region.cyclones} | Pollution: {region.pollution}
                      </div>
                    </div>
                    <Badge variant={region.risk === "High" ? "destructive" : region.risk === "Medium" ? "default" : "secondary"}>
                      {region.risk} Risk
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <AIAlertLogs />
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <HistoricalTrendsCharts />
        </TabsContent>
      </Tabs>
    </div>
  )
}
