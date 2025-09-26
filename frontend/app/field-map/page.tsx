// frontend/app/field-map/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Leaf, Droplets, Eye, AlertTriangle } from 'lucide-react';

// Mock data for the field map
const mockFieldMapData = {
  currentView: "ndvi",
  ndviMap: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iIzAwODAwMCIvPjxyZWN0IHg9IjUwIiB5PSI1MCIgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiMwMGRkMDAiLz48cmVjdCB4PSIxNjAiIHk9IjUwIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzAwYmIwMCIvPjxyZWN0IHg9IjI3MCIgeT0iNTAiIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjMjRkZDI0Ii8+PHJlY3QgeD0iMzgwIiB5PSI1MCIgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiM0NGVlNDQiLz48cmVjdCB4PSI1MCIgeT0iMTYwIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzAwYWEwMCIvPjxyZWN0IHg9IjE2MCIgeT0iMTYwIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzExY2MxMSIvPjxyZWN0IHg9IjI3MCIgeT0iMTYwIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzIyZGRkZiIvPjxyZWN0IHg9IjM4MCIgeT0iMTYwIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzMzZWVlZSIvPjxyZWN0IHg9IjUwIiB5PSIyNzAiIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjMDBkZDAwIi8+PHJlY3QgeD0iMTYwIiB5PSIyNzAiIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjMTFlZTEwIi8+PHJlY3QgeD0iMjcwIiB5PSIyNzAiIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjMjJmZjIwIi8+PHJlY3QgeD0iMzgwIiB5PSIyNzAiIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjMzNmZjMzIi8+PC9zdmc+",
  rgbMap: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2RkZCIvPjxyZWN0IHg9IjUwIiB5PSI1MCIgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNkZmFiNjMiLz48cmVjdCB4PSIxNjAiIHk9IjUwIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2ViYjU2YiIvPjxyZWN0IHg9IjI3MCIgeT0iNTAiIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjZTZjNjZmIi8+PHJlY3QgeD0iMzgwIiB5PSI1MCIgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNmZmNjNjYiLz48cmVjdCB4PSI1MCIgeT0iMTYwIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2QwYjY2MCIvPjxyZWN0IHg9IjE2MCIgeT0iMTYwIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2RmY2I2OCIvPjxyZWN0IHg9IjI3MCIgeT0iMTYwIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2VhZGI3MCIvPjxyZWN0IHg9IjM4MCIgeT0iMTYwIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2ZlZWI3NSIvPjxyZWN0IHg9IjUwIiB5PSIyNzAiIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjZjJjYTY1Ii8+PHJlY3QgeD0iMTYwIiB5PSIyNzAiIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjZmFkYjY4Ii8+PHJlY3QgeD0iMjcwIiB5PSIyNzAiIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjZmVlYjZjIi8+PHJlY3QgeD0iMzgwIiB5PSIyNzAiIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjZmZmZjY2Ii8+PC9zdmc+",
  riskMap: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iIzAwYjY5OSIvPjxyZWN0IHg9IjUwIiB5PSI1MCIgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiMwMGRkMDAiLz48cmVjdCB4PSIxNjAiIHk9IjUwIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzAwZGRhMCIvPjxyZWN0IHg9IjI3MCIgeT0iNTAiIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjMDBhYTAwIi8+PHJlY3QgeD0iMzgwIiB5PSI1MCIgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNmZmNjMDAiLz48cmVjdCB4PSI1MCIgeT0iMTYwIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzAwY2MwMCIvPjxyZWN0IHg9IjE2MCIgeT0iMTYwIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzAwZGRhMCIvPjxyZWN0IHg9IjI3MCIgeT0iMTYwIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzAwYWE1NSIvPjxyZWN0IHg9IjM4MCIgeT0iMTYwIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2ZmMDAwMCIvPjxyZWN0IHg9IjUwIiB5PSIyNzAiIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjMDBkZDAwIi8+PHJlY3QgeD0iMTYwIiB5PSIyNzAiIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjMDBmZjAwIi8+PHJlY3QgeD0iMjcwIiB5PSIyNzAiIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjZmY1NTAwIi8+PHJeY3QgeD0iMzgwIiB5PSIyNzAiIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjZmYwMDAwIi8+PC9zdmc+",
  zones: [
    { id: 1, name: "Zone 1", ndvi: 0.72, risk: "Low", type: "Healthy" },
    { id: 2, name: "Zone 2", ndvi: 0.65, risk: "Medium", type: "Stress" },
    { id: 3, name: "Zone 3", ndvi: 0.32, risk: "High", type: "Pest Risk" },
    { id: 4, name: "Zone 4", ndvi: 0.81, risk: "Low", type: "Healthy" },
  ]
};

