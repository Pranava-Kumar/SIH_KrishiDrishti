"""
Validation utilities for KrishiDrishti API
Provides request/response validation for API endpoints
"""
from pydantic import BaseModel, validator, ValidationError
from typing import Optional, List, Dict, Any
from datetime import datetime, date
import re

# Request validation models
class BaseRequestModel(BaseModel):
    """
    Base model with common validation rules
    """
    pass

class UploadRequest(BaseModel):
    """
    Validation model for upload requests
    """
    filename: str
    content_type: Optional[str] = None
    file_size: Optional[int] = None
    
    @validator('filename')
    def validate_filename(cls, v):
        if not v:
            raise ValueError('Filename is required')
        if len(v) > 255:
            raise ValueError('Filename must be less than 255 characters')
        return v
    
    @validator('file_size')
    def validate_file_size(cls, v):
        if v and v > 50 * 1024 * 1024:  # 50MB limit
            raise ValueError('File size must be less than 50MB')
        return v

class AnalysisRequest(BaseModel):
    """
    Validation model for analysis requests
    """
    upload_id: str
    analysis_type: str = "full"
    crop_type: Optional[str] = None
    field_id: Optional[str] = None
    
    @validator('upload_id')
    def validate_upload_id(cls, v):
        if not v or len(v) < 10:
            raise ValueError('Upload ID must be at least 10 characters')
        return v
    
    @validator('analysis_type')
    def validate_analysis_type(cls, v):
        allowed_types = ["full", "ndvi", "ndre", "msi", "savi", "evi"]
        if v.lower() not in allowed_types:
            raise ValueError(f'Analysis type must be one of: {", ".join(allowed_types)}')
        return v.lower()

class SpectralAnalysisRequest(BaseModel):
    """
    Validation model for spectral analysis requests
    """
    upload_id: str
    analysis_type: str = "full"  # Options: "full", "ndvi", "ndre", "msi", "savi"
    red_band: Optional[int] = 2
    nir_band: Optional[int] = 3
    red_edge_band: Optional[int] = 3
    swir_band: Optional[int] = 5
    metadata: Optional[Dict[str, Any]] = {}
    
    @validator('red_band', 'nir_band', 'red_edge_band', 'swir_band')
    def validate_band_indices(cls, v):
        if v is not None and v < 0:
            raise ValueError('Band index must be a positive integer')
        return v

class SensorDataRequest(BaseModel):
    """
    Validation model for sensor data requests
    """
    start_date: str  # Format: YYYY-MM-DD
    end_date: str    # Format: YYYY-MM-DD
    field_id: str = "field_1"
    crop_type: str = "corn"
    location: str = "default"
    
    @validator('start_date', 'end_date')
    def validate_date_format(cls, v):
        try:
            datetime.strptime(v, '%Y-%m-%d')
        except ValueError:
            raise ValueError('Date format must be YYYY-MM-DD')
        return v
    
    @validator('crop_type')
    def validate_crop_type(cls, v):
        allowed_crops = ["corn", "wheat", "rice", "soybean", "cotton", "sugarcane", "barley", "oats", "millet", "sorghum"]
        if v.lower() not in allowed_crops:
            raise ValueError(f'Crop type must be one of: {", ".join(allowed_crops)}')
        return v.lower()
    
    @validator('start_date')
    def validate_date_range(cls, start_date, values):
        if 'end_date' in values:
            start = datetime.strptime(start_date, '%Y-%m-%d')
            end = datetime.strptime(values['end_date'], '%Y-%m-%d')
            if start > end:
                raise ValueError('Start date must be before end date')
            if (end - start).days > 365:  # Limit to 1 year
                raise ValueError('Date range must be within 1 year')
        return start_date

