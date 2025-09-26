import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import random
import os
import json
from typing import List, Dict, Any

class SensorDataGenerator:
    """
    Generates synthetic sensor data for the MVP (soil moisture, temperature, humidity)
    """
    
    def __init__(self):
        pass
    
    def generate_sensor_data(
        self,
        start_date: str,
        end_date: str,
        field_id: str = "field_1",
        crop_type: str = "corn",
        location: str = "default"
    ) -> List[Dict[str, Any]]:
        """
        Generate synthetic sensor data for a date range
        """
        start = datetime.strptime(start_date, "%Y-%m-%d")
        end = datetime.strptime(end_date, "%Y-%m-%d")
        
        data = []
        current_date = start
        
        while current_date <= end:
            # Generate realistic values based on crop type and environmental factors
            base_temp = self._get_base_temperature(crop_type)
            base_moisture = self._get_base_moisture(crop_type)
            base_humidity = self._get_base_humidity(crop_type)
            
            # Add some random variation and daily patterns
            day_offset = (current_date - start).days
            temp = base_temp + random.uniform(-5, 5) + 2 * np.sin(2 * np.pi * day_offset / 365.25)
            soil_moisture = base_moisture + random.uniform(-10, 10) + 5 * np.sin(2 * np.pi * day_offset / 30)
            humidity = base_humidity + random.uniform(-15, 15) + 10 * np.sin(2 * np.pi * day_offset / 7)
            
            # Ensure values stay in realistic ranges
            temp = max(0, min(45, temp))  # Temperature in Celsius
            soil_moisture = max(5, min(50, soil_moisture))  # Soil moisture percentage
            humidity = max(20, min(95, humidity))  # Humidity percentage
            
            data_point = {
                "date": current_date.strftime("%Y-%m-%d"),
                "field_id": field_id,
                "crop_type": crop_type,
                "location": location,
                "temperature": round(temp, 2),
                "soil_moisture": round(soil_moisture, 2),
                "humidity": round(humidity, 2),
                "timestamp": current_date.isoformat()
            }
            
            data.append(data_point)
            current_date += timedelta(days=1)
        
        return data
    
    def _get_base_temperature(self, crop_type: str) -> float:
        """Get base temperature for a specific crop type"""
        base_temps = {
            "corn": 25.0,
            "wheat": 20.0,
            "rice": 28.0,
            "soybean": 24.0,
            "cotton": 26.0,
            "sugarcane": 30.0,
            "tomato": 22.0,
            "potato": 18.0,
            "apple": 15.0,
            "grape": 20.0
        }
        return base_temps.get(crop_type.lower(), 22.0)  # Default to 22°C
    
    def _get_base_moisture(self, crop_type: str) -> float:
        """Get base soil moisture for a specific crop type"""
        base_moistures = {
            "corn": 30.0,
            "wheat": 25.0,
            "rice": 40.0,
            "soybean": 28.0,
            "cotton": 22.0,
            "sugarcane": 35.0,
            "tomato": 26.0,
            "potato": 24.0,
            "apple": 20.0,
            "grape": 18.0
        }
        return base_moistures.get(crop_type.lower(), 25.0)  # Default to 25%
    
    def _get_base_humidity(self, crop_type: str) -> float:
        """Get base humidity for a specific crop type"""
        base_humidities = {
            "corn": 65.0,
            "wheat": 60.0,
            "rice": 75.0,
            "soybean": 70.0,
            "cotton": 55.0,
            "sugarcane": 80.0,
            "tomato": 68.0,
            "potato": 72.0,
            "apple": 50.0,
            "grape": 45.0
        }
        return base_humidities.get(crop_type.lower(), 65.0)  # Default to 65%
    
    def generate_field_metadata(
        self,
        field_id: str,
        crop_type: str,
        planting_date: str,
        area_hectares: float,
        coordinates: Dict[str, float] = None
    ) -> Dict[str, Any]:
        """Generate field metadata"""
        if coordinates is None:
            coordinates = {"lat": 20.5937, "lng": 78.9629}  # Default to India center
        
        return {
            "field_id": field_id,
            "crop_type": crop_type,
            "planting_date": planting_date,
            "area_hectares": area_hectares,
            "coordinates": coordinates,
            "created_at": datetime.now().isoformat()
        }
    
    def save_sensor_data_to_csv(self, data: List[Dict[str, Any]], filepath: str):
        """Save sensor data to CSV file"""
        df = pd.DataFrame(data)
        df.to_csv(filepath, index=False)
        return filepath
    
    def save_metadata_to_json(self, metadata: Dict[str, Any], filepath: str):
        """Save metadata to JSON file"""
        with open(filepath, 'w') as f:
            json.dump(metadata, f, indent=2)
        return filepath

# Initialize the sensor data generator
sensor_generator = SensorDataGenerator()