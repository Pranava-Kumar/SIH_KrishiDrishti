// frontend/app/analysis/[id]/page.tsx

'use client'; // This marks the component as a Client Component

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation'; // Use next/navigation for App Router
import { fetchAnalysisResult, triggerAnalysis } from '@/lib/api'; // Import your API client functions
import { ResultCard } from '@/components/analysis/ResultCard'; // Import a reusable component
import { Confetti } from '@/components/analysis/Confetti'; // Optional confetti effect for high confidence

// Define the type for the result data based on your backend schema
type AnalysisResult = {
  upload_id: string;
  prediction: string;
  confidence: number;
  recommendation: string;
  timestamp: string; // ISO string
};

export default function AnalysisPage() {
  const { id } = useParams<{ id: string }>(); // Get the upload ID from the URL
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadResult = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // First trigger the analysis for the uploaded image
        const analysisResponse = await triggerAnalysis(id);
        setResult(analysisResponse);
      } catch (err) {
        // If analysis fails, try to fetch existing results
        try {
          const data = await fetchAnalysisResult(id);
          setResult(data);
        } catch (fetchErr) {
          console.error("Error fetching analysis result:", fetchErr);
          setError(`Failed to load analysis for ID: ${id}`);
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadResult();
    }
  }, [id]); // Re-run if the ID changes

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Analyzing your image...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600">Error</h2>
          <p className="text-gray-600">{error}</p>
          <a href="/upload" className="mt-4 inline-block px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
            Upload Another Image
          </a>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800">No Result Found</h2>
          <p className="text-gray-600">The analysis for ID {id} could not be found.</p>
          <a href="/upload" className="mt-4 inline-block px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
            Upload an Image
          </a>
        </div>
      </div>
    );
  }

  // Optional: Trigger confetti for high confidence
  const showConfetti = result.confidence > 0.95;

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      {showConfetti && <Confetti />}
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Analysis Results</h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        <ResultCard result={result} />
        <div className="mt-6 flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
          <a
            href={`/report/${result.upload_id}`} // Link to the report page
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-center"
          >
            Generate Report
          </a>
          <a
            href="/upload" // Link back to upload
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-center"
          >
            Analyze Another
          </a>
        </div>
      </div>
    </div>
  );
}