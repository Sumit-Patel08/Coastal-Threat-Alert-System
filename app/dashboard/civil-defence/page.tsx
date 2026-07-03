"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Shield, Users, MapPin, Phone, AlertTriangle, ClipboardList, Radio, Truck, Send, History, Activity, Settings, Bell, Zap, CheckCircle2, Clock, Target, Waves } from "lucide-react"
import { CivilDefenceAlertComposer } from "@/components/alerts/civil-defence-alert-composer"
import { AlertHistory } from "@/components/alerts/alert-history"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { getClientAppSession } from "@/lib/auth/session"

export default function CivilDefenceDashboard() {
  const { toast } = useToast()
  const router = useRouter()
  const [deployingAlert, setDeployingAlert] = useState<number | null>(null)
  const [selectedAlert, setSelectedAlert] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const checkAuth = async () => {
      const session = await getClientAppSession()

      if (!session) {
        router.push("/auth/login")
        return
      }

      if (session.role !== "civil_defence") {
        router.push("/dashboard")
        return
      }

      setUser(session.user)
      setIsLoading(false)
    }

    checkAuth()
  }, [router])

  // Handler functions for button functionality
  const handleDeployResponse = async (alert: any) => {
    setDeployingAlert(alert.id)
    
    if (alert.status === "Resolved") {
      // Reactivate resolved alert
      toast({
        title: "Reactivating Emergency Response",
        description: `Reactivating response protocols for ${alert.type} in ${alert.location}. Status changed to Active.`,
      })
      
      setTimeout(() => {
        setDeployingAlert(null)
        toast({
          title: "Alert Reactivated",
          description: `${alert.type} in ${alert.location} has been reactivated. Response teams are being notified.`,
          variant: "default",
        })
      }, 2000)
    } else {
      // Deploy response for active alerts
      toast({
        title: "Deploying Response Teams",
        description: `Initiating ${alert.severity === "Critical" ? "full" : alert.severity === "High" ? "enhanced" : "standard"} response for ${alert.type} in ${alert.location}`,
      })

      setTimeout(() => {
        setDeployingAlert(null)
        toast({
          title: "Response Teams Deployed",
          description: `Emergency response teams have been successfully deployed to ${alert.location}. ETA: 15-30 minutes.`,
          variant: "default",
        })
      }, 3000)
    }
  }

  const handleUpdateStatus = (alert: any) => {
    toast({
      title: "Status Update",
      description: `Status update initiated for ${alert.type} in ${alert.location}. Field teams will provide updates every 30 minutes.`,
    })
  }

  const getResponseActions = (alert: any) => {
    switch (alert.type) {
      case "Cyclone Warning":
        return "Immediate evacuation, shelter activation, emergency broadcasts"
      case "Flood Alert":
        return "Water rescue teams, sandbag deployment, traffic rerouting"
      case "Sea Level Rise":
        return "Coastal monitoring, barrier inspection, resident notifications"
      default:
        return "Standard emergency response protocols"
    }
  }

  // Mock data for hackathon MVP
  const emergencyAlerts = [
    { id: 1, type: "Cyclone Warning", severity: "Critical", location: "Chennai Coast", affected: "2.1M people", status: "Active" },
    { id: 2, type: "Flood Alert", severity: "High", location: "Mumbai Coast", affected: "1.8M people", status: "Monitoring" },
    { id: 3, type: "Sea Level Rise", severity: "Medium", location: "Kolkata Coast", affected: "1.2M people", status: "Resolved" },
  ]

  const preparednessChecklist = [
    { id: 1, item: "Emergency response vehicles fueled and ready", category: "Vehicles", completed: true },
    { id: 2, item: "Communication systems tested", category: "Communications", completed: true },
    { id: 3, item: "Emergency shelters inspected", category: "Shelters", completed: false },
    { id: 4, item: "Medical supplies restocked", category: "Medical", completed: true },
    { id: 5, item: "Evacuation routes verified", category: "Routes", completed: false },
    { id: 6, item: "Team members briefed on protocols", category: "Personnel", completed: true },
  ]

  const teamStatus = [
    { team: "Search & Rescue", members: 12, status: "Ready", location: "HQ" },
    { team: "Medical Response", members: 8, status: "Deployed", location: "Chennai Coast" },
    { team: "Evacuation", members: 15, status: "Standby", location: "HQ" },
    { team: "Communication", members: 6, status: "Ready", location: "HQ" },
  ]

  const evacuationRoutes = [
    { id: 1, from: "Chennai Beach", to: "Chennai Central Station", capacity: "5,000 people", status: "Active" },
    { id: 2, from: "Mumbai Marine Drive", to: "Bandra Station", capacity: "8,000 people", status: "Active" },
    { id: 3, from: "Kolkata Beach", to: "Howrah Station", capacity: "3,500 people", status: "Standby" },
  ]

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex-1 space-y-6 p-6 animate-in fade-in-0 duration-500">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Civil Defence Operations
              </h1>
              <p className="text-muted-foreground">
                Emergency coordination and disaster response management
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Status Banner */}
      {emergencyAlerts.some(alert => alert.severity === "Critical") && (
        <div className="bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-300 rounded-xl p-6 shadow-lg animate-pulse">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500 rounded-full animate-bounce">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-red-800 text-lg">CRITICAL EMERGENCY ACTIVE</span>
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
                </div>
                <p className="text-red-700 mt-1">
                  Active cyclone warning in Chennai Coast. All teams on high alert.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="alerts">Alert Management</TabsTrigger>
          <TabsTrigger value="operations">Operations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-xl transition-all duration-300 cursor-pointer group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-700">Active Teams</CardTitle>
                <div className="p-2 bg-blue-500 rounded-lg group-hover:scale-110 transition-transform duration-200">
                  <Users className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-800">4</div>
                <p className="text-xs text-blue-600 font-medium">Response teams ready</p>
                <div className="mt-2">
                  <Progress value={100} className="h-2" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100 hover:shadow-xl transition-all duration-300 cursor-pointer group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-700">Total Personnel</CardTitle>
                <div className="p-2 bg-green-500 rounded-lg group-hover:scale-110 transition-transform duration-200">
                  <Shield className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-800">41</div>
                <p className="text-xs text-green-600 font-medium">Civil defence members</p>
                <div className="mt-2">
                  <Progress value={85} className="h-2" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-red-100 hover:shadow-xl transition-all duration-300 cursor-pointer group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-red-700">Active Alerts</CardTitle>
                <div className="p-2 bg-red-500 rounded-lg group-hover:scale-110 transition-transform duration-200">
                  <AlertTriangle className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-800">3</div>
                <p className="text-xs text-red-600 font-medium">Emergency situations</p>
                <div className="mt-2">
                  <Progress value={60} className="h-2" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-xl transition-all duration-300 cursor-pointer group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-purple-700">Evacuation Routes</CardTitle>
                <div className="p-2 bg-purple-500 rounded-lg group-hover:scale-110 transition-transform duration-200">
                  <MapPin className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-800">3</div>
                <p className="text-xs text-purple-600 font-medium">Active routes</p>
                <div className="mt-2">
                  <Progress value={100} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6">
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-500" />
                  Team Status
                </CardTitle>
                <CardDescription>Current deployment status of response teams</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-0">
                  {teamStatus.map((team, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border-b last:border-b-0 hover:bg-gray-50 transition-colors duration-200 group">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          team.status === "Ready" ? "bg-green-500 animate-pulse" :
                          team.status === "Deployed" ? "bg-red-500" : "bg-yellow-500"
                        }`}></div>
                        <div>
                          <div className="font-semibold group-hover:text-blue-600 transition-colors">{team.team}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {team.members} members • 
                            <MapPin className="h-3 w-3" />
                            {team.location}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={team.status === "Ready" ? "default" : team.status === "Deployed" ? "destructive" : "secondary"} className="font-medium">
                          {team.status}
                        </Badge>
                        <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <Target className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <CivilDefenceAlertComposer />
        </TabsContent>

        <TabsContent value="operations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Emergency Operations</CardTitle>
              <CardDescription>Active emergency situations and response status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {emergencyAlerts.map((alert) => (
                  <div key={alert.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold">{alert.type}</h3>
                        <div className="text-sm text-muted-foreground">{alert.location} • {alert.affected} affected</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={alert.severity === "Critical" ? "destructive" : alert.severity === "High" ? "default" : "secondary"}>
                          {alert.severity}
                        </Badge>
                        <Badge variant={alert.status === "Active" ? "destructive" : alert.status === "Monitoring" ? "default" : "secondary"}>
                          {alert.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="font-medium">Response Level</div>
                        <div className="text-muted-foreground">
                          {alert.severity === "Critical" ? "Full Response" : alert.severity === "High" ? "Enhanced Response" : "Standard Response"}
                        </div>
                      </div>
                      <div>
                        <div className="font-medium">Teams Deployed</div>
                        <div className="text-muted-foreground">
                          {alert.severity === "Critical" ? "All Teams" : alert.severity === "High" ? "3 Teams" : "1 Team"}
                        </div>
                      </div>
                      <div>
                        <div className="font-medium">Estimated Duration</div>
                        <div className="text-muted-foreground">
                          {alert.severity === "Critical" ? "24-48 hours" : alert.severity === "High" ? "12-24 hours" : "6-12 hours"}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button 
                        size="sm" 
                        variant="destructive"
                        disabled={deployingAlert === alert.id}
                        onClick={() => handleDeployResponse(alert)}
                      >
                        {deployingAlert === alert.id ? "Processing..." : "Deploy Response"}
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline" onClick={() => setSelectedAlert(alert)}>
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>{selectedAlert?.type} - Detailed Information</DialogTitle>
                          </DialogHeader>
                          {selectedAlert && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-semibold text-sm text-muted-foreground">Location</h4>
                                  <p className="text-lg">{selectedAlert.location}</p>
                                </div>
                                <div>
                                  <h4 className="font-semibold text-sm text-muted-foreground">Affected Population</h4>
                                  <p className="text-lg">{selectedAlert.affected}</p>
                                </div>
                                <div>
                                  <h4 className="font-semibold text-sm text-muted-foreground">Severity Level</h4>
                                  <Badge variant={selectedAlert.severity === "Critical" ? "destructive" : selectedAlert.severity === "High" ? "default" : "secondary"}>
                                    {selectedAlert.severity}
                                  </Badge>
                                </div>
                                <div>
                                  <h4 className="font-semibold text-sm text-muted-foreground">Current Status</h4>
                                  <Badge variant={selectedAlert.status === "Active" ? "destructive" : selectedAlert.status === "Monitoring" ? "default" : "secondary"}>
                                    {selectedAlert.status}
                                  </Badge>
                                </div>
                              </div>
                              <div>
                                <h4 className="font-semibold text-sm text-muted-foreground mb-2">Response Details</h4>
                                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                                  <p><strong>Response Level:</strong> {selectedAlert.severity === "Critical" ? "Full Response" : selectedAlert.severity === "High" ? "Enhanced Response" : "Standard Response"}</p>
                                  <p><strong>Teams Required:</strong> {selectedAlert.severity === "Critical" ? "All Available Teams" : selectedAlert.severity === "High" ? "3 Specialized Teams" : "1 Response Team"}</p>
                                  <p><strong>Estimated Duration:</strong> {selectedAlert.severity === "Critical" ? "24-48 hours" : selectedAlert.severity === "High" ? "12-24 hours" : "6-12 hours"}</p>
                                  <p><strong>Priority Actions:</strong> {getResponseActions(selectedAlert)}</p>
                                </div>
                              </div>
                              <div className="flex gap-2 pt-4">
                                <Button 
                                  variant="destructive"
                                  disabled={deployingAlert === selectedAlert?.id}
                                  onClick={() => handleDeployResponse(selectedAlert)}
                                  className="flex-1"
                                >
                                  {deployingAlert === selectedAlert?.id ? "Processing..." : "Deploy Emergency Response"}
                                </Button>
                                <Button variant="outline" onClick={() => handleUpdateStatus(selectedAlert)} className="flex-1">
                                  Update Status
                                </Button>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  )
}
