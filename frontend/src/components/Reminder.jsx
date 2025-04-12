import React from "react";

const Reminder = () => {
  return (
    <div className="bg-[#1C83FF]/10 text-[#31333F] dark:text-gray-200 p-4 rounded-md w-full">
      <div className="flex flex-row items-center gap-2">
        <span className="flex border border-[#0054A3] dark:border-blue-400 rounded-xl w-[20px] h-[20px] text-xs text-[#0054A3] dark:text-blue-400 items-center justify-center">
          i
        </span>
        <span className="text-[#0054A3] dark:text-blue-400">
          Make sure your Kinect Camera V1 is connected properly. Ensure the
          background is well-lit for more accurate results.
        </span>
      </div>
    </div>
  );
};

export default Reminder;
