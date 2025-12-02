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
        # Define band indices for common satellite sensors
        self.band_definitions = {
            # Honghu satellite (simulated)
            'honghu': {
                'red': 50,      # Approximate red band (~670nm)
                'red_edge': 90, # Approximate red edge band (~700nm) 
                'nir': 100,     # Approximate NIR band (~800nm)
                'swir': 200     # Approximate SWIR band (~1600nm)
            },
            # Sentinel-2
            'sentinel2': {
                'red': 3,       # Band 4 (Red, ~665nm)
                'red_edge': 5,  # Band 5 (Red Edge, ~705nm)
                'nir': 6,       # Band 8 (NIR, ~842nm)
                'swir': 11      # Band 11 (SWIR, ~1610nm)
            },
            # Landsat 8
            'landsat8': {
                'red': 3,       # Band 4 (Red, ~650nm)
                'nir': 4,       # Band 5 (NIR, ~860nm)
                'swir': 6       # Band 7 (SWIR, ~2140nm)
            }
        }
    
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
                    'bands': data.shape[2] if len(data.shape) == 3 else 1,
                    'sensor_type': self._detect_sensor_type(metadata)
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
                    'bands': data.shape[2] if len(data.shape) == 3 else 1,
                    'sensor_type': 'unknown'  # Need to determine from file properties
                }
            else:
                raise ValueError(f"Unsupported file format: {file_path}")
        except Exception as e:
            logger.error(f"Error loading hyperspectral data from {file_path}: {e}")
            raise
    
    def _detect_sensor_type(self, metadata: Dict) -> str:
        """
        Detect sensor type based on metadata
        """
        # Try to determine sensor type from metadata
        if 'sensor' in metadata:
            sensor = metadata['sensor'].lower()
            if 'honghu' in sensor or 'hh' in sensor:
                return 'honghu'
            elif 'sentinel' in sensor or 's2' in sensor:
                return 'sentinel2'
            elif 'landsat' in sensor or 'l8' in sensor:
                return 'landsat8'
        
        # Default to Honghu if not specified
        return 'honghu'
    
    def _get_band_indices(self, sensor_type: str, red_band: int = None, red_edge_band: int = None, 
                         nir_band: int = None, swir_band: int = None) -> Dict[str, int]:
        """
        Get appropriate band indices based on sensor type
        """
        if sensor_type in self.band_definitions:
            default_bands = self.band_definitions[sensor_type]
            return {
                'red': red_band if red_band is not None else default_bands['red'],
                'red_edge': red_edge_band if red_edge_band is not None else default_bands['red_edge'],
                'nir': nir_band if nir_band is not None else default_bands['nir'],
                'swir': swir_band if swir_band is not None else default_bands['swir']
            }
        else:
            # Return provided bands or defaults
            return {
                'red': red_band if red_band is not None else 2,
                'red_edge': red_edge_band if red_edge_band is not None else 3,
                'nir': nir_band if nir_band is not None else 4,
                'swir': swir_band if swir_band is not None else 5
            }
    
    def compute_all_indices(self, data: np.ndarray, sensor_type: str = 'honghu', 
                           red_band: int = None, red_edge_band: int = None, 
                           nir_band: int = None, swir_band: int = None) -> Dict[str, np.ndarray]:
        """
        Compute all spectral indices at once for efficiency
        """
        try:
            if len(data.shape) != 3:
                raise ValueError("Data must be 3D (height, width, bands)")
            
            # Get appropriate band indices
            bands = self._get_band_indices(sensor_type, red_band, red_edge_band, nir_band, swir_band)
            
            # Extract bands
            red = data[:, :, bands['red']].astype(np.float32)
            red_edge = data[:, :, bands['red_edge']].astype(np.float32)
            nir = data[:, :, bands['nir']].astype(np.float32)
            swir = data[:, :, bands['swir']].astype(np.float32)
            
            indices = {}
            
            # NDVI calculation: (NIR - Red) / (NIR + Red)
            ndvi_num = nir - red
            ndvi_den = np.where(nir + red == 0, 1, nir + red)
            indices['ndvi'] = np.clip(ndvi_num / ndvi_den, -1, 1)
            
            # NDRE calculation: (NIR - Red Edge) / (NIR + Red Edge)
            ndre_num = nir - red_edge
            ndre_den = np.where(nir + red_edge == 0, 1, nir + red_edge)
            indices['ndre'] = np.clip(ndre_num / ndre_den, -1, 1)
            
            # MSI calculation: SWIR / NIR
            msi_den = np.where(nir == 0, 1, nir)
            indices['msi'] = swir / msi_den
            
            # SAVI calculation: ((NIR - Red) / (NIR + Red + L)) * (1 + L) where L=0.5
            L = 0.5
            savi_num = nir - red
            savi_den = np.where(nir + red + L == 0, 1, nir + red + L)
            indices['savi'] = np.clip((savi_num / savi_den) * (1 + L), -2, 2)
            
            # EVI calculation: 2.5 * ((NIR - Red) / (NIR + 6*Red - 7.5*Blue + 1))
            # Using a proxy for blue band (first band) - not accurate but for demonstration
            blue_proxy = data[:, :, 0].astype(np.float32)
            evi_num = nir - red
            evi_den = np.where(nir + 6*red - 7.5*blue_proxy + 1 == 0, 1, nir + 6*red - 7.5*blue_proxy + 1)
            indices['evi'] = 2.5 * (evi_num / evi_den)
            
            return indices
        except Exception as e:
            logger.error(f"Error computing all spectral indices: {e}")
            raise
    
    def compute_ndvi(self, data: np.ndarray, red_band: int = None, nir_band: int = None, 
                     sensor_type: str = 'honghu') -> np.ndarray:
        """
        Compute Normalized Difference Vegetation Index (NDVI)
        NDVI = (NIR - Red) / (NIR + Red)
        """
        try:
            if len(data.shape) != 3:
                raise ValueError("Data must be 3D (height, width, bands)")
            
            # Get appropriate band indices
            bands = self._get_band_indices(sensor_type, red_band=red_band, nir_band=nir_band)
            
            red = data[:, :, bands['red']].astype(np.float32)
            nir = data[:, :, bands['nir']].astype(np.float32)
            
            # Calculate NDVI
            numerator = nir - red
            denominator = np.where(nir + red == 0, 1, nir + red)
            
            ndvi = numerator / denominator
            
            # Clip values to [-1, 1] range
            ndvi = np.clip(ndvi, -1, 1)
            
            return ndvi
        except Exception as e:
            logger.error(f"Error computing NDVI: {e}")
            raise
    
    def compute_ndre(self, data: np.ndarray, red_edge_band: int = None, nir_band: int = None, 
                     sensor_type: str = 'honghu') -> np.ndarray:
        """
        Compute Normalized Difference Red Edge Index (NDRE)
        NDRE = (NIR - Red Edge) / (NIR + Red Edge)
        """
        try:
            if len(data.shape) != 3:
                raise ValueError("Data must be 3D (height, width, bands)")
            
            # Get appropriate band indices
            bands = self._get_band_indices(sensor_type, red_edge_band=red_edge_band, nir_band=nir_band)
            
            red_edge = data[:, :, bands['red_edge']].astype(np.float32)
            nir = data[:, :, bands['nir']].astype(np.float32)
            
            # Calculate NDRE
            numerator = nir - red_edge
            denominator = np.where(nir + red_edge == 0, 1, nir + red_edge)
            
            ndre = numerator / denominator
            
            # Clip values to [-1, 1] range
            ndre = np.clip(ndre, -1, 1)
            
            return ndre
        except Exception as e:
            logger.error(f"Error computing NDRE: {e}")
            raise
    
    def compute_msi(self, data: np.ndarray, nir_band: int = None, swir_band: int = None, 
                    sensor_type: str = 'honghu') -> np.ndarray:
        """
        Compute Moisture Stress Index (MSI)
        MSI = SWIR / NIR
        """
        try:
            if len(data.shape) != 3:
                raise ValueError("Data must be 3D (height, width, bands)")
            
            # Get appropriate band indices
            bands = self._get_band_indices(sensor_type, nir_band=nir_band, swir_band=swir_band)
            
            nir = data[:, :, bands['nir']].astype(np.float32)
            swir = data[:, :, bands['swir']].astype(np.float32)
            
            # Calculate MSI
            # Avoid division by zero
            nir_safe = np.where(nir == 0, 1, nir)
            
            msi = swir / nir_safe
            
            return msi
        except Exception as e:
            logger.error(f"Error computing MSI: {e}")
            raise
    
    def compute_savi(self, data: np.ndarray, red_band: int = None, nir_band: int = None, 
                     L: float = 0.5, sensor_type: str = 'honghu') -> np.ndarray:
        """
        Compute Soil-Adjusted Vegetation Index (SAVI)
        SAVI = ((NIR - Red) / (NIR + Red + L)) * (1 + L)
        """
        try:
            if len(data.shape) != 3:
                raise ValueError("Data must be 3D (height, width, bands)")
            
            # Get appropriate band indices
            bands = self._get_band_indices(sensor_type, red_band=red_band, nir_band=nir_band)
            
            red = data[:, :, bands['red']].astype(np.float32)
            nir = data[:, :, bands['nir']].astype(np.float32)
            
            # Calculate SAVI
            numerator = nir - red
            denominator = np.where(nir + red + L == 0, 1, nir + red + L)
            
            savi = (numerator / denominator) * (1 + L)
            
            # Clip values to [-2, 2] range (though SAVI can exceed these bounds)
            savi = np.clip(savi, -2, 2)
            
            return savi
        except Exception as e:
            logger.error(f"Error computing SAVI: {e}")
            raise
    
    def compute_evi(self, data: np.ndarray, red_band: int = None, nir_band: int = None, 
                    blue_band: int = 0, sensor_type: str = 'honghu') -> np.ndarray:
        """
        Compute Enhanced Vegetation Index (EVI)
        EVI = 2.5 * ((NIR - Red) / (NIR + 6*Red - 7.5*Blue + 1))
        """
        try:
            if len(data.shape) != 3:
                raise ValueError("Data must be 3D (height, width, bands)")
            
            # Get appropriate band indices
            bands = self._get_band_indices(sensor_type, red_band=red_band, nir_band=nir_band)
            
            red = data[:, :, bands['red']].astype(np.float32)
            nir = data[:, :, bands['nir']].astype(np.float32)
            blue = data[:, :, blue_band].astype(np.float32)
            
            # Calculate EVI
            numerator = nir - red
            denominator = np.where(nir + 6*red - 7.5*blue + 1 == 0, 1, nir + 6*red - 7.5*blue + 1)
            
            evi = 2.5 * (numerator / denominator)
            
            # EVI can range from -1 to 1 under normal conditions but may exceed these bounds
            evi = np.clip(evi, -2, 2)
            
            return evi
        except Exception as e:
            logger.error(f"Error computing EVI: {e}")
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