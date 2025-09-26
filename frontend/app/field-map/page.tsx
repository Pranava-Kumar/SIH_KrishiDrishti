// frontend/app/field-map/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Leaf, 
  Droplets, 
  Eye, 
  AlertTriangle,
  MapPin,
  Navigation,
  Layers,
  Grid3X3,
  Upload,
  BarChart3
} from 'lucide-react';
import Link from 'next/link';

// Define types for the field map data
type ZoneData = {
  id: number;
  name: string;
  ndvi: number;
  risk: string;
  type: string;
};

type FieldMapData = {
  currentView: string;
  ndviMap: string;
  rgbMap: string;
  riskMap: string;
  zones: ZoneData[];
};

// Mock data for the field map
const mockFieldMapData: FieldMapData = {
  currentView: "ndvi",
  ndviMap: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iIzAwODAwMCIvPjxyZWN0IHg9IjUwIiB5PSI1MCIgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiMwMGRkMDAiLz48cmVjdCB4PSIxNjAiIHk9IjUwIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzAwYmIwMCIvPjxyZWN0IHg9IjI3MCIgeT0iNTAiIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjMjRkZDI0Ii8+PHJlY3QgeD0iMzgwIiB5PSI1MCIgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiM0NGVlNDQiLz48cmVjdCB4PSI1MCIgeT0iMTYwIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzAwYWEwMCIvPjxyZWN0IHg9IjE2MCIgeT0iMTYwIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzExY2MxMSIvPjxyZWN0IHg9IjI3MCIgeT0iMTYwIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzIyZGRkZiIvPjxyZWN0IHg9IjM4MCIgeT0iMTYwIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzMzZWVlZSIvPjxyZWN0IHg9IjUwIiB5PSIyNzAiIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjMDBkZDAwIi8+PHJlY3QgeD0iMTYwIiB5PSIyNzAiIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjMTFlZTEwIi8+PHJlY3QgeD0iMjcwIiB5PSIyNzAiIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjMjJmZjIwIi8+PHJlY3QgeD0iMzgwIiB5PSIyNzAiIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjMzNmZjMzIi8+PC9zdmc+",
  rgbMap: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2RkZCIvPjxyZWN0IHg9IjUwIiB5PSI1MCIgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNkZmFiNjMiLz48cmVjdCB4PSIxNjAiIHk9IjUwIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2ViYjU2YiIvPjxyZWN0IHg9IjI3MCIgeT0iNTAiIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjZTZjNjZmIi8+PHJlY3QgeD0iMzgwIiB5PSI1MCIgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNmZmNjNjYiLz48cmVjdCB4PSI1MCIgeT0iMTYwIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2QwYjY2MCIvPjxyZWN0IHg9IjE2MCIgeT0iMTYwIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2RmY2I2OCIvPjxyZWN0IHg9IjI3MCIgeT0iMTYwIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2VhZGI3MCIvPjxyZWN0IHg9IjM4MCIgeT0iMTYwIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2ZlZWI3NSIvPjxyZWN0IHg9IjUwIiB5PSIyNzAiIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjZjJjYTY1Ii8+PHJlY3QgeD0iMTYwIiB5PSIyNzAiIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjZmFkYjY4Ii8+PHJlY3QgeD0iMjcwIiB5PSIyNzAiIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjZmVlYjZjIi8+PHJlY3QgeD0iMzgwIiB5PSIyNzAiIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjZmZmZjY2Ii8+PC9zdmc+",
  riskMap: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iIzAwYjY5OSIvPjxyZWN0IHg9IjUwIiB5PSI1MCIgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiMwMGRkMDAiLz48cmVjdCB4PSIxNjAiIHk9IjUwIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzAwZGRhMCIvPjxyZWN0IHg9IjI3MCIgeT0iNTAiIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjMDBhYTAwIi8+PHJlY3QgeD0iMzgwIiB5PSI1MCIgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNmZmNjMDAiLz48cmVjdCB4PSI1MCIgeT0iMTYwIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzAwY2MwMCIvPjxyZWN0IHg9IjE2MCIgeT0iMTYwIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzAwZGRhMCIvPjxyZWN0IHg9IjI3MCIgeT0iMTYwIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzAwYWE1NSIvPjxyZWN0IHg9IjM4MCIgeT0iMTYwIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2ZmMDAwMCIvPjxyZWN0IHg9IjUwIiB5PSIyNzAiIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjMDBkZDAwIi8+PHJlY3QgeD0iMTYwIiB5PSIyNzAiIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjMDBmZjAwIi8+PHJlY3QgeD0iMjcwIiB5PSIyNzAiIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjZmY1NTAwIi8+PHJeY3QgeD0iMzgwIiB5PSIyNzAiIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjZmYwMDAwIi8+PC9zdmc+",
  zones: [
    { id: 1, name: "Zone 1", ndvi: 0.72, risk: "Low", type: "Healthy" },
    { id: 2, name: "Zone 2", ndvi: 0.65, risk: "Medium", type: "Stress" },
    { id: 3, name: "Zone 3", ndvi: 0.32, risk: "High", type: "Pest Risk" },
    { id: 4, name: "Zone 4", ndvi: 0.81, risk: "Low", type: "Healthy" },
  ] as ZoneData[]
};

