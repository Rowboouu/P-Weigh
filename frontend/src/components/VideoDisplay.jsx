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
    <div className="relative w-full">
      <div className="border-b border-red-500 flex items-center gap-2 mb-4 py-2 text-2xl font-semibold text-[#31333F] dark:text-gray-200">
        <div className="w-[16px] h-[16px] bg-red-500 rounded-xl"></div>
        <div>Live Preview</div>
      </div>
      {error ? (
        <div className="text-center text-red-500 text-xl p-4">{error}</div>
      ) : rgbSrc ? (
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
      ) : (
        <div className="text-center text-gray-500 text-xl p-4">
          Waiting for video feed...
        </div>
      )}
    </div>
  );
};

export default VideoDisplay;
