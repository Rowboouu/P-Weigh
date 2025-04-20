import kinect4WinSDK.*;

Kinect kinect;
boolean isKinectDetected = false;

void setup() {
  size(1280, 480);
  frameRate(30);
  try {
    kinect = new Kinect(this);
    kinect.GetDepth(); // Test initialization
    isKinectDetected = true;
    println("Kinect V1 Detected");
  } catch (Exception e) {
    isKinectDetected = false;
    println("No Kinect V1 Detected");
  }
}

void draw() {
  if (!isKinectDetected) return;

  background(0);
  PImage depthImage = kinect.GetDepth();
  PImage rgbImage = kinect.GetImage();

  int frameCounter = 0; // Add this variable at the top of your file if not already present

  frameCounter++;
  if (frameCounter % 15 == 0) {
    if (depthImage != null && rgbImage != null) {
      // Save frames for preprocessing
      rgbImage.save("rgb.png");
      depthImage.save("depth.png");
    } else {
      println("Failed to capture images");
    }
  }
}