export default function FieldMapPage() {
  const [viewType, setViewType] = useState("ndvi");
  const [fieldMapData, setFieldMapData] = useState<FieldMapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedZone, setSelectedZone] = useState<ZoneData | null>(null);

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

  const getCurrentMapIcon = () => {
    switch(viewType) {
      case 'rgb':
        return <Leaf className="h-5 w-5" />;
      case 'risk':
        return <AlertTriangle className="h-5 w-5" />;
      default:
        return <Eye className="h-5 w-5" />;
    }
  };

  const handleZoneClick = (zone: ZoneData) => {
    setSelectedZone(zone);
  };

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      {/* Header with Navigation */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Interactive Field Map</h1>
          <p className="text-gray-600">Visualize crop health and risk zones</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              <Navigation className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
          </Link>
          
          <Link href="/trends">
            <Button variant="outline" size="sm">
              <Layers className="h-4 w-4 mr-2" />
              Trends
            </Button>
          </Link>
          
          <Link href="/alerts">
            <Button variant="outline" size="sm">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Alerts
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Map View */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {getCurrentMapIcon()}
                    {getCurrentMapTitle()}
                  </CardTitle>
                  <CardDescription>Click on zones to see details</CardDescription>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Select value={viewType} onValueChange={setViewType}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="Select view" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ndvi">
                        <div className="flex items-center gap-2">
                          <Eye className="h-4 w-4" />
                          NDVI Map
                        </div>
                      </SelectItem>
                      <SelectItem value="rgb">
                        <div className="flex items-center gap-2">
                          <Leaf className="h-4 w-4" />
                          RGB View
                        </div>
                      </SelectItem>
                      <SelectItem value="risk">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4" />
                          Risk Map
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button variant="outline" size="sm">
                    <Droplets className="h-4 w-4 mr-2" />
                    Sensor Data
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative bg-gray-100 rounded-lg overflow-hidden border">
                <img 
                  src={getCurrentMap() || ""} 
                  alt={getCurrentMapTitle()} 
                  className="w-full h-auto max-h-[500px] object-contain"
                />
                {/* Overlay zones */}
                <div className="absolute inset-0 grid grid-cols-2 gap-0">
                  {fieldMapData?.zones.map((zone: ZoneData, index: number) => {
                    const riskColor = zone.risk === "High" ? "border-red-500" : 
                                     zone.risk === "Medium" ? "border-yellow-500" : "border-green-500";
                    
                    return (
                      <div 
                        key={zone.id}
                        className={`border-2 ${riskColor} hover:bg-opacity-20 hover:bg-blue-200 cursor-pointer transition-all`}
                        style={{
                          gridRowStart: Math.floor(index / 2) + 1,
                          gridColumnStart: (index % 2) + 1
                        }}
                        onClick={() => handleZoneClick(zone)}
                        title={`${zone.name}: ${zone.type} (${zone.risk} risk)`}
                      >
                        <div className="p-2 text-center">
                          <div className="font-semibold text-sm">{zone.name}</div>
                          <div className="text-xs opacity-80">{zone.type}</div>
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
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Zone Information
              </CardTitle>
              <CardDescription>Field zone details and recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              {selectedZone ? (
                <div className="space-y-4">
                  <div className={`p-4 rounded-lg border ${
                    selectedZone.risk === "High" ? "bg-red-50 border-red-200" : 
                    selectedZone.risk === "Medium" ? "bg-yellow-50 border-yellow-200" : 
                    "bg-green-50 border-green-200"
                  }`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">{selectedZone.name}</h3>
                        <p className="text-gray-700">{selectedZone.type}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        selectedZone.risk === "High" ? "bg-red-100 text-red-800" : 
                        selectedZone.risk === "Medium" ? "bg-yellow-100 text-yellow-800" : 
                        "bg-green-100 text-green-800"
                      }`}>
                        {selectedZone.risk} Risk
                      </span>
                    </div>
                    
                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      <div className="bg-white p-2 rounded">
                        <div className="text-gray-500">NDVI</div>
                        <div className="font-semibold">{selectedZone.ndvi}</div>
                      </div>
                      <div className="bg-white p-2 rounded">
                        <div className="text-gray-500">Area</div>
                        <div className="font-semibold">{Math.floor(Math.random() * 10) + 1} ha</div>
                      </div>
                    </div>
                  </div>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Recommendations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-start">
                          <div className="mt-1 w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                          <p className="text-sm">
                            {selectedZone.risk === "High" ? 
                              "Apply appropriate pesticide treatment immediately. Consider Integrated Pest Management practices." : 
                              selectedZone.risk === "Medium" ? 
                              "Monitor this zone closely for 2-3 days. Increase surveillance." : 
                              "Continue regular maintenance practices. No immediate action required."}
                          </p>
                        </div>
                        <div className="flex items-start">
                          <div className="mt-1 w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                          <p className="text-sm">
                            {selectedZone.type.includes("Stress") ? 
                              "Consider adjusting irrigation schedule and applying balanced fertilizer." : 
                              "Maintain current practices and continue monitoring for any changes."}
                          </p>
                        </div>
                      </div>
                      
                      <Button className="w-full mt-4">
                        <Grid3X3 className="h-4 w-4 mr-2" />
                        View Detailed Analysis
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a zone on the map to view detailed information</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Legend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-700 mr-3"></div>
                  <div>
                    <div className="font-medium">Excellent Health</div>
                    <div className="text-xs text-gray-500">NDVI: 0.8-1.0</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-500 mr-3"></div>
                  <div>
                    <div className="font-medium">Good Health</div>
                    <div className="text-xs text-gray-500">NDVI: 0.6-0.8</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-yellow-500 mr-3"></div>
                  <div>
                    <div className="font-medium">Moderate Health</div>
                    <div className="text-xs text-gray-500">NDVI: 0.4-0.6</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-red-500 mr-3"></div>
                  <div>
                    <div className="font-medium">Poor Health</div>
                    <div className="text-xs text-gray-500">NDVI: 0.0-0.4</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/upload">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Upload New Data
          </Button>
        </Link>
        
        <Link href="/reports">
          <Button variant="outline">
            <Layers className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </Link>
        
        <Link href="/dashboard">
          <Button variant="outline">
            <Navigation className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}