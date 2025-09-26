// frontend/app/dashboard/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  AlertTriangle, 
  Leaf, 
  Map, 
  BarChart3,
  Droplets,
  Thermometer,
  Sun,
  Upload
} from 'lucide-react';
import Link from 'next/link';

// Define types for the dashboard data
type AlertData = {
  id: number;
  type: string;
  zone: string;
  severity: string;
  message: string;
};

type SensorDataPoint = {
  date: string;
  ndvi: number;
  temp: number;
  moisture: number;
};

// Mock data for the dashboard
const mockDashboardData = {
  healthScore: 82,
  riskLevel: "Medium",
  recentAlerts: [
    { id: 1, type: "Pest Risk", zone: "Zone 3", severity: "High", message: "Aphid risk detected" },
    { id: 2, type: "Stress", zone: "North Field", severity: "Medium", message: "Water stress identified" }
  ] as AlertData[],
  ndviAvg: 0.65,
  sensorData: [
    { date: "2023-01-01", ndvi: 0.45, temp: 22, moisture: 30 },
    { date: "2023-01-08", ndvi: 0.52, temp: 24, moisture: 32 },
    { date: "2023-01-15", ndvi: 0.61, temp: 26, moisture: 28 },
    { date: "2023-01-22", ndvi: 0.65, temp: 25, moisture: 31 },
  ] as SensorDataPoint[]
};

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<typeof mockDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, this would fetch from an API
    setTimeout(() => {
      setDashboardData(mockDashboardData);
      setLoading(false);
    }, 500);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Field Dashboard</h1>
          <p className="text-gray-600">Monitor your crop health and receive alerts</p>
        </div>
        <Link href="/upload">
          <Button>
            <Upload className="mr-2 h-4 w-4" />
            Upload New Data
          </Button>
        </Link>
      </div>
      
      {/* Health Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Health Score</CardTitle>
            <Leaf className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.healthScore}/100</div>
            <p className="text-xs text-gray-600">Overall field health</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Risk Level</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <Badge className={
              dashboardData?.riskLevel === "High" ? "bg-red-100 text-red-800" :
              dashboardData?.riskLevel === "Medium" ? "bg-yellow-100 text-yellow-800" :
              "bg-green-100 text-green-800"
            }>
              {dashboardData?.riskLevel || "N/A"} Risk
            </Badge>
            <p className="text-xs text-gray-600 mt-2">Current threat level</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">NDVI Average</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.ndviAvg.toFixed(2)}</div>
            <p className="text-xs text-gray-600">Normalized Difference Vegetation Index</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.recentAlerts.length}</div>
            <p className="text-xs text-gray-600">Requires attention</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Alerts */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Recent Alerts
              </CardTitle>
              <CardDescription>Latest risk notifications for your field</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData?.recentAlerts.map((alert) => {
                  const severityColor = alert.severity === "High" ? "text-red-600" : 
                                       alert.severity === "Medium" ? "text-yellow-600" : "text-green-600";
                  const bgColor = alert.severity === "High" ? "bg-red-50" : 
                                 alert.severity === "Medium" ? "bg-yellow-50" : "bg-green-50";
                  
                  return (
                    <Alert key={alert.id} className={`border-l-4 ${alert.severity === "High" ? "border-l-red-500" : alert.severity === "Medium" ? "border-l-amber-500" : "border-l-green-500"} ${bgColor}`}>
                      <AlertTriangle className={`h-4 w-4 ${severityColor}`} />
                      <AlertTitle>{alert.type} in {alert.zone}</AlertTitle>
                      <AlertDescription>
                        {alert.message} - {alert.severity} Risk
                      </AlertDescription>
                    </Alert>
                  );
                })}
              </div>
              
              <div className="mt-6 flex justify-center">
                <Link href="/alerts">
                  <Button variant="outline">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    View All Alerts
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Quick Actions */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sun className="h-5 w-5" />
                Quick Actions
              </CardTitle>
              <CardDescription>Access key features quickly</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4">
                <Link href="/upload">
                  <Card className="hover:shadow-md transition-shadow cursor-pointer border border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-center">
                        <Upload className="h-5 w-5 text-blue-500 mr-3" />
                        <div>
                          <h3 className="font-medium">Upload Data</h3>
                          <p className="text-sm text-gray-600">New field images</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
                
                <Link href="/field-map">
                  <Card className="hover:shadow-md transition-shadow cursor-pointer border border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-center">
                        <Map className="h-5 w-5 text-green-500 mr-3" />
                        <div>
                          <h3 className="font-medium">Field Map</h3>
                          <p className="text-sm text-gray-600">Interactive visualization</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
                
                <Link href="/trends">
                  <Card className="hover:shadow-md transition-shadow cursor-pointer border border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-center">
                        <TrendingUp className="h-5 w-5 text-purple-500 mr-3" />
                        <div>
                          <h3 className="font-medium">Trend Analysis</h3>
                          <p className="text-sm text-gray-600">Historical data trends</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
                
                <Link href="/reports">
                  <Card className="hover:shadow-md transition-shadow cursor-pointer border border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-center">
                        <BarChart3 className="h-5 w-5 text-amber-500 mr-3" />
                        <div>
                          <h3 className="font-medium">Reports</h3>
                          <p className="text-sm text-gray-600">PDF field reports</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            </CardContent>
          </Card>
          
          {/* Environmental Conditions */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Thermometer className="h-5 w-5" />
                Current Conditions
              </CardTitle>
              <CardDescription>Environmental parameters</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <Droplets className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                  <div className="text-lg font-bold text-blue-600">
                    {dashboardData?.sensorData[dashboardData.sensorData.length - 1]?.moisture || "N/A"}%
                  </div>
                  <div className="text-xs text-gray-600">Moisture</div>
                </div>
                <div className="bg-red-50 p-3 rounded-lg">
                  <Thermometer className="h-6 w-6 text-red-500 mx-auto mb-2" />
                  <div className="text-lg font-bold text-red-600">
                    {dashboardData?.sensorData[dashboardData.sensorData.length - 1]?.temp || "N/A"}°C
                  </div>
                  <div className="text-xs text-gray-600">Temperature</div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <Leaf className="h-6 w-6 text-green-500 mx-auto mb-2" />
                  <div className="text-lg font-bold text-green-600">
                    {dashboardData?.ndviAvg.toFixed(2) || "N/A"}
                  </div>
                  <div className="text-xs text-gray-600">NDVI</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}