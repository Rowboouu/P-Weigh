import cv2
import requests
import os

def estimate_weights(crops, api_url="http://localhost:8000/predict/"):
    """
    Estimate pig weights by sending processed depth images to FastAPI endpoint.
    """
    weighted_crops = []
    
    for crop in crops:
        depth_path = crop["depth_path"]
        bbox = crop["bbox"]
        
        # Read depth image
        depth_image = cv2.imread(depth_path, cv2.IMREAD_UNCHANGED)
        if depth_image is None:
            print(f"Error: Failed to load depth image at {depth_path}")
            weight = 0.0
        else:
            try:
                # Prepare image for FastAPI (grayscale)
                if len(depth_image.shape) > 2:
                    depth_image = cv2.cvtColor(depth_image, cv2.COLOR_RGBA2GRAY)
                _, img_encoded = cv2.imencode('.png', depth_image)
                files = {'file': ('depth.png', img_encoded.tobytes(), 'image/png')}
                
                # Send POST request to FastAPI
                response = requests.post(api_url, files=files)
                
                if response.status_code == 200:
                    result = response.json()
                    weight = result.get("predicted_weight", 0.0)
                else:
                    print(f"FastAPI error: {response.status_code} - {response.text}")
                    weight = 0.0
            except Exception as e:
                print(f"Weight estimation error for {depth_path}: {e}")
                weight = 0.0
        
        weighted_crops.append({
            "rgb_path": crop.get("rgb_path"),
            "depth_path": depth_path,
            "bbox": bbox,
            "weight": weight
        })
    
    return weighted_crops

if __name__ == "__main__":
    crops = [
        {
            "rgb_path": "processed_output/frame_0_rgb_crop_1.png",
            "depth_path": "processed_output/frame_0_depth_crop_1.png",
            "bbox": {"x1": 0, "y1": 0, "x2": 100, "y2": 100}
        }
    ]
    weighted_crops = estimate_weights(crops)
    print(weighted_crops)