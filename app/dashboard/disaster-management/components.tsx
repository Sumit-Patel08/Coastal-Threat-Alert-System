"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Package, Truck, Home, Droplets, Utensils, Waves, Cloud, MapPin, Shield, TrendingUp, Activity, RefreshCw, Bot, Zap, Plus, Edit, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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

interface SensorData {
  id: string
  sensor_type: string
  location: string
  value: number
  unit: string
  timestamp: string
}

interface Resource {
  id: string
  name: string
  type: string
  quantity: number
  available: number
  status: string
}

export function useCoastalThreatData() {
  const [riskAssessments, setRiskAssessments] = useState<RiskAssessment[]>([])
  const [alertLogs, setAlertLogs] = useState<AlertLog[]>([])
  const [sensorData, setSensorData] = useState<SensorData[]>([])
  const [selectedCity, setSelectedCity] = useState('Mumbai')
  const [isEditMode, setIsEditMode] = useState(false)
  const [passwordInput, setPasswordInput] = useState('')
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  
  const coastalCities = [
    'Mumbai', 'Chennai', 'Kolkata', 'Kochi', 'Visakhapatnam', 'Goa', 'Mangalore', 
    'Puducherry', 'Thiruvananthapuram', 'Bhubaneswar', 'Surat', 'Porbandar', 'Dwarka', 'Okha'
  ]
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

  const [riskForm, setRiskForm] = useState({
    region: "",
    risk_level: "",
    sea_level: "",
    cyclones: "",
    pollution: "",
    algal_blooms: "",
    illegal_activities: "",
    population_density: ""
  })

  const [alertForm, setAlertForm] = useState({
    type: "",
    severity: "",
    location: "",
    description: "",
    source: ""
  })

  const [editingRisk, setEditingRisk] = useState<string | null>(null)
  const [editingAlert, setEditingAlert] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    // Clear all data when switching cities
    setRiskAssessments([])
    setAlertLogs([])
    setSensorData([])
    setLastAnalysisResult(null)
    
    // Fetch data for the new city
    fetchData()
    // Don't auto-run analysis when switching cities
  }, [selectedCity])

  // Removed automatic interval - AI analysis only runs when manually triggered

  const fetchData = async () => {
    try {
      // Only fetch data for the selected city
      const [risks, alerts, sensors] = await Promise.all([
        supabase.from('risk_assessments').select('*').eq('region', selectedCity).order('created_at', { ascending: false }),
        supabase.from('alert_logs').select('*').eq('location', selectedCity).order('created_at', { ascending: false }),
        supabase.from('sensor_data').select('*').eq('location', selectedCity).order('timestamp', { ascending: false }).limit(50)
      ])

      if (risks.data) setRiskAssessments(risks.data)
      if (alerts.data) setAlertLogs(alerts.data)
      if (sensors.data) setSensorData(sensors.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const startAutomatedAnalysis = async () => {
    // Uses 30-minute server cache unless refresh=true is passed
    await fetch(`/api/weather?city=${selectedCity}`)
    // AI analysis is now only triggered manually
  }

  const runAIAnalysis = async () => {
    if (aiAnalysisRunning) return
    
    setAiAnalysisRunning(true)
    
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000))
    
    try {
      // Generate fake AI analysis data for the selected city
      const analysisResult = generateFakeAIAnalysis(selectedCity)
      
      // Add new risk assessment
      const newRiskAssessment: RiskAssessment = {
        id: `risk_${Date.now()}`,
        region: selectedCity,
        risk_level: analysisResult.riskLevel,
        sea_level: analysisResult.seaLevel,
        cyclones: analysisResult.cyclones,
        pollution: analysisResult.pollution,
        algal_blooms: analysisResult.algalBlooms,
        illegal_activities: analysisResult.illegalActivities,
        population_density: analysisResult.populationDensity,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      // Add new alerts
      const newAlerts: AlertLog[] = analysisResult.alerts.map((alert, index) => ({
        id: `alert_${Date.now()}_${index}`,
        type: alert.type,
        severity: alert.severity,
        location: selectedCity, // Use selected city instead of alert.location
        description: alert.description,
        source: 'AI Analysis System',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }))
      
      // Clear old data and set new data for the selected city only
      setRiskAssessments([newRiskAssessment])
      setAlertLogs(newAlerts)
      
      // Show success toast with analysis summary
      toast({ 
        title: "🤖 AI Analysis Complete", 
        description: `Generated ${newAlerts.length} new alerts and 1 risk assessment for ${selectedCity}. Risk Level: ${analysisResult.riskLevel}` 
      })
      
      // Store analysis result for display
      setLastAnalysisResult(analysisResult)
      
    } catch (error) {
      console.error('AI analysis failed:', error)
      toast({ 
        title: "Analysis Error", 
        description: "AI analysis encountered an error. Please try again.",
        variant: "destructive"
      })
    } finally {
      setAiAnalysisRunning(false)
    }
  }

  // Generate realistic fake AI analysis data for different cities
  const generateFakeAIAnalysis = (city: string) => {
    const cityData = cityAnalysisData[city] || cityAnalysisData['Mumbai']
    
    // Generate random variations based on city baseline
    const seaLevelVariation = (Math.random() - 0.5) * 0.4 // ±0.2m variation
    const cycloneVariation = Math.floor(Math.random() * 3) // 0-2 additional cyclones
    const pollutionVariation = Math.random() > 0.7 ? 'High' : cityData.basePollution
    const algalVariation = Math.random() > 0.8 ? 'Moderate' : cityData.baseAlgalBlooms
    
    // Calculate risk level based on multiple factors
    let riskScore = 0
    riskScore += cityData.baseRiskScore
    riskScore += pollutionVariation === 'High' ? 2 : 0
    riskScore += algalVariation === 'Moderate' ? 1 : 0
    riskScore += Math.random() > 0.6 ? 1 : 0 // Random environmental factors
    
    const riskLevel = riskScore >= 8 ? 'Critical' : 
                     riskScore >= 6 ? 'High' : 
                     riskScore >= 4 ? 'Medium' : 'Low'
    
    // Generate contextual alerts based on city characteristics
    const alerts = generateContextualAlerts(city, riskLevel, cityData)
    
    return {
      city,
      riskLevel,
      seaLevel: cityData.baseSeaLevel + seaLevelVariation,
      cyclones: cityData.baseCyclones + cycloneVariation,
      pollution: pollutionVariation,
      algalBlooms: algalVariation,
      illegalActivities: cityData.baseIllegalActivities,
      populationDensity: cityData.basePopulationDensity,
      alerts,
      analysis: {
        timestamp: new Date().toISOString(),
        confidence: 85 + Math.floor(Math.random() * 15), // 85-99%
        factors: generateRiskFactors(city, riskLevel),
        recommendations: generateRecommendations(city, riskLevel),
        environmentalImpact: generateEnvironmentalImpact(city, riskLevel)
      }
    }
  }

  // Generate contextual alerts based on city and risk level
  const generateContextualAlerts = (city: string, riskLevel: string, cityData: any) => {
    const alerts = []
    
    // Base alerts based on risk level
    if (riskLevel === 'Critical') {
      alerts.push({
        type: 'Sea Level Rise',
        severity: 'Critical',
        location: `${city} Coastal Zone`,
        description: `Critical sea level rise detected. Current level: ${(cityData.baseSeaLevel + 0.3).toFixed(2)}m above normal. Immediate evacuation protocols recommended.`
      })
      alerts.push({
        type: 'Storm Surge Warning',
        severity: 'Critical',
        location: `${city} Harbor Area`,
        description: `High probability of storm surge within 24-48 hours. Expected height: 3.5-4.2m above normal tide levels.`
      })
    }
    
    if (riskLevel === 'High' || riskLevel === 'Critical') {
      alerts.push({
        type: 'Coastal Erosion',
        severity: 'High',
        location: `${city} Beach Front`,
        description: `Accelerated coastal erosion detected. Erosion rate: ${(0.8 + Math.random() * 0.4).toFixed(1)}m/month. Infrastructure at risk.`
      })
    }
    
    // City-specific alerts
    if (city === 'Mumbai') {
      alerts.push({
        type: 'Monsoon Flooding',
        severity: riskLevel === 'Critical' ? 'Critical' : 'High',
        location: 'Mumbai Coastal Districts',
        description: 'Heavy monsoon rainfall expected. Combined with high tide, flooding risk elevated. Drainage systems may be overwhelmed.'
      })
      if (riskLevel === 'Critical') {
        alerts.push({
          type: 'Port Operations Alert',
          severity: 'Critical',
          location: 'Mumbai Port Trust',
          description: 'Critical infrastructure at risk. Port operations may need to be suspended. Evacuate non-essential personnel immediately.'
        })
      }
    }
    
    if (city === 'Chennai') {
      alerts.push({
        type: 'Cyclone Formation',
        severity: 'High',
        location: 'Bay of Bengal',
        description: 'Low pressure system developing in Bay of Bengal. 60% probability of cyclone formation affecting Chennai coast within 72 hours.'
      })
      if (riskLevel === 'High' || riskLevel === 'Critical') {
        alerts.push({
          type: 'Marina Beach Erosion',
          severity: 'High',
          location: 'Chennai Marina Beach',
          description: 'Accelerated beach erosion detected. Historical monuments and tourism infrastructure at risk.'
        })
      }
    }
    
    if (city === 'Kolkata') {
      alerts.push({
        type: 'Sundarbans Ecosystem Alert',
        severity: 'Medium',
        location: 'Sundarbans Region',
        description: 'Mangrove ecosystem stress detected. Salinity levels increasing due to reduced freshwater flow and sea level rise.'
      })
      if (riskLevel === 'High' || riskLevel === 'Critical') {
        alerts.push({
          type: 'Hooghly River Flooding',
          severity: 'High',
          location: 'Kolkata Riverside',
          description: 'Hooghly River water levels rising. Combined with high tide, flooding risk in low-lying areas.'
        })
      }
    }
    
    if (city === 'Kochi') {
      alerts.push({
        type: 'Backwater Pollution',
        severity: 'Medium',
        location: 'Kochi Backwaters',
        description: 'Elevated pollution levels in backwater ecosystem. Agricultural runoff and urban waste contributing to water quality degradation.'
      })
      if (riskLevel === 'High' || riskLevel === 'Critical') {
        alerts.push({
          type: 'Fishing Industry Alert',
          severity: 'Medium',
          location: 'Kochi Fishing Harbor',
          description: 'Water quality affecting fish stocks. Fishing activities may need to be restricted in affected areas.'
        })
      }
    }
    
    if (city === 'Goa') {
      alerts.push({
        type: 'Tourism Impact Alert',
        severity: 'Medium',
        location: 'Goa Beaches',
        description: 'Beach erosion affecting tourism infrastructure. Some beach access points may be restricted.'
      })
    }
    
    if (city === 'Visakhapatnam') {
      alerts.push({
        type: 'Port Security Alert',
        severity: riskLevel === 'Critical' ? 'Critical' : 'High',
        location: 'Visakhapatnam Port',
        description: 'Critical naval and commercial port infrastructure at risk. Enhanced security measures recommended.'
      })
    }
    
    if (city === 'Surat') {
      alerts.push({
        type: 'Industrial Zone Alert',
        severity: 'Medium',
        location: 'Surat Industrial Belt',
        description: 'Coastal industrial facilities at risk. Chemical storage and processing areas need protection.'
      })
    }
    
    if (city === 'Mangalore') {
      alerts.push({
        type: 'Port Operations Alert',
        severity: 'Medium',
        location: 'Mangalore Port',
        description: 'Port infrastructure at risk due to coastal erosion. Vessel operations may be affected.'
      })
    }
    
    if (city === 'Puducherry') {
      alerts.push({
        type: 'Tourism Infrastructure Alert',
        severity: 'Medium',
        location: 'Puducherry Beach Front',
        description: 'Beach erosion affecting tourism infrastructure. French colonial heritage sites at risk.'
      })
    }
    
    if (city === 'Thiruvananthapuram') {
      alerts.push({
        type: 'Fishing Industry Alert',
        severity: 'Medium',
        location: 'Thiruvananthapuram Coast',
        description: 'Traditional fishing communities affected by coastal changes. Fish landing sites at risk.'
      })
    }
    
    if (city === 'Bhubaneswar') {
      alerts.push({
        type: 'Cultural Heritage Alert',
        severity: 'Medium',
        location: 'Konark Sun Temple Area',
        description: 'UNESCO World Heritage site at risk from coastal erosion and sea level rise.'
      })
    }
    
    if (city === 'Porbandar') {
      alerts.push({
        type: 'Marine Sanctuary Alert',
        severity: 'Low',
        location: 'Porbandar Marine Sanctuary',
        description: 'Marine biodiversity at risk. Coral reefs and marine life habitats threatened.'
      })
    }
    
    if (city === 'Dwarka') {
      alerts.push({
        type: 'Religious Tourism Alert',
        severity: 'Medium',
        location: 'Dwarka Temple Complex',
        description: 'Ancient temple complex at risk from coastal erosion. Pilgrimage site protection needed.'
      })
    }
    
    if (city === 'Okha') {
      alerts.push({
        type: 'Port Infrastructure Alert',
        severity: 'Medium',
        location: 'Okha Port',
        description: 'Port facilities at risk from coastal erosion. Maritime trade operations may be affected.'
      })
    }
    
    // Environmental monitoring alerts
    if (Math.random() > 0.6) {
      alerts.push({
        type: 'Marine Life Alert',
        severity: 'Medium',
        location: `${city} Marine Sanctuary`,
        description: 'Unusual marine life behavior patterns detected. Possible indicator of environmental stress or pollution events.'
      })
    }
    
    return alerts.slice(0, 4) // Limit to 4 alerts
  }

  // Generate risk factors analysis
  const generateRiskFactors = (city: string, riskLevel: string) => {
    const factors = []
    
    if (riskLevel === 'Critical' || riskLevel === 'High') {
      factors.push('Elevated sea level rise rates')
      factors.push('Increased cyclone frequency')
      factors.push('Coastal infrastructure vulnerability')
    }
    
    if (city === 'Mumbai') {
      factors.push('High population density in coastal zones')
      factors.push('Critical port and industrial infrastructure')
      factors.push('Monsoon vulnerability and drainage challenges')
      factors.push('High-value real estate at risk')
    }
    
    if (city === 'Chennai') {
      factors.push('Bay of Bengal cyclone exposure')
      factors.push('Critical IT and manufacturing hub')
      factors.push('Coastal tourism infrastructure')
      factors.push('Historical monuments at risk')
    }
    
    if (city === 'Kolkata') {
      factors.push('Sundarbans ecosystem sensitivity')
      factors.push('Agricultural land and fisheries at risk')
      factors.push('Hooghly River flooding vulnerability')
      factors.push('Cultural heritage sites threatened')
    }
    
    if (city === 'Kochi') {
      factors.push('Backwater ecosystem fragility')
      factors.push('Fishing industry dependency')
      factors.push('Tourism and spice trade hub')
      factors.push('Agricultural runoff pollution')
    }
    
    if (city === 'Goa') {
      factors.push('Tourism-dependent economy')
      factors.push('Beach erosion and coastal development')
      factors.push('Monsoon flooding vulnerability')
      factors.push('Heritage church preservation')
    }
    
    if (city === 'Visakhapatnam') {
      factors.push('Strategic naval port location')
      factors.push('Steel and petrochemical industries')
      factors.push('Coastal defense infrastructure')
      factors.push('Tourism and fishing activities')
    }
    
    if (city === 'Surat') {
      factors.push('Diamond and textile industries')
      factors.push('Chemical and petrochemical plants')
      factors.push('High population density')
      factors.push('Industrial pollution legacy')
    }
    
    if (city === 'Mangalore') {
      factors.push('Port and shipping infrastructure')
      factors.push('Cashew and coffee processing')
      factors.push('Coastal tourism development')
      factors.push('Fishing industry dependency')
    }
    
    if (city === 'Puducherry') {
      factors.push('French colonial heritage')
      factors.push('Tourism-dependent economy')
      factors.push('Beach erosion vulnerability')
      factors.push('Cultural preservation needs')
    }
    
    if (city === 'Thiruvananthapuram') {
      factors.push('Traditional fishing communities')
      factors.push('Kovalam beach tourism')
      factors.push('Coastal ecosystem fragility')
      factors.push('Heritage site preservation')
    }
    
    if (city === 'Bhubaneswar') {
      factors.push('Konark Sun Temple UNESCO site')
      factors.push('Coastal cultural heritage')
      factors.push('Tourism infrastructure')
      factors.push('Historical monument protection')
    }
    
    if (city === 'Porbandar') {
      factors.push('Marine sanctuary ecosystem')
      factors.push('Coral reef biodiversity')
      factors.push('Fishing industry dependency')
      factors.push('Marine conservation needs')
    }
    
    if (city === 'Dwarka') {
      factors.push('Ancient temple complex')
      factors.push('Religious tourism importance')
      factors.push('Coastal heritage preservation')
      factors.push('Pilgrimage site protection')
    }
    
    if (city === 'Okha') {
      factors.push('Port and maritime trade')
      factors.push('Coastal infrastructure')
      factors.push('Fishing industry support')
      factors.push('Maritime security needs')
    }
    
    factors.push('Historical vulnerability to extreme weather')
    factors.push('Limited adaptive capacity in some regions')
    factors.push('Climate change acceleration')
    factors.push('Urban development pressure')
    
    return factors
  }

  // Generate recommendations
  const generateRecommendations = (city: string, riskLevel: string) => {
    const recommendations = []
    
    if (riskLevel === 'Critical') {
      recommendations.push('Immediate evacuation of high-risk coastal areas')
      recommendations.push('Activate emergency response protocols')
      recommendations.push('Deploy additional emergency resources')
      recommendations.push('Suspend non-essential operations')
    }
    
    if (riskLevel === 'High') {
      recommendations.push('Enhanced monitoring of coastal conditions')
      recommendations.push('Prepare emergency shelters')
      recommendations.push('Alert local emergency services')
      recommendations.push('Implement traffic control measures')
    }
    
    // City-specific recommendations
    if (city === 'Mumbai') {
      recommendations.push('Activate monsoon flood control systems')
      recommendations.push('Coordinate with port authorities for vessel safety')
      recommendations.push('Deploy additional drainage teams')
      recommendations.push('Alert financial district and corporate offices')
    }
    
    if (city === 'Chennai') {
      recommendations.push('Monitor Bay of Bengal weather systems')
      recommendations.push('Secure IT infrastructure and data centers')
      recommendations.push('Protect historical monuments and tourism sites')
      recommendations.push('Coordinate with fishing community')
    }
    
    if (city === 'Kolkata') {
      recommendations.push('Monitor Hooghly River water levels')
      recommendations.push('Protect Sundarbans ecosystem')
      recommendations.push('Alert agricultural communities')
      recommendations.push('Secure cultural heritage sites')
    }
    
    if (city === 'Kochi') {
      recommendations.push('Monitor backwater water quality')
      recommendations.push('Coordinate with fishing industry')
      recommendations.push('Protect spice trade infrastructure')
      recommendations.push('Implement agricultural runoff controls')
    }
    
    if (city === 'Goa') {
      recommendations.push('Restrict beach access in high-risk areas')
      recommendations.push('Protect heritage church structures')
      recommendations.push('Coordinate with tourism industry')
      recommendations.push('Implement coastal development controls')
    }
    
    if (city === 'Visakhapatnam') {
      recommendations.push('Enhance port security measures')
      recommendations.push('Protect naval infrastructure')
      recommendations.push('Secure industrial facilities')
      recommendations.push('Coordinate with defense authorities')
    }
    
    if (city === 'Surat') {
      recommendations.push('Secure chemical storage facilities')
      recommendations.push('Protect diamond and textile industries')
      recommendations.push('Implement industrial safety protocols')
      recommendations.push('Coordinate with business community')
    }
    
    if (city === 'Mangalore') {
      recommendations.push('Protect port infrastructure')
      recommendations.push('Secure cashew processing facilities')
      recommendations.push('Coordinate with fishing community')
      recommendations.push('Protect coastal tourism areas')
    }
    
    if (city === 'Puducherry') {
      recommendations.push('Protect French colonial heritage')
      recommendations.push('Secure tourism infrastructure')
      recommendations.push('Implement beach protection measures')
      recommendations.push('Coordinate with cultural preservation')
    }
    
    if (city === 'Thiruvananthapuram') {
      recommendations.push('Protect traditional fishing areas')
      recommendations.push('Secure Kovalam beach tourism')
      recommendations.push('Implement coastal ecosystem protection')
      recommendations.push('Coordinate with heritage preservation')
    }
    
    if (city === 'Bhubaneswar') {
      recommendations.push('Protect Konark Sun Temple UNESCO site')
      recommendations.push('Secure cultural heritage infrastructure')
      recommendations.push('Implement tourism protection measures')
      recommendations.push('Coordinate with historical preservation')
    }
    
    if (city === 'Porbandar') {
      recommendations.push('Protect marine sanctuary ecosystem')
      recommendations.push('Secure coral reef biodiversity')
      recommendations.push('Implement fishing industry protection')
      recommendations.push('Coordinate with marine conservation')
    }
    
    if (city === 'Dwarka') {
      recommendations.push('Protect ancient temple complex')
      recommendations.push('Secure religious tourism infrastructure')
      recommendations.push('Implement coastal heritage protection')
      recommendations.push('Coordinate with pilgrimage site security')
    }
    
    if (city === 'Okha') {
      recommendations.push('Protect port and maritime facilities')
      recommendations.push('Secure coastal infrastructure')
      recommendations.push('Implement fishing industry support')
      recommendations.push('Coordinate with maritime security')
    }
    
    recommendations.push('Strengthen coastal infrastructure')
    recommendations.push('Implement early warning systems')
    recommendations.push('Community awareness and preparedness programs')
    recommendations.push('Regular emergency response drills')
    recommendations.push('Climate adaptation planning')
    
    return recommendations
  }

  // Generate environmental impact assessment
  const generateEnvironmentalImpact = (city: string, riskLevel: string) => {
    const impacts = []
    
    if (riskLevel === 'Critical' || riskLevel === 'High') {
      impacts.push('Potential loss of coastal habitats')
      impacts.push('Increased erosion and land loss')
      impacts.push('Saltwater intrusion into freshwater systems')
      impacts.push('Disruption of marine ecosystems')
    }
    
    // City-specific environmental impacts
    if (city === 'Mumbai') {
      impacts.push('Mangrove ecosystem degradation')
      impacts.push('Marine biodiversity loss in Mumbai Harbor')
      impacts.push('Coastal water quality deterioration')
      impacts.push('Impact on migratory bird habitats')
    }
    
    if (city === 'Chennai') {
      impacts.push('Marina Beach ecosystem disruption')
      impacts.push('Coastal dune system damage')
      impacts.push('Marine turtle nesting site threats')
      impacts.push('Coral reef stress in nearby waters')
    }
    
    if (city === 'Kolkata') {
      impacts.push('Sundarbans mangrove ecosystem stress')
      impacts.push('Bengal tiger habitat fragmentation')
      impacts.push('Freshwater fish species decline')
      impacts.push('Agricultural soil salinization')
    }
    
    if (city === 'Kochi') {
      impacts.push('Backwater ecosystem degradation')
      impacts.push('Mangrove forest loss')
      impacts.push('Fish breeding ground disruption')
      impacts.push('Water hyacinth proliferation')
    }
    
    if (city === 'Goa') {
      impacts.push('Beach ecosystem disruption')
      impacts.push('Coastal vegetation loss')
      impacts.push('Marine turtle nesting impact')
      impacts.push('Coral reef damage')
    }
    
    if (city === 'Visakhapatnam') {
      impacts.push('Marine sanctuary stress')
      impacts.push('Coastal forest degradation')
      impacts.push('Marine mammal habitat disruption')
      impacts.push('Industrial pollution impact')
    }
    
    if (city === 'Surat') {
      impacts.push('Industrial effluent impact on marine life')
      impacts.push('Coastal wetland degradation')
      impacts.push('Fish population decline')
      impacts.push('Water quality deterioration')
    }
    
    if (city === 'Mangalore') {
      impacts.push('Port infrastructure impact on marine life')
      impacts.push('Cashew processing waste pollution')
      impacts.push('Coastal tourism development impact')
      impacts.push('Fishing ground disruption')
    }
    
    if (city === 'Puducherry') {
      impacts.push('Beach ecosystem degradation')
      impacts.push('French colonial heritage site erosion')
      impacts.push('Tourism infrastructure damage')
      impacts.push('Cultural site vulnerability')
    }
    
    if (city === 'Thiruvananthapuram') {
      impacts.push('Traditional fishing ground loss')
      impacts.push('Kovalam beach ecosystem damage')
      impacts.push('Coastal heritage site erosion')
      impacts.push('Fishing community displacement')
    }
    
    if (city === 'Bhubaneswar') {
      impacts.push('Konark Sun Temple UNESCO site erosion')
      impacts.push('Cultural heritage infrastructure damage')
      impacts.push('Historical monument vulnerability')
      impacts.push('Tourism site degradation')
    }
    
    if (city === 'Porbandar') {
      impacts.push('Marine sanctuary ecosystem stress')
      impacts.push('Coral reef damage and bleaching')
      impacts.push('Marine biodiversity loss')
      impacts.push('Fishing industry disruption')
    }
    
    if (city === 'Dwarka') {
      impacts.push('Ancient temple complex erosion')
      impacts.push('Religious heritage site damage')
      impacts.push('Pilgrimage infrastructure vulnerability')
      impacts.push('Cultural site degradation')
    }
    
    if (city === 'Okha') {
      impacts.push('Port infrastructure erosion')
      impacts.push('Maritime trade disruption')
      impacts.push('Coastal ecosystem damage')
      impacts.push('Fishing industry impact')
    }
    
    impacts.push('Changes in local biodiversity patterns')
    impacts.push('Impact on fishing and aquaculture')
    impacts.push('Coastal vegetation stress')
    impacts.push('Marine food web disruption')
    impacts.push('Coastal carbon sequestration loss')
    impacts.push('Ecosystem service degradation')
    
    return impacts
  }

  // City-specific baseline data for realistic analysis
  const cityAnalysisData: Record<string, any> = {
    'Mumbai': {
      baseRiskScore: 7,
      baseSeaLevel: 0.8,
      baseCyclones: 2,
      basePollution: 'High',
      baseAlgalBlooms: 'Low',
      baseIllegalActivities: 'Medium',
      basePopulationDensity: 21000
    },
    'Chennai': {
      baseRiskScore: 6,
      baseSeaLevel: 0.6,
      baseCyclones: 3,
      basePollution: 'Medium',
      baseAlgalBlooms: 'Low',
      baseIllegalActivities: 'Low',
      basePopulationDensity: 12000
    },
    'Kolkata': {
      baseRiskScore: 5,
      baseSeaLevel: 0.4,
      baseCyclones: 1,
      basePollution: 'High',
      baseAlgalBlooms: 'Medium',
      baseIllegalActivities: 'Medium',
      basePopulationDensity: 15000
    },
    'Kochi': {
      baseRiskScore: 4,
      baseSeaLevel: 0.3,
      baseCyclones: 2,
      basePollution: 'Medium',
      baseAlgalBlooms: 'High',
      baseIllegalActivities: 'Low',
      basePopulationDensity: 8000
    },
    'Visakhapatnam': {
      baseRiskScore: 5,
      baseSeaLevel: 0.5,
      baseCyclones: 2,
      basePollution: 'Medium',
      baseAlgalBlooms: 'Low',
      baseIllegalActivities: 'Low',
      basePopulationDensity: 9000
    },
    'Goa': {
      baseRiskScore: 3,
      baseSeaLevel: 0.2,
      baseCyclones: 1,
      basePollution: 'Low',
      baseAlgalBlooms: 'Low',
      baseIllegalActivities: 'Medium',
      basePopulationDensity: 6000
    },
    'Mangalore': {
      baseRiskScore: 4,
      baseSeaLevel: 0.4,
      baseCyclones: 2,
      basePollution: 'Medium',
      baseAlgalBlooms: 'Low',
      baseIllegalActivities: 'Low',
      basePopulationDensity: 7000
    },
    'Puducherry': {
      baseRiskScore: 4,
      baseSeaLevel: 0.3,
      baseCyclones: 2,
      basePollution: 'Medium',
      baseAlgalBlooms: 'Low',
      baseIllegalActivities: 'Low',
      basePopulationDensity: 5000
    },
    'Thiruvananthapuram': {
      baseRiskScore: 3,
      baseSeaLevel: 0.2,
      baseCyclones: 1,
      basePollution: 'Low',
      baseAlgalBlooms: 'Low',
      baseIllegalActivities: 'Low',
      basePopulationDensity: 4000
    },
    'Bhubaneswar': {
      baseRiskScore: 5,
      baseSeaLevel: 0.4,
      baseCyclones: 2,
      basePollution: 'Medium',
      baseAlgalBlooms: 'Low',
      baseIllegalActivities: 'Low',
      basePopulationDensity: 6000
    },
    'Surat': {
      baseRiskScore: 6,
      baseSeaLevel: 0.7,
      baseCyclones: 1,
      basePollution: 'High',
      baseAlgalBlooms: 'Medium',
      baseIllegalActivities: 'Medium',
      basePopulationDensity: 11000
    },
    'Porbandar': {
      baseRiskScore: 3,
      baseSeaLevel: 0.3,
      baseCyclones: 1,
      basePollution: 'Low',
      baseAlgalBlooms: 'Low',
      baseIllegalActivities: 'Low',
      basePopulationDensity: 3000
    },
    'Dwarka': {
      baseRiskScore: 2,
      baseSeaLevel: 0.2,
      baseCyclones: 1,
      basePollution: 'Low',
      baseAlgalBlooms: 'Low',
      baseIllegalActivities: 'Low',
      basePopulationDensity: 2000
    },
    'Okha': {
      baseRiskScore: 3,
      baseSeaLevel: 0.3,
      baseCyclones: 1,
      basePollution: 'Low',
      baseAlgalBlooms: 'Low',
      baseIllegalActivities: 'Low',
      basePopulationDensity: 2500
    }
  }

  // State for storing last analysis result
  const [lastAnalysisResult, setLastAnalysisResult] = useState<any>(null)

  const handleRiskSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const riskData = {
        region: riskForm.region,
        risk_level: riskForm.risk_level,
        sea_level: parseFloat(riskForm.sea_level),
        cyclones: parseInt(riskForm.cyclones),
        pollution: riskForm.pollution,
        algal_blooms: riskForm.algal_blooms,
        illegal_activities: riskForm.illegal_activities,
        population_density: parseInt(riskForm.population_density)
      }

      if (editingRisk) {
        await supabase.from('risk_assessments').update(riskData).eq('id', editingRisk)
        toast({ title: "Risk assessment updated successfully" })
      } else {
        await supabase.from('risk_assessments').insert(riskData)
        toast({ title: "Risk assessment created successfully" })
      }

      setRiskForm({
        region: "", risk_level: "", sea_level: "", cyclones: "",
        pollution: "", algal_blooms: "", illegal_activities: "", population_density: ""
      })
      setEditingRisk(null)
      fetchData()
    } catch (error) {
      toast({ title: "Error saving risk assessment", variant: "destructive" })
    }
  }

  const handleAlertSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const alertData = {
        type: alertForm.type,
        severity: alertForm.severity,
        location: alertForm.location,
        description: alertForm.description,
        source: alertForm.source
      }

      if (editingAlert) {
        await supabase.from('alert_logs').update(alertData).eq('id', editingAlert)
        toast({ title: "Alert updated successfully" })
      } else {
        await supabase.from('alert_logs').insert(alertData)
        toast({ title: "Alert created successfully" })
      }

      setAlertForm({ type: "", severity: "", location: "", description: "", source: "" })
      setEditingAlert(null)
      fetchData()
    } catch (error) {
      toast({ title: "Error saving alert", variant: "destructive" })
    }
  }

  const deleteRisk = async (id: string) => {
    try {
      await supabase.from('risk_assessments').delete().eq('id', id)
      toast({ title: "Risk assessment deleted successfully" })
      fetchData()
    } catch (error) {
      toast({ title: "Error deleting risk assessment", variant: "destructive" })
    }
  }

  const deleteAlert = async (id: string) => {
    try {
      await supabase.from('alert_logs').delete().eq('id', id)
      toast({ title: "Alert deleted successfully" })
      fetchData()
    } catch (error) {
      toast({ title: "Error deleting alert", variant: "destructive" })
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

  const handlePasswordSubmit = () => {
    if (passwordInput === 'Neel123') {
      setIsEditMode(true)
      setShowPasswordDialog(false)
      setPasswordInput('')
      toast({ title: "Access granted - Edit mode enabled" })
    } else {
      toast({ title: "Incorrect password", variant: "destructive" })
      setPasswordInput('')
    }
  }

  return {
    riskAssessments, alertLogs, sensorData, resources, loading,
    riskForm, setRiskForm, alertForm, setAlertForm,
    editingRisk, setEditingRisk, editingAlert, setEditingAlert,
    handleRiskSubmit, handleAlertSubmit, deleteRisk, deleteAlert,
    updateResource, getResourceIcon, fetchData, selectedCity, setSelectedCity,
    coastalCities, isEditMode, setIsEditMode, passwordInput, setPasswordInput,
    showPasswordDialog, setShowPasswordDialog, handlePasswordSubmit, aiAnalysisRunning, runAIAnalysis, lastAnalysisResult
  }
}

export function CoastalThreatOverview() {
  const { sensorData, selectedCity } = useCoastalThreatData()
  
  // Get latest sensor readings for the selected city
  const latestData = sensorData.filter(data => data.location.includes(selectedCity)).slice(0, 6)
  
  // Generate city-specific threat indicators
  const getCitySpecificThreats = (city: string) => {
    const cityThreats: Record<string, any> = {
      'Mumbai': { seaLevel: 2.4, stormIntensity: 35, pollutionIndex: 125, aiConfidence: 94.2 },
      'Chennai': { seaLevel: 1.8, stormIntensity: 42, pollutionIndex: 95, aiConfidence: 91.8 },
      'Kolkata': { seaLevel: 1.5, stormIntensity: 28, pollutionIndex: 135, aiConfidence: 89.5 },
      'Kochi': { seaLevel: 1.2, stormIntensity: 38, pollutionIndex: 85, aiConfidence: 92.1 },
      'Goa': { seaLevel: 0.9, stormIntensity: 22, pollutionIndex: 65, aiConfidence: 87.3 },
      'Visakhapatnam': { seaLevel: 1.6, stormIntensity: 45, pollutionIndex: 92, aiConfidence: 90.7 },
      'Surat': { seaLevel: 1.9, stormIntensity: 31, pollutionIndex: 142, aiConfidence: 93.4 },
      'Mangalore': { seaLevel: 1.3, stormIntensity: 33, pollutionIndex: 78, aiConfidence: 88.9 },
      'Puducherry': { seaLevel: 1.1, stormIntensity: 29, pollutionIndex: 72, aiConfidence: 86.2 },
      'Thiruvananthapuram': { seaLevel: 0.8, stormIntensity: 25, pollutionIndex: 58, aiConfidence: 84.7 },
      'Bhubaneswar': { seaLevel: 1.4, stormIntensity: 36, pollutionIndex: 88, aiConfidence: 89.8 },
      'Porbandar': { seaLevel: 0.7, stormIntensity: 20, pollutionIndex: 52, aiConfidence: 83.1 },
      'Dwarka': { seaLevel: 0.6, stormIntensity: 18, pollutionIndex: 48, aiConfidence: 82.5 },
      'Okha': { seaLevel: 0.8, stormIntensity: 23, pollutionIndex: 55, aiConfidence: 85.3 }
    }
    
    return cityThreats[city] || cityThreats['Mumbai']
  }
  
  const cityThreats = getCitySpecificThreats(selectedCity)
  
  const getThreatLevel = (value: number, type: string) => {
    switch (type) {
      case 'tide_gauge':
        return value > 2.0 ? 'Critical' : value > 1.5 ? 'High' : 'Normal'
      case 'weather_station':
        return value > 40 ? 'Critical' : value > 25 ? 'High' : 'Normal'
      case 'pollution_sensor':
        return value > 100 ? 'Critical' : value > 70 ? 'High' : 'Normal'
      default:
        return 'Normal'
    }
  }
  
  const getThreatColor = (level: string) => {
    switch (level) {
      case 'Critical': return 'text-red-500'
      case 'High': return 'text-orange-500'
      default: return 'text-green-500'
    }
  }
  
  const getThreatVariant = (level: string) => {
    switch (level) {
      case 'Critical': return 'destructive'
      case 'High': return 'secondary'
      default: return 'outline'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          AI Threat Indicators
        </CardTitle>
        <CardDescription>Real-time AI analysis for {selectedCity}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="grid gap-3">
            <div className="flex items-center justify-between p-3 border rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50">
              <div className="flex items-center gap-2">
                <Waves className="h-5 w-5 text-blue-500" />
                <div>
                  <span className="text-sm font-medium">Sea Level Rise</span>
                  <div className="text-xs text-muted-foreground">Tide gauge readings</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-blue-600">+{cityThreats.seaLevel}m</div>
                <Badge variant={cityThreats.seaLevel > 2.0 ? "destructive" : cityThreats.seaLevel > 1.5 ? "secondary" : "outline"}>
                  {cityThreats.seaLevel > 2.0 ? "Critical" : cityThreats.seaLevel > 1.5 ? "Elevated" : "Normal"}
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg bg-gradient-to-r from-orange-50 to-red-50">
              <div className="flex items-center gap-2">
                <Cloud className="h-5 w-5 text-orange-500" />
                <div>
                  <span className="text-sm font-medium">Storm Intensity</span>
                  <div className="text-xs text-muted-foreground">Wind speed analysis</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-orange-600">{cityThreats.stormIntensity} km/h</div>
                <Badge variant={cityThreats.stormIntensity > 40 ? "destructive" : cityThreats.stormIntensity > 25 ? "secondary" : "outline"}>
                  {cityThreats.stormIntensity > 40 ? "Critical" : cityThreats.stormIntensity > 25 ? "Moderate" : "Low"}
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg bg-gradient-to-r from-red-50 to-pink-50">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-red-500" />
                <div>
                  <span className="text-sm font-medium">Pollution Index</span>
                  <div className="text-xs text-muted-foreground">Air & water quality</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-red-600">{cityThreats.pollutionIndex} AQI</div>
                <Badge variant={cityThreats.pollutionIndex > 100 ? "destructive" : cityThreats.pollutionIndex > 70 ? "secondary" : "outline"}>
                  {cityThreats.pollutionIndex > 100 ? "Unhealthy" : cityThreats.pollutionIndex > 70 ? "Moderate" : "Good"}
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg bg-gradient-to-r from-purple-50 to-indigo-50">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-purple-500" />
                <div>
                  <span className="text-sm font-medium">AI Confidence</span>
                  <div className="text-xs text-muted-foreground">Prediction accuracy</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-purple-600">{cityThreats.aiConfidence}%</div>
                <Badge variant={cityThreats.aiConfidence > 90 ? "outline" : cityThreats.aiConfidence > 80 ? "secondary" : "destructive"}>
                  {cityThreats.aiConfidence > 90 ? "High" : cityThreats.aiConfidence > 80 ? "Medium" : "Low"}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function RiskAssessmentTab() {
  const {
    riskAssessments, loading, riskForm, setRiskForm,
    editingRisk, setEditingRisk, handleRiskSubmit, deleteRisk,
    selectedCity, aiAnalysisRunning, runAIAnalysis
  } = useCoastalThreatData()

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">AI Risk Assessments</h3>
          <p className="text-sm text-muted-foreground">
            Automated analysis for <span className="font-semibold text-blue-600">{selectedCity}</span> • 
            Last updated: {new Date().toLocaleTimeString()}
          </p>
          {riskAssessments.length === 0 && (
            <p className="text-xs text-orange-600 mt-1">
              No risk assessments found for {selectedCity}. Click "Run AI Analysis" to generate new data.
            </p>
          )}
        </div>
        <Button onClick={runAIAnalysis} disabled={aiAnalysisRunning}>
          <Bot className="mr-2 h-4 w-4" />
          {aiAnalysisRunning ? 'Running Analysis...' : 'Run AI Analysis'}
        </Button>
      </div>

      <div className="grid gap-4">
        {riskAssessments.map((risk) => (
          <Card key={risk.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{risk.region}</h4>
                    <Badge variant={risk.risk_level === "High" ? "destructive" : risk.risk_level === "Medium" ? "default" : "secondary"}>
                      {risk.risk_level}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground grid grid-cols-2 gap-4">
                    <span>Sea Level: +{risk.sea_level}m</span>
                    <span>Cyclones: {risk.cyclones}</span>
                    <span>Pollution: {risk.pollution}</span>
                    <span>Algal Blooms: {risk.algal_blooms}</span>
                    <span>Illegal Activities: {risk.illegal_activities}</span>
                    <span>Population: {risk.population_density}/km²</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    AI Generated • Updated: {new Date(risk.updated_at || risk.created_at).toLocaleString()}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline" className="text-xs">
                    <Activity className="h-3 w-3 mr-1" />
                    AI Generated
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export function AlertLogsTab() {
  const {
    alertLogs, loading, alertForm, setAlertForm,
    editingAlert, setEditingAlert, handleAlertSubmit, deleteAlert,
    selectedCity, aiAnalysisRunning, runAIAnalysis
  } = useCoastalThreatData()

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">AI Alert Logs</h3>
          <p className="text-sm text-muted-foreground">
            Real-time alerts for <span className="font-semibold text-blue-600">{selectedCity}</span> • 
            Last scan: {new Date().toLocaleTimeString()}
          </p>
          {alertLogs.length === 0 && (
            <p className="text-xs text-orange-600 mt-1">
              No alerts found for {selectedCity}. Click "Run AI Analysis" to generate new data.
            </p>
          )}
        </div>
        <Button onClick={runAIAnalysis} disabled={aiAnalysisRunning}>
          <Bot className="mr-2 h-4 w-4" />
          {aiAnalysisRunning ? 'Running Analysis...' : 'Run AI Analysis'}
        </Button>
      </div>

      <div className="grid gap-4">
        {alertLogs.map((alert) => (
          <Card key={alert.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{alert.type}</h4>
                    <Badge variant={alert.severity === "Critical" ? "destructive" : alert.severity === "High" ? "default" : "secondary"}>
                      {alert.severity}
                    </Badge>
                    <Badge variant="outline">{alert.source}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{alert.location}</p>
                  <p className="text-sm">{alert.description}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>AI Detected • {new Date(alert.created_at).toLocaleString()}</span>
                    <Badge variant="outline" className="text-xs px-1 py-0">
                      <Activity className="h-2 w-2 mr-1" />
                      Auto
                    </Badge>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <Badge variant="outline" className="text-xs w-fit">
                    <Bot className="h-3 w-3 mr-1" />
                    AI Generated
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Confidence: {Math.floor(Math.random() * 15 + 85)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export function AIAnalysisResults({ analysisResult }: { analysisResult: any }) {
  if (!analysisResult) return null

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-blue-600" />
          AI Analysis Results - {analysisResult.city}
        </CardTitle>
        <CardDescription>
          Comprehensive threat assessment generated at {new Date(analysisResult.analysis.timestamp).toLocaleString()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="factors">Risk Factors</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            <TabsTrigger value="environmental">Environmental Impact</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Risk Level:</span>
                  <Badge variant={
                    analysisResult.riskLevel === 'Critical' ? 'destructive' :
                    analysisResult.riskLevel === 'High' ? 'destructive' :
                    analysisResult.riskLevel === 'Medium' ? 'secondary' : 'outline'
                  }>
                    {analysisResult.riskLevel}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Sea Level:</span>
                  <span className="text-sm">{analysisResult.seaLevel.toFixed(2)}m</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Cyclones:</span>
                  <span className="text-sm">{analysisResult.cyclones}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Pollution:</span>
                  <Badge variant="outline">{analysisResult.pollution}</Badge>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Confidence:</span>
                  <span className="text-sm text-green-600">{analysisResult.analysis.confidence}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Algal Blooms:</span>
                  <Badge variant="outline">{analysisResult.algalBlooms}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Population Density:</span>
                  <span className="text-sm">{analysisResult.populationDensity.toLocaleString()}/km²</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Illegal Activities:</span>
                  <Badge variant="outline">{analysisResult.illegalActivities}</Badge>
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <h4 className="font-medium mb-2">Generated Alerts:</h4>
              <div className="space-y-2">
                {analysisResult.alerts.map((alert: any, index: number) => (
                  <div key={index} className="p-3 border rounded-lg bg-muted/50">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{alert.type}</span>
                      <Badge variant={
                        alert.severity === 'Critical' ? 'destructive' :
                        alert.severity === 'High' ? 'destructive' :
                        alert.severity === 'Medium' ? 'secondary' : 'outline'
                      }>
                        {alert.severity}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{alert.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="factors" className="space-y-4">
            <div className="space-y-3">
              {analysisResult.analysis.factors.map((factor: string, index: number) => (
                <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm">{factor}</span>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="recommendations" className="space-y-4">
            <div className="space-y-3">
              {analysisResult.analysis.recommendations.map((rec: string, index: number) => (
                <div key={index} className="flex items-start gap-3 p-3 border rounded-lg bg-blue-50">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm">{rec}</span>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="environmental" className="space-y-4">
            <div className="space-y-3">
              {analysisResult.analysis.environmentalImpact.map((impact: string, index: number) => (
                <div key={index} className="flex items-start gap-3 p-3 border rounded-lg bg-green-50">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm">{impact}</span>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
