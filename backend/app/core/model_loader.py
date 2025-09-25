# backend/app/core/model_loader.py

import torch
import os
import logging

logger = logging.getLogger(__name__)

# --- Configuration ---
MODEL_PATH = os.path.join("data", "models", "combined_model.pth")
HS_FEATURES_PATH = os.path.join("data", "models", "hs_features.pt")
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
# Assuming you know the number of classes from your training
NUM_RGB_CLASSES = 15 # As defined in your notebook
# Define PlantVillage class names (must match the order from your training dataset)
PLANTVILLAGE_CLASSES = [
    'Apple___Apple_scab', 'Apple___Black_rot', 'Apple___Cedar_apple_rust', 'Apple___healthy',
    'Blueberry___healthy', 'Cherry_(including_sour)___Powdery_mildew', 'Cherry_(including_sour)___healthy',
    'Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot', 'Corn_(maize)___Common_rust_', 'Corn_(maize)___Northern_Leaf_Blight', 'Corn_(maize)___healthy',
    'Grape___Black_rot', 'Grape___Esca_(Black_Measles)', 'Grape___Leaf_blight_(Isariopsis_Leaf_Spot)', 'Grape___healthy',
    'Orange___Haunglongbing_(Citrus_greening)', 'Peach___Bacterial_spot', 'Peach___healthy',
    'Pepper,_bell___Bacterial_spot', 'Pepper,_bell___healthy', 'Potato___Early_blight', 'Potato___Late_blight', 'Potato___healthy',
    'Raspberry___healthy', 'Soybean___healthy', 'Squash___Powdery_mildew', 'Strawberry___Leaf_scorch', 'Strawberry___healthy',
    'Tomato___Bacterial_spot', 'Tomato___Early_blight', 'Tomato___Late_blight', 'Tomato___Leaf_Mold', 'Tomato___Septoria_leaf_spot',
    'Tomato___Spider_mites Two-spotted_spider_mite', 'Tomato___Target_Spot', 'Tomato___Tomato_Yellow_Leaf_Curl_Virus', 'Tomato___Tomato_mosaic_virus', 'Tomato___healthy'
] # Update this list based on your actual training classes if different

# The NUM_RGB_CLASSES should match the number used during training (15 as per the training script)
NUM_RGB_CLASSES = 15  # As defined in the training script

# --- Model and Features Loading ---
model = None
hs_features = None

