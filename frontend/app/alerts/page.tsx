// frontend/app/alerts/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Leaf, Droplets, Bug, Wrench } from 'lucide-react';

// Define types for alerts
type AlertData = {
  id: number;
  type: string;
  subtype: string;
  zone: string;
  severity: "high" | "medium" | "low";
  message: string;
  recommendation: string;
  date: string;
  confidence: number;
};

// Mock data for alerts
const mockAlertData: AlertData[] = [
  {
    id: 1,
    type: "Pest Risk",
    subtype: "Aphid Infestation",
    zone: "Zone 3",
    severity: "high",
    message: "High aphid risk detected in the northeast section of the field",
    recommendation: "Apply Imidacloprid 17.8% SL at 1.5 ml/liter of water. Focus treatment on Zone 3.",
    date: "2023-02-19",
    confidence: 0.89
  },
  {
    id: 2,
    type: "Stress",
    subtype: "Water Stress",
    zone: "North Field",
    severity: "medium",
    message: "Signs of water stress detected in upper canopy",
    recommendation: "Increase irrigation frequency by 25%. Monitor soil moisture levels closely.",
    date: "2023-02-18",
    confidence: 0.76
  },
  {
    id: 3,
    type: "Disease",
    subtype: "Fungal Infection",
    zone: "Southwest Section",
    severity: "medium",
    message: "Early signs of fungal infection detected",
    recommendation: "Apply copper-based fungicide. Ensure proper field drainage.",
    date: "2023-02-17",
    confidence: 0.72
  },
  {
    id: 4,
    type: "Nutrient Deficiency",
    subtype: "Nitrogen Deficiency",
    zone: "Zone 1",
    severity: "low",
    message: "Possible nitrogen deficiency in younger leaves",
    recommendation: "Apply nitrogen-rich fertilizer. Consider soil testing.",
    date: "2023-02-16",
    confidence: 0.65
  },
  {
    id: 5,
    type: "Stress",
    subtype: "Heat Stress",
    zone: "Central Area",
    severity: "medium",
    message: "Heat stress detected during midday hours",
    recommendation: "Provide shade cloth during peak hours. Increase watering frequency.",
    date: "2023-02-15",
    confidence: 0.78
  }
];

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [alertData] = useState<AlertData[] | null>(null);
  const [filteredAlerts, setFilteredAlerts] = useState<AlertData[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, this would fetch from an API
    setTimeout(() => {
      setAlerts(mockAlertData);
      setFilteredAlerts(mockAlertData);
      setLoading(false);
    }, 500);
  }, []);

  useEffect(() => {
    if (filter === "all") {
      setFilteredAlerts(alerts);
    } else {
      setFilteredAlerts(alerts.filter(alert => alert.severity === filter));
    }
  }, [filter, alerts]);

  const getSeverityColor = (severity: string) => {
    switch(severity) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getSeverityBgColor = (severity: string) => {
    switch(severity) {
      case "high":
        return "bg-red-50";
      case "medium":
        return "bg-yellow-50";
      case "low":
        return "bg-green-50";
      default:
        return "bg-gray-50";
    }
  };

  const getAlertIcon = (type: string) => {
    switch(type) {
      case "Pest Risk":
        return <Bug className="h-5 w-5 text-red-600" />;
      case "Disease":
        return <Leaf className="h-5 w-5 text-red-600" />;
      case "Stress":
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case "Nutrient Deficiency":
        return <Droplets className="h-5 w-5 text-blue-600" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading alerts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Field Alerts & Recommendations</h1>
        <div className="flex gap-2">
          <button 
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              filter === "all" 
                ? "bg-blue-600 text-white" 
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            All
          </button>
          <button 
            onClick={() => setFilter("high")}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              filter === "high" 
                ? "bg-red-600 text-white" 
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            High Risk
          </button>
          <button 
            onClick={() => setFilter("medium")}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              filter === "medium" 
                ? "bg-yellow-600 text-white" 
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Medium Risk
          </button>
          <button 
            onClick={() => setFilter("low")}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              filter === "low" 
                ? "bg-green-600 text-white" 
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Low Risk
          </button>
        </div>
      </div>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
              <div>
                <p className="text-sm font-medium text-gray-600">High Risk</p>
                <p className="text-2xl font-bold text-red-600">
                  {alerts.filter(a => a.severity === "high").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
              <div>
                <p className="text-sm font-medium text-gray-600">Medium Risk</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {alerts.filter(a => a.severity === "medium").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-green-600 mr-2" />
              <div>
                <p className="text-sm font-medium text-gray-600">Low Risk</p>
                <p className="text-2xl font-bold text-green-600">
                  {alerts.filter(a => a.severity === "low").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Wrench className="h-5 w-5 text-blue-600 mr-2" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Alerts</p>
                <p className="text-2xl font-bold text-blue-600">{alerts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Alerts List */}
      <div className="space-y-6">
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map((alert) => (
            <Card key={alert.id} className={`border-l-4 ${getSeverityBgColor(alert.severity)} border-l-${alert.severity === "high" ? "red" : alert.severity === "medium" ? "yellow" : "green"}-500`}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {getAlertIcon(alert.type)}
                      <span>{alert.type} in {alert.zone}</span>
                      <Badge className={getSeverityColor(alert.severity)}>
                        {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)} Risk
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      {alert.date} • Confidence: {(alert.confidence * 100).toFixed(1)}%
                    </CardDescription>
                  </div>
                  <span className="text-xs px-2 py-1 bg-gray-200 rounded-full">
                    {alert.subtype}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">{alert.message}</p>
                
                <Alert className="border-l-4 border-l-blue-500">
                  <Wrench className="h-4 w-4" />
                  <AlertTitle>Recommended Action</AlertTitle>
                  <AlertDescription>
                    {alert.recommendation}
                  </AlertDescription>
                </Alert>
                
                <div className="mt-4 flex justify-between items-center">
                  <div className="flex gap-2">
                    <button className="text-xs px-3 py-1 bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 transition-colors">
                      Schedule Treatment
                    </button>
                    <button className="text-xs px-3 py-1 bg-gray-100 text-gray-800 rounded-full hover:bg-gray-200 transition-colors">
                      Add Note
                    </button>
                  </div>
                  <div className="text-xs text-gray-500">
                    ID: {alert.id}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No alerts found</h3>
              <p className="text-gray-600">
                {filter === "all" 
                  ? "No alerts have been generated for this field" 
                  : `No ${filter} risk alerts found`}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
      
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>Alerts updated: Today at {new Date().toLocaleTimeString()}</p>
      </div>
    </div>
  );
}