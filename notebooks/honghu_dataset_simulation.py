"""
Honghu Dataset Simulation for KrishiDrishti
This script creates simulated hyperspectral data similar to the Honghu satellite dataset
for testing and validation purposes.
"""
import numpy as np
import os
from spectral.io import envi
from datetime import datetime
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_honghu_simulation():
    """
    Create a simulated Honghu hyperspectral dataset
    Based on typical Honghu satellite specifications:
    - ~260-320 spectral bands
    - Spatial resolution ~30-100m
    - VNIR-SWIR spectrum (400-2500 nm)
    """
    # Define dimensions similar to Honghu satellite
    height = 100  # pixels
    width = 100   # pixels
    bands = 260   # spectral bands
    
    # Create a simulated dataset with different crop types and conditions
    data = np.random.rand(height, width, bands).astype(np.float32)
    
    # Simulate different regions with different spectral signatures
    # Region 1: Healthy crops (high reflectance in NIR)
    data[10:30, 10:30, 100:200] *= 1.3  # Higher reflectance in NIR bands
    data[10:30, 10:30, 100:200] = np.clip(data[10:30, 10:30, 100:200], 0, 1)
    
    # Region 2: Stressed crops (lower overall reflectance)
    data[40:60, 40:60] *= 0.7  # Lower reflectance overall
    
    # Region 3: Diseased crops (different spectral signature)
    data[70:90, 70:90, 50:100] *= 1.2  # Higher reflectance in visible bands
    data[70:90, 70:90, 100:150] *= 0.5  # Lower reflectance in NIR bands
    
    # Define wavelength information (simulated)
    wavelengths = np.linspace(400, 2500, bands)  # wavelengths in nm
    
    # Create metadata
    metadata = {
        'description': 'Simulated Honghu hyperspectral dataset for crop monitoring',
        'sensor': 'Honghu Satellite Simulation',
        'date': datetime.now().strftime('%Y-%m-%d'),
        'wavelength_unit': 'nm',
        'wavelength': wavelengths.tolist(),
        'bands': bands,
        'lines': height,
        'samples': width,
        'data_type': 12,  # Float32
    }
    
    # Create output directory if it doesn't exist
    output_dir = os.path.join("data", "datasets", "honghu_simulation")
    os.makedirs(output_dir, exist_ok=True)
    
    # Save as ENVI format (commonly used with spectral library)
    output_file = os.path.join(output_dir, "honghu_simulated")
    envi.save_image(f"{output_file}.hdr", data, metadata=metadata, force=True)
    
    logger.info(f"Simulated Honghu dataset saved to {output_file}")
    logger.info(f"Dataset shape: {data.shape}")
    logger.info(f"Number of bands: {bands}")
    logger.info(f"Wavelength range: {wavelengths[0]:.1f} - {wavelengths[-1]:.1f} nm")
    
    return output_file, data, metadata

def validate_spectral_indices(data, red_band=50, nir_band=100, green_band=30):
    """
    Compute and validate spectral indices similar to what would be done with real Honghu data
    """
    # Extract relevant bands
    red = data[:, :, red_band]
    nir = data[:, :, nir_band]
    green = data[:, :, green_band]
    
    # Compute NDVI (Normalized Difference Vegetation Index)
    # NDVI = (NIR - Red) / (NIR + Red)
    numerator = nir - red
    denominator = nir + red
    denominator = np.where(denominator == 0, 1, denominator)  # Avoid division by zero
    ndvi = numerator / denominator
    ndvi = np.clip(ndvi, -1, 1)  # NDVI ranges from -1 to 1
    
    # Compute NDRE (Normalized Difference Red Edge)
    # NDRE = (NIR - Red Edge) / (NIR + Red Edge)
    red_edge = data[:, :, 90]  # Approximate red edge band
    numerator = nir - red_edge
    denominator = nir + red_edge
    denominator = np.where(denominator == 0, 1, denominator)
    ndre = numerator / denominator
    ndre = np.clip(ndre, -1, 1)
    
    # Compute MSI (Moisture Stress Index)
    # MSI = SWIR / NIR
    swir = data[:, :, 200]  # Approximate SWIR band
    denominator = np.where(nir == 0, 1, nir)  # Avoid division by zero
    msi = swir / denominator
    
    logger.info(f"NDVI - Min: {np.min(ndvi):.3f}, Max: {np.max(ndvi):.3f}, Mean: {np.mean(ndvi):.3f}")
    logger.info(f"NDRE - Min: {np.min(ndre):.3f}, Max: {np.max(ndre):.3f}, Mean: {np.mean(ndre):.3f}")
    logger.info(f"MSI - Min: {np.min(msi):.3f}, Max: {np.max(msi):.3f}, Mean: {np.mean(msi):.3f}")
    
    return {'ndvi': ndvi, 'ndre': ndre, 'msi': msi}

if __name__ == "__main__":
    # Create the simulated Honghu dataset
    output_file, data, metadata = create_honghu_simulation()
    
    # Validate spectral indices
    indices = validate_spectral_indices(data)
    
    logger.info("Honghu dataset simulation completed successfully!")
    logger.info(f"Dataset saved to: {output_file}")