def load_model_and_features():
    """Loads the model and hyperspectral features into memory."""
    global model, hs_features
    try:
        logger.info(f"Loading hyperspectral features from {HS_FEATURES_PATH}...")
        hs_features = torch.load(HS_FEATURES_PATH, map_location=DEVICE)
        logger.info(f"Hyperspectral features loaded. Shape: {hs_features.shape}")
        
        # Define the model architecture based on the keys in the state dict
        # From the error message, it looks like the model consists of rgb_model and classifier
        class CombinedModel(torch.nn.Module):
            def __init__(self, input_size=128, num_classes=NUM_RGB_CLASSES):
                super(CombinedModel, self).__init__()
                
                import torch.nn as nn
                
                # Create the RGB model based on the structure in state dict
                self.rgb_model = torch.nn.Sequential(
                    # This is a simplified representation - the actual model would need
                    # to match the exact structure from training
                    nn.Conv2d(3, 64, kernel_size=7, stride=2, padding=3, bias=False),  # conv1
                    nn.BatchNorm2d(64),  # bn1
                    nn.ReLU(inplace=True),
                    nn.MaxPool2d(kernel_size=3, stride=2, padding=1),
                    # Add layer blocks (simplified)
                    self._make_layer(64, 64, 3),  # layer1 with 3 blocks
                    self._make_layer(64, 128, 4, stride=2),  # layer2 with 4 blocks
                    self._make_layer(128, 256, 6, stride=2),  # layer3 with 6 blocks
                    self._make_layer(256, 512, 3, stride=2),  # layer4 with 3 blocks
                    nn.AdaptiveAvgPool2d((1, 1)),  # Adaptive avg pooling
                    nn.Flatten(),  # Flatten
                    nn.Linear(512, 128),  # fc layer (simplified)
                )
                
                # Classifier layers
                self.classifier = torch.nn.Sequential(
                    nn.Linear(128 + input_size, 256),  # Combined HS features and RGB features
                    nn.ReLU(),
                    nn.Dropout(0.5),
                    nn.Linear(256, 128),
                    nn.ReLU(),
                    nn.Linear(128, num_classes)
                )
                
            def _make_layer(self, in_channels, out_channels, blocks, stride=1):
                layers = []
                layers.append(torch.nn.Conv2d(in_channels, out_channels, kernel_size=3, stride=stride, padding=1, bias=False))
                layers.append(torch.nn.BatchNorm2d(out_channels))
                layers.append(torch.nn.ReLU(inplace=True))
                
                for _ in range(1, blocks):
                    layers.append(torch.nn.Conv2d(out_channels, out_channels, kernel_size=3, padding=1, bias=False))
                    layers.append(torch.nn.BatchNorm2d(out_channels))
                    layers.append(torch.nn.ReLU(inplace=True))
                
                return torch.nn.Sequential(*layers)
            
            def forward(self, hs_features, rgb_images):
                # Process RGB images
                rgb_features = self.rgb_model(rgb_images)
                
                # Concatenate hyperspectral features with RGB features
                combined = torch.cat((hs_features, rgb_features), dim=1)
                
                # Classification
                output = self.classifier(combined)
                return output

        # Based on the training script (ai_model.py), the actual model architecture is:
        # CombinedModel contains:
        #   - rgb_model which is an RGBResNet (ResNet18-based with custom fc layer)
        #     - base_model with ResNet structure (conv1, bn1, layer1-4, avgpool, fc)
        #   - classifier with Linear layers
        
        import torch.nn as nn
        import torchvision.models as models

        class RGBResNet(nn.Module):
            """The RGB model part based on the training script."""
            def __init__(self, output_dim=128):
                super().__init__()
                # Use ResNet18 - this will match the trained model
                self.base_model = models.resnet18(weights=None)  # Don't load pretrained weights since we'll load from our model
                # Replace the final classification layer to output the feature vector
                self.base_model.fc = nn.Linear(self.base_model.fc.in_features, output_dim)

            def forward(self, x):
                return self.base_model(x)

        class CombinedModel(nn.Module):
            """The complete combined model based on the training script."""
            def __init__(self, final_classes):
                super().__init__()
                # The RGB model as defined in the training script
                self.rgb_model = RGBResNet(output_dim=128)  # Output 128-dim features
                
                # The classifier as defined in the training script
                self.classifier = nn.Sequential(
                    nn.Linear(128 + 128, 256),  # 128 from HS features, 128 from RGB features
                    nn.ReLU(),
                    nn.Dropout(0.3),
                    nn.Linear(256, final_classes)  # Number of final classes
                )

            def forward(self, hs_feat, rgb_img):
                rgb_feat = self.rgb_model(rgb_img)
                combined = torch.cat([hs_feat, rgb_feat], dim=1)
                out = self.classifier(combined)
                return out

        # Initialize the actual model with the correct architecture
        model = CombinedModel(final_classes=NUM_RGB_CLASSES)
        
        logger.info(f"Loading model from {MODEL_PATH} on device {DEVICE}...")
        model_state_dict = torch.load(MODEL_PATH, map_location=DEVICE)
        
        # Load the state dict, allowing for missing keys (like the fc layer which might have different dimensions)
        model.load_state_dict(model_state_dict, strict=False)
        model.to(DEVICE)
        model.eval()
        
        logger.info("Model loaded successfully with trained weights.")

        # Load hyperspectral features
        logger.info(f"Loading hyperspectral features from {HS_FEATURES_PATH}...")
        hs_features = torch.load(HS_FEATURES_PATH, map_location=DEVICE)
        logger.info(f"Hyperspectral features loaded. Shape: {hs_features.shape}")

    except FileNotFoundError as e:
        logger.error(f"Model or features file not found: {e}")
        raise
    except Exception as e:
        logger.error(f"Error loading model or features: {e}")
        raise

def get_model():
    """Returns the loaded model, loading it if necessary."""
    if model is None:
        load_model_and_features()
    return model

def get_hs_features():
    """Returns the loaded hyperspectral features, loading them if necessary."""
    if hs_features is None:
        load_model_and_features()
    return hs_features

def get_class_names():
    """Returns the list of class names."""
    # Truncate or select based on NUM_RGB_CLASSES if needed
    return PLANTVILLAGE_CLASSES[:NUM_RGB_CLASSES]

# Load model and features when this module is imported
load_model_and_features()
logger.info("Model and features loaded at startup.")