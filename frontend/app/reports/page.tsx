// frontend/app/reports/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Download, 
  Calendar, 
  AlertTriangle, 
  Leaf, 
  TrendingUp, 
  Droplets, 
  FileText,
  Printer
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Link from 'next/link';

// Define types for the report data
type ReportData = {
  summary: {
    healthScore: number;
    riskLevel: string;
    totalAlerts: number;
    ndviAvg: number;
    lastUpdated: string;
  };
  fieldInfo: {
    name: string;
    cropType: string;
    area: string;
    plantingDate: string;
    location: string;
  };
  alerts: Array<{
    id: number;
    type: string;
    zone: string;
    severity: string;
    message: string;
    date: string;
  }>;
  recommendations: string[];
  trendData: Array<{
    date: string;
    ndvi: number;
    temp: number;
    moisture: number;
  }>;
};

// Mock data for the report
const mockReportData: ReportData = {
  summary: {
    healthScore: 82,
    riskLevel: "Medium",
    totalAlerts: 3,
    ndviAvg: 0.65,
    lastUpdated: "2023-02-19T14:30:00Z"
  },
  fieldInfo: {
    name: "Test Field #1",
    cropType: "Corn",
    area: "12.5 ha",
    plantingDate: "2023-03-15",
    location: "Pune, Maharashtra"
  },
  alerts: [
    { id: 1, type: "Pest Risk", zone: "Zone 3", severity: "High", message: "Aphid risk detected", date: "2023-02-19" },
    { id: 2, type: "Stress", zone: "North Field", severity: "Medium", message: "Water stress identified", date: "2023-02-18" },
    { id: 3, type: "Disease", zone: "Southwest Section", severity: "Medium", message: "Fungal infection detected", date: "2023-02-17" }
  ],
  recommendations: [
    "Apply Imidacloprid 17.8% SL at 1.5 ml/liter of water. Focus treatment on Zone 3.",
    "Increase irrigation frequency by 25%. Monitor soil moisture levels closely.",
    "Apply copper-based fungicide. Ensure proper field drainage."
  ],
  trendData: [
    { date: "2023-01-01", ndvi: 0.45, temp: 22, moisture: 30 },
    { date: "2023-01-08", ndvi: 0.52, temp: 24, moisture: 32 },
    { date: "2023-01-15", ndvi: 0.61, temp: 26, moisture: 28 },
    { date: "2023-01-22", ndvi: 0.65, temp: 25, moisture: 31 },
    { date: "2023-01-29", ndvi: 0.68, temp: 23, moisture: 33 },
    { date: "2023-02-05", ndvi: 0.71, temp: 21, moisture: 30 },
    { date: "2023-02-12", ndvi: 0.73, temp: 20, moisture: 29 },
    { date: "2023-02-19", ndvi: 0.75, temp: 22, moisture: 31 }
  ]
};

