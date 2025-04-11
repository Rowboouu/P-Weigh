# Pig Weight Estimator

A full-stack application to estimate pig weights using a Kinect V1 camera and machine learning.

## Workflow
1. **Kinect Capture**: Captures RGB and depth frames.
2. **Pig Detection**: Uses a Roboflow model (`data_tonghop/2`) to detect pigs.
3. **Background Removal**: Uses Segment Anything Model (SAM) to remove backgrounds.
4. **Weight Estimation**: Feeds processed images to a custom ML model for weight prediction.

## Setup

### Backend
1. Install Processing (https://processing.org/download) and add `processing-java` to PATH or update `server.js`.
2. Install `kinect4WinSDK` in Processing IDE.
3. Install Kinect V1 drivers (e.g., Microsoft Kinect SDK 1.8).
4. Place `sam_vit_h_4b8939.pth` in `backend/`.
5. Place your weight model (e.g., `your_weight_model.pt`) in `backend/ml/` and update `weight-estimate.py`.
6. Run:
   ```bash
   cd backend
   npm install
   pip install -r requirements.txt
   npm start