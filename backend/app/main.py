# backend/app/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from app.api.routes import upload, analysis, spectral, sensors # Import route modules
from app.auth.routes import router as auth  # Import auth routes
from app.reports.pdf_generator import router as reports # Import reports router
from app.api.utils.middleware import api_utils
import logging

# --- Logging Configuration ---
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- FastAPI App Instance with API Versioning ---
app_v1 = FastAPI(
    title="KrishiDrishti AI Backend - v1",
    description="API for AI-powered crop health analysis using hyperspectral and RGB data.",
    version="1.0.0",
    openapi_tags=[
        {
            "name": "Authentication",
            "description": "User authentication endpoints"
        },
        {
            "name": "Upload",
            "description": "Image and data upload endpoints"
        },
        {
            "name": "Analysis",
            "description": "Crop health analysis endpoints"
        },
        {
            "name": "Spectral",
            "description": "Spectral analysis endpoints"
        },
        {
            "name": "Sensors",
            "description": "Environmental sensor data endpoints"
        },
        {
            "name": "Reports",
            "description": "PDF report generation endpoints"
        }
    ]
)

# --- CORS Middleware (Update origins for production) ---
app_v1.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Change this to your frontend's URL in production (e.g., ["http://localhost:3000"])
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Trusted Host Middleware ---
app_v1.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["krishidrishti.com", "localhost", "127.0.0.1", "*.krishidrishti.com"]
)

# --- Add API utilities ---
api_utils.add_request_logging(app_v1)
api_utils.add_error_handling(app_v1)

# --- Include API Routes with Version Prefix ---
app_v1.include_router(auth, prefix="", tags=["Authentication"])
app_v1.include_router(upload.router, prefix="", tags=["Upload"])
app_v1.include_router(analysis.router, prefix="", tags=["Analysis"])
app_v1.include_router(spectral.router, prefix="", tags=["Spectral"])
app_v1.include_router(sensors.router, prefix="", tags=["Sensors"])
app_v1.include_router(reports, prefix="", tags=["Reports"])

# --- Root Endpoint ---
@app_v1.get("/")
def read_root():
    return {"message": "Welcome to the KrishiDrishti AI Backend API v1"}

# --- Health Check Endpoint ---
@app_v1.get("/health")
def health_check():
    return {"status": "healthy", "version": "1.0.0", "message": "API is running"}

# Mount the v1 app
app = app_v1

# --- Main Entry Point (for Uvicorn) ---
# This allows running the app directly with `uvicorn app.main:app --reload`
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True) # Listen on all interfaces