# backend/app/api/models/schemas.py

from pydantic import BaseModel
from typing import Optional
import uuid

class UploadResponse(BaseModel):
    """Response model for file upload."""
    upload_id: str
    filename: str
    message: str = "File uploaded successfully"

class AnalysisRequest(BaseModel):
    """Request model for analysis (if needed, e.g., for metadata)."""
    # For MVP, the image file is sent directly in the POST request body
    # This could be extended later for metadata like crop type, location
    pass

class AnalysisResult(BaseModel):
    """Response model for analysis results."""
    upload_id: str
    prediction: str
    confidence: float
    recommendation: str
    timestamp: str # ISO 8601 format string

class ErrorResponse(BaseModel):
    """Response model for errors."""
    detail: str