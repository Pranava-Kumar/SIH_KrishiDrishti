import torch
import torch.nn as nn
import numpy as np
from typing import Tuple, List, Dict, Any
import logging

logger = logging.getLogger(__name__)

class SpatialRiskCNN(nn.Module):
    """
    CNN model for detecting stress/pest zones from spectral data
    """
    def __init__(self, num_classes: int = 4, input_channels: int = 385):  # Honghu dataset has 385 bands
        super(SpatialRiskCNN, self).__init__()
        
        # Input: spectral data (height, width, bands) -> (bands, height, width) for PyTorch
        self.conv_layers = nn.Sequential(
            # First conv block - processing spectral bands
            nn.Conv2d(input_channels, 64, kernel_size=3, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(kernel_size=2, stride=2),
            
            # Second conv block
            nn.Conv2d(64, 128, kernel_size=3, padding=1),
            nn.BatchNorm2d(128),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(kernel_size=2, stride=2),
            
            # Third conv block
            nn.Conv2d(128, 256, kernel_size=3, padding=1),
            nn.BatchNorm2d(256),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(kernel_size=2, stride=2),
        )
        
        # Adaptive pooling to handle variable input sizes
        self.adaptive_pool = nn.AdaptiveAvgPool2d((4, 4))
        
        # Classifier
        self.classifier = nn.Sequential(
            nn.Dropout(0.5),
            nn.Linear(256 * 4 * 4, 512),
            nn.ReLU(inplace=True),
            nn.Dropout(0.5),
            nn.Linear(512, 256),
            nn.ReLU(inplace=True),
            nn.Linear(256, num_classes)
        )
        
        self.num_classes = num_classes
    
    def forward(self, x):
        # x shape: (batch_size, height, width, channels) -> (batch_size, channels, height, width)
        x = x.permute(0, 3, 1, 2)  # Reorder dimensions for PyTorch conv layers
        
        x = self.conv_layers(x)
        x = self.adaptive_pool(x)
        x = torch.flatten(x, 1)
        x = self.classifier(x)
        return x

class RiskDetector:
    """
    Risk detection model that analyzes spectral data for stress/pest zones
    """
    def __init__(self, model_path: str = None):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        
        # Number of classes: healthy, stress, pest_risk, disease
        self.num_classes = 4
        self.class_names = ["healthy", "stress", "pest_risk", "disease"]
        
        # Initialize model
        self.model = SpatialRiskCNN(num_classes=self.num_classes)
        self.model.to(self.device)
        
        # If model path provided, try to load pre-trained weights
        if model_path and torch.load(model_path, map_location=self.device):
            try:
                state_dict = torch.load(model_path, map_location=self.device)
                self.model.load_state_dict(state_dict)
                logger.info(f"Loaded pre-trained risk detection model from {model_path}")
            except Exception as e:
                logger.warning(f"Could not load pre-trained model: {e}. Using untrained model.")
        else:
            logger.info("Initialized risk detection model with random weights")
        
        self.model.eval()
    
    def detect_risk_zones(self, spectral_data: np.ndarray) -> Dict[str, Any]:
        """
        Detect risk zones in hyperspectral data
        """
        try:
            # spectral_data shape: (height, width, bands)
            height, width, bands = spectral_data.shape
            
            # Prepare input tensor
            # Add batch dimension and convert to tensor
            input_tensor = torch.tensor(spectral_data, dtype=torch.float32).unsqueeze(0).to(self.device)
            
            # Run inference
            with torch.no_grad():
                outputs = self.model(input_tensor)
                probabilities = torch.softmax(outputs, dim=1)
                confidence, predicted_class = torch.max(probabilities, 1)
                
                # Convert to numpy for further processing
                pred_class = predicted_class.cpu().numpy()[0]
                conf_score = confidence.cpu().numpy()[0]
                class_probs = probabilities.cpu().numpy()[0]
            
            # Create risk map - for each pixel, we'd need to process patches
            # For MVP, we'll create a simplified version
            risk_map = np.zeros((height, width), dtype=np.int32)
            confidence_map = np.zeros((height, width), dtype=np.float32)
            
            # This is a simplified approach - in a real implementation,
            # we'd process overlapping patches of the image
            patch_size = min(32, min(height, width))  # Use smaller patches for smaller images
            
            for i in range(0, height - patch_size + 1, patch_size//2):  # 50% overlap
                for j in range(0, width - patch_size + 1, patch_size//2):
                    # Extract patch
                    patch = spectral_data[i:i+patch_size, j:j+patch_size, :]
                    
                    # Pad patch if smaller than expected
                    if patch.shape[0] < patch_size or patch.shape[1] < patch_size:
                        padded_patch = np.zeros((patch_size, patch_size, bands), dtype=patch.dtype)
                        padded_patch[:patch.shape[0], :patch.shape[1], :] = patch
                        patch = padded_patch
                    
                    # Process patch
                    patch_tensor = torch.tensor(patch, dtype=torch.float32).unsqueeze(0).to(self.device)
                    
                    with torch.no_grad():
                        patch_outputs = self.model(patch_tensor)
                        patch_probs = torch.softmax(patch_outputs, dim=1)
                        patch_conf, patch_pred = torch.max(patch_probs, 1)
                    
                    # Assign prediction to the patch region
                    risk_map[i:i+patch_size, j:j+patch_size] = patch_pred.cpu().numpy()[0]
                    confidence_map[i:i+patch_size, j:j+patch_size] = patch_conf.cpu().numpy()[0]
            
            # Generate alerts based on risk zones
            alerts = self._generate_alerts(risk_map, confidence_map, height, width)
            
            result = {
                "risk_map": risk_map.tolist(),  # Convert to list for JSON serialization
                "confidence_map": confidence_map.tolist(),
                "overall_prediction": self.class_names[pred_class],
                "overall_confidence": float(conf_score),
                "class_probabilities": {self.class_names[i]: float(class_probs[i]) for i in range(self.num_classes)},
                "alerts": alerts,
                import torch
import torch.nn as nn
import numpy as np
from typing import Tuple, List, Dict, Any
import logging
from scipy import ndimage

logger = logging.getLogger(__name__)

class SpatialRiskCNN(nn.Module):
    """
    CNN model for detecting stress/pest zones from spectral data
    """
    def __init__(self, num_classes: int = 4, input_channels: int = 260):  # Honghu simulation has 260 bands
        super(SpatialRiskCNN, self).__init__()
        
        # Input: spectral data (height, width, bands) -> (bands, height, width) for PyTorch
        self.conv_layers = nn.Sequential(
            # First conv block - processing spectral bands
            nn.Conv2d(input_channels, 64, kernel_size=3, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(kernel_size=2, stride=2),
            
            # Second conv block
            nn.Conv2d(64, 128, kernel_size=3, padding=1),
            nn.BatchNorm2d(128),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(kernel_size=2, stride=2),
            
            # Third conv block
            nn.Conv2d(128, 256, kernel_size=3, padding=1),
            nn.BatchNorm2d(256),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(kernel_size=2, stride=2),
        )
        
        # Adaptive pooling to handle variable input sizes
        self.adaptive_pool = nn.AdaptiveAvgPool2d((4, 4))
        
        # Classifier
        self.classifier = nn.Sequential(
            nn.Dropout(0.5),
            nn.Linear(256 * 4 * 4, 512),
            nn.ReLU(inplace=True),
            nn.Dropout(0.5),
            nn.Linear(512, 256),
            nn.ReLU(inplace=True),
            nn.Linear(256, num_classes)
        )
        
        self.num_classes = num_classes
    
    def forward(self, x):
        # x shape: (batch_size, height, width, channels) -> (batch_size, channels, height, width)
        x = x.permute(0, 3, 1, 2)  # Reorder dimensions for PyTorch conv layers
        
        x = self.conv_layers(x)
        x = self.adaptive_pool(x)
        x = torch.flatten(x, 1)
        x = self.classifier(x)
        return x

class RiskDetector:
    """
    Risk detection model that analyzes spectral data for stress/pest zones
    """
    def __init__(self, model_path: str = None):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        
        # Number of classes: healthy, stress, pest_risk, disease
        self.num_classes = 4
        self.class_names = ["healthy", "stress", "pest_risk", "disease"]
        
        # Initialize model
        self.model = SpatialRiskCNN(num_classes=self.num_classes)
        self.model.to(self.device)
        
        # If model path provided, try to load pre-trained weights
        if model_path and torch.load(model_path, map_location=self.device):
            try:
                state_dict = torch.load(model_path, map_location=self.device)
                self.model.load_state_dict(state_dict)
                logger.info(f"Loaded pre-trained risk detection model from {model_path}")
            except Exception as e:
                logger.warning(f"Could not load pre-trained model: {e}. Using untrained model.")
        else:
            logger.info("Initialized risk detection model with random weights")
        
        self.model.eval()
    
    def detect_risk_zones(self, spectral_data: np.ndarray, sensor_type: str = 'honghu') -> Dict[str, Any]:
        """
        Detect risk zones in hyperspectral data using both CNN and spectral indices
        """
        try:
            # spectral_data shape: (height, width, bands)
            height, width, bands = spectral_data.shape
            
            # Get spectral indices using the enhanced processor
            from .spectral_processor import spectral_processor
            spectral_indices = spectral_processor.compute_all_indices(spectral_data, sensor_type)
            
            # Run CNN-based risk detection
            cnn_result = self._detect_risk_cnn(spectral_data)
            
            # Combine CNN results with spectral indices for more accurate risk assessment
            combined_result = self._combine_results(cnn_result, spectral_indices, height, width)
            
            # Generate alerts based on combined analysis
            alerts = self._generate_alerts(combined_result['risk_map'], 
                                         combined_result['confidence_map'], 
                                         height, width, spectral_indices)
            
            result = {
                "risk_map": combined_result['risk_map'].tolist(),  # Convert to list for JSON serialization
                "confidence_map": combined_result['confidence_map'].tolist(),
                "overall_prediction": combined_result['overall_prediction'],
                "overall_confidence": combined_result['overall_confidence'],
                "class_probabilities": combined_result['class_probabilities'],
                "spectral_indices": {k: v.tolist()[:10] for k, v in spectral_indices.items()},  # First 10 rows as sample
                "alerts": alerts,
                "dimensions": {"height": height, "width": width},
                "summary": self._generate_summary(alerts, height, width)
            }
            
            return result
            
        except Exception as e:
            logger.error(f"Error in risk detection: {e}")
            raise
    
    def _detect_risk_cnn(self, spectral_data: np.ndarray) -> Dict[str, Any]:
        """
        Run CNN-based risk detection
        """
        # spectral_data shape: (height, width, bands)
        height, width, bands = spectral_data.shape
        
        # Prepare input tensor
        # Add batch dimension and convert to tensor
        input_tensor = torch.tensor(spectral_data, dtype=torch.float32).unsqueeze(0).to(self.device)
        
        # Run inference
        with torch.no_grad():
            outputs = self.model(input_tensor)
            probabilities = torch.softmax(outputs, dim=1)
            confidence, predicted_class = torch.max(probabilities, 1)
            
            # Convert to numpy for further processing
            pred_class = predicted_class.cpu().numpy()[0]
            conf_score = confidence.cpu().numpy()[0]
            class_probs = probabilities.cpu().numpy()[0]
        
        # Create risk map - for each pixel, we'd need to process patches
        # For MVP, we'll create a simplified version
        risk_map = np.zeros((height, width), dtype=np.int32)
        confidence_map = np.zeros((height, width), dtype=np.float32)
        
        # This is a simplified approach - in a real implementation,
        # we'd process overlapping patches of the image
        patch_size = min(32, min(height, width))  # Use smaller patches for smaller images
        
        for i in range(0, height - patch_size + 1, patch_size//2):  # 50% overlap
            for j in range(0, width - patch_size + 1, patch_size//2):
                # Extract patch
                patch = spectral_data[i:i+patch_size, j:j+patch_size, :]
                
                # Pad patch if smaller than expected
                if patch.shape[0] < patch_size or patch.shape[1] < patch_size:
                    padded_patch = np.zeros((patch_size, patch_size, bands), dtype=patch.dtype)
                    padded_patch[:patch.shape[0], :patch.shape[1], :] = patch
                    patch = padded_patch
                
                # Process patch
                patch_tensor = torch.tensor(patch, dtype=torch.float32).unsqueeze(0).to(self.device)
                
                with torch.no_grad():
                    patch_outputs = self.model(patch_tensor)
                    patch_probs = torch.softmax(patch_outputs, dim=1)
                    patch_conf, patch_pred = torch.max(patch_probs, 1)
                
                # Assign prediction to the patch region
                risk_map[i:i+patch_size, j:j+patch_size] = patch_pred.cpu().numpy()[0]
                confidence_map[i:i+patch_size, j:j+patch_size] = patch_conf.cpu().numpy()[0]
        
        result = {
            "risk_map": risk_map,
            "confidence_map": confidence_map,
            "overall_prediction": self.class_names[pred_class],
            "overall_confidence": float(conf_score),
            "class_probabilities": {self.class_names[i]: float(class_probs[i]) for i in range(self.num_classes)}
        }
        
        return result
    
    def _combine_results(self, cnn_result: Dict, spectral_indices: Dict, height: int, width: int) -> Dict[str, Any]:
        """
        Combine CNN results with spectral indices for enhanced risk assessment
        """
        # Get the CNN-based risk map and confidence map
        cnn_risk_map = cnn_result['risk_map']
        cnn_confidence_map = cnn_result['confidence_map']
        
        # Get spectral indices
        ndvi = spectral_indices['ndvi']
        ndre = spectral_indices['ndre']
        msi = spectral_indices['msi']
        
        # Create enhanced risk map based on spectral indices
        enhanced_risk_map = np.zeros((height, width), dtype=np.int32)
        
        # Classify risk levels based on spectral indices
        # High risk: NDVI <= 0.2, NDRE <= 0.1, MSI >= 2.0
        high_risk = ((ndvi <= 0.2) | (ndre <= 0.1) | (msi >= 2.0))
        enhanced_risk_map[high_risk] = 3  # High risk
        
        # Moderate risk: NDVI 0.2-0.4, NDRE 0.1-0.2, MSI 1.5-2.0
        moderate_risk = (
            ((ndvi > 0.2) & (ndvi <= 0.4)) | 
            ((ndre > 0.1) & (ndre <= 0.2)) | 
            ((msi >= 1.5) & (msi < 2.0))
        ) & (enhanced_risk_map == 0)  # Only apply to areas not already classified as high risk
        enhanced_risk_map[moderate_risk] = 2  # Moderate risk
        
        # Low risk: NDVI 0.4-0.6, NDRE 0.2-0.4, MSI 1.2-1.5
        low_risk = (
            ((ndvi > 0.4) & (ndvi <= 0.6)) | 
            ((ndre > 0.2) & (ndre <= 0.4)) | 
            ((msi >= 1.2) & (msi < 1.5))
        ) & (enhanced_risk_map == 0)  # Only apply to areas not already classified
        enhanced_risk_map[low_risk] = 1  # Low risk
        
        # Healthy: NDVI > 0.6, NDRE > 0.4, MSI < 1.2
        # These remain as 0 (healthy) in enhanced_risk_map
        
        # Combine CNN and spectral results
        # Where CNN and spectral agree, keep the result
        # Where they differ, use the higher risk assessment
        combined_risk_map = np.maximum(cnn_risk_map, enhanced_risk_map)
        
        # For confidence map, we'll use spectral indices confidence where available,
        # and CNN confidence elsewhere
        # In this implementation, we'll blend both
        combined_confidence_map = np.maximum(cnn_confidence_map, 
                                           np.minimum(1.0, np.abs(ndvi) + np.abs(ndre) + 1/msi.clip(0.1)))
        
        # Normalize confidence to 0-1 range
        combined_confidence_map = np.clip(combined_confidence_map / 3.0, 0.0, 1.0)
        
        # Determine overall prediction based on majority class in risk map
        unique, counts = np.unique(combined_risk_map, return_counts=True)
        majority_class_idx = unique[np.argmax(counts)]
        if majority_class_idx == 0:
            overall_prediction = "healthy"
        elif majority_class_idx == 1:
            overall_prediction = "stress"
        elif majority_class_idx == 2:
            overall_prediction = "pest_risk"
        else:
            overall_prediction = "disease"
        
        # Calculate overall confidence as average of confidence map
        overall_confidence = float(np.mean(combined_confidence_map))
        
        # Calculate class probabilities based on risk distribution
        total_pixels = height * width
        class_probabilities = {
            "healthy": float(np.sum(combined_risk_map == 0) / total_pixels),
            "stress": float(np.sum(combined_risk_map == 1) / total_pixels),
            "pest_risk": float(np.sum(combined_risk_map == 2) / total_pixels),
            "disease": float(np.sum(combined_risk_map == 3) / total_pixels)
        }
        
        result = {
            "risk_map": combined_risk_map,
            "confidence_map": combined_confidence_map,
            "overall_prediction": overall_prediction,
            "overall_confidence": overall_confidence,
            "class_probabilities": class_probabilities
        }
        
        return result
    
    def _generate_alerts(self, risk_map: np.ndarray, confidence_map: np.ndarray, 
                        height: int, width: int, spectral_indices: Dict) -> List[Dict[str, Any]]:
        """
        Generate alerts based on risk zones detected
        """
        alerts = []
        
        # Find contiguous regions of the same risk class
        for class_idx in range(1, 4):  # Skip 'healthy' class (index 0), include 1, 2, 3
            class_mask = (risk_map == class_idx).astype(np.uint8)
            
            if np.any(class_mask):
                # Label connected components
                labeled_regions, num_regions = ndimage.label(class_mask)
                
                for region_idx in range(1, num_regions + 1):
                    region_mask = (labeled_regions == region_idx)
                    region_area = np.sum(region_mask)
                    
                    # Only create alerts for significant regions
                    if region_area > (height * width * 0.005):  # Alert if >0.5% of image
                        # Calculate center coordinates and average confidence
                        region_coords = np.where(region_mask)
                        center_y = int(np.mean(region_coords[0]))
                        center_x = int(np.mean(region_coords[1]))
                        avg_confidence = float(np.mean(confidence_map[region_mask]))
                        
                        # Calculate spectral index averages for the region
                        region_ndvi = float(np.mean(spectral_indices['ndvi'][region_mask]))
                        region_ndre = float(np.mean(spectral_indices['ndre'][region_mask]))
                        region_msi = float(np.mean(spectral_indices['msi'][region_mask]))
                        
                        # Determine risk level based on confidence
                        if avg_confidence > 0.7:
                            risk_level = "high"
                        elif avg_confidence > 0.4:
                            risk_level = "medium"
                        else:
                            risk_level = "low"
                        
                        # Generate recommendation based on risk type and spectral characteristics
                        risk_type = self._classify_risk_type(region_ndvi, region_ndre, region_msi)
                        recommendation = self._get_recommendation(risk_type)
                        
                        alert = {
                            "risk_type": risk_type,
                            "risk_level": risk_level,
                            "zone_coords": {
                                "center": {"x": center_x, "y": center_y},
                                "bbox": {
                                    "x": int(np.min(region_coords[1])),
                                    "y": int(np.min(region_coords[0])),
                                    "width": int(np.max(region_coords[1]) - np.min(region_coords[1])),
                                    "height": int(np.max(region_coords[0]) - np.min(region_coords[0]))
                                }
                            },
                            "area_percentage": round(region_area / (height * width) * 100, 2),
                            "average_confidence": avg_confidence,
                            "average_ndvi": region_ndvi,
                            "average_ndre": region_ndre,
                            "average_msi": region_msi,
                            "recommendation": recommendation
                        }
                        
                        alerts.append(alert)
        
        return alerts
    
    def _classify_risk_type(self, avg_ndvi: float, avg_ndre: float, avg_msi: float) -> str:
        """
        Classify risk type based on spectral indices averages
        """
        # Determine risk type based on combinations of indices
        if avg_ndvi < 0.2 and avg_ndre < 0.1:
            return 'severe_stress'
        elif avg_msi > 2.0:
            return 'moisture_stress'
        elif avg_ndvi < 0.3 and avg_ndre < 0.2:
            return 'nutrient_deficiency'
        elif avg_ndvi < 0.4 and avg_ndre < 0.3:
            # Check for pest/disease patterns (typically more complex)
            # This is a simplified classification - in reality, this would use
            # more sophisticated pattern recognition
            return 'pest_disease_risk'
        elif avg_ndvi < 0.5 or avg_ndre < 0.4:
            return 'general_stress'
        else:
            return 'monitoring_needed'
    
    def _get_recommendation(self, risk_type: str) -> str:
        """
        Get treatment recommendation based on risk type
        """
        recommendations = {
            "severe_stress": "Immediate intervention required. Apply appropriate fertilizer and check for irrigation. Consider crop rotation for next season.",
            "moisture_stress": "Increase irrigation frequency and amount. Consider mulching to retain moisture.",
            "nutrient_deficiency": "Apply specific fertilizer based on soil test results. Consider foliar feeding for quick response.",
            "pest_disease_risk": "Apply appropriate pesticide/fungicide immediately. Remove infected plants if necessary.",
            "general_stress": "Comprehensive field evaluation needed. Consider multiple intervention strategies.",
            "monitoring_needed": "Regular monitoring. Document any changes."
        }
        
        return recommendations.get(risk_type, "Consult local agricultural expert for appropriate treatment.")
    
    def _generate_summary(self, alerts: List[Dict], height: int, width: int) -> Dict[str, Any]:
        """
        Generate a summary of risk assessment
        """
        summary = {
            'total_alerts': len(alerts),
            'risk_distribution': {
                'high': 0,
                'medium': 0,
                'low': 0
            },
            'total_affected_area': 0,
            'risk_types': {
                'severe_stress': 0,
                'moisture_stress': 0,
                'nutrient_deficiency': 0,
                'pest_disease_risk': 0,
                'general_stress': 0,
                'monitoring_needed': 0
            }
        }
        
        for alert in alerts:
            risk_level = alert['risk_level']
            summary['risk_distribution'][risk_level] += 1
            
            risk_type = alert['risk_type']
            summary['risk_types'][risk_type] += 1
            
            summary['total_affected_area'] += alert['area_percentage']
        
        total_pixels = height * width
        summary['total_affected_area_percentage'] = round(summary['total_affected_area'], 2)
        
        return summary

# Initialize the risk detector
risk_detector = RiskDetector()
            }
            
            return result
            
        except Exception as e:
            logger.error(f"Error in risk detection: {e}")
            raise
    
    def _generate_alerts(self, risk_map: np.ndarray, confidence_map: np.ndarray, height: int, width: int) -> List[Dict[str, Any]]:
        """
        Generate alerts based on risk zones detected
        """
        alerts = []
        
        # Find contiguous regions of the same risk class
        from scipy import ndimage
        
        for class_idx in range(1, self.num_classes):  # Skip 'healthy' class (index 0)
            class_mask = (risk_map == class_idx).astype(np.uint8)
            
            if np.any(class_mask):
                # Label connected components
                labeled_regions, num_regions = ndimage.label(class_mask)
                
                for region_idx in range(1, num_regions + 1):
                    region_mask = (labeled_regions == region_idx)
                    region_area = np.sum(region_mask)
                    
                    # Only create alerts for significant regions
                    if region_area > (height * width * 0.01):  # Alert if >1% of image
                        # Calculate center coordinates and average confidence
                        region_coords = np.where(region_mask)
                        center_y = int(np.mean(region_coords[0]))
                        center_x = int(np.mean(region_coords[1]))
                        avg_confidence = float(np.mean(confidence_map[region_mask]))
                        
                        # Determine risk level based on confidence
                        if avg_confidence > 0.8:
                            risk_level = "high"
                        elif avg_confidence > 0.6:
                            risk_level = "medium"
                        else:
                            risk_level = "low"
                        
                        # Generate recommendation based on risk type
                        recommendation = self._get_recommendation(self.class_names[class_idx])
                        
                        alert = {
                            "risk_type": self.class_names[class_idx],
                            "risk_level": risk_level,
                            "zone_coords": {
                                "center": {"x": center_x, "y": center_y},
                                "bbox": {
                                    "x": int(np.min(region_coords[1])),
                                    "y": int(np.min(region_coords[0])),
                                    "width": int(np.max(region_coords[1]) - np.min(region_coords[1])),
                                    "height": int(np.max(region_coords[0]) - np.min(region_coords[0]))
                                }
                            },
                            "area_percentage": round(region_area / (height * width) * 100, 2),
                            "average_confidence": avg_confidence,
                            "recommendation": recommendation,
                            "timestamp": ""
                        }
                        
                        alerts.append(alert)
        
        return alerts
    
    def _get_recommendation(self, risk_type: str) -> str:
        """
        Get treatment recommendation based on risk type
        """
        recommendations = {
            "stress": "Apply appropriate fertilizers and adjust irrigation schedule. Monitor for nutrient deficiencies.",
            "pest_risk": "Apply appropriate pesticide treatment. Consider Integrated Pest Management (IPM) practices.",
            "disease": "Apply fungicide treatment as per local agricultural guidelines. Remove affected plant parts if possible."
        }
        
        return recommendations.get(risk_type, "Consult local agricultural expert for appropriate treatment.")

# Initialize the risk detector
risk_detector = RiskDetector()