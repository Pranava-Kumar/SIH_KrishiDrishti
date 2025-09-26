# backend/app/api/models/schemas.py

from pydantic import BaseModel
from typing import Optional, Dict, Any, List
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

class SpectralAnalysisResponse(BaseModel):
    """Response model for spectral analysis results."""
    upload_id: str
    file_info: Dict[str, Any]
    indices: Dict[str, Any]  # Contains NDVI, NDRE, MSI, SAVI data
    health_map_path: Optional[str] = None
    timestamp: str = ""

class TrendDataPoint(BaseModel):
    """Data point for temporal trend data."""
    date: str
    value: float
    index_type: str  # e.g., "ndvi", "soil_moisture", etc.

class TrendDataResponse(BaseModel):
    """Response model for temporal trend data."""
    upload_id: str
    index_type: str
    data: List[TrendDataPoint]
    timestamp: str = ""

class AlertResponse(BaseModel):
    """Response model for alerts."""
    alert_id: str
    upload_id: str
    risk_type: str  # e.g., "pest_risk", "disease_risk", "stress"
    risk_level: str  # e.g., "low", "medium", "high", "critical"
    zone: str  # e.g., "Zone 1", "North field", etc.
    recommendation: str
    timestamp: str