export default function FieldMapPage() {
  const [viewType, setViewType] = useState("ndvi");
  const [fieldMapData, setFieldMapData] = useState<typeof mockFieldMapData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, this would fetch from an API
    setTimeout(() => {
      setFieldMapData(mockFieldMapData);
      setLoading(false);
    }, 500);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading field map...</p>
        </div>
      </div>
    );
  }

  const getCurrentMap = () => {
    if (!fieldMapData) return "";
    switch(viewType) {
      case 'rgb':
        return fieldMapData.rgbMap;
      case 'risk':
        return fieldMapData.riskMap;
      default:
        return fieldMapData.ndviMap;
    }
  };

  const getCurrentMapTitle = () => {
    switch(viewType) {
      case 'rgb':
        return "RGB View";
      case 'risk':
        return "Risk Map";
      default:
        return "NDVI Map";
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Interactive Field Map</h1>
        <div className="flex gap-4">
          <Select value={viewType} onValueChange={setViewType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select view" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ndvi">NDVI Map</SelectItem>
              <SelectItem value="rgb">RGB View</SelectItem>
              <SelectItem value="risk">Risk Map</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Droplets className="mr-2 h-4 w-4" />
            Sensor Data
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Map View */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {viewType === 'ndvi' && <Eye className="h-5 w-5" />}
                {viewType === 'rgb' && <Leaf className="h-5 w-5" />}
                {viewType === 'risk' && <AlertTriangle className="h-5 w-5" />}
                {getCurrentMapTitle()}
              </CardTitle>
              <CardDescription>Click on zones to see details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative bg-gray-100 rounded-lg overflow-hidden border">
                <img 
                  src={getCurrentMap() || ""} 
                  alt={getCurrentMapTitle()} 
                  className="w-full h-auto max-h-[500px] object-contain"
                />
                {/* Overlay zones */}
                <div className="absolute inset-0 grid grid-cols-4 grid-rows-3 gap-0">
                                  {fieldMapData && fieldMapData.zones.map((zone: typeof mockFieldMapData.zones[0], index: number) => {
                    const col = index % 4;
                    const row = Math.floor(index / 4);
                    const riskColor = zone.risk === "High" ? "border-red-500" : 
                                     zone.risk === "Medium" ? "border-yellow-500" : "border-green-500";
                    
                    return (
                      <div 
                        key={zone.id}
                        className={`border-2 ${riskColor} hover:bg-opacity-20 hover:bg-blue-200 cursor-pointer transition-all`}
                        style={{
                          gridRowStart: row + 1,
                          gridColumnStart: col + 1
                        }}
                        title={`${zone.name}: ${zone.type} (${zone.risk} risk)`}
                      >
                        <div className="p-1 text-center text-xs font-medium">
                          {zone.name}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="mt-4 flex justify-center gap-6">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-red-500 mr-2"></div>
                  <span className="text-sm">High Risk</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-yellow-500 mr-2"></div>
                  <span className="text-sm">Medium Risk</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-500 mr-2"></div>
                  <span className="text-sm">Low Risk</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Zone Details */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Zone Details</CardTitle>
              <CardDescription>Select a zone to view details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {fieldMapData && fieldMapData.zones.map((zone: typeof mockFieldMapData.zones[0]) => {
                  const riskColor = zone.risk === "High" ? "text-red-600" : 
                                   zone.risk === "Medium" ? "text-yellow-600" : "text-green-600";
                  const bgColor = zone.risk === "High" ? "bg-red-50" : 
                                 zone.risk === "Medium" ? "bg-yellow-50" : "bg-green-50";
                  
                  return (
                    <div 
                      key={zone.id} 
                      className={`p-4 rounded-lg border ${bgColor} cursor-pointer hover:shadow-md transition-shadow`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{zone.name}</h3>
                          <p className="text-sm text-gray-600">{zone.type}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${riskColor} bg-opacity-30`}>
                          {zone.risk} Risk
                        </span>
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                        <div>NDVI: <span className="font-medium">{zone.ndvi}</span></div>
                        <div>Area: <span className="font-medium">{Math.floor(Math.random() * 10) + 1} ha</span></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Legend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-700 mr-2"></div>
                  <span>Excellent Health (NDVI: 0.8-1.0)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-500 mr-2"></div>
                  <span>Good Health (NDVI: 0.6-0.8)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-yellow-500 mr-2"></div>
                  <span>Moderate Health (NDVI: 0.4-0.6)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-red-500 mr-2"></div>
                  <span>Poor Health (NDVI: 0.0-0.4)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}