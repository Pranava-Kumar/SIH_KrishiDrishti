# backend/app/core/image_processor.py

from PIL import Image
import torch
from torchvision import transforms
import logging

logger = logging.getLogger(__name__)

# Define the same transforms used during training
# Assuming RGB_IMG_SIZE = (224, 224) from your notebook
IMAGE_SIZE = (224, 224)
preprocess_transform = transforms.Compose([
    transforms.Resize(IMAGE_SIZE),
    transforms.ToTensor(), # Converts PIL Image to Tensor and scales [0, 255] to [0, 1]
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]) # ImageNet normalization
])

def preprocess_image(image_path: str) -> torch.Tensor:
    """
    Loads an image from path, preprocesses it, and returns a PyTorch tensor.
    Expects the image to be an RGB file (JPG, PNG, etc.).
    """
    try:
        logger.info(f"Preprocessing image: {image_path}")
        with Image.open(image_path) as img:
            # Verify it's RGB
            if img.mode != 'RGB':
                # Convert to RGB if necessary (e.g., RGBA -> RGB)
                img = img.convert('RGB')
            # Apply transforms
            tensor = preprocess_transform(img)
            # Add batch dimension (1, C, H, W)
            tensor = tensor.unsqueeze(0)
            logger.info(f"Image preprocessed successfully. Shape: {tensor.shape}")
            return tensor
    except Exception as e:
        logger.error(f"Error preprocessing image {image_path}: {e}")
        raise