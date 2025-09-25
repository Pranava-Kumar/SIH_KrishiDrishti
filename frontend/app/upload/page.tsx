// frontend/app/upload/page.tsx

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation'; // Use next/navigation for App Router
import { uploadImage } from '@/lib/api'; // Import your API client function

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter(); // useRouter hook for navigation

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null); // Reset error when a new file is selected
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];

      // Validate file type (example: only images)
      if (!selectedFile.type.startsWith('image/')) {
        setError('Please select an image file (JPEG, PNG, etc.).');
        setFile(null);
        setPreviewUrl(null);
        return;
      }

      setFile(selectedFile);

      // Create a preview URL for the selected image
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select an image file.');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      // Call your API function to upload the file
      const response = await uploadImage(file);
      console.log("Upload response:", response); // Debug log
      // Navigate to the analysis page for the returned upload ID
      router.push(`/analysis/${response.upload_id}`);
    } catch (err) {
      console.error("Upload error:", err);
      setError('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Upload Crop Image</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-4">
          <label htmlFor="imageUpload" className="block text-sm font-medium text-gray-700 mb-2">
            Select an image of your crop (JPG, PNG)
          </label>
          <input
            id="imageUpload"
            type="file"
            accept="image/*" // Accept any image type
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
          {isUploading ? 'Uploading...' : 'Analyze Image'}
        </button>
      </form>

      <div className="mt-6 text-sm text-gray-600">
        <p>Tip: Upload a clear, well-lit image of the affected crop area for best results.</p>
      </div>
    </div>
  );
}