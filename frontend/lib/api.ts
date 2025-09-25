// frontend/lib/api.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api'; // Use environment variable or default

// Define the type for the result data based on your backend schema
export type AnalysisResult = {
  upload_id: string;
  prediction: string;
  confidence: number;
  recommendation: string;
  timestamp: string; // ISO string
};

// Define the type for the upload response
export type UploadResponse = {
  upload_id: string;
  filename: string;
  message: string;
};

/**
 * Uploads an image file to the backend.
 * @param file The image File object to upload.
 * @returns A promise resolving to the upload response data.
 * @throws An error if the upload fails.
 */
export async function uploadImage(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    body: formData, // Don't set Content-Type header, browser sets it with boundary
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Upload failed' }));
    throw new Error(errorData.detail || 'Upload failed');
  }

  const data: UploadResponse = await response.json();
  return data;
}

/**
 * Fetches the analysis result for a given upload ID.
 * @param uploadId The unique identifier for the upload.
 * @returns A promise resolving to the analysis result data.
 * @throws An error if fetching the result fails.
 */
export async function fetchAnalysisResult(uploadId: string): Promise<AnalysisResult> {
  const response = await fetch(`${API_BASE_URL}/results/${uploadId}`);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Result not found');
    }
    const errorData = await response.json().catch(() => ({ detail: 'Failed to fetch result' }));
    throw new Error(errorData.detail || 'Failed to fetch result');
  }

  const data: AnalysisResult = await response.json();
  return data;
}

/**
 * Triggers the analysis for a given upload ID.
 * @param uploadId The unique identifier for the upload.
 * @returns A promise resolving to the analysis result data.
 * @throws An error if triggering the analysis fails.
 */
export async function triggerAnalysis(uploadId: string): Promise<AnalysisResult> {
  const response = await fetch(`${API_BASE_URL}/analyze/${uploadId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Analysis failed' }));
    throw new Error(errorData.detail || 'Analysis failed');
  }

  const data: AnalysisResult = await response.json();
  return data;
}