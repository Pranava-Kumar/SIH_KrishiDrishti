# backend/app/api/routes/analysis.py

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.api.models.schemas import AnalysisResult, ErrorResponse, AlertResponse
from app.core.ai_predictor import run_analysis
from app.core.risk_detector import risk_detector
from app.utils.file_handler import load_result_json
from app.core.spectral_processor import spectral_processor
import uuid
import logging
import os
import json
import numpy as np
from datetime import datetime
from typing import List, Dict, Any

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/analyze/{upload_id}", response_model=AnalysisResult)
async def analyze_image(upload_id: str):
    """
    Trigger AI analysis for a given upload ID.
    This endpoint runs the analysis pipeline.
    """
    # Validate upload_id format (optional but good practice)
    try:
        uuid.UUID(upload_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid upload ID format.")

    # Define the path where the result will be saved
    result_file_path = os.path.join("data", "results", f"{upload_id}.json")

    # Check if result already exists (for demo purposes or if re-running)
    if os.path.exists(result_file_path):
        logger.info(f"Result for upload_id {upload_id} already exists. Loading from file.")
        try:
            result_data = load_result_json(upload_id)
            # Ensure timestamp is in the correct format
            if 'timestamp' not in result_data:
                 result_data['timestamp'] = datetime.utcnow().isoformat() + "Z"
            return AnalysisResult(**result_data)
        except Exception as e:
            logger.error(f"Error loading existing result for {upload_id}: {e}")
            # If loading fails, proceed to run analysis

    # If result doesn't exist, run the analysis
    try:
        # Call the core analysis function
        result = run_analysis(upload_id)
        # Add timestamp to the result
        result['timestamp'] = datetime.utcnow().isoformat() + "Z"
        logger.info(f"Analysis completed for upload_id {upload_id}. Result: {result}")
        return AnalysisResult(**result)
    except Exception as e:
        logger.error(f"Error during analysis for upload_id {upload_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@router.get("/results/{upload_id}", response_model=AnalysisResult)
async def get_result(upload_id: str):
    """
    Retrieve the analysis result for a given upload ID.
    """
    try:
        uuid.UUID(upload_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid upload ID format.")

    try:
        result_data = load_result_json(upload_id)
        # Ensure timestamp is in the correct format if not already loaded
        if 'timestamp' not in result_data:
             result_data['timestamp'] = datetime.utcnow().isoformat() + "Z"
        logger.info(f"Result retrieved for upload_id {upload_id}")
        return AnalysisResult(**result_data)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Result not found for the given upload ID.")
    except Exception as e:
        logger.error(f"Error loading result for {upload_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to load result.")

@router.post("/analyze-risk/{upload_id}", response_model=dict)
async def analyze_risk_zones(upload_id: str):
    """
    Analyze hyperspectral data for stress/pest risk zones
    """
    try:
        # Validate upload_id
        try:
            uuid.UUID(upload_id)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid upload ID format.")
        
        # Construct the path to the hyperspectral data
        # In MVP, we assume spectral data is stored in a specific format
        data_path = os.path.join("data", "uploads", f"{upload_id}.dat")  # ENVI format
        hdr_path = os.path.join("data", "uploads", f"{upload_id}.hdr")  # Header file
        
        # Try different file extensions
        if os.path.exists(data_path):
            spectral_data_info = spectral_processor.load_hyperspectral_data(data_path)
        elif os.path.exists(hdr_path):
            spectral_data_info = spectral_processor.load_hyperspectral_data(hdr_path)
        else:
            # If no hyperspectral file, try to create from regular image (simulated)
            # This is for MVP - in real implementation, we'd need actual hyperspectral data
            raise HTTPException(status_code=404, detail="Hyperspectral data not found. Only ENVI format (.dat/.hdr) supported for risk analysis.")
        
        # Run risk detection on the spectral data
        spectral_data = spectral_data_info['data']
        risk_results = risk_detector.detect_risk_zones(spectral_data)
        
        # Save risk analysis results
        risk_result_file_path = os.path.join("data", "results", f"{upload_id}_risk.json")
        os.makedirs(os.path.dirname(risk_result_file_path), exist_ok=True)
        
        with open(risk_result_file_path, 'w') as f:
            json.dump(risk_results, f, indent=2)
        
        return {
            "upload_id": upload_id,
            "risk_analysis": risk_results,
            "result_path": risk_result_file_path,
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }
    
    except Exception as e:
        logger.error(f"Error during risk analysis for upload_id {upload_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Risk analysis failed: {str(e)}")

@router.get("/alerts/{upload_id}", response_model=List[AlertResponse])
async def get_alerts(upload_id: str):
    """
    Retrieve alerts for a given upload ID
    """
    try:
        # Validate upload_id
        try:
            uuid.UUID(upload_id)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid upload ID format.")
        
        # Load risk analysis results which contain alerts
        risk_result_file_path = os.path.join("data", "results", f"{upload_id}_risk.json")
        
        if not os.path.exists(risk_result_file_path):
            # If no risk analysis exists, check if regular analysis exists
            regular_result_path = os.path.join("data", "results", f"{upload_id}.json")
            if os.path.exists(regular_result_path):
                # For regular analysis, return a generic alert based on the prediction
                with open(regular_result_path, 'r') as f:
                    result_data = json.load(f)
                
                # Create a basic alert based on the prediction
                risk_level = "medium" if result_data.get("confidence", 0) < 0.7 else "low"
                if "disease" in result_data.get("prediction", "").lower() or "pest" in result_data.get("prediction", "").lower():
                    risk_type = "disease" if "disease" in result_data.get("prediction", "").lower() else "pest_risk"
                else:
                    risk_type = "general"
                
                basic_alert = AlertResponse(
                    alert_id=f"{upload_id}_basic",
                    upload_id=upload_id,
                    risk_type=risk_type,
                    risk_level=risk_level,
                    zone="General Field",
                    recommendation=result_data.get("recommendation", "Follow standard agricultural practices"),
                    timestamp=result_data.get("timestamp", datetime.utcnow().isoformat())
                )
                
                return [basic_alert]
            else:
                raise HTTPException(status_code=404, detail="No analysis results found for this upload ID.")
        
        # Load risk analysis results
        with open(risk_result_file_path, 'r') as f:
            risk_data = json.load(f)
        
        alerts = risk_data.get("alerts", [])
        
        # Convert to AlertResponse models
        alert_responses = []
        for i, alert in enumerate(alerts):
            alert_response = AlertResponse(
                alert_id=f"{upload_id}_alert_{i}",
                upload_id=upload_id,
                risk_type=alert.get("risk_type", "unknown"),
                risk_level=alert.get("risk_level", "medium"),
                zone=f"Zone {i+1}",
                recommendation=alert.get("recommendation", "Consult agricultural expert"),
                timestamp=alert.get("timestamp", datetime.utcnow().isoformat())
            )
            alert_responses.append(alert_response)
        
        return alert_responses
    
    except Exception as e:
        logger.error(f"Error retrieving alerts for upload_id {upload_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Alert retrieval failed: {str(e)}")