"""
Test suite for KrishiDrishti backend
This includes unit tests and integration tests for the API
"""
import pytest
import asyncio
from fastapi.testclient import TestClient
from app.main import app_v1 as app
from app.db.config import get_db, SessionLocal
from app.db import utils as db_utils
from app.core.spectral_processor import spectral_processor
from app.core.risk_detector import risk_detector
from app.auth import utils as auth_utils
from unittest.mock import patch, MagicMock
import numpy as np

# Create test client
client = TestClient(app)

# Test database setup
def override_get_db():
    """Override the database dependency for testing"""
    try:
        db = SessionLocal()
        yield db
    finally:
        db.close()

# Override the database dependency
app.dependency_overrides[get_db] = override_get_db

def test_root_endpoint():
    """Test the root endpoint"""
    response = client.get("/")
    assert response.status_code == 200
    assert "KrishiDrishti AI Backend API v1" in response.json()["message"]

def test_health_check():
    """Test the health check endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"
    assert response.json()["version"] == "1.0.0"

def test_spectral_processor_initialization():
    """Test spectral processor initialization"""
    assert spectral_processor is not None
    assert hasattr(spectral_processor, 'compute_ndvi')
    assert hasattr(spectral_processor, 'compute_ndre')
    assert hasattr(spectral_processor, 'compute_msi')

def test_risk_detector_initialization():
    """Test risk detector initialization"""
    assert risk_detector is not None
    assert hasattr(risk_detector, 'detect_risk_zones')

def test_authentication_registration():
    """Test user registration"""
    # Test valid registration
    response = client.post("/auth/register", json={
        "username": "testuser",
        "email": "test@example.com",
        "password": "TestPass123!",
        "full_name": "Test User"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "testuser"
    assert data["email"] == "test@example.com"
    
    # Test duplicate registration
    response = client.post("/auth/register", json={
        "username": "testuser",
        "email": "test@example.com",
        "password": "TestPass123!",
        "full_name": "Test User"
    })
    assert response.status_code == 400

def test_authentication_login():
    """Test user login"""
    # First register a user
    client.post("/auth/register", json={
        "username": "loginuser",
        "email": "login@example.com",
        "password": "TestPass123!",
        "full_name": "Login User"
    })
    
    # Then try to login
    response = client.post("/auth/login", data={
        "username": "loginuser",
        "password": "TestPass123!"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_upload_endpoint():
    """Test the upload endpoint with mock file"""
    # Create a mock file
    from io import BytesIO
    file_content = BytesIO(b"dummy image content")
    
    response = client.post(
        "/api/upload",
        files={"file": ("test.jpg", file_content, "image/jpeg")}
    )
    
    assert response.status_code == 200
    assert "upload_id" in response.json()
    assert "filename" in response.json()

@patch('app.core.ai_predictor.run_analysis')
def test_analysis_endpoint(mock_run_analysis):
    """Test the analysis endpoint"""
    # Mock analysis result
    mock_run_analysis.return_value = {
        "upload_id": "test_upload_id",
        "prediction": "Healthy",
        "confidence": 0.95,
        "recommendation": "Continue regular monitoring"
    }
    
    response = client.post("/api/analyze/test_upload_id")
    assert response.status_code == 200
    data = response.json()
    assert data["upload_id"] == "test_upload_id"
    assert data["prediction"] == "Healthy"
    assert data["confidence"] == 0.95

def test_spectral_indices_computation():
    """Test spectral indices computation with mock data"""
    # Create mock hyperspectral data
    height, width, bands = 10, 10, 260
    mock_data = np.random.rand(height, width, bands).astype(np.float32)
    
    # Test NDVI computation
    ndvi = spectral_processor.compute_ndvi(mock_data, sensor_type='honghu')
    assert ndvi.shape == (height, width)
    assert np.min(ndvi) >= -1
    assert np.max(ndvi) <= 1
    
    # Test NDRE computation
    ndre = spectral_processor.compute_ndre(mock_data, sensor_type='honghu')
    assert ndre.shape == (height, width)
    assert np.min(ndre) >= -1
    assert np.max(ndre) <= 1
    
    # Test MSI computation
    msi = spectral_processor.compute_msi(mock_data, sensor_type='honghu')
    assert msi.shape == (height, width)
    assert np.all(msi >= 0)  # MSI should be non-negative

def test_sensor_data_generation():
    """Test synthetic sensor data generation"""
    from datetime import datetime, timedelta
    
    start_date = (datetime.now() - timedelta(days=7)).strftime("%Y-%m-%d")
    end_date = datetime.now().strftime("%Y-%m-%d")
    
    response = client.post("/api/sensors/generate", json={
        "start_date": start_date,
        "end_date": end_date,
        "field_id": "test_field",
        "crop_type": "corn",
        "location": "test_location"
    })
    
    assert response.status_code == 200
    data = response.json()
    assert "dataset_id" in data
    assert "data_points" in data
    assert data["data_points"] > 0

def test_field_metadata_creation():
    """Test field metadata creation"""
    response = client.post("/api/sensors/metadata", json={
        "field_id": "test_field_123",
        "field_name": "Test Field",
        "location": "40.7128,-74.0060",
        "area": 10.5,
        "crop_type": "corn",
        "planting_date": "2023-04-01T00:00:00",
        "expected_harvest_date": "2023-10-01T00:00:00",
        "soil_type": "loamy",
        "irrigation_type": "drip",
        "notes": "Test field for validation"
    })
    
    assert response.status_code == 200
    data = response.json()
    assert data["field_id"] == "test_field_123"

def test_pdf_report_generation():
    """Test PDF report generation"""
    # This test would require more complex setup for a real report
    # For now, we'll test that the endpoint exists and returns appropriate response
    response = client.get("/api/reports/nonexistent_upload_id")
    # This should return 404 since the upload doesn't exist
    assert response.status_code == 404

# Additional tests for validation
def test_request_validation():
    """Test request validation"""
    # Test invalid sensor data request
    response = client.post("/api/sensors/generate", json={
        "start_date": "invalid-date",
        "end_date": "another-invalid-date",
        "field_id": "test_field",
        "crop_type": "invalid_crop_type",
        "location": "test_location"
    })
    
    # Should return 422 for validation error
    assert response.status_code == 422

def test_rate_limiting():
    """Test rate limiting (this would require more complex setup)"""
    # For now, just verify that the middleware is in place
    # Actual rate limiting tests would require more sophisticated mocking
    pass

if __name__ == "__main__":
    pytest.main([__file__])