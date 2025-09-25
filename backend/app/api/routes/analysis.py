# backend/app/api/routes/analysis.py

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.api.models.schemas import AnalysisResult, ErrorResponse
from app.core.ai_predictor import run_analysis
from app.utils.file_handler import load_result_json
import uuid
import logging
import os
from datetime import datetime

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