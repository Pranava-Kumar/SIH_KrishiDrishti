// frontend/app/dashboard/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TrendingUp, AlertTriangle, Leaf, Map, BarChart3 } from 'lucide-react';
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
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Field Health Dashboard</h1>
      
      {/* Health Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Health Score</CardTitle>
            <Leaf className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData ? dashboardData.healthScore : "N/A"}/100</div>
            <p className="text-xs text-gray-600">Overall field health</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-amber-50 to-orange-50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Risk Level</CardTitle>
            <AlertTriangle className="h-5 w-5 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData ? dashboardData.riskLevel : "N/A"}</div>
            <p className="text-xs text-gray-600">Current threat level</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-blue-50 to-cyan-50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">NDVI Average</CardTitle>
            <TrendingUp className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData ? dashboardData.ndviAvg : "N/A"}</div>
            <p className="text-xs text-gray-600">Vegetation index</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-purple-50 to-indigo-50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertTriangle className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData ? dashboardData.recentAlerts.length : 0}</div>
            <p className="text-xs text-gray-600">Current issues</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Alerts */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Alerts</h2>
        <div className="space-y-4">
          {dashboardData && dashboardData.recentAlerts.map((alert: typeof mockDashboardData.recentAlerts[0]) => (
            <Alert key={alert.id} className={alert.severity === "High" ? "border-l-4 border-l-red-500" : "border-l-4 border-l-amber-500"}>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>{alert.type} - {alert.severity} Risk</AlertTitle>
              <AlertDescription>
                {alert.message} in {alert.zone}. {alert.severity === "High" ? "Immediate action recommended." : "Monitor closely."}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/upload">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Map className="h-5 w-5" />
                Upload Hyperspectral Data
              </CardTitle>
              <CardDescription>Analyze new field data</CardDescription>
            </CardHeader>
          </Card>
        </Link>
        
        <Link href="/field-map">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Map className="h-5 w-5" />
                Field Map
              </CardTitle>
              <CardDescription>Visualize field health</CardDescription>
            </CardHeader>
          </Card>
        </Link>
        
        <Link href="/trends">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Trend Analysis
              </CardTitle>
              <CardDescription>Track health over time</CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
      
      <div className="mt-6 text-center text-sm text-gray-500">
        <p>Data updated: Today at {new Date().toLocaleTimeString()}</p>
      </div>
    </div>
  );
}