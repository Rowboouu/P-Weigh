import React from "react";

const Description = () => {
  return (
    <div className="bg-white dark:bg-gray-800 text-[#31333F] dark:text-gray-200">
      <h2 className="text-[40px] font-semibold mb-4">
        🐷Pig Weight Estimation System
      </h2>
      <p className="text-[#403E3E] dark:text-gray-200">
        Easily estimate the weight of pigs using advanced 3D imaging and AI.
        This tool analyzes depth and RGB images captured by the Kinect sensor to
        provide accurate weight predictions—no manual weighing required.
      </p>
    </div>
  );
};

export default Description;
