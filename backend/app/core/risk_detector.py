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
                "dimensions": {"height": height, "width": width}
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