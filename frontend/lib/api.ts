// frontend/lib/api.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api'; // Use environment variable or default

// Define types for the result data based on your backend schema
export type AnalysisResult = {
  upload_id: string;
  prediction: string;
  confidence: number;
  recommendation: string;
  timestamp: string; // ISO string
};

export type SpectralAnalysisResult = {
  upload_id: string;
  file_info: {
    path: string;
    shape: number[];
    bands: number;
  };
  indices: {
    [key: string]: {
      min: number;
      max: number;
      mean: number;
      data: number[];
    };
  };
  health_map_path?: string;
  timestamp: string;
};

export type Alert = {
  alert_id: string;
  upload_id: string;
  risk_type: string;
  risk_level: string;
  zone: string;
  recommendation: string;
  timestamp: string;
};

export type TrendDataPoint = {
  date: string;
  value: number;
  index_type: string;
};

export type TrendDataResult = {
  upload_id: string;
  index_type: string;
  data: TrendDataPoint[];
  timestamp: string;
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
 * Uploads hyperspectral data to the backend.
 * @param file The hyperspectral File object to upload.
 * @param metadata Additional metadata for the upload.
 * @returns A promise resolving to the upload response data.
 * @throws An error if the upload fails.
 */
export async function uploadHyperspectral(file: File, metadata?: { crop_type?: string; field_id?: string; location?: string }): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);
  if (metadata?.crop_type) formData.append('crop_type', metadata.crop_type);
  if (metadata?.field_id) formData.append('field_id', metadata.field_id);
  if (metadata?.location) formData.append('location', metadata.location);

  const response = await fetch(`${API_BASE_URL}/spectral/analyze`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Hyperspectral upload failed' }));
    throw new Error(errorData.detail || 'Hyperspectral upload failed');
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
 * Fetches the spectral analysis result for a given upload ID.
 * @param uploadId The unique identifier for the upload.
 * @returns A promise resolving to the spectral analysis result data.
 * @throws An error if fetching the result fails.
 */
export async function fetchSpectralAnalysisResult(uploadId: string): Promise<SpectralAnalysisResult> {
  const response = await fetch(`${API_BASE_URL}/spectral/analyze/${uploadId}`);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Spectral analysis result not found');
    }
    const errorData = await response.json().catch(() => ({ detail: 'Failed to fetch spectral analysis result' }));
    throw new Error(errorData.detail || 'Failed to fetch spectral analysis result');
  }

  const data: SpectralAnalysisResult = await response.json();
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

/**
 * Triggers risk analysis for hyperspectral data.
 * @param uploadId The unique identifier for the upload.
 * @returns A promise resolving to the risk analysis result data.
 * @throws An error if triggering the analysis fails.
 */
export async function triggerRiskAnalysis(uploadId: string): Promise<SpectralAnalysisResult> {
  const response = await fetch(`${API_BASE_URL}/analyze-risk/${uploadId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Risk analysis failed' }));
    throw new Error(errorData.detail || 'Risk analysis failed');
  }

  const data: SpectralAnalysisResult = await response.json();
  return data;
}

/**
 * Fetches alerts for a given upload ID.
 * @param uploadId The unique identifier for the upload.
 * @returns A promise resolving to the alerts data.
 * @throws An error if fetching alerts fails.
 */
export async function fetchAlerts(uploadId: string): Promise<Alert[]> {
  const response = await fetch(`${API_BASE_URL}/alerts/${uploadId}`);

  if (!response.ok) {
    if (response.status === 404) {
      return []; // Return empty array if no alerts
    }
    const errorData = await response.json().catch(() => ({ detail: 'Failed to fetch alerts' }));
    throw new Error(errorData.detail || 'Failed to fetch alerts');
  }

  const data: Alert[] = await response.json();
  return data;
}

/**
 * Fetches trend data for visualization.
 * @param datasetId The identifier for the dataset.
 * @param indexType Type of index to fetch (ndvi, temperature, etc).
 * @returns A promise resolving to the trend data.
 * @throws An error if fetching trend data fails.
 */
export async function fetchTrendData(datasetId: string, indexType: string): Promise<TrendDataResult> {
  const response = await fetch(`${API_BASE_URL}/sensors/trends/${datasetId}?index_type=${indexType}`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Failed to fetch trend data' }));
    throw new Error(errorData.detail || 'Failed to fetch trend data');
  }

  const data: TrendDataResult = await response.json();
  return data;
}

/**
 * Generates synthetic sensor data.
 * @param startDate Start date for data generation.
 * @param endDate End date for data generation.
 * @param fieldId Identifier for the field.
 * @param cropType Type of crop.
 * @param location Location of the field.
 * @returns A promise resolving to the generation result.
 * @throws An error if generation fails.
 */
export async function generateSensorData(startDate: string, endDate: string, fieldId: string, cropType: string, location: string): Promise<{dataset_id: string, data_points: number, file_path: string, message: string}> {
  const response = await fetch(`${API_BASE_URL}/sensors/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      start_date: startDate,
      end_date: endDate,
      field_id: fieldId,
      crop_type: cropType,
      location: location
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Failed to generate sensor data' }));
    throw new Error(errorData.detail || 'Failed to generate sensor data');
  }

  const data: {dataset_id: string, data_points: number, file_path: string, message: string} = await response.json();
  return data;
}