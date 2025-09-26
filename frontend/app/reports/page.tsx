// frontend/app/reports/page.tsx

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Calendar, AlertTriangle, Leaf, TrendingUp, Droplets, Wrench, Thermometer } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

// Mock data for reports
const mockReportData = {
  fieldInfo: {
    name: "Test Field #1",
    cropType: "Corn",
    area: "12.5 ha",
    plantingDate: "2023-03-15",
    location: "Pune, Maharashtra"
  },
  summary: {
    healthScore: 78,
    riskLevel: "Medium",
    totalAlerts: 8,
    ndviAverage: 0.64,
    lastUpdated: "2023-02-19"
  },
  trendData: [
    { date: '2023-01-01', ndvi: 0.42, temp: 18.5, moisture: 28.3 },
    { date: '2023-01-08', ndvi: 0.48, temp: 19.2, moisture: 30.1 },
    { date: '2023-01-15', ndvi: 0.55, temp: 20.1, moisture: 29.8 },
    { date: '2023-01-22', ndvi: 0.61, temp: 22.4, moisture: 32.4 },
    { date: '2023-01-29', ndvi: 0.65, temp: 24.6, moisture: 35.2 },
    { date: '2023-02-05', ndvi: 0.68, temp: 21.3, moisture: 31.7 },
    { date: '2023-02-12', ndvi: 0.72, temp: 19.8, moisture: 29.5 },
    { date: '2023-02-19', ndvi: 0.75, temp: 20.7, moisture: 30.9 },
  ] as { date: string; ndvi: number; temp: number; moisture: number }[],
  alerts: [
    { id: 1, type: "Pest Risk", zone: "Zone 3", severity: "High", date: "2023-02-19" },
    { id: 2, type: "Stress", zone: "North Field", severity: "Medium", date: "2023-02-18" },
    { id: 3, type: "Disease", zone: "Southwest", severity: "Medium", date: "2023-02-17" },
  ],
  recommendations: [
    "Apply nitrogen-rich fertilizer to address nutrient deficiency",
    "Monitor Zone 3 closely for aphid infestation",
    "Adjust irrigation schedule to maintain optimal soil moisture"
  ]
};