class ReportGenerationRequest(BaseModel):
    """
    Validation model for report generation requests
    """
    upload_id: str
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    report_type: str = "field-analysis"  # Options: "field-analysis", "trend-analysis", "risk-assessment", "comprehensive"
    format: str = "pdf"  # Options: "pdf", "json", "csv"
    include_spectral: bool = True
    include_trends: bool = True
    include_alerts: bool = True
    
    @validator('report_type')
    def validate_report_type(cls, v):
        allowed_types = ["field-analysis", "trend-analysis", "risk-assessment", "comprehensive"]
        if v.lower() not in allowed_types:
            raise ValueError(f'Report type must be one of: {", ".join(allowed_types)}')
        return v.lower()
    
    @validator('format')
    def validate_format(cls, v):
        allowed_formats = ["pdf", "json", "csv"]
        if v.lower() not in allowed_formats:
            raise ValueError(f'Format must be one of: {", ".join(allowed_formats)}')
        return v.lower()

class UserRegistrationRequest(BaseModel):
    """
    Validation model for user registration
    """
    username: str
    email: str
    password: str
    full_name: Optional[str] = None
    role: str = "farmer"  # Options: "farmer", "agronomist", "admin"
    
    @validator('username')
    def validate_username(cls, v):
        if not v or len(v) < 3:
            raise ValueError('Username must be at least 3 characters')
        if len(v) > 50:
            raise ValueError('Username must be less than 50 characters')
        if not re.match("^[a-zA-Z0-9_]+$", v):
            raise ValueError('Username can only contain letters, numbers, and underscores')
        return v
    
    @validator('email')
    def validate_email(cls, v):
        email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_regex, v):
            raise ValueError('Invalid email format')
        return v
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        if not re.search(r"[A-Z]", v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r"[a-z]", v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not re.search(r"\d", v):
            raise ValueError('Password must contain at least one digit')
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v):
            raise ValueError('Password must contain at least one special character')
        return v
    
    @validator('role')
    def validate_role(cls, v):
        allowed_roles = ["farmer", "agronomist", "admin"]
        if v.lower() not in allowed_roles:
            raise ValueError(f'Role must be one of: {", ".join(allowed_roles)}')
        return v.lower()

# Response validation models
class BaseResponseModel(BaseModel):
    """
    Base model for API responses
    """
    success: bool = True
    message: Optional[str] = None
    timestamp: str = datetime.now().isoformat()

class UploadResponse(BaseResponseModel):
    """
    Response model for upload operations
    """
    upload_id: str
    filename: str
    content_type: Optional[str] = None
    file_size: Optional[int] = None

class AnalysisResponse(BaseResponseModel):
    """
    Response model for analysis operations
    """
    upload_id: str
    prediction: Optional[str] = None
    confidence: Optional[float] = None
    recommendation: Optional[str] = None
    spectral_indices: Optional[Dict[str, Any]] = None
    risk_zones: Optional[List[Dict[str, Any]]] = None
    alerts: Optional[List[Dict[str, Any]]] = None

class ErrorResponse(BaseResponseModel):
    """
    Response model for errors
    """
    success: bool = False
    error_code: Optional[str] = None
    details: Optional[Dict[str, Any]] = None

# Validation utility functions
def validate_request_data(request_data: Dict[str, Any], model_class: BaseModel) -> BaseModel:
    """
    Validate request data against a Pydantic model
    """
    try:
        validated_data = model_class(**request_data)
        return validated_data
    except ValidationError as e:
        raise ValueError(f"Validation error: {e}")

def validate_upload_id(upload_id: str) -> bool:
    """
    Validate upload ID format
    """
    if not upload_id or len(upload_id) < 10:
        return False
    return True

def validate_date_range(start_date: str, end_date: str) -> bool:
    """
    Validate date range
    """
    try:
        start = datetime.strptime(start_date, '%Y-%m-%d')
        end = datetime.strptime(end_date, '%Y-%m-%d')
        if start > end:
            return False
        if (end - start).days > 365:  # Limit to 1 year
            return False
        return True
    except ValueError:
        return False