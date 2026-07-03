"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Package, Truck, Home, Droplets, Utensils, Waves, Cloud, MapPin, Shield, TrendingUp, Activity, RefreshCw, Bot, Zap } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface RiskAssessment {
  id: string
  region: string
  risk_level: string
  sea_level: number
  cyclones: number
  pollution: string
  algal_blooms: string
  illegal_activities: string
  population_density: number
  created_at: string
  updated_at: string
}

interface AlertLog {
  id: string
  type: string
  severity: string
  location: string
  description: string
  source: string
  created_at: string
  updated_at: string
}

interface Resource {
  id: string
  name: string
  type: string
  quantity: number
  available: number
  status: string
}

export function useAutomatedCoastalSystem() {
  const [riskAssessments, setRiskAssessments] = useState<RiskAssessment[]>([])
  const [alertLogs, setAlertLogs] = useState<AlertLog[]>([])
  const [selectedCity, setSelectedCity] = useState('Mumbai')
  const [aiAnalysisRunning, setAiAnalysisRunning] = useState(false)
  const [resources, setResources] = useState<Resource[]>([
    { id: "1", name: "Emergency Boats", type: "rescue", quantity: 15, available: 12, status: "good" },
    { id: "2", name: "Ambulances", type: "medical", quantity: 8, available: 6, status: "good" },
    { id: "3", name: "Emergency Shelters", type: "shelter", quantity: 25, available: 18, status: "low" },
    { id: "4", name: "Food Supplies (tons)", type: "food", quantity: 50, available: 35, status: "good" },
    { id: "5", name: "Water Supplies (liters)", type: "water", quantity: 10000, available: 7500, status: "good" }
  ])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const supabase = createClient()

  useEffect(() => {
    fetchData()
    startAutomatedAnalysis()
  }, [selectedCity])

  useEffect(() => {
    const interval = setInterval(() => {
      if (!aiAnalysisRunning) {
        runAIAnalysis()
      }
    }, 30000) // Run AI analysis every 30 seconds
    
    return () => clearInterval(interval)
  }, [selectedCity, aiAnalysisRunning])

  const fetchData = async () => {
    try {
      const [risks, alerts] = await Promise.all([
        supabase.from('risk_assessments').select('*').ilike('region', `%${selectedCity}%`).order('created_at', { ascending: false }),
        supabase.from('alert_logs').select('*').ilike('location', `%${selectedCity}%`).order('created_at', { ascending: false })
      ])

      if (risks.data) setRiskAssessments(risks.data)
      if (alerts.data) setAlertLogs(alerts.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const startAutomatedAnalysis = async () => {
    // Uses 30-minute server cache unless refresh=true is passed
    await fetch(`/api/weather?city=${selectedCity}`)

    // Run AI analysis
    await runAIAnalysis()
  }

  const runAIAnalysis = async () => {
    if (aiAnalysisRunning) return
    
    setAiAnalysisRunning(true)
    try {
      const response = await fetch('/api/ai-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city: selectedCity })
      })
      
      if (response.ok) {
        const result = await response.json()
        toast({ 
          title: "🤖 AI Analysis Complete", 
          description: `Auto-generated ${result.alerts?.length || 0} alerts for ${selectedCity}` 
        })
        fetchData() // Refresh data after AI analysis
      }
    } catch (error) {
      console.error('AI analysis failed:', error)
    } finally {
      setAiAnalysisRunning(false)
    }
  }

  const updateResource = (id: string, field: string, value: number) => {
    setResources(prev => prev.map(resource => 
      resource.id === id 
        ? { 
            ...resource, 
            [field]: value,
            status: field === 'available' && value < resource.quantity * 0.3 ? 'low' : 'good'
          }
        : resource
    ))
  }

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'rescue': return <Package className="h-4 w-4" />
      case 'medical': return <Truck className="h-4 w-4" />
      case 'shelter': return <Home className="h-4 w-4" />
      case 'water': return <Droplets className="h-4 w-4" />
      case 'food': return <Utensils className="h-4 w-4" />
      default: return <Package className="h-4 w-4" />
    }
  }

  return {
    riskAssessments, alertLogs, resources, loading, selectedCity, setSelectedCity,
    aiAnalysisRunning, runAIAnalysis, updateResource, getResourceIcon, fetchData
  }
}

