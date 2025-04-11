import cv2
import numpy as np
from inference_sdk import InferenceHTTPClient
import os

# Placeholder for Roboflow client (update with valid credentials)
CLIENT = InferenceHTTPClient(
    api_url="https://outline.roboflow.com",
    api_key="n7ScRPPA2ZMJoTCdUrBp"
)
MODEL_ID = "data_tonghop/2"

def process_frame(rgb_frame, depth_frame, output_dir="output"):
    os.makedirs(output_dir, exist_ok=True)
    
    # Pig Detection (Roboflow Model)
    predictions = []
    try:
        temp_path = os.path.join(output_dir, "temp_rgb.jpg")
        cv2.imwrite(temp_path, rgb_frame)

        # Roboflow inference (uncomment and update with your API key)
        """
        CLIENT = InferenceHTTPClient(
            api_url="https://outline.roboflow.com",
            api_key="YOUR_VALID_API_KEY"  # <--- Replace with your Roboflow API key
        )
        response = CLIENT.infer(temp_path, model_id=MODEL_ID)
        predictions = response.get("predictions", [])
        """

        # Dummy predictions (no weights, just bounding boxes)
        predictions = [
            {"x": 300, "y": 200, "width": 100, "height": 100},
            {"x": 500, "y": 250, "width": 120, "height": 110}
        ]
        
        os.remove(temp_path)
    except Exception as e:
        print(f"Detection error: {e}")
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
        
        x1 = max(x - width // 2 - padding, 0)
        y1 = max(y - height // 2 - padding, 0)
        x2 = min(x + width // 2 + padding, rgb_frame.shape[1] - 1)
        y2 = min(y + height // 2 + padding, rgb_frame.shape[0] - 1)
        
        cv2.rectangle(processed_rgb, (x1, y1), (x2, y2), (0, 255, 0), 2)
        
        cropped_rgb = rgb_frame[y1:y2, x1:x2]
        cropped_depth = depth_frame[y1:y2, x1:x2]
        
        rgb_crop_path = os.path.join(output_dir, f"frame_{frame_count}_rgb_crop_{bbox_count}.png")
        depth_crop_path = os.path.join(output_dir, f"frame_{frame_count}_depth_crop_{bbox_count}.png")
        cv2.imwrite(rgb_crop_path, cropped_rgb)
        cv2.imwrite(depth_crop_path, cropped_depth)
        
        crops.append({
            "rgb_path": rgb_crop_path,
            "depth_path": depth_crop_path,
            "bbox": {"x1": x1, "y1": y1, "x2": x2, "y2": y2}
        })
        
        bbox_count += 1
    
    return processed_rgb, crops

if __name__ == "__main__":
    rgb_frame = cv2.imread("rgb.png")
    depth_frame = cv2.imread("depth.png", cv2.IMREAD_UNCHANGED)
    processed_rgb, crops = process_frame(rgb_frame, depth_frame)
    cv2.imwrite("processed_rgb.png", processed_rgb)