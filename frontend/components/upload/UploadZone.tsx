// frontend/components/upload/UploadZone.tsx
// Note: This is a simplified version using standard input. A full drag-and-drop implementation requires more state management.

import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type UploadZoneProps = {
  file: File | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  previewUrl: string | null;
  error: string | null;
};

export const UploadZone: React.FC<UploadZoneProps> = ({ file, onFileChange, previewUrl, error }) => {
  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <Label htmlFor="imageUpload" className="cursor-pointer">
          <span className="text-gray-500">Click to select an image or drag and drop</span>
          <Input
            id="imageUpload"
            type="file"
            accept="image/*"
            onChange={onFileChange}
            className="hidden" // Hide the actual input
          />
        </Label>
      </div>

      {previewUrl && (
        <div className="mt-4">
          <p className="text-sm text-gray-600 mb-2">Preview:</p>
          <img
            src={previewUrl}
            alt="Preview"
            className="max-h-48 object-contain border rounded-md mx-auto"
          />
        </div>
      )}

      {error && (
        <div className="text-red-600 text-sm">
          {error}
        </div>
      )}
    </div>
  );
};