import cv2
import numpy as np
from inference_sdk import InferenceHTTPClient
import os

# Placeholder for Roboflow client (update with valid credentials)
CLIENT = None
MODEL_ID = "data_tonghop/2"

def process_frame(rgb_frame, depth_frame, output_dir="output"):
    """
    Process RGB and depth frames to detect pigs, draw bounding boxes, and crop regions.
    Returns processed RGB frame and predictions.
    """
    os.makedirs(output_dir, exist_ok=True)
    
    # Placeholder for inference (replace with your model)
    predictions = []
    try:
        # Save RGB frame temporarily
        temp_path = os.path.join(output_dir, "temp_rgb.jpg")
        cv2.imwrite(temp_path, rgb_frame)

        # Roboflow inference (uncomment and update when API key is available)
        """
        CLIENT = InferenceHTTPClient(
            api_url="https://outline.roboflow.com",
            api_key="YOUR_VALID_API_KEY"
        )
        response = CLIENT.infer(temp_path, model_id=MODEL_ID)
        predictions = response.get("predictions", [])
        """
        
        # Dummy predictions for testing
        predictions = [
            {"x": 300, "y": 200, "width": 100, "height": 100, "weight": 45.2},
            {"x": 500, "y": 250, "width": 120, "height": 110, "weight": 50.1}
        ]
        
        os.remove(temp_path)
    except Exception as e:
        print(f"Inference error: {e}")
        predictions = []

    # Draw bounding boxes and crop regions
    frame_count = 0
    bbox_count = 1
    processed_rgb = rgb_frame.copy()
    crops = []
    
    for pred in predictions:
        x = int(pred["x"])
        y = int(pred["y"])
        width = int(pred["width"])
        height = int(pred["height"])
        padding = 10
        
        # Bounding box coordinates
        x1 = max(x - width // 2 - padding, 0)
        y1 = max(y - height // 2 - padding, 0)
        x2 = min(x + width // 2 + padding, rgb_frame.shape[1] - 1)
        y2 = min(y + height // 2 + padding, rgb_frame.shape[0] - 1)
        
        # Draw bounding box on RGB
        cv2.rectangle(processed_rgb, (x1, y1), (x2, y2), (0, 255, 0), 2)
        cv2.putText(
            processed_rgb, f"{pred.get('weight', 0):.1f} kg",
            (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2
        )
        
        # Crop RGB and depth
        cropped_rgb = rgb_frame[y1:y2, x1:x2]
        cropped_depth = depth_frame[y1:y2, x1:x2]
        
        # Save crops
        rgb_crop_path = os.path.join(output_dir, f"frame_{frame_count}_rgb_crop_{bbox_count}.png")
        depth_crop_path = os.path.join(output_dir, f"frame_{frame_count}_depth_crop_{bbox_count}.png")
        cv2.imwrite(rgb_crop_path, cropped_rgb)
        cv2.imwrite(depth_crop_path, cropped_depth)
        
        crops.append({
            "rgb_path": rgb_crop_path,
            "depth_path": depth_crop_path,
            "bbox": {"x1": x1, "y1": y1, "x2": x2, "y2": y2},
            "weight": pred.get("weight", 0)
        })
        
        bbox_count += 1
    
    return processed_rgb, crops

if __name__ == "__main__":
    # Test the function
    rgb_frame = cv2.imread("rgb.png")
    depth_frame = cv2.imread("depth.png", cv2.IMREAD_UNCHANGED)
    processed_rgb, crops = process_frame(rgb_frame, depth_frame)
    cv2.imwrite("processed_rgb.png", processed_rgb)