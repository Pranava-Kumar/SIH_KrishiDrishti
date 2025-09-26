# backend/app/api/routes/spectral.py

from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from app.api.models.schemas import SpectralAnalysisResponse, ErrorResponse
from app.core.spectral_processor import spectral_processor
from app.utils.file_handler import save_upload_file
import uuid
import logging
import numpy as np
import os
import json
from typing import Dict, Any

logger = logging.getLogger(__name__)
router = APIRouter()

class SpectralAnalysisRequest(BaseModel):
    """
    Request model for spectral analysis with optional metadata
    """
    file_path: str
    crop_type: str = None
    analysis_type: str = "full"  # Options: "full", "ndvi", "ndre", "msi", "savi"
    red_band: int = 2
    nir_band: int = 3
    red_edge_band: int = 3
    swir_band: int = 5
    metadata: Dict[str, Any] = {}

@router.post("/spectral/analyze", response_model=SpectralAnalysisResponse)
async def analyze_spectral_data(
    file: UploadFile = File(...),
    crop_type: str = "",
    analysis_type: str = "full",
    red_band: int = 2,
    nir_band: int = 3,
    red_edge_band: int = 3,
    swir_band: int = 5
):
    """
    Analyze hyperspectral/multispectral data to compute spectral indices
    """
    # Validate file type
    if not file.content_type or not any(ext in file.content_type.lower() for ext in ["image/", "application/octet-stream", "text/plain"]):
        if not any(ext in file.filename.lower() for ext in [".hdr", ".dat", ".tif", ".tiff", ".geotiff"]):
            raise HTTPException(
                status_code=400, 
                detail="Invalid file type. Please upload hyperspectral files (ENVI .hdr/.dat or GeoTIFF .tif/.tiff)"
            )

    # Generate a unique ID for this analysis
    upload_id = str(uuid.uuid4())

    try:
        # Save the uploaded file
        file_path = await save_upload_file(file, upload_id)
        
        # Load hyperspectral data
        spectral_data = spectral_processor.load_hyperspectral_data(file_path)
        
        # Compute requested spectral indices
        results = {
            "upload_id": upload_id,
            "file_info": {
                "path": file_path,
                "shape": spectral_data["shape"],
                "bands": spectral_data["bands"]
            },
            "indices": {}
        }
        
        # Compute indices based on analysis type
        data = spectral_data["data"]
        
        if analysis_type in ["full", "ndvi"]:
            try:
                ndvi = spectral_processor.compute_ndvi(data, red_band, nir_band)
                results["indices"]["ndvi"] = {
                    "min": float(np.min(ndvi)),
                    "max": float(np.max(ndvi)),
                    "mean": float(np.mean(ndvi)),
                    "data": ndvi.tolist()[:10]  # Include a sample of the data (first 10 values)
                }
            except Exception as e:
                logger.warning(f"Could not compute NDVI: {e}")
        
        if analysis_type in ["full", "ndre"]:
            try:
                ndre = spectral_processor.compute_ndre(data, red_edge_band, nir_band)
                results["indices"]["ndre"] = {
                    "min": float(np.min(ndre)),
                    "max": float(np.max(ndre)),
                    "mean": float(np.mean(ndre)),
                    "data": ndre.tolist()[:10]  # Include a sample of the data (first 10 values)
                }
            except Exception as e:
                logger.warning(f"Could not compute NDRE: {e}")
        
        if analysis_type in ["full", "msi"]:
            try:
                msi = spectral_processor.compute_msi(data, nir_band, swir_band)
                results["indices"]["msi"] = {
                    "min": float(np.min(msi)),
                    "max": float(np.max(msi)),
                    "mean": float(np.mean(msi)),
                    "data": msi.tolist()[:10]  # Include a sample of the data (first 10 values)
                }
            except Exception as e:
                logger.warning(f"Could not compute MSI: {e}")
        
        if analysis_type in ["full", "savi"]:
            try:
                savi = spectral_processor.compute_savi(data, red_band, nir_band)
                results["indices"]["savi"] = {
                    "min": float(np.min(savi)),
                    "max": float(np.max(savi)),
                    "mean": float(np.mean(savi)),
                    "data": savi.tolist()[:10]  # Include a sample of the data (first 10 values)
                }
            except Exception as e:
                logger.warning(f"Could not compute SAVI: {e}")
        
        # Generate health map from NDVI if available
        if "ndvi" in results["indices"]:
            try:
                ndvi_data = spectral_data["data"]  # Re-compute full NDVI for health map
                full_ndvi = spectral_processor.compute_ndvi(data, red_band, nir_band)
                health_map = spectral_processor.generate_health_map(full_ndvi)
                
                # Save health map as a temporary image file
                import cv2
                health_map_path = os.path.join("data", "results", f"{upload_id}_health_map.jpg")
                os.makedirs(os.path.dirname(health_map_path), exist_ok=True)
                
                # Save the health map image
                cv2.imwrite(health_map_path, cv2.cvtColor(health_map, cv2.COLOR_RGB2BGR))
                
                results["health_map_path"] = health_map_path
            except Exception as e:
                logger.warning(f"Could not generate health map: {e}")
        
        # Save results to JSON file
        result_file_path = os.path.join("data", "results", f"{upload_id}_spectral.json")
        os.makedirs(os.path.dirname(result_file_path), exist_ok=True)
        
        with open(result_file_path, 'w') as f:
            json.dump(results, f, indent=2)
        
        logger.info(f"Spectral analysis completed for upload_id {upload_id}")
        
        return SpectralAnalysisResponse(**results)
    
    except Exception as e:
        logger.error(f"Error during spectral analysis for upload: {e}")
        raise HTTPException(status_code=500, detail=f"Spectral analysis failed: {str(e)}")