export default function ReportsPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("last_month");

  useEffect(() => {
    // In a real app, this would fetch from an API
    setTimeout(() => {
      setReportData(mockReportData);
      setLoading(false);
    }, 500);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading report...</p>
        </div>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    // In a real app, this would generate and download a PDF
    alert("PDF report download would start in a real implementation");
  };

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          .no-print {
            display: none !important;
          }
          
          .print-header {
            display: block !important;
          }
        }
        
        .print-header {
          display: none;
        }
      `}</style>
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Field Health Report</h1>
          <p className="text-gray-600">
            Comprehensive analysis for {reportData?.fieldInfo.name || "Unknown Field"}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3 no-print">
          <Button onClick={handlePrint} variant="outline">
            <Printer className="h-4 w-4 mr-2" />
            Print Report
          </Button>
          
          <Button onClick={handleDownloadPDF}>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          
          <Link href="/dashboard">
            <Button variant="outline">
              <Leaf className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Print Header */}
      <div className="print-header mb-8 p-6 bg-white rounded-lg shadow">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">KrishiDrishti Field Health Report</h1>
            <p className="text-gray-600">
              Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
            </p>
          </div>
          <div className="text-right">
            <p className="font-semibold">{reportData?.fieldInfo.name}</p>
            <p className="text-gray-600">{reportData?.fieldInfo.location}</p>
          </div>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Health Score</CardTitle>
            <Leaf className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reportData?.summary.healthScore || "N/A"}/100
            </div>
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
              reportData?.summary.riskLevel === "High" ? "bg-red-100 text-red-800" :
              reportData?.summary.riskLevel === "Medium" ? "bg-yellow-100 text-yellow-800" :
              "bg-green-100 text-green-800"
            }>
              {reportData?.summary.riskLevel || "N/A"} Risk
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
            <div className="text-2xl font-bold">
              {reportData ? reportData.summary.ndviAvg.toFixed(2) : "N/A"}
            </div>
            <p className="text-xs text-gray-600">Normalized Difference Vegetation Index</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reportData?.summary.totalAlerts || "N/A"}
            </div>
            <p className="text-xs text-gray-600">Requires attention</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
            <Calendar className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reportData ? new Date(reportData.summary.lastUpdated).toLocaleDateString() : "N/A"}
            </div>
            <p className="text-xs text-gray-600">Analysis date</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Field Information */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Field Information
              </CardTitle>
              <CardDescription>Basic details about the analyzed field</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="font-medium">Field Name</div>
                  <div className="text-gray-600">{reportData?.fieldInfo.name || "N/A"}</div>
                </div>
                
                <div>
                  <div className="font-medium">Crop Type</div>
                  <div className="text-gray-600">
                    <span className="font-medium">{reportData?.fieldInfo.cropType || "N/A"}</span>
                  </div>
                </div>
                
                <div>
                  <div className="font-medium">Area</div>
                  <div className="text-gray-600">{reportData?.fieldInfo.area || "N/A"}</div>
                </div>
                
                <div>
                  <div className="font-medium">Planting Date</div>
                  <div className="text-gray-600">
                    {reportData?.fieldInfo.plantingDate 
                      ? new Date(reportData.fieldInfo.plantingDate).toLocaleDateString() 
                      : "N/A"}
                  </div>
                </div>
                
                <div>
                  <div className="font-medium">Location</div>
                  <div className="text-gray-600">{reportData?.fieldInfo.location || "N/A"}</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Recommendations */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Leaf className="h-5 w-5" />
                Recommendations
              </CardTitle>
              <CardDescription>Actionable insights for field management</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportData?.recommendations.map((rec: string, index: number) => (
                  <div key={index} className="flex items-start">
                    <div className="mt-1 w-2 h-2 bg-green-500 rounded-full mr-3 flex-shrink-0"></div>
                    <p className="text-gray-700 text-sm">{rec}</p>
                  </div>
                )) || (
                  <p className="text-gray-600 text-center py-4">No recommendations available</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Charts */}
        <div className="lg:col-span-2">
          {/* Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Temporal Trend Analysis
              </CardTitle>
              <CardDescription>NDVI, temperature, and soil moisture trends</CardDescription>
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
                      name="Soil Moisture (%)" 
                      stroke="#10b981" 
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          {/* Alerts */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Recent Alerts
              </CardTitle>
              <CardDescription>Detected issues requiring attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportData && reportData.alerts.map((alert) => (
                  <div 
                    key={alert.id} 
                    className={`p-4 rounded-lg border-l-4 ${
                      alert.severity === "High" ? "border-l-red-500 bg-red-50" : 
                      alert.severity === "Medium" ? "border-l-amber-500 bg-amber-50" : 
                      "border-l-green-500 bg-green-50"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{alert.type} in {alert.zone}</h3>
                        <p className="text-sm text-gray-600">{alert.message}</p>
                      </div>
                      <Badge className={
                        alert.severity === "High" ? "bg-red-100 text-red-800" :
                        alert.severity === "Medium" ? "bg-yellow-100 text-yellow-800" :
                        "bg-green-100 text-green-800"
                      }>
                        {alert.severity} Risk
                      </Badge>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      Detected on {new Date(alert.date).toLocaleDateString()}
                    </div>
                  </div>
                )) || (
                  <p className="text-gray-600 text-center py-4">No alerts detected</p>
                )}
              </div>
              
              <div className="mt-6 flex justify-center">
                <Link href="/alerts">
                  <Button variant="outline">
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    View All Alerts
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Footer */}
      <div className="mt-12 pt-8 border-t border-gray-200 text-center text-gray-600 text-sm no-print">
        <p>Report generated by KrishiDrishti AI-Powered Crop Health Monitoring System</p>
        <p className="mt-2">© {new Date().getFullYear()} KrishiDrishti. All rights reserved.</p>
      </div>
    </div>
  );
}