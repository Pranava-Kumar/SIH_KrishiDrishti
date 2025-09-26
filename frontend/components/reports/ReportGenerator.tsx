// frontend/components/reports/ReportGenerator.tsx

'use client';

import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Download, 
  FileText, 
  Printer, 
  Share2, 
  Calendar, 
  AlertTriangle, 
  Leaf, 
  TrendingUp, 
  Droplets 
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

type ReportData = {
  fieldInfo: {
    name: string;
    cropType: string;
    area: string;
    plantingDate: string;
    location: string;
  };
  summary: {
    healthScore: number;
    riskLevel: string;
    totalAlerts: number;
    ndviAvg: number;
    lastUpdated: string;
  };
  trendData: Array<{
    date: string;
    ndvi: number;
    temp: number;
    moisture: number;
  }>;
  alerts: Array<{
    id: number;
    type: string;
    zone: string;
    severity: string;
    message: string;
    date: string;
  }>;
  recommendations: string[];
};

export default function ReportGenerator({ 
  reportData, 
  onGeneratePDF 
}: { 
  reportData: ReportData; 
  onGeneratePDF?: () => void; 
}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    
    setIsGenerating(true);
    
    try {
      // Use html2canvas to capture the report
      const canvas = await html2canvas(reportRef.current, {
        scale: 2, // Higher quality
        useCORS: true,
        logging: false
      });
      
      // Create PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      // Add new pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      // Save the PDF
      pdf.save(`krishidrishti-report-${reportData.fieldInfo.name}-${new Date().toISOString().split('T')[0]}.pdf`);
      
      if (onGeneratePDF) {
        onGeneratePDF();
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `KrishiDrishti Report - ${reportData.fieldInfo.name}`,
        text: `Field health report for ${reportData.fieldInfo.name} showing ${reportData.summary.healthScore}/100 health score.`,
        url: window.location.href
      }).catch(console.error);
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href).then(() => {
        alert('Report link copied to clipboard!');
      }).catch(console.error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Report Actions */}
      <div className="flex flex-wrap gap-3 no-print">
        <Button onClick={handlePrint} variant="outline">
          <Printer className="h-4 w-4 mr-2" />
          Print Report
        </Button>
        
        <Button onClick={handleDownloadPDF} disabled={isGenerating}>
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Generating PDF...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </>
          )}
        </Button>
        
        <Button onClick={handleShare} variant="outline">
          <Share2 className="h-4 w-4 mr-2" />
          Share Report
        </Button>
      </div>
      
      {/* Report Content */}
      <div ref={reportRef} className="bg-white p-8 rounded-lg shadow-lg print:shadow-none print:p-0">
        {/* Report Header */}
        <div className="print-header mb-8 p-6 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">KrishiDrishti Field Health Report</h1>
              <p className="text-green-100 mt-2">AI-Powered Crop Health Monitoring</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{reportData.fieldInfo.name}</div>
              <p className="text-green-100">{reportData.fieldInfo.location}</p>
            </div>
          </div>
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/10 p-4 rounded-lg">
              <div className="text-sm text-green-100">Report Date</div>
              <div className="text-lg font-semibold">{new Date().toLocaleDateString()}</div>
            </div>
            
            <div className="bg-white/10 p-4 rounded-lg">
              <div className="text-sm text-green-100">Crop Type</div>
              <div className="text-lg font-semibold">{reportData.fieldInfo.cropType}</div>
            </div>
            
            <div className="bg-white/10 p-4 rounded-lg">
              <div className="text-sm text-green-100">Field Area</div>
              <div className="text-lg font-semibold">{reportData.fieldInfo.area}</div>
            </div>
          </div>
        </div>
        
        {/* Summary Section */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-2 border-b border-gray-200">
            Field Health Summary
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Health Score</CardTitle>
                <Leaf className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-700">{reportData.summary.healthScore}/100</div>
                <p className="text-xs text-gray-600">Overall field health</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Risk Level</CardTitle>
                <AlertTriangle className="h-4 w-4 text-amber-600" />
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${
                  reportData.summary.riskLevel === "High" ? "text-red-600" : 
                  reportData.summary.riskLevel === "Medium" ? "text-amber-600" : "text-green-600"
                }`}>
                  {reportData.summary.riskLevel}
                </div>
                <p className="text-xs text-gray-600">Current threat level</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
                <AlertTriangle className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-700">{reportData.summary.totalAlerts}</div>
                <p className="text-xs text-gray-600">Issues requiring attention</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">NDVI Average</CardTitle>
                <TrendingUp className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-700">{reportData.summary.ndviAvg.toFixed(2)}</div>
                <p className="text-xs text-gray-600">Vegetation index</p>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Trend Analysis */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-2 border-b border-gray-200">
            Temporal Trend Analysis
          </h2>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                NDVI, Temperature & Moisture Trends
              </CardTitle>
              <CardDescription>Historical data analysis over the past month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={reportData.trendData}
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
        </div>
        
        {/* Alerts Section */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-2 border-b border-gray-200">
            Detected Alerts & Issues
          </h2>
          
          <div className="space-y-4">
            {reportData.alerts.map((alert) => (
              <Card key={alert.id} className={
                alert.severity === "High" ? "border-l-4 border-l-red-500 bg-red-50" :
                alert.severity === "Medium" ? "border-l-4 border-l-amber-500 bg-amber-50" :
                "border-l-4 border-l-green-500 bg-green-50"
              }>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <AlertTriangle className={`h-5 w-5 ${
                        alert.severity === "High" ? "text-red-600" :
                        alert.severity === "Medium" ? "text-amber-600" : "text-green-600"
                      }`} />
                      {alert.type} in {alert.zone}
                    </CardTitle>
                    <Badge className={
                      alert.severity === "High" ? "bg-red-100 text-red-800" :
                      alert.severity === "Medium" ? "bg-amber-100 text-amber-800" :
                      "bg-green-100 text-green-800"
                    }>
                      {alert.severity} Risk
                    </Badge>
                  </div>
                  <CardDescription>{new Date(alert.date).toLocaleDateString()}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{alert.message}</p>
                </CardContent>
              </Card>
            ))}
            
            {reportData.alerts.length === 0 && (
              <Card>
                <CardContent className="text-center py-8">
                  <Leaf className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">No Active Alerts</h3>
                  <p className="text-gray-600">Your field is currently healthy with no detected issues</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
        
        {/* Recommendations */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-2 border-b border-gray-200">
            Actionable Recommendations
          </h2>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Leaf className="h-5 w-5" />
                Expert-Level Guidance
              </CardTitle>
              <CardDescription>Based on AI analysis of your field data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportData.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start">
                    <div className="mt-1 w-2 h-2 bg-green-500 rounded-full mr-3 flex-shrink-0"></div>
                    <p className="text-gray-700">{rec}</p>
                  </div>
                ))}
                
                {reportData.recommendations.length === 0 && (
                  <p className="text-gray-600 text-center py-4">
                    No specific recommendations at this time. Continue regular monitoring practices.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Footer */}
        <div className="pt-8 border-t border-gray-200 text-center text-gray-600 text-sm no-print">
          <p>Generated by KrishiDrishti AI-Powered Crop Health Monitoring System</p>
          <p className="mt-1">© {new Date().getFullYear()} KrishiDrishti. All rights reserved.</p>
          <p className="mt-2 text-xs">
            This report contains confidential information intended for the field owner only. 
            Results are based on AI analysis and should be validated with ground truth observations.
          </p>
        </div>
      </div>
    </div>
  );
}