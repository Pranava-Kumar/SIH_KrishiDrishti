// frontend/app/trends/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Droplets, Thermometer, Eye, TrendingUp } from 'lucide-react';

// Define types for trend data
type TrendDataPoint = {
  date: string;
  value: number;
};

type TrendData = {
  ndvi: TrendDataPoint[];
  temperature: TrendDataPoint[];
  soil_moisture: TrendDataPoint[];
};

// Mock data for trends
const mockTrendData: TrendData = {
  ndvi: [
    { date: '2023-01-01', value: 0.42 },
    { date: '2023-01-08', value: 0.48 },
    { date: '2023-01-15', value: 0.55 },
    { date: '2023-01-22', value: 0.61 },
    { date: '2023-01-29', value: 0.65 },
    { date: '2023-02-05', value: 0.68 },
    { date: '2023-02-12', value: 0.72 },
    { date: '2023-02-19', value: 0.75 },
  ],
  temperature: [
    { date: '2023-01-01', value: 18.5 },
    { date: '2023-01-08', value: 19.2 },
    { date: '2023-01-15', value: 20.1 },
    { date: '2023-01-22', value: 22.4 },
    { date: '2023-01-29', value: 24.6 },
    { date: '2023-02-05', value: 21.3 },
    { date: '2023-02-12', value: 19.8 },
    { date: '2023-02-19', value: 20.7 },
  ],
  soil_moisture: [
    { date: '2023-01-01', value: 28.3 },
    { date: '2023-01-08', value: 30.1 },
    { date: '2023-01-15', value: 29.8 },
    { date: '2023-01-22', value: 32.4 },
    { date: '2023-01-29', value: 35.2 },
    { date: '2023-02-05', value: 31.7 },
    { date: '2023-02-12', value: 29.5 },
    { date: '2023-02-19', value: 30.9 },
  ]
};

export default function TrendsPage() {
  const [dataType, setDataType] = useState("ndvi");
  const [trendData, setTrendData] = useState<TrendData | null>(null);
  const [loading, setLoading] = useState(true);

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
      default:
        return trendData.ndvi;
    }
  };

  const getCurrentTitle = () => {
    switch(dataType) {
      case 'temperature':
        return "Temperature Trends";
      case 'soil_moisture':
        return "Soil Moisture Trends";
      default:
        return "NDVI Trends";
    }
  };

  const getCurrentIcon = () => {
    switch(dataType) {
      case 'temperature':
        return <Thermometer className="h-5 w-5" />;
      case 'soil_moisture':
        return <Droplets className="h-5 w-5" />;
      default:
        return <Eye className="h-5 w-5" />;
    }
  };

  const getCurrentYLabel = () => {
    switch(dataType) {
      case 'temperature':
        return "Temperature (°C)";
      case 'soil_moisture':
        return "Moisture (%)";
      default:
        return "NDVI Value";
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Temporal Trend Analysis</h1>
        <Select value={dataType} onValueChange={setDataType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select data type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ndvi">NDVI</SelectItem>
            <SelectItem value="temperature">Temperature</SelectItem>
            <SelectItem value="soil_moisture">Soil Moisture</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getCurrentIcon()}
            {getCurrentTitle()}
          </CardTitle>
          <CardDescription>
            Track changes in crop health parameters over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={getCurrentData()}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis label={{ value: getCurrentYLabel(), angle: -90, position: 'insideLeft' }} />
                <Tooltip 
                  formatter={(value) => [Number(value).toFixed(2), getCurrentYLabel()]}
                  labelFormatter={(value) => `Date: ${new Date(value).toLocaleDateString()}`}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#3b82f6" 
                  activeDot={{ r: 8 }} 
                  name={getCurrentYLabel()} 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average {getCurrentYLabel()}</CardTitle>
            {getCurrentIcon()}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {getCurrentData().length > 0 
                    ? (getCurrentData().reduce((sum: number, item: TrendDataPoint) => sum + item.value, 0) / getCurrentData().length).toFixed(2) 
                    : "0.00"}
            </div>
            <p className="text-xs text-gray-600">Over selected period</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Max Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {getCurrentData().length > 0 
                    ? Math.max(...getCurrentData().map((item: TrendDataPoint) => item.value)).toFixed(2) 
                    : "0.00"}
            </div>
            <p className="text-xs text-gray-600">
              On {getCurrentData().length > 0 
                  ? new Date(getCurrentData().reduce((a: TrendDataPoint, b: TrendDataPoint) => a.value > b.value ? a : b).date).toLocaleDateString() 
                  : "N/A"}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Min Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {getCurrentData().length > 0 
                    ? Math.min(...getCurrentData().map((item: TrendDataPoint) => item.value)).toFixed(2) 
                    : "0.00"}
            </div>
            <p className="text-xs text-gray-600">
              On {getCurrentData().length > 0 
                  ? new Date(getCurrentData().reduce((a: TrendDataPoint, b: TrendDataPoint) => a.value < b.value ? a : b).date).toLocaleDateString() 
                  : "N/A"}
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Synthetic Sensor Data</CardTitle>
          <CardDescription>Simulated environmental data for crop health analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-800">Temperature</h3>
              <p className="text-2xl font-bold text-blue-600">22.4°C</p>
              <p className="text-sm text-blue-600">Avg. last week</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-medium text-green-800">Soil Moisture</h3>
              <p className="text-2xl font-bold text-green-600">31.2%</p>
              <p className="text-sm text-green-600">Optimal range</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-medium text-purple-800">Humidity</h3>
              <p className="text-2xl font-bold text-purple-600">68%</p>
              <p className="text-sm text-purple-600">Within normal range</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}