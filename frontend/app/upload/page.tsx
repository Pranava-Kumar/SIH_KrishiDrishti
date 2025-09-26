// frontend/app/upload/page.tsx

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation'; // Use next/navigation for App Router
import { uploadImage } from '@/lib/api'; // Import your API client function

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<string>('image'); // 'image', 'hyperspectral', or 'sensor'
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState({
    cropType: '',
    fieldId: '',
    location: ''
  });
  const router = useRouter(); // useRouter hook for navigation

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null); // Reset error when a new file is selected
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const fileName = selectedFile.name.toLowerCase();

      // Determine file type based on extension
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

      // Create a preview URL for image files only
      if (selectedFile.type.startsWith('image/')) {
        const url = URL.createObjectURL(selectedFile);
        setPreviewUrl(url);
      } else {
        setPreviewUrl(null); // No preview for hyperspectral/sensor files
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
      // For hyperspectral files, we'll use a different API endpoint
      if (fileType === 'hyperspectral') {
        // For MVP: we'll upload to a general endpoint that will handle the hyperspectral analysis
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
        console.log("Hyperspectral upload response:", result);
        
        // Navigate to the spectral analysis page
        router.push(`/analysis/${result.upload_id}`);
      } else {
        // For regular image files, use the existing API
        const response = await uploadImage(file);
        console.log("Upload response:", response); // Debug log
        // Navigate to the analysis page for the returned upload ID
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
    <div className="container mx-auto p-4 max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Upload Agricultural Data</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Select Data Type</h2>
        <div className="grid grid-cols-3 gap-4">
          <button
            type="button"
            onClick={() => setFileType('image')}
            className={`p-4 rounded-lg border-2 text-center ${
              fileType === 'image' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="font-medium text-gray-800">RGB Images</div>
            <div className="text-sm text-gray-600">JPG, PNG</div>
          </button>
          <button
            type="button"
            onClick={() => setFileType('hyperspectral')}
            className={`p-4 rounded-lg border-2 text-center ${
              fileType === 'hyperspectral' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="font-medium text-gray-800">Hyperspectral</div>
            <div className="text-sm text-gray-600">ENVI (.hdr/.dat), GeoTIFF</div>
          </button>
          <button
            type="button"
            onClick={() => setFileType('sensor')}
            className={`p-4 rounded-lg border-2 text-center ${
              fileType === 'sensor' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="font-medium text-gray-800">Sensor Data</div>
            <div className="text-sm text-gray-600">CSV files</div>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
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
          <div className="mb-4 text-red-600 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isUploading || !file}
          className={`w-full px-4 py-2 rounded-md text-white ${
            isUploading || !file
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          {isUploading ? 'Uploading...' : `Upload ${file && file.name ? file.name : 'Data'}`}
        </button>
      </form>

      <div className="mt-6 text-sm text-gray-600">
        <h3 className="font-medium text-gray-800 mb-2">Supported File Types:</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>RGB Images:</strong> JPG, PNG formats for visual crop assessment</li>
          <li><strong>Hyperspectral Data:</strong> ENVI format (.hdr + .dat files) or GeoTIFF with multiple spectral bands</li>
          <li><strong>Sensor Data:</strong> CSV format for environmental parameters (soil moisture, temperature, humidity)</li>
        </ul>
      </div>
    </div>
  );
}