export default function ReportsPage() {
  const [reportData, setReportData] = useState<typeof mockReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState("field");
  const reportRef = useRef(null);

  useEffect(() => {
    // In a real app, this would fetch from an API
    setTimeout(() => {
      setReportData(mockReportData);
      setLoading(false);
    }, 500);
  }, []);

  const handleDownload = () => {
    // In a real implementation, this would generate and download a PDF
    alert("Report download would start in a real implementation");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Generating report...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Field Health Reports</h1>
        <div className="flex gap-4">
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select report type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="field">Field Report</SelectItem>
              <SelectItem value="trend">Trend Analysis</SelectItem>
              <SelectItem value="alert">Alert Summary</SelectItem>
              <SelectItem value="comprehensive">Comprehensive</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>
      
      <div ref={reportRef} className="space-y-8">
        {/* Executive Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Leaf className="h-5 w-5" />
              Executive Summary
            </CardTitle>
            <CardDescription>Field health overview and key metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600">{reportData ? reportData.summary.healthScore : "N/A"}</div>
                <div className="text-sm text-gray-600">Health Score</div>
              </div>
              <Badge className={
                reportData?.summary.riskLevel === "High" ? "bg-red-100 text-red-800" :
                reportData?.summary.riskLevel === "Medium" ? "bg-yellow-100 text-yellow-800" :
                "bg-green-100 text-green-800"
              }>
                {reportData?.summary.riskLevel || "N/A"} Risk
              </Badge>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-3xl font-bold text-red-600">{reportData ? reportData.summary.totalAlerts : "N/A"}</div>
                <div className="text-sm text-gray-600">Active Alerts</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{reportData ? reportData.summary.ndviAverage : "N/A"}</div>
                <div className="text-sm text-gray-600">NDVI Average</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-gray-600 mr-1" />
                  <span className="text-sm text-gray-600">Updated</span>
                </div>
                <div className="text-sm font-medium">{reportData ? reportData.summary.lastUpdated : "N/A"}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Field Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Field Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Field Name:</span>
                <div className="font-medium">{reportData ? reportData.fieldInfo.name : "N/A"}</div>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Crop Type:</span>
                <span className="font-medium">{reportData ? reportData.fieldInfo.cropType : "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Area:</span>
                <span className="font-medium">{reportData ? reportData.fieldInfo.area : "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Planting Date:</span>
                <span className="font-medium">{reportData ? reportData.fieldInfo.plantingDate : "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Location:</span>
                <span className="font-medium">{reportData ? reportData.fieldInfo.location : "N/A"}</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Recent Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                                  {reportData && reportData.alerts.map((alert: typeof mockReportData.alerts[0], index: number) => (
                  <div key={alert.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <AlertTriangle className={
                        alert.severity === "High" ? "h-5 w-5 text-red-600 mr-2" :
                        alert.severity === "Medium" ? "h-5 w-5 text-yellow-600 mr-2" :
                        "h-5 w-5 text-green-600 mr-2"
                      } />
                      <div>
                        <div className="font-medium">{alert.type}</div>
                        <div className="text-sm text-gray-600">{alert.zone}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{alert.date}</div>
                      <Badge className={
                        alert.severity === "High" ? "bg-red-100 text-red-800" :
                        alert.severity === "Medium" ? "bg-yellow-100 text-yellow-800" :
                        "bg-green-100 text-green-800"
                      }>
                        {alert.severity}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Trend Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Trend Analysis
            </CardTitle>
            <CardDescription>NDVI, temperature, and soil moisture trends over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={reportData ? reportData.trendData : []}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip 
                    formatter={(value, name) => {
                      if (name === 'ndvi') return [Number(value).toFixed(2), 'NDVI'];
                      if (name === 'temp') return [Number(value).toFixed(1) + '°C', 'Temperature'];
                      if (name === 'moisture') return [Number(value).toFixed(1) + '%', 'Moisture'];
                      return [Number(value).toFixed(2), name];
                    }}
                    labelFormatter={(value) => `Date: ${new Date(value).toLocaleDateString()}`}
                  />
                  <Legend />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="ndvi" 
                    name="NDVI" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    activeDot={{ r: 8 }} 
                  />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="temp" 
                    name="Temperature (°C)" 
                    stroke="#ef4444" 
                    strokeWidth={2}
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="moisture" 
                    name="Moisture (%)" 
                    stroke="#10b981" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
            <CardDescription>Actionable insights for optimal field management</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
                                {reportData && reportData.recommendations.map((rec: string, index: number) => (
                <div key={index} className="flex items-start p-4 bg-blue-50 rounded-lg">
                  <Wrench className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                  <div>{rec}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Additional Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Zonal Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { name: 'Zone 1', ndvi: 0.72, risk: 1 },
                      { name: 'Zone 2', ndvi: 0.65, risk: 2 },
                      { name: 'Zone 3', ndvi: 0.32, risk: 4 },
                      { name: 'Zone 4', ndvi: 0.81, risk: 0 },
                      { name: 'Zone 5', ndvi: 0.58, risk: 2 },
                    ]}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" orientation="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="ndvi" name="NDVI" fill="#3b82f6" />
                    <Bar yAxisId="right" dataKey="risk" name="Risk Level" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Environmental Conditions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center">
                <div className="grid grid-cols-2 gap-6 w-full">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Droplets className="h-10 w-10 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-blue-600">30.9%</div>
                    <div className="text-sm text-gray-600">Soil Moisture</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <Thermometer className="h-10 w-10 text-red-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-red-600">20.7°C</div>
                    <div className="text-sm text-gray-600">Avg Temperature</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <Leaf className="h-10 w-10 text-green-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-green-600">0.75</div>
                    <div className="text-sm text-gray-600">Current NDVI</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <AlertTriangle className="h-10 w-10 text-yellow-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-yellow-600">Medium</div>
                    <div className="text-sm text-gray-600">Risk Level</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}