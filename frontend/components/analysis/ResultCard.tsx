// frontend/components/analysis/ResultCard.tsx

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

// Define the type for the result data based on your backend schema
type AnalysisResult = {
  upload_id: string;
  prediction: string;
  confidence: number;
  recommendation: string;
  timestamp: string; // ISO string
};

type ResultCardProps = {
  result: AnalysisResult;
};

export const ResultCard: React.FC<ResultCardProps> = ({ result }) => {
  // Calculate confidence percentage (assuming backend sends 0.0 - 1.0)
  const confidencePercentage = result.confidence * 100;

  // Determine color based on confidence
  let progressColor = "bg-green-500";
  if (confidencePercentage < 50) {
    progressColor = "bg-red-500";
  } else if (confidencePercentage < 70) {
    progressColor = "bg-yellow-500";
  }

  // Format timestamp for display
  const formattedDate = new Date(result.timestamp).toLocaleString();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">Analysis Result</CardTitle>
        <CardDescription>Upload ID: {result.upload_id}</CardDescription>
        <CardDescription>Generated on: {formattedDate}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-medium text-gray-500">Predicted Condition</p>
          <p className="text-lg font-semibold">{result.prediction}</p>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-500 mb-2">Confidence Level</p>
          <div className="relative pt-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                {confidencePercentage.toFixed(2)}%
              </span>
            </div>
            <Progress value={confidencePercentage} className="mt-1" />
            <div className="mt-1 text-xs text-gray-500">
              {/* Optional: Add a description based on confidence */}
              {confidencePercentage >= 90 && "Highly Confident"}
              {confidencePercentage >= 70 && confidencePercentage < 90 && "Moderately Confident"}
              {confidencePercentage < 70 && "Low Confidence - Verify Manually"}
            </div>
          </div>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Recommendation</AlertTitle>
          <AlertDescription>
            {result.recommendation}
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};