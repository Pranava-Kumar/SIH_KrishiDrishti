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
        sensor_data = sensor_generator.generate_daily_data(
            request.start_date,
            request.end_date,
            request.crop_type,
            request.location,
            request.field_id
        )
        
        # Create a unique ID for this dataset
        dataset_id = str(uuid.uuid4())
        
        # Save to CSV
        csv_path = os.path.join("data", "sensors", f"{dataset_id}_sensor_data.csv")
        os.makedirs(os.path.dirname(csv_path), exist_ok=True)
        
        sensor_generator.save_sensor_data_to_csv(sensor_data, csv_path)
        
        # Also save to JSON
        json_path = os.path.join("data", "sensors", f"{dataset_id}_sensor_data.json")
        sensor_generator.save_sensor_data_to_json(sensor_data, json_path)
        
        logger.info(f"Generated sensor data for {request.field_id} from {request.start_date} to {request.end_date}")
        
        return {
            "dataset_id": dataset_id,
            "data_points": len(sensor_data),
            "csv_path": csv_path,
            "json_path": json_path,
            "message": f"Successfully generated {len(sensor_data)} sensor data points"
        }
    
    except Exception as e:
        logger.error(f"Error generating sensor data: {e}")
        raise HTTPException(status_code=500, detail=f"Sensor data generation failed: {str(e)}")

@router.get("/sensors/trends/{dataset_id}", response_model=TrendDataResponse)
async def get_trend_data(
    dataset_id: str,
    index_type: str = Query("temperature", description="Type of index: temperature, humidity, soil_moisture, soil_temperature, light_intensity, wind_speed, rainfall")
):
    """
    Get temporal trend data for visualization
    """
    try:
        # Look for the sensor data file
        csv_path = os.path.join("data", "sensors", f"{dataset_id}_sensor_data.csv")
        
        if not os.path.exists(csv_path):
            raise HTTPException(status_code=404, detail="Sensor data not found")
        
        import pandas as pd
        df = pd.read_csv(csv_path)
        
        # Convert to TrendDataPoint format based on index_type
        trend_data = []
        
        if index_type in df.columns:
            for _, row in df.iterrows():
                trend_data.append(TrendDataPoint(
                    date=row['date'],
                    value=row[index_type],
                    index_type=index_type
                ))
        else:  # Default to temperature if index_type not found
            for _, row in df.iterrows():
                trend_data.append(TrendDataPoint(
                    date=row['date'],
                    value=row['temperature'],
                    index_type="temperature"
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

@router.get("/sensors/data/{dataset_id}")
async def get_sensor_data(dataset_id: str):
    """
    Get the full sensor data for a dataset
    """
    try:
        json_path = os.path.join("data", "sensors", f"{dataset_id}_sensor_data.json")
        
        if not os.path.exists(json_path):
            raise HTTPException(status_code=404, detail="Sensor data not found")
        
        with open(json_path, 'r') as f:
            data = json.load(f)
        
        return {
            "dataset_id": dataset_id,
            "data": data,
            "count": len(data)
        }
    
    except Exception as e:
        logger.error(f"Error getting sensor data: {e}")
        raise HTTPException(status_code=500, detail=f"Sensor data retrieval failed: {str(e)}")

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