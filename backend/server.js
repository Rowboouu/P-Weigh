const express = require('express');
const { PythonShell } = require('python-shell');
const WebSocket = require('ws');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 5000;

app.use('/static', express.static(path.join(__dirname, 'processed_output')));

const wss = new WebSocket.Server({ port: 8080 });

let kinectProcess = null;
let kinectRunning = false;

function startKinect() {
  const sketchPath = path.resolve(__dirname, 'kinect').replace(/\\/g, '/');
  const command = `processing-java --sketch="${sketchPath}" --run`;
  console.log(`Running command: ${command}`);
  kinectProcess = exec(command, (err) => {
    if (err) {
      console.error('Kinect Process Error:', err.message);
      kinectRunning = false;
      kinectProcess = null;
      setTimeout(checkKinect, 5000);
      return;
    }
  });

  kinectProcess.stdout.on('data', (data) => {
    console.log('Kinect Output:', data);
    if (data.includes('Kinect V1 Detected')) {
      kinectRunning = true;
    }
  });

  kinectProcess.stderr.on('data', (data) => {
    console.error('Kinect Stderr:', data);
    if (data.includes('No Kinect V1 Detected')) {
      kinectRunning = false;
      kinectProcess = null;
      setTimeout(checkKinect, 5000);
    }
  });

  kinectProcess.on('exit', (code) => {
    console.log(`Kinect process exited with code ${code}`);
    kinectRunning = false;
    kinectProcess = null;
    setTimeout(checkKinect, 5000);
  });
}

function checkKinect() {
  if (!kinectRunning && !kinectProcess) {
    console.log('Checking for Kinect...');
    startKinect();
  }
}

checkKinect();

wss.on('connection', (ws) => {
  console.log('Client connected');

  const interval = setInterval(() => {
    if (!kinectRunning) {
      ws.send(JSON.stringify({ error: 'No Kinect Camera Detected' }));
      return;
    }

    if (!fs.existsSync('rgb.png') || !fs.existsSync('depth.png')) {
      return;
    }

    PythonShell.run('ml/pig-detect_crop.py', {
      args: ['rgb.png', 'depth.png']
    }, (err) => {
      if (err) {
        console.error('Detection Error:', err);
        ws.send(JSON.stringify({ error: 'Frame Processing Failed' }));
        return;
      }

      PythonShell.run('ml/background-remove.py', {
        args: ['output']
      }, (err, bgResults) => {
        if (err) {
          console.error('Background Removal Error:', err);
          ws.send(JSON.stringify({ error: 'Background Removal Failed' }));
          return;
        }

        PythonShell.run('ml/weight-estimate.py', {
          args: ['processed_output']
        }, (err, weightResults) => {
          if (err) {
            console.error('Weight Estimation Error:', err);
            ws.send(JSON.stringify({ error: 'Weight Estimation Failed' }));
            return;
          }

          try {
            const crops = JSON.parse(weightResults[0]);
            const processedFrame = '/static/processed_rgb.png';
            ws.send(JSON.stringify({
              rgb: processedFrame,
              predictions: crops.map(crop => ({
                x: (crop.bbox.x1 + crop.bbox.x2) / 2,
                y: (crop.bbox.y1 + crop.bbox.y2) / 2,
                width: crop.bbox.x2 - crop.bbox.x1,
                height: crop.bbox.y2 - crop.bbox.y1,
                weight: crop.weight
              }))
            }));
          } catch (e) {
            console.error('Parse Error:', e);
            ws.send(JSON.stringify({ error: 'Data Parsing Failed' }));
          }
        });
      });
    });
  }, 1000);

  ws.on('close', () => {
    console.log('Client disconnected');
    clearInterval(interval);
  });
});

app.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`);
});