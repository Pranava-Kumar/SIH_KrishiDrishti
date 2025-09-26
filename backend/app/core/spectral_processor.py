import numpy as np
import spectral as spy
import rasterio
from typing import Dict, Tuple, Any
import logging
import os
from pathlib import Path

logger = logging.getLogger(__name__)

class SpectralProcessor:
    """
    Handles hyperspectral/multispectral data processing and spectral index computation
    """
    
    def __init__(self):
        pass
    
    def load_hyperspectral_data(self, file_path: str) -> Dict[str, Any]:
        """
        Load hyperspectral data from ENVI/TIFF files
        """
        try:
            if file_path.endswith('.hdr') or file_path.endswith('.dat'):
                # ENVI format
                img = spy.open_image(file_path)
                if img is None:
                    raise ValueError(f"Could not load hyperspectral data from {file_path}")
                
                data = img.load()
                metadata = img.metadata
                
                return {
                    'data': data,
                    'metadata': metadata,
                    'shape': data.shape,
                    'bands': data.shape[2] if len(data.shape) == 3 else 1
                }
            elif file_path.lower().endswith(('.tif', '.tiff', '.geotiff')):
                # GeoTIFF format
                with rasterio.open(file_path) as src:
                    data = src.read()  # Shape: (bands, height, width)
                    metadata = {
                        'transform': src.transform,
                        'crs': src.crs,
                        'nodata': src.nodata
                    }
                    
                # Transpose to (height, width, bands) format
                data = np.transpose(data, (1, 2, 0))
                
                return {
                    'data': data,
                    'metadata': metadata,
                    'shape': data.shape,
                    'bands': data.shape[2] if len(data.shape) == 3 else 1
                }
            else:
                raise ValueError(f"Unsupported file format: {file_path}")
        except Exception as e:
            logger.error(f"Error loading hyperspectral data from {file_path}: {e}")
            raise
    
    def compute_ndvi(self, data: np.ndarray, red_band: int = 2, nir_band: int = 3) -> np.ndarray:
        """
        Compute Normalized Difference Vegetation Index (NDVI)
        NDVI = (NIR - Red) / (NIR + Red)
        """
        try:
            if len(data.shape) != 3:
                raise ValueError("Data must be 3D (height, width, bands)")
            
            red = data[:, :, red_band]
            nir = data[:, :, nir_band]
            
            # Calculate NDVI
            numerator = nir.astype(np.float32) - red.astype(np.float32)
            denominator = nir.astype(np.float32) + red.astype(np.float32)
            
            # Avoid division by zero
            denominator = np.where(denominator == 0, 1, denominator)
            
            ndvi = numerator / denominator
            
            # Clip values to [-1, 1] range
            ndvi = np.clip(ndvi, -1, 1)
            
            return ndvi
        except Exception as e:
            logger.error(f"Error computing NDVI: {e}")
            raise
    
    def compute_ndre(self, data: np.ndarray, red_edge_band: int = 3, nir_band: int = 4) -> np.ndarray:
        """
        Compute Normalized Difference Red Edge Index (NDRE)
        NDRE = (NIR - Red Edge) / (NIR + Red Edge)
        """
        try:
            if len(data.shape) != 3:
                raise ValueError("Data must be 3D (height, width, bands)")
            
            red_edge = data[:, :, red_edge_band]
            nir = data[:, :, nir_band]
            
            # Calculate NDRE
            numerator = nir.astype(np.float32) - red_edge.astype(np.float32)
            denominator = nir.astype(np.float32) + red_edge.astype(np.float32)
            
            # Avoid division by zero
            denominator = np.where(denominator == 0, 1, denominator)
            
            ndre = numerator / denominator
            
            # Clip values to [-1, 1] range
            ndre = np.clip(ndre, -1, 1)
            
            return ndre
        except Exception as e:
            logger.error(f"Error computing NDRE: {e}")
            raise
    
    def compute_msi(self, data: np.ndarray, nir_band: int = 4, swir_band: int = 5) -> np.ndarray:
        """
        Compute Moisture Stress Index (MSI)
        MSI = SWIR / NIR
        """
        try:
            if len(data.shape) != 3:
                raise ValueError("Data must be 3D (height, width, bands)")
            
            nir = data[:, :, nir_band]
            swir = data[:, :, swir_band]
            
            # Calculate MSI
            # Avoid division by zero
            nir_safe = np.where(nir == 0, 1, nir)
            
            msi = swir.astype(np.float32) / nir_safe.astype(np.float32)
            
            return msi
        except Exception as e:
            logger.error(f"Error computing MSI: {e}")
            raise
    
    def compute_savi(self, data: np.ndarray, red_band: int = 2, nir_band: int = 4, L: float = 0.5) -> np.ndarray:
        """
        Compute Soil-Adjusted Vegetation Index (SAVI)
        SAVI = ((NIR - Red) / (NIR + Red + L)) * (1 + L)
        """
        try:
            if len(data.shape) != 3:
                raise ValueError("Data must be 3D (height, width, bands)")
            
            red = data[:, :, red_band]
            nir = data[:, :, nir_band]
            
            # Calculate SAVI
            numerator = (nir - red).astype(np.float32)
            denominator = (nir + red + L).astype(np.float32)
            
            # Avoid division by zero
            denominator = np.where(denominator == 0, 1, denominator)
            
            savi = (numerator / denominator) * (1 + L)
            
            # Clip values to [-1, 1] range (though SAVI can exceed these bounds)
            savi = np.clip(savi, -2, 2)
            
            return savi
        except Exception as e:
            logger.error(f"Error computing SAVI: {e}")
            raise
    
    def generate_health_map(self, ndvi: np.ndarray) -> np.ndarray:
        """
        Generate a health color map based on NDVI values
        """
        try:
            # Create RGB image from NDVI values
            height, width = ndvi.shape
            health_map = np.zeros((height, width, 3), dtype=np.uint8)
            
            # Map NDVI values to colors:
            # -1 to 0: brown (bare soil)
            # 0 to 0.2: yellow (stressed vegetation)
            # 0.2 to 0.5: light green (moderate vegetation)
            # 0.5 to 1: dark green (healthy vegetation)
            
            # Create masks for different health levels
            brown_mask = ndvi <= 0
            yellow_mask = (ndvi > 0) & (ndvi <= 0.2)
            light_green_mask = (ndvi > 0.2) & (ndvi <= 0.5)
            dark_green_mask = ndvi > 0.5
            
            # Assign RGB values
            health_map[brown_mask] = [139, 69, 19]  # Brown
            health_map[yellow_mask] = [255, 255, 0]  # Yellow
            health_map[light_green_mask] = [144, 238, 144]  # Light green
            health_map[dark_green_mask] = [0, 128, 0]  # Dark green
            
            return health_map
        except Exception as e:
            logger.error(f"Error generating health map: {e}")
            raise

# Initialize the spectral processor
spectral_processor = SpectralProcessor()