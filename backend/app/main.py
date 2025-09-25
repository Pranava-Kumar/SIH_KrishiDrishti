# backend/app/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware # For allowing frontend requests
from app.api.routes import upload, analysis # Import your route modules
import logging

# --- Logging Configuration ---
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- FastAPI App Instance ---
app = FastAPI(
    title="KrishiDrishti AI Backend",
    description="API for AI-powered crop health analysis using hyperspectral and RGB data.",
    version="0.1.0",
)

# --- CORS Middleware (Update origins for production) ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Change this to your frontend's URL in production (e.g., ["http://localhost:3000"])
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Include API Routes ---
# Mount the route modules under the /api prefix
api_router = app # You could create a separate APIRouter instance if preferred
api_router.include_router(upload.router, prefix="/api", tags=["upload"])
api_router.include_router(analysis.router, prefix="/api", tags=["analysis"])

# --- Root Endpoint ---
@app.get("/")
def read_root():
    return {"message": "Welcome to the KrishiDrishti AI Backend API"}

# --- Optional: Health Check Endpoint ---
@app.get("/health")
def health_check():
    return {"status": "healthy", "message": "API is running"}

# --- Main Entry Point (for Uvicorn) ---
# This allows running the app directly with `uvicorn app.main:app --reload`
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True) # Listen on all interfaces