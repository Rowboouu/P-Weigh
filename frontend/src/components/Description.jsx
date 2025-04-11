import React from "react";

const Description = () => {
  return (
    <div className="p-4 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200">
      <h2 className="text-lg font-semibold mb-2">About the System</h2>
      <p>
        This system uses a Kinect V1 camera to capture RGB and depth videos of
        pigs. A machine learning model analyzes the footage to estimate the
        weight of each pig, displaying bounding boxes and weights in real-time.
        Ensure the Kinect V1 is connected for the system to function.
      </p>
    </div>
  );
};

export default Description;
