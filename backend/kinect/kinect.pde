import kinect4WinSDK.*;
import com.hamoid.*;

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
    exit(); // Exit sketch if Kinect fails
  }
}

void draw() {
  if (!isKinectDetected) return;

  background(0);
  PImage depthImage = kinect.GetDepth();
  PImage rgbImage = kinect.GetImage();

  if (depthImage != null && rgbImage != null) {
    depthImage = createHeatmap(depthImage); // Convert depth image to heatmap
    // Save frames for preprocessing
    image(depthImage, 0, 0); // Draw heatmap depth image on the left
    image(rgbImage, depthImage.width, 0); // Draw RGB image on the right
    rgbImage.save("../rgb.png");
    depthImage.save("../depth.png");
  } else {
    println("Failed to capture images");
  }
}

PImage createHeatmap(PImage depthImage) {
  depthImage.loadPixels();
  PImage heatmap = createImage(depthImage.width, depthImage.height, RGB);
  heatmap.loadPixels();

  for (int i = 0; i < depthImage.pixels.length; i++) {
    float depthValue = red(depthImage.pixels[i]); // Extract depth intensity from red channel
    float normalizedValue = map(depthValue, 0, 255, 0, 1); // Normalize between 0 and 1
    heatmap.pixels[i] = getHeatmapColor(normalizedValue); // Map to heatmap color
  }

  heatmap.updatePixels();
  return heatmap;
}

int getHeatmapColor(float value) {
  float r = constrain(lerp(0, 255, value * 2 - 1), 0, 255);
  float g = constrain(lerp(255, 0, abs(value * 2 - 1)), 0, 255);
  float b = constrain(lerp(255, 0, value * 2), 0, 255);
  return color(r, g, b);
}