"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertTriangle, TrendingUp, Map, Activity } from "lucide-react"
import {
  CoastalThreatOverview,
  RiskAssessmentTab,
  AlertLogsTab,
  useCoastalThreatData,
  AIAnalysisResults
} from "./components"
import { HistoricalTrendsTab } from "./historical-trends"
import { CitySelector } from "./city-selector"
import { AlertsDropdown } from "./alerts-dropdown"
import { ResourceManagementCard } from "./resource-management"

export function DashboardClient() {
  const {
    riskAssessments,
    alertLogs,
    loading,
    selectedCity,
    setSelectedCity,
    coastalCities,
    aiAnalysisRunning,
    runAIAnalysis,
    resources,
    updateResource,
    getResourceIcon,
    isEditMode,
    setIsEditMode,
    passwordInput,
    setPasswordInput,
    showPasswordDialog,
    setShowPasswordDialog,
    handlePasswordSubmit,
    lastAnalysisResult
  } = useCoastalThreatData()

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading dashboard...</div>
  }

  // Get city-specific metrics
  const getCitySpecificMetrics = (city: string) => {
    const cityMetrics: Record<string, any> = {
      'Mumbai': { baseAlerts: 8, baseRiskZones: 3, baseSeaLevel: 2.4, baseCyclones: 4 },
      'Chennai': { baseAlerts: 6, baseRiskZones: 2, baseSeaLevel: 1.8, baseCyclones: 6 },
      'Kolkata': { baseAlerts: 5, baseRiskZones: 2, baseSeaLevel: 1.5, baseCyclones: 2 },
      'Kochi': { baseAlerts: 4, baseRiskZones: 1, baseSeaLevel: 1.2, baseCyclones: 3 },
      'Goa': { baseAlerts: 3, baseRiskZones: 1, baseSeaLevel: 0.9, baseCyclones: 1 },
      'Visakhapatnam': { baseAlerts: 5, baseRiskZones: 2, baseSeaLevel: 1.6, baseCyclones: 3 },
      'Surat': { baseAlerts: 7, baseRiskZones: 3, baseSeaLevel: 1.9, baseCyclones: 2 },
      'Mangalore': { baseAlerts: 4, baseRiskZones: 1, baseSeaLevel: 1.3, baseCyclones: 2 },
      'Puducherry': { baseAlerts: 3, baseRiskZones: 1, baseSeaLevel: 1.1, baseCyclones: 2 },
      'Thiruvananthapuram': { baseAlerts: 3, baseRiskZones: 1, baseSeaLevel: 0.8, baseCyclones: 1 },
      'Bhubaneswar': { baseAlerts: 4, baseRiskZones: 2, baseSeaLevel: 1.4, baseCyclones: 3 },
      'Porbandar': { baseAlerts: 2, baseRiskZones: 1, baseSeaLevel: 0.7, baseCyclones: 1 },
      'Dwarka': { baseAlerts: 2, baseRiskZones: 1, baseSeaLevel: 0.6, baseCyclones: 1 },
      'Okha': { baseAlerts: 2, baseRiskZones: 1, baseSeaLevel: 0.8, baseCyclones: 1 }
    }
    
    return cityMetrics[city] || cityMetrics['Mumbai']
  }

  const cityMetrics = getCitySpecificMetrics(selectedCity)
  
  // Use city-specific base metrics, but allow AI analysis to override if available
  const activeAlerts = alertLogs?.filter(alert => alert.severity === 'Critical' || alert.severity === 'High').length || cityMetrics.baseAlerts
  const highRiskZones = riskAssessments?.filter(r => r.risk_level === 'High').length || cityMetrics.baseRiskZones
  const avgSeaLevel = riskAssessments?.length 
    ? (riskAssessments.reduce((sum, r) => sum + r.sea_level, 0) / riskAssessments.length).toFixed(1)
    : cityMetrics.baseSeaLevel.toFixed(1)
  const totalCyclones = riskAssessments?.reduce((sum, r) => sum + r.cyclones, 0) || cityMetrics.baseCyclones

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Disaster Management Dashboard</h1>
          <p className="text-muted-foreground">
            Coastal environmental monitoring and conservation management for <span className="font-semibold text-blue-600">{selectedCity}</span>
          </p>
        </div>
        <AlertsDropdown />
      </div>

      <CitySelector 
        selectedCity={selectedCity}
        setSelectedCity={setSelectedCity}
        coastalCities={coastalCities}
        aiAnalysisRunning={aiAnalysisRunning}
        runAIAnalysis={runAIAnalysis}
      />

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
                <div className="text-2xl font-bold">{activeAlerts}</div>
                <p className="text-xs text-muted-foreground">
                  Critical & High severity for {selectedCity}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">High Risk Zones</CardTitle>
                <Map className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{highRiskZones}</div>
                <p className="text-xs text-muted-foreground">
                  {selectedCity} regions requiring attention
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Sea Level</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{avgSeaLevel}m</div>
                <p className="text-xs text-muted-foreground">
                  {selectedCity} above normal levels
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Storm Systems</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalCyclones}</div>
                <p className="text-xs text-muted-foreground">
                  {selectedCity} tracked cyclones
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Alerts</CardTitle>
                <CardDescription>Latest threat notifications for <span className="font-semibold text-blue-600">{selectedCity}</span></CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {alertLogs?.slice(0, 5).map((alert) => (
                    <div key={alert.id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <div className="font-medium text-sm">{alert.type}</div>
                        <div className="text-xs text-muted-foreground">{alert.location}</div>
                      </div>
                      <Badge variant={
                        alert.severity === 'Critical' ? 'destructive' : 
                        alert.severity === 'High' ? 'destructive' : 
                        alert.severity === 'Medium' ? 'secondary' : 'outline'
                      }>
                        {alert.severity}
                      </Badge>
                    </div>
                  )) || (
                    <div className="text-center text-muted-foreground py-4">
                      No recent alerts
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <CoastalThreatOverview />
          </div>
          
          {/* AI Analysis Results */}
          {lastAnalysisResult && (
            <AIAnalysisResults analysisResult={lastAnalysisResult} />
          )}
          
          <ResourceManagementCard 
            resources={resources}
            updateResource={updateResource}
            getResourceIcon={getResourceIcon}
            isEditMode={isEditMode}
            setIsEditMode={setIsEditMode}
            passwordInput={passwordInput}
            setPasswordInput={setPasswordInput}
            showPasswordDialog={showPasswordDialog}
            setShowPasswordDialog={setShowPasswordDialog}
            handlePasswordSubmit={handlePasswordSubmit}
          />
        </TabsContent>

        <TabsContent value="risk-assessment" className="space-y-4">
          <RiskAssessmentTab />
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <AlertLogsTab />
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <HistoricalTrendsTab selectedCity={selectedCity} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
