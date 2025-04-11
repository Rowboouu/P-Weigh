import React, { useState, useEffect } from "react";

const VideoDisplay = ({ predictions }) => {
  const [rgbSrc, setRgbSrc] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080");

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.error) {
        setError(data.error);
        setRgbSrc("");
      } else {
        setRgbSrc(data.rgb);
        setError("");
      }
    };

    ws.onclose = () => {
      setError("Connection to server lost");
    };

    return () => ws.close();
  }, []);

  return (
    <div className="relative">
      {error ? (
        <div className="text-center text-red-500 text-xl p-4">{error}</div>
      ) : (
        <div className="relative">
          <img
            src={rgbSrc}
            alt="RGB Video"
            className="w-full max-w-2xl"
            onError={() => setError("Failed to load video")}
          />
          {predictions.map((pred, index) => (
            <div
              key={index}
              className="absolute border-2 border-green-500"
              style={{
                left: pred.x - pred.width / 2,
                top: pred.y - pred.height / 2,
                width: pred.width,
                height: pred.height,
              }}
            >
              <span className="absolute -top-6 text-white bg-black bg-opacity-50 px-1">
                {pred.weight} kg
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VideoDisplay;
