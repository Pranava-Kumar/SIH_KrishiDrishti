// frontend/app/trends/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  TrendingUp, 
  Droplets, 
  Thermometer, 
  Eye, 
  Calendar,
  BarChart3,
  LineChart,
  Activity
} from 'lucide-react';
import { 
  LineChart as RechartsLineChart, 
  Line, 
  BarChart as RechartsBarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import Link from 'next/link';

// Define types for the trend data
type TrendDataPoint = {
  date: string;
  ndvi: number;
  temp: number;
  moisture: number;
  humidity: number;
  ndre?: number;
  msi?: number;
  savi?: number;
};

type TrendData = {
  ndvi: TrendDataPoint[];
  temperature: TrendDataPoint[];
  soil_moisture: TrendDataPoint[];
  humidity: TrendDataPoint[];
  composite: TrendDataPoint[];
};

// Mock data for trends
const mockTrendData: TrendData = {
  ndvi: [
    { date: '2023-01-01', ndvi: 0.42, temp: 18.5, moisture: 28.3, humidity: 65 },
    { date: '2023-01-08', ndvi: 0.48, temp: 19.2, moisture: 30.1, humidity: 62 },
    { date: '2023-01-15', ndvi: 0.55, temp: 20.1, moisture: 29.8, humidity: 60 },
    { date: '2023-01-22', ndvi: 0.61, temp: 22.4, moisture: 32.4, humidity: 58 },
    { date: '2023-01-29', ndvi: 0.65, temp: 24.6, moisture: 35.2, humidity: 55 },
    { date: '2023-02-05', ndvi: 0.68, temp: 21.3, moisture: 31.7, humidity: 59 },
    { date: '2023-02-12', ndvi: 0.72, temp: 19.8, moisture: 29.5, humidity: 63 },
    { date: '2023-02-19', ndvi: 0.75, temp: 20.7, moisture: 30.9, humidity: 61 },
  ],
  temperature: [
    { date: '2023-01-01', ndvi: 0.42, temp: 18.5, moisture: 28.3, humidity: 65 },
    { date: '2023-01-08', ndvi: 0.48, temp: 19.2, moisture: 30.1, humidity: 62 },
    { date: '2023-01-15', ndvi: 0.55, temp: 20.1, moisture: 29.8, humidity: 60 },
    { date: '2023-01-22', ndvi: 0.61, temp: 22.4, moisture: 32.4, humidity: 58 },
    { date: '2023-01-29', ndvi: 0.65, temp: 24.6, moisture: 35.2, humidity: 55 },
    { date: '2023-02-05', ndvi: 0.68, temp: 21.3, moisture: 31.7, humidity: 59 },
    { date: '2023-02-12', ndvi: 0.72, temp: 19.8, moisture: 29.5, humidity: 63 },
    { date: '2023-02-19', ndvi: 0.75, temp: 20.7, moisture: 30.9, humidity: 61 },
  ],
  soil_moisture: [
    { date: '2023-01-01', ndvi: 0.42, temp: 18.5, moisture: 28.3, humidity: 65 },
    { date: '2023-01-08', ndvi: 0.48, temp: 19.2, moisture: 30.1, humidity: 62 },
    { date: '2023-01-15', ndvi: 0.55, temp: 20.1, moisture: 29.8, humidity: 60 },
    { date: '2023-01-22', ndvi: 0.61, temp: 22.4, moisture: 32.4, humidity: 58 },
    { date: '2023-01-29', ndvi: 0.65, temp: 24.6, moisture: 35.2, humidity: 55 },
    { date: '2023-02-05', ndvi: 0.68, temp: 21.3, moisture: 31.7, humidity: 59 },
    { date: '2023-02-12', ndvi: 0.72, temp: 19.8, moisture: 29.5, humidity: 63 },
    { date: '2023-02-19', ndvi: 0.75, temp: 20.7, moisture: 30.9, humidity: 61 },
  ],
  humidity: [
    { date: '2023-01-01', ndvi: 0.42, temp: 18.5, moisture: 28.3, humidity: 65 },
    { date: '2023-01-08', ndvi: 0.48, temp: 19.2, moisture: 30.1, humidity: 62 },
    { date: '2023-01-15', ndvi: 0.55, temp: 20.1, moisture: 29.8, humidity: 60 },
    { date: '2023-01-22', ndvi: 0.61, temp: 22.4, moisture: 32.4, humidity: 58 },
    { date: '2023-01-29', ndvi: 0.65, temp: 24.6, moisture: 35.2, humidity: 55 },
    { date: '2023-02-05', ndvi: 0.68, temp: 21.3, moisture: 31.7, humidity: 59 },
    { date: '2023-02-12', ndvi: 0.72, temp: 19.8, moisture: 29.5, humidity: 63 },
    { date: '2023-02-19', ndvi: 0.75, temp: 20.7, moisture: 30.9, humidity: 61 },
  ],
  composite: [
    { date: '2023-01-01', ndvi: 0.42, temp: 18.5, moisture: 28.3, humidity: 65, ndre: 0.38, msi: 0.75, savi: 0.40 },
    { date: '2023-01-08', ndvi: 0.48, temp: 19.2, moisture: 30.1, humidity: 62, ndre: 0.45, msi: 0.72, savi: 0.46 },
    { date: '2023-01-15', ndvi: 0.55, temp: 20.1, moisture: 29.8, humidity: 60, ndre: 0.52, msi: 0.69, savi: 0.53 },
    { date: '2023-01-22', ndvi: 0.61, temp: 22.4, moisture: 32.4, humidity: 58, ndre: 0.58, msi: 0.65, savi: 0.59 },
    { date: '2023-01-29', ndvi: 0.65, temp: 24.6, moisture: 35.2, humidity: 55, ndre: 0.62, msi: 0.62, savi: 0.63 },
    { date: '2023-02-05', ndvi: 0.68, temp: 21.3, moisture: 31.7, humidity: 59, ndre: 0.65, msi: 0.66, savi: 0.66 },
    { date: '2023-02-12', ndvi: 0.72, temp: 19.8, moisture: 29.5, humidity: 63, ndre: 0.69, msi: 0.68, savi: 0.70 },
    { date: '2023-02-19', ndvi: 0.75, temp: 20.7, moisture: 30.9, humidity: 61, ndre: 0.72, msi: 0.67, savi: 0.73 },
  ]
};

export default function TrendsPage() {
  const [trendData, setTrendData] = useState<TrendData | null>(null);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState("line");
  const [dataType, setDataType] = useState("composite");
  const [timeRange, setTimeRange] = useState("last_month");

  useEffect(() => {
    // In a real app, this would fetch from an API
    setTimeout(() => {
      setTrendData(mockTrendData);
      setLoading(false);
    }, 500);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading trend data...</p>
        </div>
      </div>
    );
  }

  const getCurrentData = () => {
    if (!trendData) return [];
    switch(dataType) {
      case 'temperature':
        return trendData.temperature;
      case 'soil_moisture':
        return trendData.soil_moisture;
      case 'humidity':
        return trendData.humidity;
      case 'ndvi':
        return trendData.ndvi;
      default:
        return trendData.composite;
    }
  };

  const getCurrentTitle = () => {
    switch(dataType) {
      case 'temperature':
        return "Temperature Trends";
      case 'soil_moisture':
        return "Soil Moisture Trends";
      case 'humidity':
        return "Humidity Trends";
      case 'ndvi':
        return "NDVI Trends";
      default:
        return "Composite Analysis";
    }
  };

  const getCurrentIcon = () => {
    switch(dataType) {
      case 'temperature':
        return <Thermometer className="h-5 w-5" />;
      case 'soil_moisture':
        return <Droplets className="h-5 w-5" />;
      case 'humidity':
        return <Activity className="h-5 w-5" />;
      case 'ndvi':
        return <Eye className="h-5 w-5" />;
      default:
        return <BarChart3 className="h-5 w-5" />;
    }
  };

  const getCurrentYLabel = () => {
    switch(dataType) {
      case 'temperature':
        return "Temperature (°C)";
      case 'soil_moisture':
        return "Moisture (%)";
      case 'humidity':
        return "Humidity (%)";
      case 'ndvi':
        return "NDVI Value";
      default:
        return "Index Values";
    }
  };

  const renderChart = () => {
    const data = getCurrentData();
    
    if (chartType === "bar") {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <RechartsBarChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            />
            <YAxis label={{ value: getCurrentYLabel(), angle: -90, position: 'insideLeft' }} />
            <Tooltip 
              formatter={(value, name) => {
                if (name === 'ndvi') return [Number(value).toFixed(2), 'NDVI'];
                if (name === 'temp') return [Number(value).toFixed(1) + '°C', 'Temperature'];
                if (name === 'moisture') return [Number(value).toFixed(1) + '%', 'Moisture'];
                if (name === 'humidity') return [Number(value).toFixed(1) + '%', 'Humidity'];
                if (name === 'ndre') return [Number(value).toFixed(2), 'NDRE'];
                if (name === 'msi') return [Number(value).toFixed(2), 'MSI'];
                if (name === 'savi') return [Number(value).toFixed(2), 'SAVI'];
                return [Number(value).toFixed(2), name];
              }}
              labelFormatter={(value) => `Date: ${new Date(value).toLocaleDateString()}`}
            />
            <Legend />
            {dataType === "composite" ? (
              <>
                <Bar dataKey="ndvi" name="NDVI" fill="#3b82f6" />
                <Bar dataKey="ndre" name="NDRE" fill="#10b981" />
                <Bar dataKey="msi" name="MSI" fill="#f59e0b" />
                <Bar dataKey="savi" name="SAVI" fill="#8b5cf6" />
              </>
            ) : (
              <Bar 
                dataKey={
                  dataType === "temperature" ? "temp" : 
                  dataType === "soil_moisture" ? "moisture" : 
                  dataType === "humidity" ? "humidity" : "ndvi"
                } 
                name={getCurrentYLabel()} 
                fill={
                  dataType === "temperature" ? "#ef4444" : 
                  dataType === "soil_moisture" ? "#3b82f6" : 
                  dataType === "humidity" ? "#8b5cf6" : "#10b981"
                } 
              />
            )}
          </RechartsBarChart>
        </ResponsiveContainer>
      );
    } else if (chartType === "area") {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            />
            <YAxis label={{ value: getCurrentYLabel(), angle: -90, position: 'insideLeft' }} />
            <Tooltip 
              formatter={(value, name) => {
                if (name === 'ndvi') return [Number(value).toFixed(2), 'NDVI'];
                if (name === 'temp') return [Number(value).toFixed(1) + '°C', 'Temperature'];
                if (name === 'moisture') return [Number(value).toFixed(1) + '%', 'Moisture'];
                if (name === 'humidity') return [Number(value).toFixed(1) + '%', 'Humidity'];
                if (name === 'ndre') return [Number(value).toFixed(2), 'NDRE'];
                if (name === 'msi') return [Number(value).toFixed(2), 'MSI'];
                if (name === 'savi') return [Number(value).toFixed(2), 'SAVI'];
                return [Number(value).toFixed(2), name];
              }}
              labelFormatter={(value) => `Date: ${new Date(value).toLocaleDateString()}`}
            />
            <Legend />
            {dataType === "composite" ? (
              <>
                <Area type="monotone" dataKey="ndvi" name="NDVI" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                <Area type="monotone" dataKey="ndre" name="NDRE" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                <Area type="monotone" dataKey="msi" name="MSI" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} />
                <Area type="monotone" dataKey="savi" name="SAVI" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
              </>
            ) : (
              <Area 
                type="monotone"
                dataKey={
                  dataType === "temperature" ? "temp" : 
                  dataType === "soil_moisture" ? "moisture" : 
                  dataType === "humidity" ? "humidity" : "ndvi"
                } 
                name={getCurrentYLabel()} 
                stroke={
                  dataType === "temperature" ? "#ef4444" : 
                  dataType === "soil_moisture" ? "#3b82f6" : 
                  dataType === "humidity" ? "#8b5cf6" : "#10b981"
                } 
                fill={
                  dataType === "temperature" ? "#ef4444" : 
                  dataType === "soil_moisture" ? "#3b82f6" : 
                  dataType === "humidity" ? "#8b5cf6" : "#10b981"
                } 
                fillOpacity={0.3}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      );
    } else {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <RechartsLineChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            />
            <YAxis label={{ value: getCurrentYLabel(), angle: -90, position: 'insideLeft' }} />
            <Tooltip 
              formatter={(value, name) => {
                if (name === 'ndvi') return [Number(value).toFixed(2), 'NDVI'];
                if (name === 'temp') return [Number(value).toFixed(1) + '°C', 'Temperature'];
                if (name === 'moisture') return [Number(value).toFixed(1) + '%', 'Moisture'];
                if (name === 'humidity') return [Number(value).toFixed(1) + '%', 'Humidity'];
                if (name === 'ndre') return [Number(value).toFixed(2), 'NDRE'];
                if (name === 'msi') return [Number(value).toFixed(2), 'MSI'];
                if (name === 'savi') return [Number(value).toFixed(2), 'SAVI'];
                return [Number(value).toFixed(2), name];
              }}
              labelFormatter={(value) => `Date: ${new Date(value).toLocaleDateString()}`}
            />
            <Legend />
            {dataType === "composite" ? (
              <>
                <Line type="monotone" dataKey="ndvi" name="NDVI" stroke="#3b82f6" strokeWidth={2} activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="ndre" name="NDRE" stroke="#10b981" strokeWidth={2} />
                <Line type="monotone" dataKey="msi" name="MSI" stroke="#f59e0b" strokeWidth={2} />
                <Line type="monotone" dataKey="savi" name="SAVI" stroke="#8b5cf6" strokeWidth={2} />
              </>
            ) : (
              <Line 
                type="monotone" 
                dataKey={
                  dataType === "temperature" ? "temp" : 
                  dataType === "soil_moisture" ? "moisture" : 
                  dataType === "humidity" ? "humidity" : "ndvi"
                } 
                name={getCurrentYLabel()} 
                stroke={
                  dataType === "temperature" ? "#ef4444" : 
                  dataType === "soil_moisture" ? "#3b82f6" : 
                  dataType === "humidity" ? "#8b5cf6" : "#10b981"
                } 
                strokeWidth={2}
                activeDot={{ r: 8 }} 
              />
            )}
          </RechartsLineChart>
        </ResponsiveContainer>
      );
    }
  };

  const getStats = () => {
    const data = getCurrentData();
    if (data.length === 0) return { avg: 0, min: 0, max: 0, latest: 0 };
    
    const values = data.map(item => 
      dataType === "temperature" ? item.temp : 
      dataType === "soil_moisture" ? item.moisture : 
      dataType === "humidity" ? item.humidity : item.ndvi
    );
    
    return {
      avg: values.reduce((sum, val) => sum + val, 0) / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      latest: values[values.length - 1]
    };
  };

  const stats = getStats();

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Temporal Trend Analysis</h1>
          <p className="text-gray-600">Track crop health metrics over time with detailed analytics</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last_week">Last Week</SelectItem>
              <SelectItem value="last_month">Last Month</SelectItem>
              <SelectItem value="last_quarter">Last Quarter</SelectItem>
              <SelectItem value="last_year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          
          <Link href="/dashboard">
            <Button variant="outline">
              <TrendingUp className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Controls */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getCurrentIcon()}
            {getCurrentTitle()}
          </CardTitle>
          <CardDescription>Customize your trend analysis view</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">Data Type</label>
              <Select value={dataType} onValueChange={setDataType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select data type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="composite">Composite Analysis</SelectItem>
                  <SelectItem value="ndvi">NDVI</SelectItem>
                  <SelectItem value="temperature">Temperature</SelectItem>
                  <SelectItem value="soil_moisture">Soil Moisture</SelectItem>
                  <SelectItem value="humidity">Humidity</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">Chart Type</label>
              <Select value={chartType} onValueChange={setChartType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select chart type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="line">Line Chart</SelectItem>
                  <SelectItem value="bar">Bar Chart</SelectItem>
                  <SelectItem value="area">Area Chart</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button onClick={() => window.print()}>
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Average Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.avg ? stats.avg.toFixed(2) : "N/A"} {dataType === "temperature" ? "°C" : dataType === "soil_moisture" || dataType === "humidity" ? "%" : ""}
            </div>
            <p className="text-xs text-gray-600">Selected metric</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Minimum Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.min ? stats.min.toFixed(2) : "N/A"} {dataType === "temperature" ? "°C" : dataType === "soil_moisture" || dataType === "humidity" ? "%" : ""}
            </div>
            <p className="text-xs text-gray-600">Lowest recorded</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Maximum Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.max ? stats.max.toFixed(2) : "N/A"} {dataType === "temperature" ? "°C" : dataType === "soil_moisture" || dataType === "humidity" ? "%" : ""}
            </div>
            <p className="text-xs text-gray-600">Highest recorded</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Latest Value</CardTitle>
            <Calendar className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.latest ? stats.latest.toFixed(2) : "N/A"} {dataType === "temperature" ? "°C" : dataType === "soil_moisture" || dataType === "humidity" ? "%" : ""}
            </div>
            <p className="text-xs text-gray-600">Most recent reading</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Chart */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Trend Visualization</CardTitle>
          <CardDescription>
            {getCurrentTitle()} over the selected time period
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-96">
            {renderChart()}
          </div>
        </CardContent>
      </Card>
      
      {/* Composite Metrics */}
      {dataType === "composite" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">NDVI</CardTitle>
              <Eye className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.latest ? stats.latest.toFixed(2) : "N/A"}</div>
              <p className="text-xs text-gray-600">Latest reading</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">NDRE</CardTitle>
              <Leaf className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockReportData.composite[mockReportData.composite.length - 1]?.ndre?.toFixed(2) || "N/A"}</div>
              <p className="text-xs text-gray-600">Red edge index</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">MSI</CardTitle>
              <Droplets className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockReportData.composite[mockReportData.composite.length - 1]?.msi?.toFixed(2) || "N/A"}</div>
              <p className="text-xs text-gray-600">Moisture stress index</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">SAVI</CardTitle>
              <Activity className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockReportData.composite[mockReportData.composite.length - 1]?.savi?.toFixed(2) || "N/A"}</div>
              <p className="text-xs text-gray-600">Soil adjusted vegetation</p>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Data Insights & Recommendations
          </CardTitle>
          <CardDescription>Actionable insights from trend analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">Trend Observations</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <div className="mt-1 w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <p className="text-sm text-gray-700">
                    NDVI values have shown consistent improvement over the past month, indicating healthy crop growth.
                  </p>
                </li>
                <li className="flex items-start">
                  <div className="mt-1 w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                  <p className="text-sm text-gray-700">
                    Soil moisture levels fluctuate with irrigation schedule. Consider adjusting frequency for consistency.
                  </p>
                </li>
                <li className="flex items-start">
                  <div className="mt-1 w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  <p className="text-sm text-gray-700">
                    Temperature variations correlate with NDVI changes. Maintain optimal growing conditions.
                  </p>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">Actions to Consider</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <div className="mt-1 w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">High Priority:</span> Apply nitrogen-rich fertilizer to boost growth in areas with slightly lower NDVI values.
                  </p>
                </li>
                <li className="flex items-start">
                  <div className="mt-1 w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Medium Priority:</span> Optimize irrigation timing to maintain consistent soil moisture between 30-35%.
                  </p>
                </li>
                <li className="flex items-start">
                  <div className="mt-1 w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Low Priority:</span> Continue regular monitoring and adjust practices based on upcoming weather forecasts.
                  </p>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Report generated: {new Date().toLocaleDateString()}</p>
                <p className="text-xs text-gray-500">Data source: Hyperspectral analysis and sensor readings</p>
              </div>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Full Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}