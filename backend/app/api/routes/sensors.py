# backend/app/api/routes/sensors.py

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from app.core.sensor_generator import sensor_generator
from app.api.models.schemas import TrendDataResponse, TrendDataPoint
from datetime import datetime
import logging
import uuid
import os
import json

logger = logging.getLogger(__name__)
router = APIRouter()

class SensorDataRequest(BaseModel):
    start_date: str  # Format: YYYY-MM-DD
    end_date: str    # Format: YYYY-MM-DD
    field_id: str = "field_1"
    crop_type: str = "corn"
    location: str = "default"

@router.post("/sensors/generate", response_model=dict)
async def generate_sensor_data(request: SensorDataRequest):
    """
    Generate synthetic sensor data for the specified date range
    """
    try:
        # Validate date format
        datetime.strptime(request.start_date, "%Y-%m-%d")
        datetime.strptime(request.end_date, "%Y-%m-%d")
        
        # Generate sensor data
        sensor_data = sensor_generator.generate_sensor_data(
            request.start_date,
            request.end_date,
            request.field_id,
            request.crop_type,
            request.location
        )
        
        # Create a unique ID for this dataset
        dataset_id = str(uuid.uuid4())
        
        # Save to CSV
        csv_path = os.path.join("data", "sensors", f"{dataset_id}_sensor_data.csv")
        os.makedirs(os.path.dirname(csv_path), exist_ok=True)
        
        sensor_generator.save_sensor_data_to_csv(sensor_data, csv_path)
        
        logger.info(f"Generated sensor data for {request.field_id} from {request.start_date} to {request.end_date}")
        
        return {
            "dataset_id": dataset_id,
            "data_points": len(sensor_data),
            "file_path": csv_path,
            "message": f"Successfully generated {len(sensor_data)} sensor data points"
        }
    
    except Exception as e:
        logger.error(f"Error generating sensor data: {e}")
        raise HTTPException(status_code=500, detail=f"Sensor data generation failed: {str(e)}")

@router.get("/sensors/trends/{dataset_id}", response_model=TrendDataResponse)
async def get_trend_data(
    dataset_id: str,
    index_type: str = Query("ndvi", description="Type of index: ndvi, soil_moisture, temperature, humidity")
):
    """
    Get temporal trend data for visualization
    """
    try:
        # In a real implementation, this would fetch from a database or CSV
        # For now, we'll generate sample trend data
        
        # Look for the sensor data file
        csv_path = os.path.join("data", "sensors", f"{dataset_id}_sensor_data.csv")
        
        if not os.path.exists(csv_path):
            raise HTTPException(status_code=404, detail="Sensor data not found")
        
        import pandas as pd
        df = pd.read_csv(csv_path)
        
        # Convert to TrendDataPoint format based on index_type
        trend_data = []
        
        if index_type == "soil_moisture":
            for _, row in df.iterrows():
                trend_data.append(TrendDataPoint(
                    date=row['date'],
                    value=row['soil_moisture'],
                    index_type=index_type
                ))
        elif index_type == "temperature":
            for _, row in df.iterrows():
                trend_data.append(TrendDataPoint(
                    date=row['date'],
                    value=row['temperature'],
                    index_type=index_type
                ))
        elif index_type == "humidity":
            for _, row in df.iterrows():
                trend_data.append(TrendDataPoint(
                    date=row['date'],
                    value=row['humidity'],
                    index_type=index_type
                ))
        else:  # Default to NDVI-like data if not sensor data
            # Generate sample NDVI data if we're showing spectral index trends
            for _, row in df.iterrows():
                # Generate a sample NDVI value based on conditions
                temp_factor = (row['temperature'] - 20) / 10  # Normalize temperature effect
                moisture_factor = (row['soil_moisture'] - 25) / 10  # Normalize moisture effect
                sample_ndvi = 0.5 + temp_factor * 0.1 + moisture_factor * 0.1
                sample_ndvi = max(-1, min(1, sample_ndvi))  # Clamp to [-1, 1]
                
                trend_data.append(TrendDataPoint(
                    date=row['date'],
                    value=sample_ndvi,
                    index_type="ndvi"
                ))
        
        response = TrendDataResponse(
            upload_id=dataset_id,
            index_type=index_type,
            data=trend_data,
            timestamp=datetime.now().isoformat()
        )
        
        return response
    
    except Exception as e:
        logger.error(f"Error getting trend data: {e}")
        raise HTTPException(status_code=500, detail=f"Trend data retrieval failed: {str(e)}")

@router.post("/sensors/metadata", response_model=dict)
async def create_field_metadata(field_metadata: dict):
    """
    Create field metadata
    """
    try:
        field_id = field_metadata.get("field_id", str(uuid.uuid4()))
        
        # Save metadata to JSON
        json_path = os.path.join("data", "metadata", f"{field_id}_metadata.json")
        os.makedirs(os.path.dirname(json_path), exist_ok=True)
        
        with open(json_path, 'w') as f:
            json.dump(field_metadata, f, indent=2)
        
        logger.info(f"Created metadata for field: {field_id}")
        
        return {
            "field_id": field_id,
            "file_path": json_path,
            "message": "Field metadata created successfully"
        }
    
    except Exception as e:
        logger.error(f"Error creating field metadata: {e}")
        raise HTTPException(status_code=500, detail=f"Metadata creation failed: {str(e)}")