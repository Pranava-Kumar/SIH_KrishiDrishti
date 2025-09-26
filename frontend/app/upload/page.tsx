// frontend/app/upload/page.tsx

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { uploadImage } from '@/lib/api';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Upload, 
  FileImage, 
  FileBarChart, 
  FileText,
  Info,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<string>('image');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState({
    cropType: '',
    fieldId: '',
    location: ''
  });
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const fileName = selectedFile.name.toLowerCase();

      if (fileName.endsWith('.hdr') || fileName.endsWith('.dat') || fileName.endsWith('.tif') || fileName.endsWith('.tiff') || fileName.endsWith('.geotiff')) {
        setFileType('hyperspectral');
      } else if (fileName.endsWith('.csv')) {
        setFileType('sensor');
      } else if (selectedFile.type.startsWith('image/')) {
        setFileType('image');
      } else {
        setError('Unsupported file type. Please upload hyperspectral (ENVI/TIFF), sensor (CSV), or image files.');
        setFile(null);
        setPreviewUrl(null);
        return;
      }

      setFile(selectedFile);

      if (selectedFile.type.startsWith('image/')) {
        const url = URL.createObjectURL(selectedFile);
        setPreviewUrl(url);
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const handleMetadataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setMetadata(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file.');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      if (fileType === 'hyperspectral') {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('crop_type', metadata.cropType);
        formData.append('field_id', metadata.fieldId);
        formData.append('location', metadata.location);

        const response = await fetch('/api/spectral/analyze', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ detail: 'Upload failed' }));
          throw new Error(errorData.detail || 'Upload failed');
        }

        const result = await response.json();
        router.push(`/analysis/${result.upload_id}`);
      } else {
        const response = await uploadImage(file);
        router.push(`/analysis/${response.upload_id}`);
      }
    } catch (err) {
      console.error("Upload error:", err);
      setError('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Data Upload Center</h1>
        <p className="text-gray-600">Upload hyperspectral images, sensor data, or regular images for analysis</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Select Data Type
              </CardTitle>
              <CardDescription>Choose the type of data you want to upload</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <label htmlFor="dataUpload" className="block text-sm font-medium text-gray-700 mb-2">
                    {fileType === 'image' && 'Select an image of your crop (JPG, PNG)'}
                    {fileType === 'hyperspectral' && 'Upload hyperspectral data (ENVI .hdr/.dat or GeoTIFF)'}
                    {fileType === 'sensor' && 'Upload sensor data (CSV format)'}
                  </label>
                  <input
                    id="dataUpload"
                    type="file"
                    accept={
                      fileType === 'image' ? "image/*" : 
                      fileType === 'hyperspectral' ? ".hdr,.dat,.tif,.tiff,.geotiff" : 
                      ".csv"
                    }
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500
                              file:mr-4 file:py-2 file:px-4
                              file:rounded-md file:border-0
                              file:text-sm file:font-semibold
                              file:bg-blue-50 file:text-blue-700
                              hover:file:bg-blue-100"
                  />
                </div>

                {previewUrl && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">Preview:</p>
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="max-h-48 object-contain border rounded-md"
                    />
                  </div>
                )}

                {fileType !== 'sensor' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div>
                      <label htmlFor="cropType" className="block text-sm font-medium text-gray-700 mb-1">
                        Crop Type
                      </label>
                      <input
                        type="text"
                        id="cropType"
                        name="cropType"
                        value={metadata.cropType}
                        onChange={handleMetadataChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., Corn, Wheat"
                      />
                    </div>
                    <div>
                      <label htmlFor="fieldId" className="block text-sm font-medium text-gray-700 mb-1">
                        Field ID
                      </label>
                      <input
                        type="text"
                        id="fieldId"
                        name="fieldId"
                        value={metadata.fieldId}
                        onChange={handleMetadataChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., Field-01"
                      />
                    </div>
                    <div>
                      <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                        Location
                      </label>
                      <input
                        type="text"
                        id="location"
                        name="location"
                        value={metadata.location}
                        onChange={handleMetadataChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., Pune, Maharashtra"
                      />
                    </div>
                  </div>
                )}

                {error && (
                  <div className="mb-4">
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isUploading || !file}
                  className="w-full"
                >
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      Upload {file && file.name ? file.name : 'Data'}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Upload Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-800 mb-2">Supported File Types:</h3>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                    <li><strong>RGB Images:</strong> JPG, PNG formats for visual crop assessment</li>
                    <li><strong>Hyperspectral Data:</strong> ENVI format (.hdr + .dat files) or GeoTIFF with multiple spectral bands</li>
                    <li><strong>Sensor Data:</strong> CSV format for environmental parameters (soil moisture, temperature, humidity)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium text-gray-800 mb-2">Best Practices:</h3>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                    <li>Ensure images are well-lit and in focus for best results</li>
                    <li>Include a scale reference in images when possible</li>
                    <li>Upload data regularly for continuous monitoring</li>
                    <li>Provide accurate metadata for better analysis</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* File Type Selection */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Data Type Selection</CardTitle>
              <CardDescription>Choose the type of data you want to analyze</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={() => setFileType('image')}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                    fileType === 'image' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    <FileImage className="h-8 w-8 text-blue-500 mr-3" />
                    <div>
                      <h3 className="font-medium text-gray-800">RGB Images</h3>
                      <p className="text-sm text-gray-600">JPG, PNG formats</p>
                    </div>
                  </div>
                </button>
                
                <button
                  type="button"
                  onClick={() => setFileType('hyperspectral')}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                    fileType === 'hyperspectral' 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    <FileBarChart className="h-8 w-8 text-green-500 mr-3" />
                    <div>
                      <h3 className="font-medium text-gray-800">Hyperspectral Data</h3>
                      <p className="text-sm text-gray-600">ENVI, GeoTIFF formats</p>
                    </div>
                  </div>
                </button>
                
                <button
                  type="button"
                  onClick={() => setFileType('sensor')}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                    fileType === 'sensor' 
                      ? 'border-purple-500 bg-purple-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    <FileText className="h-8 w-8 text-purple-500 mr-3" />
                    <div>
                      <h3 className="font-medium text-gray-800">Sensor Data</h3>
                      <p className="text-sm text-gray-600">CSV format</p>
                    </div>
                  </div>
                </button>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-medium text-gray-800 mb-3">Quick Navigation</h3>
                <div className="space-y-2">
                  <Link href="/dashboard">
                    <Button variant="outline" className="w-full justify-between">
                      Dashboard
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/field-map">
                    <Button variant="outline" className="w-full justify-between">
                      Field Map
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/trends">
                    <Button variant="outline" className="w-full justify-between">
                      Trends
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}