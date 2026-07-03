"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Building2, MapPin, FileText, TrendingUp, Shield, Users, AlertTriangle, Factory, Waves, Camera, CheckCircle2, XCircle, Clock, Zap, Eye, Phone } from "lucide-react"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { getClientAppSession } from "@/lib/auth/session"

export default function CoastalGovernmentDashboard() {
  const { toast } = useToast()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [selectedAlert, setSelectedAlert] = useState<any>(null)
  const [processingAlert, setProcessingAlert] = useState<number | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      const session = await getClientAppSession()

      if (!session) {
        router.push("/auth/login")
        return
      }

      if (session.role !== "coastal_government") {
        router.push("/dashboard")
        return
      }

      setUser(session.user)
      setIsLoading(false)
    }

    checkAuth()
  }, [router])

  // Handler functions
  const handleAlertAction = async (alert: any, action: string) => {
    setProcessingAlert(alert.id)
    
    toast({
      title: `${action} Initiated`,
      description: `${action} for ${alert.type} in ${alert.location}. Government response activated.`,
    })

    setTimeout(() => {
      setProcessingAlert(null)
      toast({
        title: `${action} Completed`,
        description: `${alert.type} response successfully coordinated. Monitoring continues.`,
        variant: "default",
      })
    }, 2500)
  }

  // Mock data for coastal city government
  const infrastructureAlerts = [
    { 
      id: 1, 
      type: "Port Infrastructure Risk", 
      location: "Mumbai Port", 
      affected: "Container Terminal 2", 
      severity: "Critical", 
      status: "Active",
      infrastructure: "Port Cranes & Loading Docks",
      estimatedDamage: "₹50 Cr"
    },
    { 
      id: 2, 
      type: "Bridge Structural Alert", 
      location: "Bandra-Worli Sea Link", 
      affected: "Main Support Cables", 
      severity: "High", 
      status: "Monitoring",
      infrastructure: "Cable-stayed Bridge",
      estimatedDamage: "₹25 Cr"
    },
    { 
      id: 3, 
      type: "Coastal Road Erosion", 
      location: "Marine Drive", 
      affected: "2.5km stretch", 
      severity: "Medium", 
      status: "Active",
      infrastructure: "Coastal Highway",
      estimatedDamage: "₹15 Cr"
    },
    { 
      id: 4, 
      type: "Power Station Flood Risk", 
      location: "Trombay Power Plant", 
      affected: "Cooling Systems", 
      severity: "High", 
      status: "Monitoring",
      infrastructure: "Thermal Power Station",
      estimatedDamage: "₹75 Cr"
    }
  ]

  const pollutionAlerts = [
    { 
      id: 1, 
      type: "Oil Spill Detection", 
      location: "Jawaharlal Nehru Port", 
      affected: "Marine Ecosystem", 
      severity: "Critical", 
      status: "Active",
      source: "Cargo Vessel",
      area: "15 sq km",
      estimatedCleanup: "₹30 Cr"
    },
    { 
      id: 2, 
      type: "Chemical Leak Alert", 
      location: "ONGC Refinery", 
      affected: "Coastal Waters", 
      severity: "High", 
      status: "Monitoring",
      source: "Industrial Facility",
      area: "8 sq km",
      estimatedCleanup: "₹20 Cr"
    },
    { 
      id: 3, 
      type: "Illegal Sand Mining", 
      location: "Versova Beach", 
      affected: "Beach Ecosystem", 
      severity: "Medium", 
      status: "Active",
      source: "Unauthorized Mining",
      area: "3 sq km",
      estimatedCleanup: "₹5 Cr"
    }
  ]

  const touristSafetyAlerts = [
    { 
      id: 1, 
      type: "Dangerous Rip Currents", 
      location: "Juhu Beach", 
      affected: "Swimming Areas", 
      severity: "Critical", 
      status: "Active",
      conditions: "Strong Offshore Winds",
      visibility: "Poor (2km)",
      touristsAffected: "500+"
    },
    { 
      id: 2, 
      type: "Beach Closure Warning", 
      location: "Chowpatty Beach", 
      affected: "Main Tourist Zone", 
      severity: "High", 
      status: "Active",
      conditions: "High Pollution Levels",
      visibility: "Moderate (5km)",
      touristsAffected: "200+"
    },
    { 
      id: 3, 
      type: "Unsafe Swimming Conditions", 
      location: "Aksa Beach", 
      affected: "North Section", 
      severity: "Medium", 
      status: "Monitoring",
      conditions: "Moderate Waves",
      visibility: "Good (8km)",
      touristsAffected: "100+"
    }
  ]

  const cityStats = [
    { city: "Mumbai", population: "20.4M", infrastructureAlerts: 2, pollutionAlerts: 1, touristAlerts: 1, totalBudget: "₹2,500 Cr" },
    { city: "Chennai", population: "11.2M", infrastructureAlerts: 1, pollutionAlerts: 1, touristAlerts: 1, totalBudget: "₹1,800 Cr" },
    { city: "Kolkata", population: "14.8M", infrastructureAlerts: 1, pollutionAlerts: 1, touristAlerts: 1, totalBudget: "₹2,100 Cr" },
    { city: "Kochi", population: "2.1M", infrastructureAlerts: 1, pollutionAlerts: 1, touristAlerts: 1, totalBudget: "₹800 Cr" },
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
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Coastal City Government
              </h1>
              <p className="text-muted-foreground">
                Infrastructure protection, pollution control & tourist safety management
              </p>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="infrastructure">Infrastructure Protection</TabsTrigger>
          <TabsTrigger value="pollution">Pollution Control</TabsTrigger>
          <TabsTrigger value="tourism">Tourist Safety</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Infrastructure Alerts</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{infrastructureAlerts.filter(a => a.status === 'Active').length}</div>
                <p className="text-xs text-muted-foreground">Active infrastructure threats</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pollution Incidents</CardTitle>
                <Factory className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pollutionAlerts.filter(a => a.status === 'Active').length}</div>
                <p className="text-xs text-muted-foreground">Environmental threats</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tourist Safety</CardTitle>
                <Camera className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{touristSafetyAlerts.filter(a => a.status === 'Active').length}</div>
                <p className="text-xs text-muted-foreground">Beach safety alerts</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Cities</CardTitle>
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4</div>
                <p className="text-xs text-muted-foreground">Coastal cities monitored</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-blue-500" />
                  City Alert Summary
                </CardTitle>
                <CardDescription>Real-time status across all coastal cities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cityStats.map((city: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <div>
                          <div className="font-semibold">{city.city}</div>
                          <div className="text-sm text-muted-foreground">Population: {city.population} • Budget: {city.totalBudget}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="text-center">
                          <div className="font-medium text-blue-600">{city.infrastructureAlerts}</div>
                          <div className="text-xs text-muted-foreground">Infrastructure</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-green-600">{city.pollutionAlerts}</div>
                          <div className="text-xs text-muted-foreground">Pollution</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-orange-600">{city.touristAlerts}</div>
                          <div className="text-xs text-muted-foreground">Tourist</div>
                        </div>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="infrastructure" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-500" />
                Infrastructure Protection Alerts
              </CardTitle>
              <CardDescription>Early warnings for ports, bridges, coastal roads, and power stations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {infrastructureAlerts.map((alert: any) => (
                  <div key={alert.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold">{alert.type}</h3>
                        <div className="text-sm text-muted-foreground">{alert.location} • {alert.affected}</div>
                        <div className="text-sm text-blue-600 mt-1">Infrastructure: {alert.infrastructure}</div>
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
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="destructive"
                        disabled={processingAlert === alert.id}
                        onClick={() => handleAlertAction(alert, "Secure Infrastructure")}
                      >
                        {processingAlert === alert.id ? "Processing..." : "Secure Infrastructure"}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setSelectedAlert(alert)}>
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pollution" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Factory className="h-5 w-5 text-green-500" />
                Pollution & Illegal Activities Control
              </CardTitle>
              <CardDescription>Monitor oil spills, chemical leaks, and illegal activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pollutionAlerts.map((alert: any) => (
                  <div key={alert.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold">{alert.type}</h3>
                        <div className="text-sm text-muted-foreground">{alert.location} • {alert.affected}</div>
                        <div className="text-sm text-green-600 mt-1">Source: {alert.source} • Area: {alert.area}</div>
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
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="destructive"
                        disabled={processingAlert === alert.id}
                        onClick={() => handleAlertAction(alert, "Environmental Response")}
                      >
                        {processingAlert === alert.id ? "Processing..." : "Environmental Response"}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setSelectedAlert(alert)}>
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tourism" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-orange-500" />
                Tourist & Beach Safety
              </CardTitle>
              <CardDescription>Ensure visitor safety and protect city reputation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {touristSafetyAlerts.map((alert: any) => (
                  <div key={alert.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold">{alert.type}</h3>
                        <div className="text-sm text-muted-foreground">{alert.location} • {alert.affected}</div>
                        <div className="text-sm text-orange-600 mt-1">Conditions: {alert.conditions} • Visibility: {alert.visibility}</div>
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
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="destructive"
                        disabled={processingAlert === alert.id}
                        onClick={() => handleAlertAction(alert, "Tourist Safety Response")}
                      >
                        {processingAlert === alert.id ? "Processing..." : "Tourist Safety Response"}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setSelectedAlert(alert)}>
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Alert Detail Dialog */}
      <Dialog open={!!selectedAlert} onOpenChange={() => setSelectedAlert(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Alert Details
            </DialogTitle>
          </DialogHeader>
          {selectedAlert && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-lg">{selectedAlert.type}</h3>
                  <p className="text-muted-foreground">{selectedAlert.location}</p>
                </div>
                <div className="flex gap-2 justify-end">
                  <Badge variant={selectedAlert.severity === "Critical" ? "destructive" : selectedAlert.severity === "High" ? "default" : "secondary"}>
                    {selectedAlert.severity}
                  </Badge>
                  <Badge variant={selectedAlert.status === "Active" ? "destructive" : selectedAlert.status === "Monitoring" ? "default" : "secondary"}>
                    {selectedAlert.status}
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">Affected Area</span>
                  </div>
                  <p className="text-sm text-muted-foreground pl-6">{selectedAlert.affected}</p>
                </div>
                
                {selectedAlert.infrastructure && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-blue-500" />
                      <span className="font-medium">Infrastructure</span>
                    </div>
                    <p className="text-sm text-muted-foreground pl-6">{selectedAlert.infrastructure}</p>
                  </div>
                )}
                
                {selectedAlert.source && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Factory className="h-4 w-4 text-green-500" />
                      <span className="font-medium">Source</span>
                    </div>
                    <p className="text-sm text-muted-foreground pl-6">{selectedAlert.source}</p>
                  </div>
                )}
                
                {selectedAlert.conditions && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Waves className="h-4 w-4 text-orange-500" />
                      <span className="font-medium">Conditions</span>
                    </div>
                    <p className="text-sm text-muted-foreground pl-6">{selectedAlert.conditions}</p>
                  </div>
                )}
                
                {selectedAlert.estimatedDamage && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-red-500" />
                      <span className="font-medium">Estimated Cost</span>
                    </div>
                    <p className="text-sm text-muted-foreground pl-6">{selectedAlert.estimatedDamage}</p>
                  </div>
                )}
                
                {selectedAlert.estimatedCleanup && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-red-500" />
                      <span className="font-medium">Cleanup Cost</span>
                    </div>
                    <p className="text-sm text-muted-foreground pl-6">{selectedAlert.estimatedCleanup}</p>
                  </div>
                )}
                
                {selectedAlert.area && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-blue-500" />
                      <span className="font-medium">Affected Area</span>
                    </div>
                    <p className="text-sm text-muted-foreground pl-6">{selectedAlert.area}</p>
                  </div>
                )}
                
                {selectedAlert.visibility && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">Visibility</span>
                    </div>
                    <p className="text-sm text-muted-foreground pl-6">{selectedAlert.visibility}</p>
                  </div>
                )}
                
                {selectedAlert.touristsAffected && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-orange-500" />
                      <span className="font-medium">Tourists Affected</span>
                    </div>
                    <p className="text-sm text-muted-foreground pl-6">{selectedAlert.touristsAffected}</p>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2 pt-4 border-t">
                <Button 
                  variant="destructive" 
                  disabled={processingAlert === selectedAlert.id}
                  onClick={() => {
                    const actionType = selectedAlert.infrastructure ? "Secure Infrastructure" : 
                                     selectedAlert.source ? "Environmental Response" : "Tourist Safety Response"
                    handleAlertAction(selectedAlert, actionType)
                    setSelectedAlert(null)
                  }}
                >
                  {processingAlert === selectedAlert.id ? "Processing..." : "Take Action"}
                </Button>
                <Button variant="outline" onClick={() => setSelectedAlert(null)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