export function CitySelector() {
  const { selectedCity, setSelectedCity, aiAnalysisRunning, runAIAnalysis } = useAutomatedCoastalSystem()

  const cities = ['Mumbai', 'Chennai', 'Kolkata', 'Goa', 'Kochi', 'Visakhapatnam', 'Mangalore']

  return (
    <div className="flex items-center gap-4 mb-6">
      <div className="flex items-center gap-2">
        <MapPin className="h-5 w-5" />
        <span className="font-medium">Select City:</span>
      </div>
      <Select value={selectedCity} onValueChange={setSelectedCity}>
        <SelectTrigger className="w-48">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {cities.map(city => (
            <SelectItem key={city} value={city}>{city}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button 
        onClick={runAIAnalysis} 
        disabled={aiAnalysisRunning}
        className="flex items-center gap-2"
      >
        {aiAnalysisRunning ? (
          <RefreshCw className="h-4 w-4 animate-spin" />
        ) : (
          <Bot className="h-4 w-4" />
        )}
        {aiAnalysisRunning ? 'AI Analyzing...' : 'Run AI Analysis'}
      </Button>
    </div>
  )
}

export function CoastalThreatOverview() {
  const { resources, updateResource, getResourceIcon } = useAutomatedCoastalSystem()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Coastal Threat Overview
        </CardTitle>
        <CardDescription>AI-powered real-time threat monitoring and resource status</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              AI Threat Indicators
            </h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 border rounded">
                <div className="flex items-center gap-2">
                  <Waves className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Sea Level (AI)</span>
                </div>
                <Badge variant="secondary">+2.3m</Badge>
              </div>
              <div className="flex items-center justify-between p-2 border rounded">
                <div className="flex items-center gap-2">
                  <Cloud className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Storm Activity (AI)</span>
                </div>
                <Badge variant="default">Moderate</Badge>
              </div>
              <div className="flex items-center justify-between p-2 border rounded">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-red-500" />
                  <span className="text-sm">Pollution Level (AI)</span>
                </div>
                <Badge variant="destructive">High</Badge>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <h4 className="font-medium">Emergency Resources</h4>
            <div className="space-y-2">
              {resources.slice(0, 3).map((resource) => (
                <div key={resource.id} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-2">
                    {getResourceIcon(resource.type)}
                    <span className="text-sm">{resource.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={resource.status === 'good' ? 'secondary' : 'destructive'}>
                      {resource.available}/{resource.quantity}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateResource(resource.id, 'available', resource.available + 1)}
                    >
                      +
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function ResourceManagementCard() {
  const { resources, updateResource, getResourceIcon } = useAutomatedCoastalSystem()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Resource Management
        </CardTitle>
        <CardDescription>Emergency resource allocation and availability</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {resources.map((resource) => (
            <div key={resource.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                {getResourceIcon(resource.type)}
                <div>
                  <div className="font-medium">{resource.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {resource.available} of {resource.quantity} available
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={resource.status === 'good' ? 'secondary' : 'destructive'}>
                  {resource.status === 'good' ? 'Good' : 'Low'}
                </Badge>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateResource(resource.id, 'available', Math.max(0, resource.available - 1))}
                  >
                    -
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateResource(resource.id, 'available', Math.min(resource.quantity, resource.available + 1))}
                  >
                    +
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function AIRiskAssessmentTab() {
  const { riskAssessments, loading, selectedCity } = useAutomatedCoastalSystem()

  if (loading) {
    return <div className="flex items-center justify-center h-64">
      <RefreshCw className="h-6 w-6 animate-spin mr-2" />
      Loading AI-generated risk assessments...
    </div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Bot className="h-5 w-5 text-blue-500" />
            AI-Generated Risk Assessments for {selectedCity}
          </h3>
          <p className="text-sm text-muted-foreground">
            Automatically generated from sensor data, satellite feeds, and AI analysis
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-1">
          <Zap className="h-3 w-3" />
          Fully Automated
        </Badge>
      </div>

      <div className="grid gap-4">
        {riskAssessments.length > 0 ? riskAssessments.map((risk) => (
          <Card key={risk.id} className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Bot className="h-4 w-4 text-blue-500" />
                    <h4 className="font-medium">{risk.region}</h4>
                    <Badge variant={risk.risk_level === "High" ? "destructive" : risk.risk_level === "Medium" ? "default" : "secondary"}>
                      {risk.risk_level} Risk
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground grid grid-cols-2 gap-4">
                    <span className="flex items-center gap-1">
                      <Waves className="h-3 w-3" /> Sea Level: +{risk.sea_level}m
                    </span>
                    <span className="flex items-center gap-1">
                      <Cloud className="h-3 w-3" /> Cyclones: {risk.cyclones}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> Pollution: {risk.pollution}
                    </span>
                    <span className="flex items-center gap-1">
                      <Droplets className="h-3 w-3" /> Algal Blooms: {risk.algal_blooms}
                    </span>
                    <span className="flex items-center gap-1">
                      <Shield className="h-3 w-3" /> Illegal Activities: {risk.illegal_activities}
                    </span>
                    <span className="flex items-center gap-1">
                      <Activity className="h-3 w-3" /> Population: {risk.population_density}/km²
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    AI Generated: {new Date(risk.created_at).toLocaleString()}
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="mb-2">
                    AI Automated
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )) : (
          <Card className="border-dashed">
            <CardContent className="p-8 text-center">
              <Bot className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h4 className="font-medium mb-2">No AI Risk Assessments Yet</h4>
              <p className="text-sm text-muted-foreground mb-4">
                AI is analyzing sensor data for {selectedCity}. Risk assessments will appear automatically.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export function AIAlertLogsTab() {
  const { alertLogs, loading, selectedCity } = useAutomatedCoastalSystem()

  if (loading) {
    return <div className="flex items-center justify-center h-64">
      <RefreshCw className="h-6 w-6 animate-spin mr-2" />
      Loading AI-generated alerts...
    </div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Bot className="h-5 w-5 text-red-500" />
            AI-Generated Alert Logs for {selectedCity}
          </h3>
          <p className="text-sm text-muted-foreground">
            Automatically triggered by AI analysis of sensor data and satellite feeds
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-1">
          <Zap className="h-3 w-3" />
          Fully Automated
        </Badge>
      </div>

      <div className="grid gap-4">
        {alertLogs.length > 0 ? alertLogs.map((alert) => (
          <Card key={alert.id} className="border-l-4 border-l-red-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Bot className="h-4 w-4 text-red-500" />
                    <h4 className="font-medium">{alert.type}</h4>
                    <Badge variant={alert.severity === "Critical" ? "destructive" : alert.severity === "High" ? "default" : "secondary"}>
                      {alert.severity}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {alert.source}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium">{alert.location}</p>
                  <p className="text-sm text-muted-foreground">{alert.description}</p>
                  <div className="text-xs text-muted-foreground">
                    AI Generated: {new Date(alert.created_at).toLocaleString()}
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="mb-2">
                    Auto-Generated
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )) : (
          <Card className="border-dashed">
            <CardContent className="p-8 text-center">
              <Bot className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h4 className="font-medium mb-2">No AI Alerts Yet</h4>
              <p className="text-sm text-muted-foreground mb-4">
                AI is monitoring {selectedCity} for threats. Alerts will appear automatically when detected.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export function HistoricalTrendsTab() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Sea Level Trends</CardTitle>
          <CardDescription>AI-analyzed monthly sea level changes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg">
            <div className="text-center">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-muted-foreground">Chart.js integration ready</p>
              <p className="text-sm text-muted-foreground">AI-processed sea level trend data</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Cyclone Frequency</CardTitle>
          <CardDescription>AI-predicted seasonal cyclone patterns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg">
            <div className="text-center">
              <Activity className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-muted-foreground">Recharts integration ready</p>
              <p className="text-sm text-muted-foreground">AI-analyzed cyclone frequency data</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Pollution Incidents</CardTitle>
          <CardDescription>AI-detected chemical and algal bloom patterns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg">
            <div className="text-center">
              <Droplets className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-muted-foreground">AI pollution trend analysis</p>
              <p className="text-sm text-muted-foreground">Automated environmental monitoring</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Coastal Erosion</CardTitle>
          <CardDescription>AI-analyzed satellite imagery patterns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg">
            <div className="text-center">
              <MapPin className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-muted-foreground">AI erosion pattern analysis</p>
              <p className="text-sm text-muted-foreground">Satellite imagery AI processing</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
