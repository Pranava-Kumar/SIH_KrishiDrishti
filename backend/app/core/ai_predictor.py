# backend/app/core/ai_predictor.py

import torch
import os
import json
import logging
from .model_loader import get_model, get_hs_features, get_class_names
from .image_processor import preprocess_image
from app.utils.file_handler import get_upload_file_path

logger = logging.getLogger(__name__)

def run_analysis(upload_id: str) -> dict:
    """
    Runs the complete AI analysis pipeline for a given upload ID.
    Loads the image, preprocesses it, runs inference using the combined model,
    and saves the result.
    Returns the analysis result as a dictionary.
    """
    # 1. Get paths
    image_path = get_upload_file_path(upload_id)
    result_file_path = os.path.join("data", "results", f"{upload_id}.json")

    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Uploaded image file not found for ID {upload_id} at {image_path}")

    try:
        # 2. Preprocess the uploaded RGB image
        rgb_tensor = preprocess_image(image_path)

        # 3. Load the model and hyperspectral features
        model = get_model()
        hs_features = get_hs_features() # Shape: (N_patches, feature_dim_HS)

        # 4. Select Hyperspectral Feature (MVP Strategy)
        # For simplicity in MVP, we'll use the first available HS feature.
        # In a more advanced version, you'd map the RGB image location to a specific HS patch.
        # Here, we just take the first one. You might also consider averaging features.
        selected_hs_feature = hs_features[0:1] # Shape: (1, feature_dim_HS)

        # 5. Run Inference
        logger.info(f"Running inference for upload_id {upload_id}")
        with torch.no_grad(): # Disable gradient calculation for inference
            model.eval() # Ensure model is in evaluation mode
            # Pass the selected HS feature and the preprocessed RGB tensor
            # Note: The model expects (hs_feat, rgb_img)
            # hs_feat shape: (batch_size, feature_dim_HS) -> (1, 128) from pre-computed features
            # rgb_img shape: (batch_size, C, H, W) -> (1, 3, 224, 224)
            outputs = model(selected_hs_feature, rgb_tensor)
            probabilities = torch.nn.functional.softmax(outputs, dim=1)
            confidence, predicted_idx = torch.max(probabilities, 1)

        # 6. Format Results
        predicted_class_idx = predicted_idx.item()
        confidence_score = confidence.item()
        class_names = get_class_names()
        if predicted_class_idx < len(class_names):
             predicted_class_name = class_names[predicted_class_idx]
        else:
             predicted_class_name = f"Unknown_Class_{predicted_class_idx}" # Fallback if index is out of bounds
        # --- Recommendation Logic (Simple Example) ---
        # In a real system, this would be a more complex mapping or database lookup
        recommendation_map = {
            "Tomato___Bacterial_spot": "Apply copper-based fungicide.",
            "Tomato___Early_blight": "Use chlorothalonil or mancozeb fungicide.",
            "Tomato___Late_blight": "Apply metalaxyl or mefenoxam fungicide immediately.",
            "Tomato___Leaf_Mold": "Spray copper fungicide.",
            "Tomato___Septoria_leaf_spot": "Use chlorothalonil fungicide.",
            "Tomato___Spider_mites Two-spotted_spider_mite": "Apply abamectin or bifenthrin miticide.",
            "Tomato___Target_Spot": "Use copper-based fungicide.",
            "Tomato___Tomato_Yellow_Leaf_Curl_Virus": "Remove and destroy infected plants. Control whiteflies.",
            "Tomato___Tomato_mosaic_virus": "Remove and destroy infected plants.",
            "Potato___Early_blight": "Apply chlorothalonil fungicide.",
            "Potato___Late_blight": "Apply metalaxyl or mefenoxam fungicide immediately.",
            "Corn_(maize)___Common_rust_": "Apply triazole or strobilurin fungicide.",
            "Corn_(maize)___Northern_Leaf_Blight": "Apply fungicide like azoxystrobin.",
            "Apple___Apple_scab": "Apply captan or dodine fungicide.",
            "Grape___Black_rot": "Apply mancozeb or myclobutanil fungicide.",
            # Add more mappings as needed
        }
        recommendation = recommendation_map.get(predicted_class_name, "Consult an agricultural expert for specific treatment.")
        # --- End Recommendation Logic ---

        result = {
            "upload_id": upload_id,
            "prediction": predicted_class_name,
            "confidence": confidence_score,
            "recommendation": recommendation
        }

        # 7. Save Results
        os.makedirs(os.path.dirname(result_file_path), exist_ok=True)
        with open(result_file_path, 'w') as f:
            json.dump(result, f, indent=2)
        logger.info(f"Analysis result saved for upload_id {upload_id} at {result_file_path}")

        return result

    except Exception as e:
        logger.error(f"Error during analysis for upload_id {upload_id}: {e}")
        raise