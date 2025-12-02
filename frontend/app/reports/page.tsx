// frontend/app/reports/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Download, 
  Calendar, 
  Eye, 
  FileText, 
  TrendingUp, 
  AlertTriangle, 
  BarChart3,
  Map,
  Upload
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

export default function ReportsPage() {
  const [reportType, setReportType] = useState('field-analysis');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [uploadId, setUploadId] = useState('');
  const [loading, setLoading] = useState(false);
  const [recentReports, setRecentReports] = useState<any[]>([]);

  useEffect(() => {
    // Mock recent reports data
    const mockReports = [
      {
        id: 'report_001',
        title: 'Field Health Analysis - Zone A',
        date: new Date('2023-02-15'),
        type: 'field-analysis',
        uploadId: 'upload_123'
      },
      {
        id: 'report_002',
        title: 'Temporal Trend Report - Corn Field',
        date: new Date('2023-02-10'),
        type: 'trend-analysis',
        uploadId: 'upload_456'
      },
      {
        id: 'report_003',
        title: 'Risk Assessment Report - All Zones',
        date: new Date('2023-02-05'),
        type: 'risk-assessment',
        uploadId: 'upload_789'
      }
    ];
    
    setRecentReports(mockReports);
  }, []);

  const handleGenerateReport = () => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      alert(`Report generated successfully! Report type: ${reportType}, Upload ID: ${uploadId || 'N/A'}, Dates: ${startDate} to ${endDate || 'N/A'}`);
    }, 1500);
  };

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Reports & Analytics</h1>
          <p className="text-gray-600">Generate detailed reports for crop health analysis</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard">
            <Button variant="outline">
              <BarChart3 className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
          </Link>
          
          <Link href="/field-map">
            <Button variant="outline">
              <Map className="h-4 w-4 mr-2" />
              Field Map
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Report Generation Card */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generate New Report
          </CardTitle>
          <CardDescription>Customize and generate reports based on your field data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="reportType">Report Type</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <Button
                    variant={reportType === 'field-analysis' ? 'default' : 'outline'}
                    onClick={() => setReportType('field-analysis')}
                    className="flex items-center justify-start gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    Field Analysis
                  </Button>
                  <Button
                    variant={reportType === 'trend-analysis' ? 'default' : 'outline'}
                    onClick={() => setReportType('trend-analysis')}
                    className="flex items-center justify-start gap-2"
                  >
                    <TrendingUp className="h-4 w-4" />
                    Trend Analysis
                  </Button>
                  <Button
                    variant={reportType === 'risk-assessment' ? 'default' : 'outline'}
                    onClick={() => setReportType('risk-assessment')}
                    className="flex items-center justify-start gap-2"
                  >
                    <AlertTriangle className="h-4 w-4" />
                    Risk Assessment
                  </Button>
                  <Button
                    variant={reportType === 'comprehensive' ? 'default' : 'outline'}
                    onClick={() => setReportType('comprehensive')}
                    className="flex items-center justify-start gap-2"
                  >
                    <BarChart3 className="h-4 w-4" />
                    Comprehensive
                  </Button>
                </div>
              </div>
              
              <div>
                <Label htmlFor="uploadId">Upload ID</Label>
                <Input
                  id="uploadId"
                  placeholder="Enter upload ID for specific analysis"
                  value={uploadId}
                  onChange={(e) => setUploadId(e.target.value)}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty to generate a general report
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <div className="relative mt-1">
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="pl-10"
                  />
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                </div>
              </div>
              
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <div className="relative mt-1">
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="pl-10"
                  />
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                </div>
              </div>
              
              <Button 
                className="w-full mt-4" 
                onClick={handleGenerateReport}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 mr-2 border-b-2 border-white"></div>
                    Generating Report...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Generate & Download PDF
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Recent Reports */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Recent Reports
          </CardTitle>
          <CardDescription>Previously generated reports for your fields</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentReports.map((report) => (
              <div 
                key={report.id} 
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div>
                  <h3 className="font-medium">{report.title}</h3>
                  <p className="text-sm text-gray-500">
                    {report.type.replace('-', ' ').toUpperCase()} • {format(report.date, 'MMM d, yyyy')}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Report Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Report Templates
          </CardTitle>
          <CardDescription>Predefined templates for common analysis needs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <Eye className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Field Health Report</h3>
              <p className="text-sm text-gray-600 mb-4">
                Comprehensive analysis of field health with NDVI, risk zones, and recommendations.
              </p>
              <Button variant="outline" className="w-full">
                Use Template
              </Button>
            </div>
            
            <div className="border rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Trend Analysis</h3>
              <p className="text-sm text-gray-600 mb-4">
                Historical trend analysis of spectral indices and environmental factors.
              </p>
              <Button variant="outline" className="w-full">
                Use Template
              </Button>
            </div>
            
            <div className="border rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="font-semibold mb-2">Risk Assessment</h3>
              <p className="text-sm text-gray-600 mb-4">
                Detailed risk assessment with focus on pest, disease, and stress detection.
              </p>
              <Button variant="outline" className="w-full">
                Use Template
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}