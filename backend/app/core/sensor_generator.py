"""
Synthetic Sensor Data Generator for KrishiDrishti
This module generates realistic sensor data for temperature, humidity, soil moisture, and other environmental factors
"""
import random
import numpy as np
from datetime import datetime, timedelta
from typing import List, Dict, Any
import pandas as pd
import json

class SensorDataGenerator:
    """
    Generates synthetic sensor data for agricultural monitoring
    """
    
    def __init__(self):
        # Base values for different sensor types
        self.base_values = {
            "temperature": 25.0,  # Celsius
            "humidity": 60.0,     # Percentage
            "soil_moisture": 35.0,  # Percentage
            "soil_temperature": 22.0,  # Celsius
            "light_intensity": 500.0,  # Lux
            "wind_speed": 3.0,    # m/s
            "rainfall": 0.0       # mm
        }
        
        # Default crop types with specific parameters
        self.crop_params = {
            "corn": {
                "optimal_temperature": (20, 30),
                "optimal_moisture": (30, 45),
                "optimal_humidity": (50, 80)
            },
            "wheat": {
                "optimal_temperature": (15, 25),
                "optimal_moisture": (25, 40),
                "optimal_humidity": (40, 70)
            },
            "rice": {
                "optimal_temperature": (20, 35),
                "optimal_moisture": (40, 60),
                "optimal_humidity": (70, 90)
            },
            "soybean": {
                "optimal_temperature": (20, 30),
                "optimal_moisture": (35, 50),
                "optimal_humidity": (60, 85)
            }
        }
    
    def generate_daily_data(
        self, 
        start_date: str, 
        end_date: str, 
        crop_type: str = "corn", 
        location: str = "default",
        field_id: str = "field_1"
    ) -> List[Dict[str, Any]]:
        """
        Generate synthetic sensor data for a date range
        """
        start = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
        end = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
        
        # Calculate number of days
        num_days = (end - start).days + 1
        days = [start + timedelta(days=i) for i in range(num_days)]
        
        # Get crop parameters
        crop_params = self.crop_params.get(crop_type.lower(), self.crop_params["corn"])
        
        # Generate data for each day
        data = []
        for i, day in enumerate(days):
            # Base values with some variation
            temp = self._generate_temperature(i, crop_params["optimal_temperature"])
            humidity = self._generate_humidity(i, crop_params["optimal_humidity"], temp)
            soil_moisture = self._generate_soil_moisture(i, crop_params["optimal_moisture"])
            
            # Other sensor values based on environmental conditions
            soil_temp = temp - random.uniform(2, 5)  # Soil temp is typically a bit lower
            light_intensity = self._generate_light_intensity(i, temp, humidity)
            wind_speed = random.uniform(1.0, 6.0)
            
            # Rainfall (0 on most days, higher on some)
            rainfall = 0.0
            if random.random() < 0.2:  # 20% chance of rain
                rainfall = random.uniform(2.0, 15.0)
            
            day_data = {
                "date": day.strftime("%Y-%m-%d"),
                "field_id": field_id,
                "location": location,
                "crop_type": crop_type,
                "temperature": round(temp, 2),
                "humidity": round(humidity, 2),
                "soil_moisture": round(soil_moisture, 2),
                "soil_temperature": round(soil_temp, 2),
                "light_intensity": round(light_intensity, 2),
                "wind_speed": round(wind_speed, 2),
                "rainfall": round(rainfall, 2),
                "timestamp": datetime.now().isoformat()
            }
            
            data.append(day_data)
        
        return data
    
    def _generate_temperature(self, day_index: int, optimal_range: tuple) -> float:
        """
        Generate temperature value with seasonal variation
        """
        # Base temperature with seasonal variation
        seasonal_factor = 5 * np.sin(2 * np.pi * day_index / 365)  # Seasonal variation
        
        # Add some random variation
        random_factor = random.uniform(-3, 3)
        
        # Calculate base with optimal range
        optimal_min, optimal_max = optimal_range
        base_temp = (optimal_min + optimal_max) / 2
        
        temp = base_temp + seasonal_factor + random_factor
        
        # Ensure within reasonable bounds
        temp = max(-10, min(50, temp))
        
        return temp
    
    def _generate_humidity(self, day_index: int, optimal_range: tuple, temperature: float) -> float:
        """
        Generate humidity value correlated with temperature
        """
        optimal_min, optimal_max = optimal_range
        base_humidity = (optimal_min + optimal_max) / 2
        
        # Humidity generally inversely related to temperature
        temp_factor = -0.3 * (temperature - 25)  # Lower humidity with higher temperature
        
        # Seasonal variation
        seasonal_factor = 10 * np.sin(2 * np.pi * day_index / 365 + np.pi)  # Opposite of temperature
        
        # Random variation
        random_factor = random.uniform(-10, 10)
        
        humidity = base_humidity + temp_factor + seasonal_factor + random_factor
        
        # Ensure within bounds
        humidity = max(10, min(95, humidity))
        
        return humidity
    
    def _generate_soil_moisture(self, day_index: int, optimal_range: tuple) -> float:
        """
        Generate soil moisture value
        """
        optimal_min, optimal_max = optimal_range
        base_moisture = (optimal_min + optimal_max) / 2
        
        # Correlate with rainfall and evaporation
        # More moisture after rain, less with higher temperature
        rainfall_effect = random.uniform(-5, 15) if random.random() < 0.2 else random.uniform(-2, 5)
        temp_effect = -0.2 * max(0, self.base_values["temperature"] - 20)  # Evaporation with heat
        
        moisture = base_moisture + rainfall_effect + temp_effect
        
        # Ensure within bounds
        moisture = max(5, min(70, moisture))
        
        return moisture
    
    def _generate_light_intensity(self, day_index: int, temperature: float, humidity: float) -> float:
        """
        Generate light intensity value
        """
        # Base value with seasonal variation (longer days in summer)
        seasonal_factor = 200 * np.sin(2 * np.pi * day_index / 365)  # Seasonal variation
        
        # Light affects temperature
        temp_factor = 10 * max(0, temperature - 15)  # More light means more heat
        
        # Random variation
        random_factor = random.uniform(-100, 100)
        
        light = 500 + seasonal_factor + temp_factor + random_factor
        
        # Ensure within reasonable bounds
        light = max(100, min(1200, light))
        
        return light
    
    def save_sensor_data_to_csv(self, data: List[Dict[str, Any]], file_path: str):
        """
        Save sensor data to CSV file
        """
        df = pd.DataFrame(data)
        df.to_csv(file_path, index=False)
    
    def save_sensor_data_to_json(self, data: List[Dict[str, Any]], file_path: str):
        """
        Save sensor data to JSON file
        """
        with open(file_path, 'w') as f:
            json.dump(data, f, indent=2)

# Initialize the sensor data generator
sensor_generator = SensorDataGenerator()