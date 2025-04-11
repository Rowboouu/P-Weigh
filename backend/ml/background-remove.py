import cv2
import numpy as np
from segment_anything import SamPredictor, sam_model_registry
import torch
import os

def remove_background(rgb_image, checkpoint="sam_vit_h_4b8939.pth"):
    """
    Remove background from an RGB image using SAM.
    Returns RGBA image and binary mask.
    """
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    sam = sam_model_registry["vit_h"](checkpoint=checkpoint).to(device)
    predictor = SamPredictor(sam)
    
    # Convert to RGB
    image_rgb = cv2.cvtColor(rgb_image, cv2.COLOR_BGR2RGB)
    predictor.set_image(image_rgb)
    
    # Center point prompt
    height, width = image_rgb.shape[:2]
    center_point = np.array([[width // 2, height // 2]], dtype=np.float32)
    point_label = np.array([1], dtype=np.int64)
    
    # Predict mask
    with torch.no_grad():
        masks, scores, _ = predictor.predict(
            point_coords=center_point,
            point_labels=point_label,
            multimask_output=False,
            return_logits=False
        )
    
    # Select best mask
    mask_binary = masks[np.argmax(scores)]
    if isinstance(mask_binary, torch.Tensor):
        mask_binary = mask_binary.cpu().numpy()
    mask_binary = (mask_binary * 255).astype(np.uint8)
    
    # Create RGBA image
    result = cv2.cvtColor(rgb_image, cv2.COLOR_BGR2BGRA)
    result[:, :, 3] = mask_binary
    
    return result, mask_binary

def apply_mask_to_depth(depth_image, mask):
    """
    Apply mask to depth image, returning RGBA result.
    """
    if mask.dtype != np.uint8:
        mask = mask.astype(np.uint8)
    if len(depth_image.shape) == 3:
        if mask.shape != depth_image.shape[:2]:
            mask = cv2.resize(mask, (depth_image.shape[1], depth_image.shape[0]), interpolation=cv2.INTER_NEAREST)
        result = depth_image.copy()
        for channel in range(result.shape[2]):
            result[:, :, channel] = cv2.bitwise_and(result[:, :, channel], result[:, :, channel], mask=mask)
        result_bgra = cv2.cvtColor(result, cv2.COLOR_BGR2BGRA)
        result_bgra[:, :, 3] = mask
    else:
        if mask.shape != depth_image.shape:
            mask = cv2.resize(mask, (depth_image.shape[1], depth_image.shape[0]), interpolation=cv2.INTER_NEAREST)
        result = cv2.bitwise_and(depth_image, depth_image, mask=mask)
        result_bgra = cv2.cvtColor(result, cv2.COLOR_GRAY2BGRA)
        result_bgra[:, :, 3] = mask
    return result_bgra

def process_crops(crops, output_dir="processed_output"):
    """
    Process cropped RGB and depth images to remove background.
    Returns updated crops with processed paths.
    """
    os.makedirs(output_dir, exist_ok=True)
    processed_crops = []
    
    for crop in crops:
        rgb_path = crop["rgb_path"]
        depth_path = crop["depth_path"]
        
        rgb_image = cv2.imread(rgb_path)
        depth_image = cv2.imread(depth_path, cv2.IMREAD_UNCHANGED)
        
        # Remove background
        rgb_no_bg, mask_binary = remove_background(rgb_image)
        depth_no_bg = apply_mask_to_depth(depth_image, mask_binary)
        
        # Save processed images
        processed_rgb_path = os.path.join(output_dir, os.path.basename(rgb_path))
        processed_depth_path = os.path.join(output_dir, os.path.basename(depth_path))
        cv2.imwrite(processed_rgb_path, rgb_no_bg)
        cv2.imwrite(processed_depth_path, depth_no_bg)
        
        processed_crops.append({
            "rgb_path": processed_rgb_path,
            "depth_path": processed_depth_path,
            "bbox": crop["bbox"],
            "weight": crop["weight"]
        })
    
    return processed_crops

if __name__ == "__main__":
    # Test the function
    crops = [
        {
            "rgb_path": "output/frame_0_rgb_crop_1.png",
            "depth_path": "output/frame_0_depth_crop_1.png",
            "bbox": {"x1": 0, "y1": 0, "x2": 100, "y2": 100},
            "weight": 45.2
        }
    ]
    processed_crops = process_crops(crops)
    print(processed_crops)