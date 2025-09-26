# backend/app/api/routes/upload.py

from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from app.api.models.schemas import UploadResponse
from app.utils.file_handler import save_upload_file
import uuid
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/upload", response_model=UploadResponse)
async def upload_image(file: UploadFile = File(...)):
    """
    Upload an RGB image file for analysis.
    """
    # Validate file type (optional but recommended)
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload an image.")

    # Generate a unique ID for this upload
    upload_id = str(uuid.uuid4())

    # Handle case where filename might be None
    filename = file.filename if file.filename is not None else "unnamed_file"

    try:
        # Save the file using the utility function
        file_path = await save_upload_file(file, upload_id)
        logger.info(f"File uploaded successfully with ID: {upload_id}, path: {file_path}")
        return UploadResponse(upload_id=upload_id, filename=filename)
    except Exception as e:
        logger.error(f"Error saving uploaded file: {e}")
        raise HTTPException(status_code=500, detail="Failed to save uploaded file.")