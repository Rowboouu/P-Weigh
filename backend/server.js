const express = require("express");
const { PythonShell } = require("python-shell");
const WebSocket = require("ws");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const app = express();
const port = 5000;

// Serve static files
app.use("/static", express.static(path.join(__dirname, "processed_output")));

// WebSocket server
const wss = new WebSocket.Server({ port: 8080 });

// Kinect detection and process management
let kinectProcess = null;
let kinectRunning = false;

function startKinect() {
  kinectProcess = exec(
    "processing-java --sketch=kinect --run",
    (err, stdout, stderr) => {
      if (err || stderr.includes("No Kinect V1 Detected")) {
        console.error("Kinect Error:", stderr);
        kinectRunning = false;
        kinectProcess = null;
        setTimeout(checkKinect, 5000); // Retry after 5 seconds
      } else {
        console.log("Kinect Started");
        kinectRunning = true;
      }
    }
  );
}

function checkKinect() {
  if (!kinectRunning && !kinectProcess) {
    console.log("Checking for Kinect...");
    startKinect();
  }
}

// Start checking for Kinect immediately
checkKinect();

// Process frames when Kinect is running
wss.on("connection", (ws) => {
  console.log("Client connected");

  const interval = setInterval(() => {
    if (!kinectRunning) {
      ws.send(JSON.stringify({ error: "No Kinect Camera Detected" }));
      return;
    }

    // Check if new frames are available
    if (!fs.existsSync("rgb.png") || !fs.existsSync("depth.png")) {
      return;
    }

    // Run preprocessing pipeline
    PythonShell.run(
      "ml/pig-detect_crop.py",
      {
        args: ["rgb.png", "depth.png"],
      },
      (err, results) => {
        if (err) {
          console.error("Detection Error:", err);
          ws.send(JSON.stringify({ error: "Frame Processing Failed" }));
          return;
        }

        // Run background removal
        PythonShell.run(
          "ml/background-remove.py",
          {
            args: ["output"], // Directory from pig-detect_crop.py
          },
          (err, bgResults) => {
            if (err) {
              console.error("Background Removal Error:", err);
              ws.send(JSON.stringify({ error: "Background Removal Failed" }));
              return;
            }

            try {
              const crops = JSON.parse(bgResults[0]);
              const processedFrame = "/static/processed_rgb.png";
              ws.send(
                JSON.stringify({
                  rgb: processedFrame,
                  predictions: crops.map((crop) => ({
                    x: (crop.bbox.x1 + crop.bbox.x2) / 2,
                    y: (crop.bbox.y1 + crop.bbox.y2) / 2,
                    width: crop.bbox.x2 - crop.bbox.x1,
                    height: crop.bbox.y2 - crop.bbox.y1,
                    weight: crop.weight,
                  })),
                })
              );
            } catch (e) {
              console.error("Parse Error:", e);
              ws.send(JSON.stringify({ error: "Data Parsing Failed" }));
            }
          }
        );
      }
    );
  }, 1000);

  ws.on("close", () => {
    console.log("Client disconnected");
    clearInterval(interval);
  });
});

app.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`);
});
