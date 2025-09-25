# backend/app/utils/file_handler.py

import os
from fastapi import UploadFile
import aiofiles # For async file operations
import json
import logging

logger = logging.getLogger(__name__)

# Define base paths relative to the backend directory
UPLOAD_DIR = os.path.join("data", "uploads")
RESULTS_DIR = os.path.join("data", "results")

# Ensure directories exist
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(RESULTS_DIR, exist_ok=True)

async def save_upload_file(file: UploadFile, upload_id: str) -> str:
    """
    Saves an uploaded file asynchronously.
    The file is saved as {upload_id}.{extension} in the UPLOAD_DIR.
    """
    # Sanitize filename to prevent path traversal
    filename = f"{upload_id}{os.path.splitext(file.filename)[1]}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    async with aiofiles.open(file_path, 'wb') as buffer:
        content = await file.read() # Read file content asynchronously
        await buffer.write(content) # Write content asynchronously

    logger.info(f"Saved uploaded file to {file_path}")
    return file_path

def get_upload_file_path(upload_id: str) -> str:
    """
    Constructs the expected path for an uploaded file based on its ID.
    Assumes the file was saved with the pattern {upload_id}.{extension}.
    """
    # This is a simplified approach. In a more robust system,
    # you might store the original filename or extension in a database.
    # For MVP, we'll try common image extensions.
    for ext in ['.jpg', '.jpeg', '.png', '.bmp', '.tiff']:
        path = os.path.join(UPLOAD_DIR, f"{upload_id}{ext}")
        if os.path.exists(path):
            return path
    # If not found with common extensions, look for files that start with upload_id
    # This handles cases where the file was saved with the upload_id as the filename
    for filename in os.listdir(UPLOAD_DIR):
        if filename.startswith(upload_id):
            path = os.path.join(UPLOAD_DIR, filename)
            if os.path.exists(path):
                return path
    raise FileNotFoundError(f"No file found for upload_id: {upload_id}")

def load_result_json(upload_id: str) -> dict:
    """
    Loads the analysis result JSON file for a given upload ID.
    """
    file_path = os.path.join(RESULTS_DIR, f"{upload_id}.json")
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Result file not found for upload_id: {upload_id}")

    with open(file_path, 'r') as f:
        result_data = json.load(f)

    # Validate that the loaded data has the expected keys
    required_keys = ["upload_id", "prediction", "confidence", "recommendation"]
    for key in required_keys:
        if key not in result_data:
            raise ValueError(f"Result JSON for {upload_id} is missing required key: {key}")

    # Ensure the upload_id in the file matches the requested ID
    if result_data["upload_id"] != upload_id:
         logger.warning(f"Upload ID mismatch in result file {file_path}. Expected {upload_id}, found {result_data['upload_id']}.")

    return result_data

# Optional: Function to clean up old files (e.g., after 24 hours)
# This could be run periodically by a background task scheduler like Celery.
def cleanup_old_files(directory: str, hours_old: int = 24):
    """
    Removes files in the given directory older than 'hours_old'.
    """
    import time
    current_time = time.time()
    cutoff_time = current_time - (hours_old * 3600)

    for filename in os.listdir(directory):
        file_path = os.path.join(directory, filename)
        if os.path.isfile(file_path):
            file_time = os.path.getmtime(file_path)
            if file_time < cutoff_time:
                try:
                    os.remove(file_path)
                    logger.info(f"Cleaned up old file: {file_path}")
                except OSError as e:
                    logger.error(f"Error deleting file {file_path}